from django.urls import path, include

from rest_framework.routers import DefaultRouter

from accounts.views import (
    RegisterViewSet,
    RecruiterViewSet,
    CustomPasswordResetView,
    CustomLoginView,
    CustomLogoutView,
    CustomPasswordResetConfirmView,
    CustomPasswordChangeView,
)


router = DefaultRouter()
router.register(r'registers', RegisterViewSet, basename='registers')
router.register(r'recruiters', RecruiterViewSet, basename='recruiters')

urlpatterns = [
    path('', include(router.urls)),
    
    # Autenticação customizada
    path('accounts/login/', CustomLoginView.as_view(), name='rest_login'),
    path('accounts/logout/', CustomLogoutView.as_view(), name='rest_logout'),
    path('accounts/password/change/', CustomPasswordChangeView.as_view(), name='rest_password_change'),
    
    # IMPORTANTE: Esta rota deve vir ANTES das rotas padrão do dj-rest-auth
    path('accounts/password/reset/', CustomPasswordResetView.as_view(), name='rest_password_reset'),
    path('accounts/password/reset/confirm/', CustomPasswordResetConfirmView.as_view(), name='rest_password_reset_confirm'),
]
