from django.db import models
from django.utils import timezone

from app.models import Base


class Application(Base):
    """Candidatura a uma vaga específica"""
    VACANCY_STATUS = [
        ('submitted', 'Em análise'),
        ('in_process', 'Em processo seletivo'),
        ('interview_scheduled', 'Entrevista agendada'),
        ('approved', 'Aprovado'),
        ('rejected', 'Reprovado'),
        ('withdrawn', 'Retirado pelo candidato'),
    ]

    candidate = models.ForeignKey(
        'accounts.UserProfile',
        on_delete=models.CASCADE,
        related_name='applications',
        verbose_name='Candidato'
    )
    job = models.ForeignKey(
        'jobs.Job',
        on_delete=models.CASCADE,
        related_name='applications',
        verbose_name='Vaga'
    )

    # Dados básicos
    name = models.CharField(max_length=500, verbose_name='Nome')
    phone = models.CharField(max_length=20, verbose_name='Telefone')
    state = models.CharField(max_length=2, verbose_name='Estado')
    city = models.CharField(max_length=255, verbose_name='Cidade')

    # Links e arquivos
    linkedin = models.URLField(blank=True, null=True, verbose_name='LinkedIn')
    portfolio = models.URLField(blank=True, null=True, verbose_name='Portfólio')
    resume = models.FileField(upload_to='resumes/', verbose_name='Currículo')

    # Status e controle
    status = models.CharField(
        max_length=25,
        choices=VACANCY_STATUS,
        default='submitted',
        verbose_name='Status da Candidatura'
    )
    observations = models.TextField(blank=True, null=True, verbose_name='Observações')

    # Campos para melhor controle
    cover_letter = models.TextField(blank=True, verbose_name='Carta de Apresentação')
    salary_expectation = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Pretensão Salarial'
    )

    # Timestamps específicos
    applied_at = models.DateTimeField(auto_now_add=True, verbose_name='Data da Candidatura')
    reviewed_at = models.DateTimeField(blank=True, null=True, verbose_name='Data da Análise')

    # Feedback do recrutador
    recruiter_notes = models.TextField(blank=True, verbose_name='Observações do Recrutador')
    reviewed_by = models.ForeignKey(
        'accounts.UserProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_applications',
        verbose_name='Analisado por'
    )

    class Meta:
        verbose_name = 'Candidatura'
        verbose_name_plural = 'Candidaturas'
        unique_together = ('candidate', 'job')
        ordering = ['-applied_at']

    def __str__(self):
        return f'{self.candidate.name} - {self.job.title}'

    def save(self, *args, **kwargs):
        # Atualiza timestamp quando status muda
        if self.pk:
            old_instance = Application.objects.get(pk=self.pk)
            if old_instance.status != self.status:
                self.reviewed_at = timezone.now()
        super().save(*args, **kwargs)

    @property
    def is_active(self):
        """Verifica se a candidatura ainda está ativa"""
        return self.status not in ['approved', 'rejected', 'withdrawn']

    @property
    def days_since_application(self):
        """Retorna quantos dias desde a candidatura"""
        return (timezone.now() - self.applied_at).days


class InterviewSchedule(Base):
    """Agendamento de entrevistas para candidaturas"""
    INTERVIEW_TYPE_CHOICES = [
        ('phone', 'Telefônica'),
        ('video', 'Videochamada'),
        ('in_person', 'Presencial'),
        ('online_test', 'Teste Online'),
    ]

    STATUS_CHOICES = [
        ('scheduled', 'Agendada'),
        ('confirmed', 'Confirmada'),
        ('completed', 'Realizada'),
        ('cancelled', 'Cancelada'),
        ('rescheduled', 'Reagendada'),
    ]

    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name='interviews',
        verbose_name='Candidatura'
    )
    interview_type = models.CharField(
        max_length=20,
        choices=INTERVIEW_TYPE_CHOICES,
        verbose_name='Tipo de Entrevista'
    )
    scheduled_date = models.DateTimeField(verbose_name='Data Agendada')
    duration_minutes = models.PositiveIntegerField(default=60, verbose_name='Duração (minutos)')
    location = models.CharField(max_length=500, blank=True, verbose_name='Local/Link')

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled',
        verbose_name='Status'
    )

    # Participantes
    interviewer = models.ForeignKey(
        'accounts.UserProfile',
        on_delete=models.CASCADE,
        related_name='conducted_interviews',
        verbose_name='Entrevistador'
    )

    # Observações e feedback
    notes = models.TextField(blank=True, verbose_name='Observações')
    feedback = models.TextField(blank=True, verbose_name='Feedback da Entrevista')

    # Avaliação
    rating = models.PositiveIntegerField(
        blank=True,
        null=True,
        choices=[(i, str(i)) for i in range(1, 6)],
        verbose_name='Avaliação (1-5)'
    )

    class Meta:
        verbose_name = 'Entrevista'
        verbose_name_plural = 'Entrevistas'
        ordering = ['scheduled_date']

    def __str__(self):
        return f"Entrevista - {self.application.candidate.name} ({self.scheduled_date.strftime('%d/%m/%Y %H:%M')})"
