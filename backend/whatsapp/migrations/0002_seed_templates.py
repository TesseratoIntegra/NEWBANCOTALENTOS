from django.db import migrations


DEFAULT_TEMPLATES = [
    {
        'status_event': 'profile_approved',
        'message_template': (
            'Olá {nome}! 🎉\n\n'
            'Seu perfil foi *aprovado* no Banco de Talentos Tesserato.\n\n'
            'Acesse a plataforma para acompanhar as próximas etapas.\n\n'
            'Equipe Tesserato Integra'
        ),
    },
    {
        'status_event': 'profile_rejected',
        'message_template': (
            'Olá {nome},\n\n'
            'Infelizmente, seu perfil não foi aprovado no Banco de Talentos.\n\n'
            'Observações do recrutador:\n{observacoes}\n\n'
            'Agradecemos seu interesse.\n\n'
            'Equipe Tesserato Integra'
        ),
    },
    {
        'status_event': 'profile_changes_requested',
        'message_template': (
            'Olá {nome},\n\n'
            'O recrutador solicitou algumas alterações no seu perfil do Banco de Talentos.\n\n'
            'Observações:\n{observacoes}\n\n'
            'Por favor, acesse a plataforma e atualize as informações solicitadas.\n\n'
            'Equipe Tesserato Integra'
        ),
    },
    {
        'status_event': 'process_added',
        'message_template': (
            'Olá {nome}! 📋\n\n'
            'Você foi adicionado ao processo seletivo: *{processo}*\n\n'
            'Acesse a plataforma para mais detalhes sobre as etapas.\n\n'
            'Equipe Tesserato Integra'
        ),
    },
    {
        'status_event': 'process_approved',
        'message_template': (
            'Olá {nome}! 🎉\n\n'
            'Parabéns! Você foi *aprovado* no processo seletivo: *{processo}*\n\n'
            'Acesse a plataforma para acompanhar os próximos passos.\n\n'
            'Equipe Tesserato Integra'
        ),
    },
    {
        'status_event': 'process_rejected',
        'message_template': (
            'Olá {nome},\n\n'
            'Infelizmente, você não foi aprovado no processo seletivo: *{processo}*\n\n'
            'Agradecemos sua participação e desejamos sucesso.\n\n'
            'Equipe Tesserato Integra'
        ),
    },
    {
        'status_event': 'document_approved',
        'message_template': (
            'Olá {nome},\n\n'
            'Seu documento *{documento}* foi *aprovado* ✅\n\n'
            'Equipe Tesserato Integra'
        ),
    },
    {
        'status_event': 'document_rejected',
        'message_template': (
            'Olá {nome},\n\n'
            'Seu documento *{documento}* foi *rejeitado*.\n\n'
            'Motivo: {observacoes}\n\n'
            'Por favor, acesse a plataforma e reenvie o documento corrigido.\n\n'
            'Equipe Tesserato Integra'
        ),
    },
    {
        'status_event': 'application_in_process',
        'message_template': (
            'Olá {nome},\n\n'
            'Sua candidatura para a vaga *{vaga}* está sendo analisada.\n\n'
            'Acompanhe o andamento pela plataforma.\n\n'
            'Equipe Tesserato Integra'
        ),
    },
    {
        'status_event': 'application_interview',
        'message_template': (
            'Olá {nome}! 📅\n\n'
            'Sua entrevista foi agendada para a vaga *{vaga}*.\n\n'
            'Acesse a plataforma para ver os detalhes.\n\n'
            'Equipe Tesserato Integra'
        ),
    },
    {
        'status_event': 'application_approved',
        'message_template': (
            'Olá {nome}! 🎉\n\n'
            'Parabéns! Sua candidatura para a vaga *{vaga}* foi *aprovada*!\n\n'
            'Acesse a plataforma para as próximas etapas.\n\n'
            'Equipe Tesserato Integra'
        ),
    },
    {
        'status_event': 'application_rejected',
        'message_template': (
            'Olá {nome},\n\n'
            'Infelizmente, sua candidatura para a vaga *{vaga}* não foi aprovada.\n\n'
            'Agradecemos seu interesse e desejamos sucesso.\n\n'
            'Equipe Tesserato Integra'
        ),
    },
    {
        'status_event': 'admission_completed',
        'message_template': (
            'Olá {nome}! 📝\n\n'
            'Seus dados de admissão foram preenchidos com sucesso.\n\n'
            'Sua data de início está prevista para: *{data_inicio}*\n\n'
            'Aguarde a confirmação final.\n\n'
            'Equipe Tesserato Integra'
        ),
    },
    {
        'status_event': 'admission_confirmed',
        'message_template': (
            'Olá {nome}! 🎉\n\n'
            'Sua admissão foi *confirmada*!\n\n'
            'Sua data de início de trabalho é: *{data_inicio}*\n\n'
            'Bem-vindo(a) à equipe Tesserato Integra!\n\n'
            'Equipe Tesserato Integra'
        ),
    },
]


def seed_templates(apps, schema_editor):
    WhatsAppTemplate = apps.get_model('whatsapp', 'WhatsAppTemplate')
    for tmpl in DEFAULT_TEMPLATES:
        WhatsAppTemplate.objects.get_or_create(
            status_event=tmpl['status_event'],
            defaults={'message_template': tmpl['message_template']},
        )


def remove_templates(apps, schema_editor):
    WhatsAppTemplate = apps.get_model('whatsapp', 'WhatsAppTemplate')
    WhatsAppTemplate.objects.filter(
        status_event__in=[t['status_event'] for t in DEFAULT_TEMPLATES]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('whatsapp', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_templates, remove_templates),
    ]
