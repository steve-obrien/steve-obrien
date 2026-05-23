<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import Playground from '../../_layout/docs/Playground.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentSlots from '../../_layout/docs/ComponentSlots.vue';
import ComponentEvents from '../../_layout/docs/ComponentEvents.vue';
import { ElToastStack } from '../../lib/vue';
import ToastPlayground from './examples/Playground.vue';
import ToastPlaygroundSrc from './examples/Playground.vue?raw';
import Notifications from './examples/Notifications.vue';
import NotificationsSrc from './examples/Notifications.vue?raw';
import Programmatic from './examples/Programmatic.vue';
import ProgrammaticSrc from './examples/Programmatic.vue?raw';
import CustomContent from './examples/CustomContent.vue';
import CustomContentSrc from './examples/CustomContent.vue?raw';
import ComponentToasts from './examples/ComponentToasts.vue';
import ComponentToastsSrc from './examples/ComponentToasts.vue?raw';
import AvatarToastSrc from './examples/toasts/AvatarToast.vue?raw';
import SoftwareUpdateToastSrc from './examples/toasts/SoftwareUpdateToast.vue?raw';

const componentToastSource = [
	'// ComponentToasts.vue',
	ComponentToastsSrc,
	'// toasts/AvatarToast.vue',
	AvatarToastSrc,
	'// toasts/SoftwareUpdateToast.vue',
	SoftwareUpdateToastSrc,
].join('\n\n');
</script>

<template>
	<ElementsLayout>
		<DocPage name="Toast" tagline="A live-region stack for transient, dismissible feedback." tag="<element-toast-region>">
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:inspect="ElToastStack"
					:component="ToastPlayground"
					:source="ToastPlaygroundSrc"
					filename="Playground.vue"
					title="Toast playground"
					description="Edit the stack position, auto-dismiss behaviour, and toast rows in the inspector."
				/>
			</DocSection>

			<DocSection eyebrow="Demo" title="Notifications">
				<Example
					:source="NotificationsSrc"
					filename="Notifications.vue"
					description="Trigger normal, success, danger, and persistent toasts. Each toast animates in and out, and timed toasts automatically dismiss."
				>
					<Notifications />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Programmatic API">
				<Example
					:source="ProgrammaticSrc"
					filename="Programmatic.vue"
					description="Use useToasts() when an action, such as saving a form, needs to trigger feedback from plain application code."
				>
					<Programmatic />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Custom content">
				<Example
					:source="CustomContentSrc"
					filename="CustomContent.vue"
					description="Use the default slot to render richer markup such as avatars, action buttons, and component-driven content."
				>
					<CustomContent />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Toast templates">
				<Example
					:source="componentToastSource"
					filename="ComponentToasts.vue + templates"
					description="Pass a separate SFC to show(Component, props, options) when different notifications need their own markup and data shape."
				>
					<ComponentToasts />
				</Example>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElToastStack" />
				<ComponentSlots :component="ElToastStack" />
				<ComponentEvents :component="ElToastStack" />
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
