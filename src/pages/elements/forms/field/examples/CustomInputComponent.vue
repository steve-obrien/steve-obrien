<script setup>
import { ref } from 'vue';
import { ElButton, ElForm } from '@elements/vue';
import SlugInput from './SlugInput.vue';

const article = ref({
	slug: 'launch-notes',
});
</script>

<template>
	<ElForm v-model="article" name="article" class="w-full max-w-md space-y-4">
		<SlugInput
			name="slug"
			label="Article slug"
			description="The field writes to article.slug and still gets IDs, errors, and validation from the form."
			placeholder="launch-notes"
			required
		/>
		<div class="flex items-center gap-2">
			<ElButton type="submit">Save article</ElButton>
			<code class="text-xs text-muted-foreground">{{ article.slug }}</code>
		</div>
	</ElForm>
</template>
