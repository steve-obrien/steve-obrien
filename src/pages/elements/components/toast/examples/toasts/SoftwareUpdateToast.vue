<script setup>
import { ElButton, ElDropdown } from '@elements/vue';

const props = defineProps({
	version: {
		type: String,
		required: true,
	},
	size: {
		type: String,
		default: '',
	},
});
const emit = defineEmits(['action', 'dismiss']);

const laterItems = [
	{ label: 'Try in an hour', value: 'hour' },
	{ label: 'Try tonight', value: 'tonight' },
	{ label: 'Remind me tomorrow', value: 'tomorrow' },
	{ separator: true },
	{ label: 'Turn on automatic updates', value: 'automatic-updates' },
];

function installNow() {
	emit('action', { action: 'install-now', version: props.version });
}

function remindLater(value) {
	emit('action', { action: 'remind-later', value });
}
</script>

<template>
	<div class="grid gap-3">
		<div class="flex items-start gap-3">
			<div class="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-skin text-sm font-semibold text-primary">OS</div>
			<div class="min-w-0 flex-1">
				<p class="text-sm font-semibold text-foreground">Install {{ version }}</p>
				<p class="mt-1 text-sm text-secondary">
					<span v-if="size">A {{ size }} update is ready.</span>
					<span v-else>An update is ready.</span>
					Restart may be required.
				</p>
			</div>
			<button
				type="button"
				aria-label="Dismiss update"
				class="-mr-1 -mt-1 rounded-full px-2 text-lg leading-none text-muted transition hover:bg-secondary-skin hover:text-foreground"
				@click="emit('dismiss')"
			>×</button>
		</div>
		<div class="flex flex-wrap gap-2 pl-[3.25rem]">
			<ElButton size="sm" @click="installNow">Install now</ElButton>
			<ElDropdown
				:items="laterItems"
				label="Later"
				align="right"
				width="min-w-[15rem]"
				@select="remindLater"
			/>
		</div>
	</div>
</template>
