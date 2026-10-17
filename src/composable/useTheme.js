import { computed, ref, watch } from 'vue';
import { applyThemeMode, useTheme as useDomTheme } from '@dom-studio-theme';

export const SITE_MODE_KEY = 'site-mode';
export const siteModes = Object.freeze([
	{ value: 'space', label: 'Space', description: 'Stars, planets and a little wonder.', swatch: 'linear-gradient(135deg, #eebf75, #8961d5, #64bfd3)' },
	{ value: 'ai-overlord', label: 'AI Overlord', description: 'Falling binary. Terminal green.', swatch: 'linear-gradient(135deg, #081b14, #8af5bb)' },
	{ value: 'professional', label: 'Professional', description: 'Clean, considered and focused.', swatch: 'linear-gradient(135deg, #ffffff, #171717)' },
]);

const siteMode = ref('professional');
const ready = ref(false);
const domTheme = useDomTheme();
const effectiveTheme = computed(resolveEffectiveTheme);
let initialized = false;

// Keep the shared preference observer outside page component lifetimes.
const stopPreferenceWatch = typeof window === 'undefined' ? null : watch(domTheme.resolvedTheme, applyAppearance, { flush: 'post' });
if (import.meta.hot) import.meta.hot.dispose(disposeThemeAdapter);

/** @returns {void} Releases the module observer before a development hot replacement. */
function disposeThemeAdapter() {
	stopPreferenceWatch?.();
}

/**
 * Validates a public mode identifier before it reaches storage or the DOM.
 * @param {unknown} value Candidate site mode.
 * @returns {boolean} Whether the site supports this mode.
 */
export function isSiteMode(value) {
	for (const option of siteModes) {
		if (option.value === value) return true;
	}
	return false;
}

/** @returns {'light' | 'dark'} The active palette, preserving the saved Professional preference. */
function resolveEffectiveTheme() {
	return siteMode.value === 'professional' ? domTheme.resolvedTheme.value : 'dark';
}

/**
 * Applies the site palette through DOM Studio without changing its saved colour preference.
 * @returns {void}
 */
function applyAppearance() {
	if (typeof document === 'undefined') return;
	document.documentElement.dataset.siteMode = siteMode.value;
	applyThemeMode(effectiveTheme.value);
	const meta = document.querySelector('meta[name="theme-color"]');
	if (meta) meta.content = effectiveTheme.value === 'light' ? '#ffffff' : siteMode.value === 'professional' ? '#0a0a0a' : siteMode.value === 'ai-overlord' ? '#060e0b' : '#06070f';
}

/**
 * Selects and remembers a website mode. Storage restrictions do not prevent switching.
 * @param {string} value Supported site mode identifier.
 * @returns {void}
 */
function setSiteMode(value) {
	if (!isSiteMode(value)) return;
	siteMode.value = value;
	try {
		window.localStorage.setItem(SITE_MODE_KEY, value);
	} catch {
		// Private or embedded contexts may disable storage; retain the in-memory choice.
	}
	applyAppearance();
}

/**
 * Updates DOM Studio's saved colour preference and reapplies the active site palette.
 * @param {'light' | 'dark' | 'system'} value Desired Professional colour preference.
 * @returns {void}
 */
function setMode(value) {
	domTheme.setMode(value);
	applyAppearance();
}

/** @returns {void} Advances the Professional colour preference through light, dark and system. */
function cycleMode() {
	setMode(({ light: 'dark', dark: 'system', system: 'light' })[domTheme.mode.value]);
}

/**
 * Initializes client preferences once, after hydration. The head script handles first paint.
 * DOM Studio owns system-colour observation; the post-flush watcher reapplies a cinematic
 * palette after an OS change without overwriting the saved Professional preference.
 * @returns {void}
 */
function initTheme() {
	if (typeof window === 'undefined' || initialized) return;
	initialized = true;
	const bootMode = document.documentElement.dataset.siteMode;
	if (isSiteMode(bootMode)) siteMode.value = bootMode;
	try {
		if (!window.localStorage.getItem('theme-mode')) {
			const legacy = window.localStorage.getItem('theme');
			if (legacy === 'light' || legacy === 'dark') window.localStorage.setItem('theme-mode', legacy);
		}
	} catch {
		// DOM Studio also supports unavailable localStorage.
	}
	domTheme.initTheme();
	applyAppearance();
	ready.value = true;
}

/**
 * Exposes site modes alongside DOM Studio's shared light/dark/system preference.
 * @returns {object} Reactive appearance state and explicit setters.
 */
export function useTheme() {
	return {
		siteMode,
		ready,
		effectiveTheme,
		mode: domTheme.mode,
		resolvedTheme: effectiveTheme,
		currentTheme: effectiveTheme,
		setSiteMode,
		setMode,
		cycleMode,
		toggleTheme: cycleMode,
		initTheme,
	};
}
