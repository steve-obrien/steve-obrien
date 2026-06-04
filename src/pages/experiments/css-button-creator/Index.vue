<script setup>
import { computed, reactive, ref, watch } from 'vue';
import {
	ElButton,
	ElColorInput,
	ElNativeSelect,
	ElPopover,
	ElRangeInput,
	ElTextInput,
	ElTextareaInput,
} from '../../elements/lib/vue';

const activeState = ref('base');
const previewInteraction = ref(null);
const copiedTarget = ref('');
const importSource = ref('');
const importFeedback = ref('');
const cssEditor = ref('');
const cssEditorFeedback = ref('');
const isEditingCss = ref(false);
const aiThemeIntent = ref('Generate a polished alternate button theme for a premium SaaS interface. Keep it accessible, modern, and usable across base, hover, active, and focus states.');
const themePresetIndex = ref(0);

const stateLabels = {
	base: 'Base',
	hover: 'Hover',
	active: 'Active',
	focus: 'Focus',
};

const sectionOpen = reactive({
	states: true,
	content: true,
	background: true,
	typography: true,
	layout: true,
	border: true,
	shadows: true,
	import: false,
	ai: false,
	css: true,
	tailwind: false,
});

const fillTypeOptions = [
	{ label: 'Solid', value: 'solid' },
	{ label: 'Linear gradient', value: 'linear' },
	{ label: 'Radial gradient', value: 'radial' },
];

const shadowKindOptions = [
	{ label: 'Drop shadow', value: 'drop' },
	{ label: 'Inner shadow', value: 'inset' },
	{ label: 'Ring', value: 'ring' },
];

const baseButton = reactive(createButtonState());
const hoverButton = reactive(createButtonState({
	background: {
		solid: '#2f6f64',
		gradientFrom: '#134e4a',
		gradientTo: '#5eead4',
	},
	border: { color: '#255b52' },
}));
const activeButton = reactive(createButtonState({
	layout: {
		paddingX: 21,
		paddingY: 11,
	},
	background: {
		solid: '#0f3f3a',
		gradientFrom: '#0f3f3a',
		gradientTo: '#14b8a6',
	},
	border: { color: '#134e4a' },
}));
const focusButton = reactive(createButtonState({
	background: {
		solid: '#171717',
		gradientFrom: '#171717',
		gradientTo: '#4f46e5',
	},
	border: { color: '#6366f1' },
}));

const buttons = {
	base: baseButton,
	hover: hoverButton,
	active: activeButton,
	focus: focusButton,
};

const shadows = reactive({
	base: [
		createShadow({ kind: 'drop', color: '#000000', alpha: 22, x: 0, y: 12, blur: 26, spread: -10 }),
		createShadow({ kind: 'ring', color: '#ffffff', alpha: 12, spread: 1, open: false }),
	],
	hover: [
		createShadow({ kind: 'drop', color: '#0f766e', alpha: 34, x: 0, y: 18, blur: 36, spread: -12 }),
		createShadow({ kind: 'ring', color: '#5eead4', alpha: 28, spread: 3, open: false }),
	],
	active: [
		createShadow({ kind: 'inset', color: '#000000', alpha: 22, x: 0, y: 2, blur: 5, spread: 0 }),
		createShadow({ kind: 'drop', color: '#0f766e', alpha: 18, x: 0, y: 8, blur: 18, spread: -12, open: false }),
	],
	focus: [
		createShadow({ kind: 'ring', color: '#6366f1', alpha: 42, spread: 4 }),
		createShadow({ kind: 'drop', color: '#000000', alpha: 20, x: 0, y: 12, blur: 26, spread: -10, open: false }),
	],
});

const themePresets = [
	{
		name: 'Aurora mint',
		base: {
			background: { mode: 'linear', gradientFrom: '#0f172a', gradientTo: '#14b8a6', gradientAngle: 135 },
			typography: { textColor: '#f8fafc' },
			border: { color: '#2dd4bf' },
		},
		hover: {
			background: { mode: 'linear', gradientFrom: '#134e4a', gradientTo: '#67e8f9', gradientAngle: 135 },
			typography: { textColor: '#ffffff' },
			border: { color: '#5eead4' },
		},
		active: {
			background: { mode: 'linear', gradientFrom: '#042f2e', gradientTo: '#0f766e', gradientAngle: 145 },
			typography: { textColor: '#ecfeff' },
			border: { color: '#0f766e' },
		},
		focus: {
			background: { mode: 'linear', gradientFrom: '#0f172a', gradientTo: '#14b8a6', gradientAngle: 135 },
			typography: { textColor: '#ffffff' },
			border: { color: '#67e8f9' },
		},
		shadows: {
			base: [
				{ kind: 'drop', color: '#0f766e', alpha: 28, x: 0, y: 14, blur: 32, spread: -12 },
				{ kind: 'ring', color: '#99f6e4', alpha: 32, spread: 1 },
			],
			hover: [
				{ kind: 'drop', color: '#0891b2', alpha: 38, x: 0, y: 18, blur: 42, spread: -12 },
				{ kind: 'ring', color: '#67e8f9', alpha: 42, spread: 3 },
			],
			active: [
				{ kind: 'inset', color: '#042f2e', alpha: 34, x: 0, y: 3, blur: 8, spread: 0 },
			],
			focus: [
				{ kind: 'ring', color: '#67e8f9', alpha: 48, spread: 4 },
				{ kind: 'drop', color: '#0f766e', alpha: 24, x: 0, y: 14, blur: 32, spread: -12 },
			],
		},
	},
	{
		name: 'Studio ink',
		base: {
			background: { mode: 'solid', solid: '#111827' },
			typography: { textColor: '#f9fafb' },
			border: { color: '#374151' },
		},
		hover: {
			background: { mode: 'solid', solid: '#312e81' },
			typography: { textColor: '#ffffff' },
			border: { color: '#6366f1' },
		},
		active: {
			background: { mode: 'solid', solid: '#1e1b4b' },
			typography: { textColor: '#e0e7ff' },
			border: { color: '#4f46e5' },
		},
		focus: {
			background: { mode: 'solid', solid: '#111827' },
			typography: { textColor: '#ffffff' },
			border: { color: '#818cf8' },
		},
		shadows: {
			base: [
				{ kind: 'drop', color: '#020617', alpha: 30, x: 0, y: 10, blur: 24, spread: -10 },
				{ kind: 'inset', color: '#ffffff', alpha: 10, x: 0, y: 1, blur: 0, spread: 0 },
			],
			hover: [
				{ kind: 'drop', color: '#312e81', alpha: 40, x: 0, y: 16, blur: 36, spread: -12 },
				{ kind: 'ring', color: '#818cf8', alpha: 34, spread: 3 },
			],
			active: [
				{ kind: 'inset', color: '#000000', alpha: 34, x: 0, y: 2, blur: 6, spread: 0 },
			],
			focus: [
				{ kind: 'ring', color: '#818cf8', alpha: 42, spread: 4 },
				{ kind: 'drop', color: '#020617', alpha: 24, x: 0, y: 10, blur: 24, spread: -10 },
			],
		},
	},
];

const currentButton = computed(() => buttons[activeState.value]);
const currentShadows = computed(() => shadows[activeState.value]);
const enabledCurrentShadows = computed(() => enabledShadows(currentShadows.value));
const previewState = computed(() => previewInteraction.value || activeState.value);
const previewStyle = computed(() => buttonStyle(buttons[previewState.value], shadows[previewState.value]));
const cssOutput = computed(() => buildCssOutput());
const tailwindOutput = computed(() => buildTailwindOutput());
const aiThemeRequest = computed(() => buildAiThemeRequest());

