#!/bin/sh
echo "Aplicando migracoes..."
python manage.py migrate --noinput
echo "Coletando arquivos estaticos..."
python manage.py collectstatic --noinput
echo "Verificando superusuario..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
user, created = User.objects.get_or_create(email='${DJANGO_ADMIN_EMAIL}', defaults={'name': 'Admin', 'user_type': 'recruiter', 'is_staff': True, 'is_superuser': True})
if created:
    user.set_password('${DJANGO_ADMIN_PASSWORD}')
    user.save()
    print('Superusuario criado com sucesso!')
elif not user.user_type:
    user.user_type = 'recruiter'
    user.save()
    print('user_type atualizado para recruiter')
EOF
echo "Iniciando aplicacao com Gunicorn..."
exec "$@"
