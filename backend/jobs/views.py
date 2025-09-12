from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework import status

from rest_framework import viewsets
from drf_spectacular.utils import extend_schema, extend_schema_view

from jobs.models import Job
from jobs.serializers import JobSerializer

from companies.models import Company


@extend_schema_view(
    list=extend_schema(
        tags=['Jobs'],
        summary='Listar Jobs',
        description='Retorna todas as Jobs cadastradas no sistema.'
    ),
    retrieve=extend_schema(
        tags=['Jobs'],
        summary='Detalhar vaga',
        description='Retorna os detalhes de uma vaga específica.'
    ),
    create=extend_schema(
        tags=['Jobs'],
        summary='Criar vaga',
        description='Permite cadastrar uma nova vaga vinculada a uma empresa.'
    ),
    update=extend_schema(
        tags=['Jobs'],
        summary='Atualizar vaga',
        description='Atualiza todos os campos de uma vaga.'
    ),
    partial_update=extend_schema(
        tags=['Jobs'],
        summary='Atualizar parcialmente vaga',
        description='Atualiza parcialmente os dados de uma vaga.'
    ),
    destroy=extend_schema(
        tags=['Jobs'],
        summary='Excluir vaga',
        description='Remove uma vaga do sistema.'
    ),
)
class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    @extend_schema(
        summary='Listar vagas por empresa',
        description='Retorna todas as vagas associadas a uma empresa pelo slug informado.',
        tags=['Jobs']
    )
    @action(detail=False, url_path=r'company/(?P<slug>[\w-]+)', methods=['get'])
    def by_company_slug(self, request, slug=None):
        """
        Retorna todas as vagas relacionadas a uma empresa com o slug informado.
        """
        try:
            company = Company.objects.get(slug=slug)
        except Company.DoesNotExist:
            return Response({'detail': 'Empresa não encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        jobs = self.queryset.filter(company=company)
        serializer = self.get_serializer(jobs, many=True)
        return Response(serializer.data)
