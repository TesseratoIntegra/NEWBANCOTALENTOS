from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='WhatsAppTemplate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_active', models.BooleanField(default=True, verbose_name='Está Ativo?')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Criado Em')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Atualizado Em')),
                ('status_event', models.CharField(
                    choices=[
                        ('profile_approved', 'Perfil - Aprovado'),
                        ('profile_rejected', 'Perfil - Reprovado'),
                        ('profile_changes_requested', 'Perfil - Alterações Solicitadas'),
                        ('process_added', 'Processo Seletivo - Candidato Adicionado'),
                        ('process_approved', 'Processo Seletivo - Aprovado'),
                        ('process_rejected', 'Processo Seletivo - Reprovado'),
                        ('document_approved', 'Documento - Aprovado'),
                        ('document_rejected', 'Documento - Rejeitado'),
                        ('application_in_process', 'Candidatura - Em Processo'),
                        ('application_interview', 'Candidatura - Entrevista Agendada'),
                        ('application_approved', 'Candidatura - Aprovada'),
                        ('application_rejected', 'Candidatura - Reprovada'),
                        ('admission_completed', 'Admissão - Dados Preenchidos'),
                        ('admission_confirmed', 'Admissão - Confirmada'),
                    ],
                    max_length=40,
                    unique=True,
                    verbose_name='Evento de Status',
                )),
                ('message_template', models.TextField(
                    help_text='Variáveis disponíveis: {nome}, {observacoes}, {vaga}, {processo}, {documento}',
                    verbose_name='Template da Mensagem',
                )),
            ],
            options={
                'verbose_name': 'Template WhatsApp',
                'verbose_name_plural': 'Templates WhatsApp',
                'ordering': ['status_event'],
            },
        ),
    ]
