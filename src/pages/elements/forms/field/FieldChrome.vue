<script setup>
import ElField from './ElField.vue';

defineProps({
	fieldAttrs: { type: Object, required: true },
	chrome: { type: String, default: 'field' },
});
</script>

<template>
	<template v-if="fieldAttrs.visible !== false">
		<slot v-if="chrome !== 'none'" name="chrome" :field-attrs="fieldAttrs">
			<ElField v-bind="fieldAttrs">
				<slot />
			</ElField>
		</slot>
		<slot v-else />
	</template>
</template>
