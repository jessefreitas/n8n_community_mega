# n8n-nodes-mega

Community node for [n8n](https://n8n.io) that works with Mega through its Chatwoot-compatible account-scoped API.

## Features

- `Mega` regular node
- `Account -> Get` operation
- `Account -> Update` operation
- `Agent -> Get Many`, `Create`, `Update`, and `Delete` operations
- `Agent Bot -> Get Many`, `Create`, `Get`, `Update`, and `Delete` operations
- `Automation Rule -> Get Many`, `Create`, `Get`, `Update`, and `Delete` operations
- `Audit Log -> Get Many` operation
- `Canned Response -> Get Many`, `Create`, `Update`, and `Delete` operations
- `Contact -> Get Many`, `Create`, `Get`, `Update`, `Delete`, `Get Conversations`, `Search`, `Filter`, `Create Inbox`, `Get Contactable Inboxes`, and `Merge` operations
- `Conversation -> Get Counts`, `Get Many`, `Create`, `Filter`, `Get`, `Update`, `Toggle Status`, `Toggle Priority`, `Toggle Typing Status`, `Set Custom Attributes`, `Get Labels`, `Set Labels`, `Get Reporting Events`, and `Assign` operations
- `Custom Attribute -> Get Many`, `Create`, `Get`, `Update`, and `Delete` operations
- `Portal -> Get Many`, `Create`, and `Update` operations
- `Portal Category -> Create` operation
- `Portal Article -> Create` operation
- `Mega API` credential with `Base URL`, `API Access Token`, and `Mega Account ID`
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

### Contact

Supported operations:

- `Get Many`
- `Create`
- `Get`
- `Update`
- `Delete`
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
GET /api/v1/accounts/{accountId}/contacts/{id}/contactable_inboxes
GET /api/v1/accounts/{accountId}/contacts/{id}/labels
POST /api/v1/accounts/{accountId}/contacts/{id}/labels
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
