from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend

from django_filters import FilterSet
from django.db.models import Q

from drf_spectacular.utils import extend_schema, extend_schema_view

from applications.models import Application, InterviewSchedule
from applications.serializers import (
    ApplicationSerializer, ApplicationCreateSerializer, ApplicationListSerializer,
    ApplicationStatusUpdateSerializer, InterviewScheduleSerializer
)

from applications.services.application_services import withdraw_application, update_application_status
from applications.services.interview_services import confirm_interview, complete_interview, reschedule_interview


class ApplicationFilter(FilterSet):
    """Filtros customizados para candidaturas"""

    class Meta:
        model = Application
        fields = {
            'status': ['exact', 'in'],
            'job__company': ['exact'],
            'job__job_type': ['exact'],
            'applied_at': ['gte', 'lte'],
            'city': ['icontains'],
            'state': ['exact'],
        }


@extend_schema_view(
    list=extend_schema(
        tags=['Candidaturas'],
        summary='Listar candidaturas',
        description='Lista candidaturas baseadas no tipo de usuário logado.'
    ),
    retrieve=extend_schema(
        tags=['Candidaturas'],
        summary='Detalhar candidatura',
        description='Retorna detalhes de uma candidatura específica.'
    ),
    create=extend_schema(
        tags=['Candidaturas'],
        summary='Criar candidatura',
        description='Permite que candidatos se candidatem a vagas.'
    ),
    update=extend_schema(
        tags=['Candidaturas'],
        summary='Atualizar candidatura',
        description='Atualiza dados da candidatura.'
    ),
    destroy=extend_schema(
        tags=['Candidaturas'],
        summary='Excluir candidatura',
        description='Remove candidatura (apenas o próprio candidato).'
    ),
)
class ApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet para candidaturas com controle de permissões"""

    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ApplicationFilter
    search_fields = ['name', 'candidate__name', 'job__title', 'job__company__name']
    ordering_fields = ['applied_at', 'status', 'name']
    ordering = ['-applied_at']

    def get_queryset(self):
        """Filtra candidaturas baseado no tipo de usuário"""
        user = self.request.user

        # Admins/Staff veem todas as candidaturas
        if user.is_staff or user.is_superuser:
            return Application.objects.all().select_related(
                'candidate', 'job', 'job__company', 'reviewed_by'
            )

        if user.user_type == 'candidate':
            # Candidatos veem apenas suas candidaturas
            return Application.objects.filter(
                candidate=user
            ).select_related('job', 'job__company', 'reviewed_by')

        elif user.user_type == 'recruiter' and user.company:
            # Recrutadores veem candidaturas da empresa
            return Application.objects.filter(
                job__company=user.company
            ).select_related('candidate', 'job', 'reviewed_by')

        return Application.objects.none()

    def get_serializer_class(self):
        """Retorna serializer apropriado baseado na ação"""
        if self.action == 'create':
            return ApplicationCreateSerializer
        elif self.action == 'list':
            return ApplicationListSerializer
        elif self.action == 'update_status':
            return ApplicationStatusUpdateSerializer
        return ApplicationSerializer

    def perform_destroy(self, instance):
        """Permite exclusão apenas pelo próprio candidato"""
        if self.request.user != instance.candidate:
            raise PermissionError('Você só pode excluir suas próprias candidaturas.')
        super().perform_destroy(instance)

    @extend_schema(
        tags=['Candidaturas'],
        summary='Atualizar status da candidatura',
        description='Permite que recrutadores atualizem o status das candidaturas.'
    )
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Endpoint específico para recrutadores atualizarem status"""
        application = self.get_object()
        status_value = request.data.get('status')
        notes = request.data.get('recruiter_notes', '')

        update_application_status(request.user, application, status_value, notes)
        return Response({'message': 'Status atualizado com sucesso.', 'status': status_value})

    @extend_schema(
        tags=['Candidaturas'],
        summary='Retirar candidatura',
        description='Permite que candidatos retirem suas candidaturas.'
    )
    @action(detail=True, methods=['post'])
    def withdraw(self, request, pk=None):
        """Permite candidato retirar sua candidatura"""
        def withdraw(self, request, pk=None):
            application = self.get_object()
            withdraw_application(request.user, application)
            return Response({'message': 'Candidatura retirada com sucesso.'})

    @extend_schema(
        tags=['Candidaturas'],
        summary='Minhas candidaturas',
        description='Retorna candidaturas do usuário logado.'
    )
    @action(detail=False, methods=['get'])
    def my_applications(self, request):
        """Retorna candidaturas do usuário logado"""
        if request.user.user_type != 'candidate':
            return Response(
                {'error': 'Apenas candidatos podem acessar este endpoint.'},
                status=status.HTTP_403_FORBIDDEN
            )

        applications = Application.objects.filter(
            candidate=request.user
        ).select_related('job', 'job__company')

        serializer = ApplicationListSerializer(applications, many=True)
        return Response(serializer.data)

    @extend_schema(
        tags=['Candidaturas'],
        summary='Estatísticas das candidaturas',
        description='Retorna estatísticas para recrutadores e admins.'
    )
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Estatísticas para recrutadores e admins"""
        user = request.user
        
        # Admins/Staff veem estatísticas de todas as candidaturas
        if user.is_staff or user.is_superuser:
            applications = Application.objects.all()
        elif user.user_type == 'recruiter' and user.company:
            applications = Application.objects.filter(job__company=user.company)
        else:
            return Response(
                {'error': 'Apenas recrutadores com empresa ou admins podem acessar estatísticas.'},
                status=status.HTTP_403_FORBIDDEN
            )

        stats = {
            'total_applications': applications.count(),
            'submitted': applications.filter(status='submitted').count(),
            'in_process': applications.filter(status='in_process').count(),
            'interview_scheduled': applications.filter(status='interview_scheduled').count(),
            'approved': applications.filter(status='approved').count(),
            'rejected': applications.filter(status='rejected').count(),
            'withdrawn': applications.filter(status='withdrawn').count(),
        }

        return Response(stats)


@extend_schema_view(
    list=extend_schema(
        tags=['Entrevistas'],
        summary='Listar entrevistas',
        description='Lista entrevistas agendadas.'
    ),
    create=extend_schema(
        tags=['Entrevistas'],
        summary='Agendar entrevista',
        description='Agenda nova entrevista para candidatura.'
    ),
    update=extend_schema(
        tags=['Entrevistas'],
        summary='Atualizar entrevista',
        description='Atualiza dados da entrevista.'
    ),
)
class InterviewScheduleViewSet(viewsets.ModelViewSet):
    """ViewSet para agendamento de entrevistas"""

    serializer_class = InterviewScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'interview_type']
    ordering = ['scheduled_date']

    def get_queryset(self):
        """Filtra entrevistas baseado no usuário"""
        user = self.request.user

        # Admins/Staff veem todas as entrevistas
        if user.is_staff or user.is_superuser:
            return InterviewSchedule.objects.all().select_related(
                'application', 'application__candidate', 'application__job', 'interviewer'
            )

        if user.user_type == 'candidate':
            return InterviewSchedule.objects.filter(
                application__candidate=user
            ).select_related('application', 'application__job', 'interviewer')

        elif user.user_type == 'recruiter' and user.company:
            return InterviewSchedule.objects.filter(
                Q(application__job__company=user.company) | Q(interviewer=user)
            ).select_related('application', 'application__candidate')

        return InterviewSchedule.objects.none()

    @extend_schema(
        tags=['Entrevistas'],
        summary='Confirmar entrevista',
        description='Permite que candidatos confirmem entrevistas.'
    )
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirma entrevista"""
        interview = self.get_object()
        confirm_interview(request.user, interview)
        return Response({'message': 'Entrevista confirmada.'})

    @extend_schema(
        tags=['Entrevistas'],
        summary='Completar entrevista',
        description='Marca entrevista como realizada e adiciona feedback.'
    )
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Marca entrevista como realizada e adiciona feedback"""
        interview = self.get_object()
        feedback = request.data.get('feedback', '')
        rating = request.data.get('rating')
        complete_interview(request.user, interview, feedback, rating)
        return Response({'message': 'Entrevista marcada como realizada.'})

    @extend_schema(
        tags=['Entrevistas'],
        summary='Reagendar entrevista',
        description='Reagenda uma entrevista existente.'
    )
    @action(detail=True, methods=['post'])
    def reschedule(self, request, pk=None):
        """Reagenda entrevista"""
        interview = self.get_object()
        new_date = request.data.get('new_date')
        reschedule_interview(interview, new_date)
        return Response({'message': 'Entrevista reagendada com sucesso.'})
