<script setup>
import { computed, reactive, ref } from 'vue';
import ElementsLayout from '../_layout/ElementsLayout.vue';
import DocPage from '../_layout/DocPage.vue';
import DocSection from '../_layout/DocSection.vue';
import CodeBlock from '../_layout/CodeBlock.vue';
import imageBackground from '../../companies/newiconBg.png';

const presets = [
	{
		name: 'Native frost',
		accent: '#0a84ff',
		tint: '#ffffff',
		ink: '#111827',
		haze: '#f6f8fb',
		gradientA: '#dbeafe',
		gradientB: '#f8fafc',
		gradientC: '#d1fae5',
		opacity: 62,
		blur: 28,
		saturation: 175,
		radius: 28,
		shadowY: 24,
		shadowBlur: 72,
		shadowAlpha: 18,
		borderAlpha: 72,
		topLight: 72,
		bottomShade: 28,
		glow: 28,
	},
	{
		name: 'Dark glass',
		accent: '#5e9cff',
		tint: '#111827',
		ink: '#f8fafc',
		haze: '#020617',
		gradientA: '#1d4ed8',
		gradientB: '#111827',
		gradientC: '#7c3aed',
		opacity: 58,
		blur: 34,
		saturation: 190,
		radius: 30,
		shadowY: 34,
		shadowBlur: 92,
		shadowAlpha: 42,
		borderAlpha: 26,
		topLight: 44,
		bottomShade: 42,
		glow: 38,
	},
	{
		name: 'Warm sheet',
		accent: '#ff8a3d',
		tint: '#fff7ed',
		ink: '#24160b',
		haze: '#fffbeb',
		gradientA: '#fed7aa',
		gradientB: '#ffffff',
		gradientC: '#fde68a',
		opacity: 68,
		blur: 22,
		saturation: 145,
		radius: 24,
		shadowY: 18,
		shadowBlur: 58,
		shadowAlpha: 16,
		borderAlpha: 64,
		topLight: 76,
		bottomShade: 22,
		glow: 20,
	},
	{
		name: 'Crisp utility',
		accent: '#22c55e',
		tint: '#f8fafc',
		ink: '#0f172a',
		haze: '#eef2f7',
		gradientA: '#e0f2fe',
		gradientB: '#f8fafc',
		gradientC: '#dcfce7',
		opacity: 78,
		blur: 16,
		saturation: 130,
		radius: 18,
		shadowY: 12,
		shadowBlur: 34,
		shadowAlpha: 12,
		borderAlpha: 82,
		topLight: 64,
		bottomShade: 18,
		glow: 14,
	},
];

const frameworkTheme = reactive({
	background: '#f8fafc',
	foreground: '#111827',
	card: '#ffffff',
	cardForeground: '#111827',
	popover: '#ffffff',
	popoverForeground: '#111827',
	primary: '#111827',
	primaryForeground: '#ffffff',
	secondary: '#eef2f7',
	secondaryForeground: '#111827',
	muted: '#f1f5f9',
	mutedForeground: '#64748b',
	accent: '#e0f2fe',
	accentForeground: '#0f172a',
	border: '#dbe3ec',
	input: '#cbd5e1',
	ring: '#0a84ff',
	surfaceGlass: 62,
	surfaceBlur: 18,
	surfaceLight: 64,
	surfaceShade: 18,
	surfaceShadow: 18,
	buttonGlass: 20,
	buttonLight: 48,
	buttonShade: 14,
	radius: 18,
	controlRadius: 12,
});

const frameworkTokenControls = [
	{ label: 'Background', key: 'background' },
	{ label: 'Foreground', key: 'foreground' },
	{ label: 'Card', key: 'card' },
	{ label: 'Card foreground', key: 'cardForeground' },
	{ label: 'Popover', key: 'popover' },
	{ label: 'Popover foreground', key: 'popoverForeground' },
	{ label: 'Primary', key: 'primary' },
	{ label: 'Primary foreground', key: 'primaryForeground' },
	{ label: 'Secondary', key: 'secondary' },
	{ label: 'Secondary foreground', key: 'secondaryForeground' },
	{ label: 'Muted', key: 'muted' },
	{ label: 'Muted foreground', key: 'mutedForeground' },
	{ label: 'Accent', key: 'accent' },
	{ label: 'Accent foreground', key: 'accentForeground' },
	{ label: 'Border', key: 'border' },
	{ label: 'Input', key: 'input' },
	{ label: 'Ring', key: 'ring' },
];

