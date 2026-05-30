<script setup>
import { nextTick, ref, watch } from 'vue';
import { ElDialog, ElButton } from '@elements/vue';

const open = ref(false);
const canAccept = ref(false);
const terms = ref(null);
const sections = [
	{
		title: 'Account access',
		body: 'You are responsible for keeping your account details accurate and for protecting access to your workspace. Notify the service team if you believe your account has been used without permission.',
	},
	{
		title: 'Acceptable use',
		body: 'Do not use the service to interfere with other customers, attempt to bypass security controls, scrape private data, or upload content that you do not have permission to process.',
	},
	{
		title: 'Customer content',
		body: 'You retain ownership of your content. The service may process, store, and transmit that content only as needed to provide the features you choose to use.',
	},
	{
		title: 'Service changes',
		body: 'Features may change as the product evolves. When a material change affects your rights or obligations, updated terms will be made available before they take effect.',
	},
	{
		title: 'Billing',
		body: 'Paid plans renew automatically unless cancelled before the renewal date. Taxes, usage charges, and subscription changes may be reflected on future invoices.',
	},
	{
		title: 'Privacy',
		body: 'Personal data is handled according to the privacy notice. Administrative users should make sure their teams understand what information is submitted to the service.',
	},
	{
		title: 'Availability',
		body: 'The service is designed for reliable access, but planned maintenance, emergency repairs, third-party outages, and network conditions may affect availability from time to time.',
	},
	{
		title: 'Termination',
		body: 'Either party may end use of the service according to the plan terms. After termination, access may be limited and retained data may be deleted after the applicable retention period.',
	},
];

function updateScrollState() {
	const el = terms.value;
	if (!el) return;
	canAccept.value = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
}

watch(open, async (isOpen) => {
	if (!isOpen) return;
	canAccept.value = false;
	await nextTick();
	if (terms.value) terms.value.scrollTop = 0;
	updateScrollState();
});

function acceptTerms() {
	if (!canAccept.value) return;
	open.value = false;
}
</script>

<template>
	<ElButton variant="primary" @click="open = true">Review terms</ElButton>
	<ElDialog
		v-model="open"
		title="Terms and conditions"
		description="Read the full agreement before accepting."
	>
		<div
			ref="terms"
			class="max-h-[min(52vh,22rem)] overflow-y-auto rounded-xl border border-border bg-secondary/30 p-4 pr-3 text-sm leading-6 text-muted-foreground"
			@scroll="updateScrollState"
		>
			<div class="space-y-5">
				<section v-for="section in sections" :key="section.title" class="space-y-1">
					<h3 class="text-sm font-semibold text-foreground">{{ section.title }}</h3>
					<p>{{ section.body }}</p>
				</section>
				<p class="border-t border-border pt-5 text-foreground">
					By accepting, you confirm that you have reviewed the terms above and are authorised to agree on behalf of your workspace.
				</p>
			</div>
		</div>

		<template #footer>
			<p class="mr-auto text-xs text-muted-foreground">
				{{ canAccept ? 'Ready to accept.' : 'Scroll to the end to continue.' }}
			</p>
			<ElButton variant="secondary" @click="open = false">Cancel</ElButton>
			<ElButton :disabled="!canAccept" @click="acceptTerms">Accept</ElButton>
		</template>
	</ElDialog>
</template>
