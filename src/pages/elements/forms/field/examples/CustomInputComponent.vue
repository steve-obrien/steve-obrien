<script setup>
import { ref } from 'vue';
import { ElButton, ElFieldChrome, ElForm, fieldProps, useField } from '@elements/vue';

const SlugInput = {
	name: 'SlugInput',
	components: { ElFieldChrome },
	props: {
		...fieldProps,
		modelValue: {
			type: String,
			default: '',
		},
		prefix: {
			type: String,
			default: '/posts/',
		},
	},
	emits: ['update:modelValue', 'focus', 'blur'],
	setup(props, { emit }) {
		const field = useField(props, emit, { idPrefix: 'slug-input' });

		function update(value) {
			field.onInput(
				value
					.toLowerCase()
					.trim()
					.replace(/[^a-z0-9]+/g, '-')
					.replace(/^-|-$/g, ''),
			);
		}

		return { field, props, update };
	},
	template: `
		<ElFieldChrome :field-attrs="field.fieldAttrs.value" :chrome="props.chrome">
			<div class="flex overflow-hidden rounded-xl border border-input bg-background text-sm shadow-sm transition focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 data-[invalid]:border-destructive" :data-invalid="field.invalid.value ? '' : undefined">
				<span class="flex items-center border-r border-border bg-secondary px-3 font-mono text-muted-foreground">{{ props.prefix }}</span>
				<input
					v-bind="field.inputAttrs.value"
					class="min-w-0 flex-1 bg-transparent px-3 py-2 text-foreground outline-none placeholder:text-muted-foreground"
					@input="update($event.target.value)"
					@focus="field.onFocus"
					@blur="field.onBlur"
				/>
			</div>
		</ElFieldChrome>
	`,
};

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
