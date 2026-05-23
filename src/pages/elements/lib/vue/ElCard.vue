<script setup>
import { computed } from 'vue';

defineOptions({
	__doc: {
		name: 'Card',
		tag: '<ElCard>',
		description: 'A visual-only surface for grouped content, with a subtle glass highlight.',
		slots: [
			{ name: '(default)', description: 'Card content.' },
		],
	},
});

const props = defineProps({
	as: {
		type: String,
		default: 'div',
		_edit: { description: "The HTML element or component to render. Use 'section', 'article', or a router-link when useful." },
	},
	padding: {
		type: String,
		default: 'md',
		_edit: {
			options: ['none', 'sm', 'md', 'lg'],
			description: 'Internal spacing. Use none when the card owns its own internal layout.',
		},
	},
	glass: {
		type: Boolean,
		default: true,
		_edit: { description: 'Add a soft top-light gradient and backdrop blur over the card token.' },
	},
	interactive: {
		type: Boolean,
		default: false,
		_edit: { description: 'Add a restrained hover lift for clickable cards.' },
	},
});

const paddingClasses = {
	none: '',
	sm: 'p-4',
	md: 'p-6',
	lg: 'p-8',
};

const classes = computed(() => [
	'relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xl shadow-black/4',
	'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/80 dark:before:bg-white/15',
	props.glass && 'bg-linear-to-b from-white/70 via-secondary to-secondary backdrop-blur-xl dark:from-white/8 dark:via-secondary dark:to-secondary',
	props.interactive && 'transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-2xl hover:shadow-black/10',
	paddingClasses[props.padding] ?? paddingClasses.md,
]);
</script>

<template>
	<component :is="as" :class="classes">
		<slot />
	</component>
</template>
