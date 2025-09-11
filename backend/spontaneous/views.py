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
        summary='Listar Aplicação Espontânea',
        description='Retorna todas as Jobs cadastradas no sistema.'
    ),
    retrieve=extend_schema(
        tags=['SpontaneousApplication'],
        summary='Detalhar Aplicação Espontânea',
        description='Retorna os detalhes de uma Aplicação Espontânea específica.'
    ),
    create=extend_schema(
        tags=['SpontaneousApplication'],
        summary='Criar Aplicação Espontânea',
        description='Permite cadastrar uma nova Aplicação Espontânea.'
    ),
    update=extend_schema(
        tags=['SpontaneousApplication'],
        summary='Atualizar Aplicação Espontânea',
        description='Atualiza todos os campos de uma Aplicação Espontânea.'
    ),
    partial_update=extend_schema(
        tags=['SpontaneousApplication'],
        summary='Atualizar parcialmente Aplicação Espontânea',
        description='Atualiza parcialmente os dados de uma Aplicação Espontânea.'
    ),
    destroy=extend_schema(
        tags=['SpontaneousApplication'],
        summary='Excluir Aplicação Espontânea',
        description='Remove uma Aplicação Espontânea do sistema.'
    ),
)
class SpontaneousApplicationViewSet(viewsets.ModelViewSet):
    queryset = SpontaneousApplication.objects.all()
    serializer_class = SpontaneousApplicationSerializer
