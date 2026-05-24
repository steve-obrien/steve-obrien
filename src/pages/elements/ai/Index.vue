<script setup>
import ElementsLayout from '../_layout/ElementsLayout.vue';
import DocPage from '../_layout/DocPage.vue';
import DocSection from '../_layout/DocSection.vue';
import CodeBlock from '../_layout/CodeBlock.vue';

const principles = [
	{
		title: 'Prefer composition over invention',
		body: 'LLMs should reach for known primitives, visual surfaces, and blocks before inventing markup. The smaller the vocabulary, the better the generated UI.',
	},
	{
		title: 'Make the examples canonical',
		body: 'Examples are the strongest teaching material. They show the preferred component, prop, token, spacing, and composition style in a form an LLM can copy safely.',
	},
	{
		title: 'Prefer props for behaviour',
		body: 'Props like tone, variant, placement, floatingMode, options, items, and duration are easier for an LLM to choose correctly than handwritten behaviour.',
	},
	{
		title: 'Use semantic tokens',
		body: 'Token utilities such as bg-card, text-muted-foreground, border-border, bg-primary, bg-success, and bg-warning keep generated screens on-theme.',
	},
	{
		title: 'Keep Studio as a second path',
		body: 'When the result should remain editable, an LLM can return a Studio spec with component, props, children, ids, and labels. That is different from ordinary Vue usage.',
	},
	{
		title: 'Make failure checkable',
		body: 'Generated UI should be easy to validate for unknown components, missing required props, overflow, contrast risks, and unsupported class patterns.',
	},
];

const llmContract = [
	['Component names', 'Use stable names such as ElButton, ElCard, ElCombobox, ElToastStack, and ElJsonListInput.'],
	['Prop shapes', 'Document the common prop names, defaults, allowed values, and event payloads.'],
	['Examples', 'Provide short examples that are complete enough to copy into an app without extra ceremony.'],
	['Theme tokens', 'Tell LLMs which token utilities to use and when to avoid raw colours.'],
	['Blocks', 'Give LLMs complete dashboard, mail, chat, forms, and login patterns to start from.'],
	['Studio specs', 'Only ask for component/props/children specs when the UI should be edited visually later.'],
];

const additions = [
	{
		title: 'LLM manifest',
		body: 'Generate a terse machine-readable index from docs, props, events, slots, examples, and block names. Include Studio metadata separately so agents can opt in only when needed.',
	},
	{
		title: 'More app recipes',
		body: 'Add concise recipes for settings, tables, detail pages, checkout, onboarding, empty states, and admin workflows.',
	},
	{
		title: 'Spec validator',
		body: 'Validate Studio specs before rendering: unknown component, illegal child placement, invalid prop option, missing label, and unsafe HTML.',
	},
	{
		title: 'Design critique harness',
		body: 'Run generated screens through checks for overflow, contrast, mobile layout, focus order, and whether the UI uses semantic tokens.',
	},
	{
		title: 'Tiny prompt contract',
		body: 'Keep /llms.txt short and specific so it can be pasted into an agent context without carrying the whole documentation site.',
	},
	{
		title: 'Migration helpers',
		body: 'Add utilities that can convert HTML or Vue snippets into a Studio spec, then normalize classes and replace ad hoc markup with Elements primitives.',
	},
];

const futureAiPages = [
	{
		title: 'AI chat tools',
		body: 'Chat interfaces where assistant messages can return structured UI, tool results, forms, cards, tables, and follow-up actions.',
	},
	{
		title: 'Voice tools',
		body: 'Voice-first controls for recording, transcription, interruption, status, and generated UI feedback.',
	},
	{
		title: 'Tool result renderers',
		body: 'Patterns for rendering search results, database rows, file previews, streaming jobs, and agent task output.',
	},
	{
		title: 'Server-backed controls',
		body: 'Autocomplete, combobox, command palette, and picker examples where data is fetched as the user types.',
	},
];

const specCode = `{
\t"id": "settings-form",
\t"label": "Settings form",
\t"component": "ElCard",
\t"props": {
\t\t"padding": "lg",
\t\t"glass": true,
\t\t"class": "w-full max-w-2xl"
\t},
\t"children": [
\t\t{
\t\t\t"id": "title",
\t\t\t"label": "Title",
\t\t\t"component": "h2",
\t\t\t"props": { "class": "text-2xl font-semibold tracking-tight" },
\t\t\t"children": [{ "text": "Account settings" }]
\t\t},
\t\t{
\t\t\t"id": "email",
\t\t\t"label": "Email input",
\t\t\t"component": "ElTextInput",
\t\t\t"props": {
\t\t\t\t"label": "Email address",
\t\t\t\t"placeholder": "you@example.com"
\t\t\t}
\t\t}
\t]
}`;

