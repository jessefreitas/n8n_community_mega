import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { megaClientApiRequest } from './shared/transport';

const clientContactIdentifierProperty: INodeProperties = {
	displayName: 'Contact Identifier',
	name: 'clientContactIdentifier',
	type: 'string',
	default: '',
	required: true,
	description: 'Public contact identifier',
	displayOptions: {
		show: {
			resource: ['contact', 'conversation', 'message'],
			operation: ['create', 'get', 'getMany', 'resolve', 'toggleTypingStatus', 'update', 'updateLastSeen'],
		},
	},
};

const clientContactBaseProperties: INodeProperties[] = [
	{
		displayName: 'Identifier',
		name: 'clientContactIdentifierValue',
		type: 'string',
		default: '',
		description: 'External identifier of the contact',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create', 'update'],
			},
		},
	},
	{
		displayName: 'Identifier Hash',
		name: 'clientContactIdentifierHash',
		type: 'string',
		default: '',
		description: 'Identifier hash prepared for HMAC authentication',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create', 'update'],
			},
		},
	},
	{
		displayName: 'Email',
		name: 'clientContactEmail',
		type: 'string',
		default: '',
		placeholder: 'name@email.com',
		description: 'Email of the contact',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create', 'update'],
			},
		},
	},
	{
		displayName: 'Name',
		name: 'clientContactName',
		type: 'string',
		default: '',
		description: 'Name of the contact',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create', 'update'],
			},
		},
	},
	{
		displayName: 'Phone Number',
		name: 'clientContactPhoneNumber',
		type: 'string',
		default: '',
		description: 'Phone number of the contact',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create', 'update'],
			},
		},
	},
	{
		displayName: 'Custom Attributes',
		name: 'clientContactCustomAttributes',
		type: 'json',
		default: '{}',
		description: 'Custom attributes of the contact',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create', 'update'],
			},
		},
	},
];

const clientConversationIdProperty: INodeProperties = {
	displayName: 'Conversation ID',
	name: 'clientConversationId',
	type: 'number',
	typeOptions: {
		numberPrecision: 0,
	},
	default: 0,
	required: true,
	description: 'ID of the conversation',
	displayOptions: {
		show: {
			resource: ['conversation', 'message'],
			operation: ['create', 'get', 'getMany', 'resolve', 'toggleTypingStatus', 'update', 'updateLastSeen'],
		},
	},
};

const clientConversationCreateProperty: INodeProperties = {
	displayName: 'Custom Attributes',
	name: 'clientConversationCustomAttributes',
	type: 'json',
	default: '{}',
	description: 'Custom attributes of the conversation',
	displayOptions: {
		show: {
			resource: ['conversation'],
			operation: ['create'],
		},
	},
};

const clientTypingStatusOptions: INodePropertyOptions[] = [
	{ name: 'Off', value: 'off' },
	{ name: 'On', value: 'on' },
];

const clientTypingStatusProperty: INodeProperties = {
	displayName: 'Typing Status',
	name: 'clientTypingStatus',
	type: 'options',
	options: clientTypingStatusOptions,
	default: 'on',
	description: 'Typing status to set',
	displayOptions: {
		show: {
			resource: ['conversation'],
			operation: ['toggleTypingStatus'],
		},
	},
};

const clientMessageIdProperty: INodeProperties = {
	displayName: 'Message ID',
	name: 'clientMessageId',
	type: 'number',
	typeOptions: {
		numberPrecision: 0,
	},
	default: 0,
	required: true,
	description: 'ID of the message',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['update'],
		},
	},
};

const clientMessageCreateProperties: INodeProperties[] = [
	{
		displayName: 'Content',
		name: 'clientMessageContent',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		required: true,
		description: 'Content for the message',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Echo ID',
		name: 'clientMessageEchoId',
		type: 'string',
		default: '',
		description: 'Temporary identifier echoed back via websockets',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['create'],
			},
		},
	},
];

