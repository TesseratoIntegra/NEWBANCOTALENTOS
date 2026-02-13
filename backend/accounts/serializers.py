from decouple import config

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_str

from rest_framework import serializers

from dj_rest_auth.registration.serializers import RegisterSerializer as BaseRegisterSerializer
from allauth.account.adapter import get_adapter
from allauth.account.utils import setup_user_email

from accounts.models import UserProfile


User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer para visualizar dados do usuário (sem senha)."""
    class Meta:
        model = UserProfile
        fields = ['id', 'email', 'name', 'last_name', 'user_type', 'is_active', 'is_staff', 'is_superuser', 'created_at']
        read_only_fields = ['id', 'is_active', 'is_staff', 'is_superuser', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer para registro de novos usuários."""
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = UserProfile
        fields = ['email', 'name', 'last_name', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'As senhas não coincidem.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        validated_data['user_type'] = 'candidate'
        return UserProfile.objects.create_user(**validated_data)


class CustomRegisterSerializer(BaseRegisterSerializer):
    """Serializer usado com dj-rest-auth para registro com campos extras."""
    username = None  # Remove o campo username

    name = serializers.CharField(required=True)

    def get_cleaned_data(self):
        return {
            'name': self.validated_data.get('name'),
            'email': self.validated_data.get('email'),
            'password1': self.validated_data.get('password1'),
            'password2': self.validated_data.get('password2'),
        }

    def save(self, request):
        adapter = get_adapter()
        user = adapter.new_user(request)
        self.cleaned_data = self.get_cleaned_data()
        adapter.save_user(request, user, self)
        user.user_type = 'candidate'
        setup_user_email(request, user, [])
        user.save()
        return user


class CustomPasswordResetSerializer(serializers.Serializer):
    """
    Serializer customizado para reset de senha que envia e-mail com link/token para o frontend.
    """

    email = serializers.EmailField()

    def save(self):
        request = self.context.get('request')
        email = self.validated_data['email']
        users = User.objects.filter(email__iexact=email)

        if not users.exists():
            raise serializers.ValidationError("Nenhum usuário encontrado com esse e-mail.")

        response_data = []

        for user in users:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            frontend_url = config('FRONTEND_URL', default='http://localhost:3000')
            reset_url = f"{frontend_url}/reset-password?uid={uid}&token={token}"

            try:
                send_mail(
                    subject="Recuperação de senha - Banco de Talentos",
                    message=(
                        f"Olá, {getattr(user, 'name', user.email)}!\n\n"
                        f"Você solicitou a recuperação de senha.\n\n"
                        f"Acesse o link abaixo para redefinir sua senha:\n\n"
                        f"{reset_url}\n\n"
                        f"Se você não solicitou esta recuperação, ignore este email.\n\n"
                        f"Equipe Chiaperini Industrial LTDA"
                    ),
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[user.email],
                    fail_silently=False
                )
            except Exception as e:
                raise serializers.ValidationError(f"Erro ao enviar email: {str(e)}")

            response_data.append({
                "email": user.email,
                "uid": uid,
                "token": token,
                "reset_url": reset_url,
            })

        return response_data[0]


class CustomPasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer para confirmação do reset de senha.
    """
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password1 = serializers.CharField(min_length=8)
    new_password2 = serializers.CharField(min_length=8)

    def validate(self, attrs):
        uid = attrs.get('uid')
        token = attrs.get('token')
        new_password1 = attrs.get('new_password1')
        new_password2 = attrs.get('new_password2')

        # Verificar se as senhas coincidem
        if new_password1 != new_password2:
            raise serializers.ValidationError("As senhas não coincidem.")

        # Decodificar o UID
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (ValueError, User.DoesNotExist):
            raise serializers.ValidationError("UID inválido ou usuário não encontrado.")

        # Verificar se o token é válido
        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError("Token inválido ou expirado.")

        attrs['user'] = user
        return attrs

    def save(self):
        user = self.validated_data['user']
        new_password = self.validated_data['new_password1']

        user.set_password(new_password)
        user.save()

        return user


class RecruiterSerializer(serializers.ModelSerializer):
    """Serializer para gerenciamento de recrutadores (superuser only)."""
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'id', 'email', 'name', 'last_name', 'password', 'user_type',
            'is_active', 'is_staff', 'company', 'company_name',
            'created_at',
        ]
        read_only_fields = ['id', 'user_type', 'created_at']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        validated_data['user_type'] = 'recruiter'
        user = UserProfile.objects.create_user(password=password, **validated_data)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class CustomJWTSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserProfileSerializer()
