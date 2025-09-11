from django.db import models
from django.utils.text import slugify

from app.models import Base


class CompanyGroup(Base):
    name = models.CharField(max_length=255, verbose_name='Nome do Grupo')
    description = models.TextField(blank=True, null=True, verbose_name='Descrição')

    class Meta:
        verbose_name = 'Grupo Empresarial'
        verbose_name_plural = 'Grupos Empresariais'

    def __str__(self):
        return self.name


class Company(Base):
    name = models.CharField(max_length=255, verbose_name='Nome da Empresa')
    logo = models.ImageField(upload_to='logo/', null=True, blank=True, verbose_name='Logo')
    cnpj = models.CharField(max_length=18, unique=True, verbose_name='CNPJ')
    slug = models.SlugField(max_length=500, unique=True, verbose_name='Slug')
    group = models.ForeignKey(
        'CompanyGroup',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='companies',
        verbose_name='Grupo Empresarial'
    )

    class Meta:
        verbose_name = 'Empresa'
        verbose_name_plural = 'Empresas'

    def save(self, *args, **kwargs):
        if self.pk:
            old = Company.objects.get(pk=self.pk)
            if old.name != self.name:
                self.slug = slugify(f'{self.name}')
        else:
            self.slug = slugify(f'{self.name}')
        super().save(*args, **kwargs)

    def __str__(self):
        return str(self.name)
