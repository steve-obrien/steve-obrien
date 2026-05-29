<script setup>
import { computed } from 'vue';
import ElField from '../../../forms/field/ElField.vue';
import ElJsonInput from '../../../forms/json-input/ElJsonInput.vue';
import ElNumberInput from '../../../forms/number-input/ElNumberInput.vue';
import ElPositionInput from '../../../forms/position-input/ElPositionInput.vue';
import ElSelectInput from '../../../forms/select-input/ElSelectInput.vue';
import ElTextInput from '../../../forms/text-input/ElTextInput.vue';
import ElToggle from '../../../forms/toggle/ElToggle.vue';

defineOptions({
	__doc: {
		name: 'Prop definition input',
		tag: '<ElPropDefinitionInput>',
		description: 'An inspector editor that renders a nested props object from a Vue-style prop definition map.',
		hidden: true,
	},
});

const props = defineProps({
	label: {
		type: String,
		default: '',
	},
	description: {
		type: String,
		default: '',
	},
	modelValue: {
		type: Object,
		default: () => ({}),
		_edit: { component: 'ElJsonInput', description: 'Current nested props object.' },
	},
	definitions: {
		type: Object,
		required: true,
		_edit: { component: 'ElJsonInput', description: 'Vue prop definition map used to render fields.' },
	},
	include: {
		type: Array,
		default: () => [],
		_edit: { component: 'ElJsonInput', description: 'Optional prop keys to include.' },
	},
	exclude: {
		type: Array,
		default: () => [],
		_edit: { component: 'ElJsonInput', description: 'Prop keys to hide.' },
	},
	compact: {
		type: Boolean,
		default: true,
		_edit: { description: 'Reduce spacing for inspectors and narrow panels.' },
	},
});

const emit = defineEmits(['update:modelValue']);

const editors = {
	ElJsonInput,
	ElNumberInput,
	ElPositionInput,
	ElSelectInput,
	ElTextInput,
	ElToggle,
	ElBooleanInput: ElToggle,
};

const fields = computed(() => {
	const include = new Set(props.include || []);
	const exclude = new Set(props.exclude || []);
	return Object.entries(props.definitions || {})
		.filter(([key]) => (!include.size || include.has(key)) && !exclude.has(key) && !key.startsWith('_'))
		.map(([key, definition]) => fieldFromDefinition(key, definition));
});

function fieldFromDefinition(key, definition) {
	const edit = definition?._edit || {};
	const editorName = edit.component || editorForDefinition(definition);
	const editorProps = {
		...(edit.props || {}),
	};
	for (const [editKey, editValue] of Object.entries(edit)) {
		if (['component', 'props', 'label', 'description', 'group'].includes(editKey)) continue;
		if (!(editKey in editorProps)) editorProps[editKey] = editValue;
	}
	return {
		key,
		label: edit.label || prettify(key),
		description: edit.description,
		editor: editors[editorName] || ElTextInput,
		editorProps,
		defaultValue: defaultPropValue(definition),
	};
}

function editorForDefinition(definition) {
	if (definition?._edit?.options || definition?._edit?.enum) return 'ElSelectInput';
	const type = definition?.type ?? definition;
	const types = Array.isArray(type) ? type : [type];
	if (types.includes(Boolean)) return 'ElToggle';
	if (types.includes(Number)) return 'ElNumberInput';
	if (types.includes(Array) || types.includes(Object) || types.includes(Function)) return 'ElJsonInput';
	return 'ElTextInput';
}

function defaultPropValue(definition) {
	if (!definition || !Object.prototype.hasOwnProperty.call(definition, 'default')) {
		return definition?.type === Boolean ? false : undefined;
	}
	if (typeof definition.default === 'function' && definition.type !== Function) return definition.default();
	return definition.default;
}

function valueFor(field) {
	return Object.prototype.hasOwnProperty.call(props.modelValue || {}, field.key)
		? props.modelValue[field.key]
		: field.defaultValue;
}

function updateField(field, value) {
	emit('update:modelValue', {
		...(props.modelValue || {}),
		[field.key]: value,
	});
}

function prettify(value) {
	return value
		.replace(/([A-Z])/g, ' $1')
		.replace(/^./, (character) => character.toUpperCase());
}
</script>

<template>
	<ElField :label="label" :description="description">
		<div class="space-y-2 rounded-xl border border-border bg-secondary/35 p-2">
			<div
				v-for="field in fields"
				:key="field.key"
				:class="compact ? 'space-y-1' : 'space-y-2'"
			>
				<component
					:is="field.editor"
					:model-value="valueFor(field)"
					:label="field.label"
					:description="compact ? '' : field.description"
					chrome="field"
					v-bind="field.editorProps"
					@update:model-value="(value) => updateField(field, value)"
				/>
			</div>
		</div>
	</ElField>
</template>
