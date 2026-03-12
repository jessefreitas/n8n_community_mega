import type { Icon, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class MegaDashboardAppApi implements ICredentialType {
	name = 'megaDashboardAppApi';

	displayName = 'Mega Dashboard App API';

	documentationUrl = 'https://github.com/jessefreitas/n8n_community_mega?tab=readme-ov-file#mega-dashboard-app';

	icon: Icon = { light: 'file:../icons/mega.svg', dark: 'file:../icons/mega.dark.svg' };

	properties: INodeProperties[] = [
		{
			displayName: 'Base App URL',
			name: 'baseAppUrl',
			type: 'string',
			default: '',
			placeholder: 'https://n8n.example.com/webhook/mega-dashboard-app',
			required: true,
			description: 'Public URL that will serve the embedded dashboard app',
		},
		{
			displayName: 'Shared Secret',
			name: 'sharedSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Shared secret used between the embedded app and n8n webhooks',
		},
		{
			displayName: 'Allowed Mega Origin',
			name: 'allowedMegaOrigin',
			type: 'string',
			default: '',
			placeholder: 'https://chat.example.com',
			required: true,
			description: 'Expected Mega origin allowed to send dashboard context via postMessage',
		},
		{
			displayName: 'App Name',
			name: 'appName',
			type: 'string',
			default: 'Mega Dashboard App',
			description: 'Default display name used by generated config outputs',
		},
		{
			displayName: 'App Icon URL',
			name: 'appIconUrl',
			type: 'string',
			default: '',
			description: 'Optional icon URL used by generated config outputs',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			url: '={{$credentials.baseAppUrl}}',
			method: 'GET',
		},
	};
}
