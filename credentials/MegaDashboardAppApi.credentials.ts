import type { Icon, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class MegaDashboardAppApi implements ICredentialType {
	name = 'megaDashboardAppApi';

	displayName = 'Mega Dashboard App API';

	documentationUrl = 'https://github.com/jessefreitas/n8n_community_mega?tab=readme-ov-file#mega-dashboard-app';

	icon: Icon = { light: 'file:../icons/mega.svg', dark: 'file:../icons/mega.dark.svg' };

	properties: INodeProperties[] = [
		{
			displayName: 'URL Base do App',
			name: 'baseAppUrl',
			type: 'string',
			default: '',
			placeholder: 'https://n8n.example.com/webhook/mega-dashboard-app',
			required: true,
			description: 'URL pública que servirá o app embutido do dashboard',
		},
		{
			displayName: 'Segredo Compartilhado',
			name: 'sharedSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Segredo compartilhado usado entre o app embutido e os webhooks do n8n',
		},
		{
			displayName: 'Origem Mega Permitida',
			name: 'allowedMegaOrigin',
			type: 'string',
			default: '',
			placeholder: 'https://chat.example.com',
			required: true,
			description: 'Origem do Mega permitida para enviar contexto do dashboard via postMessage',
		},
		{
			displayName: 'Nome do App',
			name: 'appName',
			type: 'string',
			default: 'Mega Dashboard App',
			description: 'Nome padrão exibido nas saídas de configuração geradas',
		},
		{
			displayName: 'URL do Ícone do App',
			name: 'appIconUrl',
			type: 'string',
			default: '',
			description: 'URL opcional do ícone usada nas saídas de configuração geradas',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			url: '={{$credentials.baseAppUrl}}',
			method: 'GET',
		},
	};
}
