import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { megaApiRequest } from './shared/transport';

const conversationCreateProperties: INodeProperties[] = [
	{
		displayName: 'Source ID',
		name: 'sourceId',
		type: 'string',
		default: '',
		required: true,
		description: 'Source identifier of the contact inbox used to create the conversation',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Inbox ID',
		name: 'inboxId',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 0,
		required: true,
		description: 'Inbox identifier that will own the conversation',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 0,
		required: true,
		description: 'Contact identifier linked to the new conversation',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{ name: 'Open', value: 'open' },
			{ name: 'Pending', value: 'pending' },
			{ name: 'Resolved', value: 'resolved' },
			{ name: 'Snoozed', value: 'snoozed' },
		],
		default: 'open',
		description: 'Initial status for the created conversation',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Assignee ID',
		name: 'assigneeId',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 0,
		description: 'Optional assignee identifier',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Initial Message',
		name: 'messageContent',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		description: 'Optional first message sent together with the conversation',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Additional Attributes',
		name: 'additionalAttributes',
		type: 'json',
		default: '{}',
		description: 'Optional JSON object sent as additional_attributes',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Custom Attributes',
		name: 'customAttributes',
		type: 'json',
		default: '{}',
		description: 'Optional JSON object sent as custom_attributes',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['create'],
			},
		},
	},
];

export class Mega implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mega',
		name: 'mega',
		icon: { light: 'file:../../icons/mega.svg', dark: 'file:../../icons/mega.dark.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Create conversations in Mega through the Chatwoot-compatible API',
		defaults: {
			name: 'Mega',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'megaApi',
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
					{
						name: 'Conversation',
						value: 'conversation',
					},
				],
				default: 'conversation',
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
				],
				default: 'create',
				displayOptions: {
					show: {
						resource: ['conversation'],
					},
				},
			},
			...conversationCreateProperties,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('megaApi');
		const accountId = credentials.accountId as string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;

				if (resource !== 'conversation' || operation !== 'create') {
					throw new NodeOperationError(this.getNode(), 'Unsupported operation', { itemIndex });
				}

				const body: IDataObject = {
					source_id: this.getNodeParameter('sourceId', itemIndex) as string,
					inbox_id: this.getNodeParameter('inboxId', itemIndex) as number,
					contact_id: this.getNodeParameter('contactId', itemIndex) as number,
					status: this.getNodeParameter('status', itemIndex) as string,
				};

				const assigneeId = this.getNodeParameter('assigneeId', itemIndex) as number;
				const messageContent = this.getNodeParameter('messageContent', itemIndex) as string;
				const additionalAttributes = this.getNodeParameter(
					'additionalAttributes',
					itemIndex,
					{},
				) as IDataObject;
				const customAttributes = this.getNodeParameter(
					'customAttributes',
					itemIndex,
					{},
				) as IDataObject;

				if (assigneeId > 0) {
					body.assignee_id = assigneeId;
				}

				if (messageContent.trim()) {
					body.message = {
						content: messageContent,
					};
				}

				if (Object.keys(additionalAttributes).length > 0) {
					body.additional_attributes = additionalAttributes;
				}

				if (Object.keys(customAttributes).length > 0) {
					body.custom_attributes = customAttributes;
				}

				const response = await megaApiRequest.call(
					this,
					'POST',
					`/api/v1/accounts/${accountId}/conversations`,
					body,
				);

				returnData.push({
					json: response as IDataObject,
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
						'Mega API request failed. Confirm the base URL, API access token, account ID, and payload fields.',
				});
			}
		}

		return [returnData];
	}
}
