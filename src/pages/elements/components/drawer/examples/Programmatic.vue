<script setup>
import { ref } from 'vue';
import { ElDrawer, ElButton } from '@elements/vue';

const drawerRef = ref(null);
</script>

<template>
	<div class="flex flex-wrap items-center justify-center gap-2">
		<ElButton @click="drawerRef?.open()">Open</ElButton>
		<ElButton variant="secondary" @click="drawerRef?.close()">Close</ElButton>
		<ElButton variant="ghost" @click="drawerRef?.toggle()">Toggle</ElButton>
	</div>
	<ElDrawer ref="drawerRef" title="Via template ref">
		<p class="p-4 text-sm text-skin-secondary">
			Call <code class="text-skin-primary">open()</code>, <code class="text-skin-primary">close()</code>, or
			<code class="text-skin-primary">toggle()</code> on the component ref — or bind <code class="text-skin-primary">v-model</code> from script.
		</p>
	</ElDrawer>
</template>
