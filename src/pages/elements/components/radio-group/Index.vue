<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import Playground from '../../_layout/docs/Playground.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentEvents from '../../_layout/docs/ComponentEvents.vue';
import { ElRadioGroup } from '../../lib/vue';
import Plans from './examples/Plans.vue';
import PlansSrc from './examples/Plans.vue?raw';

const options = [
	{ value: 'solo', label: 'Solo' },
	{ value: 'team', label: 'Team' },
	{ value: 'enterprise', label: 'Enterprise' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage name="Radio group" tagline="A single-choice form control with roving focus and fully styleable options." tag="<element-radio-group>">
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:inspect="ElRadioGroup"
					:initial="{ modelValue: 'team', label: 'Plan', options }"
					title="Radio group playground"
					description="Use this when one option in a set must be selected."
				/>
			</DocSection>

			<DocSection eyebrow="Demo" title="Plans">
				<Example
					:source="PlansSrc"
					filename="Plans.vue"
					description="Radio groups work well for small, mutually exclusive option sets."
				>
					<Plans />
				</Example>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElRadioGroup" />
				<ComponentEvents :component="ElRadioGroup" />
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
