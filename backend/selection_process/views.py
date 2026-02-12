from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, CharFilter, NumberFilter
from drf_spectacular.utils import extend_schema, extend_schema_view

from candidates.models import CandidateProfile
from .models import (
    SelectionProcess,
    ProcessStage,
    StageQuestion,
    CandidateInProcess,
    CandidateStageResponse,
    ProcessTemplate,
    TemplateStage,
    TemplateStageQuestion
)
from .serializers import (
    SelectionProcessSerializer,
    SelectionProcessListSerializer,
    SelectionProcessCreateSerializer,
    ProcessStageSerializer,
    ProcessStageListSerializer,
    ProcessStageCreateSerializer,
    StageQuestionSerializer,
    StageQuestionCreateSerializer,
    CandidateInProcessSerializer,
    CandidateInProcessListSerializer,
    CandidateInProcessCreateSerializer,
    CandidateStageResponseSerializer,
    StageEvaluationSerializer,
    AddCandidateSerializer,
    ProcessStatisticsSerializer,
    ReorderStagesSerializer,
    ProcessTemplateSerializer,
    ProcessTemplateListSerializer,
    ProcessTemplateCreateSerializer,
    TemplateStageSerializer,
    TemplateStageQuestionSerializer,
    ApplyTemplateSerializer,
    SaveAsTemplateSerializer
)
from .services.process_services import (
    add_candidate_to_process,
    evaluate_candidate_stage,
    advance_candidate_manually,
    get_process_statistics,
    reorder_stages,
    withdraw_candidate
)


# ============================================
# FILTERS
# ============================================

class SelectionProcessFilter(FilterSet):
    status = CharFilter(field_name='status')
    job = NumberFilter(field_name='job')

    class Meta:
        model = SelectionProcess
        fields = ['status', 'job', 'company']


class ProcessStageFilter(FilterSet):
    process = NumberFilter(field_name='process')

    class Meta:
        model = ProcessStage
        fields = ['process']


class StageQuestionFilter(FilterSet):
    stage = NumberFilter(field_name='stage')

    class Meta:
        model = StageQuestion
        fields = ['stage']


class CandidateInProcessFilter(FilterSet):
    process = NumberFilter(field_name='process')
    status = CharFilter(field_name='status')
    current_stage = NumberFilter(field_name='current_stage')
    candidate_profile = NumberFilter(field_name='candidate_profile')

    class Meta:
        model = CandidateInProcess
        fields = ['process', 'status', 'current_stage', 'candidate_profile']


# ============================================
# VIEWSETS
# ============================================

