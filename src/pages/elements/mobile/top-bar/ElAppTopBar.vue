<script setup>
defineOptions({
	__doc: {
		name: 'App top bar',
		tag: '<ElAppTopBar>',
		description: 'A compact app navigation bar with optional leading and trailing actions.',
		slots: [
			{ name: 'leading', description: 'Leading icon button or back control.' },
			{ name: 'trailing', description: 'Trailing actions.' },
		],
		playground: {
			mobileSlot: 'top',
			initial: {
				title: 'Workspace',
				subtitle: 'Capacitor app',
			},
		},
	},
});

defineProps({
	title: {
		type: String,
		default: '',
		_edit: { description: 'Primary title shown in the app bar.' },
	},
	subtitle: {
		type: String,
		default: '',
		_edit: { description: 'Optional supporting text below the title.' },
	},
	border: {
		type: Boolean,
		default: true,
		_edit: { description: 'Show a bottom divider.' },
	},
	large: {
		type: Boolean,
		default: false,
		_edit: { description: 'Use larger title sizing and padding.' },
	},
});
</script>

<template>
	<header
		class="bg-card/95 px-4 backdrop-blur-xl"
		:class="[border && 'border-b border-border', large ? 'py-4' : 'py-3']"
	>
		<div class="flex min-h-11 items-center gap-3">
			<div v-if="$slots.leading" class="flex shrink-0 items-center">
				<slot name="leading" />
			</div>
			<div class="min-w-0 flex-1">
				<h1
					v-if="title"
					class="truncate font-semibold tracking-tight text-foreground"
					:class="large ? 'text-2xl' : 'text-base'"
				>{{ title }}</h1>
				<p v-if="subtitle" class="truncate text-xs text-muted-foreground">{{ subtitle }}</p>
			</div>
			<div v-if="$slots.trailing" class="flex shrink-0 items-center gap-1">
				<slot name="trailing" />
			</div>
		</div>
	</header>
</template>
