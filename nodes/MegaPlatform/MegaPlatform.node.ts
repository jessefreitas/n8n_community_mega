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

import { megaPlatformApiRequest } from './shared/transport';

const platformAccountIdProperty: INodeProperties = {
	displayName: 'Account ID',
	name: 'platformAccountId',
	type: 'number',
	typeOptions: {
		numberPrecision: 0,
	},
	default: 0,
	required: true,
	description: 'ID of the account',
	displayOptions: {
		show: {
			resource: ['account'],
			operation: ['delete', 'get', 'update'],
		},
	},
};

const platformAccountUserAccountIdProperty: INodeProperties = {
	displayName: 'Account ID',
	name: 'platformAccountUserAccountId',
	type: 'number',
	typeOptions: {
		numberPrecision: 0,
	},
	default: 0,
	required: true,
	description: 'ID of the account',
	displayOptions: {
		show: {
			resource: ['accountUser'],
			operation: ['create', 'delete', 'getMany'],
		},
	},
};

const platformAccountStatusOptions: INodePropertyOptions[] = [
	{ name: 'Active', value: 'active' },
	{ name: 'Suspended', value: 'suspended' },
];

const platformAccountCreateProperties: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'platformAccountName',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the account',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Locale',
		name: 'platformAccountLocale',
		type: 'string',
		default: 'en',
		description: 'Locale of the account',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Domain',
		name: 'platformAccountDomain',
		type: 'string',
		default: '',
		description: 'Domain of the account',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Support Email',
		name: 'platformAccountSupportEmail',
		type: 'string',
		default: '',
		placeholder: 'name@email.com',
		description: 'Support email of the account',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Status',
		name: 'platformAccountStatus',
		type: 'options',
		options: platformAccountStatusOptions,
		default: 'active',
		description: 'Status of the account',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Limits',
		name: 'platformAccountLimits',
		type: 'json',
		default: '{}',
		description: 'Limits object for the account',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Custom Attributes',
		name: 'platformAccountCustomAttributes',
		type: 'json',
		default: '{}',
		description: 'Custom attributes object for the account',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['create'],
			},
		},
	},
];

const platformAccountUpdateProperties: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'platformAccountUpdateFields',
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
						displayName: 'Custom Attributes',
						name: 'customAttributes',
						type: 'json',
						default: '{}',
						description: 'Custom attributes object for the account',
					},
					{
						displayName: 'Domain',
						name: 'domain',
						type: 'string',
						default: '',
						description: 'Domain of the account',
					},
					{
						displayName: 'Limits',
						name: 'limits',
						type: 'json',
						default: '{}',
						description: 'Limits object for the account',
					},
					{
						displayName: 'Locale',
						name: 'locale',
						type: 'string',
						default: 'en',
						description: 'Locale of the account',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Name of the account',
					},
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: platformAccountStatusOptions,
						default: 'active',
						description: 'Status of the account',
					},
					{
						displayName: 'Support Email',
						name: 'supportEmail',
						type: 'string',
						default: '',
						placeholder: 'name@email.com',
						description: 'Support email of the account',
					},
				],
			},
		],
	},
];

const platformAccountUserRoleOptions: INodePropertyOptions[] = [
	{ name: 'Administrator', value: 'administrator' },
	{ name: 'Agent', value: 'agent' },
];

const platformAccountUserCreateProperties: INodeProperties[] = [
	{
		displayName: 'User ID',
		name: 'platformAccountUserId',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 0,
		required: true,
		description: 'ID of the user to attach to the account',
		displayOptions: {
			show: {
				resource: ['accountUser'],
				operation: ['create', 'delete'],
			},
		},
	},
	{
		displayName: 'Role',
		name: 'platformAccountUserRole',
		type: 'options',
		options: platformAccountUserRoleOptions,
		default: 'administrator',
		description: 'Role of the user in the account',
		displayOptions: {
			show: {
				resource: ['accountUser'],
				operation: ['create'],
			},
		},
	},
];

const platformAgentBotIdProperty: INodeProperties = {
	displayName: 'Agent Bot ID',
	name: 'platformAgentBotId',
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
			operation: ['delete', 'get', 'update'],
		},
	},
};

