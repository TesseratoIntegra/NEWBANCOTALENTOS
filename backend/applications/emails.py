from django.core.mail import send_mail
from django.conf import settings


def send_interview_scheduled_email(candidate_email, candidate_name, interview_date, job_title):
    subject = f'Entrevista Agendada - {job_title}'
    message = (
        f"Olá {candidate_name},\n\n"
        f"Sua entrevista para a vaga '{job_title}' foi agendada para:\n"
        f"{interview_date.strftime('%d/%m/%Y às %H:%M')}\n\n"
        f"Boa sorte!\n\n"
        f"Equipe de Recrutamento"
    )
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [candidate_email],
        fail_silently=False
    )

def send_status_update_email(candidate_email, candidate_name, job_title, new_status_display):
    subject = f"Atualização sobre sua candidatura - {job_title}"
    message = (
        f"Olá {candidate_name},\n\n"
        f"Seu status na vaga '{job_title}' foi atualizado para: {new_status_display}.\n\n"
        f"Agradecemos pelo interesse.\n\n"
        f"Equipe de Recrutamento"
    )
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [candidate_email],
        fail_silently=False
    )
