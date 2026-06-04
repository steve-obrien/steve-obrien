<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import ElementsLayout from '../_layout/ElementsLayout.vue';
import DocPage from '../_layout/DocPage.vue';
import DocSection from '../_layout/DocSection.vue';
import CodeBlock from '../_layout/CodeBlock.vue';
import { ElPopover } from '../lib/vue';

const tokenPairs = [
	{
		name: 'Background',
		surface: '--background',
		foreground: '--foreground',
		utilities: 'bg-background text-foreground',
		use: 'The app canvas and ordinary page text.',
	},
	{
		name: 'Card',
		surface: '--card',
		foreground: '--card-foreground',
		utilities: 'bg-card text-card-foreground',
		use: 'Raised or grouped content, panels, toast bodies, and dialogs.',
	},
	{
		name: 'Popover',
		surface: '--popover',
		foreground: '--popover-foreground',
		utilities: 'bg-popover text-popover-foreground',
		use: 'Floating menus, combobox panels, dropdowns, and command palettes.',
	},
	{
		name: 'Primary',
		surface: '--primary',
		foreground: '--primary-foreground',
		utilities: 'bg-primary text-primary-foreground',
		use: 'Primary actions and high emphasis selected states.',
	},
	{
		name: 'Secondary',
		surface: '--secondary',
		foreground: '--secondary-foreground',
		utilities: 'bg-secondary text-secondary-foreground',
		use: 'Quiet buttons, subtle panels, inactive controls, and helper UI.',
	},
	{
		name: 'Muted',
		surface: '--muted',
		foreground: '--muted-foreground',
		utilities: 'bg-muted text-muted-foreground',
		use: 'Low-emphasis backgrounds and supporting copy.',
	},
	{
		name: 'Accent',
		surface: '--accent',
		foreground: '--accent-foreground',
		utilities: 'bg-accent text-accent-foreground',
		use: 'Hover, focus, active rows, and soft selected states.',
	},
	{
		name: 'Destructive',
		surface: '--destructive',
		foreground: '--destructive-foreground',
		utilities: 'bg-destructive text-destructive-foreground',
		use: 'Delete, remove, error, and irreversible actions.',
	},
	{
		name: 'Success',
		surface: '--success',
		foreground: '--success-foreground',
		utilities: 'bg-success text-success-foreground',
		use: 'Saved, complete, connected, and positive confirmation states.',
	},
	{
		name: 'Warning',
		surface: '--warning',
		foreground: '--warning-foreground',
		utilities: 'bg-warning text-warning-foreground',
		use: 'Attention, pending review, expiring, and recoverable risk states.',
	},
];

const foregroundBySurface = Object.fromEntries(tokenPairs.map((pair) => [pair.surface, pair.foreground]));
const surfaceByForeground = Object.fromEntries(tokenPairs.map((pair) => [pair.foreground, pair.surface]));

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

const themeModes = [
	{ label: 'Light', value: 'light', selector: ':root' },
	{ label: 'Dark', value: 'dark', selector: '[data-theme="dark"]' },
];

const themeTokenDefaults = {
	light: {
		'--background': 'oklch(1 0 0)',
		'--foreground': 'oklch(0.145 0 0)',
		'--card': 'oklch(1 0 0)',
		'--card-foreground': 'oklch(0.145 0 0)',
		'--popover': 'oklch(1 0 0)',
		'--popover-foreground': 'oklch(0.145 0 0)',
		'--primary': 'oklch(0.205 0 0)',
		'--primary-foreground': 'oklch(0.985 0 0)',
		'--secondary': 'oklch(0.97 0 0)',
		'--secondary-foreground': 'oklch(0.205 0 0)',
		'--muted': 'oklch(0.97 0 0)',
		'--muted-foreground': 'oklch(0.5 0 0)',
		'--accent': 'oklch(0.97 0 0)',
		'--accent-foreground': 'oklch(0.205 0 0)',
		'--destructive': 'oklch(0.577 0.245 27.325)',
		'--destructive-foreground': 'oklch(0.985 0 0)',
		'--success': 'oklch(0.627 0.194 149.214)',
		'--success-foreground': 'oklch(0.985 0 0)',
		'--warning': 'oklch(0.84 0.16 84)',
		'--warning-foreground': 'oklch(0.28 0.07 46)',
		'--border': 'oklch(0.922 0 0)',
		'--input': 'oklch(0.922 0 0)',
		'--ring': 'oklch(0.708 0 0)',
	},
	dark: {
		'--background': 'oklch(0.145 0 0)',
		'--foreground': 'oklch(0.985 0 0)',
		'--card': 'oklch(0.205 0 0)',
		'--card-foreground': 'oklch(0.985 0 0)',
		'--popover': 'oklch(0.205 0 0)',
		'--popover-foreground': 'oklch(0.985 0 0)',
		'--primary': 'oklch(0.922 0 0)',
		'--primary-foreground': 'oklch(0.205 0 0)',
		'--secondary': 'oklch(0.269 0 0)',
		'--secondary-foreground': 'oklch(0.985 0 0)',
		'--muted': 'oklch(0.269 0 0)',
		'--muted-foreground': 'oklch(0.708 0 0)',
		'--accent': 'oklch(0.269 0 0)',
		'--accent-foreground': 'oklch(0.985 0 0)',
		'--destructive': 'oklch(0.704 0.191 22.216)',
		'--destructive-foreground': 'oklch(0.985 0 0)',
		'--success': 'oklch(0.696 0.17 162.48)',
		'--success-foreground': 'oklch(0.145 0 0)',
		'--warning': 'oklch(0.769 0.188 70.08)',
		'--warning-foreground': 'oklch(0.145 0 0)',
		'--border': 'oklch(0.269 0 0)',
		'--input': 'oklch(0.32 0 0)',
		'--ring': 'oklch(0.556 0 0)',
	},
};

const appearanceTokenDefaults = {
	'--radius': '0.625rem',
	'--shadow-color': '#000000',
	'--shadow-strength': '8%',
	'--shadow-distance': '1',
	'--shadow-softness': '1',
};

