from django.db import models

from app.models import Base


class Occupation(models.Model):
    code = models.CharField(max_length=10, unique=True, verbose_name='Código')
    title = models.CharField(max_length=255, verbose_name='Título')

    class Meta:
        ordering = ['code']
        verbose_name = 'Ocupação'
        verbose_name_plural = 'Ocupações'

    def __str__(self):
        return f'{self.code} - {self.title}'


class SpontaneousApplication(Base):
    name = models.CharField(max_length=255, verbose_name='Nome completo')
    email = models.EmailField(verbose_name='E-mail')
    phone = models.CharField(max_length=20, verbose_name='Telefone')
    city = models.CharField(max_length=100, verbose_name='Cidade')
    state = models.CharField(max_length=100, verbose_name='Estado')
    neighborhood = models.CharField(max_length=100, verbose_name='Bairro')
    number = models.CharField(max_length=20, verbose_name='Número')
    complement = models.CharField(max_length=100, blank=True, null=True, verbose_name='Complemento')

    resume = models.FileField(upload_to='resumes/', verbose_name='Currículo')

    area_1 = models.ForeignKey('spontaneous.Occupation', related_name='occupation_area1', on_delete=models.CASCADE, verbose_name='Área de Atuação 1 (Obrigatória)')
    area_2 = models.ForeignKey('spontaneous.Occupation', related_name='occupation_area2', on_delete=models.CASCADE, blank=True, null=True, verbose_name='Área de Atuação 2')
    area_3 = models.ForeignKey('spontaneous.Occupation', related_name='occupation_area3', on_delete=models.CASCADE, blank=True, null=True, verbose_name='Área de Atuação 3')

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Candidatura Espontânea'
        verbose_name_plural = 'Candidaturas Espontâneas'

    def __str__(self):
        return f'{self.name} ({self.email})'
