<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentEvents from '../../_layout/docs/ComponentEvents.vue';
import { ElContextMenu } from '../../lib/vue';
import Rows from './examples/Rows.vue';
import RowsSrc from './examples/Rows.vue?raw';
import Nested from './examples/Nested.vue';
import NestedSrc from './examples/Nested.vue?raw';
</script>

<template>
	<ElementsLayout>
		<DocPage name="Context menu" tagline="A right-click menu surface built on the shared menu primitive." tag="<ElContextMenu>">
			<DocSection eyebrow="Demo" title="Right-click menu">
				<Example
					:source="RowsSrc"
					filename="Rows.vue"
					description="Context menus use the same ElMenu item model, including keyboard navigation and destructive tones."
				>
					<Rows />
				</Example>
			</DocSection>

			<DocSection eyebrow="Nested" title="Context menu with submenus">
				<Example
					:source="NestedSrc"
					filename="Nested.vue"
					description="Use the same children array as ElMenu to create hoverable and keyboard-accessible nested context menu items."
				>
					<Nested />
				</Example>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElContextMenu" />
				<ComponentEvents :component="ElContextMenu" />
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
