<script setup>
import { markRaw, ref } from 'vue';
import InspectorLayout from '../../_layout/InspectorLayout.vue';
import Studio from '../../_layout/inspector/Studio.vue';
import {
	ElButton,
	ElCard,
	ElCheckbox,
	ElField,
	ElNativeSelect,
	ElSelectInput,
	ElTextInput,
	ElTextareaInput,
} from '../../lib/vue';

const activeExample = ref('markup');

const examples = [
	{ key: 'markup', label: 'Slot markup' },
	{ key: 'spec', label: 'Initial spec' },
];

const dateRangeOptions = [
	{ label: 'Today', value: 'today' },
	{ label: 'This week', value: 'week' },
	{ label: 'This month', value: 'month' },
];

const audienceOptions = [
	{ label: 'Trial users', value: 'trial' },
	{ label: 'Active customers', value: 'active' },
	{ label: 'Enterprise leads', value: 'enterprise' },
];

const taskRows = [
	['Draft campaign brief', 'Content', 'Today'],
	['Review audience filters', 'Growth', 'Tomorrow'],
	['Approve hero artwork', 'Design', 'Friday'],
];

const initialSpec = {
	id: 'root',
	label: 'Dashboard app',
	component: 'div',
	props: { class: 'min-w-[920px] w-full rounded-3xl border border-border bg-background text-foreground shadow-2xl shadow-black/10 overflow-hidden' },
	children: [
		{
			id: 'app-shell',
			label: 'App shell',
			component: 'div',
			props: { class: 'grid min-h-[620px] grid-cols-[220px_1fr]' },
			children: [
				{
					id: 'sidebar',
					label: 'Sidebar',
					component: 'aside',
					props: { class: 'flex flex-col border-r border-border bg-card p-4 text-card-foreground' },
					children: [
						{
							id: 'brand',
							label: 'Brand row',
							component: 'div',
							props: { class: 'flex items-center gap-2 px-2' },
							children: [
								{
									id: 'brand-mark',
									label: 'Brand mark',
									component: 'span',
									props: { class: 'grid size-8 place-items-center rounded-xl bg-primary text-xs font-bold text-primary-foreground' },
									children: [{ text: 'E' }],
								},
								{
									id: 'brand-name',
									label: 'Brand name',
									component: 'span',
									props: { class: 'font-semibold tracking-tight' },
									children: [{ text: 'Elements CRM' }],
								},
							],
						},
						{
							id: 'nav',
							label: 'Navigation',
							component: 'div',
							props: { class: 'mt-8 space-y-1' },
							children: [
								{
									id: 'nav-overview',
									label: 'Active nav item',
									component: 'button',
									props: { class: 'flex w-full items-center rounded-xl bg-secondary px-3 py-2 text-left text-sm font-medium text-secondary-foreground' },
									children: [{ text: 'Overview' }],
								},
								{
									id: 'nav-customers',
									label: 'Nav item',
									component: 'button',
									props: { class: 'flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-secondary' },
									children: [{ text: 'Customers' }],
								},
								{
									id: 'nav-reports',
									label: 'Nav item',
									component: 'button',
									props: { class: 'flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-secondary' },
									children: [{ text: 'Reports' }],
								},
							],
						},
						{
							id: 'account',
							label: 'Account card',
							component: 'div',
							props: { class: 'mt-auto rounded-2xl border border-border bg-background p-3' },
							children: [
								{
									id: 'account-name',
									label: 'Account name',
									component: 'p',
									props: { class: 'text-sm font-medium' },
									children: [{ text: "Steve O'Brien" }],
								},
								{
									id: 'account-plan',
									label: 'Account plan',
									component: 'p',
									props: { class: 'mt-1 text-xs text-muted-foreground' },
									children: [{ text: 'Admin - Pro workspace' }],
								},
							],
						},
					],
				},
				{
					id: 'main',
					label: 'Main content',
					component: 'main',
					props: { class: 'min-w-0 bg-background' },
					children: [
						{
							id: 'toolbar',
							label: 'Toolbar',
							component: 'header',
							props: { class: 'flex items-center justify-between border-b border-border bg-card/70 px-6 py-4 backdrop-blur' },
							children: [
								{
									id: 'heading-group',
									label: 'Heading group',
									component: 'div',
									props: {},
									children: [
										{
											id: 'eyebrow',
											label: 'Eyebrow',
											component: 'p',
											props: { class: 'text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground' },
											children: [{ text: 'Dashboard' }],
										},
										{
											id: 'page-title',
											label: 'Page title',
											component: 'h2',
											props: { class: 'mt-1 text-2xl font-semibold tracking-tight' },
											children: [{ text: 'Revenue overview' }],
										},
									],
								},
								{
									id: 'toolbar-actions',
									label: 'Toolbar actions',
									component: 'div',
									props: { class: 'flex items-center gap-2' },
									children: [
										{
											id: 'range',
											label: 'Date range select',
											component: markRaw(ElNativeSelect),
											props: {
												modelValue: '30',
												options: [
													{ label: 'Last 30 days', value: '30' },
													{ label: 'Last quarter', value: 'quarter' },
												],
												class: 'w-40',
											},
										},
										{
											id: 'export',
											label: 'Export button',
											component: markRaw(ElButton),
											props: { variant: 'secondary', size: 'md' },
											children: [{ text: 'Export' }],
										},
									],
								},
							],
						},
						{
							id: 'content',
							label: 'Content grid',
							component: 'div',
							props: { class: 'space-y-5 p-6' },
							children: [
								{
									id: 'metrics',
									label: 'Metrics',
									component: 'div',
									props: { class: 'grid grid-cols-3 gap-4' },
									children: [
										metricCard('metric-revenue', 'Revenue', 'GBP 42,860', '+12.4%'),
										metricCard('metric-customers', 'Customers', '1,284', '+8.1%'),
										metricCard('metric-conversion', 'Conversion', '7.8%', '+1.2%'),
									],
								},
								{
									id: 'chart-card',
									label: 'Chart card',
									component: markRaw(ElCard),
									props: { padding: 'lg', glass: true },
									children: [
										{
											id: 'chart-header',
											label: 'Chart header',
											component: 'div',
											props: { class: 'flex items-start justify-between gap-4' },
											children: [
												{
													id: 'chart-title-wrap',
													label: 'Chart title group',
													component: 'div',
													props: {},
													children: [
														{
															id: 'chart-title',
															label: 'Chart title',
															component: 'h3',
															props: { class: 'font-semibold tracking-tight' },
															children: [{ text: 'Revenue trend' }],
														},
														{
															id: 'chart-copy',
															label: 'Chart copy',
															component: 'p',
															props: { class: 'mt-1 text-sm text-muted-foreground' },
															children: [{ text: 'A token-driven app surface ready to edit.' }],
														},
													],
												},
												{
													id: 'status-badge',
													label: 'Status badge',
													component: 'span',
													props: { class: 'rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success' },
													children: [{ text: 'Healthy' }],
												},
											],
										},
										{
											id: 'chart',
											label: 'Bar chart',
											component: 'div',
											props: { class: 'mt-8 grid h-48 grid-cols-12 items-end gap-2' },
											children: [42, 54, 38, 76, 68, 92, 88, 112, 96, 124, 132, 146].map((height, index) => ({
												id: `bar-${index}`,
												label: `Bar ${index + 1}`,
												component: 'span',
												props: { class: 'rounded-t-lg bg-primary/80', style: `height: ${height}px` },
											})),
										},
									],
								},
							],
						},
					],
				},
			],
		},
	],
};

