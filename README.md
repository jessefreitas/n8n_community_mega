# n8n-nodes-mega

Community node for [n8n](https://n8n.io) that creates conversations in Mega through its Chatwoot-compatible account-scoped API.

## Features

- `Mega` regular node
- `Conversation -> Create` operation
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

### Conversation -> Create

Required fields:

- `Source ID`
- `Inbox ID`
- `Contact ID`

Optional fields:

- `Status`
- `Assignee ID`
- `Initial Message`
- `Additional Attributes`
- `Custom Attributes`

The node sends requests to:

```text
POST /api/v1/accounts/{accountId}/conversations
```

## Local validation

```bash
npm run lint
npm run build
```

If you are using an older Node.js release, the current `@n8n/node-cli` can fail during local validation. Use Node.js 22+ before publishing or submitting the package for review.
