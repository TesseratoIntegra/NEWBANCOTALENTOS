from django.urls import path
from django.contrib.auth.views import PasswordResetConfirmView


# ⚠️ Esta URL é usada apenas para o reverse() do dj-rest-auth funcionar corretamente
urlpatterns = [
    path(
        'fake-password-reset-confirm/<uidb64>/<token>/',
        PasswordResetConfirmView.as_view(),
        name='password_reset_confirm'
    ),
]
