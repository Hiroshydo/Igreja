# Segurança, Contexto e RLS

Este documento descreve como o sistema decide se um usuário pode acessar uma congregação, quais camadas participam da autorização e quais proteções foram adicionadas ao fluxo financeiro.

## Modelo de congregações

- `profiles` continua representando o perfil principal do usuário autenticado.
- `profiles.active_congregation_id` guarda a congregação ativa validada no servidor.
- `profile_congregations` guarda os vínculos permitidos entre perfil e congregações.
- `profile_roles` continua sendo a fonte de papéis, agora sempre considerado no contexto `profile_id + congregation_id`.

## Como o acesso é decidido

1. O usuário autentica via Supabase Auth.
2. O servidor carrega `profiles` pelo `auth.uid()`.
3. O servidor verifica se o perfil está ativo.
4. O servidor carrega os vínculos ativos em `profile_congregations`.
5. O servidor valida `active_congregation_id` contra esses vínculos.
6. O servidor carrega os papéis válidos para a congregação ativa em `profile_roles`.
7. O servidor expande os papéis em permissões por meio de `role_permissions` e `permissions`.
8. A rota só executa a operação se o contexto ativo e a permissão necessária forem válidos.

Se qualquer etapa falhar, a API responde `401` ou `403` e a operação não chega ao banco de forma autorizada.

## Fluxo pós-login

1. `/login`
2. Sessão Supabase válida
3. Carregamento do perfil no servidor
4. Se não existir congregação ativa válida: redirecionamento para `/selecionar-congregacao`
5. A tela consome `GET /api/me/congregations`
6. O usuário escolhe uma congregação vinculada
7. `POST /api/session/congregation` valida vínculo, papéis e atualiza `profiles.active_congregation_id`
8. O usuário é redirecionado para `/`

Usuário autenticado sem vínculo ativo não acessa dashboard nem financeiro.

## Camadas de segurança

### Frontend

- O cliente não define `user_id`, `role`, `permissions` ou `congregation_id` como fonte de verdade.
- Formulários de membros e financeiro deixaram de decidir o escopo de congregação.
- A troca de congregação acontece em um fluxo dedicado, separado das operações de CRUD.

### API / servidor

- `getAuthContext` carrega o contexto real da sessão no servidor.
- `requireRouteAccess` bloqueia recursos que exigem congregação ativa.
- Os serviços críticos removem fallbacks em memória e retornam erro quando a persistência falha.
- O financeiro ignora `congregationId` vindo do cliente e usa apenas o contexto autenticado.

### PostgreSQL / Supabase RLS

- As políticas usam `profiles.active_congregation_id` e `profile_congregations` como base.
- O banco só permite leitura e escrita da congregação ativa autorizada.
- Triggers financeiras validam conta, categoria, evento, valor positivo e impedem troca de congregação.
- `audit_logs` é append-only por trigger.

## Tabelas protegidas por RLS neste fluxo

- `profiles`
- `profile_congregations`
- `profile_roles`
- `congregations`
- `members`
- `events`
- `ministries`
- `departments`
- `schedules`
- `prayer_requests`
- `announcements`
- `finance_accounts`
- `finance_categories`
- `finance_transactions`
- `media_assets`
- `audit_logs`

## Proteções financeiras

- Nenhuma operação financeira usa `congregationId` do navegador como autoridade.
- `finance_transactions` usa soft delete com `deleted_at`, `deleted_by` e `deleted_reason`.
- `amount` precisa ser finito, maior que zero e compatível com duas casas decimais.
- `account_id` precisa pertencer à congregação ativa.
- `event_id`, quando enviado, precisa pertencer à congregação ativa.
- `category` precisa existir em `finance_categories` da congregação e ser compatível com `type`.
- `congregation_id` não pode ser alterado em update.
- Exportação exige `finance.export` e gera auditoria.

## Auditoria

- O servidor registra IP e user-agent quando disponíveis.
- O frontend não envia nem controla o conteúdo confiável da auditoria.
- Operações financeiras registram estado anterior e posterior quando aplicável.
- Alteração de congregação ativa gera evento de auditoria específico.

## Observações para manutenção

- Qualquer nova tabela multi-tenant deve receber `congregation_id`, RLS e filtro por contexto ativo.
- Qualquer nova API sensível deve seguir: autenticar, carregar contexto, validar permissão, validar payload, persistir, auditar.
- Se a operação depende de segurança financeira, a escolha correta é sempre falhar de forma explícita em caso de dúvida.