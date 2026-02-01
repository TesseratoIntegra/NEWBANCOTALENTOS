from rest_framework import serializers
from .models import (
    SelectionProcess,
    ProcessStage,
    StageQuestion,
    CandidateInProcess,
    CandidateStageResponse
)


# ============================================
# STAGE QUESTION SERIALIZERS
# ============================================

class StageQuestionSerializer(serializers.ModelSerializer):
    """Serializer completo para perguntas"""

    class Meta:
        model = StageQuestion
        fields = [
            'id', 'stage', 'question_text', 'question_type',
            'options', 'order', 'is_required', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        """Valida que múltipla escolha tenha opções"""
        question_type = data.get('question_type', getattr(self.instance, 'question_type', None))
        options = data.get('options', getattr(self.instance, 'options', None))

        if question_type == 'multiple_choice':
            if not options or not isinstance(options, list) or len(options) < 2:
                raise serializers.ValidationError({
                    'options': 'Perguntas de múltipla escolha devem ter pelo menos 2 opções.'
                })
        return data


class StageQuestionCreateSerializer(serializers.ModelSerializer):
    """Serializer para criar perguntas"""

    class Meta:
        model = StageQuestion
        fields = ['stage', 'question_text', 'question_type', 'options', 'order', 'is_required']

    def validate(self, data):
        """Valida que múltipla escolha tenha opções"""
        if data.get('question_type') == 'multiple_choice':
            options = data.get('options')
            if not options or not isinstance(options, list) or len(options) < 2:
                raise serializers.ValidationError({
                    'options': 'Perguntas de múltipla escolha devem ter pelo menos 2 opções.'
                })
        return data


# ============================================
# PROCESS STAGE SERIALIZERS
# ============================================

class ProcessStageSerializer(serializers.ModelSerializer):
    """Serializer completo para etapas com perguntas"""
    questions = StageQuestionSerializer(many=True, read_only=True)
    questions_count = serializers.ReadOnlyField()

    class Meta:
        model = ProcessStage
        fields = [
            'id', 'process', 'name', 'description', 'order',
            'is_eliminatory', 'questions_count', 'questions',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ProcessStageListSerializer(serializers.ModelSerializer):
    """Serializer compacto para listagem de etapas"""
    questions_count = serializers.ReadOnlyField()

    class Meta:
        model = ProcessStage
        fields = [
            'id', 'process', 'name', 'order', 'is_eliminatory',
            'questions_count', 'is_active'
        ]


class ProcessStageCreateSerializer(serializers.ModelSerializer):
    """Serializer para criar etapas"""

    class Meta:
        model = ProcessStage
        fields = ['process', 'name', 'description', 'order', 'is_eliminatory']

    def validate(self, data):
        """Valida limite de 8 etapas por processo"""
        process = data.get('process')
        if process:
            existing_count = ProcessStage.objects.filter(
                process=process,
                is_active=True
            ).count()

            # Se está criando (não tem instance) ou está atualizando
            if not self.instance and existing_count >= 8:
                raise serializers.ValidationError({
                    'process': 'O processo já possui o máximo de 8 etapas.'
                })

        return data


# ============================================
# CANDIDATE STAGE RESPONSE SERIALIZERS
# ============================================

class CandidateStageResponseSerializer(serializers.ModelSerializer):
    """Serializer completo para respostas de etapa"""
    stage_name = serializers.CharField(source='stage.name', read_only=True)
    stage_order = serializers.IntegerField(source='stage.order', read_only=True)
    evaluated_by_name = serializers.CharField(source='evaluated_by.name', read_only=True)

    class Meta:
        model = CandidateStageResponse
        fields = [
            'id', 'candidate_in_process', 'stage', 'stage_name', 'stage_order',
            'evaluation', 'answers', 'recruiter_feedback', 'rating',
            'evaluated_by', 'evaluated_by_name', 'evaluated_at',
            'is_completed', 'completed_at',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'evaluated_at', 'completed_at']


class StageEvaluationSerializer(serializers.Serializer):
    """Serializer para avaliar uma etapa"""
    evaluation = serializers.ChoiceField(
        choices=['approved', 'rejected'],
        help_text='Resultado da avaliação'
    )
    answers = serializers.JSONField(
        required=False,
        help_text='Respostas às perguntas {question_id: answer}'
    )
    recruiter_feedback = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text='Feedback do recrutador'
    )
    rating = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=10,
        help_text='Nota de 1 a 10'
    )


# ============================================
# CANDIDATE IN PROCESS SERIALIZERS
# ============================================

