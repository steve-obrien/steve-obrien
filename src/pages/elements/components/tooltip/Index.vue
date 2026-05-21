<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import Demo from '../../_layout/Demo.vue';
import PropsTable from '../../_layout/PropsTable.vue';
import { ElTooltip, ElButton } from '../../lib/vue';

const usageVue = `<script setup>
import { ElTooltip, ElButton } from '@elements/vue';
<\/script>

<template>
  <ElTooltip text="Sync now (⌘+S)" placement="top">
    <ElButton variant="secondary">Save</ElButton>
  </ElTooltip>
</template>`;

const usageWeb = `<element-tooltip text="Save your changes" placement="top" delay="120">
  <button>Save</button>
</element-tooltip>`;

const props = [
	{ name: 'text', type: 'string', default: '—', description: 'Tooltip content.' },
	{ name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", description: 'Position relative to the trigger.' },
	{ name: 'delay', type: 'number', default: '120', description: 'Show delay in ms.' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage name="Tooltip" tagline="Lightweight, accessible tooltip wired through aria-describedby — fires on hover and focus." tag="<element-tooltip>">
			<DocSection eyebrow="Demo" title="Live preview">
				<Demo>
					<div class="flex flex-wrap items-center gap-6">
						<ElTooltip text="Save (⌘+S)" placement="top">
							<ElButton variant="secondary">Top</ElButton>
						</ElTooltip>
						<ElTooltip text="Open settings" placement="bottom">
							<ElButton variant="secondary">Bottom</ElButton>
						</ElTooltip>
						<ElTooltip text="Previous" placement="left">
							<ElButton variant="secondary">Left</ElButton>
						</ElTooltip>
						<ElTooltip text="Next" placement="right">
							<ElButton variant="secondary">Right</ElButton>
						</ElTooltip>
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
		</DocPage>
	</ElementsLayout>
</template>
