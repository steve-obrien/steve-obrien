<script setup>
import ElementsLayout from '../_layout/ElementsLayout.vue';
import DocPage from '../_layout/DocPage.vue';
import DocSection from '../_layout/DocSection.vue';
import CodeBlock from '../_layout/CodeBlock.vue';

const discoveryCode = `// Discovered by componentManager.js from:
// src/pages/elements/components/*/El*.vue
// src/pages/elements/forms/*/El*.vue
// src/pages/elements/visual/*/El*.vue

{
\t"id": "forms/text-input",
\t"path": "../forms/text-input/ElTextInput.vue",
\t"section": "forms",
\t"slug": "text-input",
\t"exportName": "ElTextInput",
\t"route": "/elements/forms/text-input",
\t"component": "ElTextInput"
}`;

const decoratedCode = `// Returned by inspecting the discovered row and Vue component.
{
\t"id": "forms/text-input",
\t"path": "../forms/text-input/ElTextInput.vue",
\t"section": "forms",
\t"slug": "text-input",
\t"exportName": "ElTextInput",
\t"route": "/elements/forms/text-input",
\t"component": "ElTextInput",
\t"doc": {
\t\t"name": "Text input",
\t\t"tag": "${'<' + 'ElTextInput>'}",
\t\t"description": "A labelled single-line text field."
\t},
\t"studio": {
\t\t"group": "Forms",
\t\t"hidden": false
\t},
\t"label": "Text input",
\t"badge": null,
\t"icon": "M5 7h14M12 7v10M8 17h8",
\t"order": 100,
\t"hidden": false,
\t"navHidden": false,
\t"studioHidden": false,
\t"props": {
\t\t"modelValue": { "type": "String", "default": "" },
\t\t"label": { "type": "String", "default": "" }
\t}
}`;

const componentDocCode = `<script setup>
defineOptions({
\t__doc: {
\t\tname: 'Text input',
\t\ttag: '${'<' + 'ElTextInput>'}',
\t\tdescription: 'A labelled single-line text field.',
\t\ticon: 'M5 7h14M12 7v10M8 17h8',
\t\torder: 100,
\t\tbadge: 'New',
\t\tnav: {
\t\t\tbadge: 'New',
\t\t\thidden: false,
\t\t\ticon: 'M5 7h14M12 7v10M8 17h8',
\t\t},
\t\tstudio: {
\t\t\tgroup: 'Forms',
\t\t\ticon: 'T',
\t\t\thidden: false,
\t\t},
\t\tslots: [
\t\t\t{ name: 'prefix', description: 'Rendered before the input.' },
\t\t],
\t\tevents: [
\t\t\t{ name: 'update:modelValue', payload: 'string', description: 'Fired when text changes.' },
\t\t],
\t},
});
<\/script>`;

const autoDocumenterCode = `// 1. Add or copy a component into a discovered folder.
src/pages/elements/forms/my-input/ElMyInput.vue

// 2. Give the component lightweight docs metadata.
defineOptions({
	__doc: {
		name: 'My input',
		tag: '${'<' + 'ElMyInput>'}',
		description: 'A labelled input for project-specific values.',
		studio: { group: 'Project forms' },
	},
});

// 3. Export it when the app needs package-style imports.
export { default as ElMyInput } from '../../forms/my-input/ElMyInput.vue';

// 4. The docs route is created automatically if there is no Index.vue.
/elements/forms/my-input`;

const progressiveDocsCode = `<!-- src/pages/elements/components/status-pill/ElStatusPill.vue -->
<script setup>
const props = defineProps({
	tone: { type: String, default: 'neutral' },
	label: { type: String, default: 'Draft' },
});
<\/script>

<template>
	<span class="rounded-full border border-border px-2 py-1 text-xs">
		{{ label }}
	</span>
</template>

<!-- Result: /elements/components/status-pill appears automatically.
The generated page uses the folder/export name, prop definitions, and playground. -->`;

