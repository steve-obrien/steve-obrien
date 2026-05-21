<script setup>
import { markRaw } from 'vue';
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DemoStudio from '../../_layout/inspector/DemoStudio.vue';
import { ElButton } from '../../lib/vue';

// Starter that exercises the full tree: nested containers, native HTML,
// library components, and an `<h2>` with mixed text + <span> children.
const initialSpec = {
	id: 'root',
	label: 'Section',
	component: 'div',
	props: { class: 'flex w-full items-center justify-center' },
	children: [
		{
			id: 'card',
			label: 'Card',
			component: 'div',
			props: { class: 'flex flex-col items-start gap-4 w-[380px] rounded-3xl border border-skin-border bg-skin-background p-7 shadow-xl shadow-black/10 ring-1 ring-black/[0.04]' },
			children: [
				{
					id: 'badge',
					label: 'Badge',
					component: 'span',
					props: { class: 'inline-flex w-fit rounded-full bg-skin-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-skin-inverse' },
					children: [{ text: 'Lifetime' }],
				},
				{
					id: 'title',
					label: 'Title',
					component: 'h2',
					props: { class: 'text-2xl font-bold tracking-tight text-skin-primary' },
					children: [
						{ text: 'Welcome to ' },
						{
							id: 'title-em',
							label: 'Emphasised span',
							component: 'span',
							props: { class: 'italic text-skin-primary underline decoration-skin-primary/30 underline-offset-4' },
							children: [{ text: 'Elements' }],
						},
					],
				},
				{
					id: 'price',
					label: 'Price',
					component: 'p',
					props: { class: 'text-sm text-skin-secondary' },
					children: [{ text: '$149 once · forever yours' }],
				},
				{
					id: 'cta',
					label: 'CTA',
					component: markRaw(ElButton),
					props: { variant: 'primary', size: 'md' },
					children: [{ text: 'Get access' }],
				},
			],
		},
	],
};
</script>

<template>
	<ElementsLayout :full-width="true">
		<section class="mb-4 flex flex-wrap items-end justify-between gap-3">
			<div>
				<p class="text-xs font-semibold uppercase tracking-[0.18em] text-skin-muted">Studio</p>
				<h1 class="mt-1 text-3xl font-bold tracking-tight text-skin-primary">Build · Inspect · Export · Rehydrate</h1>
				<p class="mt-1 max-w-2xl text-sm text-skin-secondary">
					Drag components from the palette onto the stage, edit any property — including Tailwind classes — and round-trip
					the result through JSON or HTML. Save the spec, load it back with
					<code class="rounded-md bg-skin-surface px-1.5 py-0.5 text-[12px] font-mono ring-1 ring-skin-border">&lt;ElRenderer&gt;</code>.
				</p>
			</div>
		</section>

		<DemoStudio :initial-spec="initialSpec" title="Studio" />
	</ElementsLayout>
</template>
