from rest_framework import serializers, viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend
from django_filters import FilterSet, NumberFilter, CharFilter

from django.db.models import Q
from django.db import IntegrityError
from django.utils import timezone

from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter

from candidates.models import (
    CandidateProfile, CandidateEducation, CandidateExperience,
    CandidateLanguage, CandidateSkill
)
from candidates.serializers import (
    CandidateProfileSerializer, CandidateProfileCreateUpdateSerializer, CandidateProfileListSerializer,
    CandidateEducationSerializer, CandidateExperienceSerializer,
    CandidateLanguageSerializer, CandidateSkillSerializer,
    ProfileStatusUpdateSerializer
)


import re as _re

SECTION_LABEL_TO_KEY = {
    'Dados Pessoais': 'dadosPessoais',
    'Informações Profissionais': 'profissional',
    'Formação Acadêmica': 'formacao',
    'Experiência Profissional': 'experiencia',
    'Habilidades': 'habilidades',
    'Idiomas': 'idiomas',
}

PERSONAL_FIELDS = {
    'cpf', 'date_of_birth', 'gender', 'phone_secondary', 'zip_code',
    'street', 'number', 'complement', 'neighborhood', 'city', 'state',
    'emergency_contact_name', 'emergency_contact_phone', 'image_profile',
    'accepts_whatsapp'
}

PROFESSIONAL_FIELDS = {
    'current_position', 'current_company', 'education_level', 'experience_years',
    'desired_salary_min', 'desired_salary_max', 'professional_summary',
    'linkedin_url', 'github_url', 'portfolio_url', 'skills', 'certifications'
}


def _parse_observation_sections(observations):
    """Extrai chaves de secao das observacoes estruturadas."""
    keys = []
    for match in _re.finditer(r'\[([^\]]+)\]', observations):
        label = match.group(1).strip()
        key = SECTION_LABEL_TO_KEY.get(label)
        if key:
            keys.append(key)
    return keys


def _transition_profile_to_awaiting_review(profile, section_keys=None):
    """
    Transiciona o perfil do candidato para 'awaiting_review'.
    - approved/rejected: transicao imediata em qualquer edicao.
    - changes_requested COM secoes pendentes: so transiciona quando todas forem editadas.
    - changes_requested SEM secoes pendentes (legado): transicao imediata.
    """
    if profile.profile_status in ('approved', 'rejected'):
        profile.profile_status = 'awaiting_review'
        profile.pending_observation_sections = []
        profile.save(update_fields=['profile_status', 'pending_observation_sections', 'updated_at'])
        return

    if profile.profile_status != 'changes_requested':
        return

    pending = list(profile.pending_observation_sections or [])

    # Sem secoes pendentes (legado/texto simples) → transicao imediata
    if not pending:
        profile.profile_status = 'awaiting_review'
        profile.save(update_fields=['profile_status', 'updated_at'])
        return

    # Remover secoes editadas da lista
    if section_keys:
        for key in section_keys:
            if key in pending:
                pending.remove(key)
    profile.pending_observation_sections = pending

    # Se todas foram editadas, transicionar
    if not pending:
        profile.profile_status = 'awaiting_review'
        profile.pending_observation_sections = []
        profile.save(update_fields=['profile_status', 'pending_observation_sections', 'updated_at'])
    else:
        profile.save(update_fields=['pending_observation_sections', 'updated_at'])


class CandidateProfileFilter(FilterSet):
    """Filtros customizados para perfis de candidatos"""

    # Filtro para buscar candidatos que se candidataram a uma vaga específica
    applied_to_job = NumberFilter(method='filter_by_job')

    # Filtro por status do perfil
    profile_status = CharFilter(field_name='profile_status')

    class Meta:
        model = CandidateProfile
        fields = {
            'education_level': ['exact', 'in'],
            'available_for_work': ['exact'],
            'accepts_remote_work': ['exact'],
            'accepts_relocation': ['exact'],
            'can_travel': ['exact'],
            'experience_years': ['gte', 'lte'],
            'desired_salary_min': ['gte', 'lte'],
            'desired_salary_max': ['gte', 'lte'],
            'preferred_work_shift': ['exact'],
            'profile_status': ['exact', 'in'],
        }

    def filter_by_job(self, queryset, name, value):
        """Filtra candidatos que se candidataram a uma vaga específica"""
        if value:
            return queryset.filter(user__applications__job_id=value).distinct()
        return queryset