const appearanceTokenGroups = [
	{
		label: 'Corners',
		description: 'The base radius that feeds the rounded scale.',
		tokens: [
			{
				label: 'Corner radius',
				name: '--radius',
				type: 'range',
				min: 0,
				max: 1.25,
				step: 0.025,
				unit: 'rem',
				use: 'Controls rounded-sm through rounded-4xl.',
			},
		],
	},
	{
		label: 'Flatness and shadow',
		description: 'Lower strength, distance, and softness make the system feel flatter.',
		tokens: [
			{
				label: 'Shadow strength',
				name: '--shadow-strength',
				type: 'range',
				min: 0,
				max: 28,
				step: 1,
				unit: '%',
				use: 'Opacity mixed into the shadow scale.',
			},
			{
				label: 'Shadow distance',
				name: '--shadow-distance',
				type: 'range',
				min: 0,
				max: 2,
				step: 0.05,
				unit: '',
				use: 'Vertical offset multiplier for all elevations.',
			},
			{
				label: 'Shadow softness',
				name: '--shadow-softness',
				type: 'range',
				min: 0.25,
				max: 2,
				step: 0.05,
				unit: '',
				use: 'Blur multiplier for the shadow scale.',
			},
			{
				label: 'Shadow color',
				name: '--shadow-color',
				type: 'color',
				use: 'The colour mixed into shadow utilities.',
			},
		],
	},
];

const editableAppearanceTokens = appearanceTokenGroups.flatMap((group) => group.tokens);

const shadowPreviewLevels = [
	{ label: 'XS', token: '--shadow-xs' },
	{ label: 'SM', token: '--shadow-sm' },
	{ label: 'MD', token: '--shadow-md' },
	{ label: 'LG', token: '--shadow-lg' },
	{ label: 'XL', token: '--shadow-xl' },
	{ label: '2XL', token: '--shadow-2xl' },
];

const editorTokenGroups = [
	{
		label: 'Canvas',
		description: 'Page background and ordinary text.',
		tokens: [
			{ label: 'Background', role: 'Surface', name: '--background' },
			{ label: 'Foreground', role: 'Foreground', name: '--foreground' },
		],
	},
	...tokenPairs.slice(1).map((pair) => ({
		label: pair.name,
		description: pair.use,
		tokens: [
			{ label: pair.name, role: 'Surface', name: pair.surface },
			{ label: `${pair.name} foreground`, role: 'Foreground', name: pair.foreground },
		],
	})),
	{
		label: 'Edges and focus',
		description: 'Borders, input chrome, and keyboard focus rings.',
		tokens: utilityTokens.map((token) => ({
			label: token.name,
			role: 'Utility',
			name: token.token,
		})),
	},
];

const editableColorTokens = Array.from(new Map(
	editorTokenGroups.flatMap((group) => group.tokens).map((token) => [token.name, token]),
).values());

function createThemeEditorState() {
	return {
		appearance: { ...appearanceTokenDefaults },
		colors: Object.fromEntries(themeModes.map((mode) => [
			mode.value,
			Object.fromEntries(editableColorTokens.map((token) => [token.name, oklchToHex(themeTokenDefaults[mode.value][token.name])])),
		])),
	};
}

function getThemeEditorState() {
	const state = typeof window === 'undefined'
		? createThemeEditorState()
		: window.__elementsThemeEditorState ||= createThemeEditorState();

	for (const token of editableAppearanceTokens) {
		state.appearance[token.name] ??= appearanceTokenDefaults[token.name];
	}
	for (const mode of themeModes) {
		state.colors[mode.value] ??= {};
		for (const token of editableColorTokens) {
			state.colors[mode.value][token.name] ??= oklchToHex(themeTokenDefaults[mode.value][token.name]);
		}
	}

	return state;
}

const decisionRows = [
	['Page background', 'bg-background text-foreground', 'Use once at layout level.'],
	['Dialog, drawer, toast, card', 'bg-card text-card-foreground', 'Use for contained surfaces that are not floating menus.'],
	['Popover, dropdown, combobox menu', 'bg-popover text-popover-foreground', 'Use for layers attached to a trigger.'],
	['Primary button', 'bg-primary text-primary-foreground', 'Use the token pair: base token paints, foreground token reads on top.'],
	['Secondary button', 'bg-secondary text-secondary-foreground', 'Quiet control with a paired readable foreground.'],
	['Menu item hover', 'hover:bg-accent hover:text-accent-foreground', 'Use accent for temporary interaction states.'],
	['Helper copy', 'text-muted-foreground', 'Use for hints, captions, placeholders, and metadata.'],
	['Danger action', 'text-destructive or bg-destructive text-destructive-foreground', 'Text-only for subtle danger, filled for destructive confirmation.'],
	['Success status', 'bg-success text-success-foreground', 'Use for positive, completed, or saved states.'],
	['Warning status', 'bg-warning text-warning-foreground', 'Use when attention is needed but the action is recoverable.'],
	['Focus state', 'focus-visible:ring-ring', 'Use for keyboard focus, usually with a transparent offset.'],
];

const themeCode = `:root {
\t--background: oklch(1 0 0);
\t--foreground: oklch(0.145 0 0);
\t--primary: oklch(0.205 0 0);
\t--primary-foreground: oklch(0.985 0 0);
\t--success: oklch(0.627 0.194 149.214);
\t--success-foreground: oklch(0.985 0 0);
\t--warning: oklch(0.84 0.16 84);
\t--warning-foreground: oklch(0.28 0.07 46);
}`;

const usageCode = `<button class="rounded-full bg-primary px-4 py-2 text-primary-foreground">
\tSave changes
</button>

<div class="rounded-2xl border border-border bg-card p-4 text-card-foreground">
\t<p class="text-sm text-muted-foreground">Use secondary text inside a card.</p>
</div>

<div class="rounded-2xl bg-popover p-2 text-popover-foreground shadow-2xl">
\t<button class="rounded-xl px-3 py-2 hover:bg-accent hover:text-accent-foreground">
\t\tOpen project
\t</button>
</div>`;

