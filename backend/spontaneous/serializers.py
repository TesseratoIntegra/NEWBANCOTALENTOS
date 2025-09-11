from rest_framework import serializers

from spontaneous.models import Occupation, SpontaneousApplication


class OccupationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Occupation
        fields = '__all__'


class SpontaneousApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpontaneousApplication
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
