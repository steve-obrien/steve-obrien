<script setup>
import { ref } from 'vue';
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import Demo from '../../_layout/Demo.vue';
import PropsTable from '../../_layout/PropsTable.vue';
import { ElTextareaInput } from '../../lib/vue';

const bio = ref('Engineer, builder, founder.');

const usage = `<script setup>
import { ElTextareaInput } from '@elements/vue';
import { ref } from 'vue';
const bio = ref('');
<\/script>

<template>
  <ElTextareaInput
    v-model="bio"
    label="Bio"
    description="A short paragraph that appears under your name."
    :rows="4"
  />
</template>`;

const props = [
	{ name: 'v-model', type: 'string', default: "''", description: 'Bound text value.' },
	{ name: 'label', type: 'string', default: '—', description: 'Label above the textarea.' },
	{ name: 'description', type: 'string', default: '—', description: 'Hint shown below the textarea.' },
	{ name: 'rows', type: 'number', default: '3', description: 'Number of visible rows.' },
	{ name: 'placeholder', type: 'string', default: '—', description: 'Placeholder text.' },
	{ name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the textarea.' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Textarea"
			tagline="Multi-line text input with the same label/description chrome as the rest of the form components."
			tag="<ElTextareaInput>"
		>
			<DocSection eyebrow="Demo" title="Live preview">
				<Demo>
					<div class="w-full max-w-sm">
						<ElTextareaInput
							v-model="bio"
							label="Bio"
							description="A short paragraph that appears under your name."
							:rows="4"
						/>
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