const themeEditorState = getThemeEditorState();
const tokenHexValues = reactive(themeEditorState.colors);
const appearanceValues = reactive(themeEditorState.appearance);
const activeMode = ref('light');
const activeTokenName = ref('--primary');
const aiThemePrompt = ref('');
const aiThemeStatus = ref('');
const isGeneratingTheme = ref(false);
let originalTheme = 'light';
let themeObserver = null;
const themeAiEndpoint = import.meta.env.VITE_THEME_AI_ENDPOINT || (import.meta.env.DEV ? '/api/theme-tokens' : '');
const themeAiPublicToken = import.meta.env.VITE_THEME_AI_PUBLIC_TOKEN || '';

const activeToken = computed(() => editableColorTokens.find((token) => token.name === activeTokenName.value) || editableColorTokens[0]);
const activeTokenValue = computed(() => hexToOklch(tokenHexValues[activeMode.value][activeTokenName.value]));
const appearanceCode = computed(() => editableAppearanceTokens
	.map((token) => `\t${token.name}: ${appearanceCssValue(token.name)};`)
	.join('\n'));
const themeEditorCode = computed(() => [
	`:root {\n${appearanceCode.value}\n}`,
	...themeModes.map((mode) => `${mode.selector} {\n${editableColorTokens
		.map((token) => `\t${token.name}: ${hexToOklch(tokenHexValues[mode.value][token.name])};`)
		.join('\n')}\n}`),
]
	.join('\n\n'));

function swatchStyle(pair) {
	return {
		background: `var(${pair.surface})`,
		color: `var(${pair.foreground})`,
	};
}

function utilitySwatchStyle(token) {
	return {
		background: `var(${token.token})`,
	};
}

function variableSwatchStyle(name) {
	return {
		background: `var(${name})`,
	};
}

function shadowPreviewStyle(token) {
	return {
		boxShadow: `var(${token})`,
		borderRadius: 'var(--radius-lg)',
	};
}

function updateColorToken(mode, name, value) {
	tokenHexValues[mode][name] = value;
	activeMode.value = mode;
	activeTokenName.value = name;
	if (typeof document !== 'undefined') {
		document.documentElement.dataset.theme = mode;
	}
	applyActiveTheme();
}

function setEditorMode(mode) {
	activeMode.value = mode;
	if (typeof document !== 'undefined') {
		document.documentElement.dataset.theme = mode;
	}
	applyActiveTheme();
}

function resetColorTokens() {
	for (const mode of themeModes) {
		for (const token of editableColorTokens) {
			tokenHexValues[mode.value][token.name] = oklchToHex(themeTokenDefaults[mode.value][token.name]);
		}
	}
	for (const token of editableAppearanceTokens) {
		appearanceValues[token.name] = appearanceTokenDefaults[token.name];
	}
	activeTokenName.value = '--primary';
	activeMode.value = originalTheme;
	clearAppliedTheme();
	if (typeof document !== 'undefined') {
		document.documentElement.dataset.theme = originalTheme;
	}
}

function applyActiveTheme() {
	if (typeof document === 'undefined') return;
	for (const token of editableAppearanceTokens) {
		document.documentElement.style.setProperty(token.name, appearanceCssValue(token.name));
	}
	for (const token of editableColorTokens) {
		document.documentElement.style.setProperty(token.name, hexToOklch(tokenHexValues[activeMode.value][token.name]));
	}
}

function clearAppliedTheme() {
	if (typeof document === 'undefined') return;
	for (const token of editableAppearanceTokens) {
		document.documentElement.style.removeProperty(token.name);
	}
	for (const token of editableColorTokens) {
		document.documentElement.style.removeProperty(token.name);
	}
}

function hydrateAppearanceFromDocument() {
	if (typeof document === 'undefined') return;
	const styles = getComputedStyle(document.documentElement);
	for (const token of editableAppearanceTokens) {
		const value = styles.getPropertyValue(token.name).trim();
		if (!value) continue;
		appearanceValues[token.name] = normalizeAppearanceValue(token, value);
	}
}

function tokenHex(mode, name) {
	return tokenHexValues[mode][name];
}

function tokenOklch(mode, name) {
	return hexToOklch(tokenHex(mode, name));
}

function tokenSwatchStyle(mode, name) {
	return {
		backgroundColor: tokenHex(mode, name),
	};
}

function pairedTokenSwatchStyle(mode, name) {
	const foreground = foregroundBySurface[name];
	const surface = surfaceByForeground[name];
	if (foreground) {
		return {
			backgroundColor: tokenHex(mode, name),
			color: tokenHex(mode, foreground),
		};
	}
	if (surface) {
		return {
			backgroundColor: tokenHex(mode, surface),
			color: tokenHex(mode, name),
		};
	}
	return tokenSwatchStyle(mode, name);
}

function tokenSwatchLabel(name) {
	return foregroundBySurface[name] || surfaceByForeground[name] ? 'Aa' : '';
}

function groupPairPreviewStyle(mode, group) {
	const surface = groupSurfaceToken(group);
	if (!surface) return {};
	return {
		backgroundColor: tokenHex(mode, surface.name),
		color: tokenHex(mode, foregroundBySurface[surface.name]),
	};
}

function hasGroupPairPreview(group) {
	return Boolean(groupSurfaceToken(group));
}

function groupSurfaceToken(group) {
	return group.tokens.find((token) => foregroundBySurface[token.name]);
}

function groupForegroundToken(group) {
	const surface = groupSurfaceToken(group);
	if (!surface) return null;
	return group.tokens.find((token) => token.name === foregroundBySurface[surface.name]);
}

function groupPairTokens(group) {
	return [groupSurfaceToken(group), groupForegroundToken(group)].filter(Boolean);
}

function isActiveGroup(group) {
	return group.tokens.some((token) => isActiveToken(token.name));
}

function updateAppearanceToken(token, value) {
	appearanceValues[token.name] = formatAppearanceInputValue(token, value);
	applyActiveTheme();
}

function appearanceInputValue(token) {
	const value = appearanceValues[token.name];
	if (token.type === 'color') return value;
	return Number.parseFloat(value) || 0;
}

function appearanceDisplayValue(token) {
	if (token.type === 'color') return appearanceCssValue(token.name);
	return appearanceValues[token.name];
}

function appearanceCssValue(name) {
	const value = appearanceValues[name];
	if (name === '--shadow-color') return hexToOklch(value);
	return value;
}

