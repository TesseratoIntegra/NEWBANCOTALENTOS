#!/bin/bash
# ============================================
# Script de Deploy - Banco de Talentos
# VPS: 31.97.167.150
# Dominio: bancodetalentos.chiaperini.com.br
# ============================================

set -e  # Para o script se qualquer comando falhar

DOMAIN="bancodetalentos.chiaperini.com.br"
PROJECT_DIR="/opt/bancodetalentos"
REPO_URL="https://github.com/TesseratoIntegra/NEWBANCOTALENTOS.git"

echo ""
echo "=========================================="
echo "  DEPLOY - Banco de Talentos Chiaperini"
echo "=========================================="
echo ""

# -----------------------------------------------
# PASSO 1: Instalar Docker e Docker Compose
# -----------------------------------------------
echo "[1/7] Instalando Docker e dependencias..."
if ! command -v docker &> /dev/null; then
    apt update
    apt install -y ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    echo "  -> Docker instalado com sucesso!"
else
    echo "  -> Docker ja instalado, pulando..."
fi

# -----------------------------------------------
# PASSO 2: Clonar ou atualizar o repositorio
# -----------------------------------------------
echo ""
echo "[2/7] Preparando repositorio..."
if [ -d "$PROJECT_DIR" ]; then
    echo "  -> Repositorio existente, atualizando..."
    cd "$PROJECT_DIR"
    git pull origin main
else
    echo "  -> Clonando repositorio..."
    git clone "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

# -----------------------------------------------
# PASSO 3: Configurar .env.production
# -----------------------------------------------
echo ""
echo "[3/7] Verificando .env.production..."
if [ ! -f "$PROJECT_DIR/.env.production" ] || grep -q "<GERAR-CHAVE" "$PROJECT_DIR/.env.production"; then
    echo ""
    echo "  !! ATENCAO: Voce precisa editar o .env.production !!"
    echo "  Abra outro terminal e edite: nano $PROJECT_DIR/.env.production"
    echo "  Preencha todos os campos com <PLACEHOLDERS>"
    echo ""
    read -p "  Pressione ENTER quando terminar de editar o .env.production..."
fi

# Verificar se foi preenchido
if grep -q "<GERAR-CHAVE\|<SENHA-FORTE\|<EMAIL-ADMIN\|<PREENCHER" "$PROJECT_DIR/.env.production"; then
    echo "  !! ERRO: .env.production ainda tem placeholders nao preenchidos!"
    echo "  Edite o arquivo e tente novamente."
    exit 1
fi

echo "  -> .env.production configurado!"

# -----------------------------------------------
# PASSO 4: Build dos containers
# -----------------------------------------------
echo ""
echo "[4/7] Fazendo build dos containers (pode demorar alguns minutos)..."
docker compose -f docker-compose.prod.yml build --no-cache
echo "  -> Build concluido!"

# -----------------------------------------------
# PASSO 5: Subir com Nginx HTTP (para obter SSL)
# -----------------------------------------------
echo ""
echo "[5/7] Iniciando servicos com HTTP (para obter certificado SSL)..."

# Usar config inicial (sem SSL)
cp nginx/nginx.initial.conf nginx/nginx.active.conf

# Temporariamente apontar para config HTTP-only
docker compose -f docker-compose.prod.yml up -d

echo "  -> Aguardando servicos iniciarem..."
sleep 15

# Verificar se esta rodando
echo "  -> Verificando servicos..."
docker compose -f docker-compose.prod.yml ps

# -----------------------------------------------
# PASSO 6: Obter certificado SSL
# -----------------------------------------------
echo ""
echo "[6/7] Obtendo certificado SSL via Let's Encrypt..."

docker compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@chiaperini.com.br \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN"

echo "  -> Certificado SSL obtido!"

# -----------------------------------------------
# PASSO 7: Trocar para Nginx com SSL e reiniciar
# -----------------------------------------------
echo ""
echo "[7/7] Ativando SSL e reiniciando Nginx..."

# Trocar para config completa com SSL
cp nginx/nginx.conf nginx/nginx.active.conf

# Reiniciar nginx para carregar SSL
docker compose -f docker-compose.prod.yml restart nginx

echo ""
echo "=========================================="
echo "  DEPLOY CONCLUIDO COM SUCESSO!"
echo "=========================================="
echo ""
echo "  URL: https://$DOMAIN"
echo ""
echo "  Comandos uteis:"
echo "    Ver logs:     docker compose -f docker-compose.prod.yml logs -f"
echo "    Ver status:   docker compose -f docker-compose.prod.yml ps"
echo "    Reiniciar:    docker compose -f docker-compose.prod.yml restart"
echo "    Parar tudo:   docker compose -f docker-compose.prod.yml down"
echo ""
