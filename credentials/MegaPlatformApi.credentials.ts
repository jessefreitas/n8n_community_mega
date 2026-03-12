import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class MegaPlatformApi implements ICredentialType {
	name = 'megaPlatformApi';

	displayName = 'Mega Platform API';

	documentationUrl = 'https://developers.chatwoot.com/contributing-guide/chatwoot-platform-apis';

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
			displayName: 'Platform API Access Token',
			name: 'apiAccessToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Platform app token sent in the api_access_token header',
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
			url: '/platform/api/v1/accounts',
			method: 'GET',
		},
	};
}
