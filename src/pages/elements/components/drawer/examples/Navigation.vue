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
				class="border-b border-border px-4 py-4 text-sm font-medium text-foreground hover:bg-secondary/60"
				@click.prevent="open = false"
			>Home</a>
			<a
				href="#"
				class="border-b border-border px-4 py-4 text-sm font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
				@click.prevent="open = false"
			>Projects</a>
			<a
				href="#"
				class="border-b border-border px-4 py-4 text-sm font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
				@click.prevent="open = false"
			>Settings</a>
		</nav>
	</ElDrawer>
</template>
