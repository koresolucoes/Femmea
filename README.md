# Femmea · Milestone 03

PWA mobile-first para acompanhamento da jornada de inseminação, com **Next.js + Vercel + Supabase**.

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
- Trigger de bootstrap do checklist no banco
- Backfill seguro para jornadas existentes
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
Aplique exatamente nesta ordem:

```text
supabase/migrations/0001_initial.sql
supabase/migrations/0002_auth_onboarding_hydration.sql
supabase/migrations/0003_journey_engine.sql
```

A `0003_journey_engine.sql` cria `femmea_journey_checklist_items`, RLS, índices, trigger de atualização, trigger que cria o checklist automaticamente para novas jornadas e backfill das jornadas existentes.

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
