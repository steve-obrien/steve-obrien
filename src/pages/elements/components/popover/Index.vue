<script setup>
import { ref } from 'vue';
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import Demo from '../../_layout/Demo.vue';
import PropsTable from '../../_layout/PropsTable.vue';
import { ElPopover, ElButton, ElBooleanInput } from '../../lib/vue';

const notifications = ref(true);
const digest = ref(false);
const sound = ref(true);

const usageVue = `<script setup>
import { ElPopover } from '@elements/vue';
<\/script>

<template>
  <ElPopover align="right" label="Notifications">
    <h3>You're all caught up</h3>
    <p>No new alerts in the last 24 hours.</p>
  </ElPopover>
</template>`;

const usageSlots = `<template>
  <ElPopover align="right">
    <template #trigger>
      <span class="flex items-center gap-2">
        <BellIcon class="size-4" />
        Notifications
      </span>
    </template>

    <h3>Notification settings</h3>
    <ElBooleanInput v-model="email" label="Email digest" />
    <ElBooleanInput v-model="push"  label="Push alerts" />
  </ElPopover>
</template>`;

const usageWeb = `<element-popover>
  <button slot="trigger">Open</button>
  <div slot="panel">
    <h3>Pop me</h3>
    <p>Native popover API under the hood.</p>
  </div>
</element-popover>`;

const props = [
	{ name: 'align', type: "'left' | 'right' | 'center'", default: "'left'", description: 'Horizontal anchor relative to the trigger.' },
	{ name: 'offset', type: 'number', default: '8', description: 'Gap in pixels between the trigger and the popover.' },
	{ name: 'width', type: 'string', default: "'min-w-[14rem] max-w-[20rem]'", description: 'Tailwind width utilities for the panel.' },
	{ name: 'label', type: 'string', default: "'More'", description: 'Trigger label (use the #trigger slot for richer content).' },
];

const slots = [
	{ name: '#trigger', type: 'slot', default: 'label prop', description: 'Replaces the inner content of the trigger button.' },
	{ name: 'default', type: 'slot', default: '—', description: 'Popover body content.' },
];

const keys = [
	{ k: 'Click trigger', d: 'Toggles the popover.' },
	{ k: 'Click outside', d: 'Light-dismiss via the native popover API.' },
	{ k: 'Esc', d: 'Closes the popover (native).' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Popover"
			tagline="A floating panel anchored to a trigger. Built on the HTML Popover API so it sits in the top layer — no parent overflow, transform, or z-index can clip it."
			tag="<element-popover>"
		>
			<DocSection eyebrow="Demo" title="Live preview">
				<Demo>
					<div class="flex flex-wrap items-center gap-4">
						<ElPopover label="Quick facts" align="left">
							<h3 class="text-sm font-semibold tracking-tight text-skin-primary">Pay once. Use forever.</h3>
							<p class="mt-2 text-skin-secondary">
								Elements is licensed for life. Every component you see ships with the headless layer + a Vue wrapper.
							</p>
						</ElPopover>

						<ElPopover label="Notifications" align="center" width="min-w-[18rem]">
							<h3 class="text-sm font-semibold tracking-tight text-skin-primary">Notification preferences</h3>
							<div class="mt-3 space-y-3">
								<ElBooleanInput v-model="notifications" label="Push notifications" description="Alerts in the menu bar." />
								<ElBooleanInput v-model="digest" label="Weekly digest" description="Sent Mondays at 8am local time." />
								<ElBooleanInput v-model="sound" label="Play sound" />
							</div>
						</ElPopover>

						<ElPopover label="Actions ▾" align="right">
							<div class="flex flex-col gap-1">
								<button class="rounded-md px-2 py-1.5 text-left text-sm text-skin-primary hover:bg-skin-surface">Rename</button>
								<button class="rounded-md px-2 py-1.5 text-left text-sm text-skin-primary hover:bg-skin-surface">Duplicate</button>
								<button class="rounded-md px-2 py-1.5 text-left text-sm text-skin-primary hover:bg-skin-surface">Move to…</button>
								<hr class="my-1 border-t border-skin-border" />
								<button class="rounded-md px-2 py-1.5 text-left text-sm text-red-500 hover:bg-red-500/10">Delete</button>
							</div>
						</ElPopover>
					</div>
				</Demo>
			</DocSection>

			<DocSection eyebrow="Usage" title="Vue">
				<CodeBlock :code="usageVue" lang="vue" />
			</DocSection>

			<DocSection eyebrow="Usage" title="Custom trigger + form controls">
				<CodeBlock :code="usageSlots" lang="vue" />
			</DocSection>

			<DocSection eyebrow="Usage" title="Web component (any framework)">
				<CodeBlock :code="usageWeb" lang="html" />
			</DocSection>

			<DocSection title="Props">
				<PropsTable :rows="props" />
			</DocSection>

			<DocSection title="Slots">
				<PropsTable :rows="slots" title="Slots" />
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
