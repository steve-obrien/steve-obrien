import assert from 'node:assert/strict';
import {
	formDefinitionToJsonSchema,
	inferFormNodeFromValue,
	normalizeFormChildren,
	normalizeFormNode,
	registerFormType,
} from '../src/pages/elements/forms/form/formDefinition.js';

function fieldByName(children, name) {
	return children.find((child) => child.props?.name === name);
}

const keyed = normalizeFormChildren({
	name: {
		type: 'string',
		label: 'Full name',
		required: true,
	},
	email: {
		type: 'email',
		label: 'Email',
	},
});

assert.equal(keyed.length, 2);
assert.deepEqual(fieldByName(keyed, 'name'), {
	type: 'string',
	component: 'ElTextInput',
	props: {
		label: 'Full name',
		required: true,
		name: 'name',
	},
});
assert.equal(fieldByName(keyed, 'email').component, 'ElEmailInput');

const objectNode = normalizeFormNode({
	type: 'ElForm',
	properties: {
		title: { type: 'string' },
	},
});

assert.equal(objectNode.type, 'object');
assert.equal(objectNode.component, 'ElForm');
assert.equal(objectNode.children[0].props.name, 'title');

const searchField = normalizeFormNode({
	type: 'ElTextInput',
	label: 'Search',
	typeProp: 'top level prop',
	props: {
		type: 'search',
		label: 'Search input',
	},
});

assert.equal(searchField.type, 'string');
assert.equal(searchField.component, 'ElTextInput');
assert.deepEqual(searchField.props, {
	label: 'Search input',
	typeProp: 'top level prop',
	type: 'search',
});

const explicitName = normalizeFormChildren({
	name: {
		type: 'string',
		name: 'displayName',
	},
});
assert.equal(explicitName[0].props.name, 'displayName');

registerFormType('UserInvite', {
	type: 'ElForm',
	properties: {
		email: { type: 'email', required: true },
		role: {
			type: 'string',
			component: 'ElSelectInput',
			options: ['admin', 'member'],
		},
	},
});

const team = normalizeFormNode({
	type: 'object',
	properties: {
		teamName: { type: 'string', required: true },
		invites: {
			type: 'array',
			items: { type: 'UserInvite' },
		},
	},
});

assert.equal(team.component, 'ElForm');
assert.equal(fieldByName(team.children, 'invites').component, 'ElJsonListInput');
assert.equal(fieldByName(team.children, 'invites').items.type, 'object');
assert.equal(fieldByName(team.children, 'invites').items.children[0].props.name, 'email');

const directArray = normalizeFormNode({
	type: 'array',
	items: { type: 'UserInvite' },
});

assert.equal(directArray.type, 'array');
assert.equal(directArray.component, 'ElJsonListInput');
assert.equal(directArray.items.component, 'ElForm');

const inferredMenuItems = normalizeFormNode(inferFormNodeFromValue([
	{ label: 'Open', value: 'open', href: 'https://example.com' },
	{ label: 'Advanced', value: 'advanced', children: [{ label: 'Export', value: 'export' }] },
	{ separator: true },
]));

assert.equal(inferredMenuItems.component, 'ElJsonListInput');
assert.equal(inferredMenuItems.items.component, 'ElForm');
assert.equal(fieldByName(inferredMenuItems.items.children, 'label').component, 'ElTextInput');
assert.equal(fieldByName(inferredMenuItems.items.children, 'href').component, 'ElUrlInput');
assert.equal(fieldByName(inferredMenuItems.items.children, 'separator').component, 'ElToggle');
assert.equal(fieldByName(inferredMenuItems.items.children, 'children').component, 'ElJsonListInput');

const schema = formDefinitionToJsonSchema(team);
assert.deepEqual(schema, {
	type: 'object',
	properties: {
		teamName: {
			type: 'string',
		},
		invites: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					email: {
						type: 'string',
						format: 'email',
					},
					role: {
						type: 'string',
						enum: ['admin', 'member'],
					},
				},
				required: ['email'],
			},
		},
	},
	required: ['teamName'],
});

console.log('Form definition checks passed.');