function metricCard(id, label, value, change) {
	return {
		id,
		label,
		component: markRaw(ElCard),
		props: { padding: 'md', glass: true },
		children: [
			{
				id: `${id}-label`,
				label: `${label} label`,
				component: 'p',
				props: { class: 'text-sm text-muted-foreground' },
				children: [{ text: label }],
			},
			{
				id: `${id}-row`,
				label: `${label} row`,
				component: 'div',
				props: { class: 'mt-3 flex items-end justify-between gap-4' },
				children: [
					{
						id: `${id}-value`,
						label: `${label} value`,
						component: 'p',
						props: { class: 'text-2xl font-semibold tracking-tight' },
						children: [{ text: value }],
					},
					{
						id: `${id}-change`,
						label: `${label} change`,
						component: 'span',
						props: { class: 'rounded-full bg-success/15 px-2 py-1 text-xs font-medium text-success' },
						children: [{ text: change }],
					},
				],
			},
		],
	};
}
</script>

<template>
	<InspectorLayout>
		<div class="flex min-h-0 flex-1 flex-col">
			<div class="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 py-2 text-card-foreground">
				<div class="min-w-0">
					<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Examples</p>
					<p class="truncate text-sm font-medium">Convert Vue markup into editable Studio layers</p>
				</div>
				<div class="flex shrink-0 items-center gap-1 rounded-lg bg-secondary p-1">
					<button
						v-for="example in examples"
						:key="example.key"
						type="button"
						class="h-8 rounded-md px-3 text-xs font-medium transition"
						:class="activeExample === example.key
							? 'bg-background text-foreground shadow-sm ring-1 ring-border'
							: 'text-muted-foreground hover:text-foreground'"
						@click="activeExample = example.key"
					>{{ example.label }}</button>
				</div>
			</div>

			<Studio
				v-if="activeExample === 'markup'"
				title="Slot markup - converted to editable Studio structure"
			>
				<div class="min-w-[1040px] overflow-hidden rounded-3xl border border-border bg-background text-foreground shadow-2xl shadow-black/10">
					<div class="grid min-h-[680px] grid-cols-[248px_1fr]">
						<aside class="flex flex-col border-r border-border bg-card p-4 text-card-foreground">
							<div class="flex items-center gap-3 px-2">
								<span class="grid size-9 place-items-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">A</span>
								<div>
									<p class="text-sm font-semibold tracking-tight">Atlas Studio</p>
									<p class="text-xs text-muted-foreground">Campaign operations</p>
								</div>
							</div>

							<nav class="mt-8 space-y-1">
								<button class="flex w-full items-center justify-between rounded-xl bg-secondary px-3 py-2 text-left text-sm font-medium text-secondary-foreground">
									<span>Command center</span>
									<span class="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">12</span>
								</button>
								<button class="flex w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-secondary">Campaigns</button>
								<button class="flex w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-secondary">Audience</button>
								<button class="flex w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-secondary">Automations</button>
							</nav>

							<ElCard padding="md" glass class="mt-auto">
								<p class="text-sm font-semibold tracking-tight">Launch readiness</p>
								<div class="mt-4 space-y-3">
									<div class="flex items-center justify-between text-xs">
										<span class="text-muted-foreground">Content</span>
										<span class="font-medium">84%</span>
									</div>
									<div class="h-2 overflow-hidden rounded-full bg-secondary">
										<span class="block h-full w-[84%] rounded-full bg-primary"></span>
									</div>
									<p class="text-xs leading-5 text-muted-foreground">Three approvals remain before the spring launch can ship.</p>
								</div>
							</ElCard>
						</aside>

						<main class="min-w-0 bg-background">
							<header class="flex items-center justify-between gap-4 border-b border-border bg-card/70 px-6 py-4 backdrop-blur">
								<div>
									<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Workspace</p>
									<h2 class="mt-1 text-2xl font-semibold tracking-tight">Spring launch planner</h2>
								</div>
								<div class="flex items-center gap-2">
									<ElNativeSelect
										model-value="today"
										:options="dateRangeOptions"
										class="w-40"
									/>
									<ElButton variant="secondary" size="md">Share</ElButton>
									<ElButton size="md">Publish</ElButton>
								</div>
							</header>

							<section class="space-y-5 p-6">
								<div class="grid grid-cols-3 gap-4">
									<ElCard padding="md" glass>
										<p class="text-sm text-muted-foreground">Pipeline value</p>
										<div class="mt-3 flex items-end justify-between gap-4">
											<p class="text-2xl font-semibold tracking-tight">GBP 128k</p>
											<span class="rounded-full bg-success/15 px-2 py-1 text-xs font-medium text-success">+18%</span>
										</div>
									</ElCard>
									<ElCard padding="md" glass>
										<p class="text-sm text-muted-foreground">Tasks ready</p>
										<div class="mt-3 flex items-end justify-between gap-4">
											<p class="text-2xl font-semibold tracking-tight">24</p>
											<span class="rounded-full bg-primary/15 px-2 py-1 text-xs font-medium text-primary">6 new</span>
										</div>
									</ElCard>
									<ElCard padding="md" glass>
										<p class="text-sm text-muted-foreground">Audience reach</p>
										<div class="mt-3 flex items-end justify-between gap-4">
											<p class="text-2xl font-semibold tracking-tight">48.2k</p>
											<span class="rounded-full bg-success/15 px-2 py-1 text-xs font-medium text-success">Healthy</span>
										</div>
									</ElCard>
								</div>

								<div class="grid grid-cols-[1.4fr_0.9fr] gap-5">
									<ElCard padding="lg" glass>
										<div class="flex items-start justify-between gap-4">
											<div>
												<h3 class="font-semibold tracking-tight">Launch tasks</h3>
												<p class="mt-1 text-sm text-muted-foreground">Authored as normal Vue markup, then converted into Studio layers.</p>
											</div>
											<ElButton variant="ghost" size="sm">Add task</ElButton>
										</div>
										<div class="mt-6 overflow-hidden rounded-2xl border border-border">
											<div
												v-for="task in taskRows"
												:key="task[0]"
												class="grid grid-cols-[1fr_120px_96px] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
											>
												<p class="truncate text-sm font-medium">{{ task[0] }}</p>
												<span class="text-xs text-muted-foreground">{{ task[1] }}</span>
												<span class="justify-self-end rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">{{ task[2] }}</span>
											</div>
										</div>
									</ElCard>

									<ElCard padding="lg" glass>
										<h3 class="font-semibold tracking-tight">Campaign brief</h3>
										<div class="mt-5 space-y-4">
											<ElTextInput
												label="Campaign name"
												model-value="Spring product launch"
												placeholder="Name this campaign"
											/>
											<ElSelectInput
												label="Audience"
												model-value="active"
												:options="audienceOptions"
											/>
											<ElTextareaInput
												label="Positioning"
												model-value="Help teams move from rough idea to approved launch plan without losing context."
												:rows="4"
											/>
											<ElField label="Checks">
												<div class="space-y-2 rounded-2xl border border-border bg-background p-3">
													<ElCheckbox label="Budget approved" :model-value="true" />
													<ElCheckbox label="Legal review booked" />
													<ElCheckbox label="Analytics dashboard ready" :model-value="true" />
												</div>
											</ElField>
										</div>
									</ElCard>
								</div>
							</section>
						</main>
					</div>
				</div>
			</Studio>

			<Studio
				v-else
				:initial-spec="initialSpec"
				title="Build - Inspect - Export - Rehydrate"
			/>
		</div>
	</InspectorLayout>
</template>