const frameworkChromeControls = [
	{ label: 'Surface glass', key: 'surfaceGlass', min: 0, max: 92, unit: '%' },
	{ label: 'Surface blur', key: 'surfaceBlur', min: 0, max: 40, unit: 'px' },
	{ label: 'Surface light', key: 'surfaceLight', min: 0, max: 100, unit: '%' },
	{ label: 'Surface shade', key: 'surfaceShade', min: 0, max: 70, unit: '%' },
	{ label: 'Surface shadow', key: 'surfaceShadow', min: 0, max: 60, unit: '%' },
	{ label: 'Button glass', key: 'buttonGlass', min: 0, max: 80, unit: '%' },
	{ label: 'Button light', key: 'buttonLight', min: 0, max: 100, unit: '%' },
	{ label: 'Button shade', key: 'buttonShade', min: 0, max: 70, unit: '%' },
	{ label: 'Surface radius', key: 'radius', min: 8, max: 34, unit: 'px' },
	{ label: 'Control radius', key: 'controlRadius', min: 6, max: 24, unit: 'px' },
];

const frameworkStyle = computed(() => ({
	'--fw-background': frameworkTheme.background,
	'--fw-foreground': frameworkTheme.foreground,
	'--fw-card': frameworkTheme.card,
	'--fw-card-foreground': frameworkTheme.cardForeground,
	'--fw-popover': frameworkTheme.popover,
	'--fw-popover-foreground': frameworkTheme.popoverForeground,
	'--fw-primary': frameworkTheme.primary,
	'--fw-primary-foreground': frameworkTheme.primaryForeground,
	'--fw-secondary': frameworkTheme.secondary,
	'--fw-secondary-foreground': frameworkTheme.secondaryForeground,
	'--fw-muted': frameworkTheme.muted,
	'--fw-muted-foreground': frameworkTheme.mutedForeground,
	'--fw-accent': frameworkTheme.accent,
	'--fw-accent-foreground': frameworkTheme.accentForeground,
	'--fw-border': frameworkTheme.border,
	'--fw-input': frameworkTheme.input,
	'--fw-ring': frameworkTheme.ring,
	'--fw-surface-glass': hexToRgb(frameworkTheme.card, frameworkTheme.surfaceGlass / 100),
	'--fw-surface-soft': hexToRgb(frameworkTheme.card, Math.max((frameworkTheme.surfaceGlass - 24) / 100, 0.08)),
	'--fw-surface-light': hexToRgb('#ffffff', frameworkTheme.surfaceLight / 100),
	'--fw-surface-shade': hexToRgb('#020617', frameworkTheme.surfaceShade / 100),
	'--fw-surface-shadow': `0 24px 70px ${hexToRgb('#020617', frameworkTheme.surfaceShadow / 100)}`,
	'--fw-surface-blur': `${frameworkTheme.surfaceBlur}px`,
	'--fw-button-glass': hexToRgb(frameworkTheme.primary, Math.max(frameworkTheme.buttonGlass / 100, 0.08)),
	'--fw-button-light': hexToRgb('#ffffff', frameworkTheme.buttonLight / 100),
	'--fw-button-shade': hexToRgb('#020617', frameworkTheme.buttonShade / 100),
	'--fw-radius': `${frameworkTheme.radius}px`,
	'--fw-control-radius': `${frameworkTheme.controlRadius}px`,
}));

const frameworkCss = computed(() => `:root {
\t--background: ${frameworkTheme.background};
\t--foreground: ${frameworkTheme.foreground};
\t--card: ${frameworkTheme.card};
\t--card-foreground: ${frameworkTheme.cardForeground};
\t--popover: ${frameworkTheme.popover};
\t--popover-foreground: ${frameworkTheme.popoverForeground};
\t--primary: ${frameworkTheme.primary};
\t--primary-foreground: ${frameworkTheme.primaryForeground};
\t--secondary: ${frameworkTheme.secondary};
\t--secondary-foreground: ${frameworkTheme.secondaryForeground};
\t--muted: ${frameworkTheme.muted};
\t--muted-foreground: ${frameworkTheme.mutedForeground};
\t--accent: ${frameworkTheme.accent};
\t--accent-foreground: ${frameworkTheme.accentForeground};
\t--border: ${frameworkTheme.border};
\t--input: ${frameworkTheme.input};
\t--ring: ${frameworkTheme.ring};
\t--radius: ${frameworkTheme.radius}px;
}

.surface-chrome {
\tborder: 1px solid transparent;
\tbackground:
\t\tlinear-gradient(180deg, ${hexToRgb('#ffffff', frameworkTheme.surfaceLight / 100)}, transparent 40%, ${hexToRgb('#020617', frameworkTheme.surfaceShade / 100)}) padding-box,
\t\tlinear-gradient(135deg, ${hexToRgb(frameworkTheme.card, frameworkTheme.surfaceGlass / 100)}, ${hexToRgb(frameworkTheme.card, Math.max((frameworkTheme.surfaceGlass - 24) / 100, 0.08))}) padding-box,
\t\tlinear-gradient(180deg, ${hexToRgb('#ffffff', Math.min((frameworkTheme.surfaceLight + 12) / 100, 0.96))}, ${frameworkTheme.border} 52%, ${hexToRgb('#020617', Math.max(frameworkTheme.surfaceShade / 100, 0.12))}) border-box;
\tbox-shadow: 0 24px 70px ${hexToRgb('#020617', frameworkTheme.surfaceShadow / 100)};
\tbackdrop-filter: blur(${frameworkTheme.surfaceBlur}px) saturate(160%);
}`);