watch(cssOutput, (value) => {
	if (!isEditingCss.value) cssEditor.value = value;
}, { immediate: true });

function createButtonState(overrides = {}) {
	return {
		label: 'Save changes',
		typography: {
			enabled: true,
			open: true,
			textColor: '#ffffff',
			fontSize: 15,
			fontWeight: 650,
			...overrides.typography,
		},
		layout: {
			enabled: true,
			open: true,
			paddingX: 22,
			paddingY: 12,
			radius: 999,
			...overrides.layout,
		},
		background: {
			enabled: true,
			open: true,
			blendMode: 'normal',
			fills: createFillLayers(overrides.background),
		},
		border: {
			enabled: true,
			open: true,
			width: 1,
			color: '#171717',
			...overrides.border,
		},
	};
}

function createFillLayers(background = {}) {
	if (Array.isArray(background.fills) && background.fills.length) {
		return background.fills.map((fill, index) => createFill({ ...fill, open: index === 0 }));
	}
	return [createFill(legacyBackgroundToFill(background))];
}

function legacyBackgroundToFill(background = {}) {
	return {
		kind: background.mode || 'solid',
		color: background.solid || '#171717',
		alpha: background.alpha ?? 100,
		gradientFrom: background.gradientFrom || background.solid || '#171717',
		gradientFromAlpha: background.gradientFromAlpha ?? 100,
		gradientTo: background.gradientTo || '#4f46e5',
		gradientToAlpha: background.gradientToAlpha ?? 100,
		gradientAngle: background.gradientAngle ?? 135,
		gradientFromStop: background.gradientFromStop ?? 0,
		gradientToStop: background.gradientToStop ?? 100,
	};
}

function createFill(overrides = {}) {
	return {
		enabled: true,
		open: true,
		kind: 'solid',
		color: '#171717',
		alpha: 100,
		gradientFrom: '#171717',
		gradientFromAlpha: 100,
		gradientTo: '#4f46e5',
		gradientToAlpha: 100,
		gradientAngle: 135,
		gradientFromStop: 0,
		gradientToStop: 100,
		...overrides,
		id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
	};
}

function createShadow(overrides = {}) {
	return {
		enabled: true,
		open: true,
		kind: 'drop',
		color: '#000000',
		alpha: 20,
		x: 0,
		y: 8,
		blur: 18,
		spread: -6,
		...overrides,
		id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
	};
}

function buttonStyle(button, shadowList) {
	const style = { lineHeight: 1 };

	if (button.typography.enabled) {
		style.fontSize = `${button.typography.fontSize}px`;
		style.fontWeight = button.typography.fontWeight;
		style.color = button.typography.textColor;
	}
	if (button.layout.enabled) {
		style.padding = `${button.layout.paddingY}px ${button.layout.paddingX}px`;
		style.borderRadius = `${button.layout.radius}px`;
	}
	style.border = button.border.enabled
		? `${button.border.width}px solid ${button.border.color}`
		: '0 solid transparent';
	style.background = button.background.enabled ? fillListToCss(button.background.fills) : 'transparent';
	style.boxShadow = shadowListToCss(shadowList);
	style.transform = previewState.value === 'active' ? 'translateY(1px) scale(0.985)' : 'translateY(0) scale(1)';

	return style;
}

function enabledShadows(shadowList) {
	return shadowList.filter((shadow) => shadow.enabled);
}

function shadowListToCss(shadowList) {
	const visibleShadows = enabledShadows(shadowList);
	if (!visibleShadows.length) return 'none';
	return visibleShadows.map((shadow) => shadowToCss(shadow)).join(', ');
}

function enabledFills(fillList) {
	return fillList.filter((fill) => fill.enabled);
}

function fillListToCss(fillList) {
	const visibleFills = enabledFills(fillList);
	if (!visibleFills.length) return 'transparent';
	return visibleFills.map((fill) => fillToCss(fill)).join(', ');
}

function fillToCss(fill) {
	if (fill.kind === 'linear') {
		return `linear-gradient(${fill.gradientAngle}deg, ${hexToRgba(fill.gradientFrom, fill.gradientFromAlpha)} ${fill.gradientFromStop}%, ${hexToRgba(fill.gradientTo, fill.gradientToAlpha)} ${fill.gradientToStop}%)`;
	}
	if (fill.kind === 'radial') {
		return `radial-gradient(circle at 50% 45%, ${hexToRgba(fill.gradientFrom, fill.gradientFromAlpha)} ${fill.gradientFromStop}%, ${hexToRgba(fill.gradientTo, fill.gradientToAlpha)} ${fill.gradientToStop}%)`;
	}
	return hexToRgba(fill.color, fill.alpha);
}

function shadowToCss(shadow) {
	const color = hexToRgba(shadow.color, shadow.alpha);
	if (shadow.kind === 'ring') return `0 0 0 ${shadow.spread}px ${color}`;
	return `${shadow.kind === 'inset' ? 'inset ' : ''}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${color}`;
}

function backgroundToCss(background) {
	return fillListToCss(background.fills || createFillLayers(background));
}

function hexToRgba(hex, alpha) {
	const normalized = hex.replace('#', '').trim();
	const full = normalized.length === 3
		? normalized.split('').map((char) => `${char}${char}`).join('')
		: normalized.padEnd(6, '0').slice(0, 6);
	const value = Number.parseInt(full, 16);
	const r = (value >> 16) & 255;
	const g = (value >> 8) & 255;
	const b = value & 255;
	return `rgba(${r}, ${g}, ${b}, ${Number(alpha / 100).toFixed(2)})`;
}

function addShadow(targetState = activeState.value) {
	shadows[targetState].forEach((shadow) => {
		shadow.open = false;
	});
	shadows[targetState].push(createShadow());
}

function duplicateShadow(index) {
	currentShadows.value.splice(index + 1, 0, createShadow({ ...currentShadows.value[index], open: true }));
}

function removeShadow(index) {
	currentShadows.value.splice(index, 1);
}

function addFill() {
	currentButton.value.background.fills.forEach((fill) => {
		fill.open = false;
	});
	currentButton.value.background.fills.unshift(createFill({ kind: 'linear' }));
}

function duplicateFill(index) {
	currentButton.value.background.fills.splice(index + 1, 0, createFill({ ...currentButton.value.background.fills[index], open: true }));
}

function removeFill(index) {
	currentButton.value.background.fills.splice(index, 1);
}

function closeOtherLayerPopovers(activeId) {
	if (typeof document === 'undefined') return;
	globalThis.requestAnimationFrame?.(() => {
		document.querySelectorAll('element-popover[data-layer-popover-id]').forEach((popover) => {
			if (popover.dataset.layerPopoverId === activeId) return;
			closeLayerPopoverElement(popover);
		});
	});
}

function closeAllLayerPopovers() {
	if (typeof document === 'undefined') return;
	document.querySelectorAll('element-popover[data-layer-popover-id]').forEach(closeLayerPopoverElement);
}

function closeLayerPopoverElement(popover) {
	popover.open = false;
	popover.removeAttribute('open');
	popover.querySelector('.el-popover-panel')?.hidePopover?.();
	popover.querySelector('[aria-expanded="true"]')?.setAttribute('aria-expanded', 'false');
}

function copyBaseToState() {
	if (activeState.value === 'base') return;
	Object.assign(currentButton.value, JSON.parse(JSON.stringify(baseButton)));
	shadows[activeState.value].splice(0, shadows[activeState.value].length, ...shadows.base.map((shadow) => createShadow({ ...shadow, open: false })));
}

function setActiveState(state) {
	activeState.value = state;
}

