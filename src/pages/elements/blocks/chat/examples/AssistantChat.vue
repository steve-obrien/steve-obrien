<script setup>
import { ElButton, ElCard } from '../../../lib/vue';

const threads = ['Design system cleanup', 'Launch plan', 'SQL report helper'];
const messages = [
	{ role: 'user', text: 'Can you turn these primitives into a dashboard starter?' },
	{ role: 'assistant', text: 'Yes. I would keep the block composable: sidebar, account dropdown, cards, and a calm data area.' },
	{ role: 'user', text: 'Keep it close to the library style.' },
];
</script>

<template>
	<div class="grid w-full overflow-hidden rounded-3xl border border-border bg-background shadow-2xl shadow-black/10 md:grid-cols-[15rem_1fr]">
		<aside class="hidden border-r border-border bg-card p-3 md:block">
			<ElButton variant="secondary" class="w-full justify-start">
				<svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
				</svg>
				New chat
			</ElButton>
			<nav class="mt-4 space-y-1">
				<button
					v-for="thread in threads"
					:key="thread"
					class="w-full truncate rounded-xl px-3 py-2 text-left text-sm text-muted-foreground transition first:bg-secondary first:text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground"
				>
					{{ thread }}
				</button>
			</nav>
		</aside>

		<section class="flex min-h-[34rem] flex-col">
			<header class="flex items-center justify-between border-b border-border bg-card/70 px-5 py-4 backdrop-blur">
				<div>
					<p class="text-sm font-semibold">Elements Assistant</p>
					<p class="text-xs text-muted-foreground">Application UI block</p>
				</div>
				<span class="rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">Online</span>
			</header>

			<div class="flex-1 space-y-5 overflow-auto p-5">
				<div
					v-for="message in messages"
					:key="message.text"
					class="flex"
					:class="message.role === 'user' ? 'justify-end' : 'justify-start'"
				>
					<ElCard
						:glass="message.role !== 'user'"
						padding="sm"
						class="max-w-[28rem]"
						:class="message.role === 'user' ? 'bg-primary text-primary-foreground' : ''"
					>
						<p class="text-sm leading-6">{{ message.text }}</p>
					</ElCard>
				</div>
			</div>

			<footer class="border-t border-border bg-card/70 p-4">
				<div class="rounded-2xl border border-input bg-background p-2 shadow-sm">
					<textarea
						rows="3"
						class="block w-full resize-none bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
						placeholder="Ask anything..."
					></textarea>
					<div class="flex items-center justify-between">
						<div class="flex gap-1 text-muted-foreground">
							<button class="grid size-8 place-items-center rounded-lg hover:bg-secondary" type="button" aria-label="Attach file">
								<svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
									<path d="M8 12.5l5.8-5.8a3.2 3.2 0 0 1 4.5 4.5l-7 7a5 5 0 0 1-7.1-7.1l6.8-6.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
							</button>
						</div>
						<ElButton size="sm">Send</ElButton>
					</div>
				</div>
			</footer>
		</section>
	</div>
</template>
