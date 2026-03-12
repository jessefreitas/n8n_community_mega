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

function buildDashboardScript(config: {
	allowedMegaOrigin: string;
	autoHideOnNavigation: boolean;
	iframeUrl: string;
	linkIcon: string;
	linkText: string;
	padding: number;
	positionIndex: number;
	positionLabel: string;
	positionMode: string;
	showBorder: boolean;
}): string {
	return `(() => {
  const CFG = ${JSON.stringify(config, null, 2)};

  const $ = (selector, root = document) => {
    try {
      return root.querySelector(selector);
    } catch {
      return null;
    }
  };

  const $$ = (selector, root = document) => {
    try {
      return Array.from(root.querySelectorAll(selector));
    } catch {
      return [];
    }
  };

  const normalize = (value) => String(value || '').toLowerCase().replace(/\\s+/g, ' ').trim();

  const normalizeOrigin = (value) => {
    try {
      return new URL(value).origin.replace(/\\/+$/, '');
    } catch {
      return String(value || '').trim().replace(/\\/+$/, '');
    }
  };

  if (
    CFG.allowedMegaOrigin &&
    normalizeOrigin(window.location.origin) !== normalizeOrigin(CFG.allowedMegaOrigin)
  ) {
    return;
  }

  function findSidebar() {
    return $('[data-testid="sidebar-primary"]') || $('aside');
  }

  function findAnyList() {
    const sidebar = findSidebar();
    if (!sidebar) return null;
    return $('ul', sidebar);
  }

  function findListAndReferenceByLabel(labelWanted) {
    const sidebar = findSidebar();
    if (!sidebar) return { list: null, ref: null };

    const wanted = normalize(labelWanted);
    const lists = $$('ul', sidebar);

    for (const list of lists) {
      const items = $$(':scope > li', list);
      for (const item of items) {
        const text = normalize(item.textContent);
        if (text === wanted || text.includes(wanted)) {
          return { list, ref: item };
        }
      }
    }

    return { list: null, ref: null };
  }

  function setLinkActive(active) {
    const link = $('#mega-dashboard-script-link-anchor');
    if (!link) return;
    link.style.background = active ? 'rgba(15, 118, 110, 0.12)' : 'transparent';
  }

  function ensurePanel() {
    if ($('#mega-dashboard-script-panel')) return $('#mega-dashboard-script-panel');

    const panel = document.createElement('div');
    panel.id = 'mega-dashboard-script-panel';
    panel.style.cssText =
      'position:fixed;inset:auto 0 0 0;top:0;z-index:9;display:none;pointer-events:none;';

    const frameWrap = document.createElement('div');
    frameWrap.id = 'mega-dashboard-script-frame-wrap';
    frameWrap.style.cssText =
      'height:100%;width:100%;padding:0;pointer-events:auto;background:transparent;';

    const iframe = document.createElement('iframe');
    iframe.id = 'mega-dashboard-script-iframe';
    iframe.setAttribute('title', CFG.linkText || 'Mega Dashboard Script');
    iframe.style.cssText = 'width:100%;height:100%;border:0;border-radius:12px;background:transparent;';

    frameWrap.appendChild(iframe);
    panel.appendChild(frameWrap);
    document.body.appendChild(panel);

    const applyTheme = () => {
      const frameWrapEl = $('#mega-dashboard-script-frame-wrap');
      if (!frameWrapEl) return;

      const bodyStyles = window.getComputedStyle(document.body);
      const borderColor =
        bodyStyles.getPropertyValue('--border-color') ||
        bodyStyles.getPropertyValue('--color-border') ||
        'rgba(24, 34, 47, 0.12)';

      frameWrapEl.style.padding = String(Number(CFG.padding) || 0) + 'px';
      frameWrapEl.style.background = 'transparent';
      frameWrapEl.style.border = CFG.showBorder ? '1px solid ' + borderColor.trim() : '0';
      frameWrapEl.style.boxSizing = 'border-box';
    };

    const layout = () => {
      const sidebar = findSidebar();
      if (!sidebar) return;

      const rect = sidebar.getBoundingClientRect();
      panel.style.left = rect.right + 'px';
      panel.style.width = Math.max(window.innerWidth - rect.right, 0) + 'px';
      panel.style.height = window.innerHeight + 'px';
    };

    window.__megaDashboardScriptShow = () => {
      iframe.src = CFG.iframeUrl;
      layout();
      applyTheme();
      panel.style.display = 'block';
      setLinkActive(true);
    };

    window.__megaDashboardScriptHide = () => {
      panel.style.display = 'none';
      iframe.src = 'about:blank';
      setLinkActive(false);
    };

    applyTheme();
    layout();
    window.addEventListener('resize', layout, { passive: true });
    window.addEventListener('resize', applyTheme, { passive: true });
    new MutationObserver(() => {
      applyTheme();
      layout();
    }).observe(document.body, { attributes: true, childList: true, subtree: true });

    return panel;
  }

  function ensureSidebarLink() {
    if ($('#mega-dashboard-script-link')) return;

    const item = document.createElement('li');
    item.id = 'mega-dashboard-script-link';
    item.style.listStyle = 'none';

    item.innerHTML = '<a id="mega-dashboard-script-link-anchor" href="javascript:void(0)" style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;text-decoration:none;color:inherit;"><span></span><span></span></a>';

    const link = $('#mega-dashboard-script-link-anchor', item);
    const icon = $('span:first-child', item);
    const text = $('span:last-child', item);

    if (icon) icon.textContent = CFG.linkIcon || 'M';
    if (text) text.textContent = CFG.linkText || 'Mega Script';

    let parentList = null;
    let reference = null;

    if (CFG.positionMode === 'afterLabel' || CFG.positionMode === 'beforeLabel') {
      const found = findListAndReferenceByLabel(CFG.positionLabel);
      parentList = found.list;
      reference = found.ref;
    }

    if (!parentList) parentList = findAnyList();
    if (!parentList) return;

    const items = $$(':scope > li', parentList);

    switch (CFG.positionMode) {
      case 'start':
        parentList.insertBefore(item, items[0] || null);
        break;
      case 'index':
        parentList.insertBefore(
          item,
          items[Math.max(0, Math.min(Number(CFG.positionIndex) || 0, items.length))] || null,
        );
        break;
      case 'afterLabel':
        if (reference && reference.nextSibling) parentList.insertBefore(item, reference.nextSibling);
        else parentList.appendChild(item);
        break;
      case 'beforeLabel':
        if (reference) parentList.insertBefore(item, reference);
        else parentList.insertBefore(item, items[0] || null);
        break;
      case 'end':
      default:
        parentList.appendChild(item);
        break;
    }

    if (link) {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const panel = ensurePanel();
        if (!panel) return;

        if (panel.style.display === 'block') {
          window.__megaDashboardScriptHide?.();
        } else {
          window.__megaDashboardScriptShow?.();
        }
      });
    }
  }

  function bindSidebarNavigationHide() {
    if (!CFG.autoHideOnNavigation) return;

    const sidebar = findSidebar();
    if (!sidebar || sidebar.dataset.megaDashboardScriptHideBound === '1') return;

    sidebar.dataset.megaDashboardScriptHideBound = '1';
    sidebar.addEventListener(
      'click',
      (event) => {
        const target = event.target;
        const ownLink = $('#mega-dashboard-script-link');
        if (ownLink && target instanceof Node && ownLink.contains(target)) return;
        window.__megaDashboardScriptHide?.();
      },
      true,
    );
  }

  function boot() {
    ensurePanel();
    ensureSidebarLink();
    bindSidebarNavigationHide();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  new MutationObserver(() => {
    ensureSidebarLink();
    bindSidebarNavigationHide();
  }).observe(document.body, { childList: true, subtree: true });
})();`;
}

