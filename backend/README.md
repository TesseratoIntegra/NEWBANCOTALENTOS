# 🎯 Banco de Talentos - API

> **Guia completo para desenvolvedores Frontend integrarem com a API do Banco de Talentos**

## 🚀 Quick Setup para Testar a API

```bash
# 1. Clone e configure o backend
git clone <repo>
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# 2. Configure o .env mínimo
echo "DEBUG=True
SECRET_KEY=django-insecure-=&ri$$873!4#j0=o$dw*drk)&jby8p*+@#--#$#g-&(5k5t1d&
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua-senha
FRONTEND_URL=http://localhost:3000" > .env

# 3. Execute migrações e crie dados
python manage.py migrate
python manage.py createsuperuser
python manage.py populate_candidates --count=10

# 4. Inicie o servidor
python manage.py runserver
```

**🌐 API Base URL:** `http://localhost:8000`  
**📖 Documentação:** `http://localhost:8000/api/docs/`

---

## 🔐 Sistema de Autenticação

### Fluxo de Autenticação JWT

#### 1. **Registro de Candidato**
```javascript
POST /api/v1/registers/
Content-Type: application/json

{
  "email": "candidato@email.com",
  "name": "João Silva",
  "password": "minhasenha123",
  "password2": "minhasenha123"
}

// Response
{
  "message": "Usuário criado com sucesso!",
  "user": {
    "id": 1,
    "email": "candidato@email.com",
    "name": "João Silva",
    "user_type": "candidate"
  }
}
```

#### 2. **Login**
```javascript
POST /api/v1/accounts/login/
Content-Type: application/json

{
  "email": "candidato@email.com",
  "password": "minhasenha123"
}

// Response
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "candidato@email.com",
    "name": "João Silva",
    "user_type": "candidate"
  }
}
```

#### 3. **Headers para Requisições Autenticadas**
```javascript
headers: {
  'Authorization': 'Bearer ' + accessToken,
  'Content-Type': 'application/json'
}
```

#### 4. **Recuperação de Senha**
```javascript
// Solicitar reset
POST /api/v1/accounts/password/reset/
{
  "email": "candidato@email.com"
}

// Confirmar reset (com token do email)
POST /api/v1/accounts/password/reset/confirm/
{
  "uid": "uid-from-email",
  "token": "token-from-email",
  "new_password1": "novasenha123",
  "new_password2": "novasenha123"
}
```

---

## 👥 Tipos de Usuário e Permissões

### 🎭 **Candidatos (`user_type: "candidate"`)**

**✅ Pode fazer:**
- Ver e editar próprio perfil
- Candidatar-se a vagas
- Ver próprias candidaturas
- Retirar candidaturas
- Confirmar entrevistas
- Criar perfil detalhado

**❌ Não pode:**
- Ver dados de outros candidatos
- Gerenciar vagas
- Ver candidaturas de outros
- Agendar entrevistas

### 🏢 **Recrutadores (`user_type: "recruiter"`)**

**✅ Pode fazer:**
- Criar e gerenciar vagas da empresa
- Ver todas as candidaturas da empresa
- Atualizar status das candidaturas
- Agendar entrevistas
- Buscar e ver perfis de candidatos
- Ver estatísticas da empresa

**❌ Não pode:**
- Ver dados de outras empresas
- Candidatar-se a vagas
- Editar perfis de candidatos

---

## 🏢 App: Companies

### **Listar Empresas**
```javascript
GET /api/v1/companies/
// Response
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "name": "TechSolutions Ltda",
      "cnpj": "12.345.678/0001-90",
      "logo": "/media/logo/techsolutions.png",
      "slug": "techsolutions-ltda",
      "group": 1,
      "open_jobs": 3  // Vagas abertas
    }
  ]
}
```

### **Grupos Empresariais**
```javascript
GET /api/v1/companies-groups/
// Lista grupos de empresas
```

---

## 💼 App: Jobs

