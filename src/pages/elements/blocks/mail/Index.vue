<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import MailClient from './examples/MailClient.vue';
import MailClientSrc from './examples/MailClient.vue?raw';
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Mail Block"
			tagline="A Mac Mail-style three-pane layout with folders, message list, and readable preview panel."
			tag="Application UI"
			eyebrow="Blocks"
		>
			<DocSection eyebrow="Starter" title="Three-pane mail">
				<Example
					:source="MailClientSrc"
					filename="MailClient.vue"
					description="A dense application block that keeps spacing compact and predictable."
					default-open
				>
					<MailClient />
				</Example>
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
