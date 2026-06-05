<script setup>
const edgeClasses = {
	top: 'pt-[env(safe-area-inset-top,0px)]',
	bottom: 'pb-[env(safe-area-inset-bottom,0px)]',
	left: 'pl-[env(safe-area-inset-left,0px)]',
	right: 'pr-[env(safe-area-inset-right,0px)]',
};

defineOptions({
	__doc: {
		name: 'Safe area',
		tag: '<ElSafeArea>',
		description: 'Applies safe-area inset padding around app chrome for devices with cutouts, home indicators, or inset system UI.',
		slots: [
			{ name: '(default)', description: 'Content that should avoid device cutouts and home indicators.' },
		],
		playground: {
			mobileSlot: 'content',
		},
	},
});

defineProps({
	edges: {
		type: Array,
		default: () => ['top', 'bottom'],
		_edit: {
			component: 'ElJsonListInput',
			description: 'Safe-area edges to apply: top, bottom, left, right.',
		},
	},
});
</script>

<template>
	<div :class="edges.map((edge) => edgeClasses[edge]).filter(Boolean)">
		<slot />
	</div>
</template>
