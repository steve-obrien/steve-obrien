<script setup>
import { computed, ref } from 'vue';
import ElForm from '../form/ElForm.vue';
import ElField from '../field/ElField.vue';
import ElJsonInput from '../json-input/ElJsonInput.vue';
import { fieldProps } from '../field/fieldProps.js';
import { inferFormNodeFromValue, normalizeFormNode } from '../form/formDefinition.js';
import { useField } from '../field/useField.js';

defineOptions({
	__doc: {
		name: 'JSON list input',
		tag: '<ElJsonListInput>',
		description: 'A schema-aware editor for arrays of objects. Edit rows through form controls, or toggle to raw JSON for bulk changes.',
		events: [
			{ name: 'update:modelValue', payload: 'Array<object>', description: 'Fired when rows are added, removed, reordered, edited, or replaced from valid raw JSON.' },
		],
	},
});

const props = defineProps({
	...fieldProps,
	modelValue: {
		type: Array,
		default: () => [],
		_edit: { component: 'ElJsonListInput', props: { compact: true } },
	},
	addLabel: {
		type: String,
		default: '+ Add row',
		_edit: { description: 'Button label for adding a row.' },
	},
	schema: {
		type: [Array, Object],
		default: null,
		_edit: {
			component: 'ElJsonInput',
			props: {
				label: 'Schema',
				description: 'Standardized form definition used by the visual editor. Legacy flat row schema arrays are still supported.',
				rows: 8,
			},
		},
	},
	jsonToggle: {
		type: Boolean,
		default: true,
		_edit: { description: 'Show the visual/raw JSON mode switch.' },
	},
	compact: {
		type: Boolean,
		default: false,
		_edit: { description: 'Reduce vertical spacing for inspectors and narrow tool panels.' },
	},
});
const emit = defineEmits(['update:modelValue', 'focus', 'blur']);
const field = useField(props, emit, { idPrefix: 'el-json-list-input' });
const mode = ref('fields');
const rawError = ref('');

const rows = computed(() => (Array.isArray(field.value.value) ? field.value.value : []));
const normalizedSchema = computed(() => (
	props.schema && !Array.isArray(props.schema) ? normalizeFormNode(props.schema) : null
));
const formItemSchema = computed(() => {
	if (!normalizedSchema.value) return null;
	if (normalizedSchema.value.type === 'array') return normalizedSchema.value.items || { type: 'json' };
	return normalizedSchema.value;
});
const fields = computed(() => {
	if (Array.isArray(props.schema) && props.schema.length) return props.schema;
	const keys = [...new Set(rows.value.flatMap((row) => (isObject(row) ? Object.keys(row) : [])))];
	return keys.map((key) => ({
		key,
		label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
		type: key.includes('url') || key.includes('avatar') || key.includes('image') ? 'url' : 'text',
	}));
});
const inferredArraySchema = computed(() => inferFormNodeFromValue(rows.value));
const visualItemSchema = computed(() => (
	formItemSchema.value
	|| (Array.isArray(props.schema) && props.schema.length ? legacyFieldsToFormNode(fields.value) : null)
	|| inferredArraySchema.value?.items
	|| legacyFieldsToFormNode(fields.value)
));

function isObject(value) {
	return value && typeof value === 'object' && !Array.isArray(value);
}

function update(next) {
	rawError.value = '';
	field.onInput(next);
}

function setRawJson(value) {
	if (!Array.isArray(value)) {
		rawError.value = 'JSON list input expects an array of objects.';
		return;
	}

	rawError.value = '';
	update(value);
}

function legacyFieldsToFormNode(nextFields) {
	return {
		type: 'ElForm',
		properties: Object.fromEntries((nextFields || [])
			.filter((field) => field?.key)
			.map((field) => [field.key, legacyFieldToFormNode(field)])),
	};
}

function legacyFieldToFormNode(field) {
	const {
		key,
		type = 'string',
		label,
		description,
		placeholder,
		required,
		default: defaultValue,
		options,
		component,
		valueType,
	} = field;
	return {
		type,
		...(component ? { component } : {}),
		...(label ? { label } : {}),
		...(description ? { description } : {}),
		...(placeholder ? { placeholder } : {}),
		...(required ? { required } : {}),
		...(defaultValue !== undefined ? { default: defaultValue } : {}),
		...(options ? { options } : {}),
		...(valueType ? { valueType } : {}),
	};
}
</script>

<template>
	<ElField v-bind="field.fieldAttrs.value" :chrome="chrome">
		<input
			v-if="field.htmlName.value"
			type="hidden"
			:name="field.htmlName.value"
			:value="JSON.stringify(rows)"
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

			<div v-if="mode === 'json'">
				<ElJsonInput
					:model-value="rows"
					:rows="compact ? 7 : 12"
					:editor="true"
					:chrome="'none'"
					:_register-field="false"
					@update:model-value="setRawJson"
					@focus="field.onFocus"
					@blur="field.onBlur"
				/>
				<p v-if="rawError" class="mt-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-mono text-destructive">
					{{ rawError }}
				</p>
			</div>

			<template v-else>
				<ElForm
					:model-value="rows"
					type="array"
					:items="visualItemSchema"
					:add-label="addLabel"
					:compact="compact"
					tag="div"
					isolated
					@update:model-value="update"
					@focus="field.onFocus"
					@blur="field.onBlur"
				/>
			</template>
		</div>
	</ElField>
</template>
