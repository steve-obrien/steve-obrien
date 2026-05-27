<script setup>
import { ref } from 'vue';
import { ElTreeView } from '../../../lib/vue';

const folderIcon = 'M4 6h6l2 2h8v10H4V6Z';
const vueIcon = 'M4 5h16l-8 14L4 5Z';
const jsIcon = 'M6 4h12v16H6V4Zm4 11c0 1.5 1 2 2 2s2-.5 2-2V9';
const cssIcon = 'M6 4h12l-1 14-5 2-5-2L6 4Zm3 4h6M9 12h6';

const selected = ref('src-pages-elements');
const files = ref([
	{
		id: 'src',
		label: 'src',
		icon: folderIcon,
		open: true,
		children: [
			{
				id: 'src-pages',
				label: 'pages',
				icon: folderIcon,
				open: true,
				children: [
					{ id: 'src-pages-elements', label: 'ElementsLayout.vue', icon: vueIcon },
					{ id: 'src-pages-routes', label: 'routes.js', icon: jsIcon },
				],
			},
			{ id: 'src-style', label: 'style.css', icon: cssIcon },
		],
	},
	{
		id: 'public',
		label: 'public',
		icon: folderIcon,
		children: [
			{ id: 'public-llms', label: 'llms.txt', icon: jsIcon },
		],
	},
]);
</script>

<template>
	<div class="w-full max-w-md">
		<ElTreeView
			v-model="selected"
			v-model:items="files"
			density="comfortable"
		/>
		<p class="mt-3 text-xs text-muted-foreground">Selected path: <code class="text-foreground">{{ selected }}</code></p>
	</div>
</template>
