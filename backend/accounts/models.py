from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

from app.models import Base


class UserProfileManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('O e-mail é obrigaório')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class UserProfile(Base, AbstractBaseUser, PermissionsMixin):
    USER_TYPE_CHOICES = [
        ('candidate', 'Candidato'),
        ('recruiter', 'Recrutador'),
    ]
    objects = UserProfileManager()
    company = models.ForeignKey('companies.Company', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Empresa')
    email = models.EmailField(unique=True, verbose_name='E-mail')
    name = models.CharField(max_length=255, verbose_name='Nome')
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, verbose_name='Tipo de Usuário')
    is_staff = models.BooleanField(default=False, verbose_name='É Funcionario?')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'user_type']

    def __str__(self):
        return f'{self.name} ({self.get_user_type_display()})'
