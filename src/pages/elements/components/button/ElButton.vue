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
const active = 'select-none active:data-disabled:bg-secondary active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]  active:border-t-border active:data-disabled:shadow-none active:data-disabled:border-t-border focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-1 data-disabled:text-muted-foreground';
const variants = {
	primary: 'bg-primary text-primary-foreground hover:opacity-90 ring-1 ring-border hover:bg-[linear-gradient(rgb(0_0_0/3%)_0_0)]  active:bg-[linear-gradient(rgb(0_0_0/6%)_0_0)] active:scale-[0.97]',
	secondary: 'bg-secondary text-secondary-foreground ring-1 ring-border hover:bg-accent hover:text-accent-foreground hover:bg-[linear-gradient(rgb(0_0_0/3%)_0_0)]  active:bg-[linear-gradient(rgb(0_0_0/6%)_0_0)] active:scale-[0.97]',
	ghost: 'text-foreground hover:bg-secondary hover:text-secondary-foreground hover:bg-[linear-gradient(rgb(0_0_0/3%)_0_0)]  active:bg-[linear-gradient(rgb(0_0_0/6%)_0_0)] active:scale-[0.97]',
	danger: 'bg-secondary ring-1 ring-border hover:bg-accent text-destructive hover:bg-[linear-gradient(rgb(255_0_0/3%)_0_0)]  active:bg-[linear-gradient(rgb(255_0_0/6%)_0_0)] active:scale-[0.97]',
};
const sizes = {
	sm: 'h-8 px-3 text-xs',
	md: 'h-10 px-4 text-sm',
	lg: 'h-12 px-6 text-base',
};

const classes = computed(() => [
	active,
	'inline-flex items-center cursor-pointer justify-center gap-2 rounded-full font-medium tracking-tight transition',
	'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
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
