<script setup>
import { ElButton, ElCard, ElNativeSelect } from '../../../lib/vue';

const folders = ['Inbox', 'VIP', 'Sent', 'Archive', 'Trash'];
const messages = [
	{ from: 'Maya Patel', subject: 'Design review notes', preview: 'The glass card treatment is feeling much more coherent now.', unread: true },
	{ from: 'Alex Morgan', subject: 'Invoice ready', preview: 'I have attached the final version for May.', unread: false },
	{ from: 'Product Ops', subject: 'Weekly metrics', preview: 'Conversion has improved across the onboarding funnel.', unread: false },
];
</script>

<template>
	<div class="grid w-full overflow-hidden rounded-3xl border border-border bg-background shadow-2xl shadow-black/10 lg:grid-cols-[12rem_20rem_1fr]">
		<aside class="hidden border-r border-border bg-card p-3 lg:block">
			<ElButton class="w-full justify-start">
				<svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path d="M4 20h16M5 16l10.5-10.5 3 3L8 19H5v-3Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				Compose
			</ElButton>
			<nav class="mt-5 space-y-1">
				<button
					v-for="folder in folders"
					:key="folder"
					class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition first:bg-secondary first:text-secondary-foreground hover:bg-secondary"
				>
					<span>{{ folder }}</span>
					<span v-if="folder === 'Inbox'" class="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">12</span>
				</button>
			</nav>
		</aside>

		<section class="border-r border-border">
			<header class="border-b border-border bg-card/70 p-4 backdrop-blur">
				<div class="flex items-center justify-between gap-3">
					<h3 class="font-semibold tracking-tight">Inbox</h3>
					<ElNativeSelect
						model-value="all"
						:options="[{ label: 'All', value: 'all' }, { label: 'Unread', value: 'unread' }]"
						class="w-32"
					/>
				</div>
			</header>
			<div class="divide-y divide-border">
				<button
					v-for="message in messages"
					:key="message.subject"
					class="block w-full bg-background p-4 text-left transition first:bg-secondary/60 hover:bg-secondary"
				>
					<div class="flex items-start justify-between gap-3">
						<p class="text-sm font-semibold">{{ message.from }}</p>
						<span v-if="message.unread" class="mt-1 size-2 rounded-full bg-primary"></span>
					</div>
					<p class="mt-1 text-sm font-medium">{{ message.subject }}</p>
					<p class="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">{{ message.preview }}</p>
				</button>
			</div>
		</section>

		<main class="min-h-[34rem] p-5">
			<ElCard padding="lg" class="h-full">
				<div class="flex h-full flex-col">
					<div class="border-b border-border pb-5">
						<p class="text-sm text-muted-foreground">From Maya Patel</p>
						<h3 class="mt-2 text-2xl font-semibold tracking-tight">Design review notes</h3>
					</div>
					<div class="flex-1 space-y-4 py-6 text-sm leading-7 text-muted-foreground">
						<p>Steve, the overall direction is much clearer. The card primitive gives the dashboard and mail examples a better base to build from.</p>
						<p>I would keep the app blocks as recipes, then promote only the parts that repeat into real components.</p>
					</div>
					<div class="flex flex-wrap gap-2 border-t border-border pt-5">
						<ElButton size="sm">Reply</ElButton>
						<ElButton variant="secondary" size="sm">Archive</ElButton>
					</div>
				</div>
			</ElCard>
		</main>
	</div>
</template>