class CandidateInProcessSerializer(serializers.ModelSerializer):
    """Serializer completo para candidato no processo"""
    candidate_name = serializers.CharField(source='candidate_profile.user.name', read_only=True)
    candidate_email = serializers.CharField(source='candidate_profile.user.email', read_only=True)
    candidate_image = serializers.ImageField(source='candidate_profile.image_profile', read_only=True)
    current_stage_name = serializers.CharField(source='current_stage.name', read_only=True)
    current_stage_order = serializers.IntegerField(source='current_stage.order', read_only=True)
    added_by_name = serializers.CharField(source='added_by.name', read_only=True)
    stage_responses = CandidateStageResponseSerializer(many=True, read_only=True)
    process_title = serializers.CharField(source='process.title', read_only=True)

    class Meta:
        model = CandidateInProcess
        fields = [
            'id', 'process', 'process_title',
            'candidate_profile', 'candidate_name', 'candidate_email', 'candidate_image',
            'current_stage', 'current_stage_name', 'current_stage_order',
            'status', 'added_by', 'added_by_name', 'added_at',
            'recruiter_notes', 'stage_responses',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['added_at', 'created_at', 'updated_at']


class CandidateInProcessListSerializer(serializers.ModelSerializer):
    """Serializer compacto para listagem"""
    candidate_name = serializers.CharField(source='candidate_profile.user.name', read_only=True)
    candidate_email = serializers.CharField(source='candidate_profile.user.email', read_only=True)
    candidate_image = serializers.ImageField(source='candidate_profile.image_profile', read_only=True)
    current_stage_name = serializers.CharField(source='current_stage.name', read_only=True)
    current_stage_order = serializers.IntegerField(source='current_stage.order', read_only=True)
    average_rating = serializers.SerializerMethodField()
    completed_stages = serializers.SerializerMethodField()
    total_stages = serializers.SerializerMethodField()

    class Meta:
        model = CandidateInProcess
        fields = [
            'id', 'process',
            'candidate_profile', 'candidate_name', 'candidate_email', 'candidate_image',
            'current_stage', 'current_stage_name', 'current_stage_order',
            'status', 'added_at',
            'average_rating', 'completed_stages', 'total_stages'
        ]

    def get_average_rating(self, obj):
        """Média das notas nas etapas"""
        ratings = obj.stage_responses.filter(
            rating__isnull=False, is_active=True
        ).values_list('rating', flat=True)
        if ratings:
            return round(sum(ratings) / len(ratings), 1)
        return None

    def get_completed_stages(self, obj):
        """Quantidade de etapas concluídas"""
        return obj.stage_responses.filter(is_completed=True, is_active=True).count()

    def get_total_stages(self, obj):
        """Total de etapas do processo"""
        return obj.process.stages.filter(is_active=True).count()


class CandidateInProcessCreateSerializer(serializers.ModelSerializer):
    """Serializer para adicionar candidato ao processo"""

    class Meta:
        model = CandidateInProcess
        fields = ['process', 'candidate_profile', 'recruiter_notes']

    def validate_candidate_profile(self, value):
        """Valida que o perfil está aprovado"""
        if value.profile_status != 'approved':
            raise serializers.ValidationError(
                'Apenas candidatos com perfil aprovado podem participar do processo seletivo.'
            )
        return value

    def validate(self, data):
        """Valida que o candidato não está no processo"""
        process = data.get('process')
        candidate_profile = data.get('candidate_profile')

        if CandidateInProcess.objects.filter(
            process=process,
            candidate_profile=candidate_profile,
            is_active=True
        ).exists():
            raise serializers.ValidationError({
                'candidate_profile': 'Este candidato já está participando deste processo seletivo.'
            })

        return data


# ============================================
# SELECTION PROCESS SERIALIZERS
# ============================================

class SelectionProcessSerializer(serializers.ModelSerializer):
    """Serializer completo para processo seletivo"""
    stages = ProcessStageSerializer(many=True, read_only=True)
    stages_count = serializers.ReadOnlyField()
    candidates_count = serializers.ReadOnlyField()
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)

    class Meta:
        model = SelectionProcess
        fields = [
            'id', 'title', 'description',
            'job', 'job_title',
            'company', 'company_name',
            'created_by', 'created_by_name',
            'status', 'start_date', 'end_date',
            'stages_count', 'candidates_count', 'stages',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class SelectionProcessListSerializer(serializers.ModelSerializer):
    """Serializer compacto para listagem"""
    stages_count = serializers.ReadOnlyField()
    candidates_count = serializers.ReadOnlyField()
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)

    # Estatísticas adicionais
    candidates_approved = serializers.SerializerMethodField()
    candidates_rejected = serializers.SerializerMethodField()
    candidates_in_progress = serializers.SerializerMethodField()

    class Meta:
        model = SelectionProcess
        fields = [
            'id', 'title', 'description',
            'job', 'job_title',
            'company', 'company_name',
            'created_by', 'created_by_name',
            'status', 'start_date', 'end_date',
            'stages_count', 'candidates_count',
            'candidates_approved', 'candidates_rejected', 'candidates_in_progress',
            'is_active', 'created_at', 'updated_at'
        ]

    def get_candidates_approved(self, obj):
        return obj.candidates_in_process.filter(status='approved', is_active=True).count()

    def get_candidates_rejected(self, obj):
        return obj.candidates_in_process.filter(status='rejected', is_active=True).count()

    def get_candidates_in_progress(self, obj):
        return obj.candidates_in_process.filter(status='in_progress', is_active=True).count()


class SelectionProcessCreateSerializer(serializers.ModelSerializer):
    """Serializer para criar processo seletivo"""

    class Meta:
        model = SelectionProcess
        fields = ['id', 'title', 'description', 'job', 'status', 'start_date', 'end_date']
        read_only_fields = ['id']

    def validate(self, data):
        """Valida datas"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({
                'end_date': 'A data de término não pode ser anterior à data de início.'
            })

        return data


class AddCandidateSerializer(serializers.Serializer):
    """Serializer para adicionar candidato ao processo"""
    candidate_profile_id = serializers.IntegerField(
        help_text='ID do perfil do candidato (deve estar aprovado)'
    )
    recruiter_notes = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text='Observações iniciais'
    )


class ProcessStatisticsSerializer(serializers.Serializer):
    """Serializer para estatísticas do processo"""
    total_candidates = serializers.IntegerField()
    candidates_by_status = serializers.DictField()
    candidates_by_stage = serializers.ListField()
    average_rating = serializers.FloatField(allow_null=True)
    completion_rate = serializers.FloatField()


class ReorderStagesSerializer(serializers.Serializer):
    """Serializer para reordenar etapas"""
    stage_ids = serializers.ListField(
        child=serializers.IntegerField(),
        help_text='Lista de IDs das etapas na nova ordem'
    )
