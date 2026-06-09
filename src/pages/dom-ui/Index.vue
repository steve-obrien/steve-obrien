<script setup>
import { computed, ref } from 'vue';

const activeLayer = ref('vue');
const spotlight = ref({ x: 62, y: 36 });
const domStudioUrl = 'https://getdom.studio';
const domStudioDocsUrl = `${domStudioUrl}/components/button`;
const domStudioPricingUrl = `${domStudioUrl}/pricing`;

const layers = [
	{
		id: 'vue',
		label: 'Vue',
		kicker: '@getdom/studio/vue',
		title: 'Product-ready Vue components with the DOM still in charge.',
		body: 'Slots, v-model, form state, and polished styling sit on top of framework-neutral primitives.',
		code: [
			"import { DomButton, DomDialog } from '@getdom/studio/vue';",
			'',
			'<DomDialog v-model="open" title="Invite teammate">',
			'	<DomButton>Send invite</DomButton>',
			'</DomDialog>',
		],
	},
	{
		id: 'headless',
		label: 'Headless',
		kicker: '@getdom/studio/headless',
		title: 'Custom elements for behavior you can drop into anything.',
		body: 'Dialogs, popovers, tabs, comboboxes, and menus ship as tiny web components with keyboard and focus behavior baked in.',
		code: [
			"import '@getdom/studio/headless/dialog.js';",
			'',
			'<dom-dialog>',
			'	<button slot="trigger">Open panel</button>',
			'	<form method="dialog">...</form>',
			'</dom-dialog>',
		],
	},
	{
		id: 'studio',
		label: 'Studio',
		kicker: 'DOM Studio',
		title: 'Inspectable components for generated apps that can grow up.',
		body: 'Docs, props, examples, and inspector hints live beside the component source so AI-built screens stay editable.',
		code: [
			'defineDomComponent({',
			"	name: 'DomCombobox',",
			"	inspector: ['options', 'placeholder', 'disabled'],",
			"	examples: ['PeopleLookup', 'AsyncSearch'],",
			'});',
		],
	},
];

const stats = [
	{ value: '28+', label: 'primitives' },
	{ value: '<2kb', label: 'headless avg' },
	{ value: '0', label: 'styling lock-in' },
];

const componentMap = [
	{ name: 'Dialog', kind: 'focus trap', x: 18, y: 30, mobileX: 18, mobileY: 36 },
	{ name: 'Combobox', kind: 'typeahead', x: 38, y: 16, mobileX: 42, mobileY: 20 },
	{ name: 'Popover', kind: 'floating', x: 64, y: 24, mobileX: 72, mobileY: 30 },
	{ name: 'Form', kind: 'schema', x: 76, y: 52, mobileX: 78, mobileY: 58 },
	{ name: 'Tabs', kind: 'roving focus', x: 49, y: 68, mobileX: 51, mobileY: 74 },
	{ name: 'Toast', kind: 'live region', x: 24, y: 66, mobileX: 18, mobileY: 74 },
];

const pillars = [
	{
		title: 'Framework-neutral core',
		body: 'Plain custom elements handle behavior first, so the same primitive can work in Vue, Rails, static HTML, or whatever comes next.',
	},
	{
		title: 'Vue layer that feels native',
		body: 'The Vue package gives app teams the ergonomics they expect without hiding the underlying DOM contract.',
	},
	{
		title: 'Documentation as source',
		body: 'Examples, prop metadata, events, keyboard support, and inspector hints travel with the component instead of living in a separate graveyard.',
	},
	{
		title: 'Built for AI editing',
		body: 'Generated screens can expose their component tree, adjust props, and keep real source code readable after the first pass.',
	},
];

const activeLayerDetails = computed(() => layers.find((layer) => layer.id === activeLayer.value) || layers[0]);

function updateSpotlight(event) {
	const rect = event.currentTarget.getBoundingClientRect();
	spotlight.value = {
		x: Math.round(((event.clientX - rect.left) / rect.width) * 100),
		y: Math.round(((event.clientY - rect.top) / rect.height) * 100),
	};
}
</script>

