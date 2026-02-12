from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, NumberFilter, CharFilter
from django.utils import timezone
from django.db.models import Prefetch

from candidates.models import CandidateProfile
from .models import DocumentType, CandidateDocument, AdmissionData
from .serializers import (
    DocumentTypeSerializer,
    DocumentTypeListSerializer,
    DocumentTypeCreateSerializer,
    CandidateDocumentSerializer,
    CandidateDocumentListSerializer,
    CandidateDocumentUploadSerializer,
    DocumentReviewSerializer,
    AdmissionDataSerializer,
    AdmissionDataCreateUpdateSerializer,
)


# ============================================
# FILTERS
# ============================================

class CandidateDocumentFilter(FilterSet):
    candidate = NumberFilter(field_name='candidate')
    document_type = NumberFilter(field_name='document_type')
    status = CharFilter(field_name='status')

    class Meta:
        model = CandidateDocument
        fields = ['candidate', 'document_type', 'status']


# ============================================
# VIEWSETS
# ============================================

class DocumentTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de tipos de documento.
    - Recrutador/staff: CRUD completo
    - Candidato: somente leitura
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['order', 'name', 'created_at']
    ordering = ['order', 'name']

    def get_queryset(self):
        return DocumentType.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action == 'list':
            return DocumentTypeListSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return DocumentTypeCreateSerializer
        return DocumentTypeSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_destroy(self, instance):
        """Soft delete."""
        instance.is_active = False
        instance.save(update_fields=['is_active', 'updated_at'])

    def create(self, request, *args, **kwargs):
        user = request.user
        if user.user_type not in ('recruiter',) and not user.is_staff:
            return Response(
                {'detail': 'Apenas recrutadores podem criar tipos de documento.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        user = request.user
        if user.user_type not in ('recruiter',) and not user.is_staff:
            return Response(
                {'detail': 'Apenas recrutadores podem editar tipos de documento.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        user = request.user
        if user.user_type not in ('recruiter',) and not user.is_staff:
            return Response(
                {'detail': 'Apenas recrutadores podem excluir tipos de documento.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


class CandidateDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet para documentos do candidato.
    - Candidato: upload, reenvio, visualização dos seus documentos
    - Recrutador/staff: visualização de todos, revisão (aprovar/rejeitar)
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CandidateDocumentFilter
    search_fields = ['original_filename', 'document_type__name']
    ordering_fields = ['created_at', 'status', 'document_type__order']
    ordering = ['document_type__order']
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        user = self.request.user
        qs = CandidateDocument.objects.filter(is_active=True).select_related(
            'candidate__user', 'document_type', 'reviewed_by'
        )

        # Candidato vê apenas seus documentos
        if user.user_type == 'candidate' and not user.is_staff:
            try:
                profile = user.candidate_profile
                qs = qs.filter(candidate=profile)
            except CandidateProfile.DoesNotExist:
                return CandidateDocument.objects.none()

        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return CandidateDocumentListSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return CandidateDocumentUploadSerializer
        if self.action == 'review':
            return DocumentReviewSerializer
        return CandidateDocumentSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        user = self.request.user
        if user.user_type == 'candidate':
            try:
                context['candidate'] = user.candidate_profile
            except CandidateProfile.DoesNotExist:
                pass
        return context

    def create(self, request, *args, **kwargs):
        """Candidato faz upload de documento."""
        user = request.user

        if user.user_type != 'candidate' and not user.is_staff:
            return Response(
                {'detail': 'Apenas candidatos podem enviar documentos.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            profile = user.candidate_profile
        except CandidateProfile.DoesNotExist:
            return Response(
                {'detail': 'Perfil de candidato não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if profile.profile_status != 'approved':
            return Response(
                {'detail': 'Seu perfil precisa estar aprovado para enviar documentos.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = request.FILES.get('file')
        original_filename = file.name if file else ''

        # Se já existe documento rejeitado, atualiza ao invés de criar
        existing = CandidateDocument.objects.filter(
            candidate=profile,
            document_type=serializer.validated_data['document_type'],
            is_active=True,
            status='rejected'
        ).first()

        if existing:
            existing.file = serializer.validated_data['file']
            existing.original_filename = original_filename
            existing.status = 'pending'
            existing.observations = ''
            existing.reviewed_by = None
            existing.reviewed_at = None
            existing.save()
            result_serializer = CandidateDocumentSerializer(
                existing, context={'request': request}
            )
            return Response(result_serializer.data, status=status.HTTP_200_OK)

        doc = CandidateDocument.objects.create(
            candidate=profile,
            document_type=serializer.validated_data['document_type'],
            file=serializer.validated_data['file'],
            original_filename=original_filename,
            status='pending'
        )

        result_serializer = CandidateDocumentSerializer(
            doc, context={'request': request}
        )
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='review')
    def review(self, request, pk=None):
        """Recrutador aprova ou rejeita um documento."""
        user = request.user
        if user.user_type not in ('recruiter',) and not user.is_staff:
            return Response(
                {'detail': 'Apenas recrutadores podem revisar documentos.'},
                status=status.HTTP_403_FORBIDDEN
            )

        document = self.get_object()
        serializer = DocumentReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        document.status = serializer.validated_data['status']
        document.observations = serializer.validated_data.get('observations', '')
        document.reviewed_by = user
        document.reviewed_at = timezone.now()
        document.save(update_fields=[
            'status', 'observations', 'reviewed_by', 'reviewed_at', 'updated_at'
        ])

        result_serializer = CandidateDocumentSerializer(
            document, context={'request': request}
        )
        return Response(result_serializer.data)

    @action(detail=False, methods=['get'], url_path='my-documents')
    def my_documents(self, request):
        """Candidato vê seus documentos com status."""
        user = request.user
        if user.user_type != 'candidate' and not user.is_staff:
            return Response(
                {'detail': 'Endpoint exclusivo para candidatos.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            profile = user.candidate_profile
        except CandidateProfile.DoesNotExist:
            return Response(
                {'detail': 'Perfil de candidato não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Todos os tipos de documento ativos
        document_types = DocumentType.objects.filter(is_active=True).order_by('order', 'name')

        # Documentos já enviados
        my_docs = CandidateDocument.objects.filter(
            candidate=profile, is_active=True
        ).select_related('document_type', 'reviewed_by')

        docs_by_type = {doc.document_type_id: doc for doc in my_docs}

        result = []
        for doc_type in document_types:
            doc = docs_by_type.get(doc_type.id)
            result.append({
                'document_type': DocumentTypeSerializer(doc_type).data,
                'document': CandidateDocumentSerializer(
                    doc, context={'request': request}
                ).data if doc else None,
                'status': doc.status if doc else 'not_sent',
            })

        # Resumo
        total_types = document_types.count()
        required_types = document_types.filter(is_required=True).count()
        sent = len(docs_by_type)
        approved = sum(1 for d in my_docs if d.status == 'approved')
        rejected = sum(1 for d in my_docs if d.status == 'rejected')
        pending = sum(1 for d in my_docs if d.status == 'pending')

        return Response({
            'documents': result,
            'summary': {
                'total_types': total_types,
                'required_types': required_types,
                'sent': sent,
                'approved': approved,
                'rejected': rejected,
                'pending': pending,
            }
        })

    @action(detail=False, methods=['get'], url_path='pending-review')
    def pending_review(self, request):
        """Recrutador vê documentos pendentes de revisão."""
        user = request.user
        if user.user_type not in ('recruiter',) and not user.is_staff:
            return Response(
                {'detail': 'Apenas recrutadores podem acessar esta lista.'},
                status=status.HTTP_403_FORBIDDEN
            )

        docs = CandidateDocument.objects.filter(
            is_active=True, status='pending'
        ).select_related(
            'candidate__user', 'document_type', 'reviewed_by'
        ).order_by('created_at')

        serializer = CandidateDocumentSerializer(
            docs, many=True, context={'request': request}
        )
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='candidate-summary/(?P<candidate_id>[^/.]+)')
    def candidate_summary(self, request, candidate_id=None):
        """Resumo dos documentos de um candidato específico (para recrutador)."""
        user = request.user
        if user.user_type not in ('recruiter',) and not user.is_staff:
            return Response(
                {'detail': 'Apenas recrutadores podem acessar esta informação.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            profile = CandidateProfile.objects.get(id=candidate_id)
        except CandidateProfile.DoesNotExist:
            return Response(
                {'detail': 'Candidato não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        document_types = DocumentType.objects.filter(is_active=True).order_by('order', 'name')
        docs = CandidateDocument.objects.filter(
            candidate=profile, is_active=True
        ).select_related('document_type', 'reviewed_by')

        docs_by_type = {doc.document_type_id: doc for doc in docs}

        result = []
        for doc_type in document_types:
            doc = docs_by_type.get(doc_type.id)
            result.append({
                'document_type': DocumentTypeSerializer(doc_type).data,
                'document': CandidateDocumentSerializer(
                    doc, context={'request': request}
                ).data if doc else None,
                'status': doc.status if doc else 'not_sent',
            })

        total_types = document_types.count()
        required_types = document_types.filter(is_required=True).count()
        approved = sum(1 for d in docs if d.status == 'approved')
        required_approved = sum(
            1 for d in docs
            if d.status == 'approved' and d.document_type.is_required
        )

        return Response({
            'candidate_id': profile.id,
            'candidate_name': profile.user.name,
            'documents': result,
            'summary': {
                'total_types': total_types,
                'required_types': required_types,
                'sent': len(docs_by_type),
                'approved': approved,
                'required_approved': required_approved,
                'all_required_approved': required_approved >= required_types,
                'rejected': sum(1 for d in docs if d.status == 'rejected'),
                'pending': sum(1 for d in docs if d.status == 'pending'),
            }
        })

    @action(detail=False, methods=['get'], url_path='approved-awaiting-documents')
    def approved_awaiting_documents(self, request):
        """Lista candidatos aprovados que ainda não completaram todos os documentos obrigatórios."""
        user = request.user
        if user.user_type not in ('recruiter',) and not user.is_staff:
            return Response(
                {'detail': 'Apenas recrutadores podem acessar esta informação.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Tipos de documento obrigatórios ativos
        required_types = DocumentType.objects.filter(is_active=True, is_required=True)
        required_type_ids = set(required_types.values_list('id', flat=True))
        total_required = len(required_type_ids)

        if total_required == 0:
            return Response([])

        # Candidatos aprovados (excluindo já admitidos) com seus documentos pré-carregados
        approved_candidates = CandidateProfile.objects.filter(
            profile_status='approved'
        ).exclude(
            admission_data__status__in=['completed', 'sent', 'confirmed']
        ).select_related('user').prefetch_related(
            Prefetch(
                'documents',
                queryset=CandidateDocument.objects.filter(
                    is_active=True
                ).select_related('document_type'),
                to_attr='prefetched_docs'
            )
        )

        result = []
        for candidate in approved_candidates:
            docs = candidate.prefetched_docs
            docs_by_type = {doc.document_type_id: doc for doc in docs}

            approved_count = sum(
                1 for tid in required_type_ids
                if tid in docs_by_type and docs_by_type[tid].status == 'approved'
            )
            pending_count = sum(
                1 for tid in required_type_ids
                if tid in docs_by_type and docs_by_type[tid].status == 'pending'
            )
            rejected_count = sum(
                1 for tid in required_type_ids
                if tid in docs_by_type and docs_by_type[tid].status == 'rejected'
            )
            not_sent_count = total_required - len(
                set(docs_by_type.keys()) & required_type_ids
            )

            # Só incluir quem NÃO tem todos os obrigatórios aprovados
            if approved_count < total_required:
                result.append({
                    'candidate_id': candidate.id,
                    'candidate_name': candidate.user.name,
                    'candidate_email': candidate.user.email,
                    'total_required': total_required,
                    'approved_count': approved_count,
                    'pending_count': pending_count,
                    'rejected_count': rejected_count,
                    'not_sent_count': not_sent_count,
                })

        return Response(result)

    @action(detail=False, methods=['get'], url_path='documents-completed')
    def documents_completed(self, request):
        """Lista candidatos aprovados que completaram todos os documentos obrigatórios."""
        user = request.user
        if user.user_type not in ('recruiter',) and not user.is_staff:
            return Response(
                {'detail': 'Apenas recrutadores podem acessar esta informação.'},
                status=status.HTTP_403_FORBIDDEN
            )

        required_types = DocumentType.objects.filter(is_active=True, is_required=True)
        required_type_ids = set(required_types.values_list('id', flat=True))
        total_required = len(required_type_ids)

        if total_required == 0:
            return Response([])

        approved_candidates = CandidateProfile.objects.filter(
            profile_status='approved'
        ).exclude(
            admission_data__status__in=['completed', 'sent', 'confirmed']
        ).select_related('user').prefetch_related(
            Prefetch(
                'documents',
                queryset=CandidateDocument.objects.filter(
                    is_active=True
                ).select_related('document_type'),
                to_attr='prefetched_docs'
            )
        )

        result = []
        for candidate in approved_candidates:
            docs = candidate.prefetched_docs
            docs_by_type = {doc.document_type_id: doc for doc in docs}

            approved_count = sum(
                1 for tid in required_type_ids
                if tid in docs_by_type and docs_by_type[tid].status == 'approved'
            )

            # Só incluir quem TEM todos os obrigatórios aprovados
            if approved_count >= total_required:
                result.append({
                    'candidate_id': candidate.id,
                    'candidate_name': candidate.user.name,
                    'candidate_email': candidate.user.email,
                    'total_required': total_required,
                    'approved_count': approved_count,
                })

        return Response(result)


# ============================================
# ADMISSION DATA FILTER
# ============================================

class AdmissionDataFilter(FilterSet):
    candidate = NumberFilter(field_name='candidate')
    status = CharFilter(field_name='status')

    class Meta:
        model = AdmissionData
        fields = ['candidate', 'status']


# ============================================
# ADMISSION DATA VIEWSET
# ============================================

class AdmissionDataViewSet(viewsets.ModelViewSet):
    """
    ViewSet para dados de admissão (Protheus).
    - Recrutador/staff: CRUD completo
    - Candidato: sem acesso
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = AdmissionDataFilter
    search_fields = ['candidate__user__name', 'nome', 'cpf']
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        return AdmissionData.objects.filter(
            is_active=True
        ).select_related('candidate__user', 'filled_by')

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return AdmissionDataCreateUpdateSerializer
        return AdmissionDataSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def _check_recruiter(self, user):
        """Verifica se o usuário é recrutador ou staff."""
        if user.user_type not in ('recruiter',) and not user.is_staff:
            return Response(
                {'detail': 'Apenas recrutadores podem gerenciar dados de admissão.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return None

    def create(self, request, *args, **kwargs):
        """Cria dados de admissão para um candidato (ou atualiza se já existir)."""
        denied = self._check_recruiter(request.user)
        if denied:
            return denied

        # Se já existe admissão para este candidato, atualiza em vez de falhar
        candidate_id = request.data.get('candidate')
        if candidate_id:
            existing = AdmissionData.objects.filter(
                candidate_id=candidate_id
            ).first()
            if existing:
                serializer = self.get_serializer(existing, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save(filled_by=request.user)
                return Response(
                    AdmissionDataSerializer(existing).data,
                    status=status.HTTP_200_OK
                )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(filled_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Atualiza dados de admissão (salvar rascunho)."""
        denied = self._check_recruiter(request.user)
        if denied:
            return denied

        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save(filled_by=request.user)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    @action(detail=False, methods=['get'], url_path='lookups')
    def lookups(self, request):
        """Retorna opções de selects do Protheus Oracle para o formulário de admissão."""
        denied = self._check_recruiter(request.user)
        if denied:
            return denied

        from .services.oracle_service import ProtheusOracleService
        service = ProtheusOracleService()

        if not service.is_configured():
            return Response(
                {"error": "Conexão Oracle não configurada"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        try:
            data = service.buscar_todas_opcoes()
            return Response(data)
        except Exception as e:
            return Response(
                {"error": f"Erro ao buscar lookups: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='prefill/(?P<candidate_id>[^/.]+)')
    def prefill(self, request, candidate_id=None):
        """Retorna dados pré-preenchidos a partir do perfil do candidato."""
        denied = self._check_recruiter(request.user)
        if denied:
            return denied

        try:
            candidate = CandidateProfile.objects.select_related('user').get(id=candidate_id)
        except CandidateProfile.DoesNotExist:
            return Response(
                {'detail': 'Candidato não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Mapear gender do perfil para sexo Protheus
        gender_map = {'M': 'M', 'F': 'F', 'O': '', 'N': ''}
        sexo = gender_map.get(candidate.gender, '')

        # Mapear education_level para formato Protheus
        education_map = {
            'fundamental': '01',
            'medio': '02',
            'tecnico': '03',
            'superior': '04',
            'pos_graduacao': '05',
            'mestrado': '06',
            'doutorado': '07',
        }
        nivel_escolaridade = education_map.get(candidate.education_level, '')

        prefill_data = {
            'nome': candidate.user.name[:100] if candidate.user.name else '',
            'nome_completo': candidate.user.name[:200] if candidate.user.name else '',
            'sexo': sexo,
            'data_nascimento': candidate.date_of_birth.isoformat() if candidate.date_of_birth else None,
            'nivel_escolaridade': nivel_escolaridade,
            'email': candidate.user.email or '',
            'cpf': candidate.cpf or '',
            'endereco': candidate.street or '',
            'num_endereco': candidate.number or '',
            'desc_logradouro': candidate.complement or '',
            'municipio': candidate.city or '',
            'bairro': candidate.neighborhood or '',
            'estado': candidate.state or '',
            'cep': candidate.zip_code or '',
        }

        return Response(prefill_data)

    @action(detail=True, methods=['post'], url_path='finalize')
    def finalize(self, request, pk=None):
        """Finaliza a admissão (marca como completed)."""
        denied = self._check_recruiter(request.user)
        if denied:
            return denied

        instance = self.get_object()

        if instance.status == 'completed':
            return Response(
                {'detail': 'Admissão já foi finalizada.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not instance.data_inicio_trabalho:
            return Response(
                {'detail': 'Data de início do trabalho é obrigatória para finalizar.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        instance.status = 'completed'
        instance.filled_by = request.user
        instance.save(update_fields=['status', 'filled_by', 'updated_at'])

        serializer = AdmissionDataSerializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='send-to-protheus')
    def send_to_protheus(self, request, pk=None):
        """Envia dados para o Protheus (preparado, não executa)."""
        denied = self._check_recruiter(request.user)
        if denied:
            return denied

        instance = self.get_object()

        if instance.status not in ('completed', 'error'):
            return Response(
                {'detail': 'Admissão precisa estar finalizada para enviar ao Protheus.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from .services.protheus_service import ProtheusService
        service = ProtheusService()
        result = service.send_employee_registration(instance)

        instance.protheus_response = result
        instance.sent_at = timezone.now()
        instance.status = 'sent' if result.get('status') == 'prepared' else 'error'
        instance.save(update_fields=['protheus_response', 'sent_at', 'status', 'updated_at'])

        serializer = AdmissionDataSerializer(instance)
        return Response(serializer.data)