const clientMessageUpdateProperty: INodeProperties = {
	displayName: 'Submitted Values',
	name: 'clientMessageSubmittedValues',
	type: 'json',
	default: '{}',
	required: true,
	description: 'Submitted values object for bot replies or CSAT responses',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['update'],
		},
	},
};

const clientCsatConversationUuidProperty: INodeProperties = {
	displayName: 'Conversation UUID',
	name: 'clientConversationUuid',
	type: 'string',
	default: '',
	required: true,
	description: 'Conversation UUID used by the survey page',
	displayOptions: {
		show: {
			resource: ['csatSurvey'],
			operation: ['get'],
		},
	},
};

export class MegaClient implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mega Client',
		name: 'megaClient',
		icon: { light: 'file:../../icons/mega.svg', dark: 'file:../../icons/mega.dark.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Work with Mega Client API',
		defaults: {
			name: 'Mega Client',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'megaClientApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Contact', value: 'contact' },
					{ name: 'Conversation', value: 'conversation' },
					{ name: 'CSAT Survey', value: 'csatSurvey' },
					{ name: 'Message', value: 'message' },
				],
				default: 'contact',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a contact',
						action: 'Create a contact',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a contact',
						action: 'Get a contact',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a contact',
						action: 'Update a contact',
					},
				],
				displayOptions: {
					show: {
						resource: ['contact'],
					},
				},
				default: 'create',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a conversation',
						action: 'Create a conversation',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a single conversation',
						action: 'Get a single conversation',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'List all conversations',
						action: 'List all conversations',
					},
					{
						name: 'Resolve',
						value: 'resolve',
						action: 'Resolve a conversation',
					},
					{
						name: 'Toggle Typing Status',
						value: 'toggleTypingStatus',
						action: 'Toggle typing status',
					},
					{
						name: 'Update Last Seen',
						value: 'updateLastSeen',
						action: 'Update last seen',
					},
				],
				displayOptions: {
					show: {
						resource: ['conversation'],
					},
				},
				default: 'getMany',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get CSAT survey page',
						action: 'Get CSAT survey page',
					},
				],
				displayOptions: {
					show: {
						resource: ['csatSurvey'],
					},
				},
				default: 'get',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a message',
						action: 'Create a message',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'List all messages',
						action: 'List all messages',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a message',
						action: 'Update a message',
					},
				],
				displayOptions: {
					show: {
						resource: ['message'],
					},
				},
				default: 'getMany',
			},
			clientContactIdentifierProperty,
			...clientContactBaseProperties,
			clientConversationIdProperty,
			clientConversationCreateProperty,
			clientTypingStatusProperty,
			clientMessageIdProperty,
			...clientMessageCreateProperties,
			clientMessageUpdateProperty,
			clientCsatConversationUuidProperty,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('megaClientApi');
		const inboxIdentifier = credentials.inboxIdentifier as string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				let response: IDataObject;

				if (resource === 'contact' && operation === 'create') {
					const body: IDataObject = {};
					const identifier = this.getNodeParameter('clientContactIdentifierValue', itemIndex, '') as string;
					const identifierHash = this.getNodeParameter('clientContactIdentifierHash', itemIndex, '') as string;
					const email = this.getNodeParameter('clientContactEmail', itemIndex, '') as string;
					const name = this.getNodeParameter('clientContactName', itemIndex, '') as string;
					const phoneNumber = this.getNodeParameter('clientContactPhoneNumber', itemIndex, '') as string;
					const customAttributes = this.getNodeParameter(
						'clientContactCustomAttributes',
						itemIndex,
						{},
					) as IDataObject;

					if (identifier.trim()) body.identifier = identifier;
					if (identifierHash.trim()) body.identifier_hash = identifierHash;
					if (email.trim()) body.email = email;
					if (name.trim()) body.name = name;
					if (phoneNumber.trim()) body.phone_number = phoneNumber;
					if (Object.keys(customAttributes).length > 0) body.custom_attributes = customAttributes;

					response = (await megaClientApiRequest.call(
						this,
						'POST',
						`/public/api/v1/inboxes/${inboxIdentifier}/contacts`,
						body,
					)) as IDataObject;
				} else if (resource === 'contact' && operation === 'get') {
					const contactIdentifier = this.getNodeParameter('clientContactIdentifier', itemIndex) as string;
					response = (await megaClientApiRequest.call(
						this,
						'GET',
						`/public/api/v1/inboxes/${inboxIdentifier}/contacts/${contactIdentifier}`,
					)) as IDataObject;
				} else if (resource === 'contact' && operation === 'update') {
					const contactIdentifier = this.getNodeParameter('clientContactIdentifier', itemIndex) as string;
					const body: IDataObject = {};
					const identifier = this.getNodeParameter('clientContactIdentifierValue', itemIndex, '') as string;
					const identifierHash = this.getNodeParameter('clientContactIdentifierHash', itemIndex, '') as string;
					const email = this.getNodeParameter('clientContactEmail', itemIndex, '') as string;
					const name = this.getNodeParameter('clientContactName', itemIndex, '') as string;
					const phoneNumber = this.getNodeParameter('clientContactPhoneNumber', itemIndex, '') as string;
					const customAttributes = this.getNodeParameter(
						'clientContactCustomAttributes',
						itemIndex,
						{},
					) as IDataObject;

					if (identifier.trim()) body.identifier = identifier;
					if (identifierHash.trim()) body.identifier_hash = identifierHash;
					if (email.trim()) body.email = email;
					if (name.trim()) body.name = name;
					if (phoneNumber.trim()) body.phone_number = phoneNumber;
					if (Object.keys(customAttributes).length > 0) body.custom_attributes = customAttributes;

					response = (await megaClientApiRequest.call(
						this,
						'PATCH',
						`/public/api/v1/inboxes/${inboxIdentifier}/contacts/${contactIdentifier}`,
						body,
					)) as IDataObject;
				} else if (resource === 'conversation' && operation === 'getMany') {
					const contactIdentifier = this.getNodeParameter('clientContactIdentifier', itemIndex) as string;
					response = (await megaClientApiRequest.call(
						this,
						'GET',
						`/public/api/v1/inboxes/${inboxIdentifier}/contacts/${contactIdentifier}/conversations`,
					)) as IDataObject;
				} else if (resource === 'conversation' && operation === 'create') {
					const contactIdentifier = this.getNodeParameter('clientContactIdentifier', itemIndex) as string;
					const customAttributes = this.getNodeParameter(
						'clientConversationCustomAttributes',
						itemIndex,
						{},
					) as IDataObject;
					response = (await megaClientApiRequest.call(
						this,
						'POST',
						`/public/api/v1/inboxes/${inboxIdentifier}/contacts/${contactIdentifier}/conversations`,
						{ custom_attributes: customAttributes },
					)) as IDataObject;
				} else if (resource === 'conversation' && operation === 'get') {
					const contactIdentifier = this.getNodeParameter('clientContactIdentifier', itemIndex) as string;
					const conversationId = this.getNodeParameter('clientConversationId', itemIndex) as number;
					response = (await megaClientApiRequest.call(
						this,
						'GET',
						`/public/api/v1/inboxes/${inboxIdentifier}/contacts/${contactIdentifier}/conversations/${conversationId}`,
					)) as IDataObject;
				} else if (resource === 'conversation' && operation === 'resolve') {
					const contactIdentifier = this.getNodeParameter('clientContactIdentifier', itemIndex) as string;
					const conversationId = this.getNodeParameter('clientConversationId', itemIndex) as number;
					response = (await megaClientApiRequest.call(
						this,
						'POST',
						`/public/api/v1/inboxes/${inboxIdentifier}/contacts/${contactIdentifier}/conversations/${conversationId}/toggle_status`,
					)) as IDataObject;
				} else if (resource === 'conversation' && operation === 'toggleTypingStatus') {
					const contactIdentifier = this.getNodeParameter('clientContactIdentifier', itemIndex) as string;
					const conversationId = this.getNodeParameter('clientConversationId', itemIndex) as number;
					const typingStatus = this.getNodeParameter('clientTypingStatus', itemIndex, 'on') as string;
					response = (await megaClientApiRequest.call(
						this,
						'POST',
						`/public/api/v1/inboxes/${inboxIdentifier}/contacts/${contactIdentifier}/conversations/${conversationId}/toggle_typing`,
						{ typing_status: typingStatus },
						{ typing_status: typingStatus },
					)) as IDataObject;
				} else if (resource === 'conversation' && operation === 'updateLastSeen') {
					const contactIdentifier = this.getNodeParameter('clientContactIdentifier', itemIndex) as string;
					const conversationId = this.getNodeParameter('clientConversationId', itemIndex) as number;
					response = (await megaClientApiRequest.call(
						this,
						'POST',
						`/public/api/v1/inboxes/${inboxIdentifier}/contacts/${contactIdentifier}/conversations/${conversationId}/update_last_seen`,
					)) as IDataObject;
				} else if (resource === 'message' && operation === 'getMany') {
					const contactIdentifier = this.getNodeParameter('clientContactIdentifier', itemIndex) as string;
					const conversationId = this.getNodeParameter('clientConversationId', itemIndex) as number;
					response = (await megaClientApiRequest.call(
						this,
						'GET',
						`/public/api/v1/inboxes/${inboxIdentifier}/contacts/${contactIdentifier}/conversations/${conversationId}/messages`,
					)) as IDataObject;
				} else if (resource === 'message' && operation === 'create') {
					const contactIdentifier = this.getNodeParameter('clientContactIdentifier', itemIndex) as string;
					const conversationId = this.getNodeParameter('clientConversationId', itemIndex) as number;
					const body: IDataObject = {
						content: this.getNodeParameter('clientMessageContent', itemIndex) as string,
					};
					const echoId = this.getNodeParameter('clientMessageEchoId', itemIndex, '') as string;
					if (echoId.trim()) body.echo_id = echoId;
					response = (await megaClientApiRequest.call(
						this,
						'POST',
						`/public/api/v1/inboxes/${inboxIdentifier}/contacts/${contactIdentifier}/conversations/${conversationId}/messages`,
						body,
					)) as IDataObject;
				} else if (resource === 'message' && operation === 'update') {
					const contactIdentifier = this.getNodeParameter('clientContactIdentifier', itemIndex) as string;
					const conversationId = this.getNodeParameter('clientConversationId', itemIndex) as number;
					const messageId = this.getNodeParameter('clientMessageId', itemIndex) as number;
					const submittedValues = this.getNodeParameter(
						'clientMessageSubmittedValues',
						itemIndex,
						{},
					) as IDataObject;
					response = (await megaClientApiRequest.call(
						this,
						'PATCH',
						`/public/api/v1/inboxes/${inboxIdentifier}/contacts/${contactIdentifier}/conversations/${conversationId}/messages/${messageId}`,
						{ submitted_values: submittedValues },
					)) as IDataObject;
				} else if (resource === 'csatSurvey' && operation === 'get') {
					const conversationUuid = this.getNodeParameter('clientConversationUuid', itemIndex) as string;
					response = (await megaClientApiRequest.call(
						this,
						'GET',
						`/survey/responses/${conversationUuid}`,
					)) as IDataObject;
				} else {
					throw new NodeOperationError(this.getNode(), 'Unsupported operation', { itemIndex });
				}

				returnData.push({
					json: response,
					pairedItem: itemIndex,
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: itemIndex,
					});
					continue;
				}

				throw new NodeOperationError(this.getNode(), error as Error, {
					itemIndex,
					description:
						'Mega Client API request failed. Confirm the base URL, inbox identifier, identifiers, and payload fields.',
				});
			}
		}

		return [returnData];
	}
}
