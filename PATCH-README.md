# Femmea — Milestone 04 overlay

Este overlay completa as views e funcionalidades do Milestone 04 sobre a branch `feat/milestone-04-views`.

## Inclui

- Acompanhamento do ciclo com fase estimada, dia do ciclo, calendário compacto e legenda.
- Registro diário de sintomas físicos, estado emocional e observações.
- Temperatura basal, teste de ovulação e corrimento cervical.
- Lembretes: listagem, criação e ativação/desativação.
- Tela de teste de gravidez com ativação de lembrete.
- Refinos das views de planejamento, dia da inseminação e pós-procedimento.
- Calendário alinhado aos artboards e acesso rápido a novo lembrete.
- Perfil com acesso a Lembretes e alertas.
- Navegação centralizada de Inseminação (header + tabs).
- CSS específico do Milestone 04 com artboard alvo de 390x844.
- Migration `0006_femmea_cycle_tracking.sql` para versionamento do schema.

## Aplicar sobre o repositório

No PowerShell, dentro do clone de `koresolucoes/Femmea`:

```powershell
git fetch origin
git checkout feat/milestone-04-views
git pull origin feat/milestone-04-views
```

Extraia este ZIP em uma pasta temporária e copie **o conteúdo** para a raiz do repositório, permitindo sobrescrever arquivos existentes.

Depois:

```powershell
git add .
git commit -m "feat: complete milestone 04 cycle symptoms reminders"
git push origin feat/milestone-04-views
```

O banco `vvcitwisfnmwwlvcveoj` já recebeu a tabela `femmea_cycle_observations`, `cycle_length_days` e as quatro policies RLS por usuário. A migration permanece no repositório para manter o schema versionado e reproduzível.

## Validação feita antes de empacotar

- 17 arquivos TypeScript/TSX analisados pelo parser TypeScript.
- 0 erros de sintaxe.
- A `main` anterior já estava com CI verde (`tsc --noEmit` + `next build`).
- Após o push deste overlay, o GitHub Actions deve validar o conjunto completo antes do merge.

## Nota de produto

As fases do ciclo exibidas pela interface são estimativas organizacionais. O produto não deve apresentar isso como diagnóstico, confirmação de ovulação ou substituição de avaliação clínica.
