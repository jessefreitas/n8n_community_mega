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

const conversationStatusOptions: INodePropertyOptions[] = [
	{ name: 'All', value: 'all' },
	{ name: 'Open', value: 'open' },
	{ name: 'Pending', value: 'pending' },
	{ name: 'Resolved', value: 'resolved' },
	{ name: 'Snoozed', value: 'snoozed' },
];

const conversationOpenStatusOptions: INodePropertyOptions[] = conversationStatusOptions.filter(
	(option) => option.value !== 'all',
);

const conversationPriorityOptions: INodePropertyOptions[] = [
	{ name: 'None', value: 'none' },
	{ name: 'Low', value: 'low' },
	{ name: 'Medium', value: 'medium' },
	{ name: 'High', value: 'high' },
	{ name: 'Urgent', value: 'urgent' },
];

const conversationAssigneeTypeOptions: INodePropertyOptions[] = [
	{ name: 'All', value: 'all' },
	{ name: 'Assigned', value: 'assigned' },
	{ name: 'Me', value: 'me' },
	{ name: 'Unassigned', value: 'unassigned' },
];

const conversationTypingStatusOptions: INodePropertyOptions[] = [
	{ name: 'Off', value: 'off' },
	{ name: 'On', value: 'on' },
];

const conversationIdProperty: INodeProperties = {
	displayName: 'Conversation ID',
	name: 'conversationId',
	type: 'number',
	typeOptions: {
		numberPrecision: 0,
	},
	default: 0,
	required: true,
	description: 'ID of the conversation',
	displayOptions: {
		show: {
			resource: ['conversation'],
			operation: [
				'assign',
				'get',
				'getLabels',
				'getReportingEvents',
				'setCustomAttributes',
				'setLabels',
				'togglePriority',
				'toggleStatus',
				'toggleTypingStatus',
				'update',
			],
		},
	},
};

const conversationListProperties: INodeProperties[] = [
	{
		displayName: 'Assignee Type',
		name: 'conversationAssigneeType',
		type: 'options',
		options: conversationAssigneeTypeOptions,
		default: 'all',
		description: 'Filter conversations by assignee type',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['getMany'],
			},
		},
	},
	{
		displayName: 'Status',
		name: 'conversationListStatus',
		type: 'options',
		options: conversationStatusOptions,
		default: 'open',
		description: 'Filter conversations by status',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['getCounts', 'getMany'],
			},
		},
	},
	{
		displayName: 'Query',
		name: 'conversationQuery',
		type: 'string',
		default: '',
		description: 'Search term for messages in the conversation list',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['getCounts', 'getMany'],
			},
		},
	},
	{
		displayName: 'Inbox ID',
		name: 'conversationListInboxId',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 0,
		description: 'Filter by inbox ID',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['getCounts', 'getMany'],
			},
		},
	},
	{
		displayName: 'Team ID',
		name: 'conversationListTeamId',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 0,
		description: 'Filter by team ID',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['getCounts', 'getMany'],
			},
		},
	},
	{
		displayName: 'Labels',
		name: 'conversationListLabels',
		type: 'json',
		default: '[]',
		description: 'JSON array of labels to filter conversations',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['getCounts', 'getMany'],
			},
		},
	},
	{
		displayName: 'Page',
		name: 'conversationPage',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 1,
		description: 'Page number for pagination',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['getMany'],
			},
		},
	},
];

const conversationFilterProperty: INodeProperties = {
	displayName: 'Filter Payload',
	name: 'conversationFilterPayload',
	type: 'json',
	default: '[]',
	required: true,
	description: 'JSON array of conversation filter rules',
	displayOptions: {
		show: {
			resource: ['conversation'],
			operation: ['filter'],
		},
	},
};

const conversationUpdateProperties: INodeProperties[] = [
	{
		displayName: 'Priority',
		name: 'conversationPriority',
		type: 'options',
		options: conversationPriorityOptions,
		default: 'none',
		description: 'Priority of the conversation',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['update'],
			},
		},
	},
	{
		displayName: 'SLA Policy ID',
		name: 'conversationSlaPolicyId',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 0,
		description: 'ID of the SLA policy. Enterprise only.',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['update'],
			},
		},
	},
];

const conversationToggleStatusProperties: INodeProperties[] = [
	{
		displayName: 'Status',
		name: 'conversationToggleStatusValue',
		type: 'options',
		options: conversationOpenStatusOptions,
		default: 'open',
		description: 'Status to set on the conversation',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['toggleStatus'],
			},
		},
	},
	{
		displayName: 'Snoozed Until',
		name: 'conversationSnoozedUntil',
		type: 'number',
		default: 0,
		description: 'Unix timestamp in seconds used when the status is snoozed',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['toggleStatus'],
				conversationToggleStatusValue: ['snoozed'],
			},
		},
	},
];

const conversationTogglePriorityProperty: INodeProperties = {
	displayName: 'Priority',
	name: 'conversationTogglePriorityValue',
	type: 'options',
	options: conversationPriorityOptions,
	default: 'none',
	description: 'Priority to set on the conversation',
	displayOptions: {
		show: {
			resource: ['conversation'],
			operation: ['togglePriority'],
		},
	},
};

const conversationTypingProperties: INodeProperties[] = [
	{
		displayName: 'Typing Status',
		name: 'conversationTypingStatus',
		type: 'options',
		options: conversationTypingStatusOptions,
		default: 'on',
		description: 'Typing status to set',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['toggleTypingStatus'],
			},
		},
	},
	{
		displayName: 'Private Note',
		name: 'conversationTypingPrivate',
		type: 'boolean',
		default: false,
		description: 'Whether the typing status applies to private notes',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['toggleTypingStatus'],
			},
		},
	},
];

const conversationCustomAttributesProperty: INodeProperties = {
	displayName: 'Custom Attributes',
	name: 'conversationCustomAttributesPayload',
	type: 'json',
	default: '{}',
	required: true,
	description: 'Custom attributes object to store on the conversation',
	displayOptions: {
		show: {
			resource: ['conversation'],
			operation: ['setCustomAttributes'],
		},
	},
};

const conversationLabelsProperty: INodeProperties = {
	displayName: 'Labels',
	name: 'conversationLabels',
	type: 'json',
	default: '[]',
	required: true,
	description: 'JSON array of labels for the conversation',
	displayOptions: {
		show: {
			resource: ['conversation'],
			operation: ['setLabels'],
		},
	},
};

const conversationAssignmentProperties: INodeProperties[] = [
	{
		displayName: 'Assignee ID',
		name: 'conversationAssignmentAssigneeId',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 0,
		description: 'ID of the assignee user',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['assign'],
			},
		},
	},
	{
		displayName: 'Team ID',
		name: 'conversationAssignmentTeamId',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 0,
		description: 'ID of the team. Ignored if assignee ID is provided.',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['assign'],
			},
		},
	},
];

const accountUpdateProperties: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add Field',
		typeOptions: {
			multipleValues: false,
		},
		description: 'Fields to update on the account',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['update'],
			},
		},
		options: [
			{
				name: 'values',
				displayName: 'Values',
				values: [
					{
						displayName: 'Auto Resolve After',
						name: 'autoResolveAfter',
						type: 'number',
						typeOptions: {
							numberPrecision: 0,
						},
						default: 1440,
						description: 'Auto resolve conversations after the specified number of minutes',
					},
					{
						displayName: 'Auto Resolve Ignore Waiting',
						name: 'autoResolveIgnoreWaiting',
						type: 'boolean',
						default: false,
						description: 'Whether waiting conversations should be ignored for auto resolve',
					},
					{
						displayName: 'Auto Resolve Message',
						name: 'autoResolveMessage',
						type: 'string',
						typeOptions: {
							rows: 3,
						},
						default: '',
						description: 'Message sent when conversations are auto resolved',
					},
					{
						displayName: 'Company Size',
						name: 'companySize',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Domain',
						name: 'domain',
						type: 'string',
						default: '',
						description: 'Domain of the account',
					},
					{
						displayName: 'Industry',
						name: 'industry',
						type: 'string',
						default: '',
						description: 'Industry type',
					},
					{
						displayName: 'Locale',
						name: 'locale',
						type: 'string',
						default: '',
						description: 'Locale of the account, for example en',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Name of the account',
					},
					{
						displayName: 'Support Email',
						name: 'supportEmail',
						type: 'string',
						default: '',
						description: 'Support email of the account',
					},
					{
						displayName: 'Timezone',
						name: 'timezone',
						type: 'string',
						default: '',
						description: 'Account timezone, for example UTC',
					},
				],
			},
		],
	},
];

const auditLogGetManyProperties: INodeProperties[] = [
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 1,
		description: 'Page number for pagination',
		displayOptions: {
			show: {
				resource: ['auditLog'],
				operation: ['getMany'],
			},
		},
	},
];

const agentBotIdProperty: INodeProperties = {
	displayName: 'Agent Bot ID',
	name: 'agentBotId',
	type: 'number',
	typeOptions: {
		numberPrecision: 0,
	},
	default: 0,
	required: true,
	description: 'ID of the agent bot',
	displayOptions: {
		show: {
			resource: ['agentBot'],
			operation: ['get', 'delete', 'update'],
		},
	},
};

