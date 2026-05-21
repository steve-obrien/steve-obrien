<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import Demo from '../../_layout/Demo.vue';
import PropsTable from '../../_layout/PropsTable.vue';
import { ElDropdown } from '../../lib/vue';
import { computed, ref } from 'vue';

const selected = ref('');
const items = [
	{ label: 'View profile', value: 'profile' },
	{ label: 'Billing & plans', value: 'billing' },
	{ label: 'Team settings', value: 'team' },
	{ label: 'Sign out', value: 'signout' },
];

const usageVue = `<script setup>
import { ElDropdown } from '@elements/vue';
import { ref } from 'vue';
const items = [
  { label: 'Profile', value: 'profile' },
  { label: 'Billing',  value: 'billing' },
  { label: 'Sign out', value: 'signout' },
];
const choice = ref('');
<\/script>

<template>
  <ElDropdown :items="items" label="Account" @select="(v) => choice = v" />
  <p>Selected: {{ choice }}</p>
</template>`;

// --- Actions menu (icon + label) -------------------------------------------
// Icon paths kept as SVG inner-content strings so the slot can drop them
// straight into a single <svg>. `separator: true` rows render as a divider.
const icons = {
	edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />',
	duplicate: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />',
	share: '<circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />',
	archive: '<polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" />',
	trash: '<polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />',
};
const actions = [
	{ label: 'Edit', value: 'edit', icon: 'edit' },
	{ label: 'Duplicate', value: 'duplicate', icon: 'duplicate' },
	{ label: 'Share', value: 'share', icon: 'share' },
	{ label: 'Archive', value: 'archive', icon: 'archive' },
	{ separator: true },
	{ label: 'Delete', value: 'delete', icon: 'trash', tone: 'danger' },
];
const lastAction = ref('');

const usageActions = `<script setup>
import { ElDropdown } from '@elements/vue';

const actions = [
  { label: 'Edit',      value: 'edit',      icon: 'edit' },
  { label: 'Duplicate', value: 'duplicate', icon: 'duplicate' },
  { label: 'Share',     value: 'share',     icon: 'share' },
  { label: 'Archive',   value: 'archive',   icon: 'archive' },
  { separator: true },
  { label: 'Delete',    value: 'delete',    icon: 'trash', tone: 'danger' },
];
<\/script>

<template>
  <ElDropdown :items="actions" label="Actions" align="right">
    <template #item="{ item }">
      <span
        class="flex items-center gap-2.5"
        :class="item.tone === 'danger' && 'text-red-500'"
      >
        <svg viewBox="0 0 24 24" class="size-4 opacity-80"
          fill="none" stroke="currentColor" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round"
          v-html="icons[item.icon]" />
        {{ item.label }}
      </span>
    </template>
  </ElDropdown>
</template>`;

const richItems = [
	{ value: 'sara', name: 'Sara Patel', role: 'Design', initials: 'SP', color: 'bg-rose-500' },
	{ value: 'tomas', name: 'Tomás Ruiz', role: 'Engineering', initials: 'TR', color: 'bg-emerald-500' },
	{ value: 'priya', name: 'Priya Nair', role: 'Product', initials: 'PN', color: 'bg-amber-500' },
	{ value: 'leo', name: 'Leo Almeida', role: 'Operations', initials: 'LA', color: 'bg-sky-500' },
];
const assigned = ref('sara');
const assignedItem = computed(() => richItems.find((i) => i.value === assigned.value));

const usageSlot = `<script setup>
import { ElDropdown } from '@elements/vue';
const users = [
  { value: 'sara',  name: 'Sara Patel',  role: 'Design',      initials: 'SP' },
  { value: 'tomas', name: 'Tomás Ruiz',  role: 'Engineering', initials: 'TR' },
];
<\/script>

<template>
  <ElDropdown :items="users" label="Assign…">
    <template #trigger>
      <span class="flex items-center gap-2">
        <span class="size-6 rounded-full bg-rose-500" />
        Sara Patel
      </span>
    </template>

    <template #item="{ item }">
      <div class="flex items-center gap-3">
        <span class="grid size-7 place-items-center rounded-full bg-rose-500 text-xs font-semibold text-white">
          {{ item.initials }}
        </span>
        <div>
          <p class="text-sm font-medium">{{ item.name }}</p>
          <p class="text-xs text-skin-muted">{{ item.role }}</p>
        </div>
      </div>
    </template>
  </ElDropdown>
</template>`;

