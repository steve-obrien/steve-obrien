<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { fieldProps } from '../field/fieldProps.js';
import { useField } from '../field/useField.js';

defineOptions({
	__doc: {
		name: 'Checkbox',
		tag: '<ElCheckbox>',
		description: 'A single accessible checkbox with a visible label and keyboard support.',
		events: [{ name: 'update:modelValue', payload: '(checked: boolean)', description: 'Emitted when checked changes.' }],
	},
});

const props = defineProps({
	...fieldProps,
	modelValue: {
		type: Boolean,
		default: false,
		_edit: { description: 'Checked state.' },
	},
});
const emit = defineEmits(['update:modelValue', 'focus', 'blur']);
const root = ref(null);
const field = useField(props, emit, { idPrefix: 'el-checkbox' });
const labelId = computed(() => (props.label ? `${field.id.value}-label` : ''));

function onLabelClick(event) {
	if (field.disabled.value) return;
	if (event.target === root.value) return;
	root.value?.focus?.();
	root.value?.toggle?.();
}

onMounted(async () => {
	await import('../../lib/headless/checkbox.js');
	root.value?.addEventListener('el:change', (event) => field.onInput(Boolean(event.detail.checked)));
});

watch(field.value, (value) => {
	if (root.value && root.value.checked !== value) root.value.checked = value;
}, { immediate: true });
</script>

<template>
	<label v-if="field.visible.value" class="flex w-full cursor-pointer items-start gap-3" @click="onLabelClick">
			<element-checkbox
				ref="root"
				:id="field.id.value"
				:name="field.htmlName.value"
				:checked="Boolean(field.value.value) || null"
				:disabled="field.disabled.value || null"
				:aria-label="!labelId ? label || undefined : undefined"
				:aria-labelledby="labelId || undefined"
				:aria-describedby="field.describedBy.value || undefined"
				:aria-invalid="field.invalid.value || undefined"
				:aria-errormessage="field.errorId.value || undefined"
				:data-invalid="field.invalid.value ? '' : undefined"
				class="mt-0.5"
			@focus="field.onFocus"
			@blur="field.onBlur"
			/>
			<span v-if="chrome !== 'none'" class="grid gap-0.5">
				<span v-if="label" :id="labelId" class="text-sm font-medium text-foreground">{{ label }}</span>
				<span v-if="description" :id="field.descriptionId.value" class="text-xs text-muted-foreground">{{ description }}</span>
				<span v-if="field.errors.value.length" :id="field.errorId.value" class="text-xs text-destructive">{{ field.errors.value[0].message || field.errors.value[0] }}</span>
			</span>
	</label>
</template>
