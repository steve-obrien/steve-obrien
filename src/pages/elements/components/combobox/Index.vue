<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import Demo from '../../_layout/Demo.vue';
import PropsTable from '../../_layout/PropsTable.vue';
import { ElCombobox } from '../../lib/vue';
import { ref } from 'vue';

const value = ref('');
const fruits = [
	{ value: 'apple', label: 'Apple' },
	{ value: 'banana', label: 'Banana' },
	{ value: 'cherry', label: 'Cherry' },
	{ value: 'date', label: 'Date' },
	{ value: 'elderberry', label: 'Elderberry' },
	{ value: 'fig', label: 'Fig' },
	{ value: 'grape', label: 'Grape' },
];

const usageVue = `<script setup>
import { ElCombobox } from '@elements/vue';
import { ref } from 'vue';
const value = ref('');
const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
];
<\/script>

<template>
  <ElCombobox v-model="value" :options="options" placeholder="Pick a fruit" />
</template>`;

const usageWeb = `<element-combobox>
  <input slot="input" placeholder="Search…" />
  <ul slot="list">
    <li data-value="apple">Apple</li>
    <li data-value="banana">Banana</li>
  </ul>
</element-combobox>`;

const props = [
	{ name: 'v-model', type: 'string', default: '—', description: 'Selected value.' },
	{ name: 'options', type: 'Array<{ value, label }> | string[]', default: '—', description: 'Available options.' },
	{ name: 'placeholder', type: 'string', default: "'Search…'", description: 'Input placeholder.' },
];
const keys = [
	{ k: '↑ / ↓', d: 'Move active option.' },
	{ k: 'Enter', d: 'Commit active option.' },
	{ k: 'Esc', d: 'Close the list.' },
	{ k: 'Type', d: 'Filter the list live.' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage name="Combobox" tagline="Type-ahead select with managed activedescendant, keyboard navigation, and outside-click dismiss." tag="<element-combobox>">
			<DocSection eyebrow="Demo" title="Live preview">
				<Demo>
					<div class="flex w-full max-w-sm flex-col items-stretch gap-2">
						<ElCombobox v-model="value" :options="fruits" placeholder="Pick a fruit" />
						<p class="text-xs text-skin-muted">Selected: <code class="text-skin-primary">{{ value || '—' }}</code></p>
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
