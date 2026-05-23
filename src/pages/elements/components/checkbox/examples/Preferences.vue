<script setup>
import { ref } from 'vue';
import { ElCheckbox } from '@elements/vue';

const product = ref(true);
const security = ref(false);
</script>

<template>
	<div class="grid w-full max-w-md gap-4">
		<ElCheckbox v-model="product" label="Product updates" description="Occasional release notes and feature announcements." />
		<ElCheckbox v-model="security" label="Security alerts" description="Important account and login notifications." />
	</div>
</template>
