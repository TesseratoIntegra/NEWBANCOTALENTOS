#!/bin/sh

echo "🟢 Entrypoint iniciado"

echo "📦 Aplicando migrações..."
python manage.py migrate --noinput

echo "📂 Coletando arquivos estáticos..."
python manage.py collectstatic --noinput

echo "🛠️ Verificando superusuário..."

# Cria superusuário automático caso ainda não exista (opcional)
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='${DJANGO_ADMIN_EMAIL}').exists():
    User.objects.create_superuser(email='${DJANGO_ADMIN_EMAIL}', password='${DJANGO_ADMIN_PASSWORD}', name='Admin')
EOF

echo "🚀 Iniciando aplicação com Gunicorn..."
exec "$@"
