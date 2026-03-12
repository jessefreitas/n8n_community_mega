import type { Icon, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class MegaDashboardScriptApi implements ICredentialType {
	name = 'megaDashboardScriptApi';

	displayName = 'Mega Dashboard Script API';

	documentationUrl =
		'https://github.com/jessefreitas/n8n_community_mega?tab=readme-ov-file#mega-dashboard-script';

	icon: Icon = { light: 'file:../icons/mega.svg', dark: 'file:../icons/mega.dark.svg' };

	properties: INodeProperties[] = [
		{
			displayName: 'Base Script URL',
			name: 'baseScriptUrl',
			type: 'string',
			default: '',
			placeholder: 'https://n8n.example.com/webhook/mega-dashboard-script',
			required: true,
			description: 'Public URL that will serve the injected dashboard script',
		},
		{
			displayName: 'Default Iframe URL',
			name: 'defaultIframeUrl',
			type: 'string',
			default: '',
			placeholder: 'https://n8n.example.com/webhook/mega-dashboard-app',
			required: true,
			description: 'Default URL opened inside the embedded dashboard panel',
		},
		{
			displayName: 'Allowed Mega Origin',
			name: 'allowedMegaOrigin',
			type: 'string',
			default: '',
			placeholder: 'https://chat.example.com',
			required: true,
			description: 'Mega origin allowed to execute the injected dashboard script',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			url: '={{$credentials.baseScriptUrl}}',
			method: 'GET',
		},
	};
}
