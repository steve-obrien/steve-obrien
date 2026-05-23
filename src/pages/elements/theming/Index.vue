<script setup>
import ElementsLayout from '../_layout/ElementsLayout.vue';
import DocPage from '../_layout/DocPage.vue';
import DocSection from '../_layout/DocSection.vue';
import CodeBlock from '../_layout/CodeBlock.vue';

const tokenPairs = [
	{
		name: 'Background',
		skin: '--background',
		foreground: '--foreground',
		utilities: 'bg-background text-foreground',
		use: 'The app canvas and ordinary page text.',
	},
	{
		name: 'Card',
		skin: '--card-skin',
		foreground: '--card',
		utilities: 'bg-card-skin text-card',
		use: 'Raised or grouped content, panels, toast bodies, and dialogs.',
	},
	{
		name: 'Popover',
		skin: '--popover-skin',
		foreground: '--popover',
		utilities: 'bg-popover-skin text-popover',
		use: 'Floating menus, combobox panels, dropdowns, and command palettes.',
	},
	{
		name: 'Primary',
		skin: '--primary-skin',
		foreground: '--primary',
		utilities: 'bg-primary-skin text-primary',
		use: 'Primary actions and high emphasis selected states.',
	},
	{
		name: 'Secondary',
		skin: '--secondary-skin',
		foreground: '--secondary',
		utilities: 'bg-secondary-skin text-secondary',
		use: 'Quiet buttons, subtle panels, inactive controls, and helper UI.',
	},
	{
		name: 'Muted',
		skin: '--muted-skin',
		foreground: '--muted',
		utilities: 'bg-muted-skin text-muted',
		use: 'Low-emphasis backgrounds and supporting copy.',
	},
	{
		name: 'Accent',
		skin: '--accent-skin',
		foreground: '--accent',
		utilities: 'bg-accent-skin text-accent',
		use: 'Hover, focus, active rows, and soft selected states.',
	},
	{
		name: 'Destructive',
		skin: '--destructive-skin',
		foreground: '--destructive',
		utilities: 'bg-destructive-skin text-destructive',
		use: 'Delete, remove, error, and irreversible actions.',
	},
	{
		name: 'Success',
		skin: '--success-skin',
		foreground: '--success',
		utilities: 'bg-success-skin text-success',
		use: 'Saved, complete, connected, and positive confirmation states.',
	},
	{
		name: 'Warning',
		skin: '--warning-skin',
		foreground: '--warning',
		utilities: 'bg-warning-skin text-warning',
		use: 'Attention, pending review, expiring, and recoverable risk states.',
	},
];

const utilityTokens = [
	{
		name: 'Border',
		token: '--border',
		utility: 'border-border ring-border divide-border',
		use: 'Edges, separators, low-emphasis rings, and component outlines.',
	},
	{
		name: 'Input',
		token: '--input',
		utility: 'border-input bg-background',
		use: 'Input borders and control tracks that should read as editable.',
	},
	{
		name: 'Ring',
		token: '--ring',
		utility: 'focus-visible:ring-ring outline-ring',
		use: 'Keyboard focus, inspector selection, and strong focus affordances.',
	},
];

const decisionRows = [
	['Page background', 'bg-background text-foreground', 'Use once at layout level.'],
	['Dialog, drawer, toast, card', 'bg-card-skin text-card', 'Use for contained surfaces that are not floating menus.'],
	['Popover, dropdown, combobox menu', 'bg-popover-skin text-popover', 'Use for layers attached to a trigger.'],
	['Primary button', 'bg-primary-skin text-primary', 'The flipped pair: skin paints, base token reads on top.'],
	['Secondary button', 'bg-secondary-skin text-foreground', 'Quiet control with normal readable text.'],
	['Menu item hover', 'hover:bg-accent-skin hover:text-accent', 'Use accent for temporary interaction states.'],
	['Helper copy', 'text-muted', 'Use for hints, captions, placeholders, and metadata.'],
	['Danger action', 'text-destructive-skin or bg-destructive-skin text-destructive', 'Text-only for subtle danger, filled for destructive confirmation.'],
	['Success status', 'bg-success-skin text-success', 'Use for positive, completed, or saved states.'],
	['Warning status', 'bg-warning-skin text-warning', 'Use when attention is needed but the action is recoverable.'],
	['Focus state', 'focus-visible:ring-ring', 'Use for keyboard focus, usually with a transparent offset.'],
];

const themeCode = `:root {
\t--background: oklch(1 0 0);
\t--foreground: oklch(0.145 0 0);
\t--primary-skin: oklch(0.205 0 0);
\t--primary: oklch(0.985 0 0);
\t--success-skin: oklch(0.627 0.194 149.214);
\t--success: oklch(0.985 0 0);
\t--warning-skin: oklch(0.84 0.16 84);
\t--warning: oklch(0.28 0.07 46);
}`;

