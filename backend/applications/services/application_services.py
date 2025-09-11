from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

from applications.models import Application
from applications.emails import send_status_update_email


def withdraw_application(user, application: Application):
    if user != application.candidate:
        raise PermissionDenied("Você só pode retirar suas próprias candidaturas.")

    if application.status in ['approved', 'rejected']:
        raise ValidationError("Não é possível retirar candidatura já processada.")

    application.status = 'withdrawn'
    application.save()
    return application


def update_application_status(user, application: Application, new_status: str, notes: str = None):
    if user.user_type != 'recruiter':
        raise PermissionDenied("Apenas recrutadores podem alterar status.")

    if application.job.company != user.company:
        raise PermissionDenied("Você não tem permissão para esta candidatura.")

    application.status = new_status
    application.reviewed_by = user
    application.reviewed_at = timezone.now()
    if notes:
        application.recruiter_notes = notes
    application.save()

    send_status_update_email(
        application.candidate.email,
        application.candidate.name,
        application.job.title,
        application.get_status_display()
    )

    return application
