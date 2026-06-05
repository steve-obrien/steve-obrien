<script setup>
import { computed, ref, watch } from 'vue';
import ElCodeInput from '../code-input/ElCodeInput.vue';
import ElField from '../field/ElField.vue';
import ElForm from '../form/ElForm.vue';
import { fieldProps } from '../field/fieldProps.js';
import { inferFormNodeFromValue, normalizeFormNode } from '../form/formDefinition.js';
import { useField } from '../field/useField.js';

defineOptions({
	__doc: {
		name: 'JSON input',
		tag: '<ElJsonInput>',
		description: 'A JSON form input backed by ElCodeInput. Valid JSON emits parsed data; invalid JSON stays local and shows an error.',
		events: [
			{ name: 'update:modelValue', payload: 'object | array | string | number | boolean | null', description: 'Fired with parsed JSON when the editor contains valid JSON.' },
			{ name: 'valid', payload: 'parsed value', description: 'Fired when JSON parses successfully.' },
			{ name: 'invalid', payload: 'Error', description: 'Fired when JSON cannot be parsed.' },
		],
	},
});

const props = defineProps({
	...fieldProps,
	modelValue: {
		default: null,
		_edit: { component: 'ElJsonInput', description: 'Any JSON-serializable value.' },
	},
	rows: {
		type: Number,
		default: 10,
		_edit: { description: 'Textarea fallback rows.' },
	},
	editor: {
		type: Boolean,
		default: true,
		_edit: { description: 'Attempt to load the enhanced editor from the CDN.' },
	},
	schema: {
		type: [Object, Array],
		default: null,
		_edit: {
			component: 'ElJsonInput',
			description: 'Optional standardized form definition used to render a visual JSON editor.',
		},
	},
	jsonToggle: {
		type: Boolean,
		default: true,
		_edit: { description: 'Show the visual/raw JSON mode switch when schema is provided.' },
	},
	compact: {
		type: Boolean,
		default: false,
		_edit: { description: 'Reduce vertical spacing for schema-driven editors.' },
	},
	_registerField: {
		type: Boolean,
		default: true,
	},
});

const emit = defineEmits(['update:modelValue', 'valid', 'invalid', 'focus', 'blur']);
const field = useField(props, emit, { idPrefix: 'el-json-input', register: props._registerField });
const text = ref(format(field.value.value));
const error = ref('');
const focused = ref(false);
const mode = ref('fields');
const schemaNode = computed(() => (
	props.schema
		? normalizeJsonSchema(props.schema)
		: normalizeFormNode(inferFormNodeFromValue(field.value.value))
));
const hasSchema = computed(() => !!schemaNode.value);
const schemaFormType = computed(() => (schemaNode.value?.type === 'array' ? 'array' : 'object'));
const schemaChildren = computed(() => schemaNode.value?.children || []);
const schemaItems = computed(() => schemaNode.value?.items || null);
const schemaValue = computed(() => {
	if (schemaFormType.value === 'array') return Array.isArray(field.value.value) ? field.value.value : [];
	return field.value.value && typeof field.value.value === 'object' && !Array.isArray(field.value.value)
		? field.value.value
		: {};
});
const codeFieldAttrs = computed(() => ({
	...field.fieldAttrs.value,
	invalid: field.invalid.value || !!error.value,
	errors: error.value ? [error.value] : field.errors.value,
}));

function format(value) {
	return JSON.stringify(value ?? null, null, 2);
}

function normalizeJsonSchema(schema) {
	return Array.isArray(schema)
		? normalizeFormNode({ type: 'ElForm', children: schema })
		: normalizeFormNode(schema);
}

function onInput(value) {
	text.value = value;
	try {
		const parsed = JSON.parse(value);
		error.value = '';
		field.setFieldState({ errors: [], invalid: false });
		field.onInput(parsed);
		emit('valid', parsed);
	} catch (err) {
		error.value = err.message;
		field.setFieldState({ errors: [err.message], invalid: true });
		emit('invalid', err);
	}
}

function onFormInput(value) {
	error.value = '';
	field.setFieldState({ errors: [], invalid: false });
	field.onInput(value);
	emit('valid', value);
}

function onFocus(event) {
	focused.value = true;
	field.onFocus(event);
}

function onBlur(event) {
	focused.value = false;
	field.onBlur(event);
}

watch(field.value, (value) => {
	if (focused.value) return;
	const next = format(value);
	if (next !== text.value) text.value = next;
});
</script>

<template>
	<ElField v-if="hasSchema" v-bind="field.fieldAttrs.value" :chrome="chrome">
		<input
			v-if="field.htmlName.value && mode === 'fields'"
			type="hidden"
			:name="field.htmlName.value"
			:value="format(field.value.value)"
		/>
		<div :class="compact ? 'space-y-1.5' : 'space-y-2'">
			<div v-if="jsonToggle" class="flex justify-end">
				<div class="inline-flex rounded-lg border border-border bg-secondary/60 p-0.5">
					<button
						type="button"
						class="rounded-md px-2.5 py-1 text-xs font-medium transition"
						:class="mode === 'fields' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
						:aria-pressed="mode === 'fields'"
						@click="mode = 'fields'"
					>
						Fields
					</button>
					<button
						type="button"
						class="rounded-md px-2.5 py-1 text-xs font-medium transition"
						:class="mode === 'json' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
						:aria-pressed="mode === 'json'"
						@click="mode = 'json'"
					>
						JSON
					</button>
				</div>
			</div>
			<ElForm
				v-if="mode === 'fields'"
				:model-value="schemaValue"
				:type="schemaFormType"
				:children="schemaChildren"
				:items="schemaItems"
				:compact="compact"
				tag="div"
				isolated
				@update:model-value="onFormInput"
				@focus="field.onFocus"
				@blur="field.onBlur"
			/>
			<div v-else>
				<ElCodeInput
					:model-value="text"
					:id="field.id.value"
					:name="field.htmlName.value"
					:rows="rows"
					:editor="editor"
					:invalid="codeFieldAttrs.invalid"
					:errors="codeFieldAttrs.errors"
					:required="required"
					:disabled="field.disabled.value"
					:read-only="field.readOnly.value"
					chrome="none"
					:_register-field="false"
					lang="json"
					@update:model-value="onInput"
					@focus="onFocus"
					@blur="onBlur"
				/>
			</div>
		</div>
	</ElField>
	<div v-else>
		<ElCodeInput
			:model-value="text"
			:id="field.id.value"
			:name="field.htmlName.value"
			:label="codeFieldAttrs.label"
			:description="codeFieldAttrs.description"
			:rows="rows"
			:editor="editor"
			:invalid="codeFieldAttrs.invalid"
			:errors="codeFieldAttrs.errors"
			:required="required"
			:disabled="field.disabled.value"
			:read-only="field.readOnly.value"
			:chrome="chrome"
			:_register-field="false"
			lang="json"
			@update:model-value="onInput"
			@focus="onFocus"
			@blur="onBlur"
		/>
	</div>
</template>
