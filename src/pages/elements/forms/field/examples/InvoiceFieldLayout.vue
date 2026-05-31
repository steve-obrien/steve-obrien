<script setup>
import { computed, ref } from 'vue';
import {
	ElField,
	ElForm,
	ElGridFieldLayout,
	ElNumberInput,
	ElTextInput,
} from '@elements/vue';
import InvoiceLetterFieldLayout from './InvoiceLetterFieldLayout.vue';

const invoice = ref({
	number: 'INV-2026-014',
	client: 'Bright Studio',
	contact: 'billing@bright.example',
	due: '30 June 2026',
	lineItems: [
		{ description: 'Design system audit', quantity: 1, rate: 1200 },
		{ description: 'Form component implementation', quantity: 2, rate: 850 },
		{ description: 'Documentation pass', quantity: 1, rate: 450 },
	],
});

const total = computed(() => invoice.value.lineItems.reduce((sum, item) => (
	sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0)
), 0));

function lineTotal(item) {
	return (Number(item.quantity) || 0) * (Number(item.rate) || 0);
}

function money(value) {
	return new Intl.NumberFormat('en-GB', {
		style: 'currency',
		currency: 'GBP',
		maximumFractionDigits: 0,
	}).format(value);
}
</script>

<template>
	<ElForm
		v-model="invoice"
		name="invoice"
		class="w-full max-w-4xl space-y-6"
	>
		<ElField :field-layout="InvoiceLetterFieldLayout" :chrome="false">
			<div class="grid gap-6 lg:grid-cols-[1fr_18rem]">
				<div>
					<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Invoice to</p>
					<ElTextInput name="client" label="Client" />
					<ElTextInput name="contact" label="Contact" />
				</div>
				<div>
					<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Details</p>
					<ElTextInput name="number" label="Number" />
					<ElTextInput name="due" label="Due" />
				</div>
			</div>
		</ElField>

		<div class="overflow-x-auto">
			<div class="min-w-[44rem]">
				<div class="grid grid-cols-[minmax(0,1.5fr)_5rem_7rem_7rem] gap-2 border-b border-border pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					<span>Item</span>
					<span>Qty</span>
					<span>Rate</span>
					<span class="text-right">Total</span>
				</div>

				<ElForm
					v-for="(item, index) in invoice.lineItems"
					:key="index"
					:name="`lineItems.${index}`"
					class="grid grid-cols-[minmax(0,1.5fr)_5rem_7rem_7rem] gap-2 border-b border-border/70 py-3"
				>
					<ElField :field-layout="ElGridFieldLayout" :chrome="false">
						<ElTextInput
							:id="`line-${index}-description`"
							name="description"
							label="Item"
						/>
						<ElNumberInput
							:id="`line-${index}-quantity`"
							name="quantity"
							label="Quantity"
							:min="1"
						/>
						<ElNumberInput
							:id="`line-${index}-rate`"
							name="rate"
							label="Rate"
							:min="0"
							:step="50"
						/>
						<ElField
							:id="`line-${index}-total-field`"
							label="Line total"
							:html-for="`line-${index}-total`"
						>
							<output
								:id="`line-${index}-total`"
								class="flex h-10 items-center justify-end rounded-md border border-input bg-secondary/50 px-3 text-sm font-semibold text-foreground"
							>
								{{ money(lineTotal(item)) }}
							</output>
						</ElField>
					</ElField>
				</ElForm>
			</div>
		</div>

		<div class="flex justify-end">
			<div class="w-full max-w-xs space-y-2 text-sm">
				<div class="flex justify-between text-muted-foreground">
					<span>Subtotal</span>
					<span>{{ money(total) }}</span>
				</div>
				<div class="flex justify-between border-t border-border pt-3 text-lg font-semibold text-foreground">
					<span>Total</span>
					<span>{{ money(total) }}</span>
				</div>
			</div>
		</div>
	</ElForm>
</template>
