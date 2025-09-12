from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotAuthenticated, PermissionDenied

from drf_spectacular.utils import extend_schema, extend_schema_view

from spontaneous.models import Occupation, SpontaneousApplication
from spontaneous.serializers import OccupationSerializer, SpontaneousApplicationSerializer


@extend_schema_view(
    list=extend_schema(
        tags=['Occupations'],
        summary='Listar Occupation',
        description='Retorna todas as Jobs cadastradas no sistema.'
    ),
    retrieve=extend_schema(
        tags=['Occupations'],
        summary='Detalhar ocupação',
        description='Retorna os detalhes de uma ocupação específica.'
    ),
    create=extend_schema(
        tags=['Occupations'],
        summary='Criar ocupação',
        description='Permite cadastrar uma nova ocupação.'
    ),
    update=extend_schema(
        tags=['Occupations'],
        summary='Atualizar ocupação',
        description='Atualiza todos os campos de uma ocupação.'
    ),
    partial_update=extend_schema(
        tags=['Occupations'],
        summary='Atualizar parcialmente ocupação',
        description='Atualiza parcialmente os dados de uma ocupação.'
    ),
    destroy=extend_schema(
        tags=['Occupations'],
        summary='Excluir ocupação',
        description='Remove uma ocupação do sistema.'
    ),
)
class OccupationViewSet(viewsets.ModelViewSet):
    queryset = Occupation.objects.all()
    serializer_class = OccupationSerializer


@extend_schema_view(
    list=extend_schema(
        tags=['SpontaneousApplication'],
        summary='Listar candidaturas do usuário',
        description='Retorna apenas a candidatura do usuário autenticado.'
    ),
    retrieve=extend_schema(
        tags=['SpontaneousApplication'],
        summary='Detalhar sua candidatura'
    ),
    create=extend_schema(
        tags=['SpontaneousApplication'],
        summary='Criar sua candidatura'
    ),
    update=extend_schema(
        tags=['SpontaneousApplication'],
        summary='Atualizar sua candidatura'
    ),
    partial_update=extend_schema(
        tags=['SpontaneousApplication'],
        summary='Atualizar parcialmente sua candidatura'
    ),
    destroy=extend_schema(
        tags=['SpontaneousApplication'],
        summary='Excluir sua candidatura'
    ),
)
class SpontaneousApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = SpontaneousApplicationSerializer
    permission_classes = [IsAuthenticated]
    queryset = SpontaneousApplication.objects.none()

    def get_queryset(self):
        user = self.request.user

        # Guarda de segurança: evita cair no filter(user=AnonymousUser)
        if not user.is_authenticated:

            raise NotAuthenticated("Faça login para acessar suas candidaturas.")

        # Admin absoluto vê tudo
        if user.is_superuser:
            return SpontaneousApplication.objects.all()

        # Permissão de RH (granular) para ver tudo
        if user.has_perm('spontaneous.view_all_spontaneousapplications'):
            return SpontaneousApplication.objects.all()

        # Somente a própria (use user_id para não forçar cast do objeto user)
        return SpontaneousApplication.objects.filter(user_id=user.id)

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_authenticated:
            raise NotAuthenticated("Faça login para criar candidatura.")

        # Só candidatos podem criar candidatura (regra de negócio)
        if getattr(user, 'user_type', None) != 'candidate':
            raise PermissionDenied('Apenas candidatos podem criar candidatura espontânea.')

        serializer.save(user=user)
