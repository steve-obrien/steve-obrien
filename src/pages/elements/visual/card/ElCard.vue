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
	topLight: {
		type: Number,
		default: 14,
		_edit: {
			component: 'ElRangeInput',
			description: 'Strength of the glass light catching the top edge.',
			props: { min: 0, max: 40, step: 1, suffix: '%' },
		},
	},
	bottomShade: {
		type: Number,
		default: 4,
		_edit: {
			component: 'ElRangeInput',
			description: 'Strength of the subtle shade at the bottom of the card.',
			props: { min: 0, max: 24, step: 1, suffix: '%' },
		},
	},
	shadow: {
		type: Number,
		default: 4,
		_edit: {
			component: 'ElRangeInput',
			description: 'Outer elevation shadow strength.',
			props: { min: 0, max: 24, step: 1, suffix: '%' },
		},
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

const clamped = (value, min, max) => Math.min(Math.max(Number(value) || 0, min), max);

const classes = computed(() => [
	'relative w-full overflow-hidden rounded-2xl border border-border bg-card text-card-foreground',
	props.glass && 'backdrop-blur-xl',
	props.interactive && 'transition duration-200 hover:-translate-y-0.5 hover:border-primary/30',
	paddingClasses[props.padding] ?? paddingClasses.md,
]);

const cardStyle = computed(() => {
	const topLight = clamped(props.topLight, 0, 40);
	const bottomShade = clamped(props.bottomShade, 0, 24);
	const shadow = clamped(props.shadow, 0, 24);
	const styles = {
		boxShadow: shadow
			? `0 18px 44px rgb(2 6 23 / ${shadow / 100}), 0 1px 2px rgb(2 6 23 / ${Math.min(shadow / 140, 0.12)})`
			: 'none',
	};

	if (props.glass) {
		styles.backgroundImage = [
			`linear-gradient(to bottom, color-mix(in oklch, white ${topLight}%, transparent), transparent 42%, color-mix(in oklch, black ${bottomShade}%, transparent))`,
			`linear-gradient(to bottom, color-mix(in oklch, white ${Math.min(topLight * 2, 80)}%, transparent), transparent 1px)`,
		].join(', ');
	}

	return styles;
});
</script>

<template>
	<component :is="as" :class="classes" :style="cardStyle">
		<slot />
	</component>
</template>
