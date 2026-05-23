<script setup>
import { computed, ref } from 'vue';
import { ElDropdown } from '@elements/vue';

const items = [
	{ value: 'sara', name: 'Sara Patel', role: 'Design', initials: 'SP', color: 'bg-rose-500' },
	{ value: 'tomas', name: 'Tomás Ruiz', role: 'Engineering', initials: 'TR', color: 'bg-success-skin' },
	{ value: 'priya', name: 'Priya Nair', role: 'Product', initials: 'PN', color: 'bg-warning-skin' },
	{ value: 'leo', name: 'Leo Almeida', role: 'Operations', initials: 'LA', color: 'bg-sky-500' },
];
const assigned = ref('sara');
const current = computed(() => items.find((i) => i.value === assigned.value));
</script>

<template>
	<ElDropdown :items="items" width="min-w-[16rem]" @select="(v) => assigned = v">
		<template #trigger>
			<span class="flex items-center gap-2">
				<span
					class="grid size-6 place-items-center rounded-full text-[10px] font-semibold text-white"
					:class="current?.color"
				>{{ current?.initials }}</span>
				<span>{{ current?.name }}</span>
			</span>
		</template>

		<template #item="{ item }">
			<div class="flex items-center gap-3">
				<span
					class="grid size-7 place-items-center rounded-full text-xs font-semibold text-white"
					:class="item.color"
				>{{ item.initials }}</span>
				<div class="min-w-0">
					<p class="truncate text-sm font-medium text-foreground">{{ item.name }}</p>
					<p class="truncate text-xs text-muted">{{ item.role }}</p>
				</div>
			</div>
		</template>
	</ElDropdown>
</template>
