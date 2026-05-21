<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import Demo from '../../_layout/Demo.vue';
import PropsTable from '../../_layout/PropsTable.vue';
import { ElButton } from '../../lib/vue';
import { ref } from 'vue';

const loading = ref(false);

const usageVue = `<script setup>
import { ElButton } from '@elements/vue';
<\/script>

<template>
  <ElButton variant="primary" size="md">Get started</ElButton>
  <ElButton variant="secondary">Cancel</ElButton>
  <ElButton variant="ghost" size="sm">Skip</ElButton>
  <ElButton variant="danger" loading>Deleting</ElButton>
</template>`;

const props = [
	{ name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", default: 'primary', description: 'Visual style.' },
	{ name: 'size', type: "'sm' | 'md' | 'lg'", default: 'md', description: 'Size preset.' },
	{ name: 'loading', type: 'boolean', default: 'false', description: 'Show spinner and block interaction.' },
	{ name: 'disabled', type: 'boolean', default: 'false', description: 'Disabled state.' },
	{ name: 'as', type: 'string', default: 'button', description: 'Render element / component (e.g. router-link).' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage name="Button" tagline="The atomic call to action. Variants, sizes, loading state, and any underlying element." tag="<ElButton>">
			<DocSection eyebrow="Demo" title="Live preview">
				<Demo>
					<div class="flex flex-wrap items-center gap-3">
						<ElButton variant="primary">Primary</ElButton>
						<ElButton variant="secondary">Secondary</ElButton>
						<ElButton variant="ghost">Ghost</ElButton>
						<ElButton variant="danger">Danger</ElButton>
						<ElButton :loading="loading" @click="loading = !loading">{{ loading ? 'Working…' : 'Toggle loading' }}</ElButton>
					</div>
				</Demo>
			</DocSection>

			<DocSection eyebrow="Sizes" title="Three balanced sizes">
				<Demo>
					<div class="flex flex-wrap items-center gap-3">
						<ElButton size="sm">Small</ElButton>
						<ElButton size="md">Medium</ElButton>
						<ElButton size="lg">Large</ElButton>
					</div>
				</Demo>
			</DocSection>

			<DocSection eyebrow="Usage" title="Vue">
				<CodeBlock :code="usageVue" lang="vue" />
			</DocSection>

			<DocSection title="Props">
				<PropsTable :rows="props" />
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
