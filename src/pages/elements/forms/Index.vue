<script setup>
import { computed, ref } from 'vue';
import ElementsLayout from '../_layout/ElementsLayout.vue';
import CodeBlock from '../_layout/CodeBlock.vue';
import DocPage from '../_layout/DocPage.vue';
import DocSection from '../_layout/DocSection.vue';
import { ElForm, formDefinitionToJsonSchema, normalizeFormNode } from '../lib/vue';

const customInputCode = `<script setup>
import { ElField, fieldProps, useField } from '@elements/vue';

const props = defineProps({
\t...fieldProps,
\ttype: { type: String, default: 'text' },
});
const emit = defineEmits(['update:modelValue', 'focus', 'blur']);
const field = useField(props, emit, { idPrefix: 'my-input' });
<\/script>

<template>
\t<ElField v-bind="field.fieldAttrs.value" :chrome="chrome">
\t\t<input
\t\t\tv-bind="field.inputAttrs.value"
\t\t\t:type="type"
\t\t\tclass="el-input"
\t\t\t@input="field.onInput($event.target.value)"
\t\t\t@focus="field.onFocus"
\t\t\t@blur="field.onBlur"
\t\t/>
\t</ElField>
</template>`;

const fieldLayoutCode = `<script setup>
import { ElField, ElGridFieldLayout } from '@elements/vue';
import LetterFieldLayout from './LetterFieldLayout.vue';
<\/script>

<template>
\t<ElForm>
\t\t<ElField :field-layout="LetterFieldLayout" :chrome="false">
\t\t\t<ElTextInput name="name" label="Name" />
\t\t\t<ElEmailInput name="email" label="Email" />
\t\t</ElField>

\t\t<ElForm name="invitees.0" class="grid grid-cols-2 gap-2">
\t\t\t<ElField :field-layout="ElGridFieldLayout" :chrome="false">
\t\t\t\t<ElTextInput name="first" label="First" />
\t\t\t\t<ElEmailInput name="email" label="Email" />
\t\t\t</ElField>
\t\t</ElForm>
\t</ElForm>
</template>`;

const providerCode = `<ElForm v-model="account" name="account">
\t<ElTextInput name="name" label="Name" />
\t<ElEmailInput name="email" label="Email" required />

\t<ElForm name="billing">
\t\t<ElTextInput name="postcode" label="Postcode" />
\t</ElForm>
</ElForm>`;

const fieldContractCode = `{
\tid: String,
\tname: String,
\tlabel: String,
\tdescription: String,
\tplaceholder: String,
\tmodelValue: unknown,
\trequired: Boolean,
\tdisabled: Boolean,
\treadOnly: Boolean,
\tinvalid: Boolean,
\terrors: Array | Object | String,
\tvisible: Boolean,
\tvalidators: Array,
\tvalidateOnBlur: Boolean,
\tchrome: 'field' | false,
}`;

const providerContractCode = `{
\tvalues,
\terrors,
\tfieldStates,
\tfields,
\tstate,
\tgetValue(name),
\tsetValue(name, value),
\tgetFieldPath(name),
\tgetHtmlName(name),
\tgetHtmlId(name),
\tgetFieldState(name),
\tsetFieldState(name, patch),
\tgetState(),
\tregisterField(field),
\tunregisterField(name),
\tvalidate(),
\treset(nextValues),
}`;

const validatorRecordCode = `[
\t{ name: 'required' },
\t{ name: 'email' },
\t{
\t\tname: 'minLength',
\t\tprops: {
\t\t\tmin: 3,
\t\t},
\t\tmessage: 'Use at least 3 characters.',
\t},
\t{
\t\tname: 'maxLength',
\t\tprops: {
\t\t\tmax: 32,
\t\t},
\t},
\t{
\t\tname: 'serverUnique',
\t\tprops: {
\t\t\tresource: 'users',
\t\t\tfield: 'username',
\t\t\tmessage: 'That username is already taken.',
\t\t},
\t},
]`;

const serverValidationCode = `{
\tvalidator: 'serverUnique',
\tprops: { resource: 'users', field: 'username' },
\tfield: {
\t\tname: 'username',
\t\tpath: 'account.username',
\t\tvalue: 'steve',
\t},
\tvalues: {
\t\taccount: {
\t\t\tusername: 'steve',
\t\t},
\t},
}`;

