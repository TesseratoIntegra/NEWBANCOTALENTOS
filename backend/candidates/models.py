from django.db import models
from django.core.validators import MaxValueValidator
from django.utils.translation import gettext_lazy as _

from app.models import Base
from app.utils import UniqueFilePathGenerator


class CandidateProfile(Base):
    """Perfil detalhado do candidato - complementa o UserProfile"""

    GENDER_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Feminino'),
        ('O', 'Outro'),
        ('N', 'Prefiro não informar'),
    ]

    EDUCATION_LEVEL_CHOICES = [
        ('fundamental', 'Ensino Fundamental'),
        ('medio', 'Ensino Médio'),
        ('tecnico', 'Técnico'),
        ('superior', 'Superior'),
        ('pos_graduacao', 'Pós-graduação'),
        ('mestrado', 'Mestrado'),
        ('doutorado', 'Doutorado'),
    ]

    PROFILE_STATUS_CHOICES = [
        ('pending', 'Em análise'),
        ('awaiting_review', 'Aguardando Revisão'),
        ('approved', 'Aprovado'),
        ('rejected', 'Reprovado'),
        ('changes_requested', 'Aguardando Candidato'),
    ]

    user = models.OneToOneField(
        'accounts.UserProfile',
        on_delete=models.CASCADE,
        related_name='candidate_profile',
        verbose_name='Usuário'
    )
    
    # Dados pessoais expandidos
    image_profile = models.ImageField(upload_to=UniqueFilePathGenerator('image_profile'), blank=True, verbose_name='Foto de Perfil')
    cpf = models.CharField(max_length=14, blank=True, unique=True, verbose_name='CPF')
    date_of_birth = models.DateField(blank=True, null=True, verbose_name='Data de Nascimento')
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, verbose_name='Gênero')
    phone_secondary = models.CharField(max_length=20, blank=True, verbose_name='Telefone Secundário')
    
    # Endereço completo
    city = models.CharField(max_length=500, verbose_name='Cidade')
    state = models.CharField(max_length=2, verbose_name='Estado')
    zip_code = models.CharField(max_length=10, blank=True, verbose_name='CEP')
    street = models.CharField(max_length=255, blank=True, verbose_name='Rua')
    number = models.CharField(max_length=10, blank=True, verbose_name='Número')
    complement = models.CharField(max_length=100, blank=True, verbose_name='Complemento')
    neighborhood = models.CharField(max_length=100, blank=True, verbose_name='Bairro')
    
    # Dados profissionais
    current_position = models.CharField(max_length=255, blank=True, verbose_name='Cargo Atual')
    current_company = models.CharField(max_length=255, blank=True, verbose_name='Empresa Atual')
    education_level = models.CharField(
        max_length=20, 
        choices=EDUCATION_LEVEL_CHOICES, 
        blank=True, 
        verbose_name='Nível de Escolaridade'
    )
    experience_years = models.PositiveIntegerField(
        blank=True, 
        null=True,
        validators=[MaxValueValidator(50)],
        verbose_name='Anos de Experiência'
    )
    desired_salary_min = models.CharField(
        max_length=13,
        blank=True, 
        null=True,
        verbose_name='Pretensão Salarial Mínima'
    )
    desired_salary_max = models.CharField(
        max_length=13,
        blank=True,
        null=True,
        verbose_name='Pretensão Salarial Máxima'
    )

    # Textos livres
    professional_summary = models.TextField(blank=True, verbose_name='Resumo Profissional')
    skills = models.TextField(blank=True, verbose_name='Habilidades e Competências')
    certifications = models.TextField(blank=True, verbose_name='Certificações')
    
    # Links profissionais
    linkedin_url = models.URLField(blank=True, verbose_name='LinkedIn')
    github_url = models.URLField(blank=True, verbose_name='GitHub')
    portfolio_url = models.URLField(blank=True, verbose_name='Portfólio')

    # Preferências de trabalho
    available_for_work = models.BooleanField(default=True, verbose_name='Disponível para Trabalho')
    can_travel = models.BooleanField(default=False, verbose_name='Disponível para Viagens')
    accepts_remote_work = models.BooleanField(default=True, verbose_name='Aceita Trabalho Remoto')
    accepts_relocation = models.BooleanField(default=False, verbose_name='Aceita Mudança de Cidade')

    # Dados adicionais
    preferred_work_shift = models.CharField(
        max_length=20,
        choices=[
            ('morning', 'Manhã'),
            ('afternoon', 'Tarde'),
            ('night', 'Noite'),
            ('flexible', 'Flexível'),
        ],
        default='flexible',
        verbose_name='Turno Preferido'
    )
    has_vehicle = models.BooleanField(default=False, verbose_name='Possui Veículo')
    has_cnh = models.BooleanField(default=False, verbose_name='Possui CNH')
    accepts_whatsapp = models.BooleanField(default=True, verbose_name='Aceita mensagens via WhatsApp')

    # Contato de emergência
    emergency_contact_name = models.CharField(max_length=255, blank=True, verbose_name='Nome do Contato de Emergência')
    emergency_contact_phone = models.CharField(max_length=20, blank=True, verbose_name='Telefone do Contato de Emergência')

    # Status do perfil (processo seletivo)
    profile_status = models.CharField(
        max_length=20,
        choices=PROFILE_STATUS_CHOICES,
        default='pending',
        verbose_name='Status do Perfil'
    )
    profile_observations = models.TextField(
        blank=True,
        verbose_name='Observações do Recrutador'
    )
    profile_reviewed_by = models.ForeignKey(
        'accounts.UserProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='profiles_reviewed',
        verbose_name='Revisado por'
    )
    profile_reviewed_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Data da Revisão'
    )
    pending_observation_sections = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Seções pendentes de edição'
    )

    class Meta:
        verbose_name = 'Perfil do Candidato'
        verbose_name_plural = 'Perfis dos Candidatos'

    def __str__(self):
        return f"Perfil de {self.user.name}"

    @property
    def full_address(self):
        """Retorna o endereço completo formatado"""
        address_parts = [
            self.street,
            self.number,
            self.complement,
            self.neighborhood,
        ]
        return ', '.join([part for part in address_parts if part])

    @property
    def age(self):
        """Calcula a idade baseada na data de nascimento"""
        if self.date_of_birth:
            from datetime import date
            today = date.today()
            return today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        return None


