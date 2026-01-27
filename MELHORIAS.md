# Melhorias - Banco de Talentos

## 1. Perfil do Candidato (`/perfil`)

### Arquivos Modificados

**`frontend/app/perfil/account/EducationSection.tsx`**
- Botao "Adicionar Formacao" so aparece quando ha itens cadastrados
- Botao "Adicionar Primeira Formacao" oculta quando formulario esta aberto

**`frontend/app/perfil/account/ExperienceSection.tsx`**
- Botao "Adicionar Experiencia" so aparece quando ha itens cadastrados
- Botao "Adicionar Primeira Experiencia" oculta quando formulario esta aberto

**`frontend/app/perfil/account/SkillsSection.tsx`**
- Botao "Adicionar Habilidade" so aparece quando ha itens cadastrados
- Botao "Adicionar Primeira Habilidade" oculta quando formulario esta aberto
- Layout alterado de grid para lista vertical

**`frontend/app/perfil/account/LanguagesSection.tsx`**
- Botao "Adicionar Idioma" so aparece quando ha itens cadastrados
- Botao "Adicionar Primeiro Idioma" oculta quando formulario esta aberto
- Layout alterado de grid para lista vertical

**`frontend/app/perfil/account/PreferencesSection.tsx`**
- Adicionado botao "Voltar" para etapa anterior

## 2. Renomeacao de "Minha Conta" para "Meu Perfil"

### Arquivos Modificados

**`frontend/components/Navbar.tsx`**
- Alterado texto "Minha Conta" para "Meu Perfil" no link desktop (linha 217)
- Alterado texto "Minha Conta" para "Meu Perfil" no link mobile (linha 290)

**`frontend/app/perfil/page.tsx`**
- Alterado titulo "Minha Conta" para "Meu Perfil" no cabecalho da pagina

## 3. Correcao de Erro 500 ao Salvar Habilidades e Idiomas

### Arquivos Modificados

**`backend/candidates/views.py`**
- Adicionado import de IntegrityError
- Adicionado tratamento de IntegrityError em CandidateSkillViewSet.perform_create
- Adicionado tratamento de IntegrityError em CandidateLanguageViewSet.perform_create
- Erro 500 agora retorna mensagem amigavel quando habilidade/idioma duplicado

## 4. Exibicao de Mensagens de Erro de Validacao no Frontend

### Arquivos Modificados

**`frontend/app/perfil/account/SkillsSection.tsx`**
- Corrigido tratamento de erro no handleSubmit para extrair mensagem do backend
- Agora exibe mensagem especifica de duplicata: "Voce ja possui uma habilidade com este nome cadastrada."

**`frontend/app/perfil/account/LanguagesSection.tsx`**
- Corrigido tratamento de erro no handleSubmit para extrair mensagem do backend
- Agora exibe mensagem especifica de duplicata: "Voce ja possui este idioma cadastrado."

## 5. Correcao de Persistencia de Dados (Habilidades, Idiomas, Imagem)

### Arquivos Modificados

**`frontend/app/perfil/page.tsx`**
- Corrigido carregamento de dados que usava `.results` para respostas nao paginadas
- Agora suporta tanto resposta paginada (objeto com `.results`) quanto array direto
- Habilidades, idiomas, formacoes e experiencias agora persistem corretamente apos F5

**`frontend/next.config.ts`**
- Atualizado de `domains` (deprecated) para `remotePatterns`
- Configurado localhost:8025 para carregar imagens do backend
- Foto de perfil agora carrega corretamente apos F5

## 6. Correcao do Upload de Foto de Perfil

### Problema
A foto de perfil nao era salva porque o upload tentava acontecer ANTES do perfil ser criado (profile.id era undefined).

### Arquivos Modificados

**`frontend/app/perfil/page.tsx`**
- `handleProfileUpdate` agora retorna o perfil atualizado (`Promise<CandidateProfile | null>`)

**`frontend/app/perfil/account/PersonalInfoSection.tsx`**
- Alterada ordem: primeiro salva o perfil, depois faz upload da imagem
- Usa o ID do perfil retornado por `onUpdate` para fazer o upload
- Exibe toast de sucesso/erro apos upload da imagem
- Adicionado prop `onProfileChange` para atualizar o estado do perfil apos upload da imagem
- Apos upload bem-sucedido, atualiza o perfil no componente pai e o preview local

**`frontend/app/perfil/account/ProfessionalInfoSection.tsx`**
- Atualizado tipo de `onUpdate` para nova assinatura

**`frontend/app/perfil/account/PreferencesSection.tsx`**
- Atualizado tipo de `onUpdate` para nova assinatura

**`frontend/app/perfil/page.tsx`**
- Adicionado `onProfileChange: setProfile` nas props do PersonalInfoSection
- Permite que o componente filho atualize o estado do perfil apos upload da imagem

## 7. Correcao de Path da Imagem (Erro 500 / illegal path)

### Problema
A URL da imagem tinha problemas de path (backslashes no Windows ou path relativo sem dominio).

### Arquivos Modificados

**`backend/app/utils.py`**
- UniqueFilePathGenerator agora usa forward slash `/` diretamente ao inves de `os.path.join`
- Garante compatibilidade com URLs em qualquer sistema operacional

**`frontend/app/perfil/account/PersonalInfoSection.tsx`**
- Adicionada logica para garantir URL completa da imagem
- Se backend retornar path relativo (ex: `/media/...`), prefixa com `NEXT_PUBLIC_API_BASE_URL`
- Aplica-se tanto ao carregar o perfil quanto apos upload de nova imagem

## 8. Correcao da Persistencia da Imagem no Banco de Dados

### Problema
A imagem era salva no disco mas a referencia no banco de dados nao era atualizada.
O serializer do DRF nao estava persistindo o campo `image_profile` corretamente via PATCH.

### Arquivos Modificados

**`backend/candidates/views.py`**
- Adicionada logica em `perform_update` para forcar persistencia do `image_profile`
- Se `image_profile` estiver em `request.FILES`, salva manualmente com `instance.save(update_fields=['image_profile', 'updated_at'])`

**`frontend/app/perfil/account/PersonalInfoSection.tsx`**
- Adicionado `unoptimized` ao componente Image para evitar erro "illegal path" do Next.js no Windows
