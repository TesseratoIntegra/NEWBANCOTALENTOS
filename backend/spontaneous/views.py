from rest_framework import viewsets

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
    queryset = SpontaneousApplication.objects.all()
    serializer_class = SpontaneousApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        # staff enxerga tudo (útil para RH/admin); usuário comum vê somente a sua
        if user.is_staff:
            return SpontaneousApplication.objects.all()
        return SpontaneousApplication.objects.filter(user=user)

    def perform_create(self, serializer):
        # força vinculação ao usuário autenticado e respeita o OneToOne
        serializer.save(user=self.request.user)