const activeFieldCode = `{
\tname: 'price',
\ttype: 'decimal',
\tcomponent: 'ElMoneyInput',
\tlabel: 'Price',
\tstorage: {
\t\ttype: 'decimal',
\t\tprecision: 10,
\t\tscale: 2,
\t},
\ttransformers: ['trim', 'emptyStringToNull', 'currencyToDecimal'],
\tvalidators: [
\t\t{ name: 'required' },
\t\t{ name: 'min', props: { min: 0 } },
\t],
}`;

const conditionalFieldCode = `{
\tname: 'companyDetails',
\tcomponent: 'ElForm',
\tvisibleWhen: {
\t\tfield: 'accountType',
\t\tequals: 'company',
\t},
}`;

const definitionShapeCode = `{
\ttype: 'ElForm',
\tproperties: {
\t\tname: {
\t\t\ttype: 'string',
\t\t\tlabel: 'Full name',
\t\t\trequired: true,
\t\t},
\t\temail: {
\t\t\ttype: 'email',
\t\t\tlabel: 'Email',
\t\t},
\t\trole: {
\t\t\ttype: 'string',
\t\t\tcomponent: 'ElSelectInput',
\t\t\tlabel: 'Role',
\t\t\toptions: ['viewer', 'editor', 'admin'],
\t\t},
\t},
}`;

const equivalentChildrenCode = `{
\tcomponent: 'ElForm',
\tchildren: [
\t\t{
\t\t\tcomponent: 'ElTextInput',
\t\t\tprops: {
\t\t\t\tname: 'name',
\t\t\t\tlabel: 'Full name',
\t\t\t\trequired: true,
\t\t\t},
\t\t},
\t\t{
\t\t\tcomponent: 'ElEmailInput',
\t\t\tprops: {
\t\t\t\tname: 'email',
\t\t\t\tlabel: 'Email',
\t\t\t},
\t\t},
\t\t{
\t\t\tcomponent: 'ElSelectInput',
\t\t\tprops: {
\t\t\t\tname: 'role',
\t\t\t\tlabel: 'Role',
\t\t\t\toptions: ['viewer', 'editor', 'admin'],
\t\t\t},
\t\t},
\t],
}`;

const defaultDefinition = {
	type: 'ElForm',
	properties: {
		teamName: {
			type: 'string',
			label: 'Team name',
			required: true,
			placeholder: 'Platform team',
		},
		ownerEmail: {
			type: 'email',
			label: 'Owner email',
			required: true,
		},
		defaultRole: {
			type: 'string',
			component: 'ElSelectInput',
			label: 'Default role',
			options: [
				{ label: 'Admin', value: 'admin' },
				{ label: 'Member', value: 'member' },
				{ label: 'Viewer', value: 'viewer' },
			],
		},
		active: {
			type: 'boolean',
			label: 'Active team',
		},
		billing: {
			type: 'ElForm',
			label: 'Billing contact',
			properties: {
				name: {
					type: 'string',
					label: 'Contact name',
				},
				email: {
					type: 'email',
					label: 'Contact email',
				},
			},
		},
		invites: {
			type: 'array',
			label: 'Invites',
			items: {
				type: 'ElForm',
				properties: {
					email: {
						type: 'email',
						label: 'Invitee email',
						required: true,
					},
					role: {
						type: 'string',
						component: 'ElSelectInput',
						label: 'Role',
						options: ['admin', 'member', 'viewer'],
					},
				},
			},
		},
	},
};

const definitionSource = ref(JSON.stringify(defaultDefinition, null, '\t'));
const definitionValue = ref({
	teamName: 'Elements',
	ownerEmail: 'lead@example.com',
	defaultRole: 'member',
	active: true,
	billing: {
		name: 'Ada Lovelace',
		email: 'ada@example.com',
	},
	invites: [
		{ email: 'grace@example.com', role: 'admin' },
	],
});

