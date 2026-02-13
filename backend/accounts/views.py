from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser

from rest_framework_simplejwt.tokens import RefreshToken

from drf_spectacular.utils import extend_schema, extend_schema_view

from dj_rest_auth.views import APIView, LoginView, LogoutView, PasswordResetView, PasswordResetConfirmView, PasswordChangeView

from accounts.models import UserProfile
from accounts.serializers import UserProfileSerializer, RegisterSerializer, RecruiterSerializer, CustomPasswordResetSerializer, CustomPasswordResetConfirmSerializer, CustomJWTSerializer


@extend_schema_view(
    list=extend_schema(
        tags=['Cadastro de Usuários'],
        summary='Listar usuários cadastrados',
        description='Retorna todos os usuários cadastrados no sistema.'
    ),
    retrieve=extend_schema(
        tags=['Cadastro de Usuários'],
        summary='Detalhar usuário',
        description='Retorna os dados de um usuário específico.'
    ),
    create=extend_schema(
        tags=['Cadastro de Usuários'],
        summary='Registrar novo usuário',
        description='Permite cadastrar um novo usuário no sistema.'
    ),
    update=extend_schema(
        tags=['Cadastro de Usuários'],
        summary='Atualizar dados do usuário',
        description='Atualiza todos os campos de um usuário.'
    ),
    partial_update=extend_schema(
        tags=['Cadastro de Usuários'],
        summary='Atualizar parcialmente usuário',
        description='Atualiza parcialmente os dados de um usuário.'
    ),
    destroy=extend_schema(
        tags=['Cadastro de Usuários'],
        summary='Excluir usuário',
        description='Remove um usuário do sistema.'
    ),
)
class RegisterViewSet(viewsets.ModelViewSet):
    """ViewSet para registrar novos usuários como candidatos"""
    queryset = UserProfile.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Usuário criado com sucesso!',
                'user': UserProfileSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema_view(
    post=extend_schema(
        tags=['Autenticação'],
        summary='Login do usuário',
        description='Realiza o login com e-mail e senha, retornando tokens JWT de acesso e refresh.',
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'access': {'type': 'string', 'description': 'Token de acesso JWT'},
                    'refresh': {'type': 'string', 'description': 'Token de refresh JWT'},
                    'user': {'type': 'object', 'description': 'Dados do usuário autenticado'}
                }
            },
            400: {'description': 'Credenciais inválidas ou dados incorretos'}
        }
    )
)
class CustomLoginView(LoginView):
    """
    View customizada para autenticação JWT.
    """
    permission_classes = [AllowAny]

    def get_response(self):
        """
        Força retorno de `access`, `refresh` e `user` com JWT.
        """
        refresh = RefreshToken.for_user(self.user)
        data = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': self.user,
        }
        serializer = self.get_response_serializer()(data, context={'request': self.request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def get_response_serializer(self):
        return CustomJWTSerializer


@extend_schema_view(
    post=extend_schema(
        tags=['Autenticação'],
        summary='Logout do usuário',
        description='Encerra a sessão do usuário autenticado e invalida os tokens.'
    )
)
class CustomLogoutView(LogoutView):
    pass


@extend_schema_view(
    post=extend_schema(
        tags=['Gerenciamento de Senhas'],
        summary='Solicitar redefinição de senha',
        description='Envia um e-mail com o link/token para redefinir a senha do usuário.',
        responses={
            200: {'description': 'E-mail de redefinição enviado com sucesso'},
            400: {'description': 'E-mail não encontrado ou inválido'}
        }
    )
)
class CustomPasswordResetView(PasswordResetView):
    """
    View customizada para reset de senha que usa serializer customizado
    """
    serializer_class = CustomPasswordResetSerializer
    permission_classes = [AllowAny]

    def get_serializer_context(self):
        print("[DEBUG] get_serializer_context foi chamado")
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def post(self, request, *args, **kwargs):
        print("[DEBUG] CustomPasswordResetView POST foi chamado")
        print(f"[DEBUG] Request data: {request.data}")

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.save()

        print(f"[DEBUG] UID: {data['uid']}")
        print(f"[DEBUG] Token: {data['token']}")
        print(f"[DEBUG] Reset URL: {data['reset_url']}")

        return Response(data, status=status.HTTP_200_OK)


@extend_schema_view(
    post=extend_schema(
        tags=['Gerenciamento de Senhas'],
        summary='Confirmar redefinição de senha',
        description='Recebe o token de redefinição e define uma nova senha para o usuário.',
        responses={
            200: {'description': 'Senha redefinida com sucesso'},
            400: {'description': 'Token inválido ou dados incorretos'}
        }
    )
)
class CustomPasswordResetConfirmView(PasswordResetConfirmView):
    pass


@extend_schema_view(
    post=extend_schema(
        tags=['Gerenciamento de Senhas'],
        summary='Alterar senha do usuário logado',
        description='Permite que o usuário autenticado altere sua senha atual fornecendo a senha antiga.',
        responses={
            200: {'description': 'Senha alterada com sucesso'},
            400: {'description': 'Senha atual incorreta ou nova senha inválida'}
        }
    )
)
class CustomPasswordChangeView(PasswordChangeView):
    pass


class CustomPasswordResetConfirmView(APIView):
    """
    View para confirmação do reset de senha.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = CustomPasswordResetConfirmSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"message": "Senha redefinida com sucesso!"},
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


@extend_schema_view(
    list=extend_schema(
        tags=['Gerenciamento de Recrutadores'],
        summary='Listar recrutadores',
        description='Retorna todos os recrutadores cadastrados. Apenas administradores.'
    ),
    retrieve=extend_schema(
        tags=['Gerenciamento de Recrutadores'],
        summary='Detalhar recrutador',
    ),
    create=extend_schema(
        tags=['Gerenciamento de Recrutadores'],
        summary='Criar recrutador',
    ),
    partial_update=extend_schema(
        tags=['Gerenciamento de Recrutadores'],
        summary='Atualizar recrutador',
    ),
    destroy=extend_schema(
        tags=['Gerenciamento de Recrutadores'],
        summary='Excluir recrutador',
    ),
)
class RecruiterViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciamento de recrutadores. Apenas administradores."""
    serializer_class = RecruiterSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return UserProfile.objects.filter(
            user_type='recruiter'
        ).select_related('company').order_by('-created_at')

    def create(self, request, *args, **kwargs):
        if not request.data.get('password'):
            return Response(
                {'password': ['Este campo é obrigatório para criar um recrutador.']},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        recruiter = serializer.save()
        return Response(
            RecruiterSerializer(recruiter).data,
            status=status.HTTP_201_CREATED
        )