const platformAgentBotBaseProperties: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'platformAgentBotName',
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
		name: 'platformAgentBotDescription',
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
		name: 'platformAgentBotOutgoingUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'Outgoing webhook URL of the agent bot',
		displayOptions: {
			show: {
				resource: ['agentBot'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Account ID',
		name: 'platformAgentBotAccountId',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 0,
		required: true,
		description: 'Account ID that owns the agent bot',
		displayOptions: {
			show: {
				resource: ['agentBot'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Avatar URL',
		name: 'platformAgentBotAvatarUrl',
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
];

const platformAgentBotUpdateProperties: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'platformAgentBotUpdateFields',
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
						displayName: 'Account ID',
						name: 'accountId',
						type: 'number',
						typeOptions: {
							numberPrecision: 0,
						},
						default: 0,
						description: 'Account ID that owns the agent bot',
					},
					{
						displayName: 'Avatar URL',
						name: 'avatarUrl',
						type: 'string',
						default: '',
						description: 'URL of the agent bot avatar image',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'Description of the agent bot',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Name of the agent bot',
					},
					{
						displayName: 'Outgoing URL',
						name: 'outgoingUrl',
						type: 'string',
						default: '',
						description: 'Outgoing webhook URL of the agent bot',
					},
				],
			},
		],
	},
];

const platformUserIdProperty: INodeProperties = {
	displayName: 'User ID',
	name: 'platformUserId',
	type: 'number',
	typeOptions: {
		numberPrecision: 0,
	},
	default: 0,
	required: true,
	description: 'ID of the user',
	displayOptions: {
		show: {
			resource: ['user'],
			operation: ['delete', 'get', 'getSsoLink', 'update'],
		},
	},
};

const platformUserCreateProperties: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'platformUserName',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the user',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Display Name',
		name: 'platformUserDisplayName',
		type: 'string',
		default: '',
		description: 'Display name of the user',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Email',
		name: 'platformUserEmail',
		type: 'string',
		default: '',
		placeholder: 'name@email.com',
		required: true,
		description: 'Email of the user',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Password',
		name: 'platformUserPassword',
		type: 'string',
		typeOptions: { password: true },
		default: '',
		required: true,
		description: 'Password of the user',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Custom Attributes',
		name: 'platformUserCustomAttributes',
		type: 'json',
		default: '{}',
		description: 'Custom attributes object for the user',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
	},
];

const platformUserUpdateProperties: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'platformUserUpdateFields',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add Field',
		typeOptions: {
			multipleValues: false,
		},
		description: 'Fields to update on the user',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['update'],
			},
		},
		options: [
			{
				name: 'values',
				displayName: 'Values',
				values: [
					{
						displayName: 'Custom Attributes',
						name: 'customAttributes',
						type: 'json',
						default: '{}',
						description: 'Custom attributes object for the user',
					},
					{
						displayName: 'Display Name',
						name: 'displayName',
						type: 'string',
						default: '',
						description: 'Display name of the user',
					},
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						default: '',
						placeholder: 'name@email.com',
						description: 'Email of the user',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Name of the user',
					},
					{
						displayName: 'Password',
						name: 'password',
						type: 'string',
						typeOptions: { password: true },
						default: '',
						description: 'Password of the user',
					},
				],
			},
		],
	},
];