### **Listar Vagas** (Pública)
```javascript
GET /api/v1/jobs/
// Filtros disponíveis:
GET /api/v1/jobs/?job_type=full_time
GET /api/v1/jobs/?location__icontains=São Paulo
GET /api/v1/jobs/?company=1
GET /api/v1/jobs/?search=python django
GET /api/v1/jobs/?ordering=-created_at

// Response
{
  "count": 15,
  "next": "http://localhost:8000/api/v1/jobs/?page=2",
  "results": [
    {
      "id": 1,
      "title": "Desenvolvedor Python Sênior",
      "company": 1,
      "job_type": "full_time",
      "location": "São Paulo - SP",
      "salary_range": "R$ 8.000 - R$ 12.000",
      "closure": "2025-02-15",
      "slug": "desenvolvedor-python-senior-techsolutions-ltda",
      "created_at": "2025-01-14T10:00:00Z"
    }
  ]
}
```

### **Detalhes da Vaga**
```javascript
GET /api/v1/jobs/1/
// Response completa com description, requirements, responsibilities
```

### **Vagas por Empresa**
```javascript
GET /api/v1/jobs/company/techsolutions-ltda/
// Retorna todas as vagas da empresa pelo slug
```

### **Criar Vaga** (Recrutador apenas)
```javascript
POST /api/v1/jobs/
Authorization: Bearer <token>

{
  "title": "Desenvolvedor Frontend React",
  "description": "Vaga para desenvolvedor React...",
  "location": "São Paulo - SP",
  "job_type": "full_time",
  "salary_range": "R$ 6.000 - R$ 10.000",
  "requirements": "• React\n• TypeScript\n• 3+ anos exp",
  "responsibilities": "• Desenvolver interfaces\n• Code review",
  "closure": "2025-03-01"
}
```

---

## 📝 App: Applications

### **Candidatar-se a uma Vaga** (Candidato)
```javascript
POST /api/v1/applications/
Authorization: Bearer <candidato-token>

{
  "job": 1,
  "name": "João Silva",
  "phone": "(11) 99999-9999",
  "state": "SP",
  "city": "São Paulo",
  "linkedin": "https://linkedin.com/in/joao",
  "portfolio": "https://joao.dev",
  "resume": "arquivo-curriculo.pdf",  // FormData
  "cover_letter": "Tenho interesse na vaga...",
  "salary_expectation": 8000.00
}

// Response
{
  "id": 1,
  "status": "submitted",
  "applied_at": "2025-01-14T15:30:00Z",
  "message": "Candidatura enviada com sucesso!"
}
```

### **Minhas Candidaturas** (Candidato)
```javascript
GET /api/v1/applications/my_applications/
Authorization: Bearer <candidato-token>

// Response
[
  {
    "id": 1,
    "job_title": "Desenvolvedor Python Sênior",
    "company_name": "TechSolutions Ltda",
    "status": "under_review",
    "applied_at": "2025-01-14T15:30:00Z",
    "days_since_application": 2
  }
]
```

### **Listar Candidaturas** (Recrutador)
```javascript
GET /api/v1/applications/
Authorization: Bearer <recrutador-token>

// Filtros disponíveis:
GET /api/v1/applications/?status=pending
GET /api/v1/applications/?job__company=1
GET /api/v1/applications/?search=João Silva

// Response
{
  "count": 25,
  "results": [
    {
      "id": 1,
      "candidate_name": "João Silva",
      "job_title": "Desenvolvedor Python",
      "status": "submitted",
      "applied_at": "2025-01-14T15:30:00Z",
      "phone": "(11) 99999-9999",
      "city": "São Paulo"
    }
  ]
}
```

### **Status das Candidaturas**
```javascript
// Status possíveis:
"submitted"           // Em análise
"in_process"          // Em processo seletivo  
"interview_scheduled" // Entrevista agendada
"approved"            // Aprovado
"rejected"            // Reprovado
"withdrawn"           // Retirado pelo candidato
```

