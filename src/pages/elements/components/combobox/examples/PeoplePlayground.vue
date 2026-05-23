<script setup>
import { reactive } from 'vue';
import { ElCombobox } from '@elements/vue';

const data = reactive({
	modelValue: 'ada',
	options: [
		{ value: 'ada', label: 'Ada Lovelace', role: 'Mathematician', avatar: 'https://unavatar.io/github/adafruit' },
		{ value: 'grace', label: 'Grace Hopper', role: 'Computer scientist', avatar: 'https://unavatar.io/github/ghopper' },
		{ value: 'katherine', label: 'Katherine Johnson', role: 'NASA mathematician', avatar: 'https://unavatar.io/github/nasa' },
	],
	placeholder: 'Assign a person',
	placement: 'bottom',
	floatingMode: 'viewport',
});

defineExpose({ data });
</script>

<template>
	<div class="flex w-full max-w-md flex-col gap-2">
		<ElCombobox
			v-model="data.modelValue"
			:options="data.options"
			:placeholder="data.placeholder"
			:placement="data.placement"
			:floating-mode="data.floatingMode"
			class="w-full"
		>
			<template #item="{ item }">
				<div class="flex min-w-0 items-center gap-3">
					<img :src="item.avatar" alt="" class="size-8 rounded-full bg-secondary object-cover" />
					<span class="min-w-0">
						<span class="block truncate font-medium">{{ item.label }}</span>
						<span class="block truncate text-xs text-muted-foreground">{{ item.role }}</span>
					</span>
				</div>
			</template>
		</ElCombobox>
		<p class="text-xs text-muted-foreground">Selected value: <code class="text-foreground">{{ data.modelValue || '—' }}</code></p>
	</div>
</template>
