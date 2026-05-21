<script setup>
import { ref } from 'vue';
import { ElDrawer, ElButton } from '@elements/vue';

const open = ref(false);
</script>

<template>
	<ElButton @click="open = true">Open menu</ElButton>
	<ElDrawer v-model="open" title="Navigation">
		<nav class="flex flex-col">
			<a
				href="#"
				class="border-b border-skin-border px-4 py-4 text-sm font-medium text-skin-primary hover:bg-skin-surface/60"
				@click.prevent="open = false"
			>Home</a>
			<a
				href="#"
				class="border-b border-skin-border px-4 py-4 text-sm font-medium text-skin-secondary hover:bg-skin-surface/60 hover:text-skin-primary"
				@click.prevent="open = false"
			>Projects</a>
			<a
				href="#"
				class="border-b border-skin-border px-4 py-4 text-sm font-medium text-skin-secondary hover:bg-skin-surface/60 hover:text-skin-primary"
				@click.prevent="open = false"
			>Settings</a>
		</nav>
	</ElDrawer>
</template>