const theme = reactive({ ...presets[0] });
const backgroundMode = ref('gradient');
const backgroundImageIndex = ref(0);

const backgroundOptions = [
	{ label: 'Gradient', value: 'gradient' },
	{ label: 'Image', value: 'image' },
];

const backgroundImages = [
	{
		name: 'Product glass',
		url: imageBackground,
		cssUrl: '/assets/newiconBg.png',
	},
	{
		name: 'Architecture',
		url: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1600&q=80',
		cssUrl: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1600&q=80',
	},
	{
		name: 'Landscape',
		url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
		cssUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
	},
	{
		name: 'Workspace',
		url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80',
		cssUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80',
	},
];

const activeBackgroundImage = computed(() => backgroundImages[backgroundImageIndex.value]);
const nextBackgroundImage = computed(() => backgroundImages[(backgroundImageIndex.value + 1) % backgroundImages.length]);

const swatches = computed(() => [
	{ label: 'Accent', key: 'accent', value: theme.accent },
	{ label: 'Tint', key: 'tint', value: theme.tint },
	{ label: 'Ink', key: 'ink', value: theme.ink },
	{ label: 'Haze', key: 'haze', value: theme.haze },
	{ label: 'Gradient A', key: 'gradientA', value: theme.gradientA },
	{ label: 'Gradient B', key: 'gradientB', value: theme.gradientB },
	{ label: 'Gradient C', key: 'gradientC', value: theme.gradientC },
]);

const labStyle = computed(() => ({
	'--lab-accent': theme.accent,
	'--lab-tint': theme.tint,
	'--lab-ink': theme.ink,
	'--lab-haze': theme.haze,
	'--lab-gradient-a': theme.gradientA,
	'--lab-gradient-b': theme.gradientB,
	'--lab-gradient-c': theme.gradientC,
	'--lab-glass': hexToRgb(theme.tint, theme.opacity / 100),
	'--lab-glass-soft': hexToRgb(theme.tint, Math.max((theme.opacity - 22) / 100, 0.12)),
	'--lab-light-wash': hexToRgb('#ffffff', theme.topLight / 100),
	'--lab-bottom-shade': hexToRgb('#020617', theme.bottomShade / 100),
	'--lab-ring-light': hexToRgb('#ffffff', Math.min((theme.topLight + 12) / 100, 0.96)),
	'--lab-ring-mid': hexToRgb(theme.accent, Math.max(theme.borderAlpha / 260, 0.12)),
	'--lab-ring-dark': hexToRgb('#020617', Math.max(theme.bottomShade / 100, 0.14)),
	'--lab-shadow': `0 ${theme.shadowY}px ${theme.shadowBlur}px rgb(15 23 42 / ${theme.shadowAlpha / 100})`,
	'--lab-glow': `0 0 ${theme.glow}px ${hexToRgb(theme.accent, 0.26)}`,
	'--lab-radius': `${theme.radius}px`,
	'--lab-blur': `${theme.blur}px`,
	'--lab-saturation': `${theme.saturation}%`,
}));

const backgroundStyle = computed(() => {
	if (backgroundMode.value === 'image') {
		return {
			backgroundImage: `
				linear-gradient(90deg, rgb(2 6 23 / 0.08), rgb(2 6 23 / 0.18)),
				url(${activeBackgroundImage.value.url})
			`,
			backgroundPosition: 'center',
			backgroundSize: 'cover',
		};
	}

	return {
		background: `
			radial-gradient(circle at 14% 18%, ${hexToRgb(theme.gradientA, 0.95)}, transparent 32%),
			radial-gradient(circle at 82% 12%, ${hexToRgb(theme.gradientC, 0.9)}, transparent 30%),
			linear-gradient(135deg, ${theme.gradientB}, ${theme.haze})
		`,
	};
});

const canvasCss = computed(() => {
	if (backgroundMode.value === 'image') {
		return `.glass-canvas {
\tbackground:
\t\tlinear-gradient(90deg, rgb(2 6 23 / 0.08), rgb(2 6 23 / 0.18)),
\t\turl("${activeBackgroundImage.value.cssUrl}") center / cover;
}`;
	}

	return `.glass-canvas {
\tbackground:
\t\tradial-gradient(circle at 14% 18%, ${hexToRgb(theme.gradientA, 0.95)}, transparent 32%),
\t\tradial-gradient(circle at 82% 12%, ${hexToRgb(theme.gradientC, 0.9)}, transparent 30%),
\t\tlinear-gradient(135deg, ${theme.gradientB}, ${theme.haze});
}`;
});

