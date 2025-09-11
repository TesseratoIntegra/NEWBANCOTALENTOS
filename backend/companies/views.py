from rest_framework import viewsets
from drf_spectacular.utils import extend_schema, extend_schema_view

from companies.models import CompanyGroup, Company
from companies.serializers import CompanyGroupSerializer, CompanySerializer


@extend_schema_view(
    list=extend_schema(
        tags=['Companies'],
        summary='Listar grupos empresariais',
        description='Retorna todos os grupos empresariais cadastrados no sistema.'
    ),
    retrieve=extend_schema(
        tags=['Companies'],
        summary='Detalhar grupo empresarial',
        description='Retorna os dados de um grupo empresarial específico.'
    ),
    create=extend_schema(
        tags=['Companies'],
        summary='Criar grupo empresarial',
        description='Permite cadastrar um novo grupo empresarial.'
    ),
    update=extend_schema(
        tags=['Companies'],
        summary='Atualizar grupo empresarial',
        description='Atualiza todos os campos de um grupo empresarial.'
    ),
    partial_update=extend_schema(
        tags=['Companies'],
        summary='Atualizar parcialmente grupo empresarial',
        description='Atualiza parcialmente os dados de um grupo empresarial.'
    ),
    destroy=extend_schema(
        tags=['Companies'],
        summary='Excluir grupo empresarial',
        description='Remove um grupo empresarial do sistema.'
    ),
)
class CompanyGroupViewSet(viewsets.ModelViewSet):
    queryset = CompanyGroup.objects.all()
    serializer_class = CompanyGroupSerializer


@extend_schema_view(
    list=extend_schema(
        tags=['Companies'],
        summary='Listar empresa',
        description='Retorna todas as Companies cadastradas no sistema.'
    ),
    retrieve=extend_schema(
        tags=['Companies'],
        summary='Detalhar empresa',
        description='Retorna os dados de uma empresa específica.'
    ),
    create=extend_schema(
        tags=['Companies'],
        summary='Criar empresa',
        description='Permite cadastrar uma nova empresa vinculada a um grupo empresarial (opcional).'
    ),
    update=extend_schema(
        tags=['Companies'],
        summary='Atualizar empresa',
        description='Atualiza todos os campos de uma empresa.'
    ),
    partial_update=extend_schema(
        tags=['Companies'],
        summary='Atualizar parcialmente empresa',
        description='Atualiza parcialmente os dados de uma empresa.'
    ),
    destroy=extend_schema(
        tags=['Companies'],
        summary='Excluir empresa',
        description='Remove uma empresa do sistema.'
    ),
)
class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
