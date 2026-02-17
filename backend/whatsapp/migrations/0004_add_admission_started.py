from django.db import migrations


def add_admission_started(apps, schema_editor):
    WhatsAppTemplate = apps.get_model('whatsapp', 'WhatsAppTemplate')
    WhatsAppTemplate.objects.get_or_create(
        status_event='admission_started',
        defaults={
            'message_template': (
                'Olá {nome}! 📋\n\n'
                'Sua fase de *admissão* foi iniciada no Banco de Talentos.\n\n'
                'Aguarde as próximas orientações do recrutador.\n\n'
                'Equipe Tesserato Integra'
            ),
        },
    )


def remove_admission_started(apps, schema_editor):
    WhatsAppTemplate = apps.get_model('whatsapp', 'WhatsAppTemplate')
    WhatsAppTemplate.objects.filter(status_event='admission_started').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('whatsapp', '0003_alter_whatsapptemplate_message_template'),
    ]

    operations = [
        migrations.RunPython(add_admission_started, remove_admission_started),
    ]