const glassCss = computed(() => `.glass-panel {
\tcolor: ${theme.ink};
\tborder: 1px solid transparent;
\tborder-radius: ${theme.radius}px;
\tbackground:
\t\tlinear-gradient(180deg, ${hexToRgb('#ffffff', theme.topLight / 100)}, transparent 38%, ${hexToRgb('#020617', theme.bottomShade / 100)}) padding-box,
\t\tlinear-gradient(135deg, ${hexToRgb(theme.tint, theme.opacity / 100)}, ${hexToRgb(theme.tint, Math.max((theme.opacity - 22) / 100, 0.12))}) padding-box,
\t\tlinear-gradient(180deg, ${hexToRgb('#ffffff', Math.min((theme.topLight + 12) / 100, 0.96))}, ${hexToRgb(theme.accent, Math.max(theme.borderAlpha / 260, 0.12))} 48%, ${hexToRgb('#020617', Math.max(theme.bottomShade / 100, 0.14))}) border-box;
\tbox-shadow:
\t\tinset 0 1px 0 ${hexToRgb('#ffffff', Math.min((theme.topLight + 14) / 100, 0.95))},
\t\tinset 0 -34px 58px ${hexToRgb('#020617', Math.max(theme.bottomShade / 100, 0.08))},
\t\t0 ${theme.shadowY}px ${theme.shadowBlur}px rgb(15 23 42 / ${theme.shadowAlpha / 100});
\tbackdrop-filter: blur(${theme.blur}px) saturate(${theme.saturation}%);
}

${canvasCss.value}`);

function applyPreset(preset) {
	Object.assign(theme, preset);
}

function cycleBackgroundImage() {
	backgroundMode.value = 'image';
	backgroundImageIndex.value = (backgroundImageIndex.value + 1) % backgroundImages.length;
}