const progressiveOverrideCode = `<!-- Tweak the generated docs without writing a page. -->
<script setup>
defineOptions({
	__doc: {
		name: 'Status pill',
		tag: '${'<' + 'ElStatusPill>'}',
		description: 'A compact status label for workflow state.',
		order: 40,
		studio: {
			group: 'Feedback',
			icon: 'Circle',
		},
	},
});

const props = defineProps({
	tone: {
		type: String,
		default: 'neutral',
		_edit: {
			options: ['neutral', 'success', 'warning', 'danger'],
			description: 'Visual state shown by the pill.',
		},
	},
	label: { type: String, default: 'Draft' },
});
<\/script>

<!-- Override the whole docs page only when needed:
src/pages/elements/components/status-pill/Index.vue -->`;

const propEditCode = `const props = defineProps({
\toptions: {
\t\ttype: Array,
\t\tdefault: () => [],
\t\t_edit: {
\t\t\tcomponent: 'ElJsonListInput',
\t\t\tdescription: 'Options shown in the picker.',
\t\t\tprops: {
\t\t\t\tcompact: true,
\t\t\t\taddLabel: '+ Add option',
\t\t\t\tschema: [
\t\t\t\t\t{ key: 'label', label: 'Label', default: (index) => \`Option \${index + 1}\` },
\t\t\t\t\t{ key: 'value', label: 'Value', default: (index) => \`option-\${index + 1}\` },
\t\t\t\t],
\t\t\t},
\t\t},
\t},
});`;

const studioSpecCode = `// Studio renderer spec. This is different from the component database row.
{
\t"id": "email-field",
\t"label": "Email field",
\t"component": "ElTextInput",
\t"props": {
\t\t"label": "Email address",
\t\t"placeholder": "you@example.com"
\t},
\t"children": []
}`;

const addComponentCode = `src/pages/elements/forms/my-input/
\tElMyInput.vue
\tIndex.vue
\texamples/
\t\tBasic.vue`;

const currentRules = [
	['Component manager', 'Discovers component files and derives path facts only: section, slug, exportName, route, id, and loader/component.'],
	['Component inspector', 'Decorates a discovered row by reading the loaded Vue component: __doc, __studio, props, labels, icons, hidden flags, and ordering.'],
	['Docs routes', 'If a component folder has an Index.vue, that page is used. If it has no Index.vue, GeneratedComponentPage.vue creates a reference page from inspected metadata.'],
	['Sidebar', 'Uses discovered and inspected rows, but owns display ordering and fallback icons as presentation concerns.'],
	['Studio', 'Uses discovered and inspected rows to build the palette. It also infers defaults from props and local sample data.'],
];

const autoDocumenterParts = [
	['Discovery', 'Finds local El*.vue files in configured component folders with Vite glob imports.'],
	['Inspection', 'Reads __doc, __studio, Vue prop definitions, slots, and events from the component object.'],
	['Generated page', 'Renders a playground, props table, slots, and events when no bespoke Index.vue exists.'],
	['Navigation', 'Adds the component to the sidebar unless __doc.hidden or __doc.nav.hidden is set.'],
	['Studio', 'Makes the component available to visual editing unless __doc.studio.hidden is set.'],
];

const adoptionSteps = [
	['Copy the engine', 'Bring componentManager.js, componentInspector.js, GeneratedComponentPage.vue, and the docs helpers used by that page into the app.'],
	['Point discovery at the app', 'Change the import.meta.glob patterns to match the app component folders that should be documented.'],
	['Add component metadata', 'Use defineOptions({ __doc }) for name, tag, description, slots, events, nav, and Studio hints.'],
	['Choose the page style', 'Omit Index.vue for generated docs, or add Index.vue when the component needs authored examples and deeper guidance.'],
	['Keep examples nearby', 'Store examples beside the component so authored pages and future generated examples can stay close to the source.'],
];

const progressiveSteps = [
	['Make the component', 'Build a normal Vue SFC in a discovered folder. No docs ceremony is required for the first pass.'],
	['It appears in docs', 'The route, sidebar item, generated playground, and props reference are inferred from the folder, export name, and defineProps.'],
	['Tweak metadata', 'Add __doc when the default label, description, nav order, Studio group, slots, or events need product language.'],
	['Tune the inspector', 'Add _edit on props when the generated playground should use a richer editor or constrained options.'],
	['Override the page', 'Add Index.vue beside the component only when the generated docs are no longer enough.'],
];