const docsCode = `# Elements LLM notes
- Use Elements primitives before custom markup.
- Use blocks for dashboard, chat, mail, forms, and login screens.
- Use theme tokens, not raw colours.
- Use component props for behaviour.
- Use Studio specs only when the output must remain visually editable.
- Do not recreate dropdown, dialog, combobox, popover, toast, or keyboard logic.`;

const studioCode = `{
\t"id": "email-field",
\t"label": "Email field",
\t"component": "ElTextInput",
\t"props": {
\t\t"label": "Email address",
\t\t"placeholder": "you@example.com"
\t}
}`;

const componentDocCode = `<script setup>
defineOptions({
\t__doc: {
\t\tname: 'Text input',
\t\ttag: '<ElTextInput>',
\t\tdescription: 'A labelled single-line text field.',
\t\ticon: 'M5 7h14M12 7v10M8 17h8',
\t\tnav: {
\t\t\tgroup: 'Forms',
\t\t\tbadge: 'New',
\t\t},
\t\tstudio: {
\t\t\tgroup: 'Forms',
\t\t\ticon: 'T',
\t\t\thidden: false,
\t\t},
\t\tevents: [
\t\t\t{ name: 'update:modelValue', payload: 'string', description: 'Fired when text changes.' },
\t\t],
\t}
});
<\/script>`;