function hexToRgb(hex, alpha = 1) {
	const value = hex.replace('#', '');
	const full = value.length === 3
		? value.split('').map((char) => char + char).join('')
		: value.padEnd(6, '0').slice(0, 6);
	const number = Number.parseInt(full, 16);
	const r = (number >> 16) & 255;
	const g = (number >> 8) & 255;
	const b = number & 255;

	return `rgb(${r} ${g} ${b} / ${alpha.toFixed(2)})`;
}
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Theme lab"
			tagline="Experiment with framework tokens, surface chrome, button treatments, and glass materials without changing the live component system."
			tag="theme playground"
			eyebrow="Foundation"
		>
			<DocSection eyebrow="Framework" title="Token and chrome lab">
				<div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]" :style="frameworkStyle">
					<section class="framework-lab-shell">
						<div class="framework-topbar">
							<div>
								<p class="framework-kicker">Application shell</p>
								<h2 class="framework-title">Framework surfaces</h2>
							</div>
							<div class="flex flex-wrap items-center gap-2">
								<button class="framework-button framework-button-secondary">Preview</button>
								<button class="framework-button framework-button-primary">Publish</button>
							</div>
						</div>

						<div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
							<div class="space-y-4">
								<div class="framework-card">
									<div class="flex flex-wrap items-start justify-between gap-4">
										<div>
											<p class="framework-kicker">Card</p>
											<p class="text-2xl font-semibold">Revenue health</p>
										</div>
										<span class="framework-pill">Live</span>
									</div>
									<div class="mt-5 grid gap-3 sm:grid-cols-3">
										<div class="framework-metric">
											<span>Pipeline</span>
											<strong>$86k</strong>
										</div>
										<div class="framework-metric">
											<span>Win rate</span>
											<strong>34%</strong>
										</div>
										<div class="framework-metric">
											<span>Cycle</span>
											<strong>12d</strong>
										</div>
									</div>
								</div>

								<div class="grid gap-4 md:grid-cols-2">
									<div class="framework-card">
										<p class="text-sm font-semibold">Button surfaces</p>
										<div class="mt-4 flex flex-wrap gap-2">
											<button class="framework-button framework-button-primary">Primary</button>
											<button class="framework-button framework-button-secondary">Secondary</button>
											<button class="framework-button framework-button-ghost">Ghost</button>
										</div>
									</div>
									<div class="framework-card">
										<p class="text-sm font-semibold">Input chrome</p>
										<label class="mt-4 block">
											<span class="mb-1 block text-xs text-[var(--fw-muted-foreground)]">Project name</span>
											<input class="framework-input" value="Glass redesign" readonly />
										</label>
									</div>
								</div>
							</div>

							<div class="space-y-4">
								<div class="framework-popover">
									<p class="framework-kicker">Dropdown menu</p>
									<button class="framework-menu-item framework-menu-item-active">Open dashboard</button>
									<button class="framework-menu-item">Invite team</button>
									<button class="framework-menu-item">Export report</button>
								</div>

								<div class="framework-dialog">
									<p class="framework-kicker">Dialog</p>
									<p class="mt-2 text-sm">Surface chrome should feel consistent across floating layers.</p>
									<div class="mt-4 flex gap-2">
										<button class="framework-button framework-button-secondary">Cancel</button>
										<button class="framework-button framework-button-primary">Confirm</button>
									</div>
								</div>
							</div>
						</div>
					</section>

					<aside class="space-y-4 rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-xl shadow-black/5">
						<div>
							<p class="text-sm font-semibold">style.css tokens</p>
							<div class="mt-3 grid max-h-[28rem] gap-3 overflow-y-auto pr-1">
								<label v-for="control in frameworkTokenControls" :key="control.key" class="grid gap-1.5">
									<span class="text-xs font-medium text-muted-foreground">{{ control.label }}</span>
									<span class="flex items-center gap-2">
										<input v-model="frameworkTheme[control.key]" type="color" class="h-9 w-11 rounded-lg border border-border bg-background" />
										<code class="min-w-0 flex-1 rounded-lg bg-secondary px-2 py-2 font-mono text-[11px] text-muted-foreground">{{ frameworkTheme[control.key] }}</code>
									</span>
								</label>
							</div>
						</div>

						<div>
							<p class="text-sm font-semibold">Chrome</p>
							<div class="mt-3 grid gap-3">
								<label v-for="control in frameworkChromeControls" :key="control.key" class="grid gap-1.5">
									<span class="flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
										<span>{{ control.label }}</span>
										<output class="font-mono">{{ frameworkTheme[control.key] }}{{ control.unit }}</output>
									</span>
									<input v-model.number="frameworkTheme[control.key]" type="range" :min="control.min" :max="control.max" />
								</label>
							</div>
						</div>
					</aside>
				</div>

				<CodeBlock lang="css" :code="frameworkCss" />
			</DocSection>

			<DocSection eyebrow="Sandbox" title="Glass-native material study">
				<div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]" :style="labStyle">
					<section class="theme-lab-canvas overflow-hidden rounded-3xl border border-border bg-secondary p-3 shadow-xl shadow-black/5">
						<div class="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/90 p-2 text-card-foreground shadow-sm backdrop-blur-xl">
							<div class="grid grid-cols-2 rounded-xl border border-border bg-secondary p-1">
								<button
									v-for="option in backgroundOptions"
									:key="option.value"
									class="rounded-lg px-4 py-2 text-xs font-medium transition"
									:class="backgroundMode === option.value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
									@click="backgroundMode = option.value"
								>
									{{ option.label }}
								</button>
							</div>
							<button
								class="rounded-xl border border-border bg-secondary px-4 py-2 text-xs font-medium text-foreground transition hover:border-primary/40"
								@click="cycleBackgroundImage"
							>
								Next image: {{ nextBackgroundImage.name }}
							</button>
						</div>

						<div class="relative min-h-[34rem] overflow-hidden rounded-[calc(var(--lab-radius)+10px)] p-4 sm:p-6">
							<div class="absolute inset-0" :style="backgroundStyle"></div>
							<div class="pointer-events-none absolute left-8 top-8 size-28 rounded-full bg-white/40 blur-3xl"></div>
							<div class="pointer-events-none absolute bottom-10 right-12 size-36 rounded-full bg-[var(--lab-accent)]/25 blur-3xl"></div>

							<div class="relative grid min-h-[30rem] content-between gap-5">
								<div class="theme-lab-panel p-5 sm:p-6">
									<div class="flex flex-wrap items-start justify-between gap-4">
										<div>
											<p class="text-xs font-semibold uppercase text-current/55">Material preview</p>
											<h2 class="mt-2 text-3xl font-semibold">Frosted workspace</h2>
										</div>
										<div class="flex items-center gap-2 rounded-full border border-white/40 bg-white/25 px-2 py-1 backdrop-blur-xl">
											<span class="size-2 rounded-full bg-[var(--lab-accent)] shadow-[var(--lab-glow)]"></span>
											<span class="pr-1 text-xs font-medium">Live surface</span>
										</div>
									</div>

									<div class="mt-7 grid gap-3 sm:grid-cols-3">
										<div class="theme-lab-stat">
											<p class="text-xs text-current/55">Revenue</p>
											<p class="mt-1 text-2xl font-semibold">$48.2k</p>
										</div>
										<div class="theme-lab-stat">
											<p class="text-xs text-current/55">Conversion</p>
											<p class="mt-1 text-2xl font-semibold">8.4%</p>
										</div>
										<div class="theme-lab-stat">
											<p class="text-xs text-current/55">Latency</p>
											<p class="mt-1 text-2xl font-semibold">124ms</p>
										</div>
									</div>
								</div>

								<div class="grid gap-5 lg:grid-cols-[1fr_15rem]">
									<div class="theme-lab-panel p-5">
										<div class="flex items-center justify-between gap-4">
											<div>
												<p class="text-sm font-semibold">Gradient behaviour</p>
												<p class="mt-1 text-sm text-current/60">The panel should borrow colour from behind it without losing text contrast.</p>
											</div>
											<button class="rounded-full bg-[var(--lab-accent)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--lab-glow)]">Apply</button>
										</div>
										<div class="mt-5 grid grid-cols-8 items-end gap-1.5">
											<span v-for="height in [38, 56, 44, 82, 64, 96, 70, 108]" :key="height" class="rounded-t-full bg-[var(--lab-accent)]/75" :style="{ height: `${height}px` }"></span>
										</div>
									</div>

									<div class="theme-lab-panel p-3">
										<div class="rounded-[calc(var(--lab-radius)-8px)] bg-white/20 p-3">
											<p class="text-xs font-semibold uppercase text-current/55">Actions</p>
											<div class="mt-3 space-y-1.5 text-sm">
												<button class="block w-full rounded-xl bg-white/28 px-3 py-2 text-left font-medium">Refine glass</button>
												<button class="block w-full rounded-xl px-3 py-2 text-left text-current/65 hover:bg-white/20">Save preset</button>
												<button class="block w-full rounded-xl px-3 py-2 text-left text-current/65 hover:bg-white/20">Compare dark</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>

					<aside class="space-y-4 rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-xl shadow-black/5">
						<div>
							<p class="text-sm font-semibold">Background</p>
							<div class="mt-3 grid grid-cols-2 rounded-2xl border border-border bg-secondary p-1">
								<button
									v-for="option in backgroundOptions"
									:key="option.value"
									class="rounded-xl px-3 py-2 text-xs font-medium transition"
									:class="backgroundMode === option.value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
									@click="backgroundMode = option.value"
								>
									{{ option.label }}
								</button>
							</div>
							<button
								class="mt-2 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-left text-xs font-medium text-foreground transition hover:border-primary/40"
								@click="cycleBackgroundImage"
							>
								Next image: {{ nextBackgroundImage.name }}
							</button>
						</div>

						<div>
							<p class="text-sm font-semibold">Presets</p>
							<div class="mt-3 grid grid-cols-2 gap-2">
								<button
									v-for="preset in presets"
									:key="preset.name"
									class="rounded-xl border border-border bg-secondary px-3 py-2 text-left text-xs font-medium text-foreground transition hover:border-primary/40"
									@click="applyPreset(preset)"
								>
									{{ preset.name }}
								</button>
							</div>
						</div>

						<div class="grid gap-3">
							<label v-for="swatch in swatches" :key="swatch.label" class="grid gap-1.5">
								<span class="text-xs font-medium text-muted-foreground">{{ swatch.label }}</span>
								<span class="flex items-center gap-2">
									<input v-model="theme[swatch.key]" type="color" class="h-9 w-11 rounded-lg border border-border bg-background" />
									<code class="min-w-0 flex-1 rounded-lg bg-secondary px-2 py-2 font-mono text-[11px] text-muted-foreground">{{ swatch.value }}</code>
								</span>
							</label>
						</div>
					</aside>
				</div>
			</DocSection>

			<DocSection eyebrow="Controls" title="Material controls">
				<div class="grid gap-4 md:grid-cols-2">
					<label class="theme-lab-control">
						<span>Glass opacity</span>
						<input v-model.number="theme.opacity" type="range" min="24" max="92" />
						<output>{{ theme.opacity }}%</output>
					</label>
					<label class="theme-lab-control">
						<span>Backdrop blur</span>
						<input v-model.number="theme.blur" type="range" min="0" max="48" />
						<output>{{ theme.blur }}px</output>
					</label>
					<label class="theme-lab-control">
						<span>Saturation</span>
						<input v-model.number="theme.saturation" type="range" min="80" max="220" />
						<output>{{ theme.saturation }}%</output>
					</label>
					<label class="theme-lab-control">
						<span>Radius</span>
						<input v-model.number="theme.radius" type="range" min="8" max="40" />
						<output>{{ theme.radius }}px</output>
					</label>
					<label class="theme-lab-control">
						<span>Shadow Y</span>
						<input v-model.number="theme.shadowY" type="range" min="0" max="56" />
						<output>{{ theme.shadowY }}px</output>
					</label>
					<label class="theme-lab-control">
						<span>Shadow blur</span>
						<input v-model.number="theme.shadowBlur" type="range" min="0" max="120" />
						<output>{{ theme.shadowBlur }}px</output>
					</label>
					<label class="theme-lab-control">
						<span>Shadow alpha</span>
						<input v-model.number="theme.shadowAlpha" type="range" min="0" max="60" />
						<output>{{ theme.shadowAlpha }}%</output>
					</label>
					<label class="theme-lab-control">
						<span>Border alpha</span>
						<input v-model.number="theme.borderAlpha" type="range" min="0" max="100" />
						<output>{{ theme.borderAlpha }}%</output>
					</label>
					<label class="theme-lab-control">
						<span>Top light</span>
						<input v-model.number="theme.topLight" type="range" min="0" max="100" />
						<output>{{ theme.topLight }}%</output>
					</label>
					<label class="theme-lab-control">
						<span>Bottom shade</span>
						<input v-model.number="theme.bottomShade" type="range" min="0" max="100" />
						<output>{{ theme.bottomShade }}%</output>
					</label>
				</div>
			</DocSection>

			<DocSection eyebrow="CSS" title="Copy the current direction into tokens">
				<CodeBlock lang="css" :code="glassCss" />
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>

