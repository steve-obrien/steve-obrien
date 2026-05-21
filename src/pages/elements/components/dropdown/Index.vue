<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import Playground from '../../_layout/docs/Playground.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentSlots from '../../_layout/docs/ComponentSlots.vue';
import ComponentEvents from '../../_layout/docs/ComponentEvents.vue';
import ComponentKeyboard from '../../_layout/docs/ComponentKeyboard.vue';
import { ElDropdown } from '../../lib/vue';

// Each example is its own SFC. We import it twice: as a component for the
// live render, and as a raw string for the code panel. They cannot drift.
import Basic from './examples/Basic.vue';
import BasicSrc from './examples/Basic.vue?raw';
import Rich from './examples/Rich.vue';
import RichSrc from './examples/Rich.vue?raw';
import Actions from './examples/Actions.vue';
import ActionsSrc from './examples/Actions.vue?raw';

const doc = ElDropdown.__doc;

const playgroundItems = [
	{ label: 'First option', value: 'a' },
	{ label: 'Second option', value: 'b' },
	{ label: 'Third option', value: 'c' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage :name="doc.name" :tagline="doc.description" :tag="doc.tag">
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:inspect="ElDropdown"
					:initial="{ items: playgroundItems, label: 'Choose…' }"
					title="Dropdown playground"
					description="Edit props in the inspector — open the menu to preview item labels and alignment."
				/>
			</DocSection>

			<DocSection eyebrow="Demo" title="Basic">
				<Example
					:source="BasicSrc"
					filename="Basic.vue"
					description="Click the trigger to open the menu. Selected value is emitted via @select."
				>
					<Basic />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Custom item markup">
				<Example
					:source="RichSrc"
					filename="Rich.vue"
					description="The #trigger and #item slots accept any markup — avatars, descriptions, badges."
				>
					<Rich />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Actions menu — icon + label">
				<Example
					:source="ActionsSrc"
					filename="Actions.vue"
					description="Items with separator: true draw a divider. tone: 'danger' colours destructive rows red."
				>
					<Actions />
				</Example>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElDropdown" />
			</DocSection>

			<ComponentSlots :component="ElDropdown" />
			<ComponentEvents :component="ElDropdown" />
			<ComponentKeyboard :component="ElDropdown" />
		</DocPage>
	</ElementsLayout>
</template>
