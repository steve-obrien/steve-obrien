<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import Playground from '../../_layout/docs/Playground.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentSlots from '../../_layout/docs/ComponentSlots.vue';
import ComponentKeyboard from '../../_layout/docs/ComponentKeyboard.vue';
import { ElDrawer } from '../../lib/vue';

import PlaygroundDrawer from './examples/Playground.vue';
import PlaygroundDrawerSrc from './examples/Playground.vue?raw';
import Navigation from './examples/Navigation.vue';
import NavigationSrc from './examples/Navigation.vue?raw';
import Filters from './examples/Filters.vue';
import FiltersSrc from './examples/Filters.vue?raw';
import BottomSheet from './examples/BottomSheet.vue';
import BottomSheetSrc from './examples/BottomSheet.vue?raw';
import Programmatic from './examples/Programmatic.vue';
import ProgrammaticSrc from './examples/Programmatic.vue?raw';

const doc = ElDrawer.__doc;
</script>

<template>
	<ElementsLayout>
		<DocPage :name="doc.name" :tagline="doc.description" :tag="doc.tag">
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:component="PlaygroundDrawer"
					:source="PlaygroundDrawerSrc"
					:inspect="ElDrawer"
					filename="Playground.vue"
					title="Drawer playground"
					description="Edit any prop on the right — toggle static to disable backdrop dismiss. Source shows the SFC you would write; Data shows the live props object bound to the component."
				/>
			</DocSection>

			<DocSection eyebrow="Demo" title="Right edge (default)">
				<Example
					:source="NavigationSrc"
					filename="Navigation.vue"
					description="A navigation menu sliding in from the right — the same interaction model as a mobile nav drawer."
				>
					<Navigation />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Left edge">
				<Example
					:source="FiltersSrc"
					filename="Filters.vue"
					description="Set side=&quot;left&quot; for filter panels, detail views, or any secondary surface anchored to the opposite edge."
				>
					<Filters />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Bottom edge">
				<Example
					:source="BottomSheetSrc"
					filename="BottomSheet.vue"
					description="Set side=&quot;bottom&quot; for sheet-style drawers. The small pill handle can be dragged down to close on desktop or mobile."
				>
					<BottomSheet />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Programmatic control">
				<Example
					:source="ProgrammaticSrc"
					filename="Programmatic.vue"
					description="Open, close, or toggle via a template ref — or drive state with v-model from script."
				>
					<Programmatic />
				</Example>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElDrawer" />
			</DocSection>

			<ComponentSlots :component="ElDrawer" />
			<ComponentKeyboard :component="ElDrawer" />
		</DocPage>
	</ElementsLayout>
</template>
