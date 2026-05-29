<script setup>
import { computed, ref } from 'vue';
import { ElTagCombobox } from '@elements/vue';

const classes = ref(['bg-white', 'p-6', 'rounded-2xl', 'shadow-sm', 'text-zinc-900']);
const tailwindOptions = [
	{ value: 'bg-white', label: 'bg-white', group: 'Background' },
	{ value: 'bg-zinc-950', label: 'bg-zinc-950', group: 'Background' },
	{ value: 'bg-teal-500', label: 'bg-teal-500', group: 'Background' },
	{ value: 'text-xs', label: 'text-xs', group: 'Typography' },
	{ value: 'text-sm', label: 'text-sm', group: 'Typography' },
	{ value: 'text-lg', label: 'text-lg', group: 'Typography' },
	{ value: 'text-4xl', label: 'text-4xl', group: 'Typography' },
	{ value: 'text-zinc-900', label: 'text-zinc-900', group: 'Typography' },
	{ value: 'text-white', label: 'text-white', group: 'Typography' },
	{ value: 'font-medium', label: 'font-medium', group: 'Typography' },
	{ value: 'font-semibold', label: 'font-semibold', group: 'Typography' },
	{ value: 'tracking-tight', label: 'tracking-tight', group: 'Typography' },
	{ value: 'p-4', label: 'p-4', group: 'Spacing' },
	{ value: 'p-6', label: 'p-6', group: 'Spacing' },
	{ value: 'px-4', label: 'px-4', group: 'Spacing' },
	{ value: 'py-2', label: 'py-2', group: 'Spacing' },
	{ value: 'mt-6', label: 'mt-6', group: 'Spacing' },
	{ value: 'rounded-md', label: 'rounded-md', group: 'Borders' },
	{ value: 'rounded-2xl', label: 'rounded-2xl', group: 'Borders' },
	{ value: 'border', label: 'border', group: 'Borders' },
	{ value: 'border-zinc-200', label: 'border-zinc-200', group: 'Borders' },
	{ value: 'shadow-sm', label: 'shadow-sm', group: 'Effects' },
	{ value: 'shadow-xl', label: 'shadow-xl', group: 'Effects' },
	{ value: 'flex', label: 'flex', group: 'Layout' },
	{ value: 'grid', label: 'grid', group: 'Layout' },
	{ value: 'items-center', label: 'items-center', group: 'Layout' },
	{ value: 'justify-between', label: 'justify-between', group: 'Layout' },
];

const className = computed(() => classes.value.join(' '));
</script>

<template>
	<div class="grid w-full gap-4">
		<ElTagCombobox
			v-model="classes"
			:options="tailwindOptions"
			:allow-custom="true"
			label="Tailwind classes"
			description="Try typing text- or add a custom arbitrary value like w-[100px]."
			placeholder="Add a class"
		>
			<template #item="{ item, custom }">
				<div class="flex min-w-0 items-center justify-between gap-3">
					<span class="truncate font-mono text-xs">{{ custom ? item.value : item.label }}</span>
					<span class="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
						{{ custom ? 'custom' : item.group }}
					</span>
				</div>
			</template>
		</ElTagCombobox>

		<div class="grid gap-2 rounded-2xl border border-border bg-secondary/40 p-4">
			<div :class="className">
				<p class="text-sm font-medium">Preview block</p>
				<p class="mt-1 text-xs opacity-70">Selected classes are joined into one class string.</p>
			</div>
			<code class="block rounded-xl bg-background p-3 font-mono text-xs text-muted-foreground ring-1 ring-border">
				class="{{ className }}"
			</code>
		</div>
	</div>
</template>
