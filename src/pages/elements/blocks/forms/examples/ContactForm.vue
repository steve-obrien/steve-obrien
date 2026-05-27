<script setup>
import { ref } from 'vue';
import { ElButton, ElCard, ElCheckbox, ElEmailInput, ElForm, ElTextInput, ElTextareaInput } from '../../../lib/vue';

const contact = ref({
	name: '',
	email: '',
	business: '',
	phone: '',
	message: '',
	subscribe: true,
});
</script>

<template>
	<ElCard padding="lg" class="w-full max-w-2xl">
		<div class="border-b border-border pb-6">
			<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Contact</p>
			<h3 class="mt-2 text-2xl font-semibold tracking-tight">Start a conversation</h3>
			<p class="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
				A compact lead form with contact details, business context, and a newsletter opt-in.
			</p>
		</div>

		<ElForm v-model="contact" name="contact" class="mt-6 grid gap-5">
			<div class="grid gap-5 md:grid-cols-2">
				<ElTextInput name="name" label="Name" placeholder="Maya Patel" required autocomplete="name" />
				<ElEmailInput name="email" label="Email" placeholder="maya@example.com" required autocomplete="email" />
			</div>

			<div class="grid gap-5 md:grid-cols-2">
				<ElTextInput name="business" label="Business" placeholder="Northstar Studio" autocomplete="organization" />
				<ElTextInput name="phone" type="tel" label="Phone" placeholder="+44 7700 900123" autocomplete="tel" />
			</div>

			<ElTextareaInput
				name="message"
				label="What can we help with?"
				placeholder="Tell us about the project, timeline, or problem."
				:rows="4"
			/>

			<div class="rounded-2xl border border-border bg-secondary/50 p-4">
				<ElCheckbox
					name="subscribe"
					label="Subscribe to product updates"
					description="Send occasional notes about Elements, app UI patterns, and release changes."
				/>
			</div>

			<div class="flex flex-wrap justify-end gap-2 border-t border-border pt-6">
				<ElButton variant="secondary" type="button">Clear</ElButton>
				<ElButton type="submit">Send message</ElButton>
			</div>
		</ElForm>
	</ElCard>
</template>
