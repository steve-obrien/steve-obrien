<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Playground from '../../_layout/docs/Playground.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentSlots from '../../_layout/docs/ComponentSlots.vue';
import { ElButton } from '../../lib/vue';

const doc = ElButton.__doc;
</script>

<template>
	<ElementsLayout>
		<DocPage :name="doc.name" :tagline="doc.description" :tag="doc.tag">
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:inspect="ElButton"
					title="Button playground"
					description="Edit any prop on the right — the rendered button and the synthesised source update together. No example SFC needed; the playground auto-builds its data from ElButton's defineProps."
				>
					Button
				</Playground>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElButton" />
			</DocSection>

			<ComponentSlots :component="ElButton" />
		</DocPage>
	</ElementsLayout>
</template>
