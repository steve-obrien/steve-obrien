<script setup>
import { markRaw } from 'vue';
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import { RouterLink } from 'vue-router';
import DemoInspector from '../../_layout/inspector/DemoInspector.vue';
import { ElButton, ElToggle, ElTooltip } from '../../lib/vue';

// --- Demo 1 — simple button ----------------------------------------------------
const buttonSpec = {
	id: 'btn',
	label: 'Button',
	component: markRaw(ElButton),
	props: { variant: 'primary', size: 'lg', loading: false },
	text: 'Get lifetime access',
	schema: [
		{ key: 'variant', label: 'Variant', type: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
		{ key: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg'] },
		{ key: 'loading', label: 'Loading', type: 'boolean' },
		{ key: 'text', label: 'Label', type: 'string', target: 'text' },
	],
};

// --- Demo 1b — same component, schema omitted (auto-inferred) -----------------
const inferredButtonSpec = {
	id: 'btn-auto',
	label: 'Button (auto)',
	component: markRaw(ElButton),
	props: { variant: 'primary', size: 'md' },
	text: 'Auto-inferred fields',
	// No `schema` — the inspector reads ElButton.props and the registry hints to
	// generate variant/size selects, a `loading` boolean, and a Tailwind classes field.
};

// --- Demo 2 — multi-node "pricing card" ---------------------------------------
const cardSpec = {
	id: 'card',
	label: 'Card',
	component: 'div',
	props: { class: 'flex flex-col items-start gap-4 w-[320px] rounded-3xl border border-skin-border bg-skin-background p-7 shadow-xl shadow-black/10 ring-1 ring-black/[0.04]' },
	schema: [],
	children: [
		{
			id: 'badge',
			label: 'Badge',
			component: 'span',
			props: { class: 'rounded-full bg-skin-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-skin-inverse' },
			text: 'Lifetime',
			schema: [
				{ key: 'text', label: 'Text', type: 'string', target: 'text' },
			],
		},
		{
			id: 'title',
			label: 'Title',
			component: 'h3',
			props: { class: 'text-2xl font-bold tracking-tight text-skin-primary' },
			text: 'Pro',
			schema: [
				{ key: 'text', label: 'Text', type: 'string', target: 'text' },
			],
		},
		{
			id: 'price',
			label: 'Price',
			component: 'p',
			props: { class: 'text-skin-secondary' },
			text: '$149 once · forever yours',
			schema: [
				{ key: 'text', label: 'Text', type: 'string', target: 'text' },
			],
		},
		{
			id: 'cta',
			label: 'CTA Button',
			component: markRaw(ElButton),
			props: { variant: 'primary', size: 'md' },
			text: 'Get access',
			schema: [
				{ key: 'variant', label: 'Variant', type: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
				{ key: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg'] },
				{ key: 'text', label: 'Label', type: 'string', target: 'text' },
			],
		},
	],
};

const specCode = `const cardSpec = {
  id: 'card',
  label: 'Card',
  component: 'div',
  props: { class: 'rounded-3xl border bg-skin-background p-7 …' },
  children: [
    {
      id: 'title',
      label: 'Title',
      component: 'h3',
      text: 'Pro',
      schema: [{ key: 'text', target: 'text', type: 'string' }],
    },
    {
      id: 'cta',
      label: 'CTA Button',
      component: ElButton,
      props: { variant: 'primary', size: 'md' },
      text: 'Get access',
      schema: [
        { key: 'variant', type: 'select',
          options: ['primary', 'secondary', 'ghost', 'danger'] },
        { key: 'size',    type: 'select', options: ['sm', 'md', 'lg'] },
        { key: 'text',    target: 'text', type: 'string' },
      ],
    },
  ],
};`;

const usage = `<script setup>
import DemoInspector from '@elements/inspector';
import { ElButton } from '@elements/vue';
import { markRaw } from 'vue';

const spec = {
  id: 'btn',
  label: 'Button',
  component: markRaw(ElButton),
  props: { variant: 'primary', size: 'md' },
  text: 'Click me',
  schema: [
    { key: 'variant', type: 'select', options: ['primary', 'secondary'] },
    { key: 'size',    type: 'select', options: ['sm', 'md', 'lg'] },
    { key: 'text',    target: 'text', type: 'string' },
  ],
};
<\/script>

<template>
  <DemoInspector :spec="spec" title="Button playground" />
</template>`;
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Playground"
			tagline="A live inspector. Click a component on the stage, edit its properties in the form, watch the change land instantly."
			tag="<DemoInspector>"
		>
			<DocSection eyebrow="Demo" title="Single component">
				<DemoInspector :spec="buttonSpec" title="Button" />
				<p class="mt-3 text-sm text-skin-secondary">
					Click <strong>Pick</strong> in the inspector, then click the button on the stage to select it. Edit variant, size, or label — the stage updates live.
				</p>
			</DocSection>

			<DocSection eyebrow="Auto-schema" title="Schema inferred from the component's props">
				<DemoInspector :spec="inferredButtonSpec" title="Button (no schema declared)" />
				<p class="mt-3 text-sm text-skin-secondary">
					Same component, but the spec doesn't declare a <code>schema</code>. The inspector walks <code>ElButton.props</code>, looks up registry hints (variant + size), and adds a Tailwind classes editor at the end — automatically.
				</p>
			</DocSection>

			<DocSection eyebrow="Demo" title="Nested arrangement">
				<DemoInspector :spec="cardSpec" title="Pricing card" stage-class="min-h-[360px]" />
				<p class="mt-3 text-sm text-skin-secondary">
					Multiple selectable nodes — pick any layer in the stage or use the layer list to drill in.
				</p>
			</DocSection>

			<DocSection eyebrow="Studio" title="Build full layouts with the Studio">
				<div class="rounded-2xl border border-skin-border bg-gradient-to-br from-skin-surface to-transparent p-6">
					<p class="text-sm leading-relaxed text-skin-secondary">
						The dedicated <strong class="text-skin-primary">Studio</strong> page gives you a full-width canvas with a palette of every component,
						drag-and-drop with drop indicators, a Data / HTML / Renderer tab bar, and lossless round-trip through
						<code class="rounded bg-skin-surface px-1 py-0.5 text-[12px] font-mono ring-1 ring-skin-border">&lt;ElRenderer&gt;</code>.
					</p>
					<RouterLink
						to="/elements/components/studio"
						class="mt-4 inline-flex items-center gap-1.5 rounded-full bg-skin-primary px-4 py-1.5 text-sm font-medium text-skin-inverse hover:opacity-90"
					>Open the Studio →</RouterLink>
				</div>
			</DocSection>

			<DocSection eyebrow="Spec" title="Author a playground in a few lines">
				<CodeBlock :code="specCode" lang="js" />
			</DocSection>

			<DocSection eyebrow="Usage" title="Vue">
				<CodeBlock :code="usage" lang="vue" />
			</DocSection>

			<DocSection title="Field types">
				<div class="grid gap-3 sm:grid-cols-2">
					<div v-for="f in [
						{ name: 'string', desc: 'Single-line text input.' },
						{ name: 'text', desc: 'Multi-line textarea.' },
						{ name: 'number', desc: 'Numeric input with optional min/max/step.' },
						{ name: 'boolean', desc: 'Renders the ElToggle switch.' },
						{ name: 'select', desc: 'Pill group of options.' },
						{ name: 'color', desc: 'Native color picker plus hex input.' },
					]" :key="f.name" class="rounded-xl border border-skin-border bg-skin-surface/40 p-4">
						<code class="text-sm font-semibold text-skin-primary">{{ f.name }}</code>
						<p class="mt-1 text-sm text-skin-secondary">{{ f.desc }}</p>
					</div>
				</div>
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
