from rest_framework import serializers

from django.utils.timezone import now

from companies.models import CompanyGroup, Company


class CompanyGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyGroup
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class CompanySerializer(serializers.ModelSerializer):
    open_jobs = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = '__all__'
        read_only_fields = ['slug', 'created_at', 'updated_at']

    def get_open_jobs(self, obj):
        return obj.jobs.filter(closure__gte=now().date()).count()
