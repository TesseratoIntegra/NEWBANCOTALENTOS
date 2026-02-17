from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone

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
    ACCOUNT_TYPE_CHOICES = [
        ('free', 'Gratuito'),
        ('trial', 'Trial'),
        ('premium', 'Premium'),
    ]
    objects = UserProfileManager()
    company = models.ForeignKey('companies.Company', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Empresa')
    email = models.EmailField(unique=True, verbose_name='E-mail')
    name = models.CharField(max_length=255, verbose_name='Nome')
    last_name = models.CharField(max_length=255, blank=True, default='', verbose_name='Sobrenome')
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, verbose_name='Tipo de Usuário')
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPE_CHOICES, default='free', verbose_name='Tipo de Conta')
    trial_expires_at = models.DateTimeField(null=True, blank=True, verbose_name='Trial Expira Em')
    company_name = models.CharField(max_length=255, blank=True, default='', verbose_name='Nome da Empresa')
    phone = models.CharField(max_length=20, blank=True, default='', verbose_name='Telefone')
    city = models.CharField(max_length=100, blank=True, default='', verbose_name='Cidade')
    state = models.CharField(max_length=2, blank=True, default='', verbose_name='Estado (UF)')
    is_staff = models.BooleanField(default=False, verbose_name='É Funcionario?')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'user_type']

    @property
    def is_trial_expired(self):
        if self.account_type != 'trial' or not self.trial_expires_at:
            return False
        return timezone.now() > self.trial_expires_at

    @property
    def full_name(self):
        if self.last_name:
            return f'{self.name} {self.last_name}'
        return self.name

    def __str__(self):
        return f'{self.full_name} ({self.get_user_type_display()})'
