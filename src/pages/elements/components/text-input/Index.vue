<script setup>
import { ref } from 'vue';
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import Demo from '../../_layout/Demo.vue';
import PropsTable from '../../_layout/PropsTable.vue';
import { ElTextInput } from '../../lib/vue';

const name = ref('Steve O\'Brien');

const usage = `<script setup>
import { ElTextInput } from '@elements/vue';
import { ref } from 'vue';
const name = ref('');
<\/script>

<template>
  <ElTextInput
    v-model="name"
    label="Display name"
    description="Shown publicly on your profile."
    placeholder="Steve O'Brien"
  />
</template>`;

const props = [
	{ name: 'v-model', type: 'string', default: "''", description: 'Bound text value.' },
	{ name: 'label', type: 'string', default: '—', description: 'Small label above the input.' },
	{ name: 'description', type: 'string', default: '—', description: 'Hint shown below the input.' },
	{ name: 'placeholder', type: 'string', default: '—', description: 'Input placeholder text.' },
	{ name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the input.' },
	{ name: 'required', type: 'boolean', default: 'false', description: 'Render a small required indicator next to the label.' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Text input"
			tagline="A labelled single-line text field, wrapped in ElField so the label and description are uniform across forms."
			tag="<ElTextInput>"
		>
			<DocSection eyebrow="Demo" title="Live preview">
				<Demo>
					<div class="w-full max-w-sm">
						<ElTextInput
							v-model="name"
							label="Display name"
							description="Shown publicly on your profile."
							placeholder="Steve O'Brien"
						/>
						<p class="mt-3 text-xs text-skin-muted">Value: <code class="text-skin-primary">{{ name }}</code></p>
					</div>
				</Demo>
			</DocSection>

			<DocSection eyebrow="Usage" title="Vue">
				<CodeBlock :code="usage" lang="vue" />
			</DocSection>

			<DocSection title="Props">
				<PropsTable :rows="props" />
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