<template>
	<main class="dom-ui-page">
		<section
			class="dom-hero"
			:style="{ '--spot-x': `${spotlight.x}%`, '--spot-y': `${spotlight.y}%` }"
			@mousemove="updateSpotlight"
		>
			<nav class="dom-nav" aria-label="DOM UI">
				<a class="dom-logo" href="#top" aria-label="DOM UI home">
					<span class="dom-logo-mark">DOM</span>
					<span>UI</span>
				</a>
				<div class="dom-nav-links">
					<a href="#layers">Layers</a>
					<a href="#systems">Systems</a>
					<a href="#launch">Launch</a>
				</div>
				<a class="dom-nav-action" :href="domStudioUrl">Current docs</a>
			</nav>

			<div id="top" class="dom-hero-grid">
				<div class="dom-hero-copy">
					<p class="dom-eyebrow">The grown-up home for the Elements framework</p>
					<h1>DOM UI</h1>
					<p class="dom-hero-lede">
						A flashy, serious interface kit built from headless custom elements, Vue components, and inspectable docs that AI can actually work with.
					</p>
					<div class="dom-hero-actions">
						<a class="dom-button dom-button-primary" href="#layers">Explore the stack</a>
						<a class="dom-button dom-button-secondary" :href="domStudioDocsUrl">Open the docs</a>
					</div>
					<div class="dom-stats" aria-label="DOM UI prototype stats">
						<div v-for="stat in stats" :key="stat.label">
							<strong>{{ stat.value }}</strong>
							<span>{{ stat.label }}</span>
						</div>
					</div>
				</div>

				<div class="dom-stage" aria-label="Interactive DOM UI component system visual">
					<div class="dom-stage-grid"></div>
					<div class="dom-flow-line dom-flow-line-one"></div>
					<div class="dom-flow-line dom-flow-line-two"></div>
					<div
						v-for="component in componentMap"
						:key="component.name"
						class="dom-node"
						:style="{
							'--node-x': `${component.x}%`,
							'--node-y': `${component.y}%`,
							'--node-mobile-x': `${component.mobileX}%`,
							'--node-mobile-y': `${component.mobileY}%`,
						}"
					>
						<strong>{{ component.name }}</strong>
						<span>{{ component.kind }}</span>
					</div>
					<div class="dom-code-window">
						<div class="dom-window-top">
							<span></span>
							<span></span>
							<span></span>
						</div>
<pre><code>customElements.define('dom-dialog', Dialog);
export { DomDialog } from '@getdom/studio/vue';</code></pre>
					</div>
				</div>
			</div>
		</section>

		<section id="layers" class="dom-section dom-layer-section">
			<div class="dom-section-heading">
				<p class="dom-eyebrow">One system, three surfaces</p>
				<h2>Ship the primitive, wrap the framework, document the intent.</h2>
			</div>

			<div class="dom-layer-shell">
				<div class="dom-tabs" role="tablist" aria-label="DOM UI layers">
					<button
						v-for="layer in layers"
						:key="layer.id"
						type="button"
						:class="['dom-tab', { 'is-active': layer.id === activeLayer }]"
						:aria-selected="layer.id === activeLayer"
						role="tab"
						@click="activeLayer = layer.id"
					>
						{{ layer.label }}
					</button>
				</div>

				<div class="dom-layer-content">
					<div>
						<p class="dom-mini-label">{{ activeLayerDetails.kicker }}</p>
						<h3>{{ activeLayerDetails.title }}</h3>
						<p>{{ activeLayerDetails.body }}</p>
					</div>
					<pre class="dom-code-block"><code>{{ activeLayerDetails.code.join('\n') }}</code></pre>
				</div>
			</div>
		</section>

		<section id="systems" class="dom-section dom-pillar-section">
			<div class="dom-section-heading">
				<p class="dom-eyebrow">Why DOM UI exists</p>
				<h2>Not another pretty button pack. A source-owned interface system.</h2>
			</div>

			<div class="dom-pillars">
				<article v-for="pillar in pillars" :key="pillar.title" class="dom-pillar">
					<h3>{{ pillar.title }}</h3>
					<p>{{ pillar.body }}</p>
				</article>
			</div>
		</section>

		<section id="launch" class="dom-section dom-launch">
			<div>
				<p class="dom-eyebrow">Prototype direction</p>
				<h2>Make dom-ui.com feel like a product, then split the repo when the shape is right.</h2>
			</div>
			<a class="dom-button dom-button-primary" :href="domStudioPricingUrl">Pressure test the offer</a>
		</section>
	</main>
</template>

