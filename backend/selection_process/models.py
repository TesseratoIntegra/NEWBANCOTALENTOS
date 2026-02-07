from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from app.models import Base


class SelectionProcess(Base):
    """Processo Seletivo - entidade principal"""

    STATUS_CHOICES = [
        ('draft', 'Rascunho'),
        ('active', 'Ativo'),
        ('paused', 'Pausado'),
        ('completed', 'Concluído'),
        ('cancelled', 'Cancelado'),
    ]

    title = models.CharField(
        max_length=255,
        verbose_name='Título do Processo'
    )
    description = models.TextField(
        blank=True,
        verbose_name='Descrição'
    )

    # Vínculo opcional com vaga
    job = models.ForeignKey(
        'jobs.Job',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='selection_processes',
        verbose_name='Vaga Vinculada'
    )

    # Empresa dona do processo (opcional)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='selection_processes',
        verbose_name='Empresa'
    )

    # Criador do processo
    created_by = models.ForeignKey(
        'accounts.UserProfile',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_selection_processes',
        verbose_name='Criado Por'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name='Status'
    )

    # Datas de controle
    start_date = models.DateField(
        blank=True,
        null=True,
        verbose_name='Data de Início'
    )
    end_date = models.DateField(
        blank=True,
        null=True,
        verbose_name='Data de Término'
    )

    class Meta:
        verbose_name = 'Processo Seletivo'
        verbose_name_plural = 'Processos Seletivos'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title}'

    @property
    def stages_count(self):
        """Quantidade de etapas ativas"""
        return self.stages.filter(is_active=True).count()

    @property
    def candidates_count(self):
        """Quantidade de candidatos ativos no processo"""
        return self.candidates_in_process.filter(is_active=True).count()


class ProcessStage(Base):
    """Etapa do processo seletivo (1-8 etapas por processo)"""

    process = models.ForeignKey(
        SelectionProcess,
        on_delete=models.CASCADE,
        related_name='stages',
        verbose_name='Processo Seletivo'
    )

    name = models.CharField(
        max_length=255,
        verbose_name='Nome da Etapa'
    )
    description = models.TextField(
        blank=True,
        verbose_name='Descrição'
    )

    # Ordenação (1-8)
    order = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(8)],
        verbose_name='Ordem'
    )

    # Configurações da etapa
    is_eliminatory = models.BooleanField(
        default=True,
        verbose_name='Etapa Eliminatória',
        help_text='Se marcado, reprovação nesta etapa elimina o candidato do processo'
    )

    class Meta:
        verbose_name = 'Etapa do Processo'
        verbose_name_plural = 'Etapas do Processo'
        ordering = ['process', 'order']
        unique_together = [['process', 'order']]

    def __str__(self):
        return f'{self.process.title} - Etapa {self.order}: {self.name}'

    @property
    def questions_count(self):
        """Quantidade de perguntas ativas"""
        return self.questions.filter(is_active=True).count()


class StageQuestion(Base):
    """Pergunta dentro de uma etapa (múltipla escolha ou texto aberto)"""

    QUESTION_TYPE_CHOICES = [
        ('multiple_choice', 'Múltipla Escolha'),
        ('open_text', 'Texto Aberto'),
    ]

    stage = models.ForeignKey(
        ProcessStage,
        on_delete=models.CASCADE,
        related_name='questions',
        verbose_name='Etapa'
    )

    question_text = models.TextField(
        verbose_name='Texto da Pergunta'
    )

    question_type = models.CharField(
        max_length=20,
        choices=QUESTION_TYPE_CHOICES,
        verbose_name='Tipo de Pergunta'
    )

    # Opções para múltipla escolha (armazenadas como JSON)
    options = models.JSONField(
        blank=True,
        null=True,
        verbose_name='Opções (para múltipla escolha)',
        help_text='Lista de opções em formato JSON: ["Opção 1", "Opção 2", ...]'
    )

    order = models.PositiveIntegerField(
        default=1,
        verbose_name='Ordem'
    )

    is_required = models.BooleanField(
        default=True,
        verbose_name='Obrigatória'
    )

    class Meta:
        verbose_name = 'Pergunta da Etapa'
        verbose_name_plural = 'Perguntas das Etapas'
        ordering = ['stage', 'order']

    def __str__(self):
        return f'{self.stage.name} - Pergunta {self.order}'


class CandidateInProcess(Base):
    """Candidato participando de um processo seletivo"""

    STATUS_CHOICES = [
        ('pending', 'Aguardando Início'),
        ('in_progress', 'Em Andamento'),
        ('approved', 'Aprovado'),
        ('rejected', 'Reprovado'),
        ('withdrawn', 'Desistente'),
    ]

    process = models.ForeignKey(
        SelectionProcess,
        on_delete=models.CASCADE,
        related_name='candidates_in_process',
        verbose_name='Processo Seletivo'
    )

    # Vínculo com perfil do candidato (somente aprovados podem participar)
    candidate_profile = models.ForeignKey(
        'candidates.CandidateProfile',
        on_delete=models.CASCADE,
        related_name='selection_processes',
        verbose_name='Perfil do Candidato'
    )

    # Etapa atual do candidato
    current_stage = models.ForeignKey(
        ProcessStage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='current_candidates',
        verbose_name='Etapa Atual'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='Status'
    )

    # Quem adicionou o candidato
    added_by = models.ForeignKey(
        'accounts.UserProfile',
        on_delete=models.SET_NULL,
        null=True,
        related_name='added_candidates_to_process',
        verbose_name='Adicionado Por'
    )
    added_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Adicionado Em'
    )

    # Observações do recrutador sobre o candidato
    recruiter_notes = models.TextField(
        blank=True,
        verbose_name='Observações do Recrutador'
    )

    class Meta:
        verbose_name = 'Candidato no Processo'
        verbose_name_plural = 'Candidatos no Processo'
        unique_together = [['process', 'candidate_profile']]
        ordering = ['process', '-added_at']

    def __str__(self):
        return f'{self.candidate_profile.user.name} - {self.process.title}'