export class MegaPlatform implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mega Platform',
		name: 'megaPlatform',
		icon: { light: 'file:../../icons/mega.svg', dark: 'file:../../icons/mega.dark.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Work with Mega Platform API',
		defaults: {
			name: 'Mega Platform',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'megaPlatformApi',
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
					{ name: 'Account', value: 'account' },
					{ name: 'Account User', value: 'accountUser' },
					{ name: 'Agent Bot', value: 'agentBot' },
					{ name: 'User', value: 'user' },
				],
				default: 'account',
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
						description: 'Create an account',
						action: 'Create an account',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an account',
						action: 'Delete an account',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get account details',
						action: 'Get account details',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an account',
						action: 'Update an account',
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
						description: 'Create an account user',
						action: 'Create an account user',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an account user',
						action: 'Delete an account user',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'List all account users',
						action: 'List all account users',
					},
				],
				displayOptions: {
					show: {
						resource: ['accountUser'],
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
						description: 'Create a user',
						action: 'Create a user',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a user',
						action: 'Delete a user',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get user details',
						action: 'Get user details',
					},
					{
						name: 'Get SSO Link',
						value: 'getSsoLink',
						description: 'Get the user SSO link',
						action: 'Get the user SSO link',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a user',
						action: 'Update a user',
					},
				],
				displayOptions: {
					show: {
						resource: ['user'],
					},
				},
				default: 'get',
			},
			platformAccountIdProperty,
			...platformAccountCreateProperties,
			...platformAccountUpdateProperties,
			platformAccountUserAccountIdProperty,
			...platformAccountUserCreateProperties,
			platformAgentBotIdProperty,
			...platformAgentBotBaseProperties,
			...platformAgentBotUpdateProperties,
			platformUserIdProperty,
			...platformUserCreateProperties,
			...platformUserUpdateProperties,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				let response: IDataObject;

				if (resource === 'account' && operation === 'create') {
					response = (await megaPlatformApiRequest.call(this, 'POST', '/platform/api/v1/accounts', {
						name: this.getNodeParameter('platformAccountName', itemIndex) as string,
						locale: this.getNodeParameter('platformAccountLocale', itemIndex, 'en') as string,
						domain: this.getNodeParameter('platformAccountDomain', itemIndex, '') as string,
						support_email: this.getNodeParameter(
							'platformAccountSupportEmail',
							itemIndex,
							'',
						) as string,
						status: this.getNodeParameter('platformAccountStatus', itemIndex, 'active') as string,
						limits: this.getNodeParameter('platformAccountLimits', itemIndex, {}) as IDataObject,
						custom_attributes: this.getNodeParameter(
							'platformAccountCustomAttributes',
							itemIndex,
							{},
						) as IDataObject,
					})) as IDataObject;
				} else if (resource === 'account' && operation === 'get') {
					const accountId = this.getNodeParameter('platformAccountId', itemIndex) as number;
					response = (await megaPlatformApiRequest.call(
						this,
						'GET',
						`/platform/api/v1/accounts/${accountId}`,
					)) as IDataObject;
				} else if (resource === 'account' && operation === 'update') {
					const accountId = this.getNodeParameter('platformAccountId', itemIndex) as number;
					const updateFields = this.getNodeParameter(
						'platformAccountUpdateFields.values',
						itemIndex,
						{},
					) as IDataObject;
					const body: IDataObject = {};

					if (updateFields.customAttributes !== undefined) body.custom_attributes = updateFields.customAttributes;
					if (updateFields.domain !== undefined) body.domain = updateFields.domain;
					if (updateFields.limits !== undefined) body.limits = updateFields.limits;
					if (updateFields.locale !== undefined) body.locale = updateFields.locale;
					if (updateFields.name !== undefined) body.name = updateFields.name;
					if (updateFields.status !== undefined) body.status = updateFields.status;
					if (updateFields.supportEmail !== undefined) body.support_email = updateFields.supportEmail;

					response = (await megaPlatformApiRequest.call(
						this,
						'PATCH',
						`/platform/api/v1/accounts/${accountId}`,
						body,
					)) as IDataObject;
				} else if (resource === 'account' && operation === 'delete') {
					const accountId = this.getNodeParameter('platformAccountId', itemIndex) as number;
					await megaPlatformApiRequest.call(
						this,
						'DELETE',
						`/platform/api/v1/accounts/${accountId}`,
					);
					response = { success: true, id: accountId };
				} else if (resource === 'accountUser' && operation === 'getMany') {
					const accountId = this.getNodeParameter('platformAccountUserAccountId', itemIndex) as number;
					response = (await megaPlatformApiRequest.call(
						this,
						'GET',
						`/platform/api/v1/accounts/${accountId}/account_users`,
					)) as IDataObject;
				} else if (resource === 'accountUser' && operation === 'create') {
					const accountId = this.getNodeParameter('platformAccountUserAccountId', itemIndex) as number;
					response = (await megaPlatformApiRequest.call(
						this,
						'POST',
						`/platform/api/v1/accounts/${accountId}/account_users`,
						{
							user_id: this.getNodeParameter('platformAccountUserId', itemIndex) as number,
							role: this.getNodeParameter('platformAccountUserRole', itemIndex, 'administrator') as string,
						},
					)) as IDataObject;
				} else if (resource === 'accountUser' && operation === 'delete') {
					const accountId = this.getNodeParameter('platformAccountUserAccountId', itemIndex) as number;
					const userId = this.getNodeParameter('platformAccountUserId', itemIndex) as number;
					await megaPlatformApiRequest.call(
						this,
						'DELETE',
						`/platform/api/v1/accounts/${accountId}/account_users`,
						{ user_id: userId },
					);
					response = { success: true, id: userId };
				} else if (resource === 'agentBot' && operation === 'getMany') {
					response = (await megaPlatformApiRequest.call(
						this,
						'GET',
						'/platform/api/v1/agent_bots',
					)) as IDataObject;
				} else if (resource === 'agentBot' && operation === 'get') {
					const agentBotId = this.getNodeParameter('platformAgentBotId', itemIndex) as number;
					response = (await megaPlatformApiRequest.call(
						this,
						'GET',
						`/platform/api/v1/agent_bots/${agentBotId}`,
					)) as IDataObject;
				} else if (resource === 'agentBot' && operation === 'create') {
					const body: IDataObject = {
						name: this.getNodeParameter('platformAgentBotName', itemIndex) as string,
						description: this.getNodeParameter(
							'platformAgentBotDescription',
							itemIndex,
							'',
						) as string,
						outgoing_url: this.getNodeParameter('platformAgentBotOutgoingUrl', itemIndex) as string,
						account_id: this.getNodeParameter('platformAgentBotAccountId', itemIndex) as number,
					};
					const avatarUrl = this.getNodeParameter('platformAgentBotAvatarUrl', itemIndex, '') as string;
					if (avatarUrl.trim()) body.avatar_url = avatarUrl;
					response = (await megaPlatformApiRequest.call(
						this,
						'POST',
						'/platform/api/v1/agent_bots',
						body,
					)) as IDataObject;
				} else if (resource === 'agentBot' && operation === 'update') {
					const agentBotId = this.getNodeParameter('platformAgentBotId', itemIndex) as number;
					const updateFields = this.getNodeParameter(
						'platformAgentBotUpdateFields.values',
						itemIndex,
						{},
					) as IDataObject;
					const body: IDataObject = {};

					if (updateFields.accountId !== undefined && Number(updateFields.accountId) > 0) {
						body.account_id = Number(updateFields.accountId);
					}
					if (updateFields.avatarUrl !== undefined) body.avatar_url = updateFields.avatarUrl;
					if (updateFields.description !== undefined) body.description = updateFields.description;
					if (updateFields.name !== undefined) body.name = updateFields.name;
					if (updateFields.outgoingUrl !== undefined) body.outgoing_url = updateFields.outgoingUrl;

					response = (await megaPlatformApiRequest.call(
						this,
						'PATCH',
						`/platform/api/v1/agent_bots/${agentBotId}`,
						body,
					)) as IDataObject;
				} else if (resource === 'agentBot' && operation === 'delete') {
					const agentBotId = this.getNodeParameter('platformAgentBotId', itemIndex) as number;
					await megaPlatformApiRequest.call(
						this,
						'DELETE',
						`/platform/api/v1/agent_bots/${agentBotId}`,
					);
					response = { success: true, id: agentBotId };
				} else if (resource === 'user' && operation === 'create') {
					response = (await megaPlatformApiRequest.call(this, 'POST', '/platform/api/v1/users', {
						name: this.getNodeParameter('platformUserName', itemIndex) as string,
						display_name: this.getNodeParameter('platformUserDisplayName', itemIndex, '') as string,
						email: this.getNodeParameter('platformUserEmail', itemIndex) as string,
						password: this.getNodeParameter('platformUserPassword', itemIndex) as string,
						custom_attributes: this.getNodeParameter(
							'platformUserCustomAttributes',
							itemIndex,
							{},
						) as IDataObject,
					})) as IDataObject;
				} else if (resource === 'user' && operation === 'get') {
					const userId = this.getNodeParameter('platformUserId', itemIndex) as number;
					response = (await megaPlatformApiRequest.call(
						this,
						'GET',
						`/platform/api/v1/users/${userId}`,
					)) as IDataObject;
				} else if (resource === 'user' && operation === 'update') {
					const userId = this.getNodeParameter('platformUserId', itemIndex) as number;
					const updateFields = this.getNodeParameter('platformUserUpdateFields.values', itemIndex, {}) as IDataObject;
					const body: IDataObject = {};

					if (updateFields.customAttributes !== undefined) body.custom_attributes = updateFields.customAttributes;
					if (updateFields.displayName !== undefined) body.display_name = updateFields.displayName;
					if (updateFields.email !== undefined) body.email = updateFields.email;
					if (updateFields.name !== undefined) body.name = updateFields.name;
					if (updateFields.password !== undefined) body.password = updateFields.password;

					response = (await megaPlatformApiRequest.call(
						this,
						'PATCH',
						`/platform/api/v1/users/${userId}`,
						body,
					)) as IDataObject;
				} else if (resource === 'user' && operation === 'delete') {
					const userId = this.getNodeParameter('platformUserId', itemIndex) as number;
					await megaPlatformApiRequest.call(this, 'DELETE', `/platform/api/v1/users/${userId}`);
					response = { success: true, id: userId };
				} else if (resource === 'user' && operation === 'getSsoLink') {
					const userId = this.getNodeParameter('platformUserId', itemIndex) as number;
					response = (await megaPlatformApiRequest.call(
						this,
						'GET',
						`/platform/api/v1/users/${userId}/login`,
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
						'Mega Platform API request failed. Confirm the base URL, platform API access token, and payload fields.',
				});
			}
		}

		return [returnData];
	}
}
