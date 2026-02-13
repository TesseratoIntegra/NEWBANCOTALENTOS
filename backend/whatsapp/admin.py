from django.contrib import admin
from whatsapp.models import WhatsAppTemplate


@admin.register(WhatsAppTemplate)
class WhatsAppTemplateAdmin(admin.ModelAdmin):
    list_display = ['status_event', 'is_active', 'updated_at']
    list_filter = ['is_active']
    search_fields = ['status_event', 'message_template']