<style scoped>
.dom-ui-page {
	--dom-ink: #07130f;
	--dom-paper: #f8fff7;
	--dom-cyan: #10c8f5;
	--dom-mint: #56f2a6;
	--dom-lime: #d7ff4f;
	--dom-coral: #ff6f59;
	--dom-violet: #7c5cff;
	--dom-line: color-mix(in oklab, var(--dom-paper) 18%, transparent);
	min-height: 100vh;
	background:
		linear-gradient(135deg, #07130f 0%, #0a1820 34%, #13200d 68%, #0f111f 100%);
	color: var(--dom-paper);
	font-family:
		Inter,
		"Plus Jakarta Sans",
		ui-sans-serif,
		system-ui,
		sans-serif;
	overflow-x: hidden;
}

.dom-hero {
	position: relative;
	min-height: 82svh;
	padding: 24px clamp(18px, 4vw, 64px) 44px;
	background:
		radial-gradient(circle at var(--spot-x, 62%) var(--spot-y, 36%), rgba(86, 242, 166, 0.24), transparent 24%),
		linear-gradient(90deg, rgba(16, 200, 245, 0.1) 1px, transparent 1px),
		linear-gradient(0deg, rgba(248, 255, 247, 0.08) 1px, transparent 1px);
	background-size: auto, 42px 42px, 42px 42px;
}

.dom-hero::before {
	content: "";
	position: absolute;
	inset: 0;
	pointer-events: none;
	background:
		linear-gradient(120deg, transparent 0 18%, rgba(16, 200, 245, 0.18) 18% 19%, transparent 19% 52%, rgba(255, 111, 89, 0.16) 52% 53%, transparent 53%),
		linear-gradient(180deg, transparent 0%, rgba(7, 19, 15, 0.88) 100%);
}

.dom-nav,
.dom-hero-grid,
.dom-section {
	position: relative;
	z-index: 1;
}

.dom-nav {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 18px;
	max-width: 1180px;
	margin: 0 auto;
}

.dom-logo,
.dom-nav a {
	color: inherit;
	text-decoration: none;
}

.dom-logo {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	font-size: 15px;
	font-weight: 850;
	letter-spacing: 0;
}

.dom-logo-mark {
	display: inline-grid;
	place-items: center;
	height: 34px;
	padding: 0 10px;
	border: 1px solid rgba(248, 255, 247, 0.28);
	border-radius: 8px;
	background: linear-gradient(135deg, rgba(86, 242, 166, 0.22), rgba(16, 200, 245, 0.16));
	color: var(--dom-lime);
}

.dom-nav-links {
	display: flex;
	align-items: center;
	gap: clamp(14px, 3vw, 34px);
	font-size: 13px;
	color: rgba(248, 255, 247, 0.72);
}

.dom-nav-links a:hover,
.dom-nav-action:hover {
	color: var(--dom-paper);
}

.dom-nav-action {
	border: 1px solid rgba(248, 255, 247, 0.2);
	border-radius: 8px;
	padding: 10px 13px;
	font-size: 13px;
	color: rgba(248, 255, 247, 0.78);
	background: rgba(248, 255, 247, 0.06);
}

.dom-hero-grid {
	display: grid;
	grid-template-columns: minmax(0, 0.96fr) minmax(410px, 1.04fr);
	align-items: center;
	gap: clamp(28px, 5vw, 72px);
	max-width: 1180px;
	margin: 0 auto;
	padding-top: clamp(42px, 7vw, 78px);
}

.dom-eyebrow,
.dom-mini-label {
	margin: 0;
	color: var(--dom-lime);
	font-size: 12px;
	font-weight: 800;
	letter-spacing: 0.14em;
	text-transform: uppercase;
}

.dom-hero-copy h1 {
	margin: 14px 0 0;
	font-size: clamp(64px, 9.2vw, 124px);
	font-weight: 950;
	line-height: 0.86;
	letter-spacing: 0;
}

.dom-hero-lede {
	max-width: 640px;
	margin: 22px 0 0;
	color: rgba(248, 255, 247, 0.8);
	font-size: clamp(18px, 2vw, 24px);
	line-height: 1.45;
}

.dom-hero-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
	margin-top: 28px;
}

.dom-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-height: 46px;
	border-radius: 8px;
	padding: 0 18px;
	font-size: 14px;
	font-weight: 800;
	text-decoration: none;
	transition:
		transform 160ms ease,
		border-color 160ms ease,
		background-color 160ms ease;
}

.dom-button:hover {
	transform: translateY(-2px);
}

.dom-button-primary {
	border: 1px solid color-mix(in oklab, var(--dom-lime) 70%, white 20%);
	background: linear-gradient(135deg, var(--dom-lime), var(--dom-mint));
	color: #07130f;
	box-shadow: 0 18px 46px rgba(86, 242, 166, 0.24);
}

.dom-button-secondary {
	border: 1px solid rgba(248, 255, 247, 0.22);
	background: rgba(248, 255, 247, 0.07);
	color: var(--dom-paper);
}

