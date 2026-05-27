<script setup>
import { ref } from 'vue';
import { ElButton, ElCard, ElCheckbox, ElForm, ElNativeSelect, ElNumberInput, ElTextInput } from '../../../lib/vue';

const payment = ref({
	amount: 249,
	name: 'Maya Patel',
	card: '',
	expiry: '',
	cvc: '',
	country: 'gb',
	save: true,
});

const countries = [
	{ label: 'United Kingdom', value: 'gb' },
	{ label: 'United States', value: 'us' },
	{ label: 'Ireland', value: 'ie' },
	{ label: 'Germany', value: 'de' },
];
</script>

<template>
	<ElCard padding="lg" class="w-full max-w-2xl">
		<div class="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
			<div>
				<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Payment</p>
				<h3 class="mt-2 text-2xl font-semibold tracking-tight">Collect payment</h3>
				<p class="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
					A billing form layout for card details, region, amount, and save-card preference.
				</p>
			</div>
			<span class="rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">Secure checkout</span>
		</div>

		<ElForm v-model="payment" name="payment" class="mt-6 grid gap-5">
			<div class="grid gap-5 md:grid-cols-[1fr_0.7fr]">
				<ElTextInput name="name" label="Name on card" placeholder="Maya Patel" required autocomplete="cc-name" />
				<ElNumberInput name="amount" label="Amount" :min="1" :step="1" required />
			</div>

			<ElTextInput
				name="card"
				label="Card number"
				placeholder="4242 4242 4242 4242"
				required
				autocomplete="cc-number"
			/>

			<div class="grid gap-5 md:grid-cols-3">
				<ElTextInput name="expiry" label="Expiry" placeholder="MM / YY" required autocomplete="cc-exp" />
				<ElTextInput name="cvc" label="CVC" placeholder="123" required autocomplete="cc-csc" />
				<ElNativeSelect name="country" label="Country" :options="countries" placeholder="Select country" />
			</div>

			<div class="rounded-2xl border border-border bg-secondary/50 p-4">
				<ElCheckbox
					name="save"
					label="Save payment method"
					description="Store this card for future invoices and subscription renewals."
				/>
			</div>

			<div class="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
				<p class="text-xs text-muted-foreground">Card processing UI only. Wire this to your payment provider in application code.</p>
				<ElButton type="submit">Charge card</ElButton>
			</div>
		</ElForm>
	</ElCard>
</template>
