from rest_framework import serializers

from jobs.models import Job


class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ['slug', 'created_at', 'updated_at']

    def get_company_name(self, obj):
        return obj.company.name if obj.company else None