.dom-stats {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 10px;
	max-width: 560px;
	margin-top: 28px;
}

.dom-stats div {
	border: 1px solid rgba(248, 255, 247, 0.16);
	border-radius: 8px;
	padding: 14px;
	background: rgba(7, 19, 15, 0.38);
}

.dom-stats strong,
.dom-stats span {
	display: block;
}

.dom-stats strong {
	font-size: clamp(22px, 3vw, 34px);
	line-height: 1;
}

.dom-stats span {
	margin-top: 8px;
	color: rgba(248, 255, 247, 0.62);
	font-size: 12px;
}

.dom-stage {
	position: relative;
	min-height: 460px;
	border: 1px solid rgba(248, 255, 247, 0.2);
	border-radius: 8px;
	background:
		linear-gradient(145deg, rgba(248, 255, 247, 0.11), rgba(248, 255, 247, 0.03)),
		linear-gradient(135deg, rgba(16, 200, 245, 0.1), rgba(255, 111, 89, 0.08));
	box-shadow:
		0 42px 120px rgba(0, 0, 0, 0.42),
		inset 0 1px 0 rgba(248, 255, 247, 0.18);
	overflow: hidden;
}

.dom-stage-grid {
	position: absolute;
	inset: 0;
	background:
		linear-gradient(90deg, rgba(248, 255, 247, 0.1) 1px, transparent 1px),
		linear-gradient(0deg, rgba(248, 255, 247, 0.1) 1px, transparent 1px);
	background-size: 56px 56px;
	mask-image: radial-gradient(circle at center, black, transparent 78%);
}

.dom-flow-line {
	position: absolute;
	width: 82%;
	height: 1px;
	left: 10%;
	background: linear-gradient(90deg, transparent, var(--dom-cyan), var(--dom-lime), transparent);
	transform-origin: center;
	animation: dom-scan 4.8s linear infinite;
}

.dom-flow-line-one {
	top: 36%;
	transform: rotate(18deg);
}

.dom-flow-line-two {
	top: 60%;
	transform: rotate(-24deg);
	animation-delay: -2.4s;
}

.dom-node {
	position: absolute;
	left: var(--node-x);
	top: var(--node-y);
	width: 138px;
	border: 1px solid rgba(248, 255, 247, 0.24);
	border-radius: 8px;
	padding: 11px 12px;
	background: rgba(7, 19, 15, 0.74);
	backdrop-filter: blur(14px);
	box-shadow: 0 18px 34px rgba(0, 0, 0, 0.25);
	transform: translate(-50%, -50%);
	animation: dom-float 7s ease-in-out infinite;
}

.dom-node:nth-of-type(4n) {
	border-color: rgba(86, 242, 166, 0.42);
}

.dom-node:nth-of-type(5n) {
	border-color: rgba(255, 111, 89, 0.42);
}

.dom-node strong,
.dom-node span {
	display: block;
}

.dom-node strong {
	font-size: 13px;
}

.dom-node span {
	margin-top: 4px;
	color: rgba(248, 255, 247, 0.58);
	font-size: 11px;
}

.dom-code-window {
	position: absolute;
	right: 20px;
	bottom: 20px;
	width: min(390px, calc(100% - 52px));
	border: 1px solid rgba(248, 255, 247, 0.2);
	border-radius: 8px;
	background: rgba(4, 10, 14, 0.88);
	box-shadow: 0 28px 80px rgba(0, 0, 0, 0.38);
	overflow: hidden;
}

.dom-window-top {
	display: flex;
	gap: 7px;
	padding: 12px;
	border-bottom: 1px solid rgba(248, 255, 247, 0.12);
}

.dom-window-top span {
	width: 9px;
	height: 9px;
	border-radius: 999px;
	background: var(--dom-coral);
}

.dom-window-top span:nth-child(2) {
	background: var(--dom-lime);
}

.dom-window-top span:nth-child(3) {
	background: var(--dom-cyan);
}

.dom-code-window pre,
.dom-code-block {
	margin: 0;
	white-space: pre-wrap;
	color: rgba(248, 255, 247, 0.82);
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
	font-size: 12.5px;
	line-height: 1.7;
}

.dom-code-window pre {
	padding: 18px;
}

.dom-section {
	max-width: 1180px;
	margin: 0 auto;
	padding: clamp(62px, 9vw, 112px) clamp(18px, 4vw, 64px);
}

.dom-section-heading {
	max-width: 760px;
}

