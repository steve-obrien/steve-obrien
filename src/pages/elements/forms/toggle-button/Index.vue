<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import Playground from '../../_layout/docs/Playground.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentEvents from '../../_layout/docs/ComponentEvents.vue';
import { ElToggleButton } from '../../lib/vue';
import Pin from './examples/Pin.vue';
import PinSrc from './examples/Pin.vue?raw';

const doc = ElToggleButton.__doc;
</script>

<template>
	<ElementsLayout>
		<DocPage :name="doc.name" :tagline="doc.description" :tag="doc.tag">
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:inspect="ElToggleButton"
					:initial="{ label: 'Pinned state', pressedLabel: 'Pinned', unpressedLabel: 'Pin item', modelValue: false }"
					title="Toggle button playground"
					description="Use a toggle button when a boolean setting should feel like a compact action."
				/>
			</DocSection>

			<DocSection eyebrow="Demo" title="Boolean action">
				<Example
					:source="PinSrc"
					filename="Pin.vue"
					description="The button uses aria-pressed and still writes through v-model."
				>
					<Pin />
				</Example>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElToggleButton" />
				<ComponentEvents :component="ElToggleButton" />
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
