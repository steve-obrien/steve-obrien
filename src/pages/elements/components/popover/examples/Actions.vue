<script setup>
import { ref } from 'vue';
import { ElMenu, ElPopover } from '@elements/vue';

const popover = ref(null);
const menu = ref(null);
const lastAction = ref('');

const actions = [
	{ label: 'Rename', value: 'rename' },
	{ label: 'Duplicate', value: 'duplicate' },
	{ label: 'Move to...', value: 'move' },
	{ separator: true },
	{ label: 'Delete', value: 'delete', tone: 'danger' },
];

function focusMenu() {
	requestAnimationFrame(() => {
		menu.value?.querySelector('[role="menuitem"]')?.focus();
	});
}

function selectAction({ item }) {
	lastAction.value = item?.label || '';
	popover.value?.close();
}
</script>

<template>
	<div class="space-y-3">
		<ElPopover ref="popover" label="Actions" position="bottom-end" width="min-w-[12rem]" padding="p-1" @open="focusMenu">
			<div ref="menu">
				<ElMenu :items="actions" :surface="false" @select="selectAction" />
			</div>
		</ElPopover>

		<p v-if="lastAction" class="text-sm text-muted-foreground">Selected {{ lastAction }}.</p>
	</div>
</template>
