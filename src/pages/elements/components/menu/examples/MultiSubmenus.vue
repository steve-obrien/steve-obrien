<script setup>
import { ref } from 'vue';
import { ElMenu } from '@elements/vue';

const selected = ref('none');
const items = [
	{ label: 'Open', value: 'open' },
	{
		label: 'Insert',
		value: 'insert',
		children: [
			{ label: 'Text block', value: 'insert-text' },
			{ label: 'Image', value: 'insert-image' },
			{
				label: 'Chart',
				value: 'insert-chart',
				children: [
					{ label: 'Bar chart', value: 'insert-chart-bar' },
					{ label: 'Line chart', value: 'insert-chart-line' },
					{ label: 'Donut chart', value: 'insert-chart-donut' },
				],
			},
		],
	},
	{
		label: 'Share',
		value: 'share',
		children: [
			{ label: 'Copy link', value: 'share-link' },
			{ label: 'Invite people', value: 'share-invite' },
			{ label: 'Publish snapshot', value: 'share-publish' },
		],
	},
	{
		label: 'Transform',
		value: 'transform',
		children: [
			{ label: 'Make uppercase', value: 'transform-uppercase' },
			{ label: 'Sort ascending', value: 'transform-sort-asc' },
			{ label: 'Sort descending', value: 'transform-sort-desc' },
		],
	},
	{
		label: 'Export',
		value: 'export',
		children: [
			{ label: 'PDF', value: 'export-pdf' },
			{ label: 'CSV', value: 'export-csv' },
			{ label: 'JSON', value: 'export-json' },
		],
	},
];
</script>

<template>
	<div class="grid w-full max-w-sm gap-3">
		<ElMenu :items="items" @select="selected = $event.value" />
		<p class="text-xs text-muted-foreground">Selected: <code class="text-foreground">{{ selected }}</code></p>
	</div>
</template>
