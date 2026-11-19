# Femmea — PWA para organizar a jornada de inseminação

PWA mobile-first para acompanhamento da jornada de inseminação, com **Next.js + Vercel + Supabase**.

O aplicativo reúne calendário, checklist e acompanhamento das etapas da jornada. A autenticação e as políticas RLS do Supabase controlam o acesso aos dados de cada conta. Para experimentar o fluxo, use uma conta de teste e dados fictícios.

## Stack
- Next.js 16 / App Router
- React 19 + TypeScript
- Tailwind CSS 4 + design system próprio
- Supabase Auth + Postgres + Row Level Security
- SSR Auth com `@supabase/ssr`
- PWA foundation (`manifest.webmanifest`)

## Supabase alvo
Projeto definido para o Femmea:

```text
vvcitwisfnmwwlvcveoj
https://vvcitwisfnmwwlvcveoj.supabase.co
```

A Publishable key não é versionada. Configure-a em `.env.local` e posteriormente nas variáveis do projeto na Vercel.

## Milestones concluídos

### Milestone 01 · Foundation
- Design system
- Home mobile-first
- Navegação inferior
- PWA foundation

### Milestone 02 · Auth + dados reais
- Cadastro
- Login/logout
- Confirmação de e-mail
- Recuperação de senha
- Onboarding
- Profile
- Meta diária de hidratação
- Hidratação persistente
- Estatísticas semanais
- RLS

### Milestone 03 · Journey Engine
- Timeline baseada no estado real da jornada
- Cálculo de etapa por datas
- Data de procedimento configurável
- Sugestão automática de teste em D+14 quando não informado
- Checklist persistente por jornada
- Criação do checklist no onboarding da aplicação
- Progresso do checklist
- Páginas individuais das 5 fases
- Biblioteca inicial de conteúdos
- Calendário navegável entre meses
- Eventos da jornada + lembretes no calendário
- Home mostrando a fase atual
- Avisos de segurança para separar organização de orientação clínica

## Instalação

```bash
npm install
cp .env.example .env.local
npm run dev
```

No Windows PowerShell:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

## Variáveis

```env
NEXT_PUBLIC_SUPABASE_URL=https://vvcitwisfnmwwlvcveoj.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Migrations
Em um projeto Supabase novo, aplique os arquivos versionados nesta ordem:

```text
supabase/migrations/0001_femmea_tables.sql
supabase/migrations/0002_femmea_enable_rls.sql
supabase/migrations/0003_femmea_indexes.sql
supabase/migrations/0004_femmea_policies.sql
supabase/migrations/0005_femmea_hardening.sql
supabase/migrations/0006_femmea_cycle_tracking.sql
supabase/migrations/0007_femmea_product_architecture.sql
```

As migrations `0001` a `0005` definem as tabelas, RLS, índices, políticas e permissões. A `0006` adiciona o acompanhamento do ciclo; a `0007`, tratamentos, tentativas e eventos da jornada. O checklist inicial é criado pela aplicação em [`src/app/onboarding/actions.ts`](src/app/onboarding/actions.ts).

## Configuração de Auth no Supabase
Em **Authentication → URL Configuration**:

```text
Site URL local:
http://localhost:3000

Redirect URL local:
http://localhost:3000/**
```

Depois do deploy, adicione também o domínio final da Vercel.

Para confirmação SSR, o template pode apontar para:

```text
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

## Segurança
- Nenhuma `service_role` é usada no frontend.
- A Publishable key pode ficar no client porque o banco é protegido por RLS.
- Registros privados são vinculados ao `auth.uid()`.
- O checklist valida tanto `user_id` quanto a propriedade da jornada.
- O app não usa conteúdos educativos para prescrever condutas clínicas.

## Validação desta entrega
- Todos os arquivos `.ts` e `.tsx` foram passados pelo parser TypeScript: **0 erros de sintaxe**.
- O `npm install` não terminou no ambiente de geração por timeout de rede do registry; portanto o build completo deve ser executado localmente ou na Vercel após configurar as variáveis.

## Próximo milestone
**Milestone 04 · Ciclo + sintomas**
- Registrar sintomas exatamente no layout da referência
- Emoções 1–5
- Sintomas físicos selecionáveis
- Histórico diário
- Fase do ciclo
- calendário com legenda menstrual/folicular/ovulação/lútea
- associação entre sintomas e dias do ciclo
