<script setup>
import HeadlessPage from '../../_layout/docs/HeadlessPage.vue';
import HeadlessAttributes from '../../_layout/docs/HeadlessAttributes.vue';
import ComponentSlots from '../../_layout/docs/ComponentSlots.vue';
import ComponentEvents from '../../_layout/docs/ComponentEvents.vue';
import DocSection from '../../_layout/DocSection.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import { ElementAccordion, ElementAccordionItem } from '../../lib/headless';
</script>

<template>
	<HeadlessPage :element="ElementAccordion">
		<DocSection eyebrow="Child" title="<element-accordion-item>">
			<p class="text-sm text-skin-secondary">
				Accordion items live inside the host. Each one carries its own slots, attributes and event.
			</p>
			<CodeBlock class="mt-3" :code="ElementAccordionItem.__doc.example" lang="html" />
		</DocSection>
		<ComponentSlots :component="ElementAccordionItem" title="Item slots" />
		<HeadlessAttributes :element="ElementAccordionItem" title="Item attributes" />
		<ComponentEvents :component="ElementAccordionItem" title="Item events" prefix="" />
	</HeadlessPage>
</template>
