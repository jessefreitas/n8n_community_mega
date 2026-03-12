import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

function normalizeOrigin(value: string): string {
	const trimmed = value.trim();
	const match = trimmed.match(/^(https?:\/\/[^/]+)/i);
	return (match?.[1] || trimmed).replace(/\/+$/, '');
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function buildContextBridgeScript(
	allowedMegaOrigin: string,
	backendWebhookUrl: string,
	sharedSecret: string,
): string {
	return `(() => {
  const CFG = {
    allowedMegaOrigin: ${JSON.stringify(allowedMegaOrigin)},
    backendWebhookUrl: ${JSON.stringify(backendWebhookUrl)},
    sharedSecret: ${JSON.stringify(sharedSecret)},
  };
  const state = { context: null };
  const normalizeOrigin = (value) => {
    try {
      return new URL(value).origin;
    } catch {
      return String(value || '').trim().replace(/\\/+$/, '');
    }
  };
  const emitContext = () => {
    window.dispatchEvent(new CustomEvent('mega-dashboard-context', { detail: state.context }));
  };
  window.megaDashboardApp = {
    getContext() {
      return state.context;
    },
    async send(payload = {}) {
      const response = await fetch(CFG.backendWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Mega-Shared-Secret': CFG.sharedSecret,
          'X-Mega-Source': 'dashboard-app',
        },
        body: JSON.stringify({
          context: state.context,
          payload,
        }),
      });
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return {
          ok: response.ok,
          status: response.status,
          raw: text,
        };
      }
    },
  };
  window.addEventListener('message', (event) => {
    if (
      CFG.allowedMegaOrigin &&
      normalizeOrigin(event.origin) !== normalizeOrigin(CFG.allowedMegaOrigin)
    ) {
      return;
    }
    state.context = event.data || null;
    emitContext();
  });
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'mega-dashboard-app:ready' }, '*');
  }
})();`;
}

function buildEmbedPageHtml(
	pageTitle: string,
	pageHeading: string,
	loadingText: string,
	emptyStateText: string,
	bridgeScript: string,
): string {
	return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(pageTitle)}</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #f4f1ea;
        --panel: #fffdf9;
        --text: #18222f;
        --muted: #5f6b78;
        --border: #d8d2c7;
        --accent: #0f766e;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #10161d;
          --panel: #16212b;
          --text: #edf3f8;
          --muted: #9fb0bf;
          --border: #293746;
          --accent: #4fd1c5;
        }
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 24px;
        font-family: Georgia, "Times New Roman", serif;
        background: linear-gradient(180deg, var(--bg), var(--panel));
        color: var(--text);
      }
      .wrap {
        max-width: 960px;
        margin: 0 auto;
        display: grid;
        gap: 16px;
      }
      .card {
        border: 1px solid var(--border);
        border-radius: 14px;
        background: color-mix(in srgb, var(--panel) 92%, transparent);
        padding: 18px;
      }
      h1 {
        margin: 0 0 8px;
        font-size: 28px;
        line-height: 1.1;
      }
      p {
        margin: 0;
        color: var(--muted);
      }
      pre {
        margin: 0;
        overflow: auto;
        white-space: pre-wrap;
        word-break: break-word;
        font-size: 13px;
        line-height: 1.5;
      }
      .pill {
        display: inline-block;
        padding: 6px 10px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--accent) 12%, transparent);
        color: var(--accent);
        font: 600 12px/1.2 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <span class="pill">Mega Dashboard App</span>
        <h1>${escapeHtml(pageHeading)}</h1>
        <p id="mega-dashboard-status">${escapeHtml(loadingText)}</p>
      </div>
      <div class="card">
        <pre id="mega-dashboard-context">${escapeHtml(emptyStateText)}</pre>
      </div>
    </div>
    <script>${bridgeScript}</script>
    <script>
      (() => {
        const status = document.getElementById('mega-dashboard-status');
        const contextPre = document.getElementById('mega-dashboard-context');
        const emptyState = ${JSON.stringify(emptyStateText)};
        const render = () => {
          const context = window.megaDashboardApp?.getContext?.();
          if (!context) {
            status.textContent = ${JSON.stringify(loadingText)};
            contextPre.textContent = emptyState;
            return;
          }
          status.textContent = 'Context received from Mega';
          contextPre.textContent = JSON.stringify(context, null, 2);
        };
        window.addEventListener('mega-dashboard-context', render);
        render();
      })();
    </script>
  </body>
