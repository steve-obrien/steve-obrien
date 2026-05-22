<script setup>
import { ElCombobox } from '@elements/vue';
import { ref } from 'vue';

const value = ref('');
const people = [
	{ value: 'ada', label: 'Ada Lovelace', role: 'Mathematician', avatar: 'https://unavatar.io/github/adafruit' },
	{ value: 'grace', label: 'Grace Hopper', role: 'Computer scientist', avatar: 'https://unavatar.io/github/ghopper' },
	{ value: 'katherine', label: 'Katherine Johnson', role: 'NASA mathematician', avatar: 'https://unavatar.io/github/nasa' },
];
</script>

<template>
	<div class="flex w-full max-w-md flex-col gap-2">
		<ElCombobox v-model="value" :options="people" placeholder="Assign a person" class="w-full">
			<template #item="{ item }">
				<div class="flex items-center gap-3">
					<img :src="item.avatar" alt="" class="size-8 rounded-full bg-skin-surface object-cover" />
					<span class="min-w-0">
						<span class="block truncate font-medium">{{ item.label }}</span>
						<span class="block truncate text-xs text-skin-muted">{{ item.role }}</span>
					</span>
				</div>
			</template>
		</ElCombobox>
		<p class="text-xs text-skin-muted">Selected value: <code class="text-skin-primary">{{ value || '—' }}</code></p>
	</div>
</template>
