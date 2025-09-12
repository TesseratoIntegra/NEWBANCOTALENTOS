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
        read_only_fields = ['created_at', 'updated_at', 'user']

    def validate(self, attrs):
        request = self.context.get('request')
        user = getattr(request, 'user', None)

        # Apenas candidatos podem ter candidatura (OneToOne)
        if user and getattr(user, 'user_type', None) != 'candidate':
            raise serializers.ValidationError('Apenas usuários do tipo "candidate" podem ter candidatura espontânea.')

        # regra de áreas
        area_1 = attrs.get('area_1') or getattr(self.instance, 'area_1', None)
        if not area_1:
            raise serializers.ValidationError({'area_1': 'Área 1 é obrigatória.'})

        areas = [
            area_1,
            attrs.get('area_2') or getattr(self.instance, 'area_2', None),
            attrs.get('area_3') or getattr(self.instance, 'area_3', None),
        ]
        areas_clean = [a for a in areas if a]
        if len(areas_clean) != len(set(areas_clean)):
            raise serializers.ValidationError('As áreas de atuação não podem se repetir.')

        return attrs