<style scoped>
.framework-lab-shell {
	overflow: hidden;
	border: 1px solid var(--fw-border);
	border-radius: var(--fw-radius);
	background:
		radial-gradient(circle at 8% 10%, color-mix(in srgb, var(--fw-ring) 20%, transparent), transparent 30%),
		linear-gradient(135deg, color-mix(in srgb, var(--fw-background) 94%, white), var(--fw-background));
	color: var(--fw-foreground);
	padding: 1rem;
}

.framework-topbar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	margin-bottom: 1rem;
	border: 1px solid transparent;
	border-radius: var(--fw-radius);
	background:
		linear-gradient(180deg, var(--fw-surface-light), transparent 44%, var(--fw-surface-shade)) padding-box,
		linear-gradient(135deg, var(--fw-surface-glass), var(--fw-surface-soft)) padding-box,
		linear-gradient(180deg, color-mix(in srgb, white 82%, var(--fw-border)), var(--fw-border), color-mix(in srgb, black 20%, var(--fw-border))) border-box;
	padding: 1rem;
	box-shadow: var(--fw-surface-shadow);
	backdrop-filter: blur(var(--fw-surface-blur, 18px)) saturate(160%);
}

.framework-kicker {
	font-size: 0.72rem;
	font-weight: 700;
	text-transform: uppercase;
	color: var(--fw-muted-foreground);
}

