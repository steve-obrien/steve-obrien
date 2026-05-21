<script setup>
import { ref } from 'vue';
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import Demo from '../../_layout/Demo.vue';
import PropsTable from '../../_layout/PropsTable.vue';
import { ElSelectInput } from '../../lib/vue';

const size = ref('md');

const usage = `<script setup>
import { ElSelectInput } from '@elements/vue';
import { ref } from 'vue';
const size = ref('md');
<\/script>

<template>
  <ElSelectInput
    v-model="size"
    label="Size"
    description="Three balanced sizes."
    :options="['sm', 'md', 'lg']"
  />
</template>`;

const props = [
	{ name: 'v-model', type: 'any', default: '—', description: 'Selected value.' },
	{ name: 'options', type: "string[] | { label, value }[]", default: '[]', description: 'Options to render as pills.' },
	{ name: 'label', type: 'string', default: '—', description: 'Label above the pill group.' },
	{ name: 'description', type: 'string', default: '—', description: 'Hint shown below the group.' },
	{ name: 'disabled', type: 'boolean', default: 'false', description: 'Disable all options.' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Select input"
			tagline="A pill-style segmented selector. Compact, keyboard-friendly, ideal for short option lists."
			tag="<ElSelectInput>"
		>
			<DocSection eyebrow="Demo" title="Live preview">
				<Demo>
					<div class="w-full max-w-sm">
						<ElSelectInput
							v-model="size"
							label="Size"
							description="Three balanced sizes."
							:options="['sm', 'md', 'lg']"
						/>
						<p class="mt-3 text-xs text-skin-muted">Value: <code class="text-skin-primary">{{ size }}</code></p>
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
