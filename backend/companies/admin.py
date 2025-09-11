from django.contrib import admin

from companies.models import CompanyGroup, Company


@admin.register(CompanyGroup)
class CompanyGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at', 'updated_at')
    search_fields = ('name',)
    ordering = ('name',)
    list_per_page = 25


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'cnpj', 'group', 'created_at', 'updated_at')
    list_filter = ('group',)
    search_fields = ('name', 'cnpj')
    ordering = ('name',)
    autocomplete_fields = ('group',)
    list_per_page = 25
    readonly_fields = ('slug',)
