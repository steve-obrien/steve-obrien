<script setup>
import { ElButton, ElCard, ElDropdown, ElNativeSelect } from '../../../lib/vue';

const accountItems = [
	{ label: 'Account settings', value: 'settings' },
	{ label: 'Billing', value: 'billing' },
	{ separator: true },
	{ label: 'Sign out', value: 'sign-out', tone: 'danger' },
];

const navItems = [
	['Overview', 'M8 13h8M8 17h5M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z'],
	['Customers', 'M16 11a4 4 0 1 0-8 0M4 21a8 8 0 0 1 16 0'],
	['Revenue', 'M4 17l5-5 4 4 7-8M4 21h16'],
	['Reports', 'M7 3h7l4 4v14H7V3ZM14 3v5h5'],
];

const metrics = [
	{ label: 'Revenue', value: 'GBP 42,860', change: '+12.4%' },
	{ label: 'Customers', value: '1,284', change: '+8.1%' },
	{ label: 'Conversion', value: '7.8%', change: '+1.2%' },
];
</script>

<template>
	<div class="w-full overflow-hidden rounded-3xl border border-border bg-background text-foreground shadow-2xl shadow-black/10">
		<div class="grid min-h-[34rem] md:grid-cols-[15rem_1fr]">
			<aside class="hidden border-r border-border bg-card p-4 text-card-foreground md:block">
				<div class="flex items-center gap-2 px-2">
					<span class="grid size-8 place-items-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">E</span>
					<span class="font-semibold tracking-tight">Elements CRM</span>
				</div>
				<nav class="mt-8 space-y-1">
					<button
						v-for="[label, path] in navItems"
						:key="label"
						class="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition first:bg-secondary first:text-secondary-foreground hover:bg-secondary"
					>
						<svg class="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path :d="path" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
						{{ label }}
					</button>
				</nav>
			</aside>

			<main class="min-w-0">
				<header class="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/70 px-5 py-4 backdrop-blur">
					<div>
						<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Dashboard</p>
						<h3 class="mt-1 text-xl font-semibold tracking-tight">Good morning, Steve</h3>
					</div>
					<div class="flex items-center gap-2">
						<ElNativeSelect
							model-value="30"
							:options="[{ label: 'Last 30 days', value: '30' }, { label: 'Last quarter', value: 'quarter' }]"
							class="hidden w-40 sm:block"
						/>
						<ElDropdown :items="accountItems" align="right" width="min-w-56">
							<template #trigger>
								<img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80" alt="" class="size-6 rounded-full object-cover" />
								<span>Steve</span>
							</template>
						</ElDropdown>
					</div>
				</header>

				<div class="space-y-4 p-5">
					<div class="grid gap-4 lg:grid-cols-3">
						<ElCard v-for="metric in metrics" :key="metric.label">
							<p class="text-sm text-muted-foreground">{{ metric.label }}</p>
							<div class="mt-3 flex items-end justify-between gap-4">
								<p class="text-2xl font-semibold tracking-tight">{{ metric.value }}</p>
								<span class="rounded-full bg-success/15 px-2 py-1 text-xs font-medium text-success">{{ metric.change }}</span>
							</div>
						</ElCard>
					</div>

					<ElCard padding="lg">
						<div class="flex flex-wrap items-start justify-between gap-4">
							<div>
								<h4 class="font-semibold tracking-tight">Revenue trend</h4>
								<p class="mt-1 text-sm text-muted-foreground">Semantic tokens keep the chart calm and readable.</p>
							</div>
							<ElButton variant="secondary" size="sm">Export</ElButton>
						</div>
						<div class="mt-8 grid h-40 grid-cols-12 items-end gap-2">
							<span v-for="height in [42, 54, 38, 76, 68, 92, 88, 112, 96, 124, 132, 146]" :key="height" class="rounded-t-lg bg-primary/80" :style="{ height: `${height}px` }"></span>
						</div>
					</ElCard>
				</div>
			</main>
		</div>
	</div>
</template>
