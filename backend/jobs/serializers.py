from rest_framework import serializers

from jobs.models import Job


class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True, default=None)
    company_slug = serializers.CharField(source='company.slug', read_only=True, default=None)
    company_group_name = serializers.CharField(source='company.group.name', read_only=True, default=None)
    company_group_description = serializers.CharField(source='company.group.description', read_only=True, default=None)

    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ['slug', 'created_at', 'updated_at']
