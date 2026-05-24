<script setup>
import ElField from './ElField.vue';
import ElButton from './ElButton.vue';

const props = defineProps({
	modelValue: { default: null },
	options: { type: Array, default: () => [] },
	label: String,
	description: String,
	disabled: Boolean,
	required: Boolean,
});
const emit = defineEmits(['update:modelValue']);

// Options can be string[] or { label, value }[].
const labelOf = (o) => (o && typeof o === 'object' ? (o.label ?? o.value) : o);
const valueOf = (o) => (o && typeof o === 'object' ? (o.value ?? o.label) : o);
</script>

<template>
	<ElField :label="label" :description="description" :required="required">
		<div class="flex flex-wrap gap-1">
			<ElButton
				v-for="opt in options"
				:key="valueOf(opt)"
				type="button"
				size="sm"
				:variant="modelValue === valueOf(opt) ? 'primary' : 'secondary'"
				:disabled="disabled"
				:aria-pressed="modelValue === valueOf(opt)"
				@click="emit('update:modelValue', valueOf(opt))"
			>{{ labelOf(opt) }}</ElButton>
		</div>
	</ElField>
</template>
