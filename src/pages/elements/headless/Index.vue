<script setup>
import { RouterLink } from 'vue-router';
import ElementsLayout from '../_layout/ElementsLayout.vue';
import DocPage from '../_layout/DocPage.vue';
import DocSection from '../_layout/DocSection.vue';
import CodeBlock from '../_layout/CodeBlock.vue';
import {
	ElementDropdown,
	ElementDialog,
	ElementPopover,
	ElementTabs,
	ElementToggle,
	ElementTooltip,
	ElementAccordion,
	ElementAutocomplete,
	ElementCombobox,
	ElementDrawer,
} from '../lib/headless';

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

const elements = [
	{ cls: ElementDropdown, to: '/elements/headless/dropdown' },
	{ cls: ElementDialog, to: '/elements/headless/dialog' },
	{ cls: ElementPopover, to: '/elements/headless/popover' },
	{ cls: ElementTabs, to: '/elements/headless/tabs' },
	{ cls: ElementToggle, to: '/elements/headless/toggle' },
	{ cls: ElementTooltip, to: '/elements/headless/tooltip' },
	{ cls: ElementAccordion, to: '/elements/headless/accordion' },
	{ cls: ElementCombobox, to: '/elements/headless/combobox' },
	{ cls: ElementAutocomplete, to: '/elements/headless/autocomplete' },
	{ cls: ElementDrawer, to: '/elements/headless/drawer' },
];

function attrSummary(cls) {
	const a = cls.__doc?.attributes || [];
	return a.map((x) => x.name).join(', ') || '—';
}
function eventSummary(cls) {
	const e = cls.__doc?.events || [];
	return e.map((x) => x.name).join(' · ') || '—';
}
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
						Every interactive component in this library starts as a custom element —
						<code>&lt;element-dropdown&gt;</code>, <code>&lt;element-dialog&gt;</code>,
						<code>&lt;element-popover&gt;</code> and so on. They carry the behavioural contract (state, ARIA wiring,
						keyboard handling, event emission) but no visual styling. Drop them into a plain HTML page, a Rails view, a
						Django template, or wrap them in any framework. The Vue components in this library are thin wrappers
						around exactly these elements.
					</p>
					<ul class="mt-4 grid gap-2 text-sm text-skin-secondary sm:grid-cols-2">
						<li>✓ ~2kb gzipped per element, SSR-safe (guards <code>customElements</code>)</li>
						<li>✓ Light DOM by default — Tailwind classes cascade in normally</li>
						<li>✓ ARIA + roving tabindex + focus management built in</li>
						<li>✓ Events use the <code>el:*</code> convention with bubbling</li>
					</ul>
				</div>
			</DocSection>

			<DocSection eyebrow="Install" title="One import, all elements">
				<CodeBlock :code="install" lang="html" />
			</DocSection>

			<DocSection eyebrow="Reference" title="Every element at a glance">
				<div class="grid gap-3 sm:grid-cols-2">
					<RouterLink
						v-for="el in elements"
						:key="el.to"
						:to="el.to"
						class="group block rounded-2xl border border-skin-border bg-skin-background p-5 transition hover:-translate-y-0.5 hover:border-skin-primary/40 hover:shadow-md"
					>
						<div class="flex items-center justify-between">
							<code class="text-sm font-semibold tracking-tight text-skin-primary">&lt;{{ el.cls.__doc.name }}&gt;</code>
							<span class="text-skin-muted transition group-hover:translate-x-0.5 group-hover:text-skin-primary">→</span>
						</div>
						<p class="mt-1.5 text-sm leading-relaxed text-skin-secondary">{{ el.cls.__doc.description }}</p>
						<dl class="mt-3 space-y-1 text-[11px] text-skin-muted">
							<div class="flex gap-2">
								<dt class="font-semibold uppercase tracking-wider">Attrs</dt>
								<dd class="font-mono">{{ attrSummary(el.cls) }}</dd>
							</div>
							<div class="flex gap-2">
								<dt class="font-semibold uppercase tracking-wider">Events</dt>
								<dd class="font-mono">{{ eventSummary(el.cls) }}</dd>
							</div>
						</dl>
					</RouterLink>
				</div>
				<p class="mt-3 text-[11px] text-skin-muted">
					Cards reflect each class's static <code class="font-mono">__doc</code>. Click for the full slots / attributes / events / keyboard reference.
				</p>
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
