<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import AccountSecurity from './examples/AccountSecurity.vue';
import AccountSecuritySrc from './examples/AccountSecurity.vue?raw';
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Form Block"
			tagline="A complete application form starter using native controls, password feedback, and semantic status tokens."
			tag="Application UI"
			eyebrow="Blocks"
		>
			<DocSection eyebrow="Starter" title="Account security form">
				<Example
					:source="AccountSecuritySrc"
					filename="AccountSecurity.vue"
					description="This shows how richer fields should behave inside a real settings form."
					default-open
				>
					<AccountSecurity />
				</Example>
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
