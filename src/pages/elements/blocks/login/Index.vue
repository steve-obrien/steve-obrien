<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
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
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
