<script setup>
import { ref } from 'vue';
import { ElTagCombobox } from '@elements/vue';

const recipients = ref(['ada@example.com']);
const contacts = [
	{ value: 'ada@example.com', label: 'Ada Lovelace', description: 'ada@example.com' },
	{ value: 'grace@example.com', label: 'Grace Hopper', description: 'grace@example.com' },
	{ value: 'katherine@example.com', label: 'Katherine Johnson', description: 'katherine@example.com' },
	{ value: 'margaret@example.com', label: 'Margaret Hamilton', description: 'margaret@example.com' },
];
</script>

<template>
	<div class="grid w-full gap-4">
		<ElTagCombobox
			v-model="recipients"
			:options="contacts"
			:allow-custom="true"
			label="To"
			description="Select a known contact or type a new email address and press Enter."
			placeholder="Add recipient"
		>
			<template #item="{ item, custom }">
				<div class="min-w-0">
					<span class="block truncate font-medium">{{ custom ? `Invite ${item.value}` : item.label }}</span>
					<span class="block truncate text-xs text-muted-foreground">{{ custom ? 'New address' : item.description }}</span>
				</div>
			</template>

			<template #tag="{ item, value, remove }">
				<span class="truncate">{{ item.description ? item.label : value }}</span>
				<button
					type="button"
					class="-mr-1 inline-flex size-4 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
					:aria-label="`Remove ${value}`"
					@click.stop="remove"
					@mousedown.prevent
				>
					<svg viewBox="0 0 16 16" class="size-3" fill="none" aria-hidden="true">
						<path d="M5 5l6 6M11 5l-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
					</svg>
				</button>
			</template>
		</ElTagCombobox>

		<div class="rounded-2xl border border-border bg-secondary/40 p-4 text-sm">
			<p class="font-medium text-foreground">Recipients</p>
			<p class="mt-1 break-all font-mono text-xs text-muted-foreground">{{ recipients.join(', ') || 'None' }}</p>
		</div>
	</div>
</template>