const promptCode = `When building with Elements:
1. Prefer existing Elements components and blocks before custom markup.
2. Use Elements theme tokens, not raw colours.
3. Use component props for behaviour; use classes only for layout and spacing.
4. Keep forms native where possible, and rely on Elements for accessibility.
5. Return Studio specs only when the UI should be visually edited later.
6. When returning Studio specs, give every node a stable id and human label.`;
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="AI Builders"
			tagline="How Elements should be shaped so LLM agents can generate polished apps that remain editable in Studio."
			tag="Strategy"
			eyebrow="Foundation"
		>
			<DocSection eyebrow="Goal" title="Make the best path the easiest path">
				<div class="grid gap-4 md:grid-cols-2">
					<div class="rounded-3xl border border-border bg-card p-6 text-card-foreground">
						<h3 class="text-lg font-semibold tracking-tight">For LLM-built apps</h3>
						<p class="mt-2 text-sm leading-6 text-muted-foreground">
							Elements gives AI a compact set of reliable choices: accessible primitives for behaviour, visual components for surfaces, and blocks for complete application patterns.
						</p>
					</div>
					<div class="rounded-3xl border border-border bg-card p-6 text-card-foreground">
						<h3 class="text-lg font-semibold tracking-tight">For human follow-through</h3>
						<p class="mt-2 text-sm leading-6 text-muted-foreground">
							The output should be easy to read, easy to change, and when needed, easy to round-trip through Studio as a named tree of components, props, and children.
						</p>
					</div>
				</div>
			</DocSection>

			<DocSection eyebrow="Principles" title="What AI should learn from Elements">
				<div class="grid gap-4 md:grid-cols-2">
					<article v-for="principle in principles" :key="principle.title" class="rounded-2xl border border-border bg-card p-5 text-card-foreground">
						<h3 class="font-semibold tracking-tight">{{ principle.title }}</h3>
						<p class="mt-2 text-sm leading-6 text-muted-foreground">{{ principle.body }}</p>
					</article>
				</div>
			</DocSection>

			<DocSection eyebrow="LLM docs" title="What actually helps an AI use Elements">
				<div class="overflow-hidden rounded-2xl border border-border">
					<table class="w-full text-left text-sm">
						<thead class="bg-secondary text-xs uppercase tracking-[0.14em] text-muted-foreground">
							<tr>
								<th class="px-4 py-3 font-semibold">Area</th>
								<th class="px-4 py-3 font-semibold">Why it helps</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border bg-background">
							<tr v-for="row in llmContract" :key="row[0]">
								<td class="px-4 py-3 font-medium text-foreground">{{ row[0] }}</td>
								<td class="px-4 py-3 text-muted-foreground">{{ row[1] }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</DocSection>

			<DocSection eyebrow="Terse context" title="A small docs file beats a long sales page">
				<div class="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
					<div class="rounded-3xl border border-border bg-card p-6 text-card-foreground">
						<h3 class="text-lg font-semibold tracking-tight">What /llms.txt is for</h3>
						<p class="mt-2 text-sm leading-6 text-muted-foreground">
							The AI-facing documentation should be short, direct, and practical. It should name the components, explain the house style, and tell an agent which patterns to prefer.
						</p>
						<p class="mt-3 text-sm leading-6 text-muted-foreground">
							The public docs can sell the vision. The LLM file should behave more like a recipe card.
						</p>
					</div>
					<CodeBlock lang="md" :code="docsCode" />
				</div>
			</DocSection>

			<DocSection eyebrow="Editable output" title="Prefer Studio specs for AI-authored UI">
				<div class="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
					<div class="rounded-3xl border border-border bg-card p-6 text-card-foreground">
						<h3 class="text-lg font-semibold tracking-tight">Why specs beat raw markup</h3>
						<p class="mt-2 text-sm leading-6 text-muted-foreground">
							Specs preserve the intent behind the UI. A card is still a card, a password field is still a password field, and each layer has a stable identity for later editing.
						</p>
						<ul class="mt-5 space-y-2 text-sm text-muted-foreground">
							<li class="flex gap-2"><span class="text-success">OK</span><span>Components can be inspected and reconfigured.</span></li>
							<li class="flex gap-2"><span class="text-success">OK</span><span>Blocks can be composed, duplicated, and normalized.</span></li>
							<li class="flex gap-2"><span class="text-success">OK</span><span>Generated apps can round-trip through Studio.</span></li>
						</ul>
					</div>
					<CodeBlock lang="json" :code="specCode" />
				</div>
			</DocSection>

			<DocSection eyebrow="Studio metadata" title="_edit is for Studio, not the main AI contract">
				<div class="grid gap-4 lg:grid-cols-2">
					<div class="rounded-3xl border border-border bg-card p-6 text-card-foreground">
						<p class="text-sm leading-6 text-muted-foreground">
							The <code class="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">_edit</code> blocks are mostly for Studio. They tell the inspector which editor to render for a prop.
						</p>
						<p class="mt-3 text-sm leading-6 text-muted-foreground">
							They can help an AI only in the narrower case where the AI is generating Studio-aware components or specs. For ordinary app generation, examples, props, events, and theme rules matter more.
						</p>
					</div>
					<CodeBlock lang="json" :code="studioCode" />
				</div>
			</DocSection>

			<DocSection eyebrow="Component folders" title="Component metadata lives with the component">
				<div class="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
					<div class="rounded-3xl border border-border bg-card p-6 text-card-foreground">
						<h3 class="text-lg font-semibold tracking-tight">Discovery convention</h3>
						<p class="mt-2 text-sm leading-6 text-muted-foreground">
							Each component can live beside its docs page and examples. A component manager discovers folders and paths, then the inspector reads Vue props and the component's
							<code class="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">__doc</code> metadata when a view needs labels, docs, or Studio settings.
						</p>
						<p class="mt-3 text-sm leading-6 text-muted-foreground">
							Set <code class="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">studio.hidden</code> when a helper component should be exported but not offered in Studio.
						</p>
					</div>
					<CodeBlock lang="vue" :code="componentDocCode" />
				</div>
			</DocSection>

			<DocSection eyebrow="Roadmap" title="What to add next">
				<div class="grid gap-4 md:grid-cols-2">
					<article v-for="item in additions" :key="item.title" class="rounded-2xl border border-border bg-card p-5 text-card-foreground">
						<h3 class="font-semibold tracking-tight">{{ item.title }}</h3>
						<p class="mt-2 text-sm leading-6 text-muted-foreground">{{ item.body }}</p>
					</article>
				</div>
			</DocSection>

			<DocSection eyebrow="Future examples" title="AI-specific UI patterns">
				<div class="grid gap-4 md:grid-cols-2">
					<article v-for="item in futureAiPages" :key="item.title" class="rounded-2xl border border-border bg-card p-5 text-card-foreground">
						<h3 class="font-semibold tracking-tight">{{ item.title }}</h3>
						<p class="mt-2 text-sm leading-6 text-muted-foreground">{{ item.body }}</p>
					</article>
				</div>
			</DocSection>

			<DocSection eyebrow="Prompt contract" title="A short instruction block for AI tools">
				<CodeBlock lang="md" :code="promptCode" />
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