@extend_schema_view(
    list=extend_schema(tags=['Processos Seletivos'], summary='Listar processos seletivos'),
    create=extend_schema(tags=['Processos Seletivos'], summary='Criar processo seletivo'),
    retrieve=extend_schema(tags=['Processos Seletivos'], summary='Detalhes do processo'),
    update=extend_schema(tags=['Processos Seletivos'], summary='Atualizar processo'),
    partial_update=extend_schema(tags=['Processos Seletivos'], summary='Atualizar processo parcialmente'),
    destroy=extend_schema(tags=['Processos Seletivos'], summary='Excluir processo'),
)
class SelectionProcessViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar Processos Seletivos.

    Apenas recrutadores e admins podem criar/gerenciar processos.
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = SelectionProcessFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filtra por empresa do usuário ou processos criados por ele"""
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return SelectionProcess.objects.filter(is_active=True)

        if user.user_type == 'recruiter':
            from django.db.models import Q
            # Recrutador vê processos da sua empresa OU que ele criou
            filters = Q(created_by=user)
            if user.company:
                filters |= Q(company=user.company)
            return SelectionProcess.objects.filter(filters, is_active=True)

        return SelectionProcess.objects.none()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return SelectionProcessCreateSerializer
        elif self.action == 'list':
            return SelectionProcessListSerializer
        return SelectionProcessSerializer

    def perform_create(self, serializer):
        """Define empresa e criador automaticamente"""
        user = self.request.user
        serializer.save(
            company=user.company,  # Pode ser None se usuário não tiver empresa
            created_by=user
        )

    @extend_schema(
        tags=['Processos Seletivos'],
        summary='Adicionar candidato ao processo',
        request=AddCandidateSerializer,
        responses={201: CandidateInProcessSerializer}
    )
    @action(detail=True, methods=['post'], url_path='add-candidate')
    def add_candidate(self, request, pk=None):
        """Adiciona um candidato aprovado ao processo seletivo"""
        process = self.get_object()
        serializer = AddCandidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Buscar o candidato
        try:
            candidate_profile = CandidateProfile.objects.get(
                id=serializer.validated_data['candidate_profile_id']
            )
        except CandidateProfile.DoesNotExist:
            return Response(
                {'error': 'Perfil de candidato não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Adicionar ao processo
        candidate_in_process = add_candidate_to_process(
            process=process,
            candidate_profile=candidate_profile,
            added_by=request.user,
            recruiter_notes=serializer.validated_data.get('recruiter_notes', '')
        )

        return Response(
            CandidateInProcessSerializer(candidate_in_process).data,
            status=status.HTTP_201_CREATED
        )

    @extend_schema(
        tags=['Processos Seletivos'],
        summary='Estatísticas do processo',
        responses={200: ProcessStatisticsSerializer}
    )
    @action(detail=True, methods=['get'], url_path='statistics')
    def statistics(self, request, pk=None):
        """Retorna estatísticas do processo seletivo"""
        process = self.get_object()
        stats = get_process_statistics(process)
        return Response(stats)

    @extend_schema(
        tags=['Processos Seletivos'],
        summary='Salvar processo como modelo reutilizável',
        request=SaveAsTemplateSerializer,
        responses={201: ProcessTemplateSerializer}
    )
    @action(detail=True, methods=['post'], url_path='save-as-template')
    def save_as_template(self, request, pk=None):
        """Salva o processo atual como modelo reutilizável (copia etapas e perguntas)"""
        process = self.get_object()
        serializer = SaveAsTemplateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user

        # Criar o template
        template = ProcessTemplate.objects.create(
            name=serializer.validated_data['name'],
            description=serializer.validated_data.get('description', ''),
            company=user.company,
            created_by=user
        )

        # Copiar etapas e perguntas
        stages = process.stages.filter(is_active=True).order_by('order')
        for stage in stages:
            template_stage = TemplateStage.objects.create(
                template=template,
                name=stage.name,
                description=stage.description,
                order=stage.order,
                is_eliminatory=stage.is_eliminatory
            )
            questions = stage.questions.filter(is_active=True).order_by('order')
            for question in questions:
                TemplateStageQuestion.objects.create(
                    template_stage=template_stage,
                    question_text=question.question_text,
                    question_type=question.question_type,
                    options=question.options,
                    order=question.order,
                    is_required=question.is_required
                )

        return Response(
            ProcessTemplateSerializer(template).data,
            status=status.HTTP_201_CREATED
        )

    @extend_schema(
        tags=['Processos Seletivos'],
        summary='Candidatos aprovados disponíveis',
        description='Lista candidatos com perfil aprovado que podem ser adicionados ao processo'
    )
    @action(detail=True, methods=['get'], url_path='available-candidates')
    def available_candidates(self, request, pk=None):
        """Lista candidatos aprovados que não estão no processo"""
        process = self.get_object()

        # IDs dos candidatos já no processo
        existing_ids = CandidateInProcess.objects.filter(
            process=process,
            is_active=True
        ).values_list('candidate_profile_id', flat=True)

        # Candidatos aprovados não no processo e não admitidos
        candidates = CandidateProfile.objects.filter(
            profile_status='approved',
            is_active=True
        ).exclude(id__in=existing_ids).exclude(
            admission_data__status__in=['completed', 'sent', 'confirmed']
        )

        # Busca opcional
        search = request.query_params.get('search', '')
        if search:
            candidates = candidates.filter(
                user__name__icontains=search
            ) | candidates.filter(
                user__email__icontains=search
            )

        # Filtro por vaga
        applied_to_job = request.query_params.get('applied_to_job', '')
        if applied_to_job:
            candidates = candidates.filter(
                user__applications__job_id=int(applied_to_job)
            ).distinct()

        # Serializar com dados ampliados
        data = [{
            'id': c.id,
            'name': c.user.name,
            'email': c.user.email,
            'current_position': c.current_position,
            'image_profile': request.build_absolute_uri(c.image_profile.url) if c.image_profile else None,
            'city': c.city,
            'state': c.state,
            'experience_years': c.experience_years,
            'applications_summary': [
                {
                    'job_id': app.job.id,
                    'job_title': app.job.title,
                    'status': app.status,
                }
                for app in c.user.applications.select_related('job').order_by('-applied_at')[:5]
            ]
        } for c in candidates[:50]]  # Limitar a 50

        return Response(data)


@extend_schema_view(
    list=extend_schema(tags=['Etapas do Processo'], summary='Listar etapas'),
    create=extend_schema(tags=['Etapas do Processo'], summary='Criar etapa'),
    retrieve=extend_schema(tags=['Etapas do Processo'], summary='Detalhes da etapa'),
    update=extend_schema(tags=['Etapas do Processo'], summary='Atualizar etapa'),
    partial_update=extend_schema(tags=['Etapas do Processo'], summary='Atualizar etapa parcialmente'),
    destroy=extend_schema(tags=['Etapas do Processo'], summary='Excluir etapa'),
)
class ProcessStageViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar Etapas do Processo"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = ProcessStageFilter
    ordering_fields = ['order', 'created_at']
    ordering = ['order']

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return ProcessStage.objects.filter(is_active=True)

        if user.user_type == 'recruiter' and user.company:
            return ProcessStage.objects.filter(
                process__company=user.company,
                is_active=True
            )

        return ProcessStage.objects.none()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProcessStageCreateSerializer
        elif self.action == 'list':
            return ProcessStageListSerializer
        return ProcessStageSerializer

    @extend_schema(
        tags=['Etapas do Processo'],
        summary='Reordenar etapas',
        request=ReorderStagesSerializer
    )
    @action(detail=False, methods=['post'], url_path='reorder')
    def reorder(self, request):
        """Reordena as etapas de um processo"""
        serializer = ReorderStagesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        stage_ids = serializer.validated_data['stage_ids']

        # Pegar o processo da primeira etapa
        first_stage = ProcessStage.objects.filter(id=stage_ids[0]).first()
        if not first_stage:
            return Response(
                {'error': 'Etapa não encontrada.'},
                status=status.HTTP_404_NOT_FOUND
            )

        reorder_stages(first_stage.process, stage_ids, request.user)

        return Response({'message': 'Etapas reordenadas com sucesso.'})


@extend_schema_view(
    list=extend_schema(tags=['Perguntas da Etapa'], summary='Listar perguntas'),
    create=extend_schema(tags=['Perguntas da Etapa'], summary='Criar pergunta'),
    retrieve=extend_schema(tags=['Perguntas da Etapa'], summary='Detalhes da pergunta'),
    update=extend_schema(tags=['Perguntas da Etapa'], summary='Atualizar pergunta'),
    partial_update=extend_schema(tags=['Perguntas da Etapa'], summary='Atualizar pergunta parcialmente'),
    destroy=extend_schema(tags=['Perguntas da Etapa'], summary='Excluir pergunta'),
)
class StageQuestionViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar Perguntas da Etapa"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = StageQuestionFilter
    ordering_fields = ['order', 'created_at']
    ordering = ['order']

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return StageQuestion.objects.filter(is_active=True)

        if user.user_type == 'recruiter' and user.company:
            return StageQuestion.objects.filter(
                stage__process__company=user.company,
                is_active=True
            )

        return StageQuestion.objects.none()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return StageQuestionCreateSerializer
        return StageQuestionSerializer


@extend_schema_view(
    list=extend_schema(tags=['Candidatos no Processo'], summary='Listar candidatos no processo'),
    create=extend_schema(tags=['Candidatos no Processo'], summary='Adicionar candidato'),
    retrieve=extend_schema(tags=['Candidatos no Processo'], summary='Detalhes do candidato'),
    update=extend_schema(tags=['Candidatos no Processo'], summary='Atualizar candidato'),
    partial_update=extend_schema(tags=['Candidatos no Processo'], summary='Atualizar candidato parcialmente'),
    destroy=extend_schema(tags=['Candidatos no Processo'], summary='Remover candidato'),
)
class CandidateInProcessViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar Candidatos no Processo"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CandidateInProcessFilter
    search_fields = ['candidate_profile__user__name', 'candidate_profile__user__email']
    ordering_fields = ['added_at', 'status']
    ordering = ['-added_at']

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return CandidateInProcess.objects.filter(is_active=True)

        if user.user_type == 'recruiter' and user.company:
            return CandidateInProcess.objects.filter(
                process__company=user.company,
                is_active=True
            )

        if user.user_type == 'candidate':
            return CandidateInProcess.objects.filter(
                candidate_profile__user=user,
                is_active=True
            )

        return CandidateInProcess.objects.none()

    def get_serializer_class(self):
        if self.action in ['create']:
            return CandidateInProcessCreateSerializer
        elif self.action in ['list', 'my_processes']:
            return CandidateInProcessListSerializer
        return CandidateInProcessSerializer

    def perform_create(self, serializer):
        """Define quem adicionou"""
        serializer.save(added_by=self.request.user)

    @extend_schema(
        tags=['Candidatos no Processo'],
        summary='Avaliar candidato na etapa atual',
        request=StageEvaluationSerializer,
        responses={200: CandidateStageResponseSerializer}
    )
    @action(detail=True, methods=['post'], url_path='evaluate')
    def evaluate(self, request, pk=None):
        """Avalia o candidato na etapa atual"""
        candidate_in_process = self.get_object()

        if not candidate_in_process.current_stage:
            return Response(
                {'error': 'Candidato não está em nenhuma etapa.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = StageEvaluationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        stage_response = evaluate_candidate_stage(
            candidate_in_process=candidate_in_process,
            stage=candidate_in_process.current_stage,
            evaluation=serializer.validated_data['evaluation'],
            answers=serializer.validated_data.get('answers'),
            recruiter_feedback=serializer.validated_data.get('recruiter_feedback', ''),
            rating=serializer.validated_data.get('rating'),
            evaluated_by=request.user
        )

        # Recarregar para pegar status atualizado
        candidate_in_process.refresh_from_db()

        return Response({
            'stage_response': CandidateStageResponseSerializer(stage_response).data,
            'candidate_status': candidate_in_process.status,
            'current_stage': candidate_in_process.current_stage.id if candidate_in_process.current_stage else None,
            'current_stage_name': candidate_in_process.current_stage.name if candidate_in_process.current_stage else None
        })

    @extend_schema(
        tags=['Candidatos no Processo'],
        summary='Avançar candidato manualmente',
        responses={200: CandidateInProcessSerializer}
    )
    @action(detail=True, methods=['post'], url_path='advance')
    def advance(self, request, pk=None):
        """Avança o candidato para a próxima etapa manualmente"""
        candidate_in_process = self.get_object()

        updated = advance_candidate_manually(
            candidate_in_process=candidate_in_process,
            advanced_by=request.user
        )

        return Response(CandidateInProcessSerializer(updated).data)

    @extend_schema(
        tags=['Candidatos no Processo'],
        summary='Marcar candidato como desistente',
        responses={200: CandidateInProcessSerializer}
    )
    @action(detail=True, methods=['post'], url_path='withdraw')
    def withdraw(self, request, pk=None):
        """Marca o candidato como desistente"""
        candidate_in_process = self.get_object()

        updated = withdraw_candidate(
            candidate_in_process=candidate_in_process,
            withdrawn_by=request.user
        )

        return Response(CandidateInProcessSerializer(updated).data)

    @extend_schema(
        tags=['Candidatos no Processo'],
        summary='Listar meus processos seletivos (candidato)',
        responses={200: CandidateInProcessListSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='my-processes')
    def my_processes(self, request):
        """Retorna processos seletivos do candidato autenticado."""
        user = request.user

        if user.user_type != 'candidate':
            return Response(
                {'error': 'Apenas candidatos podem acessar este endpoint.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            candidate_profile = CandidateProfile.objects.get(user=user)
        except CandidateProfile.DoesNotExist:
            return Response([], status=status.HTTP_200_OK)

        queryset = CandidateInProcess.objects.filter(
            candidate_profile=candidate_profile,
            is_active=True
        ).select_related(
            'process', 'current_stage', 'candidate_profile__user'
        ).order_by('-added_at')

        serializer = CandidateInProcessListSerializer(queryset, many=True)
        return Response(serializer.data)


@extend_schema_view(
    list=extend_schema(tags=['Respostas das Etapas'], summary='Listar respostas'),
    retrieve=extend_schema(tags=['Respostas das Etapas'], summary='Detalhes da resposta'),
    update=extend_schema(tags=['Respostas das Etapas'], summary='Atualizar resposta'),
    partial_update=extend_schema(tags=['Respostas das Etapas'], summary='Atualizar resposta parcialmente'),
)
class CandidateStageResponseViewSet(viewsets.ModelViewSet):
    """ViewSet para visualizar/editar Respostas das Etapas"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CandidateStageResponseSerializer
    http_method_names = ['get', 'patch', 'head', 'options']  # Não permite create/delete direto

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return CandidateStageResponse.objects.filter(is_active=True)

        if user.user_type == 'recruiter' and user.company:
            return CandidateStageResponse.objects.filter(
                candidate_in_process__process__company=user.company,
                is_active=True
            )

        return CandidateStageResponse.objects.none()


