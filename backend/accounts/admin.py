from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from accounts.models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(BaseUserAdmin):
    model = UserProfile
    ordering = ['email']
    list_display = ['email', 'name', 'user_type', 'is_staff', 'is_active']
    list_filter = ['user_type', 'is_staff', 'is_superuser', 'is_active']
    search_fields = ['email', 'name']
    readonly_fields = ('created_at', 'updated_at', 'last_login')

    fieldsets = (
        (_('Informações de Login'), {'fields': ('email', 'password')}),
        (_('Informações Pessoais'), {'fields': ('name', 'user_type')}),
        (_('Permissões'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        (_('Datas Importantes'), {'fields': ('last_login', 'created_at', 'updated_at')}),
    )

    add_fieldsets = (
        (_('Novo Usuário'), {
            'classes': ('wide',),
            'fields': ('email', 'name', 'user_type', 'password1', 'password2', 'is_staff', 'is_active'),
        }),
    )
