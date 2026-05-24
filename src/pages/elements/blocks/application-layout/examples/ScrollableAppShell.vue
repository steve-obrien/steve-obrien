<script setup>
import { ElButton, ElCard, ElDropdown, ElNativeSelect } from '../../../lib/vue';

const sections = [
	'Overview',
	'Customers',
	'Projects',
	'Tasks',
	'Automations',
	'Reports',
	'Billing',
	'Settings',
	'Integrations',
	'Audit log',
	'API keys',
	'Team access',
	'Data exports',
	'Notifications',
];

const activity = [
	{ title: 'Updated project brief', meta: '2 minutes ago', body: 'Maya added launch copy and attached the revised screenshots.' },
	{ title: 'New customer segment', meta: '18 minutes ago', body: 'The growth team saved a high-intent audience for the onboarding campaign.' },
	{ title: 'Automation completed', meta: '43 minutes ago', body: 'Weekly account health checks finished with 4 accounts marked for review.' },
	{ title: 'Invoice approved', meta: '1 hour ago', body: 'Finance approved the May implementation invoice and archived the draft.' },
	{ title: 'Permissions changed', meta: '3 hours ago', body: 'Alex moved the contractors group to read-only access for production data.' },
	{ title: 'Report generated', meta: 'Yesterday', body: 'The monthly product usage report is ready for review.' },
];
</script>

<template>
	<div class="grid h-[38rem] w-full overflow-hidden rounded-3xl border border-border bg-background shadow-2xl shadow-black/10 lg:grid-cols-[16rem_minmax(0,1fr)]">
		<aside class="flex min-h-0 flex-col border-r border-border bg-card">
			<div class="shrink-0 border-b border-border p-4">
				<div class="flex items-center gap-3">
					<span class="grid size-9 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">A</span>
					<div class="min-w-0">
						<p class="truncate text-sm font-semibold text-foreground">Atlas Studio</p>
						<p class="truncate text-xs text-muted-foreground">Product workspace</p>
					</div>
				</div>
				<ElButton class="mt-4 w-full justify-start" size="sm">
					<svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
					</svg>
					New project
				</ElButton>
			</div>

			<nav class="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
				<button
					v-for="section in sections"
					:key="section"
					type="button"
					class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-muted-foreground transition first:bg-secondary first:text-secondary-foreground hover:bg-secondary hover:text-foreground"
				>
					<span class="truncate">{{ section }}</span>
					<span v-if="section === 'Tasks'" class="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">8</span>
				</button>
			</nav>

			<div class="shrink-0 border-t border-border p-3">
				<ElDropdown
					class="w-full"
					label="Steve O'Brien"
					:items="[
						{ label: 'Account settings', value: 'account' },
						{ label: 'Theme preferences', value: 'theme' },
						{ label: 'Sign out', value: 'sign-out' },
					]"
				/>
			</div>
		</aside>

		<main class="min-h-0 overflow-y-auto">
			<header class="sticky top-0 z-10 border-b border-border bg-background/85 p-5 backdrop-blur">
				<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Workspace</p>
						<h3 class="mt-1 text-2xl font-semibold tracking-tight text-foreground">Customer health</h3>
					</div>
					<div class="flex flex-wrap gap-2">
						<ElNativeSelect
							model-value="30"
							:options="[
								{ label: 'Last 7 days', value: '7' },
								{ label: 'Last 30 days', value: '30' },
								{ label: 'Last quarter', value: 'quarter' },
							]"
							class="w-40"
						/>
						<ElButton variant="secondary" size="sm">Export</ElButton>
					</div>
				</div>
			</header>

			<div class="space-y-5 p-5">
				<div class="grid gap-4 md:grid-cols-3">
					<ElCard v-for="metric in ['Active accounts', 'At risk', 'Expansion']" :key="metric" padding="md">
						<p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{{ metric }}</p>
						<p class="mt-3 text-3xl font-semibold tracking-tight text-foreground">
							{{ metric === 'At risk' ? '12' : metric === 'Expansion' ? '$42k' : '248' }}
						</p>
					</ElCard>
				</div>

				<ElCard padding="none" class="overflow-hidden">
					<div class="border-b border-border p-4">
						<h4 class="font-semibold tracking-tight text-foreground">Activity feed</h4>
						<p class="mt-1 text-sm text-muted-foreground">The main panel scrolls independently from the left navigation.</p>
					</div>
					<div class="divide-y divide-border">
						<article v-for="item in activity" :key="item.title" class="p-4">
							<div class="flex items-start justify-between gap-4">
								<div>
									<h5 class="text-sm font-semibold text-foreground">{{ item.title }}</h5>
									<p class="mt-1 text-sm leading-6 text-muted-foreground">{{ item.body }}</p>
								</div>
								<span class="shrink-0 text-xs text-muted-foreground">{{ item.meta }}</span>
							</div>
						</article>
					</div>
				</ElCard>

				<ElCard padding="lg">
					<h4 class="text-lg font-semibold tracking-tight text-foreground">Detail section</h4>
					<p class="mt-3 text-sm leading-6 text-muted-foreground">
						This lower content exists to prove the layout can keep a persistent left rail while the working area continues scrolling through detailed content, tables, forms, or editor panels.
					</p>
				</ElCard>
			</div>
		</main>
	</div>
</template>