</html>`;
}

export class MegaDashboardApp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mega Dashboard App',
		name: 'megaDashboardApp',
		icon: { light: 'file:../../icons/mega.svg', dark: 'file:../../icons/mega.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate and verify assets for a Mega dashboard app served by n8n',
		defaults: {
			name: 'Mega Dashboard App',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'megaDashboardAppApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Generate Config',
						value: 'generateConfig',
						description: 'Generate config for manual mega registration',
						action: 'Generate config for manual mega registration',
					},
					{
						name: 'Generate Context Bridge',
						value: 'generateContextBridge',
						description: 'Generate context bridge script for the embedded app',
						action: 'Generate context bridge script for the embedded app',
					},
					{
						name: 'Generate Embed Page',
						value: 'generateEmbedPage',
						description: 'Generate html page for an n8n webhook response',
						action: 'Generate html page for an n8n webhook response',
					},
					{
						name: 'Verify Request',
						value: 'verifyRequest',
						description: 'Verify request origin and shared secret',
						action: 'Verify request origin and shared secret',
					},
				],
				default: 'generateConfig',
			},
			{
				displayName: 'App Name',
				name: 'dashboardAppName',
				type: 'string',
				default: '',
				description: 'Optional name override for the generated dashboard app config',
				displayOptions: {
					show: {
						operation: ['generateConfig'],
					},
				},
			},
			{
				displayName: 'Sidebar Label',
				name: 'dashboardSidebarLabel',
				type: 'string',
				default: '',
				description: 'Optional sidebar label shown in the Mega dashboard',
				displayOptions: {
					show: {
						operation: ['generateConfig'],
					},
				},
			},
			{
				displayName: 'App Description',
				name: 'dashboardAppDescription',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				description: 'Optional description used in generated app config output',
				displayOptions: {
					show: {
						operation: ['generateConfig'],
					},
				},
			},
			{
				displayName: 'Iframe URL',
				name: 'dashboardIframeUrl',
				type: 'string',
				default: '',
				description: 'Optional iframe URL override. Leave empty to use the credential Base App URL.',
				displayOptions: {
					show: {
						operation: ['generateConfig'],
					},
				},
			},
			{
				displayName: 'Backend Webhook URL',
				name: 'dashboardBackendWebhookUrl',
				type: 'string',
				default: '',
				required: true,
				description: 'Webhook URL the embedded app should call back to in n8n',
				displayOptions: {
					show: {
						operation: ['generateContextBridge', 'generateEmbedPage'],
					},
				},
			},
			{
				displayName: 'Page Title',
				name: 'dashboardPageTitle',
				type: 'string',
				default: 'Mega Dashboard App',
				description: 'Title used in the generated HTML page',
				displayOptions: {
					show: {
						operation: ['generateEmbedPage'],
					},
				},
			},
			{
				displayName: 'Page Heading',
				name: 'dashboardPageHeading',
				type: 'string',
				default: 'Mega Dashboard App',
				description: 'Heading shown in the generated HTML page',
				displayOptions: {
					show: {
						operation: ['generateEmbedPage'],
					},
				},
			},
			{
				displayName: 'Loading Text',
				name: 'dashboardLoadingText',
				type: 'string',
				default: 'Waiting for context from Mega...',
				description: 'Loading message shown before dashboard context is received',
				displayOptions: {
					show: {
						operation: ['generateEmbedPage'],
					},
				},
			},
			{
				displayName: 'Empty State Text',
				name: 'dashboardEmptyStateText',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: 'No dashboard context received yet.',
				description: 'Fallback text shown until context arrives',
				displayOptions: {
					show: {
						operation: ['generateEmbedPage'],
					},
				},
			},
			{
				displayName: 'Request Origin',
				name: 'verifyRequestOrigin',
				type: 'string',
				default: '',
				required: true,
				description: 'Origin of the incoming request or postMessage event',
				displayOptions: {
					show: {
						operation: ['verifyRequest'],
					},
				},
			},
			{
				displayName: 'Provided Secret',
				name: 'verifyProvidedSecret',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				required: true,
				description: 'Shared secret received from the embedded app request',
				displayOptions: {
					show: {
						operation: ['verifyRequest'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('megaDashboardAppApi');
		const baseAppUrl = credentials.baseAppUrl as string;
		const sharedSecret = credentials.sharedSecret as string;
		const allowedMegaOrigin = normalizeOrigin(credentials.allowedMegaOrigin as string);
		const defaultAppName = ((credentials.appName as string) || 'Mega Dashboard App').trim();
		const defaultAppIconUrl = ((credentials.appIconUrl as string) || '').trim();

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const operation = this.getNodeParameter('operation', itemIndex) as string;
			let response: IDataObject;

			if (operation === 'generateConfig') {
				const appName = (
					(this.getNodeParameter('dashboardAppName', itemIndex, '') as string) || defaultAppName
				).trim();
				const sidebarLabel = (
					(this.getNodeParameter('dashboardSidebarLabel', itemIndex, '') as string) || appName
				).trim();
				const appDescription = this.getNodeParameter(
					'dashboardAppDescription',
					itemIndex,
					'',
				) as string;
				const iframeUrl = (
					(this.getNodeParameter('dashboardIframeUrl', itemIndex, '') as string) || baseAppUrl
				).trim();

				response = {
					app_name: appName,
					sidebar_label: sidebarLabel,
					iframe_url: iframeUrl,
					allowed_mega_origin: allowedMegaOrigin,
					shared_secret: sharedSecret,
					app_icon_url: defaultAppIconUrl || undefined,
					description: appDescription || undefined,
					manual_setup_steps: [
						'Open the Mega dashboard app configuration screen.',
						'Create a new dashboard app entry.',
						'Paste the generated iframe URL and sidebar label.',
						'Restrict the app to the allowed Mega origin.',
						'Use the shared secret in n8n webhook verification.',
					],
				};
			} else if (operation === 'generateContextBridge') {
				const backendWebhookUrl = this.getNodeParameter(
					'dashboardBackendWebhookUrl',
					itemIndex,
				) as string;

				response = {
					allowed_mega_origin: allowedMegaOrigin,
					backend_webhook_url: backendWebhookUrl,
					javascript: buildContextBridgeScript(
						allowedMegaOrigin,
						backendWebhookUrl,
						sharedSecret,
					),
				};
			} else if (operation === 'generateEmbedPage') {
				const backendWebhookUrl = this.getNodeParameter(
					'dashboardBackendWebhookUrl',
					itemIndex,
				) as string;
				const pageTitle = this.getNodeParameter('dashboardPageTitle', itemIndex) as string;
				const pageHeading = this.getNodeParameter('dashboardPageHeading', itemIndex) as string;
				const loadingText = this.getNodeParameter('dashboardLoadingText', itemIndex) as string;
				const emptyStateText = this.getNodeParameter(
					'dashboardEmptyStateText',
					itemIndex,
				) as string;
				const bridgeScript = buildContextBridgeScript(
					allowedMegaOrigin,
					backendWebhookUrl,
					sharedSecret,
				);

				response = {
					content_type: 'text/html; charset=utf-8',
					html: buildEmbedPageHtml(
						pageTitle,
						pageHeading,
						loadingText,
						emptyStateText,
						bridgeScript,
					),
				};
			} else {
				const requestOrigin = normalizeOrigin(
					this.getNodeParameter('verifyRequestOrigin', itemIndex) as string,
				);
				const providedSecret = this.getNodeParameter(
					'verifyProvidedSecret',
					itemIndex,
				) as string;
				const originValid = requestOrigin === allowedMegaOrigin;
				const secretValid = providedSecret === sharedSecret;

				response = {
					valid: originValid && secretValid,
					origin_valid: originValid,
					secret_valid: secretValid,
					expected_origin: allowedMegaOrigin,
					received_origin: requestOrigin,
					issues: [
						...(originValid ? [] : ['Origin does not match the allowed Mega origin']),
						...(secretValid ? [] : ['Shared secret does not match']),
					],
				};
			}

			returnData.push({
				json: response,
				pairedItem: itemIndex,
			});
		}

		return [returnData];
	}
}
