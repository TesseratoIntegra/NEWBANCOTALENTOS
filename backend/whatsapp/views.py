from rest_framework import viewsets, permissions, status
from rest_framework.response import Response

from whatsapp.models import WhatsAppTemplate
from whatsapp.serializers import WhatsAppTemplateSerializer


class WhatsAppTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de templates WhatsApp.
    Apenas recrutadores e admins podem acessar.
    """
    serializer_class = WhatsAppTemplateSerializer
    http_method_names = ['get', 'patch', 'put', 'head', 'options']

    def get_queryset(self):
        return WhatsAppTemplate.objects.filter(is_active__isnull=False).order_by('status_event')

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        user = request.user
        if not (user.user_type == 'recruiter' or user.is_staff or user.is_superuser):
            return Response(
                {'error': 'Apenas recrutadores e admins podem acessar templates WhatsApp.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        user = request.user
        if not (user.user_type == 'recruiter' or user.is_staff or user.is_superuser):
            return Response(
                {'error': 'Apenas recrutadores e admins podem acessar templates WhatsApp.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().retrieve(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        user = request.user
        if not (user.user_type == 'recruiter' or user.is_staff or user.is_superuser):
            return Response(
                {'error': 'Apenas recrutadores e admins podem editar templates WhatsApp.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        user = request.user
        if not (user.user_type == 'recruiter' or user.is_staff or user.is_superuser):
            return Response(
                {'error': 'Apenas recrutadores e admins podem editar templates WhatsApp.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)
