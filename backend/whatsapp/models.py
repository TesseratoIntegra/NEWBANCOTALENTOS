from django.db import models
from app.models import Base


class WhatsAppTemplate(Base):
    """Template de mensagem WhatsApp para cada evento de mudança de status."""

    STATUS_EVENT_CHOICES = [
        # Perfil (pipeline início)
        ('profile_approved', 'Perfil - Aprovado'),
        ('profile_rejected', 'Perfil - Reprovado'),
        ('profile_changes_requested', 'Perfil - Alterações Solicitadas'),
        # Processo Seletivo (pipeline meio)
        ('process_added', 'Processo Seletivo - Candidato Adicionado'),
        ('process_approved', 'Processo Seletivo - Aprovado'),
        ('process_rejected', 'Processo Seletivo - Reprovado'),
        # Documentos (pipeline documentação)
        ('document_approved', 'Documento - Aprovado'),
        ('document_rejected', 'Documento - Rejeitado'),
        # Candidaturas
        ('application_in_process', 'Candidatura - Em Processo'),
        ('application_interview', 'Candidatura - Entrevista Agendada'),
        ('application_approved', 'Candidatura - Aprovada'),
        ('application_rejected', 'Candidatura - Reprovada'),
        # Admissão (pipeline final)
        ('admission_started', 'Admissão - Iniciada'),
        ('admission_completed', 'Admissão - Dados Preenchidos'),
        ('admission_confirmed', 'Admissão - Confirmada'),
    ]

    status_event = models.CharField(
        max_length=40,
        choices=STATUS_EVENT_CHOICES,
        unique=True,
        verbose_name='Evento de Status'
    )
    message_template = models.TextField(
        verbose_name='Template da Mensagem',
        help_text='Variáveis disponíveis: {nome}, {observacoes}, {vaga}, {processo}, {documento}, {data_inicio}'
    )

    class Meta:
        verbose_name = 'Template WhatsApp'
        verbose_name_plural = 'Templates WhatsApp'
        ordering = ['status_event']

    def __str__(self):
        return self.get_status_event_display()