const generatedInspectorFields = [
	{
		name: 'tone',
		type: 'String',
		value: 'neutral',
		control: 'Text input',
		note: 'Inferred from defineProps. Add _edit.options later to turn this into a select-style control.',
	},
	{
		name: 'label',
		type: 'String',
		value: 'Draft',
		control: 'Text input',
		note: 'Seeded from the prop default and bound to the live component preview.',
	},
];

const docFields = [
	['name', 'Human label used by docs and navigation. Falls back to a label from the folder slug.'],
	['tag', 'Display tag shown at the top of docs, such as ' + '<' + 'ElTextInput>.'],
	['description', 'Short documentation summary. Used by generated docs.'],
	['icon', 'SVG path data. This is the preferred component icon location.'],
	['order', 'Numeric sort order inside the inferred group. Defaults to 100.'],
	['badge', 'General badge. nav.badge is more specific for sidebar usage.'],
	['hidden', 'Hide the component from generated docs/navigation/studio discovery.'],
	['nav', 'Navigation-specific decoration: badge, hidden, icon.'],
	['studio', 'Studio-specific decoration: group, icon, hidden, defaults, accepts, hints.'],
	['slots', 'Array of slot docs: name, payload, description.'],
	['events', 'Array of event docs: name, payload, description, and optional details for exact payload shapes or examples.'],
];

