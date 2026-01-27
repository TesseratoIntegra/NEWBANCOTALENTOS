import os
from datetime import timedelta
from pathlib import Path
from decouple import Config, RepositoryEnv


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_ENV = BASE_DIR.parent / ".env"

# Criar pasta de logs se não existir
LOGS_DIR = BASE_DIR / 'logs'
LOGS_DIR.mkdir(exist_ok=True) 

# Força o decouple a usar o .env da raiz (evita confusão com backend/.env)
if ROOT_ENV.exists():
    config = Config(RepositoryEnv(str(ROOT_ENV)))
else:
    # fallback ao decouple padrão
    from decouple import config  # type: ignore

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-=&ri$$873!4#j0=o$dw*drk)&jby8p*+@#--#$#g-&(5k5t1d&')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*', cast=lambda v: [s.strip() for s in v.split(',')])

# Application definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
]

THIRD_PARTY_APPS = [
    'corsheaders',
    'drf_spectacular',
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'django_filters',
    'storages',
]

LOCAL_APPS = [
    'accounts',
    'applications',
    'companies',
    'jobs',
    'spontaneous',
    'candidates',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

SITE_ID = 1


# CSRF e CORS Configuration
CSRF_TRUSTED_ORIGINS = [
    "https://www.bancodetalentos.chiaperini.com.br",
    "https://bancodetalentos.chiaperini.com.br",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3025",
    "http://127.0.0.1:3025",
]

CORS_ALLOWED_ORIGINS = [
    "https://www.bancodetalentos.chiaperini.com.br",
    "https://bancodetalentos.chiaperini.com.br",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3025",
    "http://127.0.0.1:3025",
]

# Configurações adicionais de CORS para melhor compatibilidade
CORS_ALLOW_CREDENTIALS = True  # Permitir cookies e autenticação
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
# Tempo de cache para preflight requests (1 hora)
CORS_PREFLIGHT_MAX_AGE = 3600

ACCOUNT_LOGIN_METHODS = {'email'}
ACCOUNT_SIGNUP_FIELDS = ['email*', 'password1*', 'password2*']
ACCOUNT_RATE_LIMITS = {
    'login_failed': '5/m'  # por exemplo
}

# Configuração específica para o formulário customizado
DJ_REST_AUTH = {
    'USE_JWT': True,
    'JWT_AUTH_COOKIE': None,
    'JWT_AUTH_REFRESH_COOKIE': None,
    'PASSWORD_RESET_SERIALIZER': 'accounts.serializers.CustomPasswordResetSerializer',
    'PASSWORD_RESET_CONFIRM_SERIALIZER': 'accounts.serializers.CustomPasswordResetConfirmSerializer',
    'USER_DETAILS_SERIALIZER': 'accounts.serializers.UserProfileSerializer',
}

# Serializador customizado para registro
REST_AUTH_REGISTER_SERIALIZERS = {
    'REGISTER_SERIALIZER': 'accounts.serializers.CustomRegisterSerializer',
}

# Configurações do allauth
ACCOUNT_LOGIN_ATTEMPTS_LIMIT = 5
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_USER_MODEL_USERNAME_FIELD = None
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_UNIQUE_EMAIL = True

AUTH_USER_MODEL = 'accounts.UserProfile'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# DRF Spectacular Configuration
SPECTACULAR_SETTINGS = {
    'TITLE': 'Banco de Talentos API',
    'DESCRIPTION': 'API completa para gerenciamento de talentos, candidaturas e recrutamento.',
    'VERSION': '2.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'SWAGGER_UI_SETTINGS': {
        'persistAuthorization': True,
        'displayRequestDuration': True,
    },
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/v1/',
    'AUTHENTICATION_WHITELIST': [],
    'SECURITY': [{'Bearer': []}],
    'TAGS': [
        {'name': 'Cadastro de Usuários', 'description': 'Registro e gestão de usuários'},
        {'name': 'Autenticação', 'description': 'Login, logout e tokens JWT'},
        {'name': 'Gerenciamento de Senhas', 'description': 'Recuperação e alteração de senhas'},
        {'name': 'Companies', 'description': 'Gestão de empresas e grupos'},
        {'name': 'Jobs', 'description': 'Vagas de emprego'},
        {'name': 'Candidaturas', 'description': 'Candidaturas a vagas específicas'},
        {'name': 'Entrevistas', 'description': 'Agendamento e gestão de entrevistas'},
        {'name': 'Candidatos', 'description': 'Perfis detalhados de candidatos'},
        {'name': 'Occupations', 'description': 'Ocupações profissionais (CBO)'},
        {'name': 'SpontaneousApplication', 'description': 'Candidaturas espontâneas'},
    ]
}

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    "whitenoise.middleware.WhiteNoiseMiddleware",
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'app.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'app.wsgi.application'

# Database
# Usa PostgreSQL se POSTGRES_HOST estiver definido, senão SQLite
POSTGRES_HOST = config('POSTGRES_HOST', default='')
if POSTGRES_HOST:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('POSTGRES_DB', 'bancodetalentos'),
            'USER': config('POSTGRES_USER', 'postgres'),
            'PASSWORD': config('POSTGRES_PASSWORD', 'postgres'),
            'HOST': POSTGRES_HOST,
            'PORT': config('POSTGRES_PORT', '5432'),
        }
    }
else:
    # Ambiente de Desenvolvimento local: SQLite
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = "/static/"

STATIC_ROOT = BASE_DIR / "staticfiles"

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Media files
if DEBUG:
    STATIC_URL = '/static/'
    STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

    MEDIA_URL = '/media/'
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
else:
    AWS_ACCESS_KEY_ID = config("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = config("AWS_SECRET_ACCESS_KEY")
    AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME")
    AWS_S3_REGION_NAME = config("AWS_S3_REGION_NAME", "us-east-1")
    AWS_QUERYSTRING_AUTH = False
    AWS_S3_CUSTOM_DOMAIN = f"{AWS_STORAGE_BUCKET_NAME}.s3.{AWS_S3_REGION_NAME}.amazonaws.com"

    STATIC_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/static/"
    MEDIA_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/media/"

    STORAGES = {
        "default": {
            "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
            "OPTIONS": {
                "bucket_name": AWS_STORAGE_BUCKET_NAME,
                "region_name": AWS_S3_REGION_NAME,
                "location": "media",
            },
        },
        "staticfiles": {
            "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
            "OPTIONS": {
                "bucket_name": AWS_STORAGE_BUCKET_NAME,
                "region_name": AWS_S3_REGION_NAME,
                "location": "static",
            },
        },
    }

# File Upload Settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'mail.chiaperini.com.br'   # Servidor de saída SMTP
EMAIL_PORT = 465                        # Porta SMTP com SSL
EMAIL_USE_SSL = True                    # SSL (não use TLS aqui)
EMAIL_USE_TLS = False                   # Desative o TLS
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = f'Chiaperini Industrial LTDA <{EMAIL_HOST_USER}>'

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG' if DEBUG else 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console', 'file'],  # Sempre salvar logs em arquivo
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],  # Sempre em arquivo, independente de DEBUG
            'level': 'INFO',
            'propagate': False,
        },
        'applications': {  # Logger específico para o app applications
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'candidates': {  # Logger específico para o app candidates
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'jobs': {  # Logger específico para o app jobs
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