function resetButton() {
	Object.assign(baseButton, createButtonState());
	Object.assign(hoverButton, createButtonState({ background: { solid: '#2f6f64', gradientFrom: '#134e4a', gradientTo: '#5eead4' }, border: { color: '#255b52' } }));
	Object.assign(activeButton, createButtonState({ layout: { paddingX: 21, paddingY: 11 }, background: { solid: '#0f3f3a' }, border: { color: '#134e4a' } }));
	Object.assign(focusButton, createButtonState({ border: { color: '#6366f1' } }));
	shadows.base.splice(0, shadows.base.length,
		createShadow({ kind: 'drop', color: '#000000', alpha: 22, x: 0, y: 12, blur: 26, spread: -10 }),
		createShadow({ kind: 'ring', color: '#ffffff', alpha: 12, spread: 1, open: false }),
	);
	shadows.hover.splice(0, shadows.hover.length,
		createShadow({ kind: 'drop', color: '#0f766e', alpha: 34, x: 0, y: 18, blur: 36, spread: -12 }),
		createShadow({ kind: 'ring', color: '#5eead4', alpha: 28, spread: 3, open: false }),
	);
	shadows.active.splice(0, shadows.active.length,
		createShadow({ kind: 'inset', color: '#000000', alpha: 22, x: 0, y: 2, blur: 5, spread: 0 }),
		createShadow({ kind: 'drop', color: '#0f766e', alpha: 18, x: 0, y: 8, blur: 18, spread: -12, open: false }),
	);
	shadows.focus.splice(0, shadows.focus.length,
		createShadow({ kind: 'ring', color: '#6366f1', alpha: 42, spread: 4 }),
		createShadow({ kind: 'drop', color: '#000000', alpha: 20, x: 0, y: 12, blur: 26, spread: -10, open: false }),
	);
}

function applyThemePreset() {
	const preset = themePresets[themePresetIndex.value % themePresets.length];
	themePresetIndex.value += 1;
	Object.keys(stateLabels).forEach((state) => {
		applyButtonTheme(buttons[state], preset[state]);
		shadows[state].splice(0, shadows[state].length, ...preset.shadows[state].map((shadow, index) => createShadow({ ...shadow, open: index === 0 })));
	});
}

function applyButtonTheme(button, theme) {
	if (theme.background) {
		button.background.enabled = true;
		button.background.fills.splice(0, button.background.fills.length, ...createFillLayers(theme.background));
	}
	if (theme.typography) Object.assign(button.typography, theme.typography, { enabled: true });
	if (theme.border) Object.assign(button.border, theme.border, { enabled: true });
}

function buildCssOutput() {
	return `.button {
${cssRulesFor('base').map((rule) => `\t${rule}`).join('\n')}
	transition: background 160ms ease, border-color 160ms ease, color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.button:hover {
${cssRulesFor('hover').map((rule) => `\t${rule}`).join('\n')}
}

.button:active {
${cssRulesFor('active').map((rule) => `\t${rule}`).join('\n')}
	transform: translateY(1px) scale(0.985);
}

.button:focus-visible {
${cssRulesFor('focus').map((rule) => `\t${rule}`).join('\n')}
	outline: none;
}`;
}

function cssRulesFor(state) {
	const button = buttons[state];
	const rules = [
		'display: inline-flex;',
		'align-items: center;',
		'justify-content: center;',
		'line-height: 1;',
	];
	if (button.border.enabled) rules.push(`border: ${button.border.width}px solid ${button.border.color};`);
	if (button.layout.enabled) {
		rules.push(`border-radius: ${button.layout.radius}px;`);
		rules.push(`padding: ${button.layout.paddingY}px ${button.layout.paddingX}px;`);
	}
	if (button.background.enabled) rules.push(`background: ${backgroundToCss(button.background)};`);
	if (button.typography.enabled) {
		rules.push(`font-size: ${button.typography.fontSize}px;`);
		rules.push(`font-weight: ${button.typography.fontWeight};`);
		rules.push(`color: ${button.typography.textColor};`);
	}
	rules.push(`box-shadow: ${shadowListToCss(shadows[state])};`);
	return rules;
}

function buildTailwindOutput() {
	const base = ['inline-flex', 'items-center', 'justify-center', 'leading-none', 'transition', 'duration-150', 'ease-out', ...tailwindRulesFor('base')];
	const hover = tailwindRulesFor('hover', 'hover:');
	const active = [...tailwindRulesFor('active', 'active:'), 'active:translate-y-px', 'active:scale-[0.985]'];
	const focus = [...tailwindRulesFor('focus', 'focus-visible:'), 'focus-visible:outline-none'];
	return [...base, ...hover, ...active, ...focus].join(' ');
}

function tailwindRulesFor(state, prefix = '') {
	const button = buttons[state];
	const rules = [];
	if (button.border.enabled) {
		rules.push(`${prefix}border-[${button.border.width}px]`);
		rules.push(`${prefix}border-[${button.border.color}]`);
	}
	if (button.layout.enabled) {
		rules.push(`${prefix}rounded-[${button.layout.radius}px]`);
		rules.push(`${prefix}px-[${button.layout.paddingX}px]`);
		rules.push(`${prefix}py-[${button.layout.paddingY}px]`);
	}
	if (button.background.enabled) rules.push(`${prefix}bg-[${tailwindValue(backgroundToCss(button.background))}]`);
	if (button.typography.enabled) {
		rules.push(`${prefix}text-[${button.typography.fontSize}px]`);
		rules.push(`${prefix}font-[${button.typography.fontWeight}]`);
		rules.push(`${prefix}text-[${button.typography.textColor}]`);
	}
	rules.push(`${prefix}shadow-[${tailwindValue(shadowListToCss(shadows[state]))}]`);
	return rules;
}

function tailwindValue(value) {
	return value.replaceAll(' ', '_');
}

function buildAiThemeRequest() {
	return `You are helping design a production-ready CSS button theme.

Goal:
${aiThemeIntent.value}

Current button theme:
${JSON.stringify(themeSnapshot(), null, 2)}

Return one different theme that works well as both CSS and Tailwind arbitrary utilities.

Constraints:
- Keep text contrast accessible against the generated background.
- Include base, hover, active, and focus states.
- Use no more than 3 box shadows per state.
- Shadows may be drop, inset, or ring.
- Background is an ordered fills array. Fill layers may be solid, linear gradient, or radial gradient.
- Return only valid JSON with top-level "base", "hover", "active", and "focus" objects.`;
}

function themeSnapshot() {
	return Object.fromEntries(Object.keys(stateLabels).map((state) => [
		state,
		{
			background: {
				enabled: buttons[state].background.enabled,
				fills: buttons[state].background.fills.map(({ id, open, ...fill }) => fill),
			},
			typography: { ...buttons[state].typography },
			border: { ...buttons[state].border },
			layout: { ...buttons[state].layout },
			shadows: shadows[state].map(({ id, open, ...shadow }) => shadow),
		},
	]));
}

function applyImportedStyles() {
	const parsed = parseStyleSource(importSource.value, activeState.value);
	if (!parsed.found) {
		importFeedback.value = 'No supported CSS or Tailwind styles found.';
		return;
	}

	applyParsedStylesToState(activeState.value, parsed);
	importFeedback.value = `Imported ${parsed.count} supported style${parsed.count === 1 ? '' : 's'} into ${stateLabels[activeState.value]}.`;
}