const editFields = [
	['component', 'Name of the inspector editor component. Example: ElTextInput, ElJsonInput, ElJsonListInput.'],
	['description', 'Helper copy shown by the inspector field.'],
	['options', 'Option values passed to the default editor when useful.'],
	['props', 'Props passed to the editor component. Use this for compact, rows, schema, addLabel, and similar editor-specific props.'],
	['type comments', 'Use JSDoc @typedef and @type comments near the component props when array/object shapes need richer documentation.'],
	['label', 'Optional label override when the editor uses a different visible label.'],
];
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Component Spec"
			tagline="The current source of truth for how Elements discovers, decorates, documents, and exposes components to Studio."
			tag="componentManager + componentInspector"
			eyebrow="Framework contract"
		>
			<DocSection eyebrow="Purpose" title="One contract, multiple consumers">
				<div class="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
					<div class="rounded-3xl border border-border bg-card p-6 text-card-foreground">
						<p class="text-sm leading-6 text-muted-foreground">
							A component should be discoverable from its folder, then decorated by inspecting the Vue component. The docs site, sidebar, generated pages, Studio palette, and future component database should all be able to use the same shape.
						</p>
						<p class="mt-3 text-sm leading-6 text-muted-foreground">
							The names below document what exists now. They are intentionally precise so that future refactors from
							<code class="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">__doc</code>,
							<code class="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">__studio</code>, and
							<code class="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">_edit</code>
							can be made against a known contract.
						</p>
					</div>
					<div class="rounded-3xl border border-border bg-secondary/50 p-6">
						<h3 class="font-semibold tracking-tight text-foreground">Adding a component</h3>
						<p class="mt-2 text-sm leading-6 text-muted-foreground">
							Put an <code class="rounded bg-background px-1.5 py-0.5 font-mono text-xs">El*.vue</code> file under
							<code class="rounded bg-background px-1.5 py-0.5 font-mono text-xs">components</code>,
							<code class="rounded bg-background px-1.5 py-0.5 font-mono text-xs">forms</code>, or
							<code class="rounded bg-background px-1.5 py-0.5 font-mono text-xs">visual</code>.
							It should appear in the generated docs and Studio automatically unless hidden.
						</p>
					</div>
				</div>
			</DocSection>

			<DocSection eyebrow="Auto-documenter" title="Take the docs engine with the components">
				<div class="grid gap-4 lg:grid-cols-[1fr_1fr]">
					<div class="space-y-4">
						<div class="rounded-3xl border border-border bg-card p-6 text-card-foreground">
							<h3 class="font-semibold tracking-tight text-foreground">Optional when adopting Elements</h3>
							<p class="mt-2 text-sm leading-6 text-muted-foreground">
								When someone copies, vendors, or builds on the components, they can also bring the auto-documenter. It turns local Vue component metadata into living docs inside their own app, so the component library does not need a separate Storybook-style setup to stay inspectable.
							</p>
						</div>
						<div class="overflow-hidden rounded-2xl border border-border">
							<table class="w-full text-left text-sm">
								<tbody class="divide-y divide-border bg-background">
									<tr v-for="row in autoDocumenterParts" :key="row[0]">
										<td class="px-4 py-3 font-medium text-foreground">{{ row[0] }}</td>
										<td class="px-4 py-3 text-muted-foreground">{{ row[1] }}</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
					<CodeBlock lang="js" :code="autoDocumenterCode" />
				</div>
			</DocSection>

			<DocSection eyebrow="Progressive docs" title="Start plain, then refine">
				<div class="grid gap-4 lg:grid-cols-[1fr_1fr]">
					<div class="space-y-4">
						<div class="rounded-3xl border border-border bg-card p-6 text-card-foreground">
							<h3 class="font-semibold tracking-tight text-foreground">The happy path</h3>
							<p class="mt-2 text-sm leading-6 text-muted-foreground">
								The core workflow is deliberately light. Focus on making the component first. Once it lands in a discovered folder, it shows up in the docs automatically. Later, when the generated page reveals what needs better naming, examples, or inspector controls, add only the metadata or custom page you actually need.
							</p>
						</div>
						<div class="overflow-hidden rounded-2xl border border-border">
							<table class="w-full text-left text-sm">
								<tbody class="divide-y divide-border bg-background">
									<tr v-for="row in progressiveSteps" :key="row[0]">
										<td class="px-4 py-3 font-medium text-foreground">{{ row[0] }}</td>
										<td class="px-4 py-3 text-muted-foreground">{{ row[1] }}</td>
									</tr>
								</tbody>
							</table>
						</div>
						<div class="overflow-hidden rounded-2xl border border-border bg-background">
							<div class="border-b border-border bg-secondary/50 px-4 py-3">
								<p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Generated inspector</p>
								<div class="mt-1 flex items-center justify-between gap-3">
									<h3 class="text-sm font-semibold text-foreground">Status pill</h3>
									<span class="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">Auto</span>
								</div>
							</div>
							<div class="space-y-4 p-4">
								<div v-for="field in generatedInspectorFields" :key="field.name" class="space-y-2">
									<div class="flex items-start justify-between gap-3">
										<div>
											<label class="block text-sm font-medium text-foreground">{{ field.name }}</label>
											<p class="mt-0.5 text-xs text-muted-foreground">{{ field.type }} / {{ field.control }}</p>
										</div>
										<code class="rounded bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">default</code>
									</div>
									<div class="rounded-lg border border-input bg-card px-3 py-2 font-mono text-sm text-foreground">{{ field.value }}</div>
									<p class="text-xs leading-5 text-muted-foreground">{{ field.note }}</p>
								</div>
							</div>
						</div>
					</div>
					<div class="space-y-4">
						<CodeBlock lang="vue" :code="progressiveDocsCode" />
						<CodeBlock lang="vue" :code="progressiveOverrideCode" />
					</div>
				</div>
			</DocSection>

			<DocSection eyebrow="Adoption" title="What a consuming app chooses">
				<div class="overflow-hidden rounded-2xl border border-border">
					<table class="w-full text-left text-sm">
						<thead class="bg-secondary text-xs uppercase tracking-[0.14em] text-muted-foreground">
							<tr>
								<th class="px-4 py-3 font-semibold">Step</th>
								<th class="px-4 py-3 font-semibold">Why it matters</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border bg-background">
							<tr v-for="row in adoptionSteps" :key="row[0]">
								<td class="px-4 py-3 font-medium text-foreground">{{ row[0] }}</td>
								<td class="px-4 py-3 text-muted-foreground">{{ row[1] }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</DocSection>

			<DocSection eyebrow="Discovery" title="Component row">
				<div class="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
					<div class="rounded-3xl border border-border bg-card p-6 text-card-foreground">
						<p class="text-sm leading-6 text-muted-foreground">
							The component row is intentionally plain. It is the database-like record of what exists and where it lives. It does not decide labels, props, visibility, icons, or Studio behaviour.
						</p>
					</div>
					<CodeBlock lang="js" :code="discoveryCode" />
				</div>
			</DocSection>

			<DocSection eyebrow="Inspection" title="Decorated component row">
				<div class="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
					<div class="rounded-3xl border border-border bg-card p-6 text-card-foreground">
						<p class="text-sm leading-6 text-muted-foreground">
							The decorated row is created by inspecting the loaded Vue component. This is the shape consumers usually want when rendering docs, navigation, or Studio UI.
						</p>
					</div>
					<CodeBlock lang="js" :code="decoratedCode" />
				</div>
			</DocSection>

			<DocSection eyebrow="Metadata" title="Current __doc contract">
				<div class="overflow-hidden rounded-2xl border border-border">
					<table class="w-full text-left text-sm">
						<thead class="bg-secondary text-xs uppercase tracking-[0.14em] text-muted-foreground">
							<tr>
								<th class="px-4 py-3 font-semibold">Field</th>
								<th class="px-4 py-3 font-semibold">Current meaning</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border bg-background">
							<tr v-for="row in docFields" :key="row[0]">
								<td class="px-4 py-3 font-mono text-xs text-foreground">{{ row[0] }}</td>
								<td class="px-4 py-3 text-muted-foreground">{{ row[1] }}</td>
							</tr>
						</tbody>
					</table>
				</div>
				<CodeBlock lang="vue" :code="componentDocCode" />
			</DocSection>

			<DocSection eyebrow="Inspector" title="Current prop _edit contract">
				<div class="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
					<div class="space-y-4">
						<div class="rounded-3xl border border-border bg-card p-6 text-card-foreground">
							<p class="text-sm leading-6 text-muted-foreground">
								<code class="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">_edit</code>
								lives on Vue prop definitions. Studio's inspector reads it to choose the editor component and pass editor-specific props. This is not required for ordinary app usage.
							</p>
						</div>
						<div class="overflow-hidden rounded-2xl border border-border">
							<table class="w-full text-left text-sm">
								<tbody class="divide-y divide-border bg-background">
									<tr v-for="row in editFields" :key="row[0]">
										<td class="px-4 py-3 font-mono text-xs text-foreground">{{ row[0] }}</td>
										<td class="px-4 py-3 text-muted-foreground">{{ row[1] }}</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
					<CodeBlock lang="js" :code="propEditCode" />
				</div>
			</DocSection>

			<DocSection eyebrow="Studio" title="Studio renderer spec">
				<div class="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
					<div class="rounded-3xl border border-border bg-card p-6 text-card-foreground">
						<p class="text-sm leading-6 text-muted-foreground">
							The Studio renderer spec is a saved UI tree. It references components by name and stores props and children. It is not the same thing as the component row, but it depends on the component registry being able to resolve names back to components.
						</p>
					</div>
					<CodeBlock lang="json" :code="studioSpecCode" />
				</div>
			</DocSection>

			<DocSection eyebrow="Responsibilities" title="Where logic belongs today">
				<div class="overflow-hidden rounded-2xl border border-border">
					<table class="w-full text-left text-sm">
						<thead class="bg-secondary text-xs uppercase tracking-[0.14em] text-muted-foreground">
							<tr>
								<th class="px-4 py-3 font-semibold">Part</th>
								<th class="px-4 py-3 font-semibold">Responsibility</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border bg-background">
							<tr v-for="row in currentRules" :key="row[0]">
								<td class="px-4 py-3 font-medium text-foreground">{{ row[0] }}</td>
								<td class="px-4 py-3 text-muted-foreground">{{ row[1] }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</DocSection>

			<DocSection eyebrow="Convention" title="Folder shape">
				<div class="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
					<div class="rounded-3xl border border-border bg-card p-6 text-card-foreground">
						<p class="text-sm leading-6 text-muted-foreground">
							A custom docs page is optional. If there is no
							<code class="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">Index.vue</code>,
							the generated docs page uses component metadata and runtime props. Examples are still recommended because they show intended composition.
						</p>
					</div>
					<CodeBlock lang="txt" :code="addComponentCode" />
				</div>
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
