<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import ElementsLayout from '../ElementsLayout.vue';
import DocPage from '../DocPage.vue';
import DocSection from '../DocSection.vue';
import CodeBlock from '../CodeBlock.vue';
import ComponentSlots from './ComponentSlots.vue';
import ComponentEvents from './ComponentEvents.vue';
import ComponentKeyboard from './ComponentKeyboard.vue';
import HeadlessAttributes from './HeadlessAttributes.vue';

// One shell for every <element-*> page. Reads everything from the class's
// static `__doc` field — description, slots, attributes, events, keyboard
// reference and the HTML usage example.
const props = defineProps({
	element: { required: true },
});
const doc = computed(() => props.element?.__doc || {});
</script>

<template>
	<ElementsLayout>
		<DocPage :name="`<${doc.name}>`" :tagline="doc.description" tag="custom element">
			<!-- Live HTML examples (same source as the code panel via ?raw). -->
			<slot />

			<DocSection eyebrow="Usage" title="Plain HTML">
				<CodeBlock v-if="doc.example" :code="doc.example" lang="html" />
				<p class="mt-3 text-sm text-muted-foreground">
					Register every <code>&lt;element-*&gt;</code> in one import:
					<code class="rounded bg-secondary px-1 py-0.5 ring-1 ring-border">import '@elements/headless'</code>.
				</p>
			</DocSection>

			<ComponentSlots :component="element" />
			<HeadlessAttributes :element="element" />
			<ComponentEvents :component="element" prefix="" />
			<ComponentKeyboard :component="element" />

			<DocSection eyebrow="Related" title="See also">
				<RouterLink to="/elements/headless" class="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline">
					← Headless overview
				</RouterLink>
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