.framework-title {
	margin-top: 0.25rem;
	font-size: 1.75rem;
	font-weight: 700;
}

.framework-card,
.framework-popover,
.framework-dialog {
	border: 1px solid transparent;
	border-radius: var(--fw-radius);
	background:
		linear-gradient(180deg, var(--fw-surface-light), transparent 42%, var(--fw-surface-shade)) padding-box,
		linear-gradient(135deg, var(--fw-surface-glass), var(--fw-surface-soft)) padding-box,
		linear-gradient(180deg, color-mix(in srgb, white 78%, var(--fw-border)), var(--fw-border), color-mix(in srgb, black 18%, var(--fw-border))) border-box;
	color: var(--fw-card-foreground);
	padding: 1rem;
	box-shadow: var(--fw-surface-shadow);
	backdrop-filter: blur(var(--fw-surface-blur, 18px)) saturate(160%);
	-webkit-backdrop-filter: blur(var(--fw-surface-blur, 18px)) saturate(160%);
}

.framework-popover,
.framework-dialog {
	color: var(--fw-popover-foreground);
}

.framework-pill {
	border: 1px solid color-mix(in srgb, var(--fw-ring) 36%, transparent);
	border-radius: 999px;
	background: color-mix(in srgb, var(--fw-ring) 16%, var(--fw-card));
	padding: 0.25rem 0.625rem;
	font-size: 0.75rem;
	font-weight: 700;
	color: var(--fw-foreground);
}

.framework-metric {
	border: 1px solid color-mix(in srgb, var(--fw-border) 70%, transparent);
	border-radius: var(--fw-control-radius);
	background: color-mix(in srgb, var(--fw-muted) 72%, transparent);
	padding: 0.875rem;
}

.framework-metric span {
	display: block;
	font-size: 0.75rem;
	color: var(--fw-muted-foreground);
}

.framework-metric strong {
	display: block;
	margin-top: 0.25rem;
	font-size: 1.25rem;
	color: var(--fw-foreground);
}

