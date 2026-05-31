<script setup>
import { useAttrs } from 'vue';

defineOptions({
	inheritAttrs: false,
});

defineProps({
	label: { type: String, default: '' },
	htmlFor: { type: String, default: '' },
	description: { type: String, default: '' },
	descriptionId: { type: String, default: '' },
	errorId: { type: String, default: '' },
	invalid: { type: Boolean, default: false },
	errors: { type: Array, default: () => [] },
	required: { type: Boolean, default: false },
	visible: { type: Boolean, default: true },
	fields: { type: Array, default: () => [] },
	fieldAttrs: { type: Object, default: () => ({}) },
});

const attrs = useAttrs();
</script>

<template>
	<div
		v-bind="attrs"
		class="grid gap-2 border-b border-dashed border-border/80 py-3 sm:grid-cols-[8rem_1fr] sm:items-start"
		:data-invalid="invalid ? '' : undefined"
	>
		<label
			v-if="label"
			:for="htmlFor || undefined"
			class="pt-2 text-xs font-semibold uppercase tracking-wider"
			:class="invalid ? 'text-destructive' : 'text-muted-foreground'"
		>
			{{ label }}
			<span v-if="required" aria-hidden="true">*</span>
		</label>
		<div class="min-w-0 space-y-1">
			<slot />
			<slot name="errors" :errors="errors" :error-id="errorId" :invalid="invalid" />
			<slot name="description" :description="description" :description-id="descriptionId" />
		</div>
	</div>
</template>