function applyParsedStylesToState(state, parsed) {
	const button = buttons[state];
	if (parsed.fills?.length) {
		button.background.enabled = true;
		button.background.fills.splice(0, button.background.fills.length, ...parsed.fills.map((fill, index) => createFill({ ...fill, open: index === 0 })));
	}
	if (parsed.border) Object.assign(button.border, parsed.border, { enabled: true });
	if (parsed.layout) Object.assign(button.layout, parsed.layout, { enabled: true });
	if (parsed.typography) Object.assign(button.typography, parsed.typography, { enabled: true });
	if (parsed.shadows?.length) {
		shadows[state].splice(0, shadows[state].length, ...parsed.shadows.map((shadow, index) => createShadow({ ...shadow, open: index === 0 })));
	}
}

function applyCssEditorStyles() {
	isEditingCss.value = true;
	const blocks = parseCssStateBlocks(cssEditor.value);
	let count = 0;

	Object.entries(blocks).forEach(([state, block]) => {
		const parsed = parseStyleSource(block, state);
		if (!parsed.found) return;
		applyParsedStylesToState(state, parsed);
		count += parsed.count;
	});

	if (!count) {
		const parsed = parseStyleSource(cssEditor.value, activeState.value);
		if (parsed.found) {
			applyParsedStylesToState(activeState.value, parsed);
			count += parsed.count;
		}
	}

	cssEditorFeedback.value = count
		? `Synced ${count} supported style${count === 1 ? '' : 's'} from CSS.`
		: 'No supported CSS changes found yet.';
}

function finishCssEditing() {
	isEditingCss.value = false;
	cssEditor.value = cssOutput.value;
}

function parseCssStateBlocks(source) {
	const blocks = {};
	const selectorMap = {
		base: /\.button\s*\{([^}]*)\}/,
		hover: /\.button:hover\s*\{([^}]*)\}/,
		active: /\.button:active\s*\{([^}]*)\}/,
		focus: /\.button:focus-visible\s*\{([^}]*)\}/,
	};
	Object.entries(selectorMap).forEach(([state, pattern]) => {
		const match = source.match(pattern);
		if (match) blocks[state] = match[1];
	});
	return blocks;
}

function parseStyleSource(source, state = activeState.value) {
	const parsed = { found: false, count: 0 };
	const targetButton = buttons[state];
	const declarations = parseCssDeclarations(source);
	const tailwind = parseTailwindClasses(source);

	if (declarations.background) {
		parsed.fills = parseBackgroundValue(declarations.background);
	}
	if (declarations['background-image']) {
		parsed.fills = parseBackgroundValue(declarations['background-image']);
	}
	if (declarations['background-color']) {
		parsed.fills = [...(parsed.fills || []), parseFillLayer(declarations['background-color'])];
	}
	if (declarations.color) {
		parsed.typography = { ...(parsed.typography || {}), textColor: colorToHexAlpha(declarations.color).hex };
	}
	if (declarations['font-size']) {
		parsed.typography = { ...(parsed.typography || {}), fontSize: parseNumber(declarations['font-size']) || targetButton.typography.fontSize };
	}
	if (declarations['font-weight']) {
		parsed.typography = { ...(parsed.typography || {}), fontWeight: parseNumber(declarations['font-weight']) || targetButton.typography.fontWeight };
	}
	if (declarations['border-radius']) {
		parsed.layout = { ...(parsed.layout || {}), radius: parseNumber(declarations['border-radius']) || currentButton.value.layout.radius };
	}
	if (declarations.padding) {
		Object.assign(parsed, parsePadding(declarations.padding, parsed));
	}
	if (declarations.border) {
		parsed.border = parseBorder(declarations.border, targetButton);
	}
	if (declarations['box-shadow']) {
		parsed.shadows = parseShadowList(declarations['box-shadow']);
	}

	Object.keys(tailwind).forEach((key) => {
		if (Array.isArray(tailwind[key])) {
			parsed[key] = [...(parsed[key] || []), ...tailwind[key]];
		} else {
			parsed[key] = { ...(parsed[key] || {}), ...tailwind[key] };
		}
	});

	parsed.count = ['fills', 'border', 'layout', 'typography', 'shadows'].reduce((count, key) => {
		if (Array.isArray(parsed[key])) return count + parsed[key].length;
		return parsed[key] ? count + 1 : count;
	}, 0);
	parsed.found = parsed.count > 0;
	return parsed;
}

function parseCssDeclarations(source) {
	const declarations = {};
	const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, '');
	withoutComments.replace(/([\w-]+)\s*:\s*([^;{}]+)/g, (_, property, value) => {
		declarations[property.trim().toLowerCase()] = value.trim();
		return '';
	});
	return declarations;
}

function parseTailwindClasses(source) {
	const parsed = {};
	const classSource = source.replace(/["'`]/g, ' ');
	classSource.split(/\s+/).forEach((className) => {
		const normalized = className.trim();
		if (!normalized) return;
		const token = normalized.includes(':') ? normalized.split(':').at(-1) : normalized;
		const arbitrary = token.match(/^([a-z-]+)-\[(.+)\]$/);
		if (!arbitrary) return;
		const [, utility, rawValue] = arbitrary;
		const value = rawValue.replaceAll('_', ' ');
		if (utility === 'bg') parsed.fills = parseBackgroundValue(value);
		if (utility === 'shadow') parsed.shadows = parseShadowList(value);
		if (utility === 'rounded') parsed.layout = { ...(parsed.layout || {}), radius: parseNumber(value) };
		if (utility === 'px') parsed.layout = { ...(parsed.layout || {}), paddingX: parseNumber(value) };
		if (utility === 'py') parsed.layout = { ...(parsed.layout || {}), paddingY: parseNumber(value) };
		if (utility === 'border') {
			if (value.includes('#') || value.startsWith('rgb')) parsed.border = { ...(parsed.border || {}), color: colorToHexAlpha(value).hex };
			else parsed.border = { ...(parsed.border || {}), width: parseNumber(value) };
		}
		if (utility === 'text') {
			if (value.includes('#') || value.startsWith('rgb')) parsed.typography = { ...(parsed.typography || {}), textColor: colorToHexAlpha(value).hex };
			else parsed.typography = { ...(parsed.typography || {}), fontSize: parseNumber(value) };
		}
		if (utility === 'font') parsed.typography = { ...(parsed.typography || {}), fontWeight: parseNumber(value) };
	});
	return parsed;
}

function parseBackgroundValue(value) {
	return splitCssList(value).map((layer) => parseFillLayer(layer)).filter(Boolean);
}

function parseFillLayer(layer) {
	const trimmed = layer.trim();
	if (!trimmed) return null;
	if (trimmed.startsWith('linear-gradient')) {
		const colors = parseGradientColors(trimmed);
		return {
			kind: 'linear',
			gradientAngle: parseNumber(trimmed.match(/(-?\d+(?:\.\d+)?)deg/)?.[1]) ?? 135,
			gradientFrom: colors[0]?.hex || '#171717',
			gradientFromAlpha: colors[0]?.alpha ?? 100,
			gradientTo: colors[1]?.hex || '#4f46e5',
			gradientToAlpha: colors[1]?.alpha ?? 100,
			gradientFromStop: colors[0]?.stop ?? 0,
			gradientToStop: colors[1]?.stop ?? 100,
		};
	}
	if (trimmed.startsWith('radial-gradient')) {
		const colors = parseGradientColors(trimmed);
		return {
			kind: 'radial',
			gradientFrom: colors[0]?.hex || '#171717',
			gradientFromAlpha: colors[0]?.alpha ?? 100,
			gradientTo: colors[1]?.hex || '#4f46e5',
			gradientToAlpha: colors[1]?.alpha ?? 100,
			gradientFromStop: colors[0]?.stop ?? 0,
			gradientToStop: colors[1]?.stop ?? 100,
		};
	}
	const color = colorToHexAlpha(trimmed);
	return { kind: 'solid', color: color.hex, alpha: color.alpha };
}

function parseGradientColors(value) {
	return [...value.matchAll(/(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}|transparent)(?:\s+(-?\d+(?:\.\d+)?)%)?/g)]
		.map((match) => ({ ...colorToHexAlpha(match[1]), stop: match[2] === undefined ? undefined : Number(match[2]) }))
		.slice(0, 2);
}

function parsePadding(value, parsed) {
	const numbers = value.split(/\s+/).map(parseNumber).filter((number) => Number.isFinite(number));
	if (!numbers.length) return parsed;
	const paddingY = numbers[0];
	const paddingX = numbers[1] ?? numbers[0];
	return { ...parsed, layout: { ...(parsed.layout || {}), paddingX, paddingY } };
}

function parseBorder(value, targetButton = currentButton.value) {
	const colorMatch = value.match(/(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}|transparent)/);
	return {
		width: parseNumber(value) ?? 1,
		color: colorMatch ? colorToHexAlpha(colorMatch[1]).hex : targetButton.border.color,
	};
}

