<script setup>
import { ElPopover } from '@elements/vue';
</script>

<template>
	<ElPopover label="Actions ▾" align="right">
		<div class="flex flex-col gap-1">
			<button class="rounded-md px-2 py-1.5 text-left text-sm text-skin-primary hover:bg-skin-surface">Rename</button>
			<button class="rounded-md px-2 py-1.5 text-left text-sm text-skin-primary hover:bg-skin-surface">Duplicate</button>
			<button class="rounded-md px-2 py-1.5 text-left text-sm text-skin-primary hover:bg-skin-surface">Move to…</button>
			<hr class="my-1 border-t border-skin-border" />
			<button class="rounded-md px-2 py-1.5 text-left text-sm text-red-500 hover:bg-red-500/10">Delete</button>
		</div>
	</ElPopover>
</template>