function appearancePreviewStyle() {
	return {
		boxShadow: 'var(--shadow-xl)',
		borderRadius: 'calc(var(--radius) * 2.2)',
	};
}

function isActiveToken(name) {
	return activeTokenName.value === name;
}

function themeColumnStyle(mode) {
	return {
		...Object.fromEntries(editableColorTokens.map((token) => [token.name, hexToOklch(tokenHexValues[mode][token.name])])),
	};
}

function themeSnapshot() {
	return {
		appearance: Object.fromEntries(editableAppearanceTokens.map((token) => [token.name, appearanceValues[token.name]])),
		...Object.fromEntries(themeModes.map((mode) => [
			mode.value,
			Object.fromEntries(editableColorTokens.map((token) => [token.name, tokenHexValues[mode.value][token.name]])),
		])),
	};
}

async function generateThemeWithAi() {
	if (!themeAiEndpoint) {
		aiThemeStatus.value = 'GitHub Pages needs a secure API endpoint before AI requests can run. Use the randomizer here, or point VITE_THEME_AI_ENDPOINT at a serverless proxy.';
		return;
	}

	isGeneratingTheme.value = true;
	aiThemeStatus.value = 'Asking AI for a theme...';

	try {
		const response = await fetch(themeAiEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(themeAiPublicToken ? { 'Authorization': `Bearer ${themeAiPublicToken}` } : {}),
			},
			body: JSON.stringify({
				prompt: aiThemePrompt.value,
				tokens: themeSnapshot(),
			}),
		});

		const payload = await response.json();
		if (!response.ok) throw new Error(payload.error || 'Theme request failed.');
		applyThemePayload(payload.theme || payload);
		aiThemeStatus.value = payload.name ? `Applied ${payload.name}.` : 'Applied AI theme.';
	} catch (error) {
		aiThemeStatus.value = error.message || 'AI theme request failed.';
	} finally {
		isGeneratingTheme.value = false;
	}
}

function generateRandomTheme() {
	const theme = createLocalTheme(aiThemePrompt.value);
	applyThemePayload(theme);
	aiThemeStatus.value = theme.name;
}

function applyThemePayload(theme) {
	const appearance = theme.appearance || {};
	for (const token of editableAppearanceTokens) {
		const value = appearance[token.name];
		if (value == null) continue;
		appearanceValues[token.name] = normalizeAppearanceValue(token, value);
	}
	for (const mode of themeModes) {
		const source = theme[mode.value] || {};
		for (const token of editableColorTokens) {
			const value = source[token.name];
			if (!value) continue;
			tokenHexValues[mode.value][token.name] = normalizeThemeColor(value);
		}
	}
	applyActiveTheme();
}

function normalizeAppearanceValue(token, value) {
	if (token.type === 'color') return normalizeThemeColor(value);
	return formatAppearanceInputValue(token, Number.parseFloat(value));
}

function formatAppearanceInputValue(token, value) {
	if (token.type === 'color') return normalizeThemeColor(value);
	const number = clamp(Number.parseFloat(value) || 0, token.min, token.max);
	const rounded = Number(number.toFixed(3)).toString();
	return `${rounded}${token.unit}`;
}

function normalizeThemeColor(value) {
	const color = String(value).trim();
	if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(color)) return expandHex(color);
	if (color.startsWith('oklch(')) return oklchToHex(color);
	return '#000000';
}

function createLocalTheme(prompt = '') {
	const hue = promptHue(prompt);
	const accentHue = (hue + 34) % 360;
	const dangerHue = 16;
	const successHue = 154;
	const warningHue = prompt.toLowerCase().includes('yellow') ? hue : 48;
	const bold = /\b(big|bold|loud|strong|vivid|punchy)\b/i.test(prompt);
	const primaryLightness = bold ? 39 : 44;
	const primarySaturation = bold ? 88 : 74;

	return {
		name: 'Applied a local theme mix.',
		appearance: createLocalAppearance(prompt),
		light: {
			'--background': hslToHex(hue, 34, 98),
			'--foreground': hslToHex(hue, 26, 10),
			'--card': '#ffffff',
			'--card-foreground': hslToHex(hue, 26, 10),
			'--popover': '#ffffff',
			'--popover-foreground': hslToHex(hue, 26, 10),
			'--primary': hslToHex(hue, primarySaturation, primaryLightness),
			'--primary-foreground': contrastText(hue, primarySaturation, primaryLightness),
			'--secondary': hslToHex(hue, 38, 93),
			'--secondary-foreground': hslToHex(hue, 32, 18),
			'--muted': hslToHex(hue, 28, 94),
			'--muted-foreground': hslToHex(hue, 12, 42),
			'--accent': hslToHex(accentHue, 54, 90),
			'--accent-foreground': hslToHex(accentHue, 52, 18),
			'--destructive': hslToHex(dangerHue, 76, 48),
			'--destructive-foreground': '#ffffff',
			'--success': hslToHex(successHue, 62, 38),
			'--success-foreground': '#ffffff',
			'--warning': hslToHex(warningHue, 88, 62),
			'--warning-foreground': hslToHex(warningHue, 70, 16),
			'--border': hslToHex(hue, 24, 86),
			'--input': hslToHex(hue, 24, 86),
			'--ring': hslToHex(hue, primarySaturation, Math.min(primaryLightness + 12, 58)),
		},
		dark: {
			'--background': hslToHex(hue, 26, 8),
			'--foreground': hslToHex(hue, 20, 96),
			'--card': hslToHex(hue, 24, 12),
			'--card-foreground': hslToHex(hue, 20, 96),
			'--popover': hslToHex(hue, 24, 12),
			'--popover-foreground': hslToHex(hue, 20, 96),
			'--primary': hslToHex(hue, primarySaturation, bold ? 68 : 72),
			'--primary-foreground': hslToHex(hue, 28, 9),
			'--secondary': hslToHex(hue, 22, 18),
			'--secondary-foreground': hslToHex(hue, 18, 94),
			'--muted': hslToHex(hue, 20, 18),
			'--muted-foreground': hslToHex(hue, 13, 68),
			'--accent': hslToHex(accentHue, 36, 24),
			'--accent-foreground': hslToHex(accentHue, 48, 92),
			'--destructive': hslToHex(dangerHue, 70, 64),
			'--destructive-foreground': hslToHex(dangerHue, 36, 9),
			'--success': hslToHex(successHue, 54, 62),
			'--success-foreground': hslToHex(successHue, 34, 9),
			'--warning': hslToHex(warningHue, 76, 66),
			'--warning-foreground': hslToHex(warningHue, 48, 10),
			'--border': hslToHex(hue, 18, 24),
			'--input': hslToHex(hue, 18, 28),
			'--ring': hslToHex(hue, primarySaturation, 62),
		},
	};
}

