<script setup>
import { computed } from 'vue';

defineOptions({
	__doc: {
		name: 'Button',
		tag: '<ElButton>',
		description: 'The atomic call to action — variants, sizes, loading state, and any underlying element.',
		slots: [
			{ name: '(default)', description: 'Button label and/or icons.' },
		],
	},
});

const props = defineProps({
	as: {
		type: String,
		default: 'button',
		_edit: { description: "The HTML element or component to render. Use 'router-link' or 'a' to render a link." },
	},
	variant: {
		type: String,
		default: 'primary',
		_edit: {
			options: ['primary', 'secondary', 'ghost', 'danger'],
			description: 'Visual style — pick the role this button plays in the layout.',
		},
	},
	size: {
		type: String,
		default: 'md',
		_edit: {
			options: ['sm', 'md', 'lg'],
			description: 'Three balanced sizes.',
		},
	},
	loading: {
		type: Boolean,
		default: false,
		_edit: { description: 'Show a spinner and block interaction.' },
	},
	disabled: {
		type: Boolean,
		default: false,
		_edit: { description: 'Disable the button — non-interactive, lowered opacity.' },
	},
});
const active = 'select-none active:data-disabled:bg-gray-50  active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)] active:border-t-gray-300 active:data-disabled:shadow-none active:data-disabled:border-t-gray-200 focus-visible:outline-2 focus-visible:outline-blue-800 focus-visible:-outline-offset-1 data-disabled:text-gray-500'
const variants = {
	primary: 'bg-skin-primary text-skin-inverse hover:opacity-90 ring-1 ring-skin-primary/10',
	secondary: 'bg-skin-surface text-skin-primary ring-1 ring-skin-border hover:bg-skin-border/40',
	ghost: 'text-skin-primary hover:bg-skin-surface',
	danger: 'bg-skin-surface ring-1 ring-skin-border hover:bg-skin-border/40 text-red-600',
};
const sizes = {
	sm: 'h-8 px-3 text-xs',
	md: 'h-10 px-4 text-sm',
	lg: 'h-12 px-6 text-base',
};

const classes = computed(() => [
	active,
	'inline-flex items-center cursor-pointer justify-center gap-2 rounded-full font-medium tracking-tight transition',
	'focus:outline-none focus-visible:ring-2 focus-visible:ring-skin-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-skin-background',
	variants[props.variant] || variants.primary,
	sizes[props.size] || sizes.md,
	(props.disabled || props.loading) && 'opacity-50 pointer-events-none',
]);
</script>

<template>
	<component :is="as" :class="classes" :disabled="disabled || loading">
		<svg v-if="loading" class="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
			<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.25" />
			<path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
		</svg>
		<slot />
	</component>
</template>
