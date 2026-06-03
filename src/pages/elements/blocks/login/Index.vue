<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import TemplateExampleEditor from '../../_layout/docs/TemplateExampleEditor.vue';
import LoginPanel from './examples/LoginPanel.vue';
import LoginPanelSrc from './examples/LoginPanel.vue?raw';
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Login Block"
			tagline="A complete authentication starter with social sign-in buttons, email/password fields, and an editable product-side panel."
			tag="Application UI"
			eyebrow="Blocks"
		>
			<DocSection eyebrow="Starter" title="Social login">
				<Example
					:source="LoginPanelSrc"
					filename="LoginPanel.vue"
					description="A practical auth block using Card, Button, TextInput, PasswordInput, and Checkbox."
					default-open
				>
					<LoginPanel />
				</Example>
				<TemplateExampleEditor
					:source="LoginPanelSrc"
					filename="LoginPanel.vue"
					title="Editable login template"
					description="A compact template editor for documentation examples: rendered preview, Monaco source, and selected-node properties."
				/>
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
