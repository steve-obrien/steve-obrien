<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import Playground from '../../_layout/docs/Playground.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentEvents from '../../_layout/docs/ComponentEvents.vue';
import { ElToggleButtonGroup } from '../../lib/vue';
import ViewMode from './examples/ViewMode.vue';
import ViewModeSrc from './examples/ViewMode.vue?raw';

const doc = ElToggleButtonGroup.__doc;
const options = [
	{ label: 'List', value: 'list' },
	{ label: 'Grid', value: 'grid' },
	{ label: 'Board', value: 'board' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage :name="doc.name" :tagline="doc.description" :tag="doc.tag">
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:inspect="ElToggleButtonGroup"
					:initial="{ label: 'View', modelValue: 'grid', options }"
					title="Toggle button group playground"
					description="Use single mode as a segmented control, or multiple mode for independent pressed options."
				/>
			</DocSection>

			<DocSection eyebrow="Demo" title="Single and multiple modes">
				<Example
					:source="ViewModeSrc"
					filename="ViewMode.vue"
					description="Single mode returns one value. Multiple mode returns an array of pressed values."
				>
					<ViewMode />
				</Example>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElToggleButtonGroup" />
				<ComponentEvents :component="ElToggleButtonGroup" />
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
