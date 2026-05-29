<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import Playground from '../../_layout/docs/Playground.vue';
import PropsTable from '../../_layout/PropsTable.vue';
import { ElClassToggleInput } from '../../lib/vue';
import TailwindClassLedger from './examples/TailwindClassLedger.vue';
import TailwindClassLedgerSrc from './examples/TailwindClassLedger.vue?raw';
import { tailwindClassIndex } from '../_shared/serverLookup.js';

const playgroundInitial = {
	modelValue: 'flex min-w-0 text-2xl',
	inactiveValues: ['md:h-full', 'md:overflow-y-auto'],
	options: tailwindClassIndex,
	label: 'Classes',
	description: 'Toggle utilities without deleting them.',
	placeholder: 'Add new class',
};

const props = [
	{ name: 'v-model', type: 'string', default: "''", description: 'Enabled classes as a space-separated string.' },
	{ name: 'v-model:inactiveValues', type: 'string[]', default: '[]', description: 'Known classes that remain visible but are currently toggled off.' },
	{ name: 'options', type: 'Array<{ value, label, description }> | string[]', default: '[]', description: 'Autocomplete suggestions for class names.' },
	{ name: 'allowCustom', type: 'boolean', default: 'true', description: 'Allow typed classes that are not present in options.' },
	{ name: 'filterOptions', type: 'boolean', default: 'true', description: 'Filter options locally as the user types.' },
	{ name: 'maxOptions', type: 'number', default: '8', description: 'Maximum suggestions to show.' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage name="Class toggle input" tagline="Autocomplete class names, then toggle each utility on or off without losing the list." tag="<ElClassToggleInput>">
			<DocSection eyebrow="Playground" title="Class ledger">
				<Playground
					:inspect="ElClassToggleInput"
					:initial="playgroundInitial"
					title="Class toggle input playground"
					description="Use the inspector to change the active and inactive class lists."
				/>
			</DocSection>

			<DocSection eyebrow="Demo" title="Tailwind utility editor">
				<Example
					:source="TailwindClassLedgerSrc"
					filename="TailwindClassLedger.vue"
					description="The active classes are emitted as a normal class string, while disabled utilities stay available as unchecked rows."
				>
					<TailwindClassLedger />
				</Example>
			</DocSection>

			<DocSection title="Props">
				<PropsTable :rows="props" />
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
