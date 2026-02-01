from django.contrib import admin
from .models import (
    SelectionProcess,
    ProcessStage,
    StageQuestion,
    CandidateInProcess,
    CandidateStageResponse
)


class ProcessStageInline(admin.TabularInline):
    model = ProcessStage
    extra = 1
    fields = ['name', 'order', 'is_eliminatory', 'is_active']


class StageQuestionInline(admin.TabularInline):
    model = StageQuestion
    extra = 1
    fields = ['question_text', 'question_type', 'order', 'is_required', 'is_active']


class CandidateStageResponseInline(admin.TabularInline):
    model = CandidateStageResponse
    extra = 0
    fields = ['stage', 'evaluation', 'rating', 'is_completed']
    readonly_fields = ['stage']


@admin.register(SelectionProcess)
class SelectionProcessAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'status', 'stages_count', 'candidates_count', 'created_at']
    list_filter = ['status', 'company', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at', 'stages_count', 'candidates_count']
    inlines = [ProcessStageInline]

    fieldsets = (
        ('Informações Básicas', {
            'fields': ('title', 'description', 'status')
        }),
        ('Vínculos', {
            'fields': ('company', 'job', 'created_by')
        }),
        ('Datas', {
            'fields': ('start_date', 'end_date', 'created_at', 'updated_at')
        }),
        ('Estatísticas', {
            'fields': ('stages_count', 'candidates_count'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ProcessStage)
class ProcessStageAdmin(admin.ModelAdmin):
    list_display = ['name', 'process', 'order', 'is_eliminatory', 'questions_count', 'is_active']
    list_filter = ['process', 'is_eliminatory', 'is_active']
    search_fields = ['name', 'description', 'process__title']
    ordering = ['process', 'order']
    inlines = [StageQuestionInline]


@admin.register(StageQuestion)
class StageQuestionAdmin(admin.ModelAdmin):
    list_display = ['question_text_short', 'stage', 'question_type', 'order', 'is_required', 'is_active']
    list_filter = ['question_type', 'is_required', 'stage__process']
    search_fields = ['question_text', 'stage__name']
    ordering = ['stage', 'order']

    def question_text_short(self, obj):
        return obj.question_text[:50] + '...' if len(obj.question_text) > 50 else obj.question_text
    question_text_short.short_description = 'Pergunta'


@admin.register(CandidateInProcess)
class CandidateInProcessAdmin(admin.ModelAdmin):
    list_display = ['candidate_profile', 'process', 'current_stage', 'status', 'added_at']
    list_filter = ['status', 'process', 'current_stage']
    search_fields = ['candidate_profile__user__name', 'candidate_profile__user__email', 'process__title']
    readonly_fields = ['added_at', 'created_at', 'updated_at']
    inlines = [CandidateStageResponseInline]


@admin.register(CandidateStageResponse)
class CandidateStageResponseAdmin(admin.ModelAdmin):
    list_display = ['candidate_in_process', 'stage', 'evaluation', 'rating', 'is_completed', 'evaluated_at']
    list_filter = ['evaluation', 'is_completed', 'stage__process']
    search_fields = ['candidate_in_process__candidate_profile__user__name', 'stage__name']
    readonly_fields = ['created_at', 'updated_at']
