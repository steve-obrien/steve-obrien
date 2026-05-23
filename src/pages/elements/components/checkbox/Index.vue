<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import Playground from '../../_layout/docs/Playground.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentEvents from '../../_layout/docs/ComponentEvents.vue';
import { ElCheckbox } from '../../lib/vue';
import Preferences from './examples/Preferences.vue';
import PreferencesSrc from './examples/Preferences.vue?raw';
</script>

<template>
	<ElementsLayout>
		<DocPage name="Checkbox" tagline="A single boolean input with checkbox semantics, keyboard support, and easy label composition." tag="<element-checkbox>">
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:inspect="ElCheckbox"
					:initial="{ modelValue: true, label: 'Product updates', description: 'Occasional release notes.' }"
					title="Checkbox playground"
					description="Edit props in the inspector and toggle the live checkbox."
				/>
			</DocSection>

			<DocSection eyebrow="Demo" title="Preferences">
				<Example
					:source="PreferencesSrc"
					filename="Preferences.vue"
					description="Use checkboxes for independent yes/no choices."
				>
					<Preferences />
				</Example>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElCheckbox" />
				<ComponentEvents :component="ElCheckbox" />
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