class CandidateEducation(Base):
    """Formação acadêmica do candidato"""
    
    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='educations',
        verbose_name='Candidato'
    )
    institution = models.CharField(max_length=255, verbose_name='Instituição')
    course = models.CharField(max_length=255, verbose_name='Curso')
    degree = models.CharField(max_length=100, verbose_name='Grau')
    start_date = models.DateField(verbose_name='Data de Início')
    end_date = models.DateField(blank=True, null=True, verbose_name='Data de Conclusão')
    is_current = models.BooleanField(default=False, verbose_name='Está Cursando')
    description = models.TextField(blank=True, verbose_name='Descrição')
    file = models.FileField(upload_to=UniqueFilePathGenerator('file_education'), blank=True, verbose_name='Certificado')

    class Meta:
        verbose_name = 'Formação Acadêmica'
        verbose_name_plural = 'Formações Acadêmicas'
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.course} - {self.institution}"


class CandidateExperience(Base):
    """Experiência profissional do candidato"""
    
    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='experiences',
        verbose_name='Candidato'
    )
    company = models.CharField(max_length=255, verbose_name='Empresa')
    position = models.CharField(max_length=255, verbose_name='Cargo')
    start_date = models.DateField(verbose_name='Data de Início')
    end_date = models.DateField(blank=True, null=True, verbose_name='Data de Saída')
    is_current = models.BooleanField(default=False, verbose_name='Trabalho Atual')
    description = models.TextField(verbose_name='Descrição das Atividades')
    achievements = models.TextField(blank=True, verbose_name='Principais Conquistas')
    salary = models.CharField(
        max_length=13,
        blank=True,
        null=True,
        verbose_name='Salário'
    )

    class Meta:
        verbose_name = 'Experiência Profissional'
        verbose_name_plural = 'Experiências Profissionais'
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.position} - {self.company}"


class CandidateLanguage(Base):
    """Idiomas do candidato"""

    PROFICIENCY_CHOICES = [
        ('basic', 'Básico'),
        ('intermediate', 'Intermediário'),
        ('advanced', 'Avançado'),
        ('fluent', 'Fluente'),
        ('native', 'Nativo'),
    ]

    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='languages',
        verbose_name='Candidato'
    )
    language = models.CharField(max_length=100, verbose_name='Idioma')
    proficiency = models.CharField(
        max_length=20,
        choices=PROFICIENCY_CHOICES,
        verbose_name='Nível de Proficiência'
    )
    has_certificate = models.BooleanField(default=False, verbose_name='Possui Certificado')
    certificate_name = models.CharField(max_length=255, blank=True, verbose_name='Nome do Certificado')

    class Meta:
        verbose_name = 'Idioma'
        verbose_name_plural = 'Idiomas'
        unique_together = ['candidate', 'language']

    def __str__(self):
        return f"{self.language} - {self.get_proficiency_display()}"


class CandidateSkill(Base):
    """Habilidades específicas do candidato"""
    
    SKILL_LEVEL_CHOICES = [
        ('beginner', 'Iniciante'),
        ('intermediate', 'Intermediário'),
        ('advanced', 'Avançado'),
        ('expert', 'Especialista'),
    ]

    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='detailed_skills',
        verbose_name='Candidato'
    )
    skill_name = models.CharField(max_length=100, verbose_name='Nome da Habilidade')
    level = models.CharField(
        max_length=20,
        choices=SKILL_LEVEL_CHOICES,
        verbose_name='Nível'
    )
    years_experience = models.PositiveIntegerField(
        blank=True, 
        null=True,
        validators=[MaxValueValidator(50)],
        verbose_name='Anos de Experiência'
    )

    class Meta:
        verbose_name = 'Habilidade'
        verbose_name_plural = 'Habilidades'
        unique_together = ['candidate', 'skill_name']

    def __str__(self):
        return f"{self.skill_name} - {self.get_level_display()}"
