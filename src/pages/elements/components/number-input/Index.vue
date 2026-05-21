<script setup>
import { ref } from 'vue';
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import Demo from '../../_layout/Demo.vue';
import PropsTable from '../../_layout/PropsTable.vue';
import { ElNumberInput } from '../../lib/vue';

const qty = ref(3);

const usage = `<script setup>
import { ElNumberInput } from '@elements/vue';
import { ref } from 'vue';
const qty = ref(1);
<\/script>

<template>
  <ElNumberInput
    v-model="qty"
    label="Quantity"
    description="Between 1 and 99."
    :min="1"
    :max="99"
  />
</template>`;

const props = [
	{ name: 'v-model', type: 'number', default: '0', description: 'Bound numeric value.' },
	{ name: 'label', type: 'string', default: '—', description: 'Label above the input.' },
	{ name: 'description', type: 'string', default: '—', description: 'Hint shown below the input.' },
	{ name: 'min / max / step', type: 'number', default: '—', description: 'Native numeric constraints.' },
	{ name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the input.' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Number input"
			tagline="A labelled number field with native min / max / step support."
			tag="<ElNumberInput>"
		>
			<DocSection eyebrow="Demo" title="Live preview">
				<Demo>
					<div class="w-full max-w-sm">
						<ElNumberInput
							v-model="qty"
							label="Quantity"
							description="Between 1 and 99."
							:min="1"
							:max="99"
						/>
						<p class="mt-3 text-xs text-skin-muted">Value: <code class="text-skin-primary">{{ qty }}</code></p>
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
