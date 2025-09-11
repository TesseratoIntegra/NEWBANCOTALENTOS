from datetime import datetime
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

from applications.models import InterviewSchedule
from applications.emails import send_interview_scheduled_email


def confirm_interview(user, interview):
    if user != interview.application.candidate:
        raise PermissionDenied("Apenas o candidato pode confirmar a entrevista.")

    interview.status = 'confirmed'
    interview.save()
    return interview


def complete_interview(user, interview, feedback, rating):
    if user != interview.interviewer:
        raise PermissionDenied("Apenas o entrevistador pode completar a entrevista.")

    interview.status = 'completed'
    interview.feedback = feedback
    if rating and 1 <= int(rating) <= 5:
        interview.rating = rating
    interview.save()
    return interview


def reschedule_interview(interview, new_date_str: str):
    try:
        new_datetime = datetime.fromisoformat(new_date_str.replace('Z', '+00:00'))
    except ValueError:
        raise ValidationError("Formato de data inválido.")

    if new_datetime <= timezone.now():
        raise ValidationError("Nova data deve ser no futuro.")

    interview.scheduled_date = new_datetime
    interview.status = 'rescheduled'
    interview.save()
    return interview


def create_interview(request, validated_data):
    interview = InterviewSchedule.objects.create(**validated_data)

    candidate = interview.application.candidate
    send_interview_scheduled_email(
        candidate.email,
        candidate.name,
        interview.scheduled_date,
        interview.application.job.title
    )

    interview.application.status = 'interview_scheduled'
    interview.application.save()

    return interview