@extend_schema_view(
    list=extend_schema(
        tags=['Candidatos - Perfis'],
        summary='Listar perfis de candidatos',
        description='Lista perfis de candidatos com filtros avançados. Candidatos veem apenas o próprio perfil, recrutadores veem todos os perfis disponíveis.'
    ),
    create=extend_schema(
        tags=['Candidatos - Perfis'],
        summary='Criar perfil de candidato',
        description='Cria perfil detalhado para o candidato logado. Apenas candidatos podem criar perfis.'
    ),
    retrieve=extend_schema(
        tags=['Candidatos - Perfis'],
        summary='Detalhes do perfil',
        description='Retorna perfil completo do candidato com formações, experiências, idiomas e habilidades.'
    ),
    update=extend_schema(
        tags=['Candidatos - Perfis'],
        summary='Atualizar perfil',
        description='Atualiza dados do perfil do candidato. Apenas o próprio candidato pode editar seu perfil.'
    ),
    destroy=extend_schema(
        tags=['Candidatos - Perfis'],
        summary='Deletar perfil',
        description='Remove perfil do candidato. Apenas o próprio candidato pode deletar seu perfil.'
    ),
)
class CandidateProfileViewSet(viewsets.ModelViewSet):
    """ViewSet para perfis de candidatos"""

    serializer_class = CandidateProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CandidateProfileFilter
    search_fields = [
        'user__name', 'current_position', 'current_company', 'skills', 
        'professional_summary', 'certifications'
    ]
    ordering_fields = ['created_at', 'experience_years', 'desired_salary_min']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filtra perfis baseado no tipo de usuário"""
        user = self.request.user

        # Staff/Superuser sempre vê tudo (independente de user_type)
        if user.is_staff or user.is_superuser:
            return CandidateProfile.objects.all().select_related('user').prefetch_related(
                'educations', 'experiences', 'languages', 'detailed_skills'
            )

        # Recrutadores também veem todos os perfis
        if user.user_type == 'recruiter':
            return CandidateProfile.objects.all().select_related('user').prefetch_related(
                'educations', 'experiences', 'languages', 'detailed_skills'
            )

        # Candidatos veem apenas seu próprio perfil
        if user.user_type == 'candidate':
            return CandidateProfile.objects.filter(user=user).select_related('user')

        return CandidateProfile.objects.none()

    def get_serializer_class(self):
        """Retorna serializer apropriado baseado na ação"""
        if self.action in ['create', 'update', 'partial_update']:
            return CandidateProfileCreateUpdateSerializer
        elif self.action == 'list':
            return CandidateProfileListSerializer
        return CandidateProfileSerializer

    def perform_create(self, serializer):
        """Cria perfil associando ao usuário logado"""
        if self.request.user.user_type != 'candidate':
            raise serializers.ValidationError({
                'user': 'Apenas candidatos podem criar perfil de candidato.'
            })

        # Verifica se já não tem perfil
        if CandidateProfile.objects.filter(user=self.request.user).exists():
            raise serializers.ValidationError({
                'user': 'Usuário já possui perfil de candidato.'
            })

        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """Permite apenas que o próprio candidato edite seu perfil"""
        if self.request.user != serializer.instance.user:
            raise PermissionError('Você só pode editar seu próprio perfil.')

        instance = serializer.save()

        # Detectar quais secoes foram editadas pelos campos do request
        request_fields = set(self.request.data.keys())
        section_keys = []
        if request_fields & PERSONAL_FIELDS:
            section_keys.append('dadosPessoais')
        if request_fields & PROFESSIONAL_FIELDS:
            section_keys.append('profissional')

        _transition_profile_to_awaiting_review(
            instance,
            section_keys=section_keys or ['dadosPessoais', 'profissional']
        )

        # Forçar persistência do image_profile se enviado via FILES
        # (corrige problema onde o serializer não persiste o campo corretamente)
        if 'image_profile' in self.request.FILES:
            instance.image_profile = self.request.FILES['image_profile']
            instance.save(update_fields=['image_profile', 'updated_at'])

        return instance

    def perform_destroy(self, instance):
        """Permite apenas que o próprio candidato delete seu perfil"""
        if self.request.user != instance.user:
            raise PermissionError('Você só pode deletar seu próprio perfil.')
        super().perform_destroy(instance)

    @extend_schema(
        tags=['Candidatos'],
        summary='Meu perfil',
        description='Retorna o perfil do candidato logado.'
    )
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Retorna perfil do candidato logado"""
        if request.user.user_type != 'candidate':
            return Response(
                {'error': 'Apenas candidatos podem acessar este endpoint.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            profile = CandidateProfile.objects.get(user=request.user)
            serializer = CandidateProfileSerializer(profile, context={'request': request})
            return Response(serializer.data)
        except CandidateProfile.DoesNotExist:
            return Response(
                {'error': 'Perfil de candidato não encontrado. Crie um perfil primeiro.'},
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        tags=['Candidatos'],
        summary='Buscar candidatos',
        description='Busca avançada de candidatos para recrutadores.'
    )
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Busca avançada para recrutadores, staff e superusers"""
        user = request.user
        if not (user.user_type == 'recruiter' or user.is_staff or user.is_superuser):
            return Response(
                {'error': 'Apenas recrutadores e admins podem buscar candidatos.'},
                status=status.HTTP_403_FORBIDDEN
            )

        queryset = self.get_queryset()

        # Filtros adicionais via query params
        skills_query = request.query_params.get('skills')
        position_query = request.query_params.get('position')
        location_query = request.query_params.get('location')

        if skills_query:
            queryset = queryset.filter(
                Q(skills__icontains=skills_query) |
                Q(detailed_skills__skill_name__icontains=skills_query)
            ).distinct()

        if position_query:
            queryset = queryset.filter(
                Q(current_position__icontains=position_query) |
                Q(experiences__position__icontains=position_query)
            ).distinct()

        if location_query:
            # Busca em qualquer campo de localização das applications do usuário
            from applications.models import Application
            candidate_ids = Application.objects.filter(
                Q(city__icontains=location_query) |
                Q(state__icontains=location_query)
            ).values_list('candidate_id', flat=True)

            queryset = queryset.filter(user_id__in=candidate_ids)

        # Aplicar filtros do DjangoFilterBackend
        queryset = self.filter_queryset(queryset)

        # Paginação
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = CandidateProfileListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = CandidateProfileListSerializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(
        tags=['Candidatos - Perfis'],
        summary='Atualizar status do perfil',
        description='Atualiza o status do perfil do candidato (aprovar, reprovar, solicitar alterações). Apenas recrutadores e admins.',
        request=ProfileStatusUpdateSerializer,
        responses={200: {'description': 'Status atualizado com sucesso'}},
    )
    @action(detail=True, methods=['patch'], url_path='update-profile-status')
    def update_profile_status(self, request, pk=None):
        """
        Atualiza status do perfil (aprovar/reprovar/solicitar alterações)
        Apenas recrutadores e admins podem usar este endpoint
        """
        user = request.user

        # Verificar permissão
        if not (user.user_type == 'recruiter' or user.is_staff or user.is_superuser):
            return Response(
                {'error': 'Apenas recrutadores e admins podem atualizar status de perfil.'},
                status=status.HTTP_403_FORBIDDEN
            )

        profile = self.get_object()

        # Validar dados
        serializer = ProfileStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Atualizar perfil
        new_status = serializer.validated_data['status']
        observations = serializer.validated_data.get('observations', '')

        profile.profile_status = new_status
        profile.profile_observations = observations
        profile.profile_reviewed_by = user
        profile.profile_reviewed_at = timezone.now()

        # Popular secoes pendentes quando solicita alteracoes
        if new_status == 'changes_requested':
            profile.pending_observation_sections = _parse_observation_sections(observations)
        else:
            profile.pending_observation_sections = []

        profile.save()

        # Retornar perfil atualizado
        return Response({
            'message': 'Status do perfil atualizado com sucesso.',
            'profile_status': profile.profile_status,
            'profile_observations': profile.profile_observations,
            'profile_reviewed_at': profile.profile_reviewed_at.isoformat(),
            'pending_observation_sections': profile.pending_observation_sections,
        })


@extend_schema_view(
    list=extend_schema(
        tags=['Candidatos - Formação'],
        summary='Listar formações acadêmicas',
        description='Lista formações acadêmicas do candidato logado. Retorna educação em ordem cronológica decrescente.'
    ),
    create=extend_schema(
        tags=['Candidatos - Formação'],
        summary='Adicionar formação acadêmica',
        description='Adiciona nova formação acadêmica ao perfil do candidato. Validações: data de início não pode ser futura, se não está cursando deve ter data de fim.'
    ),
    update=extend_schema(
        tags=['Candidatos - Formação'],
        summary='Atualizar formação acadêmica',
        description='Atualiza formação acadêmica existente.'
    ),
    destroy=extend_schema(
        tags=['Candidatos - Formação'],
        summary='Remover formação acadêmica',
        description='Remove formação acadêmica do perfil.'
    ),
)
class CandidateEducationViewSet(viewsets.ModelViewSet):
    """ViewSet para formações acadêmicas"""

    serializer_class = CandidateEducationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Retorna formações do candidato logado ou de candidato específico (para admin/recruiter)"""
        user = self.request.user
        candidate_id = self.request.query_params.get('candidate')

        # Staff/Superuser sempre vê tudo
        if user.is_staff or user.is_superuser:
            if candidate_id:
                return CandidateEducation.objects.filter(candidate_id=candidate_id)
            return CandidateEducation.objects.all()

        # Recrutadores também veem tudo
        if user.user_type == 'recruiter':
            if candidate_id:
                return CandidateEducation.objects.filter(candidate_id=candidate_id)
            return CandidateEducation.objects.all()

        # Candidatos veem apenas suas formações
        if user.user_type == 'candidate':
            try:
                profile = CandidateProfile.objects.get(user=user)
                return CandidateEducation.objects.filter(candidate=profile)
            except CandidateProfile.DoesNotExist:
                return CandidateEducation.objects.none()

        return CandidateEducation.objects.none()

    def perform_create(self, serializer):
        """Associa formação ao candidato logado"""
        if self.request.user.user_type != 'candidate':
            raise serializers.ValidationError({
                'user': 'Apenas candidatos podem adicionar formações.'
            })

        try:
            profile = CandidateProfile.objects.get(user=self.request.user)
            serializer.save(candidate=profile)
            _transition_profile_to_awaiting_review(profile, section_keys=['formacao'])
        except CandidateProfile.DoesNotExist:
            raise serializers.ValidationError({
                'candidate': 'Perfil de candidato não encontrado. Crie um perfil primeiro.'
            })

    def perform_update(self, serializer):
        instance = serializer.instance
        if self.request.user.user_type == 'candidate' and instance.candidate.user != self.request.user:
            raise PermissionError('Você só pode editar suas próprias formações.')
        serializer.save()
        if self.request.user.user_type == 'candidate':
            _transition_profile_to_awaiting_review(instance.candidate, section_keys=['formacao'])

    def perform_destroy(self, instance):
        if self.request.user.user_type == 'candidate' and instance.candidate.user != self.request.user:
            raise PermissionError('Você só pode deletar suas próprias formações.')
        profile = instance.candidate
        super().perform_destroy(instance)
        if self.request.user.user_type == 'candidate':
            _transition_profile_to_awaiting_review(profile, section_keys=['formacao'])


@extend_schema_view(
    list=extend_schema(
        tags=['Candidatos - Experiência'],
        summary='Listar experiências profissionais',
        description='Lista experiências profissionais do candidato logado em ordem cronológica decrescente.'
    ),
    create=extend_schema(
        tags=['Candidatos - Experiência'],
        summary='Adicionar experiência profissional',
        description='Adiciona nova experiência profissional. Validações: se não é trabalho atual deve ter data de saída, data de início não pode ser futura.'
    ),
)
class CandidateExperienceViewSet(viewsets.ModelViewSet):
    """ViewSet para experiências profissionais"""

    serializer_class = CandidateExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Retorna experiências do candidato logado ou de candidato específico (para admin/recruiter)"""
        user = self.request.user
        candidate_id = self.request.query_params.get('candidate')

        # Staff/Superuser sempre vê tudo
        if user.is_staff or user.is_superuser:
            if candidate_id:
                return CandidateExperience.objects.filter(candidate_id=candidate_id)
            return CandidateExperience.objects.all()

        # Recrutadores também veem tudo
        if user.user_type == 'recruiter':
            if candidate_id:
                return CandidateExperience.objects.filter(candidate_id=candidate_id)
            return CandidateExperience.objects.all()

        # Candidatos veem apenas suas experiências
        if user.user_type == 'candidate':
            try:
                profile = CandidateProfile.objects.get(user=user)
                return CandidateExperience.objects.filter(candidate=profile)
            except CandidateProfile.DoesNotExist:
                return CandidateExperience.objects.none()

        return CandidateExperience.objects.none()

    def perform_create(self, serializer):
        """Associa experiência ao candidato logado"""
        if self.request.user.user_type != 'candidate':
            raise serializers.ValidationError({
                'user': 'Apenas candidatos podem adicionar experiências.'
            })

        try:
            profile = CandidateProfile.objects.get(user=self.request.user)
            serializer.save(candidate=profile)
            _transition_profile_to_awaiting_review(profile, section_keys=['experiencia'])
        except CandidateProfile.DoesNotExist:
            raise serializers.ValidationError({
                'candidate': 'Perfil de candidato não encontrado. Crie um perfil primeiro.'
            })

    def perform_update(self, serializer):
        instance = serializer.instance
        if self.request.user.user_type == 'candidate' and instance.candidate.user != self.request.user:
            raise PermissionError('Você só pode editar suas próprias experiências.')
        serializer.save()
        if self.request.user.user_type == 'candidate':
            _transition_profile_to_awaiting_review(instance.candidate, section_keys=['experiencia'])

    def perform_destroy(self, instance):
        if self.request.user.user_type == 'candidate' and instance.candidate.user != self.request.user:
            raise PermissionError('Você só pode deletar suas próprias experiências.')
        profile = instance.candidate
        super().perform_destroy(instance)
        if self.request.user.user_type == 'candidate':
            _transition_profile_to_awaiting_review(profile, section_keys=['experiencia'])


@extend_schema_view(
    list=extend_schema(
        tags=['Candidatos - Idiomas'],
        summary='Listar idiomas do candidato',
        description='Lista idiomas e níveis de proficiência do candidato logado.'
    ),
    create=extend_schema(
        tags=['Candidatos - Idiomas'],
        summary='Adicionar idioma',
        description='Adiciona novo idioma ao perfil. Constraint: não pode ter o mesmo idioma duas vezes.'
    ),
)
class CandidateLanguageViewSet(viewsets.ModelViewSet):
    """ViewSet para idiomas"""

    serializer_class = CandidateLanguageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Retorna idiomas do candidato logado ou de candidato específico (para admin/recruiter)"""
        user = self.request.user
        candidate_id = self.request.query_params.get('candidate')

        # Staff/Superuser sempre vê tudo
        if user.is_staff or user.is_superuser:
            if candidate_id:
                return CandidateLanguage.objects.filter(candidate_id=candidate_id)
            return CandidateLanguage.objects.all()

        # Recrutadores também veem tudo
        if user.user_type == 'recruiter':
            if candidate_id:
                return CandidateLanguage.objects.filter(candidate_id=candidate_id)
            return CandidateLanguage.objects.all()

        # Candidatos veem apenas seus idiomas
        if user.user_type == 'candidate':
            try:
                profile = CandidateProfile.objects.get(user=user)
                return CandidateLanguage.objects.filter(candidate=profile)
            except CandidateProfile.DoesNotExist:
                return CandidateLanguage.objects.none()

        return CandidateLanguage.objects.none()

    def perform_create(self, serializer):
        """Associa idioma ao candidato logado"""
        if self.request.user.user_type != 'candidate':
            raise serializers.ValidationError({
                'user': 'Apenas candidatos podem adicionar idiomas.'
            })

        try:
            profile = CandidateProfile.objects.get(user=self.request.user)
            serializer.save(candidate=profile)
            _transition_profile_to_awaiting_review(profile, section_keys=['idiomas'])
        except CandidateProfile.DoesNotExist:
            raise serializers.ValidationError({
                'candidate': 'Perfil de candidato não encontrado. Crie um perfil primeiro.'
            })
        except IntegrityError:
            raise serializers.ValidationError({
                'language': 'Você já possui este idioma cadastrado.'
            })

    def perform_update(self, serializer):
        instance = serializer.instance
        if self.request.user.user_type == 'candidate' and instance.candidate.user != self.request.user:
            raise PermissionError('Você só pode editar seus próprios idiomas.')
        serializer.save()
        if self.request.user.user_type == 'candidate':
            _transition_profile_to_awaiting_review(instance.candidate, section_keys=['idiomas'])

    def perform_destroy(self, instance):
        if self.request.user.user_type == 'candidate' and instance.candidate.user != self.request.user:
            raise PermissionError('Você só pode deletar seus próprios idiomas.')
        profile = instance.candidate
        super().perform_destroy(instance)
        if self.request.user.user_type == 'candidate':
            _transition_profile_to_awaiting_review(profile, section_keys=['idiomas'])


@extend_schema_view(
    list=extend_schema(
        tags=['Candidatos - Habilidades'],
        summary='Listar habilidades técnicas',
        description='Lista habilidades técnicas detalhadas do candidato com níveis e anos de experiência.'
    ),
    create=extend_schema(
        tags=['Candidatos - Habilidades'],
        summary='Adicionar habilidade técnica',
        description='Adiciona nova habilidade técnica com nível de proficiência. Constraint: não pode ter a mesma habilidade duas vezes.'
    ),
)
class CandidateSkillViewSet(viewsets.ModelViewSet):
    """ViewSet para habilidades"""

    serializer_class = CandidateSkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Retorna habilidades do candidato logado ou de candidato específico (para admin/recruiter)"""
        user = self.request.user
        candidate_id = self.request.query_params.get('candidate')

        # Staff/Superuser sempre vê tudo
        if user.is_staff or user.is_superuser:
            if candidate_id:
                return CandidateSkill.objects.filter(candidate_id=candidate_id)
            return CandidateSkill.objects.all()

        # Recrutadores também veem tudo
        if user.user_type == 'recruiter':
            if candidate_id:
                return CandidateSkill.objects.filter(candidate_id=candidate_id)
            return CandidateSkill.objects.all()

        # Candidatos veem apenas suas habilidades
        if user.user_type == 'candidate':
            try:
                profile = CandidateProfile.objects.get(user=user)
                return CandidateSkill.objects.filter(candidate=profile)
            except CandidateProfile.DoesNotExist:
                return CandidateSkill.objects.none()

        return CandidateSkill.objects.none()

    def perform_create(self, serializer):
        """Associa habilidade ao candidato logado"""
        if self.request.user.user_type != 'candidate':
            raise serializers.ValidationError({
                'user': 'Apenas candidatos podem adicionar habilidades.'
            })

        try:
            profile = CandidateProfile.objects.get(user=self.request.user)
            serializer.save(candidate=profile)
            _transition_profile_to_awaiting_review(profile, section_keys=['habilidades'])
        except CandidateProfile.DoesNotExist:
            raise serializers.ValidationError({
                'candidate': 'Perfil de candidato não encontrado. Crie um perfil primeiro.'
            })
        except IntegrityError:
            raise serializers.ValidationError({
                'skill_name': 'Você já possui uma habilidade com este nome cadastrada.'
            })

    def perform_update(self, serializer):
        instance = serializer.instance
        if self.request.user.user_type == 'candidate' and instance.candidate.user != self.request.user:
            raise PermissionError('Você só pode editar suas próprias habilidades.')
        serializer.save()
        if self.request.user.user_type == 'candidate':
            _transition_profile_to_awaiting_review(instance.candidate, section_keys=['habilidades'])

    def perform_destroy(self, instance):
        if self.request.user.user_type == 'candidate' and instance.candidate.user != self.request.user:
            raise PermissionError('Você só pode deletar suas próprias habilidades.')
        profile = instance.candidate
        super().perform_destroy(instance)
        if self.request.user.user_type == 'candidate':
            _transition_profile_to_awaiting_review(profile, section_keys=['habilidades'])