.framework-button {
	border: 1px solid transparent;
	border-radius: var(--fw-control-radius);
	padding: 0.6rem 0.9rem;
	font-size: 0.875rem;
	font-weight: 700;
	transition:
		transform 160ms ease,
		box-shadow 160ms ease,
		border-color 160ms ease;
}

.framework-button:hover {
	transform: translateY(-1px);
}

.framework-button-primary {
	background:
		linear-gradient(180deg, var(--fw-button-light), transparent 45%, var(--fw-button-shade)) padding-box,
		linear-gradient(135deg, var(--fw-primary), var(--fw-button-glass)) padding-box,
		linear-gradient(180deg, color-mix(in srgb, white 38%, var(--fw-primary)), var(--fw-primary)) border-box;
	color: var(--fw-primary-foreground);
	box-shadow: 0 14px 32px color-mix(in srgb, var(--fw-primary) 28%, transparent);
}

.framework-button-secondary,
.framework-button-ghost {
	background:
		linear-gradient(180deg, color-mix(in srgb, white 50%, transparent), transparent 52%, color-mix(in srgb, black 8%, transparent)) padding-box,
		var(--fw-secondary) padding-box,
		linear-gradient(180deg, color-mix(in srgb, white 80%, var(--fw-border)), var(--fw-border)) border-box;
	color: var(--fw-secondary-foreground);
}

.framework-button-ghost {
	background: transparent;
	color: var(--fw-foreground);
}

.framework-input {
	width: 100%;
	border: 1px solid var(--fw-input);
	border-radius: var(--fw-control-radius);
	background: color-mix(in srgb, var(--fw-background) 72%, transparent);
	padding: 0.65rem 0.75rem;
	color: var(--fw-foreground);
	outline: none;
	box-shadow: 0 0 0 3px color-mix(in srgb, var(--fw-ring) 14%, transparent);
}

.framework-menu-item {
	display: block;
	width: 100%;
	border-radius: var(--fw-control-radius);
	padding: 0.65rem 0.75rem;
	text-align: left;
	font-size: 0.875rem;
	color: var(--fw-muted-foreground);
	transition:
		background-color 160ms ease,
		color 160ms ease;
}

.framework-menu-item:hover,
.framework-menu-item-active {
	background: var(--fw-accent);
	color: var(--fw-accent-foreground);
}

.theme-lab-panel {
	color: var(--lab-ink);
	border: 1px solid transparent;
	border-radius: var(--lab-radius);
	background:
		linear-gradient(180deg, var(--lab-light-wash), transparent 38%, var(--lab-bottom-shade)) padding-box,
		linear-gradient(135deg, var(--lab-glass), var(--lab-glass-soft)) padding-box,
		linear-gradient(180deg, var(--lab-ring-light), var(--lab-ring-mid) 48%, var(--lab-ring-dark)) border-box;
	box-shadow:
		inset 0 1px 0 rgb(255 255 255 / 0.72),
		inset 0 -34px 58px var(--lab-bottom-shade),
		var(--lab-shadow);
	backdrop-filter: blur(var(--lab-blur)) saturate(var(--lab-saturation));
	-webkit-backdrop-filter: blur(var(--lab-blur)) saturate(var(--lab-saturation));
}

.theme-lab-stat {
	border: 1px solid transparent;
	border-radius: calc(var(--lab-radius) - 10px);
	background:
		linear-gradient(180deg, rgb(255 255 255 / 0.3), rgb(255 255 255 / 0.08) 48%, rgb(2 6 23 / 0.12)) padding-box,
		linear-gradient(180deg, var(--lab-ring-light), transparent 56%, var(--lab-ring-dark)) border-box;
	padding: 1rem;
	box-shadow:
		inset 0 1px 0 rgb(255 255 255 / 0.5),
		inset 0 -18px 36px rgb(2 6 23 / 0.1);
}

.theme-lab-control {
	display: grid;
	grid-template-columns: minmax(7rem, 1fr) minmax(8rem, 2fr) 4.5rem;
	align-items: center;
	gap: 0.75rem;
	border: 1px solid var(--border);
	border-radius: var(--radius-xl);
	background: var(--card);
	padding: 0.875rem 1rem;
	color: var(--card-foreground);
	box-shadow: 0 10px 30px rgb(15 23 42 / 0.04);
}

.theme-lab-control span {
	font-size: 0.875rem;
	font-weight: 600;
}

.theme-lab-control output {
	justify-self: end;
	border-radius: var(--radius-md);
	background: var(--secondary);
	padding: 0.25rem 0.5rem;
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
	font-size: 0.75rem;
	color: var(--muted-foreground);
}

.theme-lab-control input {
	accent-color: var(--primary);
}

@media (max-width: 640px) {
	.theme-lab-control {
		grid-template-columns: 1fr;
	}

	.theme-lab-control output {
		justify-self: start;
	}
}
</style>
