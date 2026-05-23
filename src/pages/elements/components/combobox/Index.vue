<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Playground from '../../_layout/docs/Playground.vue';
import PropsTable from '../../_layout/PropsTable.vue';
import PickFruit from './examples/PickFruit.vue';
import PickFruitSrc from './examples/PickFruit.vue?raw';
import PeopleLookup from './examples/PeopleLookup.vue';
import PeopleLookupSrc from './examples/PeopleLookup.vue?raw';
import PeoplePlayground from './examples/PeoplePlayground.vue';
import PeoplePlaygroundSrc from './examples/PeoplePlayground.vue?raw';
import Example from '../../_layout/docs/Example.vue';
import { RouterLink } from 'vue-router';

const peoplePlaygroundInspect = {
	props: {
		modelValue: {
			type: String,
			default: '',
			_edit: { label: 'Selected value', description: 'The option value currently committed by v-model.' },
		},
		options: {
			type: Array,
			default: () => [],
			_edit: {
				description: 'Rows of JSON-like option data used by the custom item slot.',
				component: 'ElJsonListInput',
				props: {
					label: 'People',
					addLabel: '+ Add person',
					schema: [
						{ key: 'value', label: 'Value', placeholder: 'person-id', default: (index) => `person-${index + 1}` },
						{ key: 'label', label: 'Name', placeholder: 'Person name', default: (index) => `Person ${index + 1}` },
						{ key: 'role', label: 'Role', placeholder: 'Role or title' },
						{ key: 'avatar', label: 'Avatar URL', type: 'url', placeholder: 'https://...' },
					],
				},
			},
		},
		placeholder: {
			type: String,
			default: 'Assign a person',
			_edit: { description: 'Placeholder shown when no option is selected.' },
		},
		placement: {
			type: String,
			default: 'bottom',
			_edit: { options: ['bottom', 'top', 'right', 'left'], description: 'Preferred side before collision handling.' },
		},
		floatingMode: {
			type: String,
			default: 'viewport',
			_edit: { options: ['viewport', 'anchor'], description: 'viewport keeps the list inside the browser; anchor keeps it attached while scrolling.' },
		},
	},
};

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
			<DocSection eyebrow="Playground" title="Custom item playground">
				<Playground
					:inspect="peoplePlaygroundInspect"
					:component="PeoplePlayground"
					:source="PeoplePlaygroundSrc"
					filename="PeoplePlayground.vue"
					title="People combobox playground"
					description="Edit people rows in the inspector and the custom item slot keeps rendering the richer markup."
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
				<p class="text-sm leading-relaxed text-muted-foreground">
					Use the headless custom element when you want the same combobox behaviour in plain HTML or another framework.
					The headless page includes copyable DOM-defined list examples.
				</p>
				<RouterLink
					to="/elements/headless/combobox"
					class="mt-4 inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
				>
					View headless combobox
				</RouterLink>
			</DocSection>

			<DocSection title="Props">
				<PropsTable :rows="props" />
			</DocSection>

			<DocSection title="Keyboard">
				<ul class="space-y-2 rounded-2xl border border-border bg-secondary/40 p-5 text-sm">
					<li v-for="row in keys" :key="row.k" class="flex items-start gap-4">
						<kbd class="rounded bg-background px-2 py-0.5 font-mono text-xs ring-1 ring-border">{{ row.k }}</kbd>
						<span class="text-muted-foreground">{{ row.d }}</span>
					</li>
				</ul>
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
