<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Playground from '../../_layout/docs/Playground.vue';
import PropsTable from '../../_layout/PropsTable.vue';
import { ElCombobox } from '../../lib/vue';
import PickFruit from './examples/PickFruit.vue';
import PickFruitSrc from './examples/PickFruit.vue?raw';
import PeopleLookup from './examples/PeopleLookup.vue';
import PeopleLookupSrc from './examples/PeopleLookup.vue?raw';
import Example from '../../_layout/docs/Example.vue';
import { RouterLink } from 'vue-router';

const fruits = [
	{ value: '1', label: 'Apple' },
	{ value: '2', label: 'Banana' },
	{ value: '3', label: 'Cherry' },
	{ value: '4', label: 'Date' },
	{ value: '5', label: 'Elderberry' },
	{ value: '6', label: 'Fig' },
	{ value: '7', label: 'Grape' },
];

const props = [
	{ name: 'v-model', type: 'string', default: '—', description: 'Selected option value.' },
	{ name: 'options', type: 'Array<{ value, label }> | string[]', default: '—', description: 'Available options.' },
	{ name: 'placeholder', type: 'string', default: "'Search…'", description: 'Input placeholder.' },
	{ name: 'floatingMode', type: "'viewport' | 'anchor'", default: "'viewport'", description: 'Choose whether the list stays in the browser or follows the input while scrolling.' },
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
		<DocPage name="Combobox" tagline="A styled select-like control: show the option label, store the option value, and keep keyboard navigation." tag="<element-combobox>">
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:inspect="ElCombobox"
					:initial="{ options: fruits, placeholder: 'Pick a fruit' }"
					title="Combobox playground"
					description="Edit props in the inspector — type to filter options and preview placeholder and disabled state."
				/>
			</DocSection>

			<DocSection eyebrow="Demo" title="Vue">
				<Example
					:source="PickFruitSrc"
					filename="PickFruit.vue"
					description="The input displays the label, while v-model receives the option value."
				>
					<PickFruit />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Custom item markup">
				<Example
					:source="PeopleLookupSrc"
					filename="PeopleLookup.vue"
					description="Use the item slot for richer option rendering. The input still displays the label and v-model still receives the value."
				>
					<PeopleLookup />
				</Example>
			</DocSection>

			<DocSection eyebrow="Usage" title="Plain HTML">
				<p class="text-sm leading-relaxed text-skin-secondary">
					Use the headless custom element when you want the same combobox behaviour in plain HTML or another framework.
					The headless page includes copyable DOM-defined list examples.
				</p>
				<RouterLink
					to="/elements/headless/combobox"
					class="mt-4 inline-flex h-10 items-center rounded-full bg-skin-primary px-4 text-sm font-medium text-skin-inverse transition hover:opacity-90"
				>
					View headless combobox
				</RouterLink>
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
