<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import Playground from '../../_layout/docs/Playground.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentEvents from '../../_layout/docs/ComponentEvents.vue';
import { ElJsonListInput } from '../../lib/vue';

import LabelValueOptions from './examples/LabelValueOptions.vue';
import LabelValueOptionsSrc from './examples/LabelValueOptions.vue?raw';
import SchemaRows from './examples/SchemaRows.vue';
import SchemaRowsSrc from './examples/SchemaRows.vue?raw';
import CompactRows from './examples/CompactRows.vue';
import CompactRowsSrc from './examples/CompactRows.vue?raw';

const doc = ElJsonListInput.__doc;
const playgroundInitial = {
	label: 'Menu items',
	description: 'Schema-aware rows with a raw JSON toggle.',
	addLabel: '+ Add item',
	modelValue: [
		{ label: 'Profile', value: 'profile', shortcut: 'Cmd+P' },
		{ label: 'Settings', value: 'settings', shortcut: 'Cmd+,' },
	],
	schema: [
		{ key: 'label', label: 'Label', placeholder: 'Profile', default: (index) => `Item ${index + 1}` },
		{ key: 'value', label: 'Value', placeholder: 'profile', default: (index) => `item-${index + 1}` },
		{ key: 'shortcut', label: 'Shortcut', placeholder: 'Cmd+P' },
	],
};
</script>

<template>
	<ElementsLayout>
		<DocPage :name="doc.name" :tagline="doc.description" :tag="doc.tag">
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:inspect="ElJsonListInput"
					:initial="playgroundInitial"
					title="JSON list input playground"
					description="Use the fields mode for structured editing, then switch to JSON when copy, paste, or bulk edits are quicker."
				/>
			</DocSection>

			<DocSection eyebrow="Demo" title="Label/value options">
				<Example
					:source="LabelValueOptionsSrc"
					filename="LabelValueOptions.vue"
					description="A label/value picker list is just ElJsonListInput with a two-field schema."
				>
					<LabelValueOptions />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Schema-driven rows">
				<Example
					:source="SchemaRowsSrc"
					filename="SchemaRows.vue"
					description="The schema controls which fields appear, their labels, placeholders, input types, and defaults for new rows."
				>
					<SchemaRows />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Compact inspector mode">
				<Example
					:source="CompactRowsSrc"
					filename="CompactRows.vue"
					description="Compact mode keeps the editor useful inside a Studio-style inspector without removing the raw JSON toggle."
				>
					<CompactRows />
				</Example>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElJsonListInput" />
			</DocSection>

			<ComponentEvents :component="ElJsonListInput" />
		</DocPage>
	</ElementsLayout>
</template>
