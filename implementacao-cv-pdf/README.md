# Implementação: Gerar Currículo em PDF

## Objetivo
Adicionar funcionalidade para gerar um currículo em PDF no formato do modelo "Curriculo_Moderno_2026.pdf" usando os dados do perfil do candidato.

## Modelo do Currículo

**Layout de duas colunas:**

**Sidebar esquerda (gradiente azul/roxo):**
- Foto de perfil (circular)
- Contato: Email, Telefone, LinkedIn, Localização
- Habilidades (badges)
- Idiomas (com indicador de nível em bolinhas)

**Área principal (direita, fundo branco):**
- Nome e cargo desejado
- Perfil profissional (resumo)
- Experiência profissional (cargo, empresa, período, bullet points)
- Formação acadêmica

---

## Abordagem Técnica

**Geração no Frontend** usando:
- `jspdf` - Biblioteca para criar PDFs
- `html2canvas` - Captura elemento HTML como imagem

---

## Arquivos a Criar/Modificar

### 1. Instalar dependências
```bash
cd frontend && npm install jspdf html2canvas
```

### 2. Criar componente do template do currículo
**Novo arquivo:** `frontend/components/ResumeTemplate.tsx`

Componente React que renderiza o currículo no formato visual do modelo:
- Recebe os dados do candidato como props
- Layout responsivo com duas colunas
- Sidebar com gradiente azul/roxo
- Estilização inline (para captura correta pelo html2canvas)

### 3. Criar serviço de geração de PDF
**Novo arquivo:** `frontend/services/resumeGenerator.ts`

Funções:
- `generateResumePDF(data)` - Gera e baixa o PDF
- Renderiza o componente em um container oculto
- Usa html2canvas para capturar
- Usa jsPDF para criar o PDF
- Trigger download automático

### 4. Adicionar botão na PreferencesSection
**Modificar:** `frontend/app/perfil/account/PreferencesSection.tsx`

- Adicionar botão "Gerar Currículo" após "Salvar Preferências"
- Ícone de documento/download
- Loading state durante geração
- Toast de sucesso/erro

### 5. Atualizar tipos (se necessário)
**Modificar:** `frontend/types/index.ts`

- Adicionar interface `ResumeData` que agrupa todos os dados necessários

---

## Estrutura do Componente ResumeTemplate

```tsx
interface ResumeTemplateProps {
  profile: CandidateProfile;
  user: User;
  experiences: CandidateExperience[];
  educations: CandidateEducation[];
  skills: CandidateSkill[];
  languages: CandidateLanguage[];
}
```

**Seções do template:**

1. **Header (sidebar)**
   - Foto: `profile.image_profile`
   - Nome: `user.name`

2. **Contato (sidebar)**
   - Email: `user.email`
   - Telefone: `profile.phone_secondary`
   - LinkedIn: `profile.linkedin_url`
   - Localização: `profile.city, profile.state`

3. **Habilidades (sidebar)**
   - Lista de `skills[].skill_name`

4. **Idiomas (sidebar)**
   - `languages[].language` com `proficiency` (convertido para bolinhas)

5. **Nome e Cargo (área principal)**
   - Nome: `user.name`
   - Cargo: `profile.current_position`

6. **Perfil Profissional (área principal)**
   - `profile.professional_summary`

7. **Experiência (área principal)**
   - Para cada `experience`:
     - Cargo: `position`
     - Empresa: `company`
     - Período: `start_date` - `end_date` (ou "Atualmente")
     - Descrição: `description`
     - Conquistas: `achievements` (como bullet points)

8. **Formação (área principal)**
   - Para cada `education`:
     - Curso: `course`
     - Instituição: `institution`
     - Período: `start_date` - `end_date`

---

## Fluxo de Geração

1. Usuário clica em "Gerar Currículo"
2. Sistema coleta todos os dados do estado (profile, experiences, educations, skills, languages)
3. Renderiza `ResumeTemplate` em container oculto (fora da viewport)
4. `html2canvas` captura o elemento como imagem
5. `jsPDF` cria documento A4 com a imagem
6. Download automático: `curriculo-{nome}.pdf`
7. Remove container temporário
8. Exibe toast de sucesso

---

## Mapeamento de Dados

| Campo do Currículo | Fonte dos Dados |
|---|---|
| Foto | `profile.image_profile` |
| Nome | `user.name` |
| Cargo Desejado | `profile.current_position` |
| Email | `user.email` |
| Telefone | `profile.phone_secondary` |
| LinkedIn | `profile.linkedin_url` |
| Localização | `profile.city, profile.state` |
| Perfil Profissional | `profile.professional_summary` |
| Experiências | `experiences[]` (company, position, dates, description, achievements) |
| Formação | `educations[]` (institution, course, dates) |
| Habilidades | `skills[]` (skill_name) |
| Idiomas | `languages[]` (language, proficiency) |

---

## Conversão de Níveis de Idioma

| Proficiency | Bolinhas |
|---|---|
| basic | ● ○ ○ ○ ○ |
| intermediate | ● ● ● ○ ○ |
| advanced | ● ● ● ● ○ |
| fluent | ● ● ● ● ● |
| native | ● ● ● ● ● |

---

## Verificação

1. Acessar `/perfil` e preencher todos os dados
2. Ir para o último step (Preferências)
3. Clicar em "Gerar Currículo"
4. Verificar se o PDF é baixado
5. Abrir o PDF e verificar se o layout está correto
6. Verificar se todos os dados estão preenchidos corretamente

---

## Status: PENDENTE

Este documento serve como guia para implementação futura da funcionalidade de geração de currículo em PDF.
