<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import Demo from '../../_layout/Demo.vue';
import PropsTable from '../../_layout/PropsTable.vue';
import { ElToggle } from '../../lib/vue';
import { ref } from 'vue';

const notifications = ref(true);
const marketing = ref(false);

const usageVue = `<script setup>
import { ElToggle } from '@elements/vue';
import { ref } from 'vue';
const on = ref(true);
<\/script>

<template>
  <ElToggle v-model="on" label="Notifications" />
</template>`;

const usageWeb = `<element-toggle checked aria-label="Notifications"></element-toggle>

<script type="module">
  import '@elements/headless';
  document.querySelector('element-toggle')
    .addEventListener('el:change', (e) => console.log(e.detail.checked));
<\/script>`;

const props = [
	{ name: 'v-model', type: 'boolean', default: 'false', description: 'Checked state.' },
	{ name: 'label', type: 'string', default: '—', description: 'Visible label next to the toggle.' },
	{ name: 'disabled', type: 'boolean', default: 'false', description: 'Disable interaction.' },
];
const keys = [
	{ k: 'Space / Enter', d: 'Toggle the value.' },
	{ k: 'Tab', d: 'Move focus through toggles in source order.' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage name="Toggle" tagline="Accessible switch with role=switch, keyboard support, and a smooth thumb animation." tag="<element-toggle>">
			<DocSection eyebrow="Demo" title="Live preview">
				<Demo>
					<div class="flex w-full max-w-sm flex-col gap-4">
						<ElToggle v-model="notifications" label="Push notifications" />
						<ElToggle v-model="marketing" label="Marketing emails" />
						<ElToggle :model-value="false" label="Disabled option" disabled />
					</div>
				</Demo>
			</DocSection>

			<DocSection eyebrow="Usage" title="Vue">
				<CodeBlock :code="usageVue" lang="vue" />
			</DocSection>

			<DocSection eyebrow="Usage" title="Web component">
				<CodeBlock :code="usageWeb" lang="html" />
			</DocSection>

			<DocSection title="Props">
				<PropsTable :rows="props" />
			</DocSection>

			<DocSection title="Keyboard">
				<ul class="space-y-2 rounded-2xl border border-skin-border bg-skin-surface/40 p-5 text-sm">
					<li v-for="row in keys" :key="row.k" class="flex items-start gap-4">
						<kbd class="rounded bg-skin-background px-2 py-0.5 font-mono text-xs ring-1 ring-skin-border">{{ row.k }}</kbd>
						<span class="text-skin-secondary">{{ row.d }}</span>
					</li>
				</ul>
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
