from django.contrib import admin
from jobs.models import Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'job_type', 'location', 'salary_range', 'created_at', 'updated_at')
    list_filter = ('job_type', 'company')
    search_fields = ('title', 'company__name', 'location')
    autocomplete_fields = ('company',)
    ordering = ('-created_at',)
    list_per_page = 25
    readonly_fields = ('slug',)