### **Atualizar Status** (Recrutador)
```javascript
PATCH /api/v1/applications/1/update_status/
Authorization: Bearer <recrutador-token>

{
  "status": "interview_scheduled",
  "recruiter_notes": "Candidato aprovado para entrevista técnica"
}
```

### **Retirar Candidatura** (Candidato)
```javascript
POST /api/v1/applications/1/withdraw/
Authorization: Bearer <candidato-token>

// Response
{
  "message": "Candidatura retirada com sucesso."
}
```

### **Estatísticas** (Recrutador)
```javascript
GET /api/v1/applications/statistics/
Authorization: Bearer <recrutador-token>

// Response
{
  "total_applications": 150,
  "submitted": 45,
  "in_process": 30,
  "interview_scheduled": 15,
  "approved": 25,
  "rejected": 30,
  "withdrawn": 5
}
```

---

## 📅 App: Interviews (Entrevistas)

### **Agendar Entrevista** (Recrutador)
```javascript
POST /api/v1/interviews/
Authorization: Bearer <recrutador-token>

{
  "application": 1,
  "interview_type": "video",
  "scheduled_date": "2025-01-20T14:00:00Z",
  "duration_minutes": 60,
  "location": "https://meet.google.com/abc-defg-hij"
}

// Tipos disponíveis: "phone", "video", "in_person", "online_test"
```

### **Listar Entrevistas**
```javascript
GET /api/v1/interviews/
Authorization: Bearer <token>

// Candidato vê apenas suas entrevistas
// Recrutador vê entrevistas da empresa

// Response
[
  {
    "id": 1,
    "candidate_name": "João Silva",
    "job_title": "Desenvolvedor Python",
    "interview_type": "video",
    "scheduled_date": "2025-01-20T14:00:00Z",
    "status": "scheduled",
    "location": "https://meet.google.com/abc-defg-hij"
  }
]
```

### **Confirmar Entrevista** (Candidato)
```javascript
POST /api/v1/interviews/1/confirm/
Authorization: Bearer <candidato-token>

// Response
{
  "message": "Entrevista confirmada."
}
```

### **Completar Entrevista** (Recrutador)
```javascript
POST /api/v1/interviews/1/complete/
Authorization: Bearer <recrutador-token>

{
  "feedback": "Candidato demonstrou ótimo conhecimento técnico...",
  "rating": 4
}
```

### **Reagendar Entrevista**
```javascript
POST /api/v1/interviews/1/reschedule/
Authorization: Bearer <token>

{
  "new_date": "2025-01-22T16:00:00Z"
}
```

---

## 👤 App: Candidates (Perfis Detalhados)

### **Criar/Ver Meu Perfil** (Candidato)
```javascript
// Ver meu perfil
GET /api/v1/candidates/me/
Authorization: Bearer <candidato-token>

// Criar perfil
POST /api/v1/candidates/
Authorization: Bearer <candidato-token>

{
  "cpf": "123.456.789-00",
  "date_of_birth": "1990-05-15",
  "gender": "M",
  "zip_code": "01234-567",
  "street": "Rua das Flores",
  "number": "123",
  "neighborhood": "Centro",
  "current_position": "Desenvolvedor Python",
  "current_company": "Empresa Atual",
  "education_level": "superior",
  "experience_years": 5,
  "desired_salary_min": 6000.00,
  "desired_salary_max": 10000.00,
  "professional_summary": "Desenvolvedor com 5 anos...",
  "skills": "Python, Django, React, PostgreSQL",
  "linkedin_url": "https://linkedin.com/in/joao",
  "github_url": "https://github.com/joao",
  "available_for_work": true,
  "accepts_remote_work": true,
  "can_travel": false,
  "preferred_work_shift": "flexible"
}
```

### **Buscar Candidatos** (Recrutador)
```javascript
GET /api/v1/candidates/search/
Authorization: Bearer <recrutador-token>

// Filtros avançados:
GET /api/v1/candidates/search/?skills=python
GET /api/v1/candidates/search/?position=desenvolvedor
GET /api/v1/candidates/search/?experience_years__gte=3
GET /api/v1/candidates/search/?desired_salary_max__lte=8000
GET /api/v1/candidates/search/?available_for_work=true
GET /api/v1/candidates/search/?accepts_remote_work=true
```

