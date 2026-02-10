import os
from rest_framework import serializers
from .models import DocumentType, CandidateDocument, AdmissionData


# ============================================
# DOCUMENT TYPE SERIALIZERS
# ============================================

class DocumentTypeSerializer(serializers.ModelSerializer):
    """Serializer completo para tipos de documento."""
    created_by_name = serializers.SerializerMethodField()
    documents_count = serializers.SerializerMethodField()

    class Meta:
        model = DocumentType
        fields = [
            'id', 'name', 'description', 'is_required', 'accepted_formats',
            'max_file_size_mb', 'order', 'created_by', 'created_by_name',
            'documents_count', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by']

    def get_created_by_name(self, obj):
        return obj.created_by.name if obj.created_by else None

    def get_documents_count(self, obj):
        return obj.candidate_documents.filter(is_active=True).count()


class DocumentTypeListSerializer(serializers.ModelSerializer):
    """Serializer compacto para listagem de tipos de documento."""

    class Meta:
        model = DocumentType
        fields = [
            'id', 'name', 'description', 'is_required', 'accepted_formats',
            'max_file_size_mb', 'order', 'is_active'
        ]


class DocumentTypeCreateSerializer(serializers.ModelSerializer):
    """Serializer para criar/editar tipos de documento."""

    class Meta:
        model = DocumentType
        fields = ['name', 'description', 'is_required', 'accepted_formats',
                  'max_file_size_mb', 'order']

    def validate(self, data):
        """Valida limite de 10 tipos de documento ativos."""
        if not self.instance:  # Apenas na criação
            active_count = DocumentType.objects.filter(is_active=True).count()
            if active_count >= 10:
                raise serializers.ValidationError(
                    'Limite máximo de 10 tipos de documento atingido. '
                    'Desative um tipo existente antes de criar um novo.'
                )
        return data

    def validate_accepted_formats(self, value):
        """Valida que os formatos são válidos."""
        allowed = {'pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'bmp', 'gif', 'tiff'}
        formats = [f.strip().lower() for f in value.split(',') if f.strip()]
        if not formats:
            raise serializers.ValidationError('Informe pelo menos um formato.')
        invalid = [f for f in formats if f not in allowed]
        if invalid:
            raise serializers.ValidationError(
                f'Formatos inválidos: {", ".join(invalid)}. '
                f'Permitidos: {", ".join(sorted(allowed))}'
            )
        return ','.join(formats)


# ============================================
# CANDIDATE DOCUMENT SERIALIZERS
# ============================================

class CandidateDocumentSerializer(serializers.ModelSerializer):
    """Serializer completo para documentos do candidato."""
    document_type_name = serializers.SerializerMethodField()
    document_type_data = DocumentTypeListSerializer(source='document_type', read_only=True)
    candidate_name = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = CandidateDocument
        fields = [
            'id', 'candidate', 'document_type', 'document_type_name',
            'document_type_data', 'candidate_name', 'file', 'file_url',
            'original_filename', 'status', 'observations',
            'reviewed_by', 'reviewed_by_name', 'reviewed_at',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'created_at', 'updated_at', 'status', 'observations',
            'reviewed_by', 'reviewed_at', 'candidate'
        ]

    def get_document_type_name(self, obj):
        return obj.document_type.name

    def get_candidate_name(self, obj):
        return obj.candidate.user.name if obj.candidate and obj.candidate.user else None

    def get_reviewed_by_name(self, obj):
        return obj.reviewed_by.name if obj.reviewed_by else None

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class CandidateDocumentListSerializer(serializers.ModelSerializer):
    """Serializer compacto para listagem de documentos."""
    document_type_name = serializers.SerializerMethodField()
    candidate_name = serializers.SerializerMethodField()

    class Meta:
        model = CandidateDocument
        fields = [
            'id', 'candidate', 'document_type', 'document_type_name',
            'candidate_name', 'original_filename', 'status',
            'reviewed_at', 'created_at'
        ]

    def get_document_type_name(self, obj):
        return obj.document_type.name

    def get_candidate_name(self, obj):
        return obj.candidate.user.name if obj.candidate and obj.candidate.user else None


class CandidateDocumentUploadSerializer(serializers.ModelSerializer):
    """Serializer para upload de documento pelo candidato."""

    class Meta:
        model = CandidateDocument
        fields = ['document_type', 'file']

    def validate_file(self, value):
        """Valida formato e tamanho do arquivo."""
        document_type_id = self.initial_data.get('document_type')
        if not document_type_id:
            return value

        try:
            doc_type = DocumentType.objects.get(id=document_type_id, is_active=True)
        except DocumentType.DoesNotExist:
            raise serializers.ValidationError('Tipo de documento inválido ou inativo.')

        # Validar formato
        ext = os.path.splitext(value.name)[1].lower().lstrip('.')
        if ext not in doc_type.accepted_formats_list:
            raise serializers.ValidationError(
                f'Formato ".{ext}" não aceito. '
                f'Formatos permitidos: {", ".join(doc_type.accepted_formats_list)}'
            )

        # Validar tamanho
        max_size = doc_type.max_file_size_mb * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError(
                f'Arquivo muito grande ({value.size / 1024 / 1024:.1f}MB). '
                f'Tamanho máximo: {doc_type.max_file_size_mb}MB.'
            )

        return value

    def validate(self, data):
        """Valida que não há duplicata para o mesmo tipo."""
        candidate = self.context.get('candidate')
        document_type = data.get('document_type')

        if candidate and document_type:
            existing = CandidateDocument.objects.filter(
                candidate=candidate,
                document_type=document_type,
                is_active=True
            ).exclude(pk=getattr(self.instance, 'pk', None))

            if existing.exists():
                existing_doc = existing.first()
                if existing_doc.status != 'rejected':
                    raise serializers.ValidationError(
                        'Já existe um documento enviado para este tipo. '
                        'Você só pode reenviar documentos rejeitados.'
                    )

        return data


class DocumentReviewSerializer(serializers.Serializer):
    """Serializer para recrutador aprovar/rejeitar documento."""
    status = serializers.ChoiceField(choices=['approved', 'rejected'])
    observations = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, data):
        if data['status'] == 'rejected' and not data.get('observations', '').strip():
            raise serializers.ValidationError({
                'observations': 'Informe o motivo da rejeição.'
            })
        return data


# ============================================
# ADMISSION DATA SERIALIZERS
# ============================================

class AdmissionDataSerializer(serializers.ModelSerializer):
    """Serializer completo para leitura dos dados de admissão."""
    candidate_name = serializers.SerializerMethodField()
    candidate_email = serializers.SerializerMethodField()
    filled_by_name = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = AdmissionData
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_candidate_name(self, obj):
        return obj.candidate.user.name if obj.candidate and obj.candidate.user else None

    def get_candidate_email(self, obj):
        return obj.candidate.user.email if obj.candidate and obj.candidate.user else None

    def get_filled_by_name(self, obj):
        return obj.filled_by.name if obj.filled_by else None

    def get_status_display(self, obj):
        return obj.get_status_display()


class AdmissionDataCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer para criação/edição dos dados de admissão.
    Todos os campos são opcionais para permitir saves parciais (rascunho).
    """

    # Override email field to allow blank (ModelSerializer enforces EmailField validation)
    email = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = AdmissionData
        exclude = ['filled_by', 'protheus_response', 'sent_at', 'is_active', 'created_at', 'updated_at']

    def get_fields(self):
        """Torna TODOS os campos opcionais para permitir saves parciais."""
        fields = super().get_fields()
        for field in fields.values():
            field.required = False
        return fields

    def validate(self, data):
        # Se status está sendo mudado para 'completed', validar data_inicio_trabalho
        if data.get('status') == 'completed':
            data_inicio = data.get('data_inicio_trabalho') or (
                self.instance.data_inicio_trabalho if self.instance else None
            )
            if not data_inicio:
                raise serializers.ValidationError({
                    'data_inicio_trabalho': 'Data de início do trabalho é obrigatória para finalizar.'
                })
        return data
