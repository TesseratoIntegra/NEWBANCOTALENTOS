from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Workaround (se necessário)
    path('', include('app.urls_auth_workaround')),

    # Autenticação por sessão (opcional)
    path('auth/', include('rest_framework.urls')),

    # Documentação
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Seus apps
    path('api/v1/', include('accounts.urls')),
    path('api/v1/', include('applications.urls')),
    path('api/v1/', include('companies.urls')),
    path('api/v1/', include('jobs.urls')),
    path('api/v1/', include('spontaneous.urls')),
    path('api/v1/', include('candidates.urls')),

    # dj-rest-auth
    path('api/v1/accounts/', include('dj_rest_auth.urls')),
    path('api/v1/accounts/registration/', include('dj_rest_auth.registration.urls')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Configuração do admin
admin.site.site_header = "Banco de Talentos Admin"
admin.site.site_title = "Banco de Talentos"
admin.site.index_title = "Painel Administrativo"
