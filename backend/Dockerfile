# Usar Python 3.12 Alpine para menor tamanho
FROM python:3.12-alpine

# Variáveis de ambiente para melhor logging
ENV PYTHONUNBUFFERED=1 PYTHONFAULTHANDLER=1

# Instalar dependências do sistema e do banco
RUN apk add --no-cache \
    curl gcc musl-dev libffi-dev postgresql-dev \
    py3-setuptools py3-wheel \
    && pip install --no-cache-dir --upgrade pip

# Definir diretório de trabalho
WORKDIR /app

# Copiar apenas requirements.txt primeiro (para cache eficiente)
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo o código do backend
COPY . /app/

# Garantir permissão no entrypoint
RUN chmod +x /app/entrypoint.sh

# Expor porta do Django
EXPOSE 8000

# Definir o entrypoint padrão
ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]

# Rodar Gunicorn otimizadamente
CMD ["gunicorn", "app.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "17", "--threads", "4", "--timeout", "300"]