const parsedDefinition = computed(() => {
	try {
		return {
			value: JSON.parse(definitionSource.value),
			error: '',
		};
	} catch (error) {
		return {
			value: null,
			error: error?.message || 'Invalid JSON',
		};
	}
});
const normalizedDefinition = computed(() => (
	parsedDefinition.value.value ? normalizeFormNode(parsedDefinition.value.value) : null
));
const normalizedDefinitionCode = computed(() => (
	normalizedDefinition.value ? JSON.stringify(normalizedDefinition.value, null, '\t') : ''
));
const jsonSchemaCodeOutput = computed(() => (
	normalizedDefinition.value ? JSON.stringify(formDefinitionToJsonSchema(normalizedDefinition.value), null, '\t') : ''
));

const principles = [
	{
		name: 'One public field shape',
		description: 'Form-capable controls spread fieldProps instead of redefining label, description, value, validation, disabled, and chrome props locally.',
	},
	{
		name: 'One field behaviour layer',
		description: 'Controls call useField for value updates, generated IDs, HTML names, validation state, and parent form registration.',
	},
	{
		name: 'Chrome stays visual',
		description: 'ElField renders labels, descriptions, required markers, errors, and optional layout components. It does not own form data, and ElForm does not own field layout.',
	},
	{
		name: 'Forms own aggregation',
		description: 'ElForm owns values, field state, errors, validation, nested path scopes, and programmatic form methods, not presentation.',
	},
	{
		name: 'Definitions stay separate from data',
		description: 'Terse definitions, normalized children, JSON Schema, and future storage metadata describe the form. v-model stores only submitted values.',
	},
];

const statuses = [
	{
		name: 'Implemented',
		description: 'Shared field props, useField, ElField-owned field layouts, ElForm provider state, nested fieldset forms, dynamic children, terse form normalization, JSON Schema/Zod adapters, and the named forms registry.',
	},
	{
		name: 'Direction',
		description: 'An active-field framework where types resolve to renderers, fields describe validation and value transforms, and schemas can travel from UI to storage and back.',
	},
	{
		name: 'Future work',
		description: 'Async server validation, richer validator editing in Studio, conditional fields, validator registries, and backend data-type mapping.',
	},
];

const fieldStates = [
	{ name: 'interaction', description: 'State-machine axis for user interaction: untouched, focused, or blurred.' },
	{ name: 'modification', description: 'State-machine axis for value changes: clean or changed.' },
	{ name: 'validation', description: 'State-machine axis for validation: unknown, validating, valid, or invalid.' },
	{ name: 'focused', description: 'True while the control inside the field has focus.' },
	{ name: 'touched', description: 'Derived from interaction; true when the field is focused or blurred.' },
	{ name: 'dirty', description: 'True after input changes the value from its initial state.' },
	{ name: 'validating', description: 'True while async validators are running.' },
	{ name: 'invalid / valid', description: 'Derived from validation. Boolean patches are accepted as shorthand, such as { invalid: true } becoming validation: invalid.' },
	{ name: 'errors', description: 'Messages or error records from props, validators, or the parent form.' },
	{ name: 'visible', description: 'False hides the field but keeps its model value unless the form removes it.' },
	{ name: 'readOnly', description: 'Shows the value but prevents editing.' },
	{ name: 'disabled', description: 'Disables interaction and may be omitted from native submission.' },
];

const fieldCapabilities = [
	'Standalone v-model without a parent form.',
	'Registration with the nearest parent ElForm when a name is present.',
	'Derived dot paths, native HTML names, and generated IDs.',
	'Validation state and error display.',
	'Default chrome through ElField, or :chrome="false" when another ElField owns the visual layout.',
];

const formResponsibilities = [
	'The data object and model updates.',
	'The field registry and field state.',
	'Form-level validity and submission validation.',
	'Nested form contexts and path scopes.',
	'Programmatic updates through refs and the named forms registry.',
];

const validatorPhases = [
	'Use the validator registry helpers: defineValidator, getValidator, listValidators, and compileValidators.',
	'Keep built-in validators in registry definitions while preserving existing function validators.',
	'Add ElValidatorInput so Studio can edit validator records with form controls.',
	'Use string rules only as sugar that compiles into the same serializable records.',
	'Add async/server validation with stale-result protection, debouncing, and a standard request payload.',
];