const usageCode = `<button class="rounded-full bg-primary-skin px-4 py-2 text-primary">
\tSave changes
</button>

<div class="rounded-2xl border border-border bg-card-skin p-4 text-card">
\t<p class="text-sm text-secondary">Use secondary text inside a card.</p>
</div>

<div class="rounded-2xl bg-popover-skin p-2 text-popover shadow-2xl">
\t<button class="rounded-xl px-3 py-2 hover:bg-accent-skin hover:text-accent">
\t\tOpen project
\t</button>
</div>`;

function swatchStyle(pair) {
	return {
		background: `var(${pair.skin})`,
		color: `var(${pair.foreground})`,
	};
}

function utilitySwatchStyle(token) {
	return {
		background: `var(${token.token})`,
	};
}
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Theming"
			tagline="Elements use css variable design tokens, the surface colour carries the -skin suffix and the readable foreground keeps the plain token name you'd expect from tailwindcss."
			tag="style.css"
			eyebrow="Foundation"
		>
			<DocSection eyebrow="Model" title="Skin paints, token reads">
				<div class="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
					<div class="rounded-3xl border border-border bg-card-skin p-6 text-card shadow-xl shadow-black/5">
						<p class="text-sm leading-6 text-secondary">
							Use <code class="rounded bg-secondary-skin px-1.5 py-0.5 font-mono text-xs">*-skin</code>
							when you are painting a surface. Use the plain token when text or icons need to sit on that surface.
						</p>
						<div class="mt-6 grid gap-3 sm:grid-cols-2">
							<div class="rounded-2xl bg-primary-skin p-4 text-primary">
								<p class="text-xs font-semibold uppercase tracking-[0.16em] opacity-75">Filled action</p>
								<p class="mt-2 text-lg font-semibold">bg-primary-skin</p>
								<p class="mt-1 text-sm opacity-80">text-primary</p>
							</div>
							<div class="rounded-2xl border border-border bg-secondary-skin p-4 text-foreground">
								<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Quiet surface</p>
								<p class="mt-2 text-lg font-semibold">bg-secondary-skin</p>
								<p class="mt-1 text-sm text-secondary">text-secondary or text-foreground</p>
							</div>
						</div>
					</div>
					<div class="rounded-3xl border border-border bg-secondary-skin/50 p-6">
						<p class="text-sm font-semibold text-foreground">Mapping from shadcn</p>
						<dl class="mt-4 space-y-3 text-sm">
							<div class="rounded-2xl border border-border bg-background p-3">
								<dt class="font-mono text-xs text-muted">shadcn --primary</dt>
								<dd class="mt-1 font-mono text-foreground">Elements --primary-skin</dd>
							</div>
							<div class="rounded-2xl border border-border bg-background p-3">
								<dt class="font-mono text-xs text-muted">shadcn --primary-foreground</dt>
								<dd class="mt-1 font-mono text-foreground">Elements --primary</dd>
							</div>
							<div class="rounded-2xl border border-border bg-background p-3">
								<dt class="font-mono text-xs text-muted">Same pattern</dt>
								<dd class="mt-1 font-mono text-foreground">success, warning, destructive, card, popover</dd>
							</div>
						</dl>
					</div>
				</div>
			</DocSection>

			<DocSection eyebrow="At a glance" title="Read the theme as a product surface">
				<div class="overflow-hidden rounded-3xl border border-border bg-background shadow-2xl shadow-black/5">
					<div class="border-b border-border bg-card-skin px-5 py-4">
						<div class="flex flex-wrap items-center justify-between gap-3">
							<div>
								<p class="text-sm font-semibold text-foreground">Project dashboard</p>
								<p class="text-xs text-muted">Example composition using only semantic tokens.</p>
							</div>
							<div class="flex items-center gap-2">
								<span class="rounded-full bg-success-skin px-2.5 py-1 text-xs font-medium text-success">Saved</span>
								<button class="rounded-full bg-primary-skin px-4 py-2 text-sm font-medium text-primary shadow-sm">Publish</button>
							</div>
						</div>
					</div>
					<div class="grid gap-4 p-5 lg:grid-cols-[1fr_18rem]">
						<div class="space-y-4">
							<div class="rounded-2xl border border-border bg-card-skin p-4 text-card">
								<div class="flex items-start justify-between gap-4">
									<div>
										<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Revenue</p>
										<p class="mt-2 text-3xl font-semibold tracking-tight">GBP 42,860</p>
									</div>
									<span class="rounded-full bg-success-skin/15 px-2.5 py-1 text-xs font-medium text-success-skin">+12.4%</span>
								</div>
								<div class="mt-5 grid grid-cols-6 gap-1">
									<span v-for="height in [32, 48, 38, 64, 52, 78]" :key="height" class="rounded-t-lg bg-primary-skin/80" :style="{ height: `${height}px` }"></span>
								</div>
							</div>
							<div class="grid gap-4 sm:grid-cols-2">
								<div class="rounded-2xl border border-border bg-secondary-skin/70 p-4">
									<p class="text-sm font-medium text-foreground">Quiet panel</p>
									<p class="mt-1 text-sm text-secondary">Secondary skins group nearby controls without demanding attention.</p>
								</div>
								<div class="rounded-2xl border border-warning-skin/40 bg-warning-skin/15 p-4 text-warning">
									<p class="text-sm font-semibold">Review needed</p>
									<p class="mt-1 text-sm opacity-80">Warning tokens should feel noticeable, not alarming.</p>
								</div>
							</div>
						</div>
						<div class="space-y-3 rounded-2xl border border-border bg-popover-skin p-3 text-popover shadow-xl shadow-black/10">
							<p class="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Command menu</p>
							<button class="block w-full rounded-xl bg-accent-skin px-3 py-2 text-left text-sm font-medium text-accent">Open project</button>
							<button class="block w-full rounded-xl px-3 py-2 text-left text-sm text-secondary hover:bg-accent-skin hover:text-accent">Invite teammate</button>
							<button class="block w-full rounded-xl px-3 py-2 text-left text-sm text-destructive-skin hover:bg-destructive-skin hover:text-destructive">Delete project</button>
						</div>
					</div>
				</div>
			</DocSection>

			<DocSection eyebrow="Tokens" title="Palette and pairs">
				<div class="grid gap-4 md:grid-cols-2">
					<article
						v-for="pair in tokenPairs"
						:key="pair.name"
						class="overflow-hidden rounded-2xl border border-border bg-card-skin text-card"
					>
						<div class="flex min-h-28 items-end p-4" :style="swatchStyle(pair)">
							<div>
								<p class="text-lg font-semibold">{{ pair.name }}</p>
								<p class="font-mono text-xs opacity-80">{{ pair.utilities }}</p>
							</div>
						</div>
						<div class="space-y-3 p-4">
							<p class="text-sm text-secondary">{{ pair.use }}</p>
							<div class="grid gap-2 text-xs">
								<div class="flex items-center justify-between gap-3">
									<span class="text-muted">Surface</span>
									<code class="font-mono text-foreground">{{ pair.skin }}</code>
								</div>
								<div class="flex items-center justify-between gap-3">
									<span class="text-muted">Foreground</span>
									<code class="font-mono text-foreground">{{ pair.foreground }}</code>
								</div>
							</div>
						</div>
					</article>
				</div>

				<div class="mt-4 grid gap-4 md:grid-cols-3">
					<article
						v-for="token in utilityTokens"
						:key="token.name"
						class="rounded-2xl border border-border bg-card-skin p-4 text-card"
					>
						<div class="flex items-center gap-3">
							<span class="size-10 rounded-xl ring-1 ring-border" :style="utilitySwatchStyle(token)"></span>
							<div>
								<p class="font-semibold">{{ token.name }}</p>
								<code class="font-mono text-xs text-muted">{{ token.token }}</code>
							</div>
						</div>
						<p class="mt-3 text-sm text-secondary">{{ token.use }}</p>
						<p class="mt-3 rounded-lg bg-secondary-skin px-2 py-1 font-mono text-xs text-secondary">{{ token.utility }}</p>
					</article>
				</div>
			</DocSection>

			<DocSection eyebrow="Decision guide" title="Which token should I use?">
				<div class="overflow-x-auto overflow-y-hidden rounded-2xl border border-border">
					<table class="w-full min-w-[42rem] text-left text-sm">
						<thead class="bg-secondary-skin text-xs uppercase tracking-[0.14em] text-muted">
							<tr>
								<th class="px-4 py-3 font-semibold">Intent</th>
								<th class="px-4 py-3 font-semibold">Utility</th>
								<th class="px-4 py-3 font-semibold">Rule of thumb</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border bg-background">
							<tr v-for="row in decisionRows" :key="row[0]">
								<td class="px-4 py-3 font-medium text-foreground">{{ row[0] }}</td>
								<td class="px-4 py-3"><code class="font-mono text-xs text-secondary">{{ row[1] }}</code></td>
								<td class="px-4 py-3 text-secondary">{{ row[2] }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</DocSection>

			<DocSection eyebrow="Code" title="Define and consume tokens">
				<div class="grid gap-4 lg:grid-cols-2">
					<CodeBlock lang="css" :code="themeCode" />
					<CodeBlock lang="html" :code="usageCode" />
				</div>
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
