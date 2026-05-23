<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import Playground from '../../_layout/docs/Playground.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentSlots from '../../_layout/docs/ComponentSlots.vue';
import ComponentKeyboard from '../../_layout/docs/ComponentKeyboard.vue';
import { ElPopover } from '../../lib/vue';

import Quick from './examples/Quick.vue';
import QuickSrc from './examples/Quick.vue?raw';
import Settings from './examples/Settings.vue';
import SettingsSrc from './examples/Settings.vue?raw';
import Actions from './examples/Actions.vue';
import ActionsSrc from './examples/Actions.vue?raw';

const doc = ElPopover.__doc;
</script>

<template>
	<ElementsLayout>
		<DocPage :name="doc.name" :tagline="doc.description" :tag="doc.tag">
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:inspect="ElPopover"
					title="Popover playground"
					description="Edit props in the inspector — the live panel and source/data tabs stay in sync."
				>
					<template #trigger>Quick facts</template>
					<p class="text-sm text-secondary">Popover body content.</p>
				</Playground>
			</DocSection>

			<DocSection eyebrow="Demo" title="Quick info">
				<Example
					:source="QuickSrc"
					filename="Quick.vue"
					description="The simplest case — a button that opens a panel with text content."
				>
					<Quick />
				</Example>	
			</DocSection>

			<DocSection eyebrow="Demo" title="Settings panel">
				<Example
					:source="SettingsSrc"
					filename="Settings.vue"
					description="Popover bodies can host any controls — including the form inputs from the library."
				>
					<Settings />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Actions menu">
				<Example
					:source="ActionsSrc"
					filename="Actions.vue"
					description="A simple actions list with a divider before a destructive action."
				>
					<Actions />
				</Example>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElPopover" />
			</DocSection>

			<ComponentSlots :component="ElPopover" />
			<ComponentKeyboard :component="ElPopover" />
		</DocPage>
	</ElementsLayout>
</template>