function parseShadowList(value) {
	return splitCssList(value).map((layer) => {
		const colorMatch = layer.match(/(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}|transparent)/);
		const color = colorMatch ? colorToHexAlpha(colorMatch[1]) : { hex: '#000000', alpha: 20 };
		const numbers = layer.replace(/rgba?\([^)]+\)/g, '').match(/-?\d+(?:\.\d+)?(?:px)?/g)?.map(parseNumber) || [];
		const spread = numbers[3] ?? 0;
		return {
			kind: layer.includes('inset') ? 'inset' : (numbers[0] === 0 && numbers[1] === 0 && numbers[2] === 0 && spread > 0 ? 'ring' : 'drop'),
			color: color.hex,
			alpha: color.alpha,
			x: numbers[0] ?? 0,
			y: numbers[1] ?? 8,
			blur: numbers[2] ?? 18,
			spread,
		};
	}).filter(Boolean);
}

function splitCssList(value) {
	const items = [];
	let depth = 0;
	let current = '';
	value.split('').forEach((char) => {
		if (char === '(') depth += 1;
		if (char === ')') depth -= 1;
		if (char === ',' && depth === 0) {
			items.push(current.trim());
			current = '';
			return;
		}
		current += char;
	});
	if (current.trim()) items.push(current.trim());
	return items;
}

function colorToHexAlpha(value) {
	const trimmed = value.trim();
	if (trimmed === 'transparent') return { hex: '#000000', alpha: 0 };
	if (trimmed.startsWith('#')) {
		const normalized = trimmed.replace('#', '');
		const hex = normalized.length === 3
			? normalized.split('').map((char) => `${char}${char}`).join('')
			: normalized.slice(0, 6).padEnd(6, '0');
		const alpha = normalized.length === 8 ? Math.round((Number.parseInt(normalized.slice(6, 8), 16) / 255) * 100) : 100;
		return { hex: `#${hex}`, alpha };
	}
	const rgba = trimmed.match(/rgba?\(([^)]+)\)/);
	if (rgba) {
		const channels = rgba[1].split(',').map((part) => part.trim());
		const [r, g, b] = channels.map((channel) => Math.max(0, Math.min(255, Number.parseFloat(channel))));
		const alpha = channels[3] === undefined ? 100 : Math.round(Math.max(0, Math.min(1, Number.parseFloat(channels[3]))) * 100);
		return {
			hex: `#${[r, g, b].map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`,
			alpha,
		};
	}
	return { hex: trimmed, alpha: 100 };
}

function parseNumber(value) {
	if (value === undefined || value === null) return undefined;
	const number = Number.parseFloat(String(value));
	return Number.isFinite(number) ? number : undefined;
}

async function copyOutput(target, value) {
	try {
		await navigator.clipboard.writeText(value);
		copiedTarget.value = target;
		window.setTimeout(() => {
			if (copiedTarget.value === target) copiedTarget.value = '';
		}, 1600);
	} catch {
		copiedTarget.value = 'blocked';
	}
}

function shadowTitle(shadow) {
	if (shadow.kind === 'ring') return 'Ring';
	if (shadow.kind === 'inset') return 'Inner shadow';
	return 'Drop shadow';
}
</script>

