from django.urls import path, include
from rest_framework.routers import DefaultRouter

from whatsapp.views import WhatsAppTemplateViewSet

router = DefaultRouter()
router.register(r'whatsapp/templates', WhatsAppTemplateViewSet, basename='whatsapp-template')

urlpatterns = [
    path('', include(router.urls)),
]
