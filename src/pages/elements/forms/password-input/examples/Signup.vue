<script setup>
import { ref } from 'vue';
import { ElPasswordInput } from '../../../lib/vue';

const password = ref('correct-horse');
</script>

<template>
	<div class="w-full max-w-sm">
		<ElPasswordInput
			v-model="password"
			label="Create password"
			description="Use at least 12 characters, with a mix of symbols and numbers."
			placeholder="Choose a password"
			:compromised="password === 'password123'"
		/>
	</div>
</template>