const agentBotCreateProperties: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'agentBotName',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the agent bot',
		displayOptions: {
			show: {
				resource: ['agentBot'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Description',
		name: 'agentBotDescription',
		type: 'string',
		default: '',
		description: 'Description of the agent bot',
		displayOptions: {
			show: {
				resource: ['agentBot'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Outgoing URL',
		name: 'agentBotOutgoingUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'Webhook URL for the agent bot',
		displayOptions: {
			show: {
				resource: ['agentBot'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Avatar URL',
		name: 'agentBotAvatarUrl',
		type: 'string',
		default: '',
		description: 'URL of the agent bot avatar image',
		displayOptions: {
			show: {
				resource: ['agentBot'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Bot Type',
		name: 'agentBotType',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 0,
		description: 'Bot type. Chatwoot documents 0 for webhook bots.',
		displayOptions: {
			show: {
				resource: ['agentBot'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Bot Config',
		name: 'agentBotConfig',
		type: 'json',
		default: '{}',
		description: 'Configuration object for the agent bot',
		displayOptions: {
			show: {
				resource: ['agentBot'],
				operation: ['create'],
			},
		},
	},
];

const agentBotUpdateProperties: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'agentBotUpdateFields',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add Field',
		typeOptions: {
			multipleValues: false,
		},
		description: 'Fields to update on the agent bot',
		displayOptions: {
			show: {
				resource: ['agentBot'],
				operation: ['update'],
			},
		},
		options: [
			{
				name: 'values',
				displayName: 'Values',
				values: [
					{
						displayName: 'Avatar URL',
						name: 'avatarUrl',
						type: 'string',
						default: '',
						description: 'URL of the agent bot avatar image',
					},
					{
						displayName: 'Bot Config',
						name: 'botConfig',
						type: 'json',
						default: '{}',
						description: 'Configuration object for the agent bot',
					},
					{
						displayName: 'Bot Type',
						name: 'botType',
						type: 'number',
						typeOptions: {
							numberPrecision: 0,
						},
						default: 0,
						description: 'Bot type. Chatwoot documents 0 for webhook bots.',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Outgoing URL',
						name: 'outgoingUrl',
						type: 'string',
						default: '',
						description: 'Webhook URL for the agent bot',
					},
				],
			},
		],
	},
];

const agentIdProperty: INodeProperties = {
	displayName: 'Agent ID',
	name: 'agentId',
	type: 'number',
	typeOptions: {
		numberPrecision: 0,
	},
	default: 0,
	required: true,
	description: 'ID of the agent',
	displayOptions: {
		show: {
			resource: ['agent'],
			operation: ['delete', 'update'],
		},
	},
};

const agentRoleOptions: INodePropertyOptions[] = [
	{ name: 'Administrator', value: 'administrator' },
	{ name: 'Agent', value: 'agent' },
];

const agentAvailabilityOptions: INodePropertyOptions[] = [
	{ name: 'Available', value: 'available' },
	{ name: 'Busy', value: 'busy' },
	{ name: 'Offline', value: 'offline' },
];

const agentCreateProperties: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'agentName',
		type: 'string',
		default: '',
		required: true,
		description: 'Full name of the agent',
		displayOptions: {
			show: {
				resource: ['agent'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Email',
		name: 'agentEmail',
		type: 'string',
		default: '',
		required: true,
		description: 'Email of the agent',
		displayOptions: {
			show: {
				resource: ['agent'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Role',
		name: 'agentRole',
		type: 'options',
		options: agentRoleOptions,
		default: 'agent',
		description: 'Role of the agent',
		displayOptions: {
			show: {
				resource: ['agent'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Availability Status',
		name: 'agentAvailabilityStatus',
		type: 'options',
		options: agentAvailabilityOptions,
		default: 'available',
		description: 'Availability status of the agent',
		displayOptions: {
			show: {
				resource: ['agent'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Auto Offline',
		name: 'agentAutoOffline',
		type: 'boolean',
		default: true,
		description: 'Whether the agent should go offline automatically when away',
		displayOptions: {
			show: {
				resource: ['agent'],
				operation: ['create'],
			},
		},
	},
];

const agentUpdateProperties: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'agentUpdateFields',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add Field',
		typeOptions: {
			multipleValues: false,
		},
		description: 'Fields to update on the agent',
		displayOptions: {
			show: {
				resource: ['agent'],
				operation: ['update'],
			},
		},
		options: [
			{
				name: 'values',
				displayName: 'Values',
				values: [
					{
						displayName: 'Auto Offline',
						name: 'autoOffline',
						type: 'boolean',
						default: true,
						description: 'Whether the agent should go offline automatically when away',
					},
					{
						displayName: 'Availability Status',
						name: 'availabilityStatus',
						type: 'options',
						options: agentAvailabilityOptions,
						default: 'available',
						description: 'Availability status of the agent',
					},
					{
						displayName: 'Role',
						name: 'role',
						type: 'options',
						options: agentRoleOptions,
						default: 'agent',
						description: 'Role of the agent',
					},
				],
			},
		],
	},
];

const cannedResponseIdProperty: INodeProperties = {
	displayName: 'Canned Response ID',
	name: 'cannedResponseId',
	type: 'number',
	typeOptions: {
		numberPrecision: 0,
	},
	default: 0,
	required: true,
	description: 'ID of the canned response',
	displayOptions: {
		show: {
			resource: ['cannedResponse'],
			operation: ['delete', 'update'],
		},
	},
};

const cannedResponseCreateProperties: INodeProperties[] = [
	{
		displayName: 'Short Code',
		name: 'cannedResponseShortCode',
		type: 'string',
		default: '',
		required: true,
		description: 'Short code for quick access to the canned response',
		displayOptions: {
			show: {
				resource: ['cannedResponse'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Content',
		name: 'cannedResponseContent',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		required: true,
		description: 'Message content for the canned response',
		displayOptions: {
			show: {
				resource: ['cannedResponse'],
				operation: ['create'],
			},
		},
	},
];

const cannedResponseUpdateProperties: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'cannedResponseUpdateFields',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add Field',
		typeOptions: {
			multipleValues: false,
		},
		description: 'Fields to update on the canned response',
		displayOptions: {
			show: {
				resource: ['cannedResponse'],
				operation: ['update'],
			},
		},
		options: [
			{
				name: 'values',
				displayName: 'Values',
				values: [
					{
						displayName: 'Content',
						name: 'content',
						type: 'string',
						typeOptions: {
							rows: 4,
						},
						default: '',
						description: 'Message content for the canned response',
					},
					{
						displayName: 'Short Code',
						name: 'shortCode',
						type: 'string',
						default: '',
						description: 'Short code for quick access to the canned response',
					},
				],
			},
		],
	},
];

const customAttributeIdProperty: INodeProperties = {
	displayName: 'Custom Attribute ID',
	name: 'customAttributeId',
	type: 'number',
	typeOptions: {
		numberPrecision: 0,
	},
	default: 0,
	required: true,
	description: 'ID of the custom attribute',
	displayOptions: {
		show: {
			resource: ['customAttribute'],
			operation: ['delete', 'get', 'update'],
		},
	},
};

const customAttributeDisplayTypeOptions: INodePropertyOptions[] = [
	{ name: 'Text', value: 0 },
	{ name: 'Number', value: 1 },
	{ name: 'Currency', value: 2 },
	{ name: 'Percent', value: 3 },
	{ name: 'Link', value: 4 },
	{ name: 'Date', value: 5 },
	{ name: 'List', value: 6 },
	{ name: 'Checkbox', value: 7 },
];

const customAttributeModelOptions: INodePropertyOptions[] = [
	{ name: 'Conversation Attribute', value: 0 },
	{ name: 'Contact Attribute', value: 1 },
];

const customAttributeBaseFields: INodeProperties[] = [
	{
		displayName: 'Attribute Display Name',
		name: 'customAttributeDisplayName',
		type: 'string',
		default: '',
		required: true,
		description: 'Display name of the custom attribute',
		displayOptions: {
			show: {
				resource: ['customAttribute'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Attribute Display Type',
		name: 'customAttributeDisplayType',
		type: 'options',
		options: customAttributeDisplayTypeOptions,
		default: 0,
		description: 'Display type of the custom attribute',
		displayOptions: {
			show: {
				resource: ['customAttribute'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Attribute Description',
		name: 'customAttributeDescription',
		type: 'string',
		default: '',
		description: 'Description of the custom attribute',
		displayOptions: {
			show: {
				resource: ['customAttribute'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Attribute Key',
		name: 'customAttributeKey',
		type: 'string',
		default: '',
		required: true,
		description: 'Unique key of the custom attribute',
		displayOptions: {
			show: {
				resource: ['customAttribute'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Attribute Model',
		name: 'customAttributeModel',
		type: 'options',
		options: customAttributeModelOptions,
		default: 0,
		description: 'Whether the attribute belongs to conversations or contacts',
		displayOptions: {
			show: {
				resource: ['customAttribute'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Attribute Values',
		name: 'customAttributeValues',
		type: 'json',
		default: '[]',
		description: 'JSON array of allowed values, mainly for list attributes',
		displayOptions: {
			show: {
				resource: ['customAttribute'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Regex Pattern',
		name: 'customAttributeRegexPattern',
		type: 'string',
		default: '',
		description: 'Regex pattern used to validate text attributes',
		displayOptions: {
			show: {
				resource: ['customAttribute'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Regex Cue',
		name: 'customAttributeRegexCue',
		type: 'string',
		default: '',
		description: 'Validation message shown when the regex is not matched',
		displayOptions: {
			show: {
				resource: ['customAttribute'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Default Value',
		name: 'customAttributeDefaultValue',
		type: 'string',
		default: '',
		description: 'Default value of the custom attribute',
		displayOptions: {
			show: {
				resource: ['customAttribute'],
				operation: ['create'],
			},
		},
	},
];

const customAttributeUpdateProperties: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'customAttributeUpdateFields',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add Field',
		typeOptions: {
			multipleValues: false,
		},
		description: 'Fields to update on the custom attribute',
		displayOptions: {
			show: {
				resource: ['customAttribute'],
				operation: ['update'],
			},
		},
		options: [
			{
				name: 'values',
				displayName: 'Values',
				values: [
					{
						displayName: 'Attribute Description',
						name: 'attributeDescription',
						type: 'string',
						default: '',
						description: 'Description of the custom attribute',
					},
					{
						displayName: 'Attribute Display Name',
						name: 'attributeDisplayName',
						type: 'string',
						default: '',
						description: 'Display name of the custom attribute',
					},
					{
						displayName: 'Attribute Display Type',
						name: 'attributeDisplayType',
						type: 'options',
						options: customAttributeDisplayTypeOptions,
						default: 0,
						description: 'Display type of the custom attribute',
					},
					{
						displayName: 'Attribute Key',
						name: 'attributeKey',
						type: 'string',
						default: '',
						description: 'Unique key of the custom attribute',
					},
					{
						displayName: 'Attribute Model',
						name: 'attributeModel',
						type: 'options',
						options: customAttributeModelOptions,
						default: 0,
						description: 'Whether the attribute belongs to conversations or contacts',
					},
					{
						displayName: 'Attribute Values',
						name: 'attributeValues',
						type: 'json',
						default: '[]',
						description: 'JSON array of allowed values, mainly for list attributes',
					},
					{
						displayName: 'Default Value',
						name: 'defaultValue',
						type: 'string',
						default: '',
						description: 'Default value of the custom attribute',
					},
					{
						displayName: 'Regex Cue',
						name: 'regexCue',
						type: 'string',
						default: '',
						description: 'Validation message shown when the regex is not matched',
					},
					{
						displayName: 'Regex Pattern',
						name: 'regexPattern',
						type: 'string',
						default: '',
						description: 'Regex pattern used to validate text attributes',
					},
				],
			},
		],
	},
];

const contactIdProperty: INodeProperties = {
	displayName: 'Contact ID',
	name: 'contactRecordId',
	type: 'number',
	typeOptions: {
		numberPrecision: 0,
	},
	default: 0,
	required: true,
	description: 'ID of the contact',
	displayOptions: {
		show: {
			resource: ['contact'],
			operation: [
				'createInbox',
				'delete',
				'get',
				'getContactableInboxes',
				'getConversations',
				'update',
			],
		},
	},
};

const contactSortOptions: INodePropertyOptions[] = [
	{ name: 'Email', value: 'email' },
	{ name: 'Email Descending', value: '-email' },
	{ name: 'Last Activity At', value: 'last_activity_at' },
	{ name: 'Last Activity At Descending', value: '-last_activity_at' },
	{ name: 'Name', value: 'name' },
	{ name: 'Name Descending', value: '-name' },
	{ name: 'Phone Number', value: 'phone_number' },
	{ name: 'Phone Number Descending', value: '-phone_number' },
];

const contactBaseCreateFields: INodeProperties[] = [
	{
		displayName: 'Inbox ID',
		name: 'contactInboxId',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 0,
		required: true,
		description: 'ID of the inbox to which the contact belongs',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Name',
		name: 'contactName',
		type: 'string',
		default: '',
		description: 'Name of the contact',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Email',
		name: 'contactEmail',
		type: 'string',
		default: '',
		description: 'Email of the contact',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Blocked',
		name: 'contactBlocked',
		type: 'boolean',
		default: false,
		description: 'Whether the contact is blocked',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Phone Number',
		name: 'contactPhoneNumber',
		type: 'string',
		default: '',
		description: 'Phone number of the contact',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Avatar URL',
		name: 'contactAvatarUrl',
		type: 'string',
		default: '',
		description: 'URL to a PNG or JPEG avatar image',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Identifier',
		name: 'contactIdentifier',
		type: 'string',
		default: '',
		description: 'Unique identifier of the contact in an external system',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Additional Attributes',
		name: 'contactAdditionalAttributes',
		type: 'json',
		default: '{}',
		description: 'Additional attributes object for the contact',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Custom Attributes',
		name: 'contactCustomAttributes',
		type: 'json',
		default: '{}',
		description: 'Custom attributes object for the contact',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
	},
];

const contactUpdateProperties: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'contactUpdateFields',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add Field',
		typeOptions: {
			multipleValues: false,
		},
		description: 'Fields to update on the contact',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['update'],
			},
		},
		options: [
			{
				name: 'values',
				displayName: 'Values',
				values: [
					{
						displayName: 'Additional Attributes',
						name: 'additionalAttributes',
						type: 'json',
						default: '{}',
						description: 'Additional attributes object for the contact',
					},
					{
						displayName: 'Avatar URL',
						name: 'avatarUrl',
						type: 'string',
						default: '',
						description: 'URL to a PNG or JPEG avatar image',
					},
					{
						displayName: 'Blocked',
						name: 'blocked',
						type: 'boolean',
						default: false,
						description: 'Whether the contact is blocked',
					},
					{
						displayName: 'Custom Attributes',
						name: 'customAttributes',
						type: 'json',
						default: '{}',
						description: 'Custom attributes object for the contact',
					},
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						default: '',
						placeholder: 'name@email.com',
						description: 'Email of the contact',
					},
					{
						displayName: 'Identifier',
						name: 'identifier',
						type: 'string',
						default: '',
						description: 'Unique identifier of the contact in an external system',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Name of the contact',
					},
					{
						displayName: 'Phone Number',
						name: 'phoneNumber',
						type: 'string',
						default: '',
						description: 'Phone number of the contact',
					},
				],
			},
		],
	},
];

const contactListProperties: INodeProperties[] = [
	{
		displayName: 'Page',
		name: 'contactPage',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 1,
		description: 'Page number for pagination',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['getMany', 'search'],
			},
		},
	},
	{
		displayName: 'Sort',
		name: 'contactSort',
		type: 'options',
		options: contactSortOptions,
		default: 'name',
		description: 'Sort order for the contact list',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['getMany', 'search'],
			},
		},
	},
];

const contactSearchProperty: INodeProperties = {
	displayName: 'Query',
	name: 'contactQuery',
	type: 'string',
	default: '',
	required: true,
	description: 'Search query for contact name, identifier, email, or phone number',
	displayOptions: {
		show: {
			resource: ['contact'],
			operation: ['search'],
		},
	},
};

const contactFilterProperty: INodeProperties = {
	displayName: 'Filter Payload',
	name: 'contactFilterPayload',
	type: 'json',
	default: '[]',
	required: true,
	description: 'JSON array of contact filter rules',
	displayOptions: {
		show: {
			resource: ['contact'],
			operation: ['filter'],
		},
	},
};

const contactCreateInboxProperties: INodeProperties[] = [
	{
		displayName: 'Inbox ID',
		name: 'contactInboxRecordInboxId',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 0,
		required: true,
		description: 'ID of the inbox',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['createInbox'],
			},
		},
	},
	{
		displayName: 'Source ID',
		name: 'contactInboxRecordSourceId',
		type: 'string',
		default: '',
		description: 'Source ID for the contact inbox record',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['createInbox'],
			},
		},
	},
];

const contactMergeProperties: INodeProperties[] = [
	{
		displayName: 'Base Contact ID',
		name: 'baseContactId',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 0,
		required: true,
		description: 'Contact that remains after the merge',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['merge'],
			},
		},
	},
	{
		displayName: 'Mergee Contact ID',
		name: 'mergeeContactId',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 0,
		required: true,
		description: 'Contact that will be merged and deleted',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['merge'],
			},
		},
	},
];

const contactLabelsProperty: INodeProperties = {
	displayName: 'Labels',
	name: 'contactLabels',
	type: 'json',
	default: '[]',
	required: true,
	description: 'JSON array of labels for the contact',
	displayOptions: {
		show: {
			resource: ['contact'],
			operation: ['setLabels'],
		},
	},
};

const automationRuleIdProperty: INodeProperties = {
	displayName: 'Automation Rule ID',
	name: 'automationRuleId',
	type: 'number',
	typeOptions: {
		numberPrecision: 0,
	},
	default: 0,
	required: true,
	description: 'ID of the automation rule',
	displayOptions: {
		show: {
			resource: ['automationRule'],
			operation: ['delete', 'get', 'update'],
		},
	},
};

const automationRuleEventOptions: INodePropertyOptions[] = [
	{ name: 'Conversation Created', value: 'conversation_created' },
	{ name: 'Conversation Resolved', value: 'conversation_resolved' },
	{ name: 'Conversation Updated', value: 'conversation_updated' },
	{ name: 'Message Created', value: 'message_created' },
];

const automationRuleCreateProperties: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'automationRuleName',
		type: 'string',
		default: '',
		required: true,
		description: 'Rule name',
		displayOptions: {
			show: {
				resource: ['automationRule'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Description',
		name: 'automationRuleDescription',
		type: 'string',
		typeOptions: {
			rows: 3,
		},
		default: '',
		description: 'Description of the automation rule',
		displayOptions: {
			show: {
				resource: ['automationRule'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Event Name',
		name: 'automationRuleEventName',
		type: 'options',
		options: automationRuleEventOptions,
		default: 'message_created',
		description: 'Event that triggers the automation rule',
		displayOptions: {
			show: {
				resource: ['automationRule'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Active',
		name: 'automationRuleActive',
		type: 'boolean',
		default: true,
		description: 'Whether the automation rule is enabled',
		displayOptions: {
			show: {
				resource: ['automationRule'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Actions',
		name: 'automationRuleActions',
		type: 'json',
		default: '[]',
		required: true,
		description: 'JSON array of actions executed when conditions match',
		displayOptions: {
			show: {
				resource: ['automationRule'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Conditions',
		name: 'automationRuleConditions',
		type: 'json',
		default: '[]',
		required: true,
		description: 'JSON array of conditions used by the automation rule',
		displayOptions: {
			show: {
				resource: ['automationRule'],
				operation: ['create'],
			},
		},
	},
];

const automationRuleUpdateProperties: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'automationRuleUpdateFields',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add Field',
		typeOptions: {
			multipleValues: false,
		},
		description: 'Fields to update on the automation rule',
		displayOptions: {
			show: {
				resource: ['automationRule'],
				operation: ['update'],
			},
		},
		options: [
			{
				name: 'values',
				displayName: 'Values',
				values: [
					{
						displayName: 'Actions',
						name: 'actions',
						type: 'json',
						default: '[]',
						description: 'JSON array of actions executed when conditions match',
					},
					{
						displayName: 'Active',
						name: 'active',
						type: 'boolean',
						default: true,
						description: 'Whether the automation rule is enabled',
					},
					{
						displayName: 'Conditions',
						name: 'conditions',
						type: 'json',
						default: '[]',
						description: 'JSON array of conditions used by the automation rule',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						typeOptions: {
							rows: 3,
						},
						default: '',
						description: 'Description of the automation rule',
					},
					{
						displayName: 'Event Name',
						name: 'eventName',
						type: 'options',
						options: automationRuleEventOptions,
						default: 'message_created',
						description: 'Event that triggers the automation rule',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Rule name',
					},
				],
			},
		],
	},
];

const profileUpdateProperties: INodeProperties[] = [];

const integrationHookIdProperty: INodeProperties = {
	displayName: 'Hook ID',
	name: 'integrationHookId',
	type: 'number',
	typeOptions: {
		numberPrecision: 0,
	},
	default: 0,
	required: true,
	description: 'ID of the integration hook',
	displayOptions: {
		show: {
			resource: ['integration'],
			operation: ['delete', 'update'],
		},
	},
};

const integrationStatusOptions: INodePropertyOptions[] = [
	{ name: 'Active', value: 1 },
	{ name: 'Inactive', value: 0 },
];

const integrationCreateProperties: INodeProperties[] = [
	{
		displayName: 'App ID',
		name: 'integrationAppId',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 0,
		required: true,
		description: 'ID of the integration app',
		displayOptions: {
			show: {
				resource: ['integration'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Inbox ID',
		name: 'integrationInboxId',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 0,
		description: 'Inbox ID if the hook is inbox-specific',
		displayOptions: {
			show: {
				resource: ['integration'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Status',
		name: 'integrationStatus',
		type: 'options',
		options: integrationStatusOptions,
		default: 1,
		description: 'Status of the integration hook',
		displayOptions: {
			show: {
				resource: ['integration'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Settings',
		name: 'integrationSettings',
		type: 'json',
		default: '{}',
		required: true,
		description: 'Settings object for the integration hook',
		displayOptions: {
			show: {
				resource: ['integration'],
				operation: ['create'],
			},
		},
	},
];

const integrationUpdateProperties: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'integrationUpdateFields',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add Field',
		typeOptions: {
			multipleValues: false,
		},
		description: 'Fields to update on the integration hook',
		displayOptions: {
			show: {
				resource: ['integration'],
				operation: ['update'],
			},
		},
		options: [
			{
				name: 'values',
				displayName: 'Values',
				values: [
					{
						displayName: 'Settings',
						name: 'settings',
						type: 'json',
						default: '{}',
						description: 'Settings object for the integration hook',
					},
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: integrationStatusOptions,
						default: 1,
						description: 'Status of the integration hook',
					},
				],
			},
		],
	},
];

const teamIdProperty: INodeProperties = {
	displayName: 'Team ID',
	name: 'teamId',
	type: 'number',
	typeOptions: {
		numberPrecision: 0,
	},
	default: 0,
	required: true,
	description: 'ID of the team',
	displayOptions: {
		show: {
			resource: ['team'],
			operation: ['addAgent', 'delete', 'get', 'getAgents', 'removeAgent', 'update', 'updateAgents'],
		},
	},
};

const teamCreateProperties: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'teamName',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the team',
		displayOptions: {
			show: {
				resource: ['team'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Description',
		name: 'teamDescription',
		type: 'string',
		typeOptions: {
			rows: 3,
		},
		default: '',
		description: 'Description of the team',
		displayOptions: {
			show: {
				resource: ['team'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Allow Auto Assign',
		name: 'teamAllowAutoAssign',
		type: 'boolean',
		default: false,
		description: 'Whether conversations assigned to the team should be auto-assigned to an agent',
		displayOptions: {
			show: {
				resource: ['team'],
				operation: ['create'],
			},
		},
	},
];

const teamUpdateProperties: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'teamUpdateFields',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add Field',
		typeOptions: {
			multipleValues: false,
		},
		description: 'Fields to update on the team',
		displayOptions: {
			show: {
				resource: ['team'],
				operation: ['update'],
			},
		},
		options: [
			{
				name: 'values',
				displayName: 'Values',
				values: [
					{
						displayName: 'Allow Auto Assign',
						name: 'allowAutoAssign',
						type: 'boolean',
						default: false,
						description: 'Whether conversations assigned to the team should be auto-assigned to an agent',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						typeOptions: {
							rows: 3,
						},
						default: '',
						description: 'Description of the team',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Name of the team',
					},
				],
			},
		],
	},
];

const teamUserIdsProperty: INodeProperties = {
	displayName: 'User IDs',
	name: 'teamUserIds',
	type: 'json',
	default: '[]',
	required: true,
	description: 'JSON array of user IDs',
	displayOptions: {
		show: {
			resource: ['team'],
			operation: ['addAgent', 'removeAgent', 'updateAgents'],
		},
	},
};

const inboxRecordIdProperty: INodeProperties = {
	displayName: 'Inbox ID',
	name: 'inboxRecordId',
	type: 'number',
	typeOptions: {
		numberPrecision: 0,
	},
	default: 0,
	required: true,
	description: 'ID of the inbox',
	displayOptions: {
		show: {
			resource: ['inbox'],
			operation: [
				'addAgent',
				'get',
				'getAgentBot',
				'getAgents',
				'removeAgent',
				'setAgentBot',
				'update',
				'updateAgents',
			],
		},
	},
};

const inboxChannelTypeOptions: INodePropertyOptions[] = [
	{ name: 'API', value: 'api' },
	{ name: 'Email', value: 'email' },
	{ name: 'Line', value: 'line' },
	{ name: 'SMS', value: 'sms' },
	{ name: 'Telegram', value: 'telegram' },
	{ name: 'Web Widget', value: 'web_widget' },
	{ name: 'WhatsApp', value: 'whatsapp' },
];

const inboxSenderNameTypeOptions: INodePropertyOptions[] = [
	{ name: 'Friendly', value: 'friendly' },
	{ name: 'Professional', value: 'professional' },
];

const inboxCreateProperties: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'inboxName',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the inbox',
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Channel Type',
		name: 'inboxChannelType',
		type: 'options',
		options: inboxChannelTypeOptions,
		default: 'web_widget',
		required: true,
		description: 'Type of channel for the inbox',
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Channel Config',
		name: 'inboxChannelConfig',
		type: 'json',
		default: '{}',
		description: 'Additional channel configuration object',
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Greeting Enabled',
		name: 'inboxGreetingEnabled',
		type: 'boolean',
		default: false,
		description: 'Whether the greeting message is enabled',
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Greeting Message',
		name: 'inboxGreetingMessage',
		type: 'string',
		typeOptions: {
			rows: 3,
		},
		default: '',
		description: 'Greeting message displayed on the widget',
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Enable Email Collect',
		name: 'inboxEnableEmailCollect',
		type: 'boolean',
		default: false,
		description: 'Whether email collection is enabled',
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'CSAT Survey Enabled',
		name: 'inboxCsatSurveyEnabled',
		type: 'boolean',
		default: false,
		description: 'Whether the CSAT survey is enabled',
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Enable Auto Assignment',
		name: 'inboxEnableAutoAssignment',
		type: 'boolean',
		default: false,
		description: 'Whether auto assignment is enabled',
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Working Hours Enabled',
		name: 'inboxWorkingHoursEnabled',
		type: 'boolean',
		default: false,
		description: 'Whether inbox working hours are enabled',
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Out of Office Message',
		name: 'inboxOutOfOfficeMessage',
		type: 'string',
		typeOptions: {
			rows: 3,
		},
		default: '',
		description: 'Out-of-office message displayed on the widget',
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Timezone',
		name: 'inboxTimezone',
		type: 'string',
		default: '',
		description: 'Timezone of the inbox',
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Allow Messages After Resolved',
		name: 'inboxAllowMessagesAfterResolved',
		type: 'boolean',
		default: false,
		description: 'Whether messages are allowed after the conversation is resolved',
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Lock to Single Conversation',
		name: 'inboxLockToSingleConversation',
		type: 'boolean',
		default: false,
		description: 'Whether the inbox is locked to a single conversation',
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Portal ID',
		name: 'inboxPortalId',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 0,
		description: 'Help center portal ID attached to the inbox',
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Sender Name Type',
		name: 'inboxSenderNameType',
		type: 'options',
		options: inboxSenderNameTypeOptions,
		default: 'friendly',
		description: 'Sender name style for the inbox',
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Business Name',
		name: 'inboxBusinessName',
		type: 'string',
		default: '',
		description: 'Business name for the inbox',
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['create'],
			},
		},
	},
];

const inboxUpdateProperties: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'inboxUpdateFields',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add Field',
		typeOptions: {
			multipleValues: false,
		},
		description: 'Fields to update on the inbox',
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['update'],
			},
		},
		options: [
			{
				name: 'values',
				displayName: 'Values',
				values: [
					{
						displayName: 'Allow Messages After Resolved',
						name: 'allowMessagesAfterResolved',
						type: 'boolean',
						default: false,
						description: 'Whether messages are allowed after the conversation is resolved',
					},
					{
						displayName: 'Business Name',
						name: 'businessName',
						type: 'string',
						default: '',
						description: 'Business name for the inbox',
					},
					{
						displayName: 'Channel Config',
						name: 'channelConfig',
						type: 'json',
						default: '{}',
						description: 'Additional channel configuration object',
					},
					{
						displayName: 'CSAT Survey Enabled',
						name: 'csatSurveyEnabled',
						type: 'boolean',
						default: false,
						description: 'Whether the CSAT survey is enabled',
					},
					{
						displayName: 'Enable Auto Assignment',
						name: 'enableAutoAssignment',
						type: 'boolean',
						default: false,
						description: 'Whether auto assignment is enabled',
					},
					{
						displayName: 'Enable Email Collect',
						name: 'enableEmailCollect',
						type: 'boolean',
						default: false,
						description: 'Whether email collection is enabled',
					},
					{
						displayName: 'Greeting Enabled',
						name: 'greetingEnabled',
						type: 'boolean',
						default: false,
						description: 'Whether the greeting message is enabled',
					},
					{
						displayName: 'Greeting Message',
						name: 'greetingMessage',
						type: 'string',
						typeOptions: {
							rows: 3,
						},
						default: '',
						description: 'Greeting message displayed on the widget',
					},
					{
						displayName: 'Lock to Single Conversation',
						name: 'lockToSingleConversation',
						type: 'boolean',
						default: false,
						description: 'Whether the inbox is locked to a single conversation',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Name of the inbox',
					},
					{
						displayName: 'Out of Office Message',
						name: 'outOfOfficeMessage',
						type: 'string',
						typeOptions: {
							rows: 3,
						},
						default: '',
						description: 'Out-of-office message displayed on the widget',
					},
					{
						displayName: 'Portal ID',
						name: 'portalId',
						type: 'number',
						typeOptions: {
							numberPrecision: 0,
						},
						default: 0,
						description: 'Help center portal ID attached to the inbox',
					},
					{
						displayName: 'Sender Name Type',
						name: 'senderNameType',
						type: 'options',
						options: inboxSenderNameTypeOptions,
						default: 'friendly',
						description: 'Sender name style for the inbox',
					},
					{
						displayName: 'Timezone',
						name: 'timezone',
						type: 'string',
						default: '',
						description: 'Timezone of the inbox',
					},
					{
						displayName: 'Working Hours Enabled',
						name: 'workingHoursEnabled',
						type: 'boolean',
						default: false,
						description: 'Whether inbox working hours are enabled',
					},
				],
			},
		],
	},
];

const inboxAgentBotProperty: INodeProperties = {
	displayName: 'Agent Bot ID',
	name: 'inboxAgentBotId',
	type: 'string',
	default: '',
	description: 'Agent bot ID. Leave empty to remove the inbox agent bot.',
	displayOptions: {
		show: {
			resource: ['inbox'],
			operation: ['setAgentBot'],
		},
	},
};

const inboxUserIdsProperty: INodeProperties = {
	displayName: 'User IDs',
	name: 'inboxUserIds',
	type: 'json',
	default: '[]',
	required: true,
	description: 'JSON array of user IDs',
	displayOptions: {
		show: {
			resource: ['inbox'],
			operation: ['addAgent', 'removeAgent', 'updateAgents'],
		},
	},
};

const messageConversationIdProperty: INodeProperties = {
	displayName: 'Conversation ID',
	name: 'messageConversationId',
	type: 'number',
	typeOptions: {
		numberPrecision: 0,
	},
	default: 0,
	required: true,
	description: 'ID of the conversation',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['create', 'delete', 'getMany'],
		},
	},
};

const messageIdProperty: INodeProperties = {
	displayName: 'Message ID',
	name: 'messageId',
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
			operation: ['delete'],
		},
	},
};

const messageTypeOptions: INodePropertyOptions[] = [
	{ name: 'Incoming', value: 'incoming' },
	{ name: 'Outgoing', value: 'outgoing' },
];

const messageContentTypeOptions: INodePropertyOptions[] = [
	{ name: 'Article', value: 'article' },
	{ name: 'Cards', value: 'cards' },
	{ name: 'Form', value: 'form' },
	{ name: 'Input Email', value: 'input_email' },
	{ name: 'Input Select', value: 'input_select' },
	{ name: 'Text', value: 'text' },
];

const messageListProperties: INodeProperties[] = [
	{
		displayName: 'After Message ID',
		name: 'messageAfterId',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 0,
		description: 'Fetch messages after this message ID',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['getMany'],
			},
		},
	},
	{
		displayName: 'Before Message ID',
		name: 'messageBeforeId',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 0,
		description: 'Fetch messages before this message ID',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['getMany'],
			},
		},
	},
];

const messageCreateProperties: INodeProperties[] = [
	{
		displayName: 'Content',
		name: 'messageCreateContent',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		required: true,
		description: 'Content of the message',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Message Type',
		name: 'messageCreateType',
		type: 'options',
		options: messageTypeOptions,
		default: 'outgoing',
		description: 'Type of the message',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Private',
		name: 'messageCreatePrivate',
		type: 'boolean',
		default: false,
		description: 'Whether the message is a private note',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Content Type',
		name: 'messageCreateContentType',
		type: 'options',
		options: messageContentTypeOptions,
		default: 'text',
		description: 'Content type of the message',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Content Attributes',
		name: 'messageCreateContentAttributes',
		type: 'json',
		default: '{}',
		description: 'Attributes based on the content type',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Campaign ID',
		name: 'messageCreateCampaignId',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 0,
		description: 'Campaign ID to associate with the message',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Template Params',
		name: 'messageCreateTemplateParams',
		type: 'json',
		default: '{}',
		description: 'WhatsApp template parameters for structured messages',
		displayOptions: {
			show: {
				resource: ['message'],
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
		description: 'Work with Mega API',
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
						name: 'Account',
						value: 'account',
					},
					{
						name: 'Agent',
						value: 'agent',
					},
					{
						name: 'Agent Bot',
						value: 'agentBot',
					},
					{
						name: 'Audit Log',
						value: 'auditLog',
					},
					{
						name: 'Automation Rule',
						value: 'automationRule',
					},
					{
						name: 'Canned Response',
						value: 'cannedResponse',
					},
					{
						name: 'Contact',
						value: 'contact',
					},
					{
						name: 'Conversation',
						value: 'conversation',
					},
					{
						name: 'Custom Attribute',
						value: 'customAttribute',
					},
					{
						name: 'Inbox',
						value: 'inbox',
					},
					{
						name: 'Integration',
						value: 'integration',
					},
					{
						name: 'Message',
						value: 'message',
					},
					{
						name: 'Profile',
						value: 'profile',
					},
					{
						name: 'Team',
						value: 'team',
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
						name: 'Get',
						value: 'get',
						description: 'Get account details',
						action: 'Get account details',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update account details',
						action: 'Update account details',
					},
				],
				displayOptions: {
					show: {
						resource: ['account'],
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
						description: 'Add a new automation rule',
						action: 'Add a new automation rule',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Remove an automation rule from the account',
						action: 'Remove an automation rule from the account',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get automation rule details',
						action: 'Get automation rule details',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'List automation rules in the account',
						action: 'List automation rules in the account',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update automation rule in the account',
						action: 'Update automation rule in the account',
					},
				],
				displayOptions: {
					show: {
						resource: ['automationRule'],
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
						name: 'Create',
						value: 'create',
						description: 'Add a new agent',
						action: 'Add a new agent',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Remove an agent from the account',
						action: 'Remove an agent from the account',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'List agents in the account',
						action: 'List agents in the account',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an agent in the account',
						action: 'Update an agent in the account',
					},
				],
				displayOptions: {
					show: {
						resource: ['agent'],
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
						name: 'Create',
						value: 'create',
						description: 'Create a contact',
						action: 'Create a contact',
					},
					{
						name: 'Create Inbox',
						value: 'createInbox',
						description: 'Create a contact inbox record',
						action: 'Create a contact inbox record',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a contact',
						action: 'Delete a contact',
					},
					{
						name: 'Filter',
						value: 'filter',
						description: 'Filter contacts',
						action: 'Filter contacts',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Show a contact',
						action: 'Show a contact',
					},
					{
						name: 'Get Contactable Inboxes',
						value: 'getContactableInboxes',
						description: 'Get contactable inboxes for a contact',
						action: 'Get contactable inboxes for a contact',
					},
					{
						name: 'Get Conversations',
						value: 'getConversations',
						description: 'Get conversations for a contact',
						action: 'Get conversations for a contact',
					},
					{
						name: 'Get Labels',
						value: 'getLabels',
						description: 'List labels of a contact',
						action: 'List labels of a contact',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'List contacts',
						action: 'List contacts',
					},
					{
						name: 'Merge',
						value: 'merge',
						description: 'Merge two contacts',
						action: 'Merge two contacts',
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Search contacts',
						action: 'Search contacts',
					},
					{
						name: 'Set Labels',
						value: 'setLabels',
						description: 'Overwrite labels of a contact',
						action: 'Overwrite labels of a contact',
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
				default: 'getMany',
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
						description: 'Create an agent bot',
						action: 'Create an agent bot',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an agent bot',
						action: 'Delete an agent bot',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get agent bot details',
						action: 'Get agent bot details',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'List all agent bots',
						action: 'List all agent bots',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an agent bot',
						action: 'Update an agent bot',
					},
				],
				displayOptions: {
					show: {
						resource: ['agentBot'],
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
						name: 'Create',
						value: 'create',
						description: 'Add a new canned response',
						action: 'Add a new canned response',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Remove a canned response from the account',
						action: 'Remove a canned response from the account',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'List canned responses in the account',
						action: 'List canned responses in the account',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a canned response in the account',
						action: 'Update a canned response in the account',
					},
				],
				displayOptions: {
					show: {
						resource: ['cannedResponse'],
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
						name: 'Create',
						value: 'create',
						description: 'Add a new custom attribute',
						action: 'Add a new custom attribute',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Remove a custom attribute from the account',
						action: 'Remove a custom attribute from the account',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get custom attribute details',
						action: 'Get custom attribute details',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'List custom attributes in the account',
						action: 'List custom attributes in the account',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a custom attribute in the account',
						action: 'Update a custom attribute in the account',
					},
				],
				displayOptions: {
					show: {
						resource: ['customAttribute'],
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
						name: 'Get Many',
						value: 'getMany',
						description: 'List audit logs in the account',
						action: 'List audit logs in the account',
					},
				],
				displayOptions: {
					show: {
						resource: ['auditLog'],
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
						name: 'Assign',
						value: 'assign',
						description: 'Assign a conversation',
						action: 'Assign a conversation',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a conversation',
						action: 'Create a conversation',
					},
					{
						name: 'Filter',
						value: 'filter',
						description: 'Filter conversations',
						action: 'Filter conversations',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get conversation details',
						action: 'Get conversation details',
					},
					{
						name: 'Get Counts',
						value: 'getCounts',
						description: 'Get conversation counts',
						action: 'Get conversation counts',
					},
					{
						name: 'Get Labels',
						value: 'getLabels',
						description: 'List labels of a conversation',
						action: 'List labels of a conversation',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'List conversations',
						action: 'List conversations',
					},
					{
						name: 'Get Reporting Events',
						value: 'getReportingEvents',
						description: 'List reporting events of a conversation',
						action: 'List reporting events of a conversation',
					},
					{
						name: 'Set Custom Attributes',
						value: 'setCustomAttributes',
						description: 'Update custom attributes of a conversation',
						action: 'Update custom attributes of a conversation',
					},
					{
						name: 'Set Labels',
						value: 'setLabels',
						description: 'Overwrite labels of a conversation',
						action: 'Overwrite labels of a conversation',
					},
					{
						name: 'Toggle Priority',
						value: 'togglePriority',
						description: 'Toggle priority of a conversation',
						action: 'Toggle priority of a conversation',
					},
					{
						name: 'Toggle Status',
						value: 'toggleStatus',
						description: 'Toggle status of a conversation',
						action: 'Toggle status of a conversation',
					},
					{
						name: 'Toggle Typing Status',
						value: 'toggleTypingStatus',
						description: 'Toggle typing status of a conversation',
						action: 'Toggle typing status of a conversation',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a conversation',
						action: 'Update a conversation',
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
						name: 'Add Agent',
						value: 'addAgent',
						description: 'Add agents to the inbox',
						action: 'Add agents to the inbox',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create an inbox',
						action: 'Create an inbox',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get inbox details',
						action: 'Get inbox details',
					},
					{
						name: 'Get Agent Bot',
						value: 'getAgentBot',
						description: 'Get the inbox agent bot',
						action: 'Get the inbox agent bot',
					},
					{
						name: 'Get Agents',
						value: 'getAgents',
						description: 'List agents in the inbox',
						action: 'List agents in the inbox',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'List all inboxes',
						action: 'List all inboxes',
					},
					{
						name: 'Remove Agent',
						value: 'removeAgent',
						description: 'Remove agents from the inbox',
						action: 'Remove agents from the inbox',
					},
					{
						name: 'Set Agent Bot',
						value: 'setAgentBot',
						description: 'Add or remove an inbox agent bot',
						action: 'Add or remove an inbox agent bot',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an inbox',
						action: 'Update an inbox',
					},
					{
						name: 'Update Agents',
						value: 'updateAgents',
						description: 'Overwrite agents in the inbox',
						action: 'Overwrite agents in the inbox',
					},
				],
				displayOptions: {
					show: {
						resource: ['inbox'],
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
						name: 'Create',
						value: 'create',
						description: 'Create an integration hook',
						action: 'Create an integration hook',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an integration hook',
						action: 'Delete an integration hook',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'List all integration hooks',
						action: 'List all integration hooks',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an integration hook',
						action: 'Update an integration hook',
					},
				],
				displayOptions: {
					show: {
						resource: ['integration'],
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
						name: 'Create',
						value: 'create',
						description: 'Create a new message',
						action: 'Create a new message',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a message',
						action: 'Delete a message',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'List messages in a conversation',
						action: 'List messages in a conversation',
					},
				],
				displayOptions: {
					show: {
						resource: ['message'],
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
						description: 'Fetch the authenticated user profile',
						action: 'Fetch the authenticated user profile',
					},
				],
				displayOptions: {
					show: {
						resource: ['profile'],
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
						name: 'Add Agent',
						value: 'addAgent',
						description: 'Add agents to the team',
						action: 'Add agents to the team',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a team',
						action: 'Create a team',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a team',
						action: 'Delete a team',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get team details',
						action: 'Get team details',
					},
					{
						name: 'Get Agents',
						value: 'getAgents',
						description: 'List agents in the team',
						action: 'List agents in the team',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'List all teams',
						action: 'List all teams',
					},
					{
						name: 'Remove Agent',
						value: 'removeAgent',
						description: 'Remove agents from the team',
						action: 'Remove agents from the team',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a team',
						action: 'Update a team',
					},
					{
						name: 'Update Agents',
						value: 'updateAgents',
						description: 'Overwrite agents in the team',
						action: 'Overwrite agents in the team',
					},
				],
				displayOptions: {
					show: {
						resource: ['team'],
					},
				},
				default: 'getMany',
			},
			...accountUpdateProperties,
			automationRuleIdProperty,
			...automationRuleCreateProperties,
			...automationRuleUpdateProperties,
			agentIdProperty,
			...agentCreateProperties,
			...agentUpdateProperties,
			agentBotIdProperty,
			...agentBotCreateProperties,
			...agentBotUpdateProperties,
			cannedResponseIdProperty,
			...cannedResponseCreateProperties,
			...cannedResponseUpdateProperties,
			contactIdProperty,
			...contactBaseCreateFields,
			...contactUpdateProperties,
			...contactListProperties,
			contactSearchProperty,
			contactFilterProperty,
			contactLabelsProperty,
			...contactCreateInboxProperties,
			...contactMergeProperties,
			customAttributeIdProperty,
			...customAttributeBaseFields,
			...customAttributeUpdateProperties,
			...profileUpdateProperties,
			integrationHookIdProperty,
			...integrationCreateProperties,
			...integrationUpdateProperties,
			teamIdProperty,
			...teamCreateProperties,
			...teamUpdateProperties,
			teamUserIdsProperty,
			inboxRecordIdProperty,
			...inboxCreateProperties,
			...inboxUpdateProperties,
			inboxAgentBotProperty,
			inboxUserIdsProperty,
			messageConversationIdProperty,
			messageIdProperty,
			...messageListProperties,
			...messageCreateProperties,
			...auditLogGetManyProperties,
			conversationIdProperty,
			...conversationListProperties,
			conversationFilterProperty,
			...conversationCreateProperties,
			...conversationUpdateProperties,
			...conversationToggleStatusProperties,
			conversationTogglePriorityProperty,
			...conversationTypingProperties,
			conversationCustomAttributesProperty,
			conversationLabelsProperty,
			...conversationAssignmentProperties,
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

				let response: IDataObject;

				if (resource === 'automationRule' && operation === 'getMany') {
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/automation_rules`,
					)) as IDataObject;
				} else if (resource === 'automationRule' && operation === 'get') {
					const automationRuleId = this.getNodeParameter('automationRuleId', itemIndex) as number;
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/automation_rules/${automationRuleId}`,
					)) as IDataObject;
				} else if (resource === 'automationRule' && operation === 'create') {
					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/automation_rules`,
						{
							name: this.getNodeParameter('automationRuleName', itemIndex) as string,
							description: this.getNodeParameter(
								'automationRuleDescription',
								itemIndex,
								'',
							) as string,
							event_name: this.getNodeParameter(
								'automationRuleEventName',
								itemIndex,
							) as string,
							active: this.getNodeParameter('automationRuleActive', itemIndex) as boolean,
							actions: this.getNodeParameter(
								'automationRuleActions',
								itemIndex,
								[],
							) as IDataObject[],
							conditions: this.getNodeParameter(
								'automationRuleConditions',
								itemIndex,
								[],
							) as IDataObject[],
						},
					)) as IDataObject;
				} else if (resource === 'automationRule' && operation === 'update') {
					const automationRuleId = this.getNodeParameter('automationRuleId', itemIndex) as number;
					const updateFields = this.getNodeParameter(
						'automationRuleUpdateFields.values',
						itemIndex,
						{},
					) as IDataObject;
					const body: IDataObject = {};

					if (updateFields.actions !== undefined) body.actions = updateFields.actions;
					if (updateFields.active !== undefined) body.active = updateFields.active;
					if (updateFields.conditions !== undefined) body.conditions = updateFields.conditions;
					if (updateFields.description !== undefined && updateFields.description !== '') {
						body.description = updateFields.description;
					}
					if (updateFields.eventName !== undefined) body.event_name = updateFields.eventName;
					if (updateFields.name !== undefined && updateFields.name !== '') body.name = updateFields.name;

					if (Object.keys(body).length === 0) {
						throw new NodeOperationError(this.getNode(), 'At least one update field must be provided', {
							itemIndex,
						});
					}

					response = (await megaApiRequest.call(
						this,
						'PATCH',
						`/api/v1/accounts/${accountId}/automation_rules/${automationRuleId}`,
						body,
					)) as IDataObject;
				} else if (resource === 'automationRule' && operation === 'delete') {
					const automationRuleId = this.getNodeParameter('automationRuleId', itemIndex) as number;
					await megaApiRequest.call(
						this,
						'DELETE',
						`/api/v1/accounts/${accountId}/automation_rules/${automationRuleId}`,
					);
					response = { success: true, id: automationRuleId };
				} else if (resource === 'profile' && operation === 'get') {
					response = (await megaApiRequest.call(this, 'GET', '/api/v1/profile')) as IDataObject;
				} else if (resource === 'integration' && operation === 'getMany') {
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/integrations/hooks`,
					)) as IDataObject;
				} else if (resource === 'integration' && operation === 'create') {
					const body: IDataObject = {
						app_id: this.getNodeParameter('integrationAppId', itemIndex) as number,
						settings: this.getNodeParameter('integrationSettings', itemIndex, {}) as IDataObject,
						status: this.getNodeParameter('integrationStatus', itemIndex, 1) as number,
					};
					const inboxId = this.getNodeParameter('integrationInboxId', itemIndex, 0) as number;
					if (inboxId > 0) {
						body.inbox_id = inboxId;
					}
					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/integrations/hooks`,
						body,
					)) as IDataObject;
				} else if (resource === 'integration' && operation === 'update') {
					const hookId = this.getNodeParameter('integrationHookId', itemIndex) as number;
					const updateFields = this.getNodeParameter(
						'integrationUpdateFields.values',
						itemIndex,
						{},
					) as IDataObject;
					const body: IDataObject = {};
					if (updateFields.settings !== undefined) {
						body.settings = updateFields.settings;
					}
					if (updateFields.status !== undefined) {
						body.status = updateFields.status;
					}
					response = (await megaApiRequest.call(
						this,
						'PATCH',
						`/api/v1/accounts/${accountId}/integrations/hooks/${hookId}`,
						body,
					)) as IDataObject;
				} else if (resource === 'integration' && operation === 'delete') {
					const hookId = this.getNodeParameter('integrationHookId', itemIndex) as number;
					await megaApiRequest.call(
						this,
						'DELETE',
						`/api/v1/accounts/${accountId}/integrations/hooks/${hookId}`,
					);
					response = { success: true, id: hookId };
				} else if (resource === 'team' && operation === 'getMany') {
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/teams`,
					)) as IDataObject;
				} else if (resource === 'team' && operation === 'get') {
					const teamId = this.getNodeParameter('teamId', itemIndex) as number;
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/teams/${teamId}`,
					)) as IDataObject;
				} else if (resource === 'team' && operation === 'create') {
					const body: IDataObject = {
						name: this.getNodeParameter('teamName', itemIndex) as string,
						description: this.getNodeParameter('teamDescription', itemIndex, '') as string,
						allow_auto_assign: this.getNodeParameter(
							'teamAllowAutoAssign',
							itemIndex,
							false,
						) as boolean,
					};
					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/teams`,
						body,
					)) as IDataObject;
				} else if (resource === 'team' && operation === 'update') {
					const teamId = this.getNodeParameter('teamId', itemIndex) as number;
					const updateFields = this.getNodeParameter('teamUpdateFields.values', itemIndex, {}) as IDataObject;
					const body: IDataObject = {};
					if (updateFields.allowAutoAssign !== undefined) {
						body.allow_auto_assign = updateFields.allowAutoAssign;
					}
					if (updateFields.description !== undefined) {
						body.description = updateFields.description;
					}
					if (updateFields.name !== undefined) {
						body.name = updateFields.name;
					}
					response = (await megaApiRequest.call(
						this,
						'PATCH',
						`/api/v1/accounts/${accountId}/teams/${teamId}`,
						body,
					)) as IDataObject;
				} else if (resource === 'team' && operation === 'delete') {
					const teamId = this.getNodeParameter('teamId', itemIndex) as number;
					await megaApiRequest.call(this, 'DELETE', `/api/v1/accounts/${accountId}/teams/${teamId}`);
					response = { success: true, id: teamId };
				} else if (resource === 'team' && operation === 'getAgents') {
					const teamId = this.getNodeParameter('teamId', itemIndex) as number;
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/teams/${teamId}/team_members`,
					)) as IDataObject;
				} else if (
					resource === 'team' &&
					['addAgent', 'removeAgent', 'updateAgents'].includes(operation)
				) {
					const teamId = this.getNodeParameter('teamId', itemIndex) as number;
					const userIds = this.getNodeParameter('teamUserIds', itemIndex, []) as number[];
					const method = operation === 'addAgent' ? 'POST' : operation === 'removeAgent' ? 'DELETE' : 'PATCH';
					response = (await megaApiRequest.call(
						this,
						method,
						`/api/v1/accounts/${accountId}/teams/${teamId}/team_members`,
						{ user_ids: userIds },
					)) as IDataObject;
				} else if (resource === 'inbox' && operation === 'getMany') {
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/inboxes`,
					)) as IDataObject;
				} else if (resource === 'inbox' && operation === 'get') {
					const inboxId = this.getNodeParameter('inboxRecordId', itemIndex) as number;
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/inboxes/${inboxId}`,
					)) as IDataObject;
				} else if (resource === 'inbox' && operation === 'create') {
					const body: IDataObject = {
						name: this.getNodeParameter('inboxName', itemIndex) as string,
						channel: {
							type: this.getNodeParameter('inboxChannelType', itemIndex) as string,
							...(this.getNodeParameter('inboxChannelConfig', itemIndex, {}) as IDataObject),
						},
						greeting_enabled: this.getNodeParameter('inboxGreetingEnabled', itemIndex, false) as boolean,
						enable_email_collect: this.getNodeParameter(
							'inboxEnableEmailCollect',
							itemIndex,
							false,
						) as boolean,
						csat_survey_enabled: this.getNodeParameter(
							'inboxCsatSurveyEnabled',
							itemIndex,
							false,
						) as boolean,
						enable_auto_assignment: this.getNodeParameter(
							'inboxEnableAutoAssignment',
							itemIndex,
							false,
						) as boolean,
						working_hours_enabled: this.getNodeParameter(
							'inboxWorkingHoursEnabled',
							itemIndex,
							false,
						) as boolean,
						allow_messages_after_resolved: this.getNodeParameter(
							'inboxAllowMessagesAfterResolved',
							itemIndex,
							false,
						) as boolean,
						lock_to_single_conversation: this.getNodeParameter(
							'inboxLockToSingleConversation',
							itemIndex,
							false,
						) as boolean,
						sender_name_type: this.getNodeParameter(
							'inboxSenderNameType',
							itemIndex,
							'friendly',
						) as string,
					};

					const greetingMessage = this.getNodeParameter('inboxGreetingMessage', itemIndex, '') as string;
					const outOfOfficeMessage = this.getNodeParameter(
						'inboxOutOfOfficeMessage',
						itemIndex,
						'',
					) as string;
					const timezone = this.getNodeParameter('inboxTimezone', itemIndex, '') as string;
					const businessName = this.getNodeParameter('inboxBusinessName', itemIndex, '') as string;
					const portalId = this.getNodeParameter('inboxPortalId', itemIndex, 0) as number;

					if (greetingMessage.trim()) body.greeting_message = greetingMessage;
					if (outOfOfficeMessage.trim()) body.out_of_office_message = outOfOfficeMessage;
					if (timezone.trim()) body.timezone = timezone;
					if (businessName.trim()) body.business_name = businessName;
					if (portalId > 0) body.portal_id = portalId;

					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/inboxes`,
						body,
					)) as IDataObject;
				} else if (resource === 'inbox' && operation === 'update') {
					const inboxId = this.getNodeParameter('inboxRecordId', itemIndex) as number;
					const updateFields = this.getNodeParameter('inboxUpdateFields.values', itemIndex, {}) as IDataObject;
					const body: IDataObject = {};

					if (updateFields.allowMessagesAfterResolved !== undefined) {
						body.allow_messages_after_resolved = updateFields.allowMessagesAfterResolved;
					}
					if (updateFields.businessName !== undefined && updateFields.businessName !== '') {
						body.business_name = updateFields.businessName;
					}
					if (updateFields.channelConfig !== undefined) {
						body.channel = updateFields.channelConfig;
					}
					if (updateFields.csatSurveyEnabled !== undefined) {
						body.csat_survey_enabled = updateFields.csatSurveyEnabled;
					}
					if (updateFields.enableAutoAssignment !== undefined) {
						body.enable_auto_assignment = updateFields.enableAutoAssignment;
					}
					if (updateFields.enableEmailCollect !== undefined) {
						body.enable_email_collect = updateFields.enableEmailCollect;
					}
					if (updateFields.greetingEnabled !== undefined) {
						body.greeting_enabled = updateFields.greetingEnabled;
					}
					if (updateFields.greetingMessage !== undefined && updateFields.greetingMessage !== '') {
						body.greeting_message = updateFields.greetingMessage;
					}
					if (updateFields.lockToSingleConversation !== undefined) {
						body.lock_to_single_conversation = updateFields.lockToSingleConversation;
					}
					if (updateFields.name !== undefined) {
						body.name = updateFields.name;
					}
					if (
						updateFields.outOfOfficeMessage !== undefined &&
						updateFields.outOfOfficeMessage !== ''
					) {
						body.out_of_office_message = updateFields.outOfOfficeMessage;
					}
					if (updateFields.portalId !== undefined && Number(updateFields.portalId) > 0) {
						body.portal_id = Number(updateFields.portalId);
					}
					if (updateFields.senderNameType !== undefined) {
						body.sender_name_type = updateFields.senderNameType;
					}
					if (updateFields.timezone !== undefined && updateFields.timezone !== '') {
						body.timezone = updateFields.timezone;
					}
					if (updateFields.workingHoursEnabled !== undefined) {
						body.working_hours_enabled = updateFields.workingHoursEnabled;
					}

					response = (await megaApiRequest.call(
						this,
						'PATCH',
						`/api/v1/accounts/${accountId}/inboxes/${inboxId}`,
						body,
					)) as IDataObject;
				} else if (resource === 'inbox' && operation === 'getAgentBot') {
					const inboxId = this.getNodeParameter('inboxRecordId', itemIndex) as number;
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/inboxes/${inboxId}/agent_bot`,
					)) as IDataObject;
				} else if (resource === 'inbox' && operation === 'setAgentBot') {
					const inboxId = this.getNodeParameter('inboxRecordId', itemIndex) as number;
					const agentBotId = this.getNodeParameter('inboxAgentBotId', itemIndex, '') as string;
					const body: IDataObject = {
						agent_bot: agentBotId.trim() ? Number(agentBotId) : null,
					};
					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/inboxes/${inboxId}/set_agent_bot`,
						body,
					)) as IDataObject;
				} else if (resource === 'inbox' && operation === 'getAgents') {
					const inboxId = this.getNodeParameter('inboxRecordId', itemIndex) as number;
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/inbox_members/${inboxId}`,
					)) as IDataObject;
				} else if (
					resource === 'inbox' &&
					['addAgent', 'removeAgent', 'updateAgents'].includes(operation)
				) {
					const inboxId = this.getNodeParameter('inboxRecordId', itemIndex) as number;
					const userIds = this.getNodeParameter('inboxUserIds', itemIndex, []) as number[];
					const method = operation === 'addAgent' ? 'POST' : operation === 'removeAgent' ? 'DELETE' : 'PATCH';
					response = (await megaApiRequest.call(
						this,
						method,
						`/api/v1/accounts/${accountId}/inbox_members`,
						{
							inbox_id: inboxId,
							user_ids: userIds,
						},
					)) as IDataObject;
				} else if (resource === 'message' && operation === 'getMany') {
					const conversationId = this.getNodeParameter('messageConversationId', itemIndex) as number;
					const after = this.getNodeParameter('messageAfterId', itemIndex, 0) as number;
					const before = this.getNodeParameter('messageBeforeId', itemIndex, 0) as number;
					const qs: IDataObject = {};
					if (after > 0) qs.after = after;
					if (before > 0) qs.before = before;
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`,
						undefined,
						qs,
					)) as IDataObject;
				} else if (resource === 'message' && operation === 'create') {
					const conversationId = this.getNodeParameter('messageConversationId', itemIndex) as number;
					const body: IDataObject = {
						content: this.getNodeParameter('messageCreateContent', itemIndex) as string,
						message_type: this.getNodeParameter('messageCreateType', itemIndex, 'outgoing') as string,
						private: this.getNodeParameter('messageCreatePrivate', itemIndex, false) as boolean,
						content_type: this.getNodeParameter(
							'messageCreateContentType',
							itemIndex,
							'text',
						) as string,
					};
					const contentAttributes = this.getNodeParameter(
						'messageCreateContentAttributes',
						itemIndex,
						{},
					) as IDataObject;
					const templateParams = this.getNodeParameter(
						'messageCreateTemplateParams',
						itemIndex,
						{},
					) as IDataObject;
					const campaignId = this.getNodeParameter('messageCreateCampaignId', itemIndex, 0) as number;

					if (Object.keys(contentAttributes).length > 0) {
						body.content_attributes = contentAttributes;
					}
					if (Object.keys(templateParams).length > 0) {
						body.template_params = templateParams;
					}
					if (campaignId > 0) {
						body.campaign_id = campaignId;
					}

					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`,
						body,
					)) as IDataObject;
				} else if (resource === 'message' && operation === 'delete') {
					const conversationId = this.getNodeParameter('messageConversationId', itemIndex) as number;
					const messageId = this.getNodeParameter('messageId', itemIndex) as number;
					await megaApiRequest.call(
						this,
						'DELETE',
						`/api/v1/accounts/${accountId}/conversations/${conversationId}/messages/${messageId}`,
					);
					response = { success: true, id: messageId };
				} else if (resource === 'contact' && operation === 'getMany') {
					const page = this.getNodeParameter('contactPage', itemIndex, 1) as number;
					const sort = this.getNodeParameter('contactSort', itemIndex, 'name') as string;

					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/contacts`,
						undefined,
						{ page, sort },
					)) as IDataObject;
				} else if (resource === 'contact' && operation === 'create') {
					const body: IDataObject = {
						inbox_id: this.getNodeParameter('contactInboxId', itemIndex) as number,
						blocked: this.getNodeParameter('contactBlocked', itemIndex) as boolean,
					};
					const name = this.getNodeParameter('contactName', itemIndex, '') as string;
					const email = this.getNodeParameter('contactEmail', itemIndex, '') as string;
					const phoneNumber = this.getNodeParameter(
						'contactPhoneNumber',
						itemIndex,
						'',
					) as string;
					const avatarUrl = this.getNodeParameter(
						'contactAvatarUrl',
						itemIndex,
						'',
					) as string;
					const identifier = this.getNodeParameter(
						'contactIdentifier',
						itemIndex,
						'',
					) as string;
					const additionalAttributes = this.getNodeParameter(
						'contactAdditionalAttributes',
						itemIndex,
						{},
					) as IDataObject;
					const customAttributes = this.getNodeParameter(
						'contactCustomAttributes',
						itemIndex,
						{},
					) as IDataObject;

					if (name.trim()) body.name = name;
					if (email.trim()) body.email = email;
					if (phoneNumber.trim()) body.phone_number = phoneNumber;
					if (avatarUrl.trim()) body.avatar_url = avatarUrl;
					if (identifier.trim()) body.identifier = identifier;
					if (Object.keys(additionalAttributes).length > 0) {
						body.additional_attributes = additionalAttributes;
					}
					if (Object.keys(customAttributes).length > 0) {
						body.custom_attributes = customAttributes;
					}

					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/contacts`,
						body,
					)) as IDataObject;
				} else if (resource === 'contact' && operation === 'get') {
					const contactId = this.getNodeParameter('contactRecordId', itemIndex) as number;
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/contacts/${contactId}`,
					)) as IDataObject;
				} else if (resource === 'contact' && operation === 'update') {
					const contactId = this.getNodeParameter('contactRecordId', itemIndex) as number;
					const updateFields = this.getNodeParameter(
						'contactUpdateFields.values',
						itemIndex,
						{},
					) as IDataObject;
					const body: IDataObject = {};

					if (updateFields.additionalAttributes !== undefined) {
						body.additional_attributes = updateFields.additionalAttributes;
					}
					if (updateFields.avatarUrl !== undefined && updateFields.avatarUrl !== '') {
						body.avatar_url = updateFields.avatarUrl;
					}
					if (updateFields.blocked !== undefined) {
						body.blocked = updateFields.blocked;
					}
					if (updateFields.customAttributes !== undefined) {
						body.custom_attributes = updateFields.customAttributes;
					}
					if (updateFields.email !== undefined && updateFields.email !== '') {
						body.email = updateFields.email;
					}
					if (updateFields.identifier !== undefined && updateFields.identifier !== '') {
						body.identifier = updateFields.identifier;
					}
					if (updateFields.name !== undefined && updateFields.name !== '') {
						body.name = updateFields.name;
					}
					if (updateFields.phoneNumber !== undefined && updateFields.phoneNumber !== '') {
						body.phone_number = updateFields.phoneNumber;
					}

					if (Object.keys(body).length === 0) {
						throw new NodeOperationError(this.getNode(), 'At least one update field must be provided', {
							itemIndex,
						});
					}

					response = (await megaApiRequest.call(
						this,
						'PUT',
						`/api/v1/accounts/${accountId}/contacts/${contactId}`,
						body,
					)) as IDataObject;
				} else if (resource === 'contact' && operation === 'delete') {
					const contactId = this.getNodeParameter('contactRecordId', itemIndex) as number;
					await megaApiRequest.call(
						this,
						'DELETE',
						`/api/v1/accounts/${accountId}/contacts/${contactId}`,
					);
					response = { success: true, id: contactId };
				} else if (resource === 'contact' && operation === 'getConversations') {
					const contactId = this.getNodeParameter('contactRecordId', itemIndex) as number;
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/contacts/${contactId}/conversations`,
					)) as IDataObject;
				} else if (resource === 'contact' && operation === 'search') {
					const page = this.getNodeParameter('contactPage', itemIndex, 1) as number;
					const sort = this.getNodeParameter('contactSort', itemIndex, 'name') as string;
					const q = this.getNodeParameter('contactQuery', itemIndex) as string;
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/contacts/search`,
						undefined,
						{ page, q, sort },
					)) as IDataObject;
				} else if (resource === 'contact' && operation === 'filter') {
					const payload = this.getNodeParameter('contactFilterPayload', itemIndex, []) as IDataObject[];
					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/contacts/filter`,
						{ payload },
					)) as IDataObject;
				} else if (resource === 'contact' && operation === 'createInbox') {
					const contactId = this.getNodeParameter('contactRecordId', itemIndex) as number;
					const body: IDataObject = {
						inbox_id: this.getNodeParameter('contactInboxRecordInboxId', itemIndex) as number,
					};
					const sourceId = this.getNodeParameter(
						'contactInboxRecordSourceId',
						itemIndex,
						'',
					) as string;
					if (sourceId.trim()) {
						body.source_id = sourceId;
					}
					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/contacts/${contactId}/contact_inboxes`,
						body,
					)) as IDataObject;
				} else if (resource === 'contact' && operation === 'getContactableInboxes') {
					const contactId = this.getNodeParameter('contactRecordId', itemIndex) as number;
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/contacts/${contactId}/contactable_inboxes`,
					)) as IDataObject;
				} else if (resource === 'contact' && operation === 'getLabels') {
					const contactId = this.getNodeParameter('contactRecordId', itemIndex) as number;
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/contacts/${contactId}/labels`,
					)) as IDataObject;
				} else if (resource === 'contact' && operation === 'setLabels') {
					const contactId = this.getNodeParameter('contactRecordId', itemIndex) as number;
					const labels = this.getNodeParameter('contactLabels', itemIndex, []) as string[];
					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/contacts/${contactId}/labels`,
						{ labels },
					)) as IDataObject;
				} else if (resource === 'contact' && operation === 'merge') {
					const baseContactId = this.getNodeParameter('baseContactId', itemIndex) as number;
					const mergeeContactId = this.getNodeParameter('mergeeContactId', itemIndex) as number;
					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/actions/contact_merge`,
						{
							base_contact_id: baseContactId,
							mergee_contact_id: mergeeContactId,
						},
					)) as IDataObject;
				} else if (resource === 'cannedResponse' && operation === 'getMany') {
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/canned_responses`,
					)) as IDataObject;
				} else if (resource === 'cannedResponse' && operation === 'create') {
					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/canned_responses`,
						{
							content: this.getNodeParameter('cannedResponseContent', itemIndex) as string,
							short_code: this.getNodeParameter(
								'cannedResponseShortCode',
								itemIndex,
							) as string,
						},
					)) as IDataObject;
				} else if (resource === 'cannedResponse' && operation === 'update') {
					const cannedResponseId = this.getNodeParameter('cannedResponseId', itemIndex) as number;
					const updateFields = this.getNodeParameter(
						'cannedResponseUpdateFields.values',
						itemIndex,
						{},
					) as IDataObject;
					const body: IDataObject = {};

					if (updateFields.content !== undefined && updateFields.content !== '') {
						body.content = updateFields.content;
					}

					if (updateFields.shortCode !== undefined && updateFields.shortCode !== '') {
						body.short_code = updateFields.shortCode;
					}

					if (Object.keys(body).length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'At least one update field must be provided',
							{ itemIndex },
						);
					}

					response = (await megaApiRequest.call(
						this,
						'PATCH',
						`/api/v1/accounts/${accountId}/canned_responses/${cannedResponseId}`,
						body,
					)) as IDataObject;
				} else if (resource === 'cannedResponse' && operation === 'delete') {
					const cannedResponseId = this.getNodeParameter('cannedResponseId', itemIndex) as number;

					await megaApiRequest.call(
						this,
						'DELETE',
						`/api/v1/accounts/${accountId}/canned_responses/${cannedResponseId}`,
					);

					response = {
						success: true,
						id: cannedResponseId,
					};
				} else if (resource === 'customAttribute' && operation === 'getMany') {
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/custom_attribute_definitions`,
					)) as IDataObject;
				} else if (resource === 'customAttribute' && operation === 'get') {
					const customAttributeId = this.getNodeParameter('customAttributeId', itemIndex) as number;

					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/custom_attribute_definitions/${customAttributeId}`,
					)) as IDataObject;
				} else if (resource === 'customAttribute' && operation === 'create') {
					const body: IDataObject = {
						attribute_display_name: this.getNodeParameter(
							'customAttributeDisplayName',
							itemIndex,
						) as string,
						attribute_display_type: this.getNodeParameter(
							'customAttributeDisplayType',
							itemIndex,
						) as number,
						attribute_key: this.getNodeParameter('customAttributeKey', itemIndex) as string,
						attribute_model: this.getNodeParameter(
							'customAttributeModel',
							itemIndex,
						) as number,
						attribute_values: this.getNodeParameter(
							'customAttributeValues',
							itemIndex,
							[],
						) as IDataObject,
					};

					const attributeDescription = this.getNodeParameter(
						'customAttributeDescription',
						itemIndex,
						'',
					) as string;
					const regexPattern = this.getNodeParameter(
						'customAttributeRegexPattern',
						itemIndex,
						'',
					) as string;
					const regexCue = this.getNodeParameter(
						'customAttributeRegexCue',
						itemIndex,
						'',
					) as string;
					const defaultValue = this.getNodeParameter(
						'customAttributeDefaultValue',
						itemIndex,
						'',
					) as string;

					if (attributeDescription.trim()) {
						body.attribute_description = attributeDescription;
					}

					if (regexPattern.trim()) {
						body.regex_pattern = regexPattern;
					}

					if (regexCue.trim()) {
						body.regex_cue = regexCue;
					}

					if (defaultValue.trim()) {
						body.default_value = defaultValue;
					}

					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/custom_attribute_definitions`,
						body,
					)) as IDataObject;
				} else if (resource === 'customAttribute' && operation === 'update') {
					const customAttributeId = this.getNodeParameter('customAttributeId', itemIndex) as number;
					const updateFields = this.getNodeParameter(
						'customAttributeUpdateFields.values',
						itemIndex,
						{},
					) as IDataObject;
					const body: IDataObject = {};

					if (
						updateFields.attributeDisplayName !== undefined &&
						updateFields.attributeDisplayName !== ''
					) {
						body.attribute_display_name = updateFields.attributeDisplayName;
					}

					if (updateFields.attributeDisplayType !== undefined) {
						body.attribute_display_type = updateFields.attributeDisplayType;
					}

					if (
						updateFields.attributeDescription !== undefined &&
						updateFields.attributeDescription !== ''
					) {
						body.attribute_description = updateFields.attributeDescription;
					}

					if (updateFields.attributeKey !== undefined && updateFields.attributeKey !== '') {
						body.attribute_key = updateFields.attributeKey;
					}

					if (updateFields.attributeValues !== undefined) {
						body.attribute_values = updateFields.attributeValues;
					}

					if (updateFields.attributeModel !== undefined) {
						body.attribute_model = updateFields.attributeModel;
					}

					if (updateFields.regexPattern !== undefined && updateFields.regexPattern !== '') {
						body.regex_pattern = updateFields.regexPattern;
					}

					if (updateFields.regexCue !== undefined && updateFields.regexCue !== '') {
						body.regex_cue = updateFields.regexCue;
					}

					if (updateFields.defaultValue !== undefined && updateFields.defaultValue !== '') {
						body.default_value = updateFields.defaultValue;
					}

					if (Object.keys(body).length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'At least one update field must be provided',
							{ itemIndex },
						);
					}

					response = (await megaApiRequest.call(
						this,
						'PATCH',
						`/api/v1/accounts/${accountId}/custom_attribute_definitions/${customAttributeId}`,
						body,
					)) as IDataObject;
				} else if (resource === 'customAttribute' && operation === 'delete') {
					const customAttributeId = this.getNodeParameter('customAttributeId', itemIndex) as number;

					await megaApiRequest.call(
						this,
						'DELETE',
						`/api/v1/accounts/${accountId}/custom_attribute_definitions/${customAttributeId}`,
					);

					response = {
						success: true,
						id: customAttributeId,
					};
				} else if (resource === 'agent' && operation === 'getMany') {
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/agents`,
					)) as IDataObject;
				} else if (resource === 'agent' && operation === 'create') {
					const body: IDataObject = {
						name: this.getNodeParameter('agentName', itemIndex) as string,
						email: this.getNodeParameter('agentEmail', itemIndex) as string,
						role: this.getNodeParameter('agentRole', itemIndex) as string,
						availability_status: this.getNodeParameter(
							'agentAvailabilityStatus',
							itemIndex,
						) as string,
						auto_offline: this.getNodeParameter('agentAutoOffline', itemIndex) as boolean,
					};

					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/agents`,
						body,
					)) as IDataObject;
				} else if (resource === 'agent' && operation === 'update') {
					const agentId = this.getNodeParameter('agentId', itemIndex) as number;
					const updateFields = this.getNodeParameter(
						'agentUpdateFields.values',
						itemIndex,
						{},
					) as IDataObject;
					const body: IDataObject = {};

					if (updateFields.role !== undefined) {
						body.role = updateFields.role;
					}

					if (updateFields.availabilityStatus !== undefined) {
						body.availability_status = updateFields.availabilityStatus;
					}

					if (updateFields.autoOffline !== undefined) {
						body.auto_offline = updateFields.autoOffline;
					}

					if (Object.keys(body).length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'At least one update field must be provided',
							{ itemIndex },
						);
					}

					response = (await megaApiRequest.call(
						this,
						'PATCH',
						`/api/v1/accounts/${accountId}/agents/${agentId}`,
						body,
					)) as IDataObject;
				} else if (resource === 'agent' && operation === 'delete') {
					const agentId = this.getNodeParameter('agentId', itemIndex) as number;

					await megaApiRequest.call(this, 'DELETE', `/api/v1/accounts/${accountId}/agents/${agentId}`);

					response = {
						success: true,
						id: agentId,
					};
				} else if (resource === 'agentBot' && operation === 'getMany') {
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/agent_bots`,
					)) as IDataObject;
				} else if (resource === 'agentBot' && operation === 'create') {
					const body: IDataObject = {
						name: this.getNodeParameter('agentBotName', itemIndex) as string,
						outgoing_url: this.getNodeParameter('agentBotOutgoingUrl', itemIndex) as string,
						bot_type: this.getNodeParameter('agentBotType', itemIndex) as number,
						bot_config: this.getNodeParameter('agentBotConfig', itemIndex, {}) as IDataObject,
					};

					const description = this.getNodeParameter('agentBotDescription', itemIndex, '') as string;
					const avatarUrl = this.getNodeParameter('agentBotAvatarUrl', itemIndex, '') as string;

					if (description.trim()) {
						body.description = description;
					}

					if (avatarUrl.trim()) {
						body.avatar_url = avatarUrl;
					}

					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/agent_bots`,
						body,
					)) as IDataObject;
				} else if (resource === 'agentBot' && operation === 'get') {
					const agentBotId = this.getNodeParameter('agentBotId', itemIndex) as number;

					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/agent_bots/${agentBotId}`,
					)) as IDataObject;
				} else if (resource === 'agentBot' && operation === 'update') {
					const agentBotId = this.getNodeParameter('agentBotId', itemIndex) as number;
					const updateFields = this.getNodeParameter(
						'agentBotUpdateFields.values',
						itemIndex,
						{},
					) as IDataObject;
					const body: IDataObject = {};

					if (updateFields.avatarUrl !== undefined && updateFields.avatarUrl !== '') {
						body.avatar_url = updateFields.avatarUrl;
					}

					if (updateFields.botConfig !== undefined) {
						body.bot_config = updateFields.botConfig;
					}

					if (updateFields.botType !== undefined) {
						body.bot_type = updateFields.botType;
					}

					if (updateFields.description !== undefined && updateFields.description !== '') {
						body.description = updateFields.description;
					}

					if (updateFields.name !== undefined && updateFields.name !== '') {
						body.name = updateFields.name;
					}

					if (updateFields.outgoingUrl !== undefined && updateFields.outgoingUrl !== '') {
						body.outgoing_url = updateFields.outgoingUrl;
					}

					if (Object.keys(body).length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'At least one update field must be provided',
							{ itemIndex },
						);
					}

					response = (await megaApiRequest.call(
						this,
						'PATCH',
						`/api/v1/accounts/${accountId}/agent_bots/${agentBotId}`,
						body,
					)) as IDataObject;
				} else if (resource === 'agentBot' && operation === 'delete') {
					const agentBotId = this.getNodeParameter('agentBotId', itemIndex) as number;

					await megaApiRequest.call(
						this,
						'DELETE',
						`/api/v1/accounts/${accountId}/agent_bots/${agentBotId}`,
					);

					response = {
						success: true,
						id: agentBotId,
					};
				} else if (resource === 'auditLog' && operation === 'getMany') {
					const page = this.getNodeParameter('page', itemIndex, 1) as number;

					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/audit_logs`,
						undefined,
						{ page },
					)) as IDataObject;
				} else if (resource === 'account' && operation === 'get') {
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}`,
					)) as IDataObject;
				} else if (resource === 'account' && operation === 'update') {
					const updateFields = this.getNodeParameter(
						'updateFields.values',
						itemIndex,
						{},
					) as IDataObject;
					const body: IDataObject = {};

					if (updateFields.name !== undefined && updateFields.name !== '') {
						body.name = updateFields.name;
					}

					if (updateFields.locale !== undefined && updateFields.locale !== '') {
						body.locale = updateFields.locale;
					}

					if (updateFields.domain !== undefined && updateFields.domain !== '') {
						body.domain = updateFields.domain;
					}

					if (updateFields.supportEmail !== undefined && updateFields.supportEmail !== '') {
						body.support_email = updateFields.supportEmail;
					}

					if (updateFields.autoResolveAfter !== undefined) {
						body.auto_resolve_after = updateFields.autoResolveAfter;
					}

					if (
						updateFields.autoResolveMessage !== undefined &&
						updateFields.autoResolveMessage !== ''
					) {
						body.auto_resolve_message = updateFields.autoResolveMessage;
					}

					if (updateFields.autoResolveIgnoreWaiting !== undefined) {
						body.auto_resolve_ignore_waiting = updateFields.autoResolveIgnoreWaiting;
					}

					if (updateFields.industry !== undefined && updateFields.industry !== '') {
						body.industry = updateFields.industry;
					}

					if (updateFields.companySize !== undefined && updateFields.companySize !== '') {
						body.company_size = updateFields.companySize;
					}

					if (updateFields.timezone !== undefined && updateFields.timezone !== '') {
						body.timezone = updateFields.timezone;
					}

					if (Object.keys(body).length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'At least one update field must be provided',
							{ itemIndex },
						);
					}

					response = (await megaApiRequest.call(
						this,
						'PATCH',
						`/api/v1/accounts/${accountId}`,
						body,
					)) as IDataObject;
				} else if (resource === 'conversation' && operation === 'getCounts') {
					const status = this.getNodeParameter('conversationListStatus', itemIndex, 'open') as string;
					const q = this.getNodeParameter('conversationQuery', itemIndex, '') as string;
					const inboxId = this.getNodeParameter('conversationListInboxId', itemIndex, 0) as number;
					const teamId = this.getNodeParameter('conversationListTeamId', itemIndex, 0) as number;
					const labels = this.getNodeParameter('conversationListLabels', itemIndex, []) as string[];
					const qs: IDataObject = { status };

					if (q.trim()) qs.q = q;
					if (inboxId > 0) qs.inbox_id = inboxId;
					if (teamId > 0) qs.team_id = teamId;
					if (Array.isArray(labels) && labels.length > 0) qs.labels = labels;

					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/conversations/meta`,
						undefined,
						qs,
					)) as IDataObject;
				} else if (resource === 'conversation' && operation === 'getMany') {
					const assigneeType = this.getNodeParameter(
						'conversationAssigneeType',
						itemIndex,
						'all',
					) as string;
					const status = this.getNodeParameter('conversationListStatus', itemIndex, 'open') as string;
					const q = this.getNodeParameter('conversationQuery', itemIndex, '') as string;
					const inboxId = this.getNodeParameter('conversationListInboxId', itemIndex, 0) as number;
					const teamId = this.getNodeParameter('conversationListTeamId', itemIndex, 0) as number;
					const labels = this.getNodeParameter('conversationListLabels', itemIndex, []) as string[];
					const page = this.getNodeParameter('conversationPage', itemIndex, 1) as number;
					const qs: IDataObject = {
						assignee_type: assigneeType,
						page,
						status,
					};

					if (q.trim()) qs.q = q;
					if (inboxId > 0) qs.inbox_id = inboxId;
					if (teamId > 0) qs.team_id = teamId;
					if (Array.isArray(labels) && labels.length > 0) qs.labels = labels;

					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/conversations`,
						undefined,
						qs,
					)) as IDataObject;
				} else if (resource === 'conversation' && operation === 'filter') {
					const payload = this.getNodeParameter(
						'conversationFilterPayload',
						itemIndex,
						[],
					) as IDataObject[];
					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/conversations/filter`,
						{ payload },
					)) as IDataObject;
				} else if (resource === 'conversation' && operation === 'get') {
					const conversationId = this.getNodeParameter('conversationId', itemIndex) as number;
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/conversations/${conversationId}`,
					)) as IDataObject;
				} else if (resource === 'conversation' && operation === 'create') {
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

					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/conversations`,
						body,
					)) as IDataObject;
				} else if (resource === 'conversation' && operation === 'update') {
					const conversationId = this.getNodeParameter('conversationId', itemIndex) as number;
					const body: IDataObject = {
						priority: this.getNodeParameter('conversationPriority', itemIndex, 'none') as string,
					};
					const slaPolicyId = this.getNodeParameter('conversationSlaPolicyId', itemIndex, 0) as number;
					if (slaPolicyId > 0) {
						body.sla_policy_id = slaPolicyId;
					}

					response = (await megaApiRequest.call(
						this,
						'PATCH',
						`/api/v1/accounts/${accountId}/conversations/${conversationId}`,
						body,
					)) as IDataObject;
				} else if (resource === 'conversation' && operation === 'toggleStatus') {
					const conversationId = this.getNodeParameter('conversationId', itemIndex) as number;
					const status = this.getNodeParameter(
						'conversationToggleStatusValue',
						itemIndex,
					) as string;
					const body: IDataObject = { status };
					const snoozedUntil = this.getNodeParameter('conversationSnoozedUntil', itemIndex, 0) as number;
					if (status === 'snoozed' && snoozedUntil > 0) {
						body.snoozed_until = snoozedUntil;
					}
					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/conversations/${conversationId}/toggle_status`,
						body,
					)) as IDataObject;
				} else if (resource === 'conversation' && operation === 'togglePriority') {
					const conversationId = this.getNodeParameter('conversationId', itemIndex) as number;
					const priority = this.getNodeParameter(
						'conversationTogglePriorityValue',
						itemIndex,
						'none',
					) as string;
					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/conversations/${conversationId}/toggle_priority`,
						{ priority },
					)) as IDataObject;
				} else if (resource === 'conversation' && operation === 'toggleTypingStatus') {
					const conversationId = this.getNodeParameter('conversationId', itemIndex) as number;
					const typingStatus = this.getNodeParameter(
						'conversationTypingStatus',
						itemIndex,
						'on',
					) as string;
					const isPrivate = this.getNodeParameter(
						'conversationTypingPrivate',
						itemIndex,
						false,
					) as boolean;
					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/conversations/${conversationId}/toggle_typing_status`,
						{
							is_private: isPrivate,
							typing_status: typingStatus,
						},
					)) as IDataObject;
				} else if (resource === 'conversation' && operation === 'setCustomAttributes') {
					const conversationId = this.getNodeParameter('conversationId', itemIndex) as number;
					const customAttributes = this.getNodeParameter(
						'conversationCustomAttributesPayload',
						itemIndex,
						{},
					) as IDataObject;
					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/conversations/${conversationId}/custom_attributes`,
						{
							custom_attributes: customAttributes,
						},
					)) as IDataObject;
				} else if (resource === 'conversation' && operation === 'getLabels') {
					const conversationId = this.getNodeParameter('conversationId', itemIndex) as number;
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/conversations/${conversationId}/labels`,
					)) as IDataObject;
				} else if (resource === 'conversation' && operation === 'setLabels') {
					const conversationId = this.getNodeParameter('conversationId', itemIndex) as number;
					const labels = this.getNodeParameter('conversationLabels', itemIndex, []) as string[];
					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/conversations/${conversationId}/labels`,
						{ labels },
					)) as IDataObject;
				} else if (resource === 'conversation' && operation === 'getReportingEvents') {
					const conversationId = this.getNodeParameter('conversationId', itemIndex) as number;
					response = (await megaApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/conversations/${conversationId}/conversation_events`,
					)) as IDataObject;
				} else if (resource === 'conversation' && operation === 'assign') {
					const conversationId = this.getNodeParameter('conversationId', itemIndex) as number;
					const assigneeId = this.getNodeParameter(
						'conversationAssignmentAssigneeId',
						itemIndex,
						0,
					) as number;
					const teamId = this.getNodeParameter(
						'conversationAssignmentTeamId',
						itemIndex,
						0,
					) as number;
					const body: IDataObject = {};

					if (assigneeId > 0) {
						body.assignee_id = assigneeId;
					} else if (teamId > 0) {
						body.team_id = teamId;
					} else {
						throw new NodeOperationError(
							this.getNode(),
							'Assignee ID or Team ID must be provided',
							{ itemIndex },
						);
					}

					response = (await megaApiRequest.call(
						this,
						'POST',
						`/api/v1/accounts/${accountId}/conversations/${conversationId}/assignments`,
						body,
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
						'Mega API request failed. Confirm the base URL, API access token, account ID, and payload fields.',
				});
			}
		}

		return [returnData];
	}
}