.dom-section-heading h2,
.dom-launch h2 {
	margin: 12px 0 0;
	font-size: clamp(36px, 6vw, 76px);
	font-weight: 920;
	line-height: 0.98;
	letter-spacing: 0;
}

.dom-layer-shell {
	margin-top: 34px;
	border: 1px solid rgba(248, 255, 247, 0.18);
	border-radius: 8px;
	background: rgba(248, 255, 247, 0.06);
	overflow: hidden;
}

.dom-tabs {
	display: flex;
	gap: 8px;
	padding: 10px;
	border-bottom: 1px solid rgba(248, 255, 247, 0.14);
}

.dom-tab {
	min-height: 40px;
	border: 1px solid transparent;
	border-radius: 8px;
	padding: 0 16px;
	background: transparent;
	color: rgba(248, 255, 247, 0.62);
	font: inherit;
	font-size: 13px;
	font-weight: 800;
	cursor: pointer;
}

.dom-tab.is-active {
	border-color: rgba(215, 255, 79, 0.42);
	background: rgba(215, 255, 79, 0.12);
	color: var(--dom-paper);
}

.dom-layer-content {
	display: grid;
	grid-template-columns: minmax(0, 0.9fr) minmax(360px, 1.1fr);
	gap: 28px;
	align-items: stretch;
	padding: clamp(20px, 4vw, 42px);
}

.dom-layer-content h3 {
	margin: 12px 0 0;
	font-size: clamp(30px, 4vw, 54px);
	line-height: 1;
	letter-spacing: 0;
}

.dom-layer-content p:not(.dom-mini-label) {
	max-width: 520px;
	margin: 18px 0 0;
	color: rgba(248, 255, 247, 0.68);
	font-size: 17px;
	line-height: 1.62;
}

.dom-code-block {
	min-height: 250px;
	border: 1px solid rgba(248, 255, 247, 0.13);
	border-radius: 8px;
	padding: 22px;
	background:
		linear-gradient(135deg, rgba(16, 200, 245, 0.08), transparent),
		rgba(5, 12, 18, 0.74);
	overflow: auto;
}

.dom-pillars {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 12px;
	margin-top: 34px;
}

.dom-pillar {
	min-height: 250px;
	border: 1px solid rgba(248, 255, 247, 0.16);
	border-radius: 8px;
	padding: 20px;
	background: rgba(248, 255, 247, 0.05);
}

.dom-pillar h3 {
	margin: 0;
	font-size: 20px;
	line-height: 1.1;
}

.dom-pillar p {
	margin: 16px 0 0;
	color: rgba(248, 255, 247, 0.66);
	font-size: 14px;
	line-height: 1.62;
}

.dom-launch {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	gap: 28px;
	border-top: 1px solid rgba(248, 255, 247, 0.14);
}

.dom-launch > div {
	max-width: 820px;
}

@keyframes dom-scan {
	0% {
		opacity: 0;
		translate: -20% 0;
	}

	35%,
	72% {
		opacity: 1;
	}

	100% {
		opacity: 0;
		translate: 20% 0;
	}
}

@keyframes dom-float {
	0%,
	100% {
		translate: 0 0;
	}

	50% {
		translate: 0 -10px;
	}
}

@media (max-width: 960px) {
	.dom-hero-grid,
	.dom-layer-content {
		grid-template-columns: 1fr;
	}

	.dom-stage {
		min-height: 430px;
	}

	.dom-pillars {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (max-width: 700px) {
	.dom-hero {
		min-height: 0;
		padding-bottom: 34px;
	}

	.dom-nav {
		align-items: flex-start;
	}

	.dom-nav-links {
		display: none;
	}

	.dom-hero-grid {
		gap: 24px;
		padding-top: 40px;
	}

	.dom-hero-copy h1 {
		font-size: clamp(70px, 23vw, 116px);
	}

	.dom-stats,
	.dom-pillars {
		grid-template-columns: 1fr;
	}

	.dom-stats {
		display: none;
	}

	.dom-stage {
		min-height: 260px;
	}

	.dom-node {
		left: var(--node-mobile-x);
		top: var(--node-mobile-y);
		width: 104px;
		padding: 8px 9px;
	}

	.dom-node strong {
		font-size: 11px;
	}

	.dom-node span {
		font-size: 10px;
	}

	.dom-code-window {
		display: none;
	}

	.dom-tabs {
		overflow-x: auto;
	}

	.dom-launch {
		display: block;
	}

	.dom-launch .dom-button {
		margin-top: 24px;
	}
}
</style>