const runtimeBoundaries = [
	{
		name: 'Authored errors prop',
		description: 'Static errors configured on a field node. These are editable in Studio because they are part of the authored component props.',
	},
	{
		name: 'Runtime form state errors',
		description: 'Errors produced by validators, server responses, or calls such as form.setFieldState(name, { errors }). These display on the field but should not be written back into authored props.',
	},
	{
		name: 'Future inspector state',
		description: 'Studio should expose read-only runtime value, dirty/touched/focused state, invalid state, and normalized errors for the selected field.',
	},
];

const packagedLayers = [
	{
		name: 'ElField',
		description: 'Shared label, description, error display, and required marker.',
	},
	{
		name: 'ElGridFieldLayout',
		description: 'Compact field layout for grid or table-style form sections where headers carry visible labels.',
	},
	{
		name: 'ElTextInput',
		description: 'Generic text entry with the shared field contract.',
	},
	{
		name: 'ElEmailInput',
		description: 'Text input wrapper with type=email, email autocomplete, and email validation defaults.',
	},
	{
		name: 'ElUrlInput',
		description: 'Text input wrapper with type=url, URL validation, and optional normalization.',
	},
];

const serverSchemaItems = [
	'fields',
	'labels',
	'defaults',
	'validation rules',
	'backend data types',
	'transformers',
	'permissions',
	'conditional visibility rules',
	'relation options',
];

const implementedCoverage = [
	'Text, textarea, number, password, email, and URL inputs.',
	'Native select, select input, listbox, radio group, combobox, autocomplete, and tag combobox.',
	'Checkbox, toggle, toggle button, and toggle button group.',
	'Calendar, color, code, JSON, JSON list, position input, and range input.',
	'Wrapper inputs such as ElEmailInput and ElUrlInput delegate to ElTextInput instead of registering an extra field.',
	'Composite inputs such as ElJsonInput and ElJsonListInput own the field and disable internal child registration where needed.',
];

const openQuestions = [
	'Should server validators be represented as validators, transformers, or separate field actions?',
	'Should field visibility remove data from the form result, or only hide the input?',
	'How much component metadata should live in the type registry, and how much should stay beside props through _edit?',
	'How should conditional field expressions work across Studio, AI-generated schemas, and server-provided forms?',
	'Should native form submission serialize hidden JSON/list fields as strings, or remain a secondary fallback?',
];

