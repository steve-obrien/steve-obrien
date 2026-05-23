<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import Playground from '../../_layout/docs/Playground.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentEvents from '../../_layout/docs/ComponentEvents.vue';
import { ElListbox } from '../../lib/vue';
import Plan from './examples/Plan.vue';
import PlanSrc from './examples/Plan.vue?raw';

const options = [
	{ value: 'small', label: 'Small' },
	{ value: 'medium', label: 'Medium' },
	{ value: 'large', label: 'Large' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage name="Listbox" tagline="A styled select-like list without text entry." tag="<element-listbox>">
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:inspect="ElListbox"
					:initial="{ modelValue: 'medium', options }"
					title="Listbox playground"
					description="Use this when users choose from visible options and should not type arbitrary text."
				/>
			</DocSection>

			<DocSection eyebrow="Demo" title="Custom option markup">
				<Example
					:source="PlanSrc"
					filename="Plan.vue"
					description="The option slot can render richer labels while v-model remains the option value."
				>
					<Plan />
				</Example>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElListbox" />
				<ComponentEvents :component="ElListbox" />
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
