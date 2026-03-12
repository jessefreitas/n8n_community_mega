import type { Icon, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class MegaClientApi implements ICredentialType {
	name = 'megaClientApi';

	displayName = 'Mega Client API';

	documentationUrl = 'https://developers.chatwoot.com/api-reference';

	icon: Icon = { light: 'file:../icons/mega.svg', dark: 'file:../icons/mega.dark.svg' };

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://app.example.com',
			required: true,
			description: 'Base URL of the Mega or Chatwoot instance',
		},
		{
			displayName: 'Inbox Identifier',
			name: 'inboxIdentifier',
			type: 'string',
			default: '',
			required: true,
			description: 'Public inbox identifier used by Client APIs',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/',
			method: 'GET',
		},
	};
}