<template>
	<main class="min-h-screen bg-background text-foreground xl:h-dvh xl:overflow-hidden">
		<section class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:h-full xl:max-w-none">
			<header class="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-end lg:justify-between xl:shrink-0">
				<div class="max-w-3xl space-y-1.5">
					<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Experiments / CSS tools</p>
					<h1 class="text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">CSS button creator</h1>
					<p class="max-w-2xl text-sm leading-6 text-muted-foreground">
						Design-tool style button CSS editor with stateful preview and generated output.
					</p>
				</div>
				<div class="flex flex-wrap items-center gap-2">
					<ElButton variant="secondary" size="sm" type="button" @click="copyBaseToState">Copy base to state</ElButton>
					<ElButton variant="ghost" size="sm" type="button" @click="resetButton">Reset</ElButton>
				</div>
			</header>

			<div class="grid min-h-0 gap-4 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_420px] xl:overflow-hidden">
				<section class="min-h-0 space-y-4 focus:outline-none xl:overflow-y-auto xl:pr-1" tabindex="0" aria-label="Preview and generated code">
					<section class="overflow-hidden rounded-lg border border-border bg-card text-card-foreground xl:sticky xl:top-0 xl:z-10">
						<div class="grid min-h-[24rem] place-items-center bg-[linear-gradient(135deg,color-mix(in_oklch,var(--secondary)_82%,transparent),var(--background))] p-8 xl:min-h-[clamp(18rem,52vh,34rem)]">
							<button
								class="button-preview"
								type="button"
								:style="previewStyle"
								@mouseenter="previewInteraction = 'hover'"
								@mouseleave="previewInteraction = null"
								@mousedown="previewInteraction = 'active'"
								@mouseup="previewInteraction = 'hover'"
								@focus="previewInteraction = 'focus'"
								@blur="previewInteraction = null"
							>
								{{ currentButton.label }}
							</button>
						</div>
						<div class="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
							<div>
								<h2 class="text-sm font-semibold">Stage</h2>
								<p class="text-xs text-muted-foreground">Previewing {{ stateLabels[previewState].toLowerCase() }} styling.</p>
							</div>
							<div class="rounded-full border border-border bg-secondary px-3 py-1 font-mono text-xs text-secondary-foreground">
								{{ enabledCurrentShadows.length }} active shadow{{ enabledCurrentShadows.length === 1 ? '' : 's' }}
							</div>
						</div>
					</section>

					<section class="rounded-lg border border-border bg-card text-card-foreground">
						<div class="grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2">
							<button type="button" class="min-w-0 text-left" @click="sectionOpen.css = !sectionOpen.css">
								<span class="block truncate text-sm font-semibold">CSS</span>
							</button>
							<div class="flex items-center gap-1">
								<ElButton size="sm" variant="secondary" type="button" @click.stop="copyOutput('css', cssOutput)">
									{{ copiedTarget === 'css' ? 'Copied' : 'Copy CSS' }}
								</ElButton>
								<button type="button" class="icon-button" :aria-label="sectionOpen.css ? 'Collapse CSS' : 'Expand CSS'" @click="sectionOpen.css = !sectionOpen.css">{{ sectionOpen.css ? '-' : '+' }}</button>
							</div>
						</div>
						<div v-if="sectionOpen.css" class="border-t border-border">
							<textarea
								v-model="cssEditor"
								rows="18"
								spellcheck="false"
								autocapitalize="off"
								autocomplete="off"
								class="block max-h-96 min-h-80 w-full resize-y overflow-auto bg-transparent p-4 font-mono text-xs leading-6 text-foreground outline-none focus:ring-2 focus:ring-inset focus:ring-ring/30"
								@input="applyCssEditorStyles"
								@focus="isEditingCss = true"
								@blur="finishCssEditing"
							></textarea>
							<p v-if="cssEditorFeedback" class="border-t border-border px-4 py-2 text-xs text-muted-foreground">{{ cssEditorFeedback }}</p>
						</div>
					</section>

					<section class="rounded-lg border border-border bg-card text-card-foreground">
						<div class="grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2">
							<button type="button" class="min-w-0 text-left" @click="sectionOpen.import = !sectionOpen.import">
								<span class="block truncate text-sm font-semibold">Import styles</span>
							</button>
							<div class="flex items-center gap-1">
								<ElButton size="sm" variant="secondary" type="button" @click.stop="applyImportedStyles">Apply</ElButton>
								<button type="button" class="icon-button" :aria-label="sectionOpen.import ? 'Collapse import styles' : 'Expand import styles'" @click="sectionOpen.import = !sectionOpen.import">{{ sectionOpen.import ? '-' : '+' }}</button>
							</div>
						</div>
						<div v-if="sectionOpen.import" class="space-y-3 border-t border-border p-3">
							<label class="block space-y-1.5">
								<span class="text-xs font-medium uppercase text-muted-foreground">CSS or Tailwind</span>
								<textarea
									v-model="importSource"
									rows="6"
									spellcheck="false"
									autocapitalize="off"
									autocomplete="off"
									class="min-h-36 w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-xs leading-5 text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
								></textarea>
							</label>
							<button
								type="button"
								class="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
								@click="applyImportedStyles"
							>
								Apply to {{ stateLabels[activeState] }}
							</button>
							<p v-if="importFeedback" class="text-xs text-muted-foreground">{{ importFeedback }}</p>
							<p class="text-xs leading-5 text-muted-foreground">
								Supports common background layers, border, radius, padding, type, text colour, and box-shadow values for the active state.
							</p>
						</div>
					</section>

					<section class="rounded-lg border border-border bg-card text-card-foreground">
						<div class="grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2">
							<button type="button" class="min-w-0 text-left" @click="sectionOpen.tailwind = !sectionOpen.tailwind">
								<span class="block truncate text-sm font-semibold">Tailwind</span>
							</button>
							<div class="flex items-center gap-1">
								<ElButton size="sm" variant="secondary" type="button" @click.stop="copyOutput('tailwind', tailwindOutput)">
									{{ copiedTarget === 'tailwind' ? 'Copied' : 'Copy classes' }}
								</ElButton>
								<button type="button" class="icon-button" :aria-label="sectionOpen.tailwind ? 'Collapse Tailwind' : 'Expand Tailwind'" @click="sectionOpen.tailwind = !sectionOpen.tailwind">{{ sectionOpen.tailwind ? '-' : '+' }}</button>
							</div>
						</div>
						<div v-if="sectionOpen.tailwind" class="border-t border-border">
							<pre class="max-h-64 overflow-auto whitespace-pre-wrap break-words p-4 text-xs leading-6"><code>{{ tailwindOutput }}</code></pre>
						</div>
					</section>
				</section>

				<aside class="flex min-h-0 flex-col gap-3 focus:outline-none xl:h-full xl:overflow-y-auto xl:pr-1" tabindex="0" aria-label="Button properties">
					<section class="order-1 rounded-lg border border-border bg-card text-card-foreground">
						<div class="grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2">
							<button type="button" class="min-w-0 text-left" @click="sectionOpen.states = !sectionOpen.states">
								<span class="block truncate text-sm font-semibold">States</span>
							</button>
							<button type="button" class="icon-button" :aria-label="sectionOpen.states ? 'Collapse states' : 'Expand states'" @click="sectionOpen.states = !sectionOpen.states">{{ sectionOpen.states ? '-' : '+' }}</button>
						</div>
						<div v-if="sectionOpen.states" class="grid grid-cols-4 gap-1 border-t border-border p-1">
							<button
								v-for="(label, key) in stateLabels"
								:key="key"
								type="button"
								class="h-9 rounded-md px-2 text-xs font-medium transition"
								:class="activeState === key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'"
								@click="setActiveState(key)"
							>
								{{ label }}
							</button>
						</div>
					</section>

					<section class="order-2 rounded-lg border border-border bg-card text-card-foreground">
						<div class="grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2">
							<button type="button" class="min-w-0 text-left" @click="sectionOpen.content = !sectionOpen.content">
								<span class="block truncate text-sm font-semibold">Content</span>
							</button>
							<button type="button" class="icon-button" :aria-label="sectionOpen.content ? 'Collapse content' : 'Expand content'" @click="sectionOpen.content = !sectionOpen.content">{{ sectionOpen.content ? '-' : '+' }}</button>
						</div>
						<div v-if="sectionOpen.content" class="border-t border-border p-3">
							<ElTextInput v-model="currentButton.label" label="Label" />
						</div>
					</section>

					<section class="order-6 rounded-lg border border-border bg-card text-card-foreground" :class="!currentButton.background.enabled && 'opacity-60'">
						<div class="grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2">
							<button type="button" class="min-w-0 text-left" @click="sectionOpen.background = !sectionOpen.background">
								<span class="block truncate text-sm font-semibold">Fill</span>
								<span class="block text-xs text-muted-foreground">{{ enabledFills(currentButton.background.fills).length }} of {{ currentButton.background.fills.length }} visible</span>
							</button>
							<div class="flex items-center gap-1">
								<ElButton size="sm" type="button" @click.stop="addFill">Add</ElButton>
								<button type="button" class="icon-button" :aria-label="currentButton.background.enabled ? 'Hide background' : 'Show background'" @click="currentButton.background.enabled = !currentButton.background.enabled">
									<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
										<path v-if="currentButton.background.enabled" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
										<path v-if="currentButton.background.enabled" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="1.8" />
										<path v-else d="M3 3l18 18M10.6 10.6A3 3 0 0 0 13.4 13.4M7.1 7.8C4.1 9.4 2.5 12 2.5 12s3.5 6 9.5 6c1.6 0 3-.4 4.2-1M19.1 15.1c1.6-1.4 2.4-3.1 2.4-3.1s-3.5-6-9.5-6c-.8 0-1.6.1-2.3.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								</button>
								<button type="button" class="icon-button" :aria-label="sectionOpen.background ? 'Collapse background' : 'Expand background'" @click="sectionOpen.background = !sectionOpen.background">{{ sectionOpen.background ? '-' : '+' }}</button>
							</div>
						</div>
							<div v-if="sectionOpen.background" class="divide-y divide-border border-t border-border">
								<article v-for="(fill, index) in currentButton.background.fills" :key="fill.id" class="px-3 py-2" :class="!fill.enabled && 'opacity-60'">
									<div class="grid grid-cols-[1fr_auto] items-center gap-2">
										<ElPopover :data-layer-popover-id="fill.id" position="start-bottom" width="w-[22rem] max-w-[calc(100vw-2rem)]" padding="p-0" :collision-padding="12" @open="closeOtherLayerPopovers(fill.id)">
											<template #trigger>
												<button type="button" class="grid w-full min-w-0 grid-cols-[auto_1fr] items-center gap-2 rounded-md text-left transition hover:bg-secondary/60" @pointerdown.capture="closeAllLayerPopovers">
													<span class="h-5 w-5 rounded border border-border" :style="{ background: fillToCss(fill) }" />
														<span class="min-w-0">
															<span class="block truncate text-sm font-medium">{{ fill.kind === 'solid' ? 'Solid' : fill.kind === 'linear' ? 'Linear gradient' : 'Radial gradient' }}</span>
														</span>
													</button>
												</template>
												<div>
													<div class="border-b border-border px-3 py-2">
														<p class="truncate text-sm font-semibold">Fill {{ index + 1 }}</p>
													</div>
													<div class="grid gap-3 p-3 sm:grid-cols-2">
													<ElNativeSelect v-model="fill.kind" label="Type" :options="fillTypeOptions" placeholder="" />
													<template v-if="fill.kind === 'solid'">
														<ElColorInput v-model="fill.color" label="Colour" />
														<ElRangeInput v-model="fill.alpha" label="Alpha" :min="0" :max="100" suffix="%" />
													</template>
													<template v-else>
														<ElColorInput v-model="fill.gradientFrom" label="From" />
														<ElRangeInput v-model="fill.gradientFromAlpha" label="From alpha" :min="0" :max="100" suffix="%" />
														<ElColorInput v-model="fill.gradientTo" label="To" />
														<ElRangeInput v-model="fill.gradientToAlpha" label="To alpha" :min="0" :max="100" suffix="%" />
														<ElRangeInput v-if="fill.kind === 'linear'" v-model="fill.gradientAngle" label="Angle" :min="0" :max="360" suffix="deg" />
														<ElRangeInput v-model="fill.gradientFromStop" label="From stop" :min="0" :max="100" suffix="%" />
														<ElRangeInput v-model="fill.gradientToStop" label="To stop" :min="0" :max="100" suffix="%" />
													</template>
												</div>
											</div>
										</ElPopover>
										<div class="flex items-center gap-1">
											<button type="button" class="icon-button" aria-label="Duplicate fill" @click="duplicateFill(index)">
												<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
													<path d="M8 8h10v10H8V8Z" stroke="currentColor" stroke-width="1.8" />
													<path d="M6 16H4V4h12v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
												</svg>
											</button>
											<button type="button" class="icon-button" :aria-label="fill.enabled ? 'Hide fill' : 'Show fill'" @click="fill.enabled = !fill.enabled">
												<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
													<path v-if="fill.enabled" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
													<path v-if="fill.enabled" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="1.8" />
													<path v-else d="M3 3l18 18M10.6 10.6A3 3 0 0 0 13.4 13.4M7.1 7.8C4.1 9.4 2.5 12 2.5 12s3.5 6 9.5 6c1.6 0 3-.4 4.2-1M19.1 15.1c1.6-1.4 2.4-3.1 2.4-3.1s-3.5-6-9.5-6c-.8 0-1.6.1-2.3.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
												</svg>
											</button>
											<button type="button" class="icon-button" aria-label="Remove fill" @click="removeFill(index)">
												<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
													<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
												</svg>
											</button>
										</div>
									</div>
								</article>
							</div>
					</section>

					<section class="order-4 rounded-lg border border-border bg-card text-card-foreground" :class="!currentButton.typography.enabled && 'opacity-60'">
						<div class="grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2">
							<button type="button" class="min-w-0 text-left" @click="sectionOpen.typography = !sectionOpen.typography">
								<span class="block truncate text-sm font-semibold">Typography</span>
							</button>
							<div class="flex items-center gap-1">
								<button type="button" class="icon-button" :aria-label="currentButton.typography.enabled ? 'Hide typography' : 'Show typography'" @click="currentButton.typography.enabled = !currentButton.typography.enabled">
									<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
										<path v-if="currentButton.typography.enabled" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
										<path v-if="currentButton.typography.enabled" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="1.8" />
										<path v-else d="M3 3l18 18M10.6 10.6A3 3 0 0 0 13.4 13.4M7.1 7.8C4.1 9.4 2.5 12 2.5 12s3.5 6 9.5 6c1.6 0 3-.4 4.2-1M19.1 15.1c1.6-1.4 2.4-3.1 2.4-3.1s-3.5-6-9.5-6c-.8 0-1.6.1-2.3.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								</button>
								<button type="button" class="icon-button" :aria-label="sectionOpen.typography ? 'Collapse typography' : 'Expand typography'" @click="sectionOpen.typography = !sectionOpen.typography">{{ sectionOpen.typography ? '-' : '+' }}</button>
							</div>
						</div>
						<div v-if="sectionOpen.typography" class="border-t border-border p-3">
							<div class="grid gap-3 sm:grid-cols-2">
								<ElColorInput v-model="currentButton.typography.textColor" label="Text colour" />
								<ElRangeInput v-model="currentButton.typography.fontSize" label="Font size" :min="11" :max="26" suffix="px" />
								<ElRangeInput v-model="currentButton.typography.fontWeight" label="Font weight" :min="300" :max="900" :step="50" />
							</div>
						</div>
					</section>

					<section class="order-3 rounded-lg border border-border bg-card text-card-foreground" :class="!currentButton.layout.enabled && 'opacity-60'">
						<div class="grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2">
							<button type="button" class="min-w-0 text-left" @click="sectionOpen.layout = !sectionOpen.layout">
								<span class="block truncate text-sm font-semibold">Layout</span>
							</button>
							<div class="flex items-center gap-1">
								<button type="button" class="icon-button" :aria-label="currentButton.layout.enabled ? 'Hide layout' : 'Show layout'" @click="currentButton.layout.enabled = !currentButton.layout.enabled">
									<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
										<path v-if="currentButton.layout.enabled" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
										<path v-if="currentButton.layout.enabled" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="1.8" />
										<path v-else d="M3 3l18 18M10.6 10.6A3 3 0 0 0 13.4 13.4M7.1 7.8C4.1 9.4 2.5 12 2.5 12s3.5 6 9.5 6c1.6 0 3-.4 4.2-1M19.1 15.1c1.6-1.4 2.4-3.1 2.4-3.1s-3.5-6-9.5-6c-.8 0-1.6.1-2.3.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								</button>
								<button type="button" class="icon-button" :aria-label="sectionOpen.layout ? 'Collapse layout' : 'Expand layout'" @click="sectionOpen.layout = !sectionOpen.layout">{{ sectionOpen.layout ? '-' : '+' }}</button>
							</div>
						</div>
						<div v-if="sectionOpen.layout" class="border-t border-border p-3">
							<div class="grid gap-3 sm:grid-cols-2">
								<ElRangeInput v-model="currentButton.layout.paddingX" label="Padding X" :min="8" :max="56" suffix="px" />
								<ElRangeInput v-model="currentButton.layout.paddingY" label="Padding Y" :min="6" :max="28" suffix="px" />
								<ElRangeInput v-model="currentButton.layout.radius" label="Radius" :min="0" :max="999" suffix="px" />
							</div>
						</div>
					</section>

					<section class="order-5 rounded-lg border border-border bg-card text-card-foreground" :class="!currentButton.border.enabled && 'opacity-60'">
						<div class="grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2">
							<button type="button" class="min-w-0 text-left" @click="sectionOpen.border = !sectionOpen.border">
								<span class="block truncate text-sm font-semibold">Border</span>
							</button>
							<div class="flex items-center gap-1">
								<button type="button" class="icon-button" :aria-label="currentButton.border.enabled ? 'Hide border' : 'Show border'" @click="currentButton.border.enabled = !currentButton.border.enabled">
									<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
										<path v-if="currentButton.border.enabled" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
										<path v-if="currentButton.border.enabled" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="1.8" />
										<path v-else d="M3 3l18 18M10.6 10.6A3 3 0 0 0 13.4 13.4M7.1 7.8C4.1 9.4 2.5 12 2.5 12s3.5 6 9.5 6c1.6 0 3-.4 4.2-1M19.1 15.1c1.6-1.4 2.4-3.1 2.4-3.1s-3.5-6-9.5-6c-.8 0-1.6.1-2.3.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								</button>
								<button type="button" class="icon-button" :aria-label="sectionOpen.border ? 'Collapse border' : 'Expand border'" @click="sectionOpen.border = !sectionOpen.border">{{ sectionOpen.border ? '-' : '+' }}</button>
							</div>
						</div>
						<div v-if="sectionOpen.border" class="border-t border-border p-3">
							<div class="grid gap-3 sm:grid-cols-2">
								<ElRangeInput v-model="currentButton.border.width" label="Width" :min="0" :max="6" suffix="px" />
								<ElColorInput v-model="currentButton.border.color" label="Colour" />
							</div>
						</div>
					</section>

					<section class="order-7 rounded-lg border border-border bg-card text-card-foreground">
						<div class="grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2">
							<button type="button" class="min-w-0 text-left" @click="sectionOpen.shadows = !sectionOpen.shadows">
								<span class="block truncate text-sm font-semibold">{{ stateLabels[activeState] }} box shadows</span>
								<span class="block text-xs text-muted-foreground">{{ enabledCurrentShadows.length }} of {{ currentShadows.length }} visible</span>
							</button>
							<div class="flex items-center gap-1">
								<ElButton size="sm" type="button" @click.stop="addShadow()">Add</ElButton>
								<button type="button" class="icon-button" :aria-label="sectionOpen.shadows ? 'Collapse shadows' : 'Expand shadows'" @click="sectionOpen.shadows = !sectionOpen.shadows">{{ sectionOpen.shadows ? '-' : '+' }}</button>
							</div>
						</div>
							<div v-if="sectionOpen.shadows" class="divide-y divide-border border-t border-border">
								<article v-for="(shadow, index) in currentShadows" :key="shadow.id" class="px-3 py-2" :class="!shadow.enabled && 'opacity-60'">
									<div class="grid grid-cols-[1fr_auto] items-center gap-2">
										<ElPopover :data-layer-popover-id="shadow.id" position="start-bottom" width="w-[22rem] max-w-[calc(100vw-2rem)]" padding="p-0" :collision-padding="12" @open="closeOtherLayerPopovers(shadow.id)">
											<template #trigger>
												<button type="button" class="w-full min-w-0 rounded-md text-left transition hover:bg-secondary/60" @pointerdown.capture="closeAllLayerPopovers">
													<span class="flex min-w-0 items-center gap-2">
														<span class="font-mono text-[11px] text-muted-foreground">{{ index + 1 }}</span>
														<span class="truncate text-sm font-medium">{{ shadowTitle(shadow) }}</span>
													</span>
												</button>
											</template>
											<div>
												<div class="border-b border-border px-3 py-2">
													<p class="truncate text-sm font-semibold">{{ shadowTitle(shadow) }}</p>
												</div>
												<div class="grid gap-3 p-3 sm:grid-cols-2">
													<ElNativeSelect v-model="shadow.kind" label="Type" :options="shadowKindOptions" placeholder="" />
													<ElColorInput v-model="shadow.color" label="Colour" />
													<ElRangeInput v-model="shadow.alpha" label="Alpha" :min="0" :max="100" suffix="%" />
													<ElRangeInput v-model="shadow.x" label="Horizontal" :min="-80" :max="80" suffix="px" :disabled="shadow.kind === 'ring'" />
													<ElRangeInput v-model="shadow.y" label="Vertical" :min="-80" :max="80" suffix="px" :disabled="shadow.kind === 'ring'" />
													<ElRangeInput v-model="shadow.blur" label="Blur" :min="0" :max="120" suffix="px" :disabled="shadow.kind === 'ring'" />
													<ElRangeInput v-model="shadow.spread" label="Spread" :min="-80" :max="80" suffix="px" />
												</div>
											</div>
										</ElPopover>
										<div class="flex items-center gap-1">
											<button type="button" class="icon-button" aria-label="Duplicate shadow" @click="duplicateShadow(index)">
												<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
													<path d="M8 8h10v10H8V8Z" stroke="currentColor" stroke-width="1.8" />
													<path d="M6 16H4V4h12v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
												</svg>
											</button>
											<button type="button" class="icon-button" :aria-label="shadow.enabled ? 'Hide shadow' : 'Show shadow'" @click="shadow.enabled = !shadow.enabled">
												<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
													<path v-if="shadow.enabled" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
													<path v-if="shadow.enabled" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="1.8" />
													<path v-else d="M3 3l18 18M10.6 10.6A3 3 0 0 0 13.4 13.4M7.1 7.8C4.1 9.4 2.5 12 2.5 12s3.5 6 9.5 6c1.6 0 3-.4 4.2-1M19.1 15.1c1.6-1.4 2.4-3.1 2.4-3.1s-3.5-6-9.5-6c-.8 0-1.6.1-2.3.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
												</svg>
											</button>
											<button type="button" class="icon-button" aria-label="Remove shadow" @click="removeShadow(index)">
												<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
													<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
												</svg>
											</button>
										</div>
									</div>
								</article>
							</div>
					</section>

					<section class="order-8 rounded-lg border border-border bg-card text-card-foreground">
						<div class="grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2">
							<button type="button" class="min-w-0 text-left" @click="sectionOpen.ai = !sectionOpen.ai">
								<span class="block truncate text-sm font-semibold">AI theme request</span>
							</button>
							<div class="flex items-center gap-1">
								<ElButton size="sm" variant="secondary" type="button" @click.stop="applyThemePreset">Try</ElButton>
								<button type="button" class="icon-button" :aria-label="sectionOpen.ai ? 'Collapse AI theme request' : 'Expand AI theme request'" @click="sectionOpen.ai = !sectionOpen.ai">{{ sectionOpen.ai ? '-' : '+' }}</button>
							</div>
						</div>
						<div v-if="sectionOpen.ai" class="space-y-3 border-t border-border p-3">
							<ElTextareaInput v-model="aiThemeIntent" label="Request" :rows="3" />
							<div class="flex flex-wrap items-center gap-2">
								<ElButton size="sm" type="button" @click="copyOutput('ai-theme', aiThemeRequest)">
									{{ copiedTarget === 'ai-theme' ? 'Copied' : 'Copy AI prompt' }}
								</ElButton>
								<ElButton size="sm" variant="secondary" type="button" @click="copyOutput('theme-json', JSON.stringify(themeSnapshot(), null, 2))">
									{{ copiedTarget === 'theme-json' ? 'Copied' : 'Copy theme JSON' }}
								</ElButton>
							</div>
							<pre class="max-h-44 overflow-auto rounded-md border border-border bg-background p-3 text-[11px] leading-5"><code>{{ aiThemeRequest }}</code></pre>
						</div>
					</section>
				</aside>
			</div>
		</section>
	</main>
</template>

<style scoped>
.button-preview {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	line-height: 1;
	transition:
		background 160ms ease,
		border-color 160ms ease,
		color 160ms ease,
		box-shadow 160ms ease,
		transform 120ms ease;
}

.icon-button {
	display: inline-flex;
	width: 1.75rem;
	height: 1.75rem;
	align-items: center;
	justify-content: center;
	border-radius: 0.375rem;
	color: var(--muted-foreground);
	font-size: 0.875rem;
	line-height: 1;
	transition: background-color 140ms ease, color 140ms ease;
}

.icon-button svg {
	width: 1rem;
	height: 1rem;
}

.icon-button:hover {
	background: var(--secondary);
	color: var(--secondary-foreground);
}
</style>
