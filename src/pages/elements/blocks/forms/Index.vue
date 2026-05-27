<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import AccountSecurity from './examples/AccountSecurity.vue';
import AccountSecuritySrc from './examples/AccountSecurity.vue?raw';
import ContactForm from './examples/ContactForm.vue';
import ContactFormSrc from './examples/ContactForm.vue?raw';
import PaymentCollection from './examples/PaymentCollection.vue';
import PaymentCollectionSrc from './examples/PaymentCollection.vue?raw';
import NewUserForm from './examples/NewUserForm.vue';
import NewUserFormSrc from './examples/NewUserForm.vue?raw';
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Form Blocks"
			tagline="Complete application form starters using field primitives, form state, native controls, and semantic status tokens."
			tag="Application UI"
			eyebrow="Blocks"
		>
			<DocSection eyebrow="Lead capture" title="Contact form">
				<Example
					:source="ContactFormSrc"
					filename="ContactForm.vue"
					description="A compact contact form for collecting a name, email, business, phone number, message, and subscription opt-in."
				>
					<ContactForm />
				</Example>
			</DocSection>

			<DocSection eyebrow="Checkout" title="Payment collection form">
				<Example
					:source="PaymentCollectionSrc"
					filename="PaymentCollection.vue"
					description="A payment details layout with card fields, amount, region, and a save-card preference."
				>
					<PaymentCollection />
				</Example>
			</DocSection>

			<DocSection eyebrow="Team admin" title="Add a new user">
				<Example
					:source="NewUserFormSrc"
					filename="NewUserForm.vue"
					description="A user creation form for assigning role, team, and invite behaviour."
				>
					<NewUserForm />
				</Example>
			</DocSection>

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
