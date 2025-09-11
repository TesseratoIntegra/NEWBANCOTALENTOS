from django.contrib import admin

from spontaneous.models import Occupation, SpontaneousApplication


@admin.register(Occupation)
class OccupationModelAdmin(admin.ModelAdmin):
    list_display = ['code', 'title']
    search_fields = ['code', 'title']
    list_per_page = 25


@admin.register(SpontaneousApplication)
class SpontaneousApplicationModelAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'city', 'state',
                    'neighborhood', 'number', 'complement', 'resume',
                    'area_1', 'area_2', 'area_3']
    search_fields = ['name', 'email']
    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ('area_1', 'area_2', 'area_3')
    list_per_page = 25
