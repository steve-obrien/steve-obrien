<script setup>
import { ref } from 'vue';
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import Demo from '../../_layout/Demo.vue';
import PropsTable from '../../_layout/PropsTable.vue';
import { ElColorInput } from '../../lib/vue';

const accent = ref('#0ea5e9');

const usage = `<script setup>
import { ElColorInput } from '@elements/vue';
import { ref } from 'vue';
const accent = ref('#0ea5e9');
<\/script>

<template>
  <ElColorInput
    v-model="accent"
    label="Accent colour"
    description="Used for primary buttons and links."
  />
</template>`;

const props = [
	{ name: 'v-model', type: 'string', default: "'#000000'", description: 'Hex colour value.' },
	{ name: 'label', type: 'string', default: '—', description: 'Label above the picker.' },
	{ name: 'description', type: 'string', default: '—', description: 'Hint shown below the picker.' },
	{ name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the picker.' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Color input"
			tagline="Native colour picker paired with a hex text field — both bound to the same value."
			tag="<ElColorInput>"
		>
			<DocSection eyebrow="Demo" title="Live preview">
				<Demo>
					<div class="w-full max-w-sm space-y-3">
						<ElColorInput
							v-model="accent"
							label="Accent colour"
							description="Used for primary buttons and links."
						/>
						<div class="flex items-center gap-2 text-sm">
							<span class="size-6 rounded-md ring-1 ring-skin-border" :style="{ background: accent }"></span>
							<code class="text-skin-primary">{{ accent }}</code>
						</div>
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
