<script setup>
import ElementsLayout from '../_layout/ElementsLayout.vue';
import DocPage from '../_layout/DocPage.vue';
import DocSection from '../_layout/DocSection.vue';
import CodeBlock from '../_layout/CodeBlock.vue';
import PropsTable from '../_layout/PropsTable.vue';

const install = `<!-- Register every <element-*> custom element. One import is enough — they
   ship as ES modules and self-register via customElements.define. -->
<script type="module">
  import '@elements/headless';
<\/script>

<!-- Or pick what you need: -->
<script type="module">
  import '@elements/headless/dropdown.js';
  import '@elements/headless/dialog.js';
<\/script>`;

const dropdownSnippet = `<element-dropdown>
  <button slot="trigger">Account ▾</button>
  <div slot="menu">
    <button role="menuitem" data-value="profile">Profile</button>
    <button role="menuitem" data-value="billing">Billing</button>
    <button role="menuitem" data-value="signout">Sign out</button>
  </div>
</element-dropdown>

<script type="module">
  document.querySelector('element-dropdown')
    .addEventListener('el:select', (e) => console.log(e.detail.value));
<\/script>`;

const dialogSnippet = `<!-- The native <dialog> is generated inside a shadow root — you never write
   it yourself. The trigger slot renders outside; everything else becomes the
   dialog body. -->
<element-dialog>
  <button slot="trigger">Delete</button>
  <h2>Delete project?</h2>
  <p>This cannot be undone.</p>
  <button data-close>Cancel</button>
  <button data-close>Delete</button>
</element-dialog>`;

const popoverSnippet = `<element-popover>
  <button slot="trigger">More</button>
  <div slot="panel">
    <p>Anything you like — text, buttons, even forms.</p>
  </div>
</element-popover>`;

const tabsSnippet = `<element-tabs value="overview">
  <div role="tablist">
    <button data-tab="overview">Overview</button>
    <button data-tab="pricing">Pricing</button>
  </div>
  <div data-panel="overview">Overview content…</div>
  <div data-panel="pricing">Pricing content…</div>
</element-tabs>`;

const toggleSnippet = `<element-toggle checked aria-label="Notifications"></element-toggle>

<script type="module">
  document.querySelector('element-toggle')
    .addEventListener('el:change', (e) => console.log(e.detail.checked));
<\/script>`;

const tooltipSnippet = `<element-tooltip text="Save your changes" placement="top" delay="120">
  <button>Save</button>
</element-tooltip>`;

const accordionSnippet = `<element-accordion multiple>
  <element-accordion-item open>
    <button slot="header">Section A</button>
    <div slot="content">Lorem ipsum…</div>
  </element-accordion-item>
  <element-accordion-item>
    <button slot="header">Section B</button>
    <div slot="content">Dolor sit amet…</div>
  </element-accordion-item>
</element-accordion>`;

const comboboxSnippet = `<element-combobox>
  <input slot="input" placeholder="Search…" />
  <ul slot="list">
    <li data-value="apple">Apple</li>
    <li data-value="banana">Banana</li>
    <li data-value="cherry">Cherry</li>
  </ul>
</element-combobox>`;

