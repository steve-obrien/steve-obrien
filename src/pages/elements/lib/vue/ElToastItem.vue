<script setup>
const props = defineProps({
	title: {
		type: String,
		default: '',
	},
	description: {
		type: String,
		default: '',
	},
	tone: {
		type: String,
		default: 'default',
	},
	dismissible: {
		type: Boolean,
		default: true,
	},
});
const emit = defineEmits(['dismiss']);

const accentClass = (tone) => ({
	default: 'bg-primary-skin',
	success: 'bg-success-skin',
	danger: 'bg-destructive-skin',
	warning: 'bg-warning-skin',
}[tone] || 'bg-primary-skin');
</script>

<template>
	<div class="flex items-start gap-3">
		<span class="mt-1 size-2.5 shrink-0 rounded-full" :class="accentClass(tone)"></span>
		<div class="min-w-0 flex-1">
			<p v-if="title" class="text-sm font-semibold">{{ title }}</p>
			<p v-if="description" class="mt-1 text-sm text-secondary">{{ description }}</p>
		</div>
		<button
			v-if="props.dismissible"
			type="button"
			aria-label="Dismiss notification"
			class="-mr-1 -mt-1 rounded-full px-2 text-lg leading-none text-muted hover:bg-accent-skin hover:text-accent"
			@click="emit('dismiss')"
		>×</button>
	</div>
</template>
