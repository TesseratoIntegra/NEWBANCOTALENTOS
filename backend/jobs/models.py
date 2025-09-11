from django.db import models
from django.utils.text import slugify

from app.models import Base


class Job(Base):
    JOB_TYPE_CHOICES = [
        ('full_time', 'Tempo Integral'),
        ('part_time', 'Meio Período'),
        ('internship', 'Estágio'),
        ('contract', 'Contrato Temporário'),
    ]

    JOB_TYPE_MODELS = [
        ('in_person', 'Presencial'),
        ('home_office', 'Home Office'),
        ('hybrid', 'Hibrido'),
    ]

    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='jobs',
        verbose_name='Empresa'
    )
    type_models = models.CharField(
        max_length=20,
        choices=JOB_TYPE_MODELS,
        verbose_name='Tipo de Modelo'
    )
    title = models.CharField(max_length=255, verbose_name='Título da Vaga')
    description = models.TextField(verbose_name='Descrição')
    location = models.CharField(max_length=255, verbose_name='Localização')
    job_type = models.CharField(
        max_length=20,
        choices=JOB_TYPE_CHOICES,
        verbose_name='Tipo de Contrato'
    )
    salary_range = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Faixa Salarial'
    )
    requirements = models.TextField(verbose_name='Requisitos')
    responsibilities = models.TextField(verbose_name='Responsabilidades')
    closure = models.DateField(verbose_name='Encerramento da Vaga')
    slug = models.SlugField(max_length=500, unique=True, verbose_name='Slug')

    class Meta:
        verbose_name = 'Vaga'
        verbose_name_plural = 'Vagas'

    def save(self, *args, **kwargs):
        if self.pk:
            old = Job.objects.get(pk=self.pk)
            if old.title != self.title or old.company_id != self.company_id:
                self.slug = slugify(f'{self.title} - {self.company.name}')
        else:
            self.slug = slugify(f'{self.title} - {self.company.name}')
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.title} - {self.company.name}'
