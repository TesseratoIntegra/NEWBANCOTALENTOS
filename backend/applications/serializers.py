from rest_framework import serializers

from django.utils import timezone

from applications.models import Application, InterviewSchedule
from applications.services.interview_services import create_interview


class ApplicationSerializer(serializers.ModelSerializer):
    """Serializer completo para candidaturas"""

    # Campos relacionados
    candidate_name = serializers.CharField(source='candidate.name', read_only=True)
    candidate_email = serializers.CharField(source='candidate.email', read_only=True)
    candidate_user_id = serializers.IntegerField(source='candidate.id', read_only=True)
    candidate_profile_id = serializers.SerializerMethodField()

    job_id = serializers.ReadOnlyField()
    job_title = serializers.CharField(source='job.title', read_only=True)

    company_name = serializers.CharField(source='job.company.name', read_only=True)

    # Campos calculados
    days_since_application = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()

    # Dados do recrutador que analisou
    reviewed_by_name = serializers.CharField(source='reviewed_by.name', read_only=True)

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = [
            'candidate', 'candidate_user_id', 'candidate_profile_id', 'applied_at', 'reviewed_at', 'reviewed_by',
            'created_at', 'updated_at'
        ]

    def get_candidate_profile_id(self, obj):
        prof = getattr(obj.candidate, 'candidate_profile', None)
        return prof.id if prof else None

    def validate(self, data):
        """Validações customizadas"""
        request = self.context.get('request')
        user = request.user if request else None

        # Candidatos não podem alterar status
        if (self.instance and user and user.user_type == 'candidate' 
            and 'status' in data and data['status'] != self.instance.status):
            raise serializers.ValidationError({
                'status': 'Candidatos não podem alterar o status da candidatura.'
            })

        # Validar pretensão salarial
        if 'salary_expectation' in data and data['salary_expectation'] is not None:
            if data['salary_expectation'] <= 0:
                raise serializers.ValidationError({
                    'salary_expectation': 'Pretensão salarial deve ser maior que zero.'
                })

        return data

    def update(self, instance, validated_data):
        """Atualização com controle de permissões"""
        request = self.context.get('request')
        user = request.user if request else None

        # Se recrutador está alterando status, registra quem fez a alteração
        if (user and user.user_type == 'recruiter' and 'status' in validated_data 
            and validated_data['status'] != instance.status):
            validated_data['reviewed_by'] = user
            validated_data['reviewed_at'] = timezone.now()

        return super().update(instance, validated_data)


class ApplicationCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de candidaturas"""

    class Meta:
        model = Application
        fields = [
            'job', 'name', 'phone', 'state', 'city', 'linkedin', 
            'portfolio', 'resume', 'cover_letter', 'salary_expectation', 
            'observations'
        ]

    def validate(self, data):
        """Validações para criação com mensagens claras e específicas"""
        request = self.context.get('request')
        user = request.user if request else None

        # Validação de autenticação
        if not user or not user.is_authenticated:
            raise serializers.ValidationError({
                'user': 'Você precisa estar logado para se candidatar.'
            })

        # Validação de tipo de usuário
        if user.user_type != 'candidate':
            raise serializers.ValidationError({
                'user': 'Apenas candidatos podem se candidatar a vagas.'
            })

        job = data.get('job')

        # Verificação de candidatura duplicada (mais específica)
        existing_application = Application.objects.filter(candidate=user, job=job).first()
        if existing_application:
            raise serializers.ValidationError({
                'job': f'Você já possui uma candidatura para esta vaga (enviada em {existing_application.applied_at.strftime("%d/%m/%Y às %H:%M")}).'
            })

        # Verificação se a vaga está ativa
        if not job.is_active:
            raise serializers.ValidationError({
                'job': 'Esta vaga não está mais ativa e não aceita novas candidaturas.'
            })

        # Verificação da data de encerramento
        today = timezone.now().date()
        if job.closure < today:
            raise serializers.ValidationError({
                'job': f'Esta vaga encerrou em {job.closure.strftime("%d/%m/%Y")} e não aceita mais candidaturas.'
            })

        return data

    def create(self, validated_data):
        """Criação associando ao usuário logado"""
        request = self.context.get('request')
        validated_data['candidate'] = request.user
        return super().create(validated_data)


class ApplicationListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagem"""

    candidate_name = serializers.CharField(source='candidate.name', read_only=True)
    candidate_user_id = serializers.IntegerField(source='candidate.id', read_only=True)
    candidate_profile_id = serializers.SerializerMethodField()

    job_id = serializers.ReadOnlyField()
    job_title = serializers.CharField(source='job.title', read_only=True)

    company_name = serializers.CharField(source='job.company.name', read_only=True)
    days_since_application = serializers.ReadOnlyField()

    class Meta:
        model = Application
        fields = [
            'id', 'candidate_user_id', 'candidate_profile_id',
            'candidate_name', 'job_id', 'job_title', 'resume', 'company_name',
            'status', 'applied_at', 'days_since_application', 'phone', 'city', 'state'
        ]

    def get_candidate_profile_id(self, obj):
        prof = getattr(obj.candidate, 'candidate_profile', None)
        return prof.id if prof else None


class InterviewScheduleSerializer(serializers.ModelSerializer):
    """Serializer para agendamento de entrevistas"""

    candidate_name = serializers.CharField(source='application.candidate.name', read_only=True)
    job_title = serializers.CharField(source='application.job.title', read_only=True)
    interviewer_name = serializers.CharField(source='interviewer.name', read_only=True)

    class Meta:
        model = InterviewSchedule
        fields = '__all__'
        read_only_fields = ['interviewer', 'created_at', 'updated_at']

    def validate_scheduled_date(self, value):
        """Valida data da entrevista"""
        if value <= timezone.now():
            raise serializers.ValidationError('Data da entrevista deve ser no futuro.')
        return value

    def validate(self, data):
        """Validações gerais"""
        request = self.context.get('request')
        user = request.user if request else None

        if not user or user.user_type != 'recruiter':
            raise serializers.ValidationError({
                'user': 'Apenas recrutadores podem agendar entrevistas.'
            })

        # Verifica se a candidatura pertence à empresa do recrutador
        application = data.get('application')
        if application and user.company != application.job.company:
            raise serializers.ValidationError({
                'application': 'Você não tem permissão para esta candidatura.'
            })

        return data

    def create(self, validated_data):
        """Criação associando ao recrutador logado"""
        request = self.context.get('request')
        validated_data['interviewer'] = request.user
        return create_interview(request, validated_data)


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer específico para atualização de status pelo recrutador"""

    class Meta:
        model = Application
        fields = ['status', 'recruiter_notes']

    def validate(self, data):
        request = self.context.get('request')
        user = request.user if request else None

        if not user or user.user_type != 'recruiter':
            raise serializers.ValidationError({
                'user': 'Apenas recrutadores podem alterar status.'
            })

        # Verifica se a candidatura pertence à empresa do recrutador
        application = self.instance
        if application and user.company != application.job.company:
            raise serializers.ValidationError({
                'application': 'Você não tem permissão para esta candidatura.'
            })

        return data

    def update(self, instance, validated_data):
        """Atualização registrando quem fez a alteração"""
        request = self.context.get('request')
        validated_data['reviewed_by'] = request.user
        validated_data['reviewed_at'] = timezone.now()
        return super().update(instance, validated_data)