const componentLinks = [
	{
		to: '/elements/forms/field',
		title: 'Field',
		body: 'Visual field chrome, slots, and the custom input pattern.',
		tag: '<ElField>',
	},
	{
		to: '/elements/forms/form',
		title: 'Form',
		body: 'Provider API, registration, validation, nested forms, events, and methods.',
		tag: '<ElForm>',
	},
	{
		to: '/elements/forms/schema',
		title: 'Form schema',
		body: 'How typed definitions relate to JSON Schema, values, storage metadata, and generation.',
		tag: 'Schema + data',
	},
];
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Forms Overview"
			tagline="The shared approach behind Elements fields, form providers, validation state, and generated schemas."
			tag="Form approach"
			eyebrow="Forms"
		>
			<DocSection eyebrow="Principle" title="Keep the contract in code">
				<div class="space-y-4 text-sm leading-6 text-muted-foreground">
					<p>
						Elements form components should feel simple when used directly, but should
						also be able to participate in a larger form system. The stable contract is:
						fields present one named value, <code class="font-mono text-foreground">useField</code>
						wires that value into local and parent state, and
						<code class="font-mono text-foreground">ElForm</code> aggregates values,
						errors, validation, and paths.
					</p>
					<p>
						Use the Field and Form reference pages for prop, slot, event, and method
						details. When implementation changes, those component pages should be updated
						first; this overview should only change when the architecture changes.
					</p>
				</div>
			</DocSection>

			<DocSection eyebrow="Status" title="Current architecture and direction">
				<div class="grid gap-3 md:grid-cols-3">
					<div
						v-for="status in statuses"
						:key="status.name"
						class="rounded-lg border border-border bg-background p-4"
					>
						<h3 class="text-sm font-semibold text-foreground">{{ status.name }}</h3>
						<p class="mt-2 text-sm leading-6 text-muted-foreground">{{ status.description }}</p>
					</div>
				</div>
			</DocSection>

			<DocSection eyebrow="Layers" title="How the pieces divide responsibility">
				<div class="overflow-hidden rounded-lg border border-border">
					<table class="w-full text-left text-sm">
						<thead class="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
							<tr>
								<th class="px-4 py-2 font-medium">Layer</th>
								<th class="px-4 py-2 font-medium">Responsibility</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border">
							<tr v-for="principle in principles" :key="principle.name">
								<td class="px-4 py-3 font-medium text-foreground">{{ principle.name }}</td>
								<td class="px-4 py-3 text-muted-foreground">{{ principle.description }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</DocSection>

			<DocSection eyebrow="Definitions" title="Author forms as typed data shapes">
				<div class="space-y-6">
					<div class="space-y-4 text-sm leading-6 text-muted-foreground">
						<p>
							A form definition can be authored like a data schema. The root
							<code class="font-mono text-foreground">type</code>
							can be a data type such as
							<code class="font-mono text-foreground">object</code>
							or a component type such as
							<code class="font-mono text-foreground">ElForm</code>.
							Keyed
							<code class="font-mono text-foreground">properties</code>
							or
							<code class="font-mono text-foreground">children</code>
							become child fields, and each key becomes the field name unless the
							field explicitly sets another name.
						</p>
						<p>
							The normalizer turns that authoring shape into the canonical render shape:
							every node has a semantic
							<code class="font-mono text-foreground">type</code>,
							a renderer
							<code class="font-mono text-foreground">component</code>,
							and component props. Top-level non-structural keys are passed as props;
							explicit
							<code class="font-mono text-foreground">props</code>
							win when both are present.
						</p>
					</div>

					<div class="grid gap-4 lg:grid-cols-2">
						<div class="space-y-3">
							<p class="text-sm font-medium text-foreground">Terse authoring shape</p>
							<CodeBlock lang="js" :code="definitionShapeCode" />
						</div>
						<div class="space-y-3">
							<p class="text-sm font-medium text-foreground">Equivalent render shape</p>
							<CodeBlock lang="js" :code="equivalentChildrenCode" />
						</div>
					</div>

					<div class="grid gap-4 xl:grid-cols-2">
						<div class="space-y-3">
							<div>
								<p class="text-sm font-medium text-foreground">Editable definition</p>
								<p class="mt-1 text-sm leading-6 text-muted-foreground">
									Edit the terse JSON and compare the normalized render definition with the JSON Schema projection.
								</p>
							</div>
							<textarea
								v-model="definitionSource"
								spellcheck="false"
								class="min-h-96 w-full resize-y rounded-xl border border-input bg-background p-4 font-mono text-xs leading-5 text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
							/>
							<p v-if="parsedDefinition.error" class="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
								{{ parsedDefinition.error }}
							</p>
						</div>

						<div class="space-y-4">
							<div>
								<p class="text-sm font-medium text-foreground">Live form</p>
								<p class="mt-1 text-sm leading-6 text-muted-foreground">
									The renderer receives normalized children, while the model remains plain form data.
								</p>
							</div>
							<div class="rounded-xl border border-border bg-secondary/20 p-4">
								<ElForm
									v-if="normalizedDefinition"
									v-model="definitionValue"
									name="definitionDemo"
									:children="normalizedDefinition.children || []"
									class="space-y-4"
								/>
							</div>
						</div>

						<div class="space-y-3">
							<p class="text-sm font-medium text-foreground">Normalized form definition</p>
							<CodeBlock lang="json" :code="normalizedDefinitionCode" />
						</div>

						<div class="space-y-3">
							<p class="text-sm font-medium text-foreground">JSON Schema projection</p>
							<CodeBlock lang="json" :code="jsonSchemaCodeOutput" />
						</div>
					</div>
				</div>
			</DocSection>

			<DocSection eyebrow="Field controls" title="Build inputs from the shared field contract">
				<div class="space-y-4 text-sm leading-6 text-muted-foreground">
					<p>
						A packaged input should be mostly presentation and interaction. It spreads
						<code class="font-mono text-foreground">fieldProps</code>, calls
						<code class="font-mono text-foreground">useField</code>, and passes the returned
						attrs into <code class="font-mono text-foreground">ElField</code> and the
						real control. That gives standalone <code class="font-mono text-foreground">v-model</code>
						and parent <code class="font-mono text-foreground">ElForm</code> participation
						without two separate component APIs.
					</p>
					<CodeBlock lang="vue" :code="customInputCode" />
				</div>
			</DocSection>

			<DocSection eyebrow="Layout" title="Swap field layout by subtree">
				<div class="space-y-4 text-sm leading-6 text-muted-foreground">
					<p>
						For one-off layouts, wrap controls in <code class="font-mono text-foreground">ElField</code>
						and set the inner controls to <code class="font-mono text-foreground">:chrome="false"</code>.
						For a repeated layout pattern, pass a
						<code class="font-mono text-foreground">fieldLayout</code> component to
						<code class="font-mono text-foreground">ElField</code>. Use
						<code class="font-mono text-foreground">:chrome="false"</code> when the field is
						only providing layout to descendant controls. That changes presentation without
						creating a new data provider or changing field paths. The layout component receives
						the same label, default, errors, and description slots that
						<code class="font-mono text-foreground">ElField</code> renders by default.
					</p>
					<CodeBlock lang="vue" :code="fieldLayoutCode" />
				</div>
			</DocSection>

			<DocSection eyebrow="Field contract" title="One named chunk of form data">
				<div class="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
					<div class="space-y-4 text-sm leading-6 text-muted-foreground">
						<p>
							A field should represent one named chunk of form data. Form inputs should
							not define the common prop block manually; they should spread
							<code class="font-mono text-foreground">fieldProps</code> and extend it
							only with control-specific props.
						</p>
						<ul class="space-y-2">
							<li v-for="capability in fieldCapabilities" :key="capability" class="flex gap-2">
								<span class="mt-2 size-1.5 shrink-0 rounded-full bg-primary"></span>
								<span>{{ capability }}</span>
							</li>
						</ul>
					</div>
					<CodeBlock lang="js" :code="fieldContractCode" />
				</div>
			</DocSection>

			<DocSection eyebrow="Field state" title="The state every form-capable control should understand">
				<div class="overflow-hidden rounded-lg border border-border">
					<table class="w-full text-left text-sm">
						<thead class="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
							<tr>
								<th class="px-4 py-2 font-medium">State</th>
								<th class="px-4 py-2 font-medium">Meaning</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border">
							<tr v-for="state in fieldStates" :key="state.name">
								<td class="px-4 py-3 font-mono text-[12.5px] text-foreground">{{ state.name }}</td>
								<td class="px-4 py-3 text-muted-foreground">{{ state.description }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</DocSection>

			<DocSection eyebrow="Form provider" title="Let forms derive paths and aggregate state">
				<div class="space-y-4 text-sm leading-6 text-muted-foreground">
					<p>
						Fields use local names. Parent forms derive the dot path, native bracket name,
						and default ID from the form hierarchy. For example, a field named
						<code class="font-mono text-foreground">postcode</code> inside the
						<code class="font-mono text-foreground">billing</code> subform writes to
						<code class="font-mono text-foreground">billing.postcode</code>,
						and receives the native HTML name <code class="font-mono text-foreground">billing[postcode]</code>.
						The default input ID is <code class="font-mono text-foreground">billing_postcode</code>.
					</p>
					<CodeBlock lang="vue" :code="providerCode" />
				</div>
			</DocSection>

			<DocSection eyebrow="Form context" title="ElForm owns aggregation, not business state">
				<div class="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
					<div class="space-y-4 text-sm leading-6 text-muted-foreground">
						<p>
							A root form owns ordinary Vue state unless an app binds the model to Pinia
							or another store. Fields should only depend on the form provider contract,
							not on Pinia directly.
						</p>
						<p>
							When an app already uses Pinia, keep business data in the store and bind it
							to <code class="font-mono text-foreground">ElForm</code> with
							<code class="font-mono text-foreground">v-model</code>. The form instance
							still provides registration, validation, path helpers, and programmatic
							updates through refs or the named <code class="font-mono text-foreground">forms</code>
							registry.
						</p>
						<ul class="space-y-2">
							<li v-for="responsibility in formResponsibilities" :key="responsibility" class="flex gap-2">
								<span class="mt-2 size-1.5 shrink-0 rounded-full bg-primary"></span>
								<span>{{ responsibility }}</span>
							</li>
						</ul>
					</div>
					<CodeBlock lang="js" :code="providerContractCode" />
				</div>
			</DocSection>

			<DocSection eyebrow="Nested data" title="Subforms scope paths without nested native forms">
				<div class="space-y-4 text-sm leading-6 text-muted-foreground">
					<p>
						Forms can contain subforms for billing addresses, contact lists, repeatable
						rows, or conditional sections. A root
						<code class="font-mono text-foreground">ElForm</code> renders a native
						<code class="font-mono text-foreground">&lt;form&gt;</code>. An
						<code class="font-mono text-foreground">ElForm</code> inside another form
						renders as a <code class="font-mono text-foreground">&lt;fieldset&gt;</code>
						while keeping the same scoped API.
					</p>
					<p>
						Each subform contributes its local name to the derived path. A field named
						<code class="font-mono text-foreground">email</code> inside an
						<code class="font-mono text-foreground">invitees.0</code> subform writes to
						<code class="font-mono text-foreground">invitees.0.email</code>, receives the
						native name <code class="font-mono text-foreground">invitees[0][email]</code>,
						and defaults to the ID <code class="font-mono text-foreground">invitees_0_email</code>.
					</p>
				</div>
			</DocSection>

			<DocSection eyebrow="Validation" title="Validators should become portable records">
				<div class="space-y-4 text-sm leading-6 text-muted-foreground">
					<p>
						Validators can currently be functions or objects attached through field props.
						The long-term direction is a serializable validator record backed by a registry,
						so Studio editing, runtime validation, and server-side validation all speak the
						same shape.
					</p>
					<CodeBlock lang="js" :code="validatorRecordCode" />
					<p>
						String rules and helper decorators can still be authoring sugar, but the stored
						and server-visible result should be the same records.
					</p>
					<div class="overflow-hidden rounded-lg border border-border">
						<table class="w-full text-left text-sm">
							<thead class="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
								<tr>
									<th class="px-4 py-2 font-medium">Phase</th>
									<th class="px-4 py-2 font-medium">Direction</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-border">
								<tr v-for="(phase, index) in validatorPhases" :key="phase">
									<td class="px-4 py-3 font-mono text-[12.5px] text-foreground">{{ index + 1 }}</td>
									<td class="px-4 py-3 text-muted-foreground">{{ phase }}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</DocSection>

			<DocSection eyebrow="Server validation" title="Keep async validation tied to field paths">
				<div class="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
					<div class="space-y-4 text-sm leading-6 text-muted-foreground">
						<p>
							Async server validators should use stale-result protection and return
							normalized errors keyed by field path. The request should include the
							validator name, validator props, the field identity, the current value,
							and the surrounding form values needed for context.
						</p>
						<p>
							This keeps server validation as part of the same form contract rather than
							a separate system that can drift from Studio and client validation.
						</p>
					</div>
					<CodeBlock lang="js" :code="serverValidationCode" />
				</div>
			</DocSection>

			<DocSection eyebrow="Runtime state" title="Keep authored props separate from runtime errors">
				<div class="overflow-hidden rounded-lg border border-border">
					<table class="w-full text-left text-sm">
						<thead class="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
							<tr>
								<th class="px-4 py-2 font-medium">Boundary</th>
								<th class="px-4 py-2 font-medium">Meaning</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border">
							<tr v-for="boundary in runtimeBoundaries" :key="boundary.name">
								<td class="px-4 py-3 font-medium text-foreground">{{ boundary.name }}</td>
								<td class="px-4 py-3 text-muted-foreground">{{ boundary.description }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</DocSection>

			<DocSection eyebrow="Packaged inputs" title="Convenience wrappers should not duplicate fields">
				<div class="space-y-4 text-sm leading-6 text-muted-foreground">
					<p>
						Some inputs should exist as convenience components with default presentation,
						input type, validators, and transformers. They should usually wrap a more
						primitive field component instead of duplicating the field contract.
					</p>
					<div class="overflow-hidden rounded-lg border border-border">
						<table class="w-full text-left text-sm">
							<thead class="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
								<tr>
									<th class="px-4 py-2 font-medium">Layer</th>
									<th class="px-4 py-2 font-medium">Role</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-border">
								<tr v-for="layer in packagedLayers" :key="layer.name">
									<td class="px-4 py-3 font-mono text-[12.5px] text-foreground">{{ layer.name }}</td>
									<td class="px-4 py-3 text-muted-foreground">{{ layer.description }}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</DocSection>

			<DocSection eyebrow="Active fields" title="Backend data types and value lifecycles">
				<div class="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
					<div class="space-y-4 text-sm leading-6 text-muted-foreground">
						<p>
							Longer term, a field can map to a backend data type such as string, text,
							integer, decimal, boolean, date, datetime, JSON, enum, relation, array,
							object, or file.
						</p>
						<p>
							The field definition should make the lifecycle explicit: accept user input,
							validate it, transform it to an application value, transform it to storage,
							and hydrate stored values back into display values.
						</p>
					</div>
					<CodeBlock lang="js" :code="activeFieldCode" />
				</div>
			</DocSection>

			<DocSection eyebrow="Server assembly" title="Server schemas can feed the same client contract">
				<div class="space-y-4 text-sm leading-6 text-muted-foreground">
					<p>
						Eventually, forms may be assembled on the server. The client should still render
						the same schema shape and post structured data back; server form classes can read
						submitted input, validate, transform to domain data, transform to storage, persist,
						and hydrate stored data back into display data.
					</p>
					<div class="flex flex-wrap gap-2">
						<span
							v-for="item in serverSchemaItems"
							:key="item"
							class="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground"
						>
							{{ item }}
						</span>
					</div>
				</div>
			</DocSection>

			<DocSection eyebrow="Conditional fields" title="Prefer form-level expressions over field coupling">
				<div class="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
					<div class="space-y-4 text-sm leading-6 text-muted-foreground">
						<p>
							Fields often need to react to other fields: a toggle reveals a subform, a
							country changes postcode validation, a payment method changes required fields,
							or a checkbox enables a preferences section.
						</p>
						<p>
							Avoid coupling fields directly to each other. Prefer serializable field
							expressions or form-level watchers that Studio, AI-generated schemas, and
							server-provided forms can all understand.
						</p>
					</div>
					<CodeBlock lang="js" :code="conditionalFieldCode" />
				</div>
			</DocSection>

			<DocSection eyebrow="Coverage" title="Current component coverage">
				<ul class="grid gap-3 text-sm leading-6 text-muted-foreground md:grid-cols-2">
					<li
						v-for="item in implementedCoverage"
						:key="item"
						class="flex gap-2 rounded-lg border border-border bg-background p-4"
					>
						<span class="mt-2 size-1.5 shrink-0 rounded-full bg-primary"></span>
						<span>{{ item }}</span>
					</li>
				</ul>
			</DocSection>

			<DocSection eyebrow="Open questions" title="Questions to resolve as the system grows">
				<ol class="space-y-3 text-sm leading-6 text-muted-foreground">
					<li v-for="(question, index) in openQuestions" :key="question" class="flex gap-3">
						<span class="font-mono text-[12.5px] text-foreground">{{ index + 1 }}.</span>
						<span>{{ question }}</span>
					</li>
				</ol>
			</DocSection>

			<DocSection eyebrow="Reference" title="Where to find details">
				<div class="grid gap-3 md:grid-cols-3">
					<RouterLink
						v-for="link in componentLinks"
						:key="link.to"
						:to="link.to"
						class="block rounded-lg border border-border bg-background p-4 transition hover:border-primary/40 hover:bg-secondary/40"
					>
						<div class="flex items-start justify-between gap-3">
							<h3 class="text-sm font-semibold text-foreground">{{ link.title }}</h3>
							<code class="rounded-md bg-secondary px-2 py-1 text-[11px] text-muted-foreground ring-1 ring-border">{{ link.tag }}</code>
						</div>
						<p class="mt-3 text-sm leading-6 text-muted-foreground">{{ link.body }}</p>
					</RouterLink>
				</div>
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
