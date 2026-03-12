# n8n-nodes-mega

Community node for [n8n](https://n8n.io) to work with Mega API.

## Features

- `Mega` regular node for account-scoped Chatwoot-compatible APIs
- `Mega Client` regular node for public Client APIs
- `Mega Dashboard App` regular node for generating embedded app assets served by n8n
- `Mega Platform` regular node for Chatwoot Platform APIs
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
- `Conversation -> Get Counts`, `Get Many`, `Create`, `Filter`, `Get`, `Update`, `Toggle Status`, `Toggle Priority`, `Toggle Typing Status`, `Set Custom Attributes`, `Get Labels`, `Set Labels`, `Get Reporting Events`, and `Assign` operations
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
- `Mega Dashboard App` credential with `Base App URL`, `Shared Secret`, and `Allowed Mega Origin`
- `Mega Client API` credential with `Base URL` and `Inbox Identifier`
- `Mega Platform API` credential with `Base URL` and `Platform API Access Token`
- Credential connection test using `GET /api/v1/profile`

## Requirements

- Node.js 22+ is required to run the current `@n8n/node-cli` build and lint commands
- npm

## Installation

```bash
npm install
npm run build
```

To use it as a local community node during development:

```bash
npm run dev
```

To install the published package into n8n:

```bash
npm install @jessefreitas/n8n-nodes-mega
```

## Credentials

Create a `Mega API` credential in n8n with:

- `Base URL`: your Mega or Chatwoot instance URL, for example `https://app.example.com`
- `API Access Token`: application token sent in the `api_access_token` header
- `Mega Account ID`: external Chatwoot account identifier used in account-scoped endpoints

The credential test calls `GET /api/v1/profile` to validate the token.

## Platform API

Use the `Mega Platform` node with the `Mega Platform API` credential for Platform App endpoints under:

```text
/platform/api/v1/*
```

Create a `Mega Platform API` credential in n8n with:

- `Base URL`: your Mega or Chatwoot instance URL
- `Platform API Access Token`: platform app token sent in the `api_access_token` header

The credential test calls:

```text
GET /platform/api/v1/accounts
```

Supported `Mega Platform` resources:

- `Account -> Create`, `Get`, `Update`, and `Delete`
- `Account User -> Get Many`, `Create`, and `Delete`
- `Agent Bot -> Get Many`, `Create`, `Get`, `Update`, and `Delete`
- `User -> Create`, `Get`, `Update`, `Delete`, and `Get SSO Link`

Important:

- `Mega` and `Mega Platform` do not share credentials
- `Mega` is for account-scoped application APIs under `/api/v1/accounts/*`
- `Mega Platform` is for Platform APIs under `/platform/api/v1/*`

## Client API

Use the `Mega Client` node with the `Mega Client API` credential for public client endpoints under:

```text
/public/api/v1/*
```

Create a `Mega Client API` credential in n8n with:

- `Base URL`: your Mega or Chatwoot instance URL
- `Inbox Identifier`: public inbox identifier used by Client APIs

Supported `Mega Client` resources:

- `Contact -> Create`, `Get`, and `Update`
- `Conversation -> Get Many`, `Create`, `Get`, `Resolve`, `Toggle Typing Status`, and `Update Last Seen`
- `Message -> Get Many`, `Create`, and `Update`
- `CSAT Survey -> Get`

Important:

- `Mega`, `Mega Platform`, and `Mega Client` do not share credentials
- `Mega Client` uses public identifiers like `inbox_identifier`, `contact_identifier`, and `conversation_id`
- `CSAT Survey` uses a public `conversation_uuid` route outside the `/public/api/v1/inboxes/*` pattern

## Mega Dashboard App

Use the `Mega Dashboard App` node with the `Mega Dashboard App` credential to generate the assets needed for an app embedded inside the Mega dashboard.

Create a `Mega Dashboard App` credential in n8n with:

- `Base App URL`: public URL that will serve the embedded app
- `Shared Secret`: secret used by the embedded app when calling back into n8n
- `Allowed Mega Origin`: expected Mega origin allowed to send `postMessage` context
- `App Name`: optional default app name for generated config
- `App Icon URL`: optional icon URL for generated config

Supported `Mega Dashboard App` operations:

- `Generate Config`
- `Generate Context Bridge`
- `Generate Embed Page`
- `Verify Request`

Important:

- `Mega Dashboard App` does not write settings into Mega automatically
- the app is registered manually in Mega using the generated config output
- the embedded app is expected to be served by an n8n webhook or another public URL you control
- dashboard script injection is out of scope for this node

## Operation

### Account -> Get

Gets account details from:

```text
GET /api/v1/accounts/{accountId}
```

### Account -> Update

Supports updating these fields:

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

The node sends requests to:

```text
PATCH /api/v1/accounts/{accountId}
```

## Mega Dashboard App Operations

The `Mega Dashboard App` node helps you prepare a dashboard app served by n8n and manually registered in Mega.

Generated outputs:

- `Generate Config`: returns app metadata, iframe URL, allowed origin, shared secret, and manual setup steps
- `Generate Context Bridge`: returns the browser JavaScript that receives Mega context via `postMessage` and forwards actions to an n8n webhook
- `Generate Embed Page`: returns HTML ready for an `HTTP Response` node or another public endpoint
- `Verify Request`: validates request origin and shared secret against the credential

Recommended flow:

1. Create a public webhook in n8n that will serve the embedded page.
2. Use `Generate Embed Page` to produce the HTML returned by that webhook.
3. Use `Generate Config` to collect the iframe URL and Mega registration values.
4. Register the app manually in Mega.
5. Use `Verify Request` in your backend workflow before processing sensitive actions.

## Mega Platform Operations

### Platform Account

Supported operations:

- `Create`
- `Get`
- `Update`
- `Delete`

The node sends requests to:

```text
POST /platform/api/v1/accounts
GET /platform/api/v1/accounts/{accountId}
PATCH /platform/api/v1/accounts/{accountId}
DELETE /platform/api/v1/accounts/{accountId}
```

Supported fields:

- `Name`
- `Locale`
- `Domain`
- `Support Email`
- `Status`
- `Limits`
- `Custom Attributes`

### Platform Account User

Supported operations:

- `Get Many`
- `Create`
- `Delete`

The node sends requests to:

```text
GET /platform/api/v1/accounts/{accountId}/account_users
POST /platform/api/v1/accounts/{accountId}/account_users
DELETE /platform/api/v1/accounts/{accountId}/account_users
```

Supported fields:

- `Account ID`
- `User ID`
- `Role`

### Platform Agent Bot

Supported operations:

- `Get Many`
- `Create`
- `Get`
- `Update`
- `Delete`

The node sends requests to:

```text
GET /platform/api/v1/agent_bots
POST /platform/api/v1/agent_bots
GET /platform/api/v1/agent_bots/{id}
PATCH /platform/api/v1/agent_bots/{id}
DELETE /platform/api/v1/agent_bots/{id}
```

Supported fields:

- `Name`
- `Description`
- `Outgoing URL`
- `Account ID`
- `Avatar URL`

The documented binary `avatar` upload field is not implemented yet in this node.

### Platform User

Supported operations:

- `Create`
- `Get`
- `Update`
- `Delete`
- `Get SSO Link`

The node sends requests to:

```text
POST /platform/api/v1/users
GET /platform/api/v1/users/{id}
PATCH /platform/api/v1/users/{id}
DELETE /platform/api/v1/users/{id}
GET /platform/api/v1/users/{id}/login
```

Supported fields:

- `Name`
- `Display Name`
- `Email`
- `Password`
- `Custom Attributes`

## Mega Client Operations

### Client Contact

Supported operations:

- `Create`
- `Get`
- `Update`

The node sends requests to:

```text
POST /public/api/v1/inboxes/{inboxIdentifier}/contacts
GET /public/api/v1/inboxes/{inboxIdentifier}/contacts/{contactIdentifier}
PATCH /public/api/v1/inboxes/{inboxIdentifier}/contacts/{contactIdentifier}
```

Supported fields:

- `Contact Identifier`
- `Identifier`
- `Identifier Hash`
- `Email`
- `Name`
- `Phone Number`
- `Custom Attributes`

The documented binary `avatar` upload field is not implemented yet in this node.

### Client Conversation

Supported operations:

- `Get Many`
- `Create`
- `Get`
- `Resolve`
- `Toggle Typing Status`
- `Update Last Seen`

The node sends requests to:

```text
GET /public/api/v1/inboxes/{inboxIdentifier}/contacts/{contactIdentifier}/conversations
POST /public/api/v1/inboxes/{inboxIdentifier}/contacts/{contactIdentifier}/conversations
GET /public/api/v1/inboxes/{inboxIdentifier}/contacts/{contactIdentifier}/conversations/{conversationId}
POST /public/api/v1/inboxes/{inboxIdentifier}/contacts/{contactIdentifier}/conversations/{conversationId}/toggle_status
POST /public/api/v1/inboxes/{inboxIdentifier}/contacts/{contactIdentifier}/conversations/{conversationId}/toggle_typing
POST /public/api/v1/inboxes/{inboxIdentifier}/contacts/{contactIdentifier}/conversations/{conversationId}/update_last_seen
```

Supported fields:

- `Contact Identifier`
- `Conversation ID`
- `Custom Attributes`
- `Typing Status`

### Client Message

Supported operations:

- `Get Many`
- `Create`
- `Update`

The node sends requests to:

```text
GET /public/api/v1/inboxes/{inboxIdentifier}/contacts/{contactIdentifier}/conversations/{conversationId}/messages
POST /public/api/v1/inboxes/{inboxIdentifier}/contacts/{contactIdentifier}/conversations/{conversationId}/messages
PATCH /public/api/v1/inboxes/{inboxIdentifier}/contacts/{contactIdentifier}/conversations/{conversationId}/messages/{messageId}
```

Supported fields:

- `Contact Identifier`
- `Conversation ID`
- `Message ID`
- `Content`
- `Echo ID`
- `Submitted Values`

### Client CSAT Survey

Supported operations:

- `Get`

The node sends requests to:

```text
GET /survey/responses/{conversationUuid}
```

Supported fields:

- `Conversation UUID`

### Audit Log -> Get Many

Lists audit log entries from:

```text
GET /api/v1/accounts/{accountId}/audit_logs
```

Available fields:

- `Page`

This endpoint is only available in Chatwoot Enterprise editions with the audit logs feature enabled.

### Agent Bot

Supported operations:

- `Get Many`
- `Create`
- `Get`
- `Update`
- `Delete`

The node sends requests to:

```text
GET /api/v1/accounts/{accountId}/agent_bots
POST /api/v1/accounts/{accountId}/agent_bots
GET /api/v1/accounts/{accountId}/agent_bots/{id}
PATCH /api/v1/accounts/{accountId}/agent_bots/{id}
DELETE /api/v1/accounts/{accountId}/agent_bots/{id}
```

Supported fields:

- `Name`
- `Description`
- `Outgoing URL`
- `Avatar URL`
- `Bot Type`
- `Bot Config`

The documented binary `avatar` upload field is not implemented yet in this node. Use `Avatar URL` instead.

### Agent

Supported operations:

- `Get Many`
- `Create`
- `Update`
- `Delete`

The node sends requests to:

```text
GET /api/v1/accounts/{accountId}/agents
POST /api/v1/accounts/{accountId}/agents
PATCH /api/v1/accounts/{accountId}/agents/{id}
DELETE /api/v1/accounts/{accountId}/agents/{id}
```

Supported fields:

- `Name`
- `Email`
- `Role`
- `Availability Status`
- `Auto Offline`

### Automation Rule

Supported operations:

- `Get Many`
- `Create`
- `Get`
- `Update`
- `Delete`

The node sends requests to:

```text
GET /api/v1/accounts/{accountId}/automation_rules
POST /api/v1/accounts/{accountId}/automation_rules
GET /api/v1/accounts/{accountId}/automation_rules/{id}
PATCH /api/v1/accounts/{accountId}/automation_rules/{id}
DELETE /api/v1/accounts/{accountId}/automation_rules/{id}
```

Supported fields:

- `Name`
- `Description`
- `Event Name`
- `Active`
- `Actions`
- `Conditions`

### Campaign

Supported operations:

- `Create`

The node sends requests to:

```text
POST /api/v1/accounts/{accountId}/campaigns
```

Supported fields:

- `Title`
- `Message`
- `Inbox ID`
- `Scheduled At`
- `Trigger Only During Business Hours`
- `Template Params`
- `Audience Labels`

This first implementation covers only campaign creation and models `audience` as label references in the form `{ id, type: "Label" }`.

### Canned Response

Supported operations:

- `Get Many`
- `Create`
- `Update`
- `Delete`

The node sends requests to:

```text
GET /api/v1/accounts/{accountId}/canned_responses
POST /api/v1/accounts/{accountId}/canned_responses
PATCH /api/v1/accounts/{accountId}/canned_responses/{id}
DELETE /api/v1/accounts/{accountId}/canned_responses/{id}
```

Supported fields:

- `Short Code`
- `Content`

### Chat Room

Supported operations:

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

The node sends requests to:

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

Supported fields:

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

Supported operations:

- `Get Many`
- `Create`
- `Get`
- `Update`
- `Delete`

The node sends requests to:

```text
GET /api/v1/accounts/{accountId}/custom_filters
POST /api/v1/accounts/{accountId}/custom_filters
GET /api/v1/accounts/{accountId}/custom_filters/{customFilterId}
PATCH /api/v1/accounts/{accountId}/custom_filters/{customFilterId}
DELETE /api/v1/accounts/{accountId}/custom_filters/{customFilterId}
```

Supported fields:

- `Filter Type`
- `Name`
- `Type`
- `Query`

### Contact

Supported operations:

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
- `Set Labels`
- `Merge`

The node sends requests to:

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

Supported fields:

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

Supported operations:

- `Get Many`
- `Create`
- `Update`

The node sends requests to:

```text
GET /api/v1/accounts/{accountId}/portals
POST /api/v1/accounts/{accountId}/portals
PATCH /api/v1/accounts/{accountId}/portals/{id}
```

Supported fields:

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

Supported operations:

- `Create`

The node sends requests to:

```text
POST /api/v1/accounts/{accountId}/portals/{id}/categories
```

Supported fields:

- `Name`
- `Description`
- `Position`
- `Slug`
- `Locale`
- `Icon`
- `Parent Category ID`
- `Associated Category ID`

### Portal Article

Supported operations:

- `Create`

The node sends requests to:

```text
POST /api/v1/accounts/{accountId}/portals/{id}/articles
```

Supported fields:

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

Supported operations:

- `Get Many`
- `Create`
- `Get`
- `Update`
- `Delete`

The node sends requests to:

```text
GET /api/v1/accounts/{accountId}/custom_attribute_definitions
POST /api/v1/accounts/{accountId}/custom_attribute_definitions
GET /api/v1/accounts/{accountId}/custom_attribute_definitions/{id}
PATCH /api/v1/accounts/{accountId}/custom_attribute_definitions/{id}
DELETE /api/v1/accounts/{accountId}/custom_attribute_definitions/{id}
```

Supported fields:

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

Supported operations:

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

The node sends requests to:

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

Supported fields:

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

Supported operations:

- `Get Many`
- `Create`
- `Update`
- `Delete`

The node sends requests to:

```text
GET /api/v1/accounts/{accountId}/integrations/hooks
POST /api/v1/accounts/{accountId}/integrations/hooks
PATCH /api/v1/accounts/{accountId}/integrations/hooks/{hookId}
DELETE /api/v1/accounts/{accountId}/integrations/hooks/{hookId}
```

Supported fields:

- `App ID`
- `Inbox ID`
- `Status`
- `Settings`

### Message

Supported operations:

- `Get Many`
- `Create`
- `Delete`

The node sends requests to:

```text
GET /api/v1/accounts/{accountId}/conversations/{conversationId}/messages
POST /api/v1/accounts/{accountId}/conversations/{conversationId}/messages
DELETE /api/v1/accounts/{accountId}/conversations/{conversationId}/messages/{messageId}
```

Supported fields:

- `Conversation ID`
- `After Message ID`
- `Before Message ID`
- `Content`
- `Message Type`
- `Private`
- `Content Type`
- `Content Attributes`
- `Campaign ID`
- `Template Params`

### Scheduled Message

Supported operations:

- `Get Many`
- `Get`
- `Create`
- `Update`
- `Delete`
- `Count`

The node supports two scopes:

- `Account`
- `Conversation`

The node sends requests to:

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

Supported fields:

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

Supported operations:

- `Get Many`
- `Get`
- `Create`
- `Update`
- `Delete`
- `Get Agents`
- `Add Agent`
- `Remove Agent`
- `Update Agents`

The node sends requests to:

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

Supported fields:

- `Name`
- `Description`
- `Allow Auto Assign`
- `User IDs`

### Webhook

Supported operations:

- `Get Many`
- `Create`
- `Update`
- `Delete`

The node sends requests to:

```text
GET /api/v1/accounts/{accountId}/webhooks
POST /api/v1/accounts/{accountId}/webhooks
PATCH /api/v1/accounts/{accountId}/webhooks/{webhookId}
DELETE /api/v1/accounts/{accountId}/webhooks/{webhookId}
```

Supported fields:

- `Name`
- `URL`
- `Subscriptions`

### Conversation

Supported operations:

- `Get Counts`
- `Get Many`
- `Create`
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

The node sends requests to:

```text
GET /api/v1/accounts/{accountId}/conversations/meta
GET /api/v1/accounts/{accountId}/conversations
POST /api/v1/accounts/{accountId}/conversations
POST /api/v1/accounts/{accountId}/conversations/filter
GET /api/v1/accounts/{accountId}/conversations/{id}
PATCH /api/v1/accounts/{accountId}/conversations/{id}
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

Supported fields:

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
- `Additional Attributes`
- `Custom Attributes`
- `Priority`
- `User IDs`
- `SLA Policy ID`
- `Snoozed Until`
- `Typing Status`
- `Private Note`

## Local validation

```bash
npm run lint
npm run build
```

If you are using an older Node.js release, the current `@n8n/node-cli` can fail during local validation. Use Node.js 22+ before publishing or submitting the package for review.
