import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class MegaApi implements ICredentialType {
	name = 'megaApi';

	displayName = 'Mega API';

	documentationUrl = 'https://developers.chatwoot.com/api-reference/profile/get-user-profile';

	icon: Icon = { light: 'file:../icons/mega.svg', dark: 'file:../icons/mega.dark.svg' };

	properties: INodeProperties[] = [
		{
			displayName: 'URL Base',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://app.example.com',
			required: true,
			description: 'URL base da instância Mega ou Chatwoot',
		},
		{
			displayName: 'API Access Token',
			name: 'apiAccessToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Application token sent in the api_access_token header',
		},
		{
			displayName: 'Mega Account ID',
			name: 'accountId',
			type: 'string',
			default: '',
			required: true,
			description: 'Identificador externo da conta Chatwoot usado nas rotas com escopo de conta',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				api_access_token: '={{$credentials.apiAccessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/v1/profile',
			method: 'GET',
		},
	};
}
