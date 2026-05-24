<script setup>
import { markRaw } from 'vue';
import InspectorLayout from '../../_layout/InspectorLayout.vue';
import Studio from '../../_layout/inspector/Studio.vue';
import { ElButton, ElCard, ElNativeSelect } from '../../lib/vue';

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
		<Studio :initial-spec="initialSpec" title="Build - Inspect - Export - Rehydrate" />
	</InspectorLayout>
</template>