const usageWeb = `<element-dropdown>
  <button slot="trigger">Account ▾</button>
  <div slot="menu">
    <button role="menuitem" data-value="profile">Profile</button>
    <button role="menuitem" data-value="billing">Billing</button>
    <button role="menuitem" data-value="signout">Sign out</button>
  </div>
</element-dropdown>

<script type="module">
  import '@elements/headless';
  document.querySelector('element-dropdown')
    .addEventListener('el:select', (e) => console.log(e.detail.value));
<\/script>`;

const props = [
	{ name: 'items', type: 'Array<{ label, value, …any }> | string[]', default: '—', description: 'Menu options. Any extra keys are passed through to the #item slot.' },
	{ name: 'label', type: 'string', default: "'Options'", description: 'Trigger button label (used when #trigger slot is empty).' },
	{ name: 'align', type: "'left' | 'right'", default: "'left'", description: 'Menu alignment.' },
	{ name: 'width', type: 'string', default: "'min-w-[12rem]'", description: 'Menu width utility classes.' },
];

const slots = [
	{ name: '#trigger', type: 'slot', default: 'label prop', description: 'Replaces the inner content of the trigger button.' },
	{ name: '#item', type: 'slot({ item, index })', default: 'item.label', description: 'Replaces the rendering of each menu item.' },
];

const events = [
	{ name: '@select', type: '(value: string)', default: '—', description: 'Fired when a menu item is chosen.' },
];

const keys = [
	{ k: 'Enter / Space / ↓', d: 'Open menu (when trigger is focused).' },
	{ k: '↑ / ↓', d: 'Move active item.' },
	{ k: 'Home / End', d: 'Jump to first / last item.' },
	{ k: 'Enter', d: 'Select active item.' },
	{ k: 'Esc / Tab', d: 'Close menu and return focus.' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage name="Dropdown" tagline="A menu that opens from a button — fully keyboard accessible, with focus return and outside-click handling." tag="<element-dropdown>">
			<DocSection eyebrow="Demo" title="Live preview">
				<Demo>
					<div class="flex flex-col items-center gap-3">
						<ElDropdown :items="items" label="Account ▾" @select="(v) => selected = v" />
						<p class="text-xs text-skin-muted">Selected: <code class="text-skin-primary">{{ selected || '—' }}</code></p>
					</div>
				</Demo>
			</DocSection>

			<DocSection eyebrow="Demo" title="Custom item markup">
				<Demo>
					<ElDropdown :items="richItems" width="min-w-[16rem]" @select="(v) => assigned = v">
						<template #trigger>
							<span class="flex items-center gap-2">
								<span class="grid size-6 place-items-center rounded-full text-[10px] font-semibold text-white" :class="assignedItem?.color">
									{{ assignedItem?.initials }}
								</span>
								<span>{{ assignedItem?.name }}</span>
							</span>
						</template>
						<template #item="{ item }">
							<div class="flex items-center gap-3">
								<span class="grid size-7 place-items-center rounded-full text-xs font-semibold text-white" :class="item.color">
									{{ item.initials }}
								</span>
								<div class="min-w-0">
									<p class="truncate text-sm font-medium text-skin-primary">{{ item.name }}</p>
									<p class="truncate text-xs text-skin-muted">{{ item.role }}</p>
								</div>
							</div>
						</template>
					</ElDropdown>
				</Demo>
				<p class="mt-3 text-sm text-skin-secondary">Use the <code>#trigger</code> and <code>#item</code> slots to render any markup — avatars, descriptions, keyboard hints, badges.</p>
				<CodeBlock class="mt-4" :code="usageSlot" lang="vue" />
			</DocSection>

			<DocSection eyebrow="Demo" title="Actions menu — icon + label">
				<Demo>
					<ElDropdown :items="actions" label="Actions" align="right" width="min-w-[14rem]" @select="(v) => lastAction = v">
						<template #item="{ item }">
							<span class="flex items-center gap-2.5" :class="item.tone === 'danger' && 'text-red-500'">
								<svg viewBox="0 0 24 24" class="size-4 opacity-80" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" v-html="icons[item.icon]" />
								<span>{{ item.label }}</span>
							</span>
						</template>
					</ElDropdown>
				</Demo>
				<p class="mt-3 text-sm text-skin-secondary">
					Items with <code>separator: true</code> render as a divider line — useful for setting destructive actions apart.
					Pair the <code>#item</code> slot with a tone flag (<code>tone: 'danger'</code>) to colour the Delete row red.
				</p>
				<p v-if="lastAction" class="mt-2 text-xs text-skin-muted">Last action: <code class="text-skin-primary">{{ lastAction }}</code></p>
				<CodeBlock class="mt-4" :code="usageActions" lang="vue" />
			</DocSection>

			<DocSection eyebrow="Usage" title="Vue">
				<CodeBlock :code="usageVue" lang="vue" />
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

			<DocSection title="Events">
				<PropsTable :rows="events" title="Events" />
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
