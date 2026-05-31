<script setup>
import { ElField, fieldProps, useField } from '@elements/vue';

const props = defineProps({
	...fieldProps,
	modelValue: {
		type: String,
		default: '',
	},
	prefix: {
		type: String,
		default: '/posts/',
	},
});
const emit = defineEmits(['update:modelValue', 'focus', 'blur']);
const field = useField(props, emit, { idPrefix: 'slug-input' });

function update(value) {
	field.onInput(
		value
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, ''),
	);
}
</script>

<template>
	<ElField v-bind="field.fieldAttrs.value" :chrome="chrome">
		<div
			class="flex overflow-hidden rounded-xl border border-input bg-background text-sm shadow-sm transition focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 data-[invalid]:border-destructive"
			:data-invalid="field.invalid.value ? '' : undefined"
		>
			<span class="flex items-center border-r border-border bg-secondary px-3 font-mono text-muted-foreground">{{ prefix }}</span>
			<input
				v-bind="field.inputAttrs.value"
				class="min-w-0 flex-1 bg-transparent px-3 py-2 text-foreground outline-none placeholder:text-muted-foreground"
				@input="update($event.target.value)"
				@focus="field.onFocus"
				@blur="field.onBlur"
			/>
		</div>
	</ElField>
</template>
