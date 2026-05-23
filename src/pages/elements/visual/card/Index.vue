<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import Playground from '../../_layout/docs/Playground.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentSlots from '../../_layout/docs/ComponentSlots.vue';
import { ElCard } from '../../lib/vue';

import Basic from './examples/Basic.vue';
import BasicSrc from './examples/Basic.vue?raw';
import Glass from './examples/Glass.vue';
import GlassSrc from './examples/Glass.vue?raw';

const doc = ElCard.__doc;
</script>

<template>
	<ElementsLayout>
		<DocPage :name="doc.name" :tagline="doc.description" :tag="doc.tag" eyebrow="Visual primitive">
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:inspect="ElCard"
					:initial="{ padding: 'md', glass: true, interactive: false }"
					title="Card playground"
					description="Cards are visual-only: they provide the surface, gradient, border, and spacing, while your markup decides the content."
				>
					<div class="space-y-2">
						<p class="text-lg font-semibold tracking-tight">Glass card</p>
						<p class="max-w-sm text-sm leading-6 text-muted-foreground">
							This primitive uses bg-card and text-card-foreground, with a subtle top-light gradient.
						</p>
					</div>
				</Playground>
			</DocSection>

			<DocSection eyebrow="Demo" title="Basic content card">
				<Example
					:source="BasicSrc"
					filename="Basic.vue"
					description="Use ElCard for grouped content that needs a consistent semantic surface."
				>
					<Basic />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Apple-style glass">
				<Example
					:source="GlassSrc"
					filename="Glass.vue"
					description="The glass treatment is still token-driven, so it adapts cleanly across light and dark themes."
				>
					<Glass />
				</Example>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElCard" />
			</DocSection>

			<ComponentSlots :component="ElCard" />
		</DocPage>
	</ElementsLayout>
</template>
