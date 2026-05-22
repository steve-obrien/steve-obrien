<script setup>
import { ElCombobox } from '@elements/vue';
import { ref } from 'vue';
const value = ref('');
const options = [
	{ value: 'apple', label: 'Apple' },
	{ value: 'banana', label: 'Banana' },
];
</script>

<template>
	<ElCombobox v-model="value" :options="options" placeholder="Pick a fruit" />
</template>