### **Formação Acadêmica**
```javascript
// Listar formações
GET /api/v1/candidates/education/
Authorization: Bearer <candidato-token>

// Adicionar formação
POST /api/v1/candidates/education/
{
  "institution": "USP",
  "course": "Ciência da Computação",
  "degree": "Bacharelado",
  "start_date": "2015-03-01",
  "end_date": "2019-12-15",
  "is_current": false,
  "description": "Graduação com foco em..."
}
```

### **Experiência Profissional**
```javascript
// Listar experiências
GET /api/v1/candidates/experience/

// Adicionar experiência
POST /api/v1/candidates/experience/
{
  "company": "Empresa XYZ",
  "position": "Desenvolvedor Python",
  "start_date": "2020-01-15",
  "end_date": null,
  "is_current": true,
  "description": "Desenvolvimento de APIs...",
  "achievements": "• Otimizou performance em 40%\n• Liderou equipe de 3 devs",
  "salary": 8000.00
}
```

### **Idiomas**
```javascript
POST /api/v1/candidates/languages/
{
  "language": "Inglês",
  "proficiency": "advanced",
  "has_certificate": true,
  "certificate_name": "TOEFL"
}

// Níveis: "basic", "intermediate", "advanced", "fluent", "native"
```

### **Habilidades Detalhadas**
```javascript
POST /api/v1/candidates/skills/
{
  "skill_name": "Python",
  "level": "expert",
  "years_experience": 5
}

// Níveis: "beginner", "intermediate", "advanced", "expert"
```

---

## 🎯 App: Spontaneous (Candidaturas Espontâneas)

### **Listar Ocupações (CBO)**
```javascript
GET /api/v1/occupations/
// Response: Lista de ocupações profissionais para seleção
```

### **Enviar Candidatura Espontânea**
```javascript
POST /api/v1/spontaneous-applications/
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "(11) 99999-9999",
  "city": "São Paulo",
  "state": "SP",
  "neighborhood": "Centro",
  "number": "123",
  "complement": "Apt 45",
  "resume": "arquivo.pdf",  // FormData
  "area_1": 1,  // FK para Occupation (obrigatório)
  "area_2": 2,  // FK para Occupation (opcional)
  "area_3": 3   // FK para Occupation (opcional)
}
```

---

## 🔍 Sistema de Filtros e Busca

### **Filtros Comuns em Todas as Listas**

#### **Filtros de Data**
```javascript
// Maior que (gte)
?created_at__gte=2025-01-01

// Menor que (lte)  
?created_at__lte=2025-01-31

// Intervalo
?created_at__gte=2025-01-01&created_at__lte=2025-01-31
```

#### **Filtros de Texto**
```javascript
// Contém (case-insensitive)
?title__icontains=python

// Exato
?status=approved

// Lista de valores
?status__in=pending,under_review
```

#### **Busca Textual**
```javascript
// Busca em múltiplos campos
?search=python django senior
```

#### **Ordenação**
```javascript
// Ascendente
?ordering=created_at

// Descendente  
?ordering=-created_at

// Múltiplos campos
?ordering=-created_at,title
```

#### **Paginação**
```javascript
// Todas as listas são paginadas automaticamente
{
  "count": 150,
  "next": "http://localhost:8000/api/v1/jobs/?page=2",
  "previous": null,
  "results": [...]
}

// Customizar tamanho da página via settings
```

---

## 🛠️ Comandos de Gerenciamento

### **Dados de Exemplo**
```bash
# Criar candidatos com perfis completos
python manage.py populate_candidates --count=10

# Importar ocupações profissionais (CBO)
python manage.py import_occupations
```

