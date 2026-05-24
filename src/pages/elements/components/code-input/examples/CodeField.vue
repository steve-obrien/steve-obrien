<script setup>
import { ref } from 'vue';
import { ElCodeInput } from '../../../lib/vue';

const code = ref(`{
\t"name": "Elements",
\t"editable": true,
\t"theme": "token-based"
}`);
</script>

<template>
	<div class="w-full max-w-2xl">
		<ElCodeInput
			v-model="code"
			label="Configuration"
			description="Loads an enhanced editor from a CDN when available; otherwise this remains a textarea."
			lang="json"
			:rows="8"
		/>
	</div>
</template>