class CandidateStageResponse(Base):
    """Avaliação/resposta do recrutador para cada etapa do candidato"""

    EVALUATION_CHOICES = [
        ('pending', 'Pendente'),
        ('approved', 'Aprovado na Etapa'),
        ('rejected', 'Reprovado na Etapa'),
    ]

    candidate_in_process = models.ForeignKey(
        CandidateInProcess,
        on_delete=models.CASCADE,
        related_name='stage_responses',
        verbose_name='Candidato no Processo'
    )

    stage = models.ForeignKey(
        ProcessStage,
        on_delete=models.CASCADE,
        related_name='candidate_responses',
        verbose_name='Etapa'
    )

    # Avaliação do recrutador
    evaluation = models.CharField(
        max_length=20,
        choices=EVALUATION_CHOICES,
        default='pending',
        verbose_name='Avaliação'
    )

    # Respostas às perguntas (armazenadas como JSON: {question_id: answer})
    answers = models.JSONField(
        blank=True,
        null=True,
        verbose_name='Respostas às Perguntas',
        help_text='JSON com question_id: answer'
    )

    # Feedback interno do recrutador
    recruiter_feedback = models.TextField(
        blank=True,
        verbose_name='Feedback do Recrutador'
    )

    # Nota opcional (1-10)
    rating = models.PositiveIntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        verbose_name='Nota (1-10)'
    )

    # Quem avaliou
    evaluated_by = models.ForeignKey(
        'accounts.UserProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stage_evaluations',
        verbose_name='Avaliado Por'
    )
    evaluated_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Avaliado Em'
    )

    # Flag de conclusão da etapa
    is_completed = models.BooleanField(
        default=False,
        verbose_name='Etapa Concluída'
    )
    completed_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Concluída Em'
    )

    class Meta:
        verbose_name = 'Resposta do Candidato na Etapa'
        verbose_name_plural = 'Respostas dos Candidatos nas Etapas'
        unique_together = [['candidate_in_process', 'stage']]
        ordering = ['candidate_in_process', 'stage__order']

    def __str__(self):
        return f'{self.candidate_in_process.candidate_profile.user.name} - {self.stage.name}'


class ProcessTemplate(Base):
    """Modelo reutilizável de processo seletivo (etapas + perguntas pré-configuradas)"""

    name = models.CharField(
        max_length=255,
        verbose_name='Nome do Modelo'
    )
    description = models.TextField(
        blank=True,
        default='',
        verbose_name='Descrição'
    )

    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='process_templates',
        verbose_name='Empresa'
    )

    created_by = models.ForeignKey(
        'accounts.UserProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_process_templates',
        verbose_name='Criado Por'
    )

    class Meta:
        verbose_name = 'Modelo de Processo'
        verbose_name_plural = 'Modelos de Processos'
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def stages_count(self):
        return self.stages.filter(is_active=True).count()


class TemplateStage(Base):
    """Etapa dentro de um modelo de processo"""

    template = models.ForeignKey(
        ProcessTemplate,
        on_delete=models.CASCADE,
        related_name='stages',
        verbose_name='Modelo'
    )

    name = models.CharField(
        max_length=255,
        verbose_name='Nome da Etapa'
    )
    description = models.TextField(
        blank=True,
        default='',
        verbose_name='Descrição'
    )

    order = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(8)],
        verbose_name='Ordem'
    )

    is_eliminatory = models.BooleanField(
        default=True,
        verbose_name='Etapa Eliminatória'
    )

    class Meta:
        verbose_name = 'Etapa do Modelo'
        verbose_name_plural = 'Etapas do Modelo'
        ordering = ['template', 'order']
        unique_together = [['template', 'order']]

    def __str__(self):
        return f'{self.template.name} - Etapa {self.order}: {self.name}'

    @property
    def questions_count(self):
        return self.questions.filter(is_active=True).count()


class TemplateStageQuestion(Base):
    """Pergunta dentro de uma etapa do modelo"""

    QUESTION_TYPE_CHOICES = [
        ('multiple_choice', 'Múltipla Escolha'),
        ('open_text', 'Texto Aberto'),
    ]

    template_stage = models.ForeignKey(
        TemplateStage,
        on_delete=models.CASCADE,
        related_name='questions',
        verbose_name='Etapa do Modelo'
    )

    question_text = models.TextField(
        verbose_name='Texto da Pergunta'
    )

    question_type = models.CharField(
        max_length=20,
        choices=QUESTION_TYPE_CHOICES,
        verbose_name='Tipo de Pergunta'
    )

    options = models.JSONField(
        blank=True,
        null=True,
        verbose_name='Opções (para múltipla escolha)'
    )

    order = models.PositiveIntegerField(
        default=1,
        verbose_name='Ordem'
    )

    is_required = models.BooleanField(
        default=True,
        verbose_name='Obrigatória'
    )

    class Meta:
        verbose_name = 'Pergunta do Modelo'
        verbose_name_plural = 'Perguntas do Modelo'
        ordering = ['template_stage', 'order']

    def __str__(self):
        return f'{self.template_stage.name} - Pergunta {self.order}'
