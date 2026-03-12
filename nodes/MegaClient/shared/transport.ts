import type {
	IDataObject,
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

type RequestContext =
	| IExecuteFunctions
	| IExecuteSingleFunctions
	| IHookFunctions
	| ILoadOptionsFunctions;

function normalizeBaseUrl(baseUrl: string): string {
	return baseUrl.replace(/\/+$/, '');
}

export async function megaClientApiRequest(
	this: RequestContext,
	method: IHttpRequestMethods,
	route: string,
	body?: IDataObject,
	qs?: IDataObject,
) {
	const credentials = await this.getCredentials('megaClientApi');
	const baseUrl = normalizeBaseUrl(credentials.baseUrl as string);

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}${route}`,
		body,
		qs,
		json: true,
	};

	return this.helpers.httpRequest.call(this, options);
}