// Per-element reference table — slots, events, attributes.
const refs = [
	{
		tag: '<element-dropdown>',
		slots: 'trigger, menu (or data-menu-id for teleported menus)',
		events: 'el:open · el:close · el:select { value }',
		attrs: 'open',
		notes: 'Items inside the menu must carry role="menuitem". data-value flows through el:select.',
	},
	{
		tag: '<element-dialog>',
		slots: 'trigger (rendered outside), default (rendered inside the dialog)',
		events: 'el:open · el:close',
		attrs: 'open · static (disables backdrop dismiss)',
		notes: 'Self-contained shadow-DOM wrapper around a native <dialog>. Buttons marked data-close close the dialog.',
	},
	{
		tag: '<element-popover>',
		slots: 'trigger, panel',
		events: 'el:open · el:close',
		attrs: 'open',
		notes: 'Panel gets popover="auto" — light-dismiss and Esc handling are native.',
	},
	{
		tag: '<element-tabs>',
		slots: '—',
		events: 'el:change { value }',
		attrs: 'value',
		notes: 'Tabs marked with data-tab="key" pair with panels marked data-panel="key". Roving tabindex + arrow keys.',
	},
	{
		tag: '<element-toggle>',
		slots: '—',
		events: 'el:change { checked }',
		attrs: 'checked · disabled',
		notes: 'role="switch", Space / Enter toggles. ARIA-checked maintained automatically.',
	},
	{
		tag: '<element-tooltip>',
		slots: 'default (the trigger)',
		events: 'el:show · el:hide',
		attrs: 'text · placement · delay',
		notes: 'Injects an aria-describedby bubble. Fires on hover and focus.',
	},
	{
		tag: '<element-accordion>',
		slots: '—',
		events: '—',
		attrs: 'multiple',
		notes: 'Contains <element-accordion-item> children with slot="header" + slot="content".',
	},
	{
		tag: '<element-accordion-item>',
		slots: 'header, content',
		events: 'el:change { open }',
		attrs: 'open',
		notes: 'aria-expanded / role="region" wired on the header and content.',
	},
	{
		tag: '<element-combobox>',
		slots: 'input, list (or data-menu-id)',
		events: 'el:change { value }',
		attrs: 'value · open',
		notes: 'Listbox filtered live by input. data-value on each option. aria-activedescendant maintained.',
	},
];
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Headless web components"
			tagline="Behaviour shipped as plain custom elements — works in any HTML, in any framework, with zero JavaScript runtime beyond the elements themselves."
			tag="@elements/headless"
		>
			<DocSection eyebrow="Why" title="The headless layer">
				<div class="rounded-2xl border border-skin-border bg-skin-surface/40 p-6">
					<p class="text-sm leading-relaxed text-skin-secondary">
						Every interactive component in this library starts as a custom element — <code>&lt;element-dropdown&gt;</code>,
						<code>&lt;element-dialog&gt;</code>, <code>&lt;element-popover&gt;</code> and so on. They carry the behavioural
						contract (state, ARIA wiring, keyboard handling, event emission) but no visual styling. Drop them into a plain HTML
						page, a Rails view, a Django template, or wrap them in any framework. The Vue components in this library are thin
						wrappers around exactly these elements.
					</p>
					<ul class="mt-4 grid gap-2 text-sm text-skin-secondary sm:grid-cols-2">
						<li>✓ ~2kb gzipped per element, SSR-safe (guards <code>customElements</code>)</li>
						<li>✓ No shadow DOM — your styles cascade in normally</li>
						<li>✓ ARIA + roving tabindex + focus management built in</li>
						<li>✓ Events use <code>el:*</code> custom events with bubbling</li>
					</ul>
				</div>
			</DocSection>

			<DocSection eyebrow="Install" title="One import, all elements">
				<CodeBlock :code="install" lang="html" />
			</DocSection>

			<DocSection eyebrow="Reference" title="Every element at a glance">
				<div class="overflow-hidden rounded-2xl border border-skin-border">
					<table class="w-full text-left text-sm">
						<thead class="bg-skin-surface text-xs uppercase tracking-wider text-skin-muted">
							<tr>
								<th class="px-4 py-3 font-medium">Tag</th>
								<th class="px-4 py-3 font-medium">Slots</th>
								<th class="px-4 py-3 font-medium">Events</th>
								<th class="px-4 py-3 font-medium">Attributes</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-skin-border">
							<tr v-for="r in refs" :key="r.tag" class="align-top">
								<td class="px-4 py-3 font-mono text-[12.5px] text-skin-primary">{{ r.tag }}</td>
								<td class="px-4 py-3 text-skin-secondary">{{ r.slots }}</td>
								<td class="px-4 py-3 font-mono text-[12px] text-skin-secondary">{{ r.events }}</td>
								<td class="px-4 py-3 font-mono text-[12px] text-skin-secondary">{{ r.attrs }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</DocSection>

			<DocSection eyebrow="Examples" title="<element-dropdown>">
				<p class="text-sm text-skin-secondary">A menu that opens from a button. Items marked <code>role="menuitem"</code> become navigable; <code>data-value</code> flows into the <code>el:select</code> event.</p>
				<CodeBlock class="mt-3" :code="dropdownSnippet" lang="html" />
			</DocSection>

			<DocSection title="<element-dialog>">
				<p class="text-sm text-skin-secondary">Wraps a native <code>&lt;dialog&gt;</code>. <code>showModal()</code> gives the dialog the top layer (no z-index, no overflow clipping) and dialogs stack natively when nested.</p>
				<CodeBlock class="mt-3" :code="dialogSnippet" lang="html" />
			</DocSection>

			<DocSection title="<element-popover>">
				<p class="text-sm text-skin-secondary">Wraps a panel with the native <code>popover</code> attribute. Light-dismiss, Esc, top-layer — all native.</p>
				<CodeBlock class="mt-3" :code="popoverSnippet" lang="html" />
			</DocSection>

			<DocSection title="<element-tabs>">
				<p class="text-sm text-skin-secondary">Pair tabs with panels by matching <code>data-tab</code> / <code>data-panel</code> values. Arrow keys move between tabs.</p>
				<CodeBlock class="mt-3" :code="tabsSnippet" lang="html" />
			</DocSection>

			<DocSection title="<element-toggle>">
				<p class="text-sm text-skin-secondary"><code>role="switch"</code> with Space / Enter, ARIA-checked maintained as you toggle.</p>
				<CodeBlock class="mt-3" :code="toggleSnippet" lang="html" />
			</DocSection>

			<DocSection title="<element-tooltip>">
				<p class="text-sm text-skin-secondary">Wraps any trigger; the tooltip bubble is injected as a sibling and tied via <code>aria-describedby</code>.</p>
				<CodeBlock class="mt-3" :code="tooltipSnippet" lang="html" />
			</DocSection>

			<DocSection title="<element-accordion>">
				<p class="text-sm text-skin-secondary">Disclosure panels. <code>multiple</code> on the host lets several open at once.</p>
				<CodeBlock class="mt-3" :code="accordionSnippet" lang="html" />
			</DocSection>

			<DocSection title="<element-combobox>">
				<p class="text-sm text-skin-secondary">Type-ahead select. Input filters the list live; <code>aria-activedescendant</code> tracks the active option.</p>
				<CodeBlock class="mt-3" :code="comboboxSnippet" lang="html" />
			</DocSection>

			<DocSection eyebrow="Events" title="The el:* convention">
				<div class="rounded-2xl border border-skin-border bg-skin-surface/40 p-6">
					<p class="text-sm leading-relaxed text-skin-secondary">
						Every element emits <code>el:open</code> / <code>el:close</code> when it shows or hides, plus an
						element-specific verb (<code>el:select</code>, <code>el:change</code>, <code>el:show</code>) for the action it
						mediates. All events <strong>bubble</strong> and use the <code>detail</code> field for data:
					</p>
					<pre class="mt-4 overflow-auto rounded-xl bg-[#0b1020] p-4 font-mono text-[12.5px] leading-relaxed text-white/90"><code>document.addEventListener('el:select', (e) =&gt; {
  console.log(e.target.tagName, '→', e.detail.value);
});</code></pre>
				</div>
			</DocSection>

			<DocSection eyebrow="Teleport / portals" title="External popups">
				<p class="text-sm text-skin-secondary">
					When a popup needs to escape its host (e.g. you teleport a menu to <code>document.body</code> to dodge an
					ancestor with <code>overflow: hidden</code>), set <code>data-menu-id</code> on
					<code>&lt;element-dropdown&gt;</code> or <code>&lt;element-combobox&gt;</code>, and
					<code>data-panel-id</code> on <code>&lt;element-popover&gt;</code>. The headless re-resolves the popup
					from <code>document.getElementById</code> on every open.
				</p>
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
