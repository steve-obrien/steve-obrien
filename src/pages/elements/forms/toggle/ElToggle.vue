<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { fieldProps } from '../field/fieldProps.js';
import { useField } from '../field/useField.js';

defineOptions({
	__doc: {
		name: 'Toggle',
		tag: '<ElToggle>',
		description: 'Accessible switch for boolean values. Works standalone with v-model or inside ElForm through useField.',
		events: [
			{ name: 'update:modelValue', payload: '(checked: boolean)', description: 'Emitted when checked changes.' },
			{ name: 'focus', payload: 'FocusEvent', description: 'Fired when the switch receives focus.' },
			{ name: 'blur', payload: 'FocusEvent', description: 'Fired when the switch loses focus.' },
		],
	},
});

const props = defineProps({
	...fieldProps,
	modelValue: {
		type: Boolean,
		default: false,
		_edit: { group: 'Control props', description: 'On / off state.' },
	},
});
const emit = defineEmits(['update:modelValue', 'focus', 'blur']);

const root = ref(null);
const field = useField(props, emit, { idPrefix: 'el-toggle' });
const labelId = computed(() => (props.label ? `${field.id.value}-label` : ''));

onMounted(async () => {
	await import('../../lib/headless/toggle.js');
	syncToggleFromValue();
	root.value?.addEventListener('el:change', (event) => field.onInput(Boolean(event.detail.checked)));
});
watch(field.value, syncToggleFromValue);

function syncToggleFromValue() {
	if (root.value && root.value.checked !== Boolean(field.value.value)) {
		root.value.checked = Boolean(field.value.value);
	}
}

function toggleFromLabel() {
	if (field.disabled.value || field.readOnly.value) return;
	root.value?.focus?.();
	root.value?.toggle?.();
}
</script>

<template>
	<div v-if="field.visible.value" class="inline-flex items-center gap-3">
		<input
			v-if="field.htmlName.value"
			type="hidden"
			:name="field.htmlName.value"
			:value="field.value.value ? 'true' : 'false'"
		/>
		<element-toggle
			ref="root"
			:id="field.id.value"
			:checked="Boolean(field.value.value) || null"
			:disabled="field.disabled.value || field.readOnly.value || null"
			:aria-label="!labelId ? label || undefined : undefined"
			:aria-labelledby="labelId || undefined"
			:aria-describedby="field.describedBy.value || undefined"
			:aria-invalid="field.invalid.value || undefined"
			:aria-errormessage="field.errorId.value || undefined"
			:data-invalid="field.invalid.value ? '' : undefined"
			@focus="field.onFocus"
			@blur="field.onBlur"
		/>
		<span
			v-if="chrome !== 'none' && (label || description || field.errors.value.length)"
			class="grid gap-0.5"
			:class="field.disabled.value ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'"
			@click="toggleFromLabel"
		>
			<span v-if="label" :id="labelId" class="text-sm text-foreground">{{ label }}</span>
			<span v-if="description" :id="field.descriptionId.value" class="text-xs text-muted-foreground">{{ description }}</span>
			<span v-if="field.errors.value.length" :id="field.errorId.value" class="text-xs text-destructive">{{ field.errors.value[0].message || field.errors.value[0] }}</span>
		</span>
	</div>
</template>