function createLocalAppearance(prompt = '') {
	const lower = prompt.toLowerCase();
	const flat = /\b(flat|minimal|quiet|plain|low shadow|no shadow)\b/i.test(lower);
	const elevated = /\b(elevated|depth|shadow|soft|float|floating|layered)\b/i.test(lower);
	const sharp = /\b(sharp|square|brutalist|flat corners)\b/i.test(lower);
	const round = /\b(round|rounded|soft|pill|friendly)\b/i.test(lower);

	return {
		'--radius': `${sharp ? 0.125 : round ? 0.95 : 0.625}rem`,
		'--shadow-color': lower.includes('warm') ? '#3d2414' : '#000000',
		'--shadow-strength': `${flat ? 2 : elevated ? 18 : 8}%`,
		'--shadow-distance': `${flat ? 0.2 : elevated ? 1.45 : 1}`,
		'--shadow-softness': `${flat ? 0.45 : elevated ? 1.55 : 1}`,
	};
}

function promptHue(prompt) {
	const lower = prompt.toLowerCase();
	const namedHues = [
		['yellow', 52],
		['gold', 44],
		['orange', 28],
		['red', 8],
		['rose', 344],
		['pink', 326],
		['purple', 272],
		['violet', 264],
		['blue', 218],
		['cyan', 190],
		['teal', 174],
		['green', 146],
		['lime', 92],
	];
	const match = namedHues.find(([name]) => lower.includes(name));
	if (match) return match[1];
	return Math.floor(Math.random() * 360);
}

function contrastText(hue, saturation, lightness) {
	return lightness > 56 ? hslToHex(hue, saturation, 10) : '#ffffff';
}

function hslToHex(hue, saturation, lightness) {
	const s = saturation / 100;
	const l = lightness / 100;
	const chroma = (1 - Math.abs((2 * l) - 1)) * s;
	const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
	const m = l - (chroma / 2);
	const [r, g, b] = hue < 60 ? [chroma, x, 0]
		: hue < 120 ? [x, chroma, 0]
			: hue < 180 ? [0, chroma, x]
				: hue < 240 ? [0, x, chroma]
					: hue < 300 ? [x, 0, chroma]
						: [chroma, 0, x];

	return rgbToHex([r + m, g + m, b + m]);
}

function expandHex(hex) {
	const clean = hex.replace('#', '');
	if (clean.length === 6) return `#${clean.toLowerCase()}`;
	return `#${clean.split('').map((part) => part + part).join('').toLowerCase()}`;
}

function hexToOklch(hex) {
	const [red, green, blue] = hexToRgb(hex).map(srgbToLinear);
	const l = 0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue;
	const m = 0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue;
	const s = 0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue;
	const lRoot = Math.cbrt(l);
	const mRoot = Math.cbrt(m);
	const sRoot = Math.cbrt(s);
	const lightness = 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot;
	const a = 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot;
	const b = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot;
	const chroma = Math.sqrt((a * a) + (b * b));
	const hue = chroma < 0.0005 ? 0 : (Math.atan2(b, a) * 180 / Math.PI + 360) % 360;

	return `oklch(${formatNumber(lightness)} ${formatNumber(chroma)} ${formatNumber(hue)})`;
}

function oklchToHex(value) {
	const match = value.match(/oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)/i);
	if (!match) return '#000000';

	const lightness = clamp(match[1].endsWith('%') ? Number.parseFloat(match[1]) / 100 : Number.parseFloat(match[1]), 0, 1);
	const chroma = Number.parseFloat(match[2]);
	const hue = Number.parseFloat(match[3]) * Math.PI / 180;
	const a = Math.cos(hue) * chroma;
	const b = Math.sin(hue) * chroma;
	const lRoot = lightness + 0.3963377774 * a + 0.2158037573 * b;
	const mRoot = lightness - 0.1055613458 * a - 0.0638541728 * b;
	const sRoot = lightness - 0.0894841775 * a - 1.291485548 * b;
	const l = lRoot ** 3;
	const m = mRoot ** 3;
	const s = sRoot ** 3;
	const red = linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
	const green = linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
	const blue = linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);

	return rgbToHex([red, green, blue]);
}

function hexToRgb(hex) {
	const clean = hex.replace('#', '');
	const value = clean.length === 3
		? clean.split('').map((part) => part + part).join('')
		: clean.padEnd(6, '0').slice(0, 6);

	return [
		Number.parseInt(value.slice(0, 2), 16) / 255,
		Number.parseInt(value.slice(2, 4), 16) / 255,
		Number.parseInt(value.slice(4, 6), 16) / 255,
	];
}

function rgbToHex(values) {
	return `#${values
		.map((value) => Math.round(clamp(value, 0, 1) * 255).toString(16).padStart(2, '0'))
		.join('')}`;
}

