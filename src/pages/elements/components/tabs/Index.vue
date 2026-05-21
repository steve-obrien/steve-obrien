<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import Demo from '../../_layout/Demo.vue';
import PropsTable from '../../_layout/PropsTable.vue';
import { ElTabs } from '../../lib/vue';
import { ref } from 'vue';

const active = ref('overview');
const tabs = [
	{ key: 'overview', label: 'Overview' },
	{ key: 'pricing', label: 'Pricing' },
	{ key: 'changelog', label: 'Changelog' },
];

const usageVue = `<script setup>
import { ElTabs } from '@elements/vue';
import { ref } from 'vue';
const active = ref('overview');
const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'pricing',  label: 'Pricing' },
];
<\/script>

<template>
  <ElTabs v-model="active" :tabs="tabs">
    <template #overview>Overview content…</template>
    <template #pricing>Pricing content…</template>
  </ElTabs>
</template>`;

const usageWeb = `<element-tabs value="overview">
  <div role="tablist">
    <button data-tab="overview">Overview</button>
    <button data-tab="pricing">Pricing</button>
  </div>
  <div data-panel="overview">Overview…</div>
  <div data-panel="pricing">Pricing…</div>
</element-tabs>`;

const props = [
	{ name: 'v-model', type: 'string', default: 'first tab key', description: 'Active tab key.' },
	{ name: 'tabs', type: 'Array<{ key, label }>', default: '—', description: 'Tabs to render.' },
];
const keys = [
	{ k: '← / →', d: 'Move to previous / next tab.' },
	{ k: 'Home / End', d: 'Jump to first / last tab.' },
	{ k: 'Enter / Space', d: 'Activate focused tab.' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage name="Tabs" tagline="Roving-tabindex tab list with managed ARIA, keyboard navigation, and panel linking." tag="<element-tabs>">
			<DocSection eyebrow="Demo" title="Live preview">
				<Demo>
					<div class="w-full max-w-md">
						<ElTabs v-model="active" :tabs="tabs">
							<template #overview>
								<div class="rounded-xl border border-skin-border bg-skin-background p-5 text-sm text-skin-secondary">Overview content. Tabs preserve focus and announce panel changes to assistive tech.</div>
							</template>
							<template #pricing>
								<div class="rounded-xl border border-skin-border bg-skin-background p-5 text-sm text-skin-secondary">Pricing content. Use the arrow keys to move between tabs.</div>
							</template>
							<template #changelog>
								<div class="rounded-xl border border-skin-border bg-skin-background p-5 text-sm text-skin-secondary">Changelog content. Each panel is keyboard-reachable.</div>
							</template>
						</ElTabs>
					</div>
				</Demo>
			</DocSection>

			<DocSection eyebrow="Usage" title="Vue">
				<CodeBlock :code="usageVue" lang="vue" />
			</DocSection>

			<DocSection eyebrow="Usage" title="Web component">
				<CodeBlock :code="usageWeb" lang="html" />
			</DocSection>

			<DocSection title="Props">
				<PropsTable :rows="props" />
			</DocSection>

			<DocSection title="Keyboard">
				<ul class="space-y-2 rounded-2xl border border-skin-border bg-skin-surface/40 p-5 text-sm">
					<li v-for="row in keys" :key="row.k" class="flex items-start gap-4">
						<kbd class="rounded bg-skin-background px-2 py-0.5 font-mono text-xs ring-1 ring-skin-border">{{ row.k }}</kbd>
						<span class="text-skin-secondary">{{ row.d }}</span>
					</li>
				</ul>
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
