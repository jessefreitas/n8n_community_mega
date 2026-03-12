import type { Icon, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class MegaClientApi implements ICredentialType {
	name = 'megaClientApi';

	displayName = 'Mega Client API';

	documentationUrl = 'https://developers.chatwoot.com/api-reference';

	icon: Icon = { light: 'file:../icons/mega.svg', dark: 'file:../icons/mega.dark.svg' };

	properties: INodeProperties[] = [
		{
			displayName: 'URL Base',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://app.example.com',
			required: true,
			description: 'URL base da instância Mega',
		},
		{
			displayName: 'Inbox Identifier',
			name: 'inboxIdentifier',
			type: 'string',
			default: '',
			required: true,
			description: 'Identificador público da caixa de entrada usado pelas APIs Client',
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
