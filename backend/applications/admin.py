from django.contrib import admin

from applications.models import Application, InterviewSchedule


@admin.register(Application)
class ApplicationModelAdmin(admin.ModelAdmin):
    list_display = [
        'candidate', 'job', 'phone', 'city', 'state',
        'linkedin', 'portfolio', 'resume', 'observations',
        'status', 'applied_at', 'reviewed_by'
    ]
    list_filter = ['status', 'state', 'job__company']
    search_fields = ['candidate__name', 'job__title', 'phone']
    list_per_page = 25


@admin.register(InterviewSchedule)
class InterviewScheduleAdmin(admin.ModelAdmin):
    list_display = [
        'application', 'interview_type', 'scheduled_date', 'duration_minutes',
        'location', 'status', 'interviewer', 'rating'
    ]
    list_filter = ['status', 'interview_type', 'scheduled_date']
    search_fields = ['application__candidate__name', 'application__job__title', 'interviewer__name']
    list_per_page = 25
