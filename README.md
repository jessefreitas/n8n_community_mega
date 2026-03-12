# n8n-nodes-mega

Node de comunidade para [n8n](https://n8n.io) para trabalhar com a API do Mega.

## Recursos

- `Mega` node regular para APIs do Mega com escopo de conta
- `Mega Client` node regular para APIs Client publicas
- `Mega Platform` node regular para APIs Platform do Mega
- `Account -> Get` operation
- `Account -> Update` operation
- `Agent -> Get Many`, `Create`, `Update`, and `Delete` operations
- `Agent Bot -> Get Many`, `Create`, `Get`, `Update`, and `Delete` operations
- `Automation Rule -> Get Many`, `Create`, `Get`, `Update`, and `Delete` operations
- `Audit Log -> Get Many` operation
- `Campaign -> Create` operation
- `Canned Response -> Get Many`, `Create`, `Update`, and `Delete` operations
- `Custom Filter -> Get Many`, `Create`, `Get`, `Update`, and `Delete` operations
- `Contact -> Get Many`, `Create`, `Create Note`, `Get`, `Update`, `Delete`, `Delete Note`, `Get Conversations`, `Search`, `Filter`, `Create Inbox`, `Get Contactable Inboxes`, and `Merge` operations
- `Conversation -> Get Counts`, `Get Many`, `Create`, `Create and Send Message`, `Filter`, `Get`, `Update`, `Toggle Status`, `Toggle Priority`, `Toggle Typing Status`, `Set Custom Attributes`, `Get Labels`, `Set Labels`, `Get Reporting Events`, and `Assign` operations
- `Custom Attribute -> Get Many`, `Create`, `Get`, `Update`, and `Delete` operations
- `Inbox -> Get Many`, `Get`, `Create`, `Update`, `Get Agent Bot`, `Set Agent Bot`, `Get Agents`, `Add Agent`, `Remove Agent`, and `Update Agents` operations
- `Integration -> Get Many`, `Create`, `Update`, and `Delete` operations
- `Message -> Get Many`, `Create`, and `Delete` operations
- `Portal -> Get Many`, `Create`, and `Update` operations
- `Portal Category -> Create` operation
- `Portal Article -> Create` operation
- `Profile -> Get` operation
- `Team -> Get Many`, `Get`, `Create`, `Update`, `Delete`, `Get Agents`, `Add Agent`, `Remove Agent`, and `Update Agents` operations
- `Webhook -> Get Many`, `Create`, `Update`, and `Delete` operations
- `Mega API` credential with `Base URL`, `API Access Token`, and `Mega Account ID`
- `Mega Client API` credential with `Base URL` and `Inbox Identifier`
- `Mega Platform API` credential with `Base URL` and `Platform API Access Token`
- Teste de conexao da credencial usando `GET /api/v1/profile`

## Requisitos

- Node.js 22+ e necessario para executar os comandos atuais de `build` e `lint` do `@n8n/node-cli`
- npm

## Instalacao

```bash
npm install
npm run build
```

Para usar como community node local durante o desenvolvimento:

```bash
npm run dev
```

Para instalar o pacote publicado no n8n:

```bash
npm install @jessefreitas/n8n-nodes-mega
```

## Credenciais

Crie uma credencial `Mega API` no n8n com:

- `Base URL`: URL da sua instancia Mega, por exemplo `https://app.example.com`
- `API Access Token`: token da aplicacao enviado no header `api_access_token`
- `Mega Account ID`: identificador externo da conta Mega usado em endpoints com escopo de conta

O teste da credencial chama `GET /api/v1/profile` para validar o token.

## API Platform

Use o node `Mega Platform` com a credencial `Mega Platform API` para endpoints de Platform App em:

```text
/platform/api/v1/*
```

Crie uma credencial `Mega Platform API` no n8n com:

- `Base URL`: URL da sua instancia Mega
- `Platform API Access Token`: token do app platform enviado no header `api_access_token`

O teste da credencial chama:

```text
GET /platform/api/v1/accounts
```

Recursos suportados em `Mega Platform`:

- `Account -> Create`, `Get`, `Update`, and `Delete`
- `Account User -> Get Many`, `Create`, and `Delete`
- `Agent Bot -> Get Many`, `Create`, `Get`, `Update`, and `Delete`
- `User -> Create`, `Get`, `Update`, `Delete`, and `Get SSO Link`

Importante:

- `Mega` and `Mega Platform` nao compartilham credenciais
- `Mega` e para APIs de aplicacao com escopo de conta em `/api/v1/accounts/*`
- `Mega Platform` e para APIs Platform em `/platform/api/v1/*`

## API Client

Use o node `Mega Client` com a credencial `Mega Client API` para endpoints publicos client em:

```text
/public/api/v1/*
```

Crie uma credencial `Mega Client API` no n8n com:

- `Base URL`: URL da sua instancia Mega
- `Inbox Identifier`: identificador publico da caixa de entrada usado pelas APIs Client

Recursos suportados em `Mega Client`:

- `Contact -> Create`, `Get`, and `Update`
- `Conversation -> Get Many`, `Create`, `Get`, `Resolve`, `Toggle Typing Status`, and `Update Last Seen`
- `Message -> Get Many`, `Create`, and `Update`
- `CSAT Survey -> Get`

Importante:

- `Mega`, `Mega Platform`, and `Mega Client` nao compartilham credenciais
- `Mega Client` usa identificadores publicos como `inbox_identifier`, `contact_identifier`, and `conversation_id`
- `CSAT Survey` usa uma rota publica `conversation_uuid` fora do padrao `/public/api/v1/inboxes/*`


## Operacoes

### Account -> Get

Obtem detalhes da conta em:

```text
GET /api/v1/accounts/{accountId}
```

### Account -> Update

Suporta atualizar estes campos:

- `Name`
- `Locale`
- `Domain`
- `Support Email`
- `Auto Resolve After`
- `Auto Resolve Message`
- `Auto Resolve Ignore Waiting`
- `Industry`
- `Company Size`
- `Timezone`

O node envia requisicoes para:

```text
PATCH /api/v1/accounts/{accountId}
```


## Mega Platform Operations

### Platform Account

Operacoes suportadas:

- `Create`
- `Get`
- `Update`
- `Delete`

O node envia requisicoes para:

```text
POST /platform/api/v1/accounts
GET /platform/api/v1/accounts/{accountId}
PATCH /platform/api/v1/accounts/{accountId}
DELETE /platform/api/v1/accounts/{accountId}
```

Campos suportados:

- `Name`
- `Locale`
- `Domain`
- `Support Email`
- `Status`
- `Limits`
- `Custom Attributes`

### Platform Account User

Operacoes suportadas:

- `Get Many`
- `Create`
- `Delete`

O node envia requisicoes para:

```text
GET /platform/api/v1/accounts/{accountId}/account_users
POST /platform/api/v1/accounts/{accountId}/account_users
DELETE /platform/api/v1/accounts/{accountId}/account_users
```

Campos suportados:

- `Account ID`
- `User ID`
- `Role`

### Platform Agent Bot

Operacoes suportadas:

- `Get Many`
- `Create`
- `Get`
- `Update`
- `Delete`

O node envia requisicoes para:

```text
GET /platform/api/v1/agent_bots
POST /platform/api/v1/agent_bots
GET /platform/api/v1/agent_bots/{id}
PATCH /platform/api/v1/agent_bots/{id}
DELETE /platform/api/v1/agent_bots/{id}
```

Campos suportados:

- `Name`
- `Description`
- `Outgoing URL`
- `Account ID`
- `Avatar URL`

The documented binary `avatar` upload field is not implemented yet in this node.

### Platform User

Operacoes suportadas:

- `Create`
- `Get`
- `Update`
- `Delete`
- `Get SSO Link`

O node envia requisicoes para:

```text
POST /platform/api/v1/users
GET /platform/api/v1/users/{id}
PATCH /platform/api/v1/users/{id}
DELETE /platform/api/v1/users/{id}
GET /platform/api/v1/users/{id}/login
```

Campos suportados:

- `Name`
- `Display Name`
- `Email`
- `Password`
- `Custom Attributes`

## Mega Client Operations

### Client Contact

Operacoes suportadas:

- `Create`
- `Get`
- `Update`

O node envia requisicoes para:

```text
POST /public/api/v1/inboxes/{inboxIdentifier}/contacts
GET /public/api/v1/inboxes/{inboxIdentifier}/contacts/{contactIdentifier}
PATCH /public/api/v1/inboxes/{inboxIdentifier}/contacts/{contactIdentifier}
```

Campos suportados:

- `Contact Identifier`
- `Identifier`
- `Identifier Hash`
- `Email`
- `Name`
- `Phone Number`
- `Custom Attributes`

The documented binary `avatar` upload field is not implemented yet in this node.

### Client Conversation

Operacoes suportadas:

- `Get Many`
- `Create`
- `Get`
- `Resolve`
- `Toggle Typing Status`
- `Update Last Seen`

O node envia requisicoes para:

```text
GET /public/api/v1/inboxes/{inboxIdentifier}/contacts/{contactIdentifier}/conversations
POST /public/api/v1/inboxes/{inboxIdentifier}/contacts/{contactIdentifier}/conversations
GET /public/api/v1/inboxes/{inboxIdentifier}/contacts/{contactIdentifier}/conversations/{conversationId}
POST /public/api/v1/inboxes/{inboxIdentifier}/contacts/{contactIdentifier}/conversations/{conversationId}/toggle_status
POST /public/api/v1/inboxes/{inboxIdentifier}/contacts/{contactIdentifier}/conversations/{conversationId}/toggle_typing
POST /public/api/v1/inboxes/{inboxIdentifier}/contacts/{contactIdentifier}/conversations/{conversationId}/update_last_seen
```

Campos suportados:

- `Contact Identifier`
- `Conversation ID`
- `Custom Attributes`
- `Typing Status`

### Client Message

Operacoes suportadas:

- `Get Many`
- `Create`
- `Update`

O node envia requisicoes para:

```text
GET /public/api/v1/inboxes/{inboxIdentifier}/contacts/{contactIdentifier}/conversations/{conversationId}/messages
POST /public/api/v1/inboxes/{inboxIdentifier}/contacts/{contactIdentifier}/conversations/{conversationId}/messages
PATCH /public/api/v1/inboxes/{inboxIdentifier}/contacts/{contactIdentifier}/conversations/{conversationId}/messages/{messageId}
```

Campos suportados:

- `Contact Identifier`
- `Conversation ID`
- `Message ID`
- `Content`
- `Echo ID`
- `Submitted Values`

### Client CSAT Survey

Operacoes suportadas:

- `Get`

O node envia requisicoes para:

```text
GET /survey/responses/{conversationUuid}
```

Campos suportados:

- `Conversation UUID`

### Audit Log -> Get Many

Lists audit log entries from:

```text
GET /api/v1/accounts/{accountId}/audit_logs
```

Available fields:

- `Page`

Este endpoint s? est? dispon?vel em edi??es Enterprise do Mega com o recurso de logs de auditoria habilitado.

### Agent Bot

Operacoes suportadas:

- `Get Many`
- `Create`
- `Get`
- `Update`
- `Delete`

O node envia requisicoes para:

```text
GET /api/v1/accounts/{accountId}/agent_bots
POST /api/v1/accounts/{accountId}/agent_bots
GET /api/v1/accounts/{accountId}/agent_bots/{id}
PATCH /api/v1/accounts/{accountId}/agent_bots/{id}
DELETE /api/v1/accounts/{accountId}/agent_bots/{id}
```

Campos suportados:

- `Name`
- `Description`
- `Outgoing URL`
- `Avatar URL`
- `Bot Type`
- `Bot Config`

The documented binary `avatar` upload field is not implemented yet in this node. Use `Avatar URL` instead.

### Agent

Operacoes suportadas:

- `Get Many`
- `Create`
- `Update`
- `Delete`

O node envia requisicoes para:

```text
GET /api/v1/accounts/{accountId}/agents
POST /api/v1/accounts/{accountId}/agents
PATCH /api/v1/accounts/{accountId}/agents/{id}
DELETE /api/v1/accounts/{accountId}/agents/{id}
```

Campos suportados:

- `Name`
- `Email`
- `Role`
- `Availability Status`
- `Auto Offline`

### Automation Rule

Operacoes suportadas:

- `Get Many`
- `Create`
- `Get`
- `Update`
- `Delete`

O node envia requisicoes para:

```text
GET /api/v1/accounts/{accountId}/automation_rules
POST /api/v1/accounts/{accountId}/automation_rules
GET /api/v1/accounts/{accountId}/automation_rules/{id}
PATCH /api/v1/accounts/{accountId}/automation_rules/{id}
DELETE /api/v1/accounts/{accountId}/automation_rules/{id}
```

Campos suportados:

- `Name`
- `Description`
- `Event Name`
- `Active`
- `Actions`
- `Conditions`

### Campaign

Operacoes suportadas:

- `Create`

O node envia requisicoes para:

```text
POST /api/v1/accounts/{accountId}/campaigns
```

Campos suportados:

- `Title`
- `Message`
- `Inbox ID`
- `Scheduled At`
- `Trigger Only During Business Hours`
- `Template Params`
- `Audience Labels`

This first implementation covers only campaign creation and models `audience` as label references in the form `{ id, type: "Label" }`.

### Canned Response

Operacoes suportadas:

- `Get Many`
- `Create`
- `Update`
- `Delete`

O node envia requisicoes para:

```text
GET /api/v1/accounts/{accountId}/canned_responses
POST /api/v1/accounts/{accountId}/canned_responses
PATCH /api/v1/accounts/{accountId}/canned_responses/{id}
DELETE /api/v1/accounts/{accountId}/canned_responses/{id}
```

Campos suportados:

- `Short Code`
- `Content`

### Chat Room

Operacoes suportadas:

- `Get Many`
- `Create`
- `Get`
- `Update`
- `Delete`
- `Mark As Read`
- `Get Members`
- `Add Members`
- `Update Members`
- `Remove Members`
- `Get Messages`
- `Create Message`

O node envia requisicoes para:

```text
GET /api/v1/accounts/{accountId}/chat_rooms
POST /api/v1/accounts/{accountId}/chat_rooms
GET /api/v1/accounts/{accountId}/chat_rooms/{chatRoomId}
PUT /api/v1/accounts/{accountId}/chat_rooms/{chatRoomId}
DELETE /api/v1/accounts/{accountId}/chat_rooms/{chatRoomId}
POST /api/v1/accounts/{accountId}/chat_rooms/{chatRoomId}/mark_as_read
GET /api/v1/accounts/{accountId}/chat_rooms/{chatRoomId}/members
POST /api/v1/accounts/{accountId}/chat_rooms/{chatRoomId}/members
PATCH /api/v1/accounts/{accountId}/chat_rooms/{chatRoomId}/members
DELETE /api/v1/accounts/{accountId}/chat_rooms/{chatRoomId}/members
GET /api/v1/accounts/{accountId}/chat_rooms/{chatRoomId}/messages
POST /api/v1/accounts/{accountId}/chat_rooms/{chatRoomId}/messages
```

Campos suportados:

- `Chat Room ID`
- `Name`
- `Description`
- `User IDs`
- `Page`
- `Per Page`
- `Content`
- `Message Type`
- `Echo ID`
- `Content Attributes`

This first implementation uses JSON payloads only. Binary avatar uploads for rooms and file attachments for room messages are not implemented yet.

### Custom Filter

Operacoes suportadas:

- `Get Many`
- `Create`
- `Get`
- `Update`
- `Delete`

O node envia requisicoes para:

```text
GET /api/v1/accounts/{accountId}/custom_filters
POST /api/v1/accounts/{accountId}/custom_filters
GET /api/v1/accounts/{accountId}/custom_filters/{customFilterId}
PATCH /api/v1/accounts/{accountId}/custom_filters/{customFilterId}
DELETE /api/v1/accounts/{accountId}/custom_filters/{customFilterId}
```

Campos suportados:

- `Filter Type`
- `Name`
- `Type`
- `Query`

### Contact

Operacoes suportadas:

- `Get Many`
- `Create`
- `Create Note`
- `Get`
- `Update`
- `Delete`
- `Delete Note`
- `Get Conversations`
- `Search`
- `Filter`
- `Create Inbox`
- `Get Contactable Inboxes`
- `Get Labels`
- `Add Labels`
- `Remove Labels`
- `Set Labels`
- `Merge`

O node envia requisicoes para:

```text
GET /api/v1/accounts/{accountId}/contacts
POST /api/v1/accounts/{accountId}/contacts
GET /api/v1/accounts/{accountId}/contacts/{id}
PUT /api/v1/accounts/{accountId}/contacts/{id}
DELETE /api/v1/accounts/{accountId}/contacts/{id}
GET /api/v1/accounts/{accountId}/contacts/{id}/conversations
GET /api/v1/accounts/{accountId}/contacts/search
POST /api/v1/accounts/{accountId}/contacts/filter
POST /api/v1/accounts/{accountId}/contacts/{id}/contact_inboxes
POST /api/v1/accounts/{accountId}/contacts/{id}/notes
GET /api/v1/accounts/{accountId}/contacts/{id}/contactable_inboxes
GET /api/v1/accounts/{accountId}/contacts/{id}/labels
POST /api/v1/accounts/{accountId}/contacts/{id}/labels
DELETE /api/v1/accounts/{accountId}/contacts/{id}/notes/{noteId}
POST /api/v1/accounts/{accountId}/actions/contact_merge
```

Campos suportados:

- `Inbox ID`
- `Name`
- `Email`
- `Blocked`
- `Phone Number`
- `Avatar URL`
- `Identifier`
- `Additional Attributes`
- `Custom Attributes`
- `Page`
- `Sort`
- `Query`
- `Filter Payload`
- `Source ID`
- `Labels`
- `Content`
- `Note ID`
- `Base Contact ID`
- `Mergee Contact ID`

The documented binary `avatar` upload field is not implemented yet in this node. Use `Avatar URL` instead.

### Portal

Operacoes suportadas:

- `Get Many`
- `Create`
- `Update`

O node envia requisicoes para:

```text
GET /api/v1/accounts/{accountId}/portals
POST /api/v1/accounts/{accountId}/portals
PATCH /api/v1/accounts/{accountId}/portals/{id}
```

Campos suportados:

- `Name`
- `Slug`
- `Page Title`
- `Header Text`
- `Color`
- `Custom Domain`
- `Homepage Link`
- `Archived`
- `Config`

### Portal Category

Operacoes suportadas:

- `Create`

O node envia requisicoes para:

```text
POST /api/v1/accounts/{accountId}/portals/{id}/categories
```

Campos suportados:

- `Name`
- `Description`
- `Position`
- `Slug`
- `Locale`
- `Icon`
- `Parent Category ID`
- `Associated Category ID`

### Portal Article

Operacoes suportadas:

- `Create`

O node envia requisicoes para:

```text
POST /api/v1/accounts/{accountId}/portals/{id}/articles
```

Campos suportados:

- `Title`
- `Slug`
- `Position`
- `Content`
- `Description`
- `Category ID`
- `Author ID`
- `Associated Article ID`
- `Status`
- `Locale`
- `Meta`

### Custom Attribute

Operacoes suportadas:

- `Get Many`
- `Create`
- `Get`
- `Update`
- `Delete`

O node envia requisicoes para:

```text
GET /api/v1/accounts/{accountId}/custom_attribute_definitions
POST /api/v1/accounts/{accountId}/custom_attribute_definitions
GET /api/v1/accounts/{accountId}/custom_attribute_definitions/{id}
PATCH /api/v1/accounts/{accountId}/custom_attribute_definitions/{id}
DELETE /api/v1/accounts/{accountId}/custom_attribute_definitions/{id}
```

Campos suportados:

- `Attribute Display Name`
- `Attribute Display Type`
- `Attribute Description`
- `Attribute Key`
- `Attribute Model`
- `Attribute Values`
- `Regex Pattern`
- `Regex Cue`
- `Default Value`

### Inbox

Operacoes suportadas:

- `Get Many`
- `Get`
- `Create`
- `Update`
- `Get Agent Bot`
- `Set Agent Bot`
- `Get Agents`
- `Add Agent`
- `Remove Agent`
- `Update Agents`

O node envia requisicoes para:

```text
GET /api/v1/accounts/{accountId}/inboxes
GET /api/v1/accounts/{accountId}/inboxes/{id}
POST /api/v1/accounts/{accountId}/inboxes
PATCH /api/v1/accounts/{accountId}/inboxes/{id}
GET /api/v1/accounts/{accountId}/inboxes/{id}/agent_bot
POST /api/v1/accounts/{accountId}/inboxes/{id}/set_agent_bot
GET /api/v1/accounts/{accountId}/inbox_members/{inboxId}
POST /api/v1/accounts/{accountId}/inbox_members
DELETE /api/v1/accounts/{accountId}/inbox_members
PATCH /api/v1/accounts/{accountId}/inbox_members
```

Campos suportados:

- `Name`
- `Channel Type`
- `Channel Config`
- `Greeting Enabled`
- `Greeting Message`
- `Enable Email Collect`
- `CSAT Survey Enabled`
- `Enable Auto Assignment`
- `Working Hours Enabled`
- `Out of Office Message`
- `Timezone`
- `Allow Messages After Resolved`
- `Lock to Single Conversation`
- `Portal ID`
- `Sender Name Type`
- `Business Name`
- `Agent Bot ID`
- `User IDs`

The documented binary `avatar` upload field is not implemented yet in this node.

### Integration

Operacoes suportadas:

- `Get Many`
- `Create`
- `Update`
- `Delete`

O node envia requisicoes para:

```text
GET /api/v1/accounts/{accountId}/integrations/hooks
POST /api/v1/accounts/{accountId}/integrations/hooks
PATCH /api/v1/accounts/{accountId}/integrations/hooks/{hookId}
DELETE /api/v1/accounts/{accountId}/integrations/hooks/{hookId}
```

Campos suportados:

- `App ID`
- `Inbox ID`
- `Status`
- `Settings`

### Message

Operacoes suportadas:

- `Get Many`
- `Create`
- `Delete`

O node envia requisicoes para:

```text
GET /api/v1/accounts/{accountId}/conversations/{conversationId}/messages
POST /api/v1/accounts/{accountId}/conversations/{conversationId}/messages
DELETE /api/v1/accounts/{accountId}/conversations/{conversationId}/messages/{messageId}
```

Campos suportados:

- `Conversation ID`
- `After Message ID`
- `Before Message ID`
- `Content`
- `Attachments Source`
- `Attachment Binary Properties`
- `Message Type`
- `Private`
- `Content Type`
- `Content Attributes`
- `Campaign ID`
- `Template Params`

`Message -> Create` supports optional multipart uploads using n8n binary properties.

- Use `Attachment Binary Properties` with a JSON array such as `["data", "audio", "pdf"]`
- Multiple attachments are supported in the same message
- Message text becomes optional when at least one attachment is provided
- Files are sent as `attachments[]` in `multipart/form-data`

### Scheduled Message

Operacoes suportadas:

- `Get Many`
- `Get`
- `Create`
- `Update`
- `Delete`
- `Count`

The node supports two scopes:

- `Account`
- `Conversation`

O node envia requisicoes para:

```text
GET /api/v1/accounts/{accountId}/scheduled_messages
GET /api/v1/accounts/{accountId}/scheduled_messages/{scheduledMessageId}
POST /api/v1/accounts/{accountId}/scheduled_messages
PUT /api/v1/accounts/{accountId}/scheduled_messages/{scheduledMessageId}
DELETE /api/v1/accounts/{accountId}/scheduled_messages/{scheduledMessageId}
GET /api/v1/accounts/{accountId}/conversations/{conversationId}/scheduled_messages
GET /api/v1/accounts/{accountId}/conversations/{conversationId}/scheduled_messages/{scheduledMessageId}
POST /api/v1/accounts/{accountId}/conversations/{conversationId}/scheduled_messages
PUT /api/v1/accounts/{accountId}/conversations/{conversationId}/scheduled_messages/{scheduledMessageId}
DELETE /api/v1/accounts/{accountId}/conversations/{conversationId}/scheduled_messages/{scheduledMessageId}
GET /api/v1/accounts/{accountId}/conversations/{conversationId}/scheduled_messages/count
```

Campos suportados:

- `Scope`
- `Scheduled Message ID`
- `Conversation ID`
- `Inbox ID`
- `Contact ID`
- `Content`
- `Scheduled At`
- `Title`
- `Template Params`
- `Recurrence Type`
- `Recurrence Interval`
- `Recurrence Days`
- `Recurrence End Type`
- `Recurrence End Date`
- `Recurrence Max Occurrences`
- `Status`

This first implementation uses JSON payloads only. Binary attachments for scheduled messages are not implemented yet.

### Profile -> Get

Fetches the authenticated user profile from:

```text
GET /api/v1/profile
```

### Team

Operacoes suportadas:

- `Get Many`
- `Get`
- `Create`
- `Update`
- `Delete`
- `Get Agents`
- `Add Agent`
- `Remove Agent`
- `Update Agents`

O node envia requisicoes para:

```text
GET /api/v1/accounts/{accountId}/teams
GET /api/v1/accounts/{accountId}/teams/{teamId}
POST /api/v1/accounts/{accountId}/teams
PATCH /api/v1/accounts/{accountId}/teams/{teamId}
DELETE /api/v1/accounts/{accountId}/teams/{teamId}
GET /api/v1/accounts/{accountId}/teams/{teamId}/team_members
POST /api/v1/accounts/{accountId}/teams/{teamId}/team_members
DELETE /api/v1/accounts/{accountId}/teams/{teamId}/team_members
PATCH /api/v1/accounts/{accountId}/teams/{teamId}/team_members
```

Campos suportados:

- `Name`
- `Description`
- `Allow Auto Assign`
- `User IDs`

### Webhook

Operacoes suportadas:

- `Get Many`
- `Create`
- `Update`
- `Delete`

O node envia requisicoes para:

```text
GET /api/v1/accounts/{accountId}/webhooks
POST /api/v1/accounts/{accountId}/webhooks
PATCH /api/v1/accounts/{accountId}/webhooks/{webhookId}
DELETE /api/v1/accounts/{accountId}/webhooks/{webhookId}
```

Campos suportados:

- `Name`
- `URL`
- `Subscriptions`

### Conversation

Operacoes suportadas:

- `Get Counts`
- `Get Many`
- `Create`
- `Create and Send Message`
- `Filter`
- `Get`
- `Update`
- `Toggle Status`
- `Toggle Priority`
- `Toggle Typing Status`
- `Set Custom Attributes`
- `Get Labels`
- `Set Labels`
- `Get Participants`
- `Set Participants`
- `Get Reporting Events`
- `Assign`

O node envia requisicoes para:

```text
GET /api/v1/accounts/{accountId}/conversations/meta
GET /api/v1/accounts/{accountId}/conversations
POST /api/v1/accounts/{accountId}/conversations
POST /api/v1/accounts/{accountId}/conversations/filter
GET /api/v1/accounts/{accountId}/conversations/{id}
PATCH /api/v1/accounts/{accountId}/conversations/{id}
POST /api/v1/accounts/{accountId}/conversations/{id}/messages
POST /api/v1/accounts/{accountId}/conversations/{id}/toggle_status
POST /api/v1/accounts/{accountId}/conversations/{id}/toggle_priority
POST /api/v1/accounts/{accountId}/conversations/{id}/toggle_typing_status
POST /api/v1/accounts/{accountId}/conversations/{id}/custom_attributes
GET /api/v1/accounts/{accountId}/conversations/{id}/labels
POST /api/v1/accounts/{accountId}/conversations/{id}/labels
GET /api/v1/accounts/{accountId}/conversations/{id}/participants
PATCH /api/v1/accounts/{accountId}/conversations/{id}/participants
GET /api/v1/accounts/{accountId}/conversations/{id}/conversation_events
POST /api/v1/accounts/{accountId}/conversations/{id}/assignments
```

Campos suportados:

- `Conversation ID`
- `Assignee Type`
- `Status`
- `Query`
- `Inbox ID`
- `Team ID`
- `Labels`
- `Page`
- `Filter Payload`
- `Source ID`
- `Contact ID`
- `Assignee ID`
- `Initial Message`
- `Message Content`
- `Message Visibility`
- `Attachments Source`
- `Attachment Binary Properties`
- `Additional Attributes`
- `Custom Attributes`
- `Priority`
- `User IDs`
- `SLA Policy ID`
- `Snoozed Until`
- `Typing Status`
- `Private Note`

`Create` can send an optional normal first message in the conversation creation request.

`Create and Send Message` is the combined flow:

- `Normal` sends the message in `POST /conversations`
- `Private` creates the conversation first and then sends a private note in `POST /conversations/{id}/messages`

When attachments are provided in `Create and Send Message`, the node creates the conversation first and then sends the message in a second request to `POST /conversations/{id}/messages`, for both `Normal` and `Private`.

- Use `Attachment Binary Properties` with a JSON array such as `["data", "audio", "pdf"]`
- Multiple attachments are supported in the same message
- Message text becomes optional when at least one attachment is provided
- Files are sent as `attachments[]` in `multipart/form-data`

This first version supports one message only and does not expose advanced message payload fields such as `content_type`, `template_params`, `campaign_id`, or `content_attributes`.

## Validacao local

```bash
npm run lint
npm run build
```

Se voce estiver usando uma versao mais antiga do Node.js, o `@n8n/node-cli` atual pode falhar durante a validacao local. Use Node.js 22+ antes de publicar ou submeter o pacote para revisao.