# ============================================
# PROCESS TEMPLATE VIEWSET
# ============================================

@extend_schema_view(
    list=extend_schema(tags=['Modelos de Processo'], summary='Listar modelos'),
    create=extend_schema(tags=['Modelos de Processo'], summary='Criar modelo'),
    retrieve=extend_schema(tags=['Modelos de Processo'], summary='Detalhes do modelo'),
    update=extend_schema(tags=['Modelos de Processo'], summary='Atualizar modelo'),
    partial_update=extend_schema(tags=['Modelos de Processo'], summary='Atualizar modelo parcialmente'),
    destroy=extend_schema(tags=['Modelos de Processo'], summary='Excluir modelo'),
)
class ProcessTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar Modelos de Processos Seletivos"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return ProcessTemplate.objects.filter(is_active=True)

        if user.user_type == 'recruiter':
            from django.db.models import Q
            filters = Q(created_by=user)
            if user.company:
                filters |= Q(company=user.company)
            return ProcessTemplate.objects.filter(filters, is_active=True)

        return ProcessTemplate.objects.none()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProcessTemplateCreateSerializer
        elif self.action == 'list':
            return ProcessTemplateListSerializer
        return ProcessTemplateSerializer

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(
            company=user.company,
            created_by=user
        )

    @extend_schema(
        tags=['Modelos de Processo'],
        summary='Criar processo seletivo a partir do modelo',
        request=ApplyTemplateSerializer,
        responses={201: SelectionProcessSerializer}
    )
    @action(detail=True, methods=['post'], url_path='apply')
    def apply(self, request, pk=None):
        """Cria um novo processo seletivo baseado neste modelo (clona etapas e perguntas)"""
        template = self.get_object()
        serializer = ApplyTemplateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        data = serializer.validated_data

        # Resolver FK de job se fornecido
        job = None
        if data.get('job'):
            from jobs.models import Job
            try:
                job = Job.objects.get(id=data['job'])
            except Job.DoesNotExist:
                return Response(
                    {'error': 'Vaga não encontrada.'},
                    status=status.HTTP_404_NOT_FOUND
                )

        # Criar o processo
        process = SelectionProcess.objects.create(
            title=data['title'],
            description=data.get('description', ''),
            job=job,
            company=user.company,
            created_by=user,
            status=data.get('status', 'draft'),
            start_date=data.get('start_date'),
            end_date=data.get('end_date')
        )

        # Clonar etapas e perguntas do template
        template_stages = template.stages.filter(is_active=True).order_by('order')
        for ts in template_stages:
            stage = ProcessStage.objects.create(
                process=process,
                name=ts.name,
                description=ts.description,
                order=ts.order,
                is_eliminatory=ts.is_eliminatory
            )
            template_questions = ts.questions.filter(is_active=True).order_by('order')
            for tq in template_questions:
                StageQuestion.objects.create(
                    stage=stage,
                    question_text=tq.question_text,
                    question_type=tq.question_type,
                    options=tq.options,
                    order=tq.order,
                    is_required=tq.is_required
                )

        return Response(
            SelectionProcessSerializer(process).data,
            status=status.HTTP_201_CREATED
        )
