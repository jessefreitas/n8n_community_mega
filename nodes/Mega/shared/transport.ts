import type {
	IDataObject,
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';
import { FormData } from 'node-fetch-native';

type RequestContext =
	| IExecuteFunctions
	| IExecuteSingleFunctions
	| IHookFunctions
	| ILoadOptionsFunctions;

function normalizeBaseUrl(baseUrl: string): string {
	return baseUrl.replace(/\/+$/, '');
}

export async function megaApiRequest(
	this: RequestContext,
	method: IHttpRequestMethods,
	route: string,
	body?: IHttpRequestOptions['body'],
	qs?: IDataObject,
	requestOptions?: Partial<IHttpRequestOptions>,
) {
	const credentials = await this.getCredentials('megaApi');
	const baseUrl = normalizeBaseUrl(credentials.baseUrl as string);

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}${route}`,
		...(body !== undefined ? { body } : {}),
		...(qs !== undefined ? { qs } : {}),
		...requestOptions,
	};

	if (options.json === undefined) {
		options.json = !(typeof FormData !== 'undefined' && options.body instanceof FormData);
	}

	return this.helpers.httpRequestWithAuthentication.call(this, 'megaApi', options);
}
