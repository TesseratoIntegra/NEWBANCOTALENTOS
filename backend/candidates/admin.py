from django.contrib import admin

from candidates.models import (
    CandidateProfile, CandidateEducation, CandidateExperience, 
    CandidateLanguage, CandidateSkill
)


class CandidateEducationInline(admin.TabularInline):
    model = CandidateEducation
    extra = 1
    fields = ['institution', 'course', 'degree', 'start_date', 'end_date', 'is_current']


class CandidateExperienceInline(admin.TabularInline):
    model = CandidateExperience
    extra = 1
    fields = ['company', 'position', 'start_date', 'end_date', 'is_current']


class CandidateLanguageInline(admin.TabularInline):
    model = CandidateLanguage
    extra = 1


class CandidateSkillInline(admin.TabularInline):
    model = CandidateSkill
    extra = 1


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'current_position', 'current_company', 'education_level', 
        'experience_years', 'available_for_work', 'created_at'
    ]
    list_filter = [
        'education_level', 'available_for_work', 'accepts_remote_work', 
        'can_travel', 'accepts_relocation', 'preferred_work_shift'
    ]
    search_fields = [
        'user__name', 'user__email', 'current_position', 'current_company', 
        'skills', 'professional_summary'
    ]
    readonly_fields = ['created_at', 'updated_at', 'age', 'full_address']

    fieldsets = (
        ('Usuário', {
            'fields': ('user',)
        }),
        ('Dados Pessoais', {
            'fields': (
                'cpf', 'date_of_birth', 'gender', 'phone_secondary'
            )
        }),
        ('Endereço', {
            'fields': (
                'zip_code', 'street', 'number', 'complement', 'neighborhood'
            )
        }),
        ('Dados Profissionais', {
            'fields': (
                'current_position', 'current_company', 'education_level', 
                'experience_years', 'desired_salary_min', 'desired_salary_max'
            )
        }),
        ('Perfil Profissional', {
            'fields': (
                'professional_summary', 'skills', 'certifications'
            )
        }),
        ('Links Profissionais', {
            'fields': (
                'linkedin_url', 'github_url', 'portfolio_url'
            )
        }),
        ('Preferências de Trabalho', {
            'fields': (
                'available_for_work', 'can_travel', 'accepts_remote_work', 
                'accepts_relocation', 'preferred_work_shift'
            )
        }),
        ('Campos Calculados', {
            'fields': ('age', 'full_address'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    inlines = [CandidateEducationInline, CandidateExperienceInline, CandidateLanguageInline, CandidateSkillInline]

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(CandidateEducation)
class CandidateEducationAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'institution', 'course', 'degree', 'start_date', 'end_date', 'is_current']
    list_filter = ['degree', 'is_current', 'start_date']
    search_fields = ['candidate__user__name', 'institution', 'course']
    autocomplete_fields = ['candidate']
    ordering = ['-start_date']


@admin.register(CandidateExperience)
class CandidateExperienceAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'company', 'position', 'start_date', 'end_date', 'is_current']
    list_filter = ['is_current', 'start_date']
    search_fields = ['candidate__user__name', 'company', 'position']
    autocomplete_fields = ['candidate']
    ordering = ['-start_date']


@admin.register(CandidateLanguage)
class CandidateLanguageAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'language', 'proficiency', 'has_certificate']
    list_filter = ['proficiency', 'has_certificate']
    search_fields = ['candidate__user__name', 'language']
    autocomplete_fields = ['candidate']


@admin.register(CandidateSkill)
class CandidateSkillAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'skill_name', 'level', 'years_experience']
    list_filter = ['level', 'years_experience']
    search_fields = ['candidate__user__name', 'skill_name']
    autocomplete_fields = ['candidate']
