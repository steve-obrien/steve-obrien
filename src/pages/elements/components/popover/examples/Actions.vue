<script setup>
import { ElPopover } from '@elements/vue';
</script>

<template>
	<ElPopover label="Actions ▾" align="right">
		<div class="flex flex-col gap-1">
			<button class="rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:bg-secondary">Rename</button>
			<button class="rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:bg-secondary">Duplicate</button>
			<button class="rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:bg-secondary">Move to…</button>
			<hr class="my-1 border-t border-border" />
			<button class="rounded-md px-2 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10">Delete</button>
		</div>
	</ElPopover>
</template>
