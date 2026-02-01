from datetime import date

from rest_framework import serializers

from candidates.models import (
    CandidateProfile, CandidateEducation, CandidateExperience, 
    CandidateLanguage, CandidateSkill
)


class CandidateEducationSerializer(serializers.ModelSerializer):
    """Serializer para formação acadêmica"""

    class Meta:
        model = CandidateEducation
        fields = '__all__'
        read_only_fields = ['candidate', 'created_at', 'updated_at']

    def validate(self, data):
        """Validações customizadas"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        is_current = data.get('is_current', False)

        # Se não está cursando, deve ter data de fim
        if not is_current and not end_date:
            raise serializers.ValidationError({
                'end_date': 'Data de conclusão é obrigatória se não estiver cursando.'
            })

        # Se está cursando, não deve ter data de fim
        if is_current and end_date:
            raise serializers.ValidationError({
                'end_date': 'Não deve ter data de conclusão se ainda estiver cursando.'
            })

        # Data de início não pode ser no futuro
        if start_date and start_date > date.today():
            raise serializers.ValidationError({
                'start_date': 'Data de início não pode ser no futuro.'
            })

        # Data de fim não pode ser antes do início
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({
                'end_date': 'Data de conclusão não pode ser anterior à data de início.'
            })

        return data


class CandidateExperienceSerializer(serializers.ModelSerializer):
    """Serializer para experiência profissional"""

    class Meta:
        model = CandidateExperience
        fields = '__all__'
        read_only_fields = ['candidate', 'created_at', 'updated_at']

    def validate(self, data):
        """Validações customizadas"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        is_current = data.get('is_current', False)

        # Se não é trabalho atual, deve ter data de saída
        if not is_current and not end_date:
            raise serializers.ValidationError({
                'end_date': 'Data de saída é obrigatória se não for trabalho atual.'
            })

        # Se é trabalho atual, não deve ter data de saída
        if is_current and end_date:
            raise serializers.ValidationError({
                'end_date': 'Não deve ter data de saída se for trabalho atual.'
            })

        # Data de início não pode ser no futuro
        if start_date and start_date > date.today():
            raise serializers.ValidationError({
                'start_date': 'Data de início não pode ser no futuro.'
            })

        # Data de saída não pode ser antes do início
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({
                'end_date': 'Data de saída não pode ser anterior à data de início.'
            })

        return data


class CandidateLanguageSerializer(serializers.ModelSerializer):
    """Serializer para idiomas"""

    class Meta:
        model = CandidateLanguage
        fields = '__all__'
        read_only_fields = ['candidate', 'created_at', 'updated_at']


class CandidateSkillSerializer(serializers.ModelSerializer):
    """Serializer para habilidades"""

    class Meta:
        model = CandidateSkill
        fields = '__all__'
        read_only_fields = ['candidate', 'created_at', 'updated_at']


class CandidateProfileSerializer(serializers.ModelSerializer):
    """Serializer principal do candidato com relacionamentos"""

    # Relacionamentos aninhados
    educations = CandidateEducationSerializer(many=True, read_only=True)
    experiences = CandidateExperienceSerializer(many=True, read_only=True)
    languages = CandidateLanguageSerializer(many=True, read_only=True)
    detailed_skills = CandidateSkillSerializer(many=True, read_only=True)

    # Campos calculados
    age = serializers.ReadOnlyField()
    full_address = serializers.ReadOnlyField()

    # Dados do usuário
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = CandidateProfile
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']

    def validate_date_of_birth(self, value):
        """Valida data de nascimento"""
        if value:
            today = date.today()
            age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))

            if age < 14:
                raise serializers.ValidationError('Idade mínima é 14 anos.')
            if age > 100:
                raise serializers.ValidationError('Idade não pode ser superior a 100 anos.')

        return value

    def validate_cpf(self, value):
        """Valida formato do CPF"""
        if value:
            import re
            # Remove caracteres não numéricos
            numbers_only = re.sub(r'\D', '', value)
            if len(numbers_only) != 11:
                raise serializers.ValidationError('CPF deve ter 11 dígitos.')
        return value

    def validate_zip_code(self, value):
        """Valida formato do CEP"""
        if value:
            import re
            if not re.match(r'^\d{5}-?\d{3}$', value):
                raise serializers.ValidationError('CEP deve estar no formato 00000-000.')
        return value

    def validate(self, data):
        """Validações gerais"""
        # Validar faixa salarial
        salary_min = data.get('desired_salary_min')
        salary_max = data.get('desired_salary_max')

        if salary_min and salary_min <= 0:
            raise serializers.ValidationError({
                'desired_salary_min': 'Salário mínimo deve ser maior que zero.'
            })

        if salary_max and salary_max <= 0:
            raise serializers.ValidationError({
                'desired_salary_max': 'Salário máximo deve ser maior que zero.'
            })

        if salary_min and salary_max and salary_min > salary_max:
            raise serializers.ValidationError({
                'desired_salary_max': 'Salário máximo deve ser maior que o mínimo.'
            })

        return data


class CandidateProfileCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer para criação/atualização do candidato (sem relacionamentos)"""

    class Meta:
        model = CandidateProfile
        exclude = ['user']
        read_only_fields = ['created_at', 'updated_at']

    def validate_date_of_birth(self, value):
        """Valida data de nascimento"""
        if value:
            today = date.today()
            age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))

            if age < 14:
                raise serializers.ValidationError('Idade mínima é 14 anos.')
            if age > 100:
                raise serializers.ValidationError('Idade não pode ser superior a 100 anos.')

        return value


class CandidateProfileListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagem de candidatos"""

    user_id = serializers.IntegerField(source='user.id', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    age = serializers.ReadOnlyField()
    experience_summary = serializers.SerializerMethodField()
    education_summary = serializers.SerializerMethodField()
    applications_count = serializers.SerializerMethodField()
    cpf = serializers.CharField(read_only=True)

    class Meta:
        model = CandidateProfile
        fields = [
            'id', 'user_id', 'user_name', 'user_email', 'cpf', 'current_position', 'current_company',
            'city', 'state', 'image_profile', 'skills', 'professional_summary',
            'age', 'education_level', 'experience_years', 'desired_salary_min',
            'desired_salary_max', 'available_for_work', 'accepts_remote_work',
            'accepts_relocation', 'can_travel',
            'experience_summary', 'education_summary', 'applications_count', 'applications_summary', 'created_at'
        ]

    def get_experience_summary(self, obj):
        """Resumo das experiências"""
        experiences = obj.experiences.filter(is_active=True).order_by('-start_date')[:2]
        return [
            {
                'company': exp.company,
                'position': exp.position,
                'is_current': exp.is_current
            }
            for exp in experiences
        ]

    def get_education_summary(self, obj):
        """Resumo da educação"""
        education = obj.educations.filter(is_active=True).order_by('-start_date').first()
        if education:
            return {
                'course': education.course,
                'institution': education.institution,
                'is_current': education.is_current
            }
        return None

    def get_applications_count(self, obj):
        """Conta candidaturas do usuário"""
        return obj.user.applications.count()

    applications_summary = serializers.SerializerMethodField()

    def get_applications_summary(self, obj):
        """Resumo das candidaturas com dados da vaga"""
        applications = obj.user.applications.select_related('job', 'job__company').order_by('-applied_at')[:5]
        return [
            {
                'id': app.id,
                'job_id': app.job.id,
                'job_title': app.job.title,
                'company_name': app.job.company.name if app.job.company else None,
                'status': app.status,
                'applied_at': app.applied_at.isoformat() if app.applied_at else None
            }
            for app in applications
        ]