function srgbToLinear(value) {
	return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(value) {
	return value <= 0.0031308 ? 12.92 * value : 1.055 * (value ** (1 / 2.4)) - 0.055;
}

function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

function formatNumber(value) {
	return Number(value.toFixed(3)).toString();
}

onMounted(() => {
	originalTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
	activeMode.value = originalTheme;
	hydrateAppearanceFromDocument();
	applyActiveTheme();
	themeObserver = new MutationObserver(() => {
		const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
		if (nextTheme !== activeMode.value) {
			activeMode.value = nextTheme;
			applyActiveTheme();
		}
	});
	themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
});

onBeforeUnmount(() => {
	themeObserver?.disconnect();
});
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Theming"
			tagline="Elements use css variable design tokens: base tokens paint surfaces, and matching -foreground tokens keep text readable."
			tag="style.css"
			eyebrow="Foundation"
		>
			<DocSection eyebrow="Model" title="Surface and foreground pairs">
				<div class="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
					<div class="rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-xl shadow-black/5">
						<p class="text-sm leading-6 text-muted-foreground">
							Use the base token when you are painting a surface. Use the matching
							<code class="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">*-foreground</code>
							token when text or icons need to sit on that surface.
						</p>
						<div class="mt-6 grid gap-3 sm:grid-cols-2">
							<div class="rounded-2xl bg-primary p-4 text-primary-foreground">
								<p class="text-xs font-semibold uppercase tracking-[0.16em] opacity-75">Filled action</p>
								<p class="mt-2 text-lg font-semibold">bg-primary</p>
								<p class="mt-1 text-sm opacity-80">text-primary-foreground</p>
							</div>
							<div class="rounded-2xl border border-border bg-secondary p-4 text-foreground">
								<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Quiet surface</p>
								<p class="mt-2 text-lg font-semibold">bg-secondary</p>
								<p class="mt-1 text-sm text-muted-foreground">text-secondary-foreground or text-foreground</p>
							</div>
						</div>
					</div>
					<div class="rounded-3xl border border-border bg-secondary/50 p-6">
						<p class="text-sm font-semibold text-foreground">Token naming convention</p>
						<dl class="mt-4 space-y-3 text-sm">
							<div class="rounded-2xl border border-border bg-background p-3">
								<dt class="font-mono text-xs text-muted-foreground">Surface token</dt>
								<dd class="mt-1 font-mono text-foreground">Elements --primary</dd>
							</div>
							<div class="rounded-2xl border border-border bg-background p-3">
								<dt class="font-mono text-xs text-muted-foreground">Foreground token</dt>
								<dd class="mt-1 font-mono text-foreground">Elements --primary-foreground</dd>
							</div>
							<div class="rounded-2xl border border-border bg-background p-3">
								<dt class="font-mono text-xs text-muted-foreground">Added pairs</dt>
								<dd class="mt-1 font-mono text-foreground">success, warning, destructive, card, popover</dd>
							</div>
						</dl>
					</div>
				</div>
			</DocSection>

			<DocSection eyebrow="At a glance" title="Read the theme as a product surface">
				<div class="overflow-hidden rounded-3xl border border-border bg-background shadow-2xl shadow-black/5">
					<div class="border-b border-border bg-card px-5 py-4">
						<div class="flex flex-wrap items-center justify-between gap-3">
							<div>
								<p class="text-sm font-semibold text-foreground">Project dashboard</p>
								<p class="text-xs text-muted-foreground">Example composition using only semantic tokens.</p>
							</div>
							<div class="flex items-center gap-2">
								<span class="rounded-full bg-success px-2.5 py-1 text-xs font-medium text-success-foreground">Saved</span>
								<button class="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm">Publish</button>
							</div>
						</div>
					</div>
					<div class="grid gap-4 p-5 lg:grid-cols-[1fr_18rem]">
						<div class="space-y-4">
							<div class="rounded-2xl border border-border bg-card p-4 text-card-foreground">
								<div class="flex items-start justify-between gap-4">
									<div>
										<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Revenue</p>
										<p class="mt-2 text-3xl font-semibold tracking-tight">GBP 42,860</p>
									</div>
									<span class="rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">+12.4%</span>
								</div>
								<div class="mt-5 grid h-20 grid-cols-6 items-end gap-1 border-b border-border">
									<span v-for="height in [32, 48, 38, 64, 52, 78]" :key="height" class="rounded-t-lg bg-primary/80" :style="{ height: `${height}px` }"></span>
								</div>
							</div>
							<div class="grid gap-4 sm:grid-cols-2">
								<div class="rounded-2xl border border-border bg-secondary/70 p-4">
									<p class="text-sm font-medium text-foreground">Quiet panel</p>
									<p class="mt-1 text-sm text-muted-foreground">Secondary surfaces group nearby controls without demanding attention.</p>
								</div>
								<div class="rounded-2xl border border-warning/40 bg-warning/15 p-4 text-warning">
									<p class="text-sm font-semibold">Review needed</p>
									<p class="mt-1 text-sm opacity-80">Warning tokens should feel noticeable, not alarming.</p>
								</div>
							</div>
						</div>
						<div class="space-y-3 rounded-2xl border border-border bg-popover p-3 text-popover-foreground shadow-xl shadow-black/10">
							<p class="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Command menu</p>
							<button class="block w-full rounded-xl bg-accent px-3 py-2 text-left text-sm font-medium text-accent-foreground">Open project</button>
							<button class="block w-full rounded-xl px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">Invite teammate</button>
							<button class="block w-full rounded-xl px-3 py-2 text-left text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground">Delete project</button>
						</div>
					</div>
				</div>
			</DocSection>

			<DocSection eyebrow="Editor" title="Tune CSS variable colours">
				<div class="space-y-4 rounded-2xl border border-border bg-card p-4 text-card-foreground">
					<div class="flex flex-wrap items-start justify-between gap-3">
						<div>
							<p class="text-sm font-semibold text-foreground">{{ activeToken.label }} - {{ activeMode }}</p>
							<p class="font-mono text-xs text-muted-foreground">{{ activeToken.name }}: {{ activeTokenValue }}</p>
						</div>
						<div class="flex flex-wrap items-center gap-2">
							<div class="inline-flex rounded-full border border-border bg-background p-1">
								<button
									v-for="mode in themeModes"
									:key="mode.value"
									type="button"
									class="rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
									:class="activeMode === mode.value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
									@click="setEditorMode(mode.value)"
								>
									Preview {{ mode.label }}
								</button>
							</div>
							<button
								type="button"
								class="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
								@click="resetColorTokens"
							>
								Reset
							</button>
						</div>
					</div>
					<div>
						<label class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground" for="theme-ai-prompt">AI theme direction</label>
						<div class="mt-2 grid gap-2 lg:grid-cols-[1fr_auto_auto]">
							<input
								id="theme-ai-prompt"
								v-model="aiThemePrompt"
								type="text"
								class="h-10 min-w-0 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-ring"
								placeholder="brand color is yellow and big and bold"
							>
							<button
								type="button"
								class="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
								@click="generateRandomTheme"
							>
								Random mix
							</button>
							<button
								type="button"
								class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
								:disabled="isGeneratingTheme"
								@click="generateThemeWithAi"
							>
								{{ isGeneratingTheme ? 'Asking AI' : 'Ask AI' }}
							</button>
						</div>
						<p v-if="aiThemeStatus" class="mt-2 text-sm text-muted-foreground">{{ aiThemeStatus }}</p>
					</div>
				</div>

				<div class="grid gap-4 lg:grid-cols-2">
					<div class="grid gap-4">
						<section
							v-for="group in appearanceTokenGroups"
							:key="group.label"
							class="rounded-2xl border border-border bg-card p-4 text-card-foreground"
						>
							<div>
								<p class="text-sm font-semibold text-foreground">{{ group.label }}</p>
								<p class="mt-1 text-sm text-muted-foreground">{{ group.description }}</p>
							</div>
							<div class="mt-4 space-y-4">
								<label
									v-for="token in group.tokens"
									:key="token.name"
									class="block rounded-xl border border-border bg-background p-3"
								>
									<span class="flex items-start justify-between gap-3">
										<span class="min-w-0">
											<span class="block text-sm font-medium text-foreground">{{ token.label }}</span>
											<span class="mt-0.5 block font-mono text-xs text-muted-foreground">{{ token.name }}: {{ appearanceDisplayValue(token) }}</span>
										</span>
										<span
											v-if="token.type === 'color'"
											class="size-9 shrink-0 rounded-lg border border-border shadow-sm"
											:style="{ backgroundColor: appearanceValues[token.name] }"
										></span>
									</span>
									<input
										v-if="token.type === 'range'"
										type="range"
										class="mt-3 w-full accent-primary"
										:min="token.min"
										:max="token.max"
										:step="token.step"
										:value="appearanceInputValue(token)"
										:aria-label="token.label"
										@input="updateAppearanceToken(token, $event.target.value)"
									>
									<input
										v-else
										type="color"
										class="mt-3 h-10 w-full cursor-pointer rounded-lg border border-border bg-background p-1"
										:value="appearanceValues[token.name]"
										:aria-label="token.label"
										@input="updateAppearanceToken(token, $event.target.value)"
									>
									<span class="mt-2 block text-xs text-muted-foreground">{{ token.use }}</span>
								</label>
							</div>
						</section>
					</div>
					<div
						class="rounded-2xl border border-border bg-card p-4 text-card-foreground"
					>
						<div>
							<p class="text-sm font-semibold text-foreground">Shape preview</p>
							<p class="mt-1 text-sm text-muted-foreground">Radius and shadow tokens applied live.</p>
						</div>
						<div class="mt-4 space-y-4">
							<div class="border border-border bg-background p-4" :style="appearancePreviewStyle()">
								<p class="text-sm font-semibold text-foreground">Elevated card</p>
								<p class="mt-1 text-sm text-muted-foreground">shadow-xl and rounded scale</p>
							</div>
							<div class="grid grid-cols-3 gap-2">
								<span class="h-12 rounded-sm border border-border bg-secondary"></span>
								<span class="h-12 rounded-lg border border-border bg-secondary"></span>
								<span class="h-12 rounded-3xl border border-border bg-secondary"></span>
							</div>
							<div>
								<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Shadow levels</p>
								<div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
									<div
										v-for="level in shadowPreviewLevels"
										:key="level.token"
										class="grid h-20 place-items-center border border-border bg-background text-xs font-semibold text-muted-foreground"
										:style="shadowPreviewStyle(level.token)"
									>
										<span>{{ level.label }}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="grid gap-4 xl:grid-cols-2">
					<div
						v-for="mode in themeModes"
						:key="mode.value"
						class="relative rounded-2xl border border-border bg-card text-card-foreground"
						:data-theme="mode.value"
						:style="themeColumnStyle(mode.value)"
					>
						<div class="flex items-center justify-between gap-3 border-b border-border bg-secondary/45 px-4 py-3">
							<div>
								<p class="text-sm font-semibold text-foreground">{{ mode.label }} mode</p>
								<p class="text-xs text-muted-foreground">{{ mode.selector }}</p>
							</div>
							<button
								type="button"
								class="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
								@click="setEditorMode(mode.value)"
							>
								Preview
							</button>
						</div>
						<div class="divide-y divide-border">
							<section v-for="group in editorTokenGroups" :key="group.label">
								<div class="bg-secondary/30 px-4 py-3">
									<div class="flex items-center justify-between gap-3">
										<div class="min-w-0">
											<p class="truncate text-sm font-semibold text-foreground">{{ group.label }}</p>
											<p class="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{{ group.description }}</p>
										</div>
										<ElPopover
											v-if="hasGroupPairPreview(group)"
											position="bottom-end"
											width="w-64"
											padding="p-3"
											:collision-padding="12"
											:aria-label="`Edit ${group.label} ${mode.value} colors`"
										>
											<template #trigger>
												<button
													type="button"
													class="grid h-10 w-16 shrink-0 place-items-center rounded-lg border border-border text-sm font-semibold shadow-sm transition-shadow hover:ring-2 hover:ring-ring/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
													:style="groupPairPreviewStyle(mode.value, group)"
													:title="`${group.label} surface and foreground preview`"
													:aria-label="`Edit ${group.label} ${mode.value} colors`"
												>
													Aa
												</button>
											</template>
											<div>
												<div>
													<p class="text-sm font-semibold">{{ group.label }}</p>
													<p class="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{{ group.description }}</p>
												</div>
												<div class="mt-3 grid gap-2">
													<label
														v-for="token in groupPairTokens(group)"
														:key="token.name"
														class="relative grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-2 transition-colors hover:border-ring"
													>
														<span
															class="size-6 rounded-md border border-border shadow-sm"
															:style="tokenSwatchStyle(mode.value, token.name)"
														></span>
														<span class="block truncate font-mono text-xs">{{ token.name }}</span>
														<input
															type="color"
															class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
															:value="tokenHex(mode.value, token.name)"
															:aria-label="`${token.label} ${mode.value} color`"
															@focus="activeTokenName = token.name"
															@input="updateColorToken(mode.value, token.name, $event.target.value)"
														/>
													</label>
												</div>
											</div>
										</ElPopover>
										<div v-else class="flex shrink-0 overflow-hidden rounded-lg border border-border">
											<span
												v-for="token in group.tokens"
												:key="token.name"
												class="size-6 border-l border-border first:border-l-0"
												:style="tokenSwatchStyle(mode.value, token.name)"
											></span>
										</div>
									</div>
								</div>
								<div v-if="!hasGroupPairPreview(group)" class="divide-y divide-border">
									<label
										v-for="token in group.tokens"
										:key="token.name"
										class="relative flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/60"
										:class="isActiveToken(token.name) && 'bg-accent text-accent-foreground hover:bg-accent'"
									>
										<span
											class="grid size-10 shrink-0 place-items-center rounded-lg border border-border text-[11px] font-semibold shadow-sm"
											:style="pairedTokenSwatchStyle(mode.value, token.name)"
										>
											{{ tokenSwatchLabel(token.name) }}
										</span>
										<span class="min-w-0 flex-1">
											<span class="flex flex-wrap items-center gap-2">
												<span class="truncate text-sm font-medium">{{ token.label }}</span>
												<span class="rounded-full bg-background/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border">{{ token.role }}</span>
											</span>
											<span class="mt-0.5 block truncate font-mono text-xs opacity-70">{{ token.name }}: {{ tokenOklch(mode.value, token.name) }}</span>
										</span>
										<span class="font-mono text-xs opacity-70">{{ tokenHex(mode.value, token.name) }}</span>
										<input
											type="color"
											class="absolute inset-y-0 left-4 my-auto size-10 cursor-pointer opacity-0"
											:value="tokenHex(mode.value, token.name)"
											:aria-label="`${token.label} ${mode.value} color`"
											@focus="activeTokenName = token.name"
											@input="updateColorToken(mode.value, token.name, $event.target.value)"
										/>
									</label>
								</div>
							</section>
						</div>
					</div>
				</div>

				<CodeBlock lang="css" :code="themeEditorCode" :default-open="false" />
			</DocSection>

			<DocSection eyebrow="Tokens" title="Palette and pairs">
				<div class="grid gap-4 md:grid-cols-2">
					<article
						v-for="pair in tokenPairs"
						:key="pair.name"
						class="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground"
					>
						<div class="flex min-h-28 items-end p-4" :style="swatchStyle(pair)">
							<div>
								<p class="text-lg font-semibold">{{ pair.name }}</p>
								<p class="font-mono text-xs opacity-80">{{ pair.utilities }}</p>
							</div>
						</div>
						<div class="space-y-3 p-4">
							<p class="text-sm text-muted-foreground">{{ pair.use }}</p>
							<div class="grid gap-2 text-xs">
								<div class="flex items-center justify-between gap-3">
									<span class="text-muted-foreground">Surface</span>
									<label class="relative flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 transition-colors hover:bg-secondary">
										<code class="font-mono text-foreground">{{ pair.surface }}</code>
										<span
											class="size-3 rounded-full ring-1 ring-border"
											:style="variableSwatchStyle(pair.surface)"
										></span>
										<input
											type="color"
											class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
											:value="tokenHex(activeMode, pair.surface)"
											:aria-label="`Edit ${pair.name} surface ${activeMode} color`"
											@focus="activeTokenName = pair.surface"
											@input="updateColorToken(activeMode, pair.surface, $event.target.value)"
										/>
									</label>
								</div>
								<div class="flex items-center justify-between gap-3">
									<span class="text-muted-foreground">Foreground</span>
									<label class="relative flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 transition-colors hover:bg-secondary">
										<code class="font-mono text-foreground">{{ pair.foreground }}</code>
										<span
											class="size-3 rounded-full ring-1 ring-border"
											:style="variableSwatchStyle(pair.foreground)"
										></span>
										<input
											type="color"
											class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
											:value="tokenHex(activeMode, pair.foreground)"
											:aria-label="`Edit ${pair.name} foreground ${activeMode} color`"
											@focus="activeTokenName = pair.foreground"
											@input="updateColorToken(activeMode, pair.foreground, $event.target.value)"
										/>
									</label>
								</div>
							</div>
						</div>
					</article>
				</div>

				<div class="mt-4 grid gap-4 md:grid-cols-3">
					<article
						v-for="token in utilityTokens"
						:key="token.name"
						class="rounded-2xl border border-border bg-card p-4 text-card-foreground"
					>
						<div class="flex items-center gap-3">
							<span class="size-10 rounded-xl ring-1 ring-border" :style="utilitySwatchStyle(token)"></span>
							<div>
								<p class="font-semibold">{{ token.name }}</p>
								<code class="font-mono text-xs text-muted-foreground">{{ token.token }}</code>
							</div>
						</div>
						<p class="mt-3 text-sm text-muted-foreground">{{ token.use }}</p>
						<p class="mt-3 rounded-lg bg-secondary px-2 py-1 font-mono text-xs text-muted-foreground">{{ token.utility }}</p>
					</article>
				</div>
			</DocSection>

			<DocSection eyebrow="Decision guide" title="Which token should I use?">
				<div class="overflow-x-auto overflow-y-hidden rounded-2xl border border-border">
					<table class="w-full min-w-[42rem] text-left text-sm">
						<thead class="bg-secondary text-xs uppercase tracking-[0.14em] text-muted-foreground">
							<tr>
								<th class="px-4 py-3 font-semibold">Intent</th>
								<th class="px-4 py-3 font-semibold">Utility</th>
								<th class="px-4 py-3 font-semibold">Rule of thumb</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border bg-background">
							<tr v-for="row in decisionRows" :key="row[0]">
								<td class="px-4 py-3 font-medium text-foreground">{{ row[0] }}</td>
								<td class="px-4 py-3"><code class="font-mono text-xs text-muted-foreground">{{ row[1] }}</code></td>
								<td class="px-4 py-3 text-muted-foreground">{{ row[2] }}</td>
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
