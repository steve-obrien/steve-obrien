<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import Playground from '../../_layout/docs/Playground.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentEvents from '../../_layout/docs/ComponentEvents.vue';
import { ElMenu } from '../../lib/vue';
import Actions from './examples/Actions.vue';
import ActionsSrc from './examples/Actions.vue?raw';

const items = [
	{ value: 'rename', label: 'Rename' },
	{ value: 'duplicate', label: 'Duplicate' },
	{ separator: true },
	{ value: 'delete', label: 'Delete', tone: 'danger' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage name="Menu" tagline="A roving-focus action menu for command lists, settings panels, and menu surfaces." tag="<element-menu>">
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:inspect="ElMenu"
					:initial="{ items }"
					title="Menu playground"
					description="Edit menu rows in the inspector and use arrow keys to move between items."
				/>
			</DocSection>

			<DocSection eyebrow="Demo" title="Actions">
				<Example
					:source="ActionsSrc"
					filename="Actions.vue"
					description="Use menuitem, menuitemcheckbox, separators, and destructive tone in one keyboard navigable menu."
				>
					<Actions />
				</Example>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElMenu" />
				<ComponentEvents :component="ElMenu" />
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