### **Comandos Úteis para Frontend**
```bash
# Limpar todas as sessões
python manage.py clearsessions

# Ver estrutura do banco
python manage.py dbshell

# Shell interativo com modelos carregados
python manage.py shell_plus

# Verificar problemas no sistema
python manage.py check

# Backup/Restore dados
python manage.py dumpdata > backup.json
python manage.py loaddata backup.json
```

---

## 📁 Upload de Arquivos

### **Configuração**
- **Tamanho máximo:** 5MB
- **Formatos aceitos:** PDF, DOC, DOCX, JPG, JPEG, PNG
- **Diretório:** `/media/resumes/`

### **Como Enviar**
```javascript
const formData = new FormData();
formData.append('resume', file);
formData.append('name', 'João Silva');
// ... outros campos

fetch('/api/v1/applications/', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    // NÃO incluir Content-Type para FormData
  },
  body: formData
});
```

### **Resposta com URL do Arquivo**
```javascript
{
  "id": 1,
  "resume": "/media/resumes/2025/01/curriculo_joao.pdf",
  // ... outros campos
}

// URL completa: http://localhost:8000/media/resumes/2025/01/curriculo_joao.pdf
```

---

## ⚠️ Tratamento de Erros

### **Códigos de Status HTTP**
```javascript
200 // OK - Sucesso
201 // Created - Recurso criado
400 // Bad Request - Dados inválidos
401 // Unauthorized - Token inválido/expirado
403 // Forbidden - Sem permissão
404 // Not Found - Recurso não encontrado
429 // Too Many Requests - Rate limit
500 // Internal Server Error - Erro do servidor
```

### **Formato de Erros**
```javascript
// Erro de validação (400)
{
  "email": ["Este campo é obrigatório."],
  "password": ["As senhas não coincidem."]
}

// Erro geral (403)
{
  "error": "Você não tem permissão para esta ação."
}

// Erro de autenticação (401)
{
  "detail": "Token inválido ou expirado."
}
```

---

## 🎨 Casos de Uso para o Frontend

### **Dashboard do Candidato**
```javascript
// 1. Buscar perfil
GET /api/v1/candidates/me/

// 2. Buscar minhas candidaturas
GET /api/v1/applications/my_applications/

// 3. Buscar minhas entrevistas
GET /api/v1/interviews/

// 4. Buscar vagas disponíveis
GET /api/v1/jobs/?ordering=-created_at
```

### **Dashboard do Recrutador**
```javascript
// 1. Estatísticas da empresa
GET /api/v1/applications/statistics/

// 2. Candidaturas recentes
GET /api/v1/applications/?ordering=-applied_at

// 3. Entrevistas agendadas
GET /api/v1/interviews/?status=scheduled

// 4. Vagas da empresa
GET /api/v1/jobs/company/{slug}/
```

### **Busca de Candidatos (Recrutador)**
```javascript
// Busca com múltiplos filtros
const params = new URLSearchParams({
  'skills': 'python',
  'experience_years__gte': '3',
  'available_for_work': 'true',
  'accepts_remote_work': 'true',
  'desired_salary_max__lte': '10000'
});

GET `/api/v1/candidates/search/?${params}`
```

### **Processo de Candidatura**
```javascript
// 1. Listar vagas
GET /api/v1/jobs/

// 2. Ver detalhes da vaga
GET /api/v1/jobs/{id}/

// 3. Candidatar-se (com FormData para arquivo)
POST /api/v1/applications/

// 4. Acompanhar status
GET /api/v1/applications/my_applications/
```

---

## 🔧 Configurações Importantes

### **CORS**
```python
# Configurado para aceitar requests do frontend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React dev server
    "http://127.0.0.1:3000",
]
```

### **Paginação Padrão**
```python
# 20 itens por página
PAGE_SIZE = 20

# Para mudar, configure nos settings ou via query param
```

### **Rate Limiting**
```python
# Configurado para desenvolvimento
THROTTLE_RATES = {
    'anon': '100/hour',
    'user': '1000/hour'
}
```

---

**🚀 Agora você tem tudo para integrar perfeitamente com a API!**
