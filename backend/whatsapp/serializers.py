from rest_framework import serializers
from whatsapp.models import WhatsAppTemplate


class WhatsAppTemplateSerializer(serializers.ModelSerializer):
    status_event_display = serializers.CharField(
        source='get_status_event_display', read_only=True
    )

    class Meta:
        model = WhatsAppTemplate
        fields = [
            'id', 'status_event', 'status_event_display',
            'message_template', 'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'status_event', 'created_at', 'updated_at']
