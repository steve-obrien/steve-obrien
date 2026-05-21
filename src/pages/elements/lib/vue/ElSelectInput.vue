<script setup>
import ElField from './ElField.vue';

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
			<button
				v-for="opt in options"
				:key="valueOf(opt)"
				type="button"
				:disabled="disabled"
				class="rounded-full px-2.5 py-1 text-xs font-medium ring-1 transition disabled:opacity-50"
				:class="modelValue === valueOf(opt)
					? 'bg-skin-primary text-skin-inverse ring-skin-primary'
					: 'bg-skin-background text-skin-secondary ring-skin-border hover:bg-skin-surface'"
				@click="emit('update:modelValue', valueOf(opt))"
			>{{ labelOf(opt) }}</button>
		</div>
	</ElField>
</template>
