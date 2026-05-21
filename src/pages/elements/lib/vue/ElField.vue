<script setup>
// Field chrome shared by every form input: a small upper label, the control,
// and a description below. All form components in the library wrap their
// control in <ElField> so they pick up consistent labelling out of the box.
//
// <ElField label="Email" description="We'll never share it.">
//   <input … />
// </ElField>
defineProps({
	label: String,
	description: String,
	htmlFor: String,
	required: Boolean,
});
</script>

<template>
	<div class="space-y-1.5">
		<label
			v-if="label"
			:for="htmlFor"
			class="block text-[11px] font-medium uppercase tracking-wider text-skin-muted"
		>
			{{ label }}
			<span v-if="required" class="text-red-500">*</span>
		</label>
		<slot />
		<p v-if="description" class="text-[11px] leading-snug text-skin-muted">{{ description }}</p>
	</div>
</template>