export class MegaDashboardScript implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mega Dashboard Script',
		name: 'megaDashboardScript',
		icon: { light: 'file:../../icons/mega.svg', dark: 'file:../../icons/mega.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate an injectable Mega dashboard script for sidebar buttons and embedded panels',
		defaults: {
			name: 'Mega Dashboard Script',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'megaDashboardScriptApi',
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
						description: 'Generate config and setup instructions for a Mega dashboard script',
						action: 'Generate config and setup instructions for a mega dashboard script',
					},
					{
						name: 'Generate Script',
						value: 'generateScript',
						description: 'Generate the injected JavaScript for a Mega dashboard script URL',
						action: 'Generate the injected script for a mega dashboard script URL',
					},
				],
				default: 'generateConfig',
			},
			{
				displayName: 'Link Text',
				name: 'linkText',
				type: 'string',
				default: 'Meu Aplicativo',
				required: true,
				description: 'Visible label used for the sidebar link',
			},
			{
				displayName: 'Link Icon',
				name: 'linkIcon',
				type: 'string',
				default: 'M',
				description: 'Short icon text displayed beside the sidebar link label',
			},
			{
				displayName: 'Iframe URL',
				name: 'iframeUrl',
				type: 'string',
				default: '',
				description: 'Optional iframe URL override. Leave empty to use the credential Default Iframe URL.',
			},
			{
				displayName: 'Position Mode',
				name: 'positionMode',
				type: 'options',
				options: [
					{ name: 'After Label', value: 'afterLabel' },
					{ name: 'Before Label', value: 'beforeLabel' },
					{ name: 'End', value: 'end' },
					{ name: 'Index', value: 'index' },
					{ name: 'Start', value: 'start' },
				],
				default: 'afterLabel',
				description: 'How the link should be inserted into the Mega sidebar',
			},
			{
				displayName: 'Position Label',
				name: 'positionLabel',
				type: 'string',
				default: 'Conversas',
				description: 'Reference label used by the beforeLabel and afterLabel modes',
				displayOptions: {
					show: {
						positionMode: ['afterLabel', 'beforeLabel'],
					},
				},
			},
			{
				displayName: 'Position Index',
				name: 'positionIndex',
				type: 'number',
				typeOptions: {
					numberPrecision: 0,
				},
				default: 0,
				description: 'Index used when the position mode is index',
				displayOptions: {
					show: {
						positionMode: ['index'],
					},
				},
			},
			{
				displayName: 'Panel Padding',
				name: 'panelPadding',
				type: 'number',
				default: 0,
				description: 'Padding applied around the embedded panel in pixels',
			},
			{
				displayName: 'Show Border',
				name: 'showBorder',
				type: 'boolean',
				default: true,
				description: 'Whether to render a border around the embedded panel',
			},
			{
				displayName: 'Auto Hide On Navigation',
				name: 'autoHideOnNavigation',
				type: 'boolean',
				default: true,
				description: 'Whether to hide the embedded panel when another sidebar item is clicked',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('megaDashboardScriptApi');
		const baseScriptUrl = (credentials.baseScriptUrl as string).trim();
		const defaultIframeUrl = (credentials.defaultIframeUrl as string).trim();
		const allowedMegaOrigin = normalizeOrigin(credentials.allowedMegaOrigin as string);

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const operation = this.getNodeParameter('operation', itemIndex) as string;
			const linkText = (this.getNodeParameter('linkText', itemIndex) as string).trim();
			const linkIcon = (this.getNodeParameter('linkIcon', itemIndex) as string).trim();
			const iframeUrl =
				((this.getNodeParameter('iframeUrl', itemIndex, '') as string) || defaultIframeUrl).trim();
			const positionMode = this.getNodeParameter('positionMode', itemIndex) as string;
			const positionLabel = (this.getNodeParameter('positionLabel', itemIndex, '') as string).trim();
			const positionIndex = this.getNodeParameter('positionIndex', itemIndex, 0) as number;
			const panelPadding = this.getNodeParameter('panelPadding', itemIndex, 0) as number;
			const showBorder = this.getNodeParameter('showBorder', itemIndex, true) as boolean;
			const autoHideOnNavigation = this.getNodeParameter(
				'autoHideOnNavigation',
				itemIndex,
				true,
			) as boolean;

			const scriptConfig = {
				allowedMegaOrigin,
				autoHideOnNavigation,
				iframeUrl,
				linkIcon,
				linkText,
				padding: panelPadding,
				positionIndex,
				positionLabel,
				positionMode,
				showBorder,
			};

			let response: IDataObject;

			if (operation === 'generateScript') {
				response = {
					content_type: 'application/javascript; charset=utf-8',
					javascript: buildDashboardScript(scriptConfig),
					script_url: baseScriptUrl,
					iframe_url: iframeUrl,
					allowed_mega_origin: allowedMegaOrigin,
				};
			} else {
				const inlineLoader = `(() => {
  const script = document.createElement('script');
  script.src = ${JSON.stringify(baseScriptUrl)};
  script.async = true;
  document.head.appendChild(script);
})();`;

				response = {
					script_url: baseScriptUrl,
					iframe_url: iframeUrl,
					allowed_mega_origin: allowedMegaOrigin,
					inline_loader_javascript: inlineLoader,
					script_config: scriptConfig,
					manual_setup_steps: [
						'Create a public n8n webhook that returns the generated JavaScript with content-type application/javascript.',
						'Use the Base Script URL in the Mega dashboard script configuration.',
						'If Mega expects inline code instead of a URL, use the generated inline loader JavaScript.',
						'Point the iframe URL to the app or page that should open inside the Mega panel.',
						'Reload the Mega dashboard and confirm the sidebar link appears in the configured position.',
					],
				};
			}

			returnData.push({ json: response });
		}

		return [returnData];
	}
}
