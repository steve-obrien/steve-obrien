<script setup>
defineProps({
	status: {
		type: String,
		required: true,
	},
})
</script>

<template>
	<span class="status-pill" :class="`status-${status}`">{{ status }}</span>
</template>
