import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { nextTick } from 'vue';

const root = new URL('../../', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const bootstrap = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];

/**
 * Runs the actual first-paint script with controlled browser preferences.
 * @param {object} options Stored mode, colour preference, URL and storage availability.
 * @returns {object} The HTML dataset produced before hydration.
 */
function boot({ saved = null, colour = 'system', search = '', dark = false, blocked = false } = {}) {
	const document = { documentElement: { dataset: {} } };
	runInNewContext(bootstrap, {
		document,
		URLSearchParams,
		location: { search },
		/** @returns {{ matches: boolean }} Simulated system colour preference. */
		matchMedia() { return { matches: dark }; },
		localStorage: {
			/** @param {string} key Preference key. @returns {string | null} Stored value. */
			getItem(key) {
				if (blocked) throw new Error('Storage blocked');
				return key === 'site-mode' ? saved : key === 'theme-mode' ? colour : null;
			},
		},
	});
	return document.documentElement.dataset;
}

/** Verifies explicit links, invalid preferences, and unavailable storage before first paint. */
test('first paint restores modes and safely handles invalid or blocked storage', function testBootstrap() {
	assert.deepEqual(boot({ saved: null, colour: null }), { siteMode: 'professional', theme: 'light' });
	assert.deepEqual(boot({ saved: null, colour: null, dark: true }), { siteMode: 'professional', theme: 'dark' });
	assert.deepEqual(boot({ blocked: true }), { siteMode: 'professional', theme: 'light' });
	assert.deepEqual(boot({ saved: 'space' }), { siteMode: 'space', theme: 'dark' });
	assert.deepEqual(boot({ saved: 'ai-overlord', colour: 'light' }), { siteMode: 'ai-overlord', theme: 'dark' });
	assert.deepEqual(boot({ saved: 'space', search: '?mode=professional', colour: 'light' }), { siteMode: 'professional', theme: 'light' });
	assert.deepEqual(boot({ saved: 'professional', search: '?mode=invalid', dark: true }), { siteMode: 'professional', theme: 'dark' });
	assert.deepEqual(boot({ saved: 'invalid', colour: 'invalid' }), { siteMode: 'professional', theme: 'light' });
	assert.deepEqual(boot({ blocked: true, search: '?mode=professional' }), { siteMode: 'professional', theme: 'light' });
});

/** Exercises the real DOM Studio controller and the site's adapter through preference changes. */
test('cinematic modes preserve Professional preference and survive system colour changes', async function testRuntime() {
	const saved = new Map([['theme-mode', 'light']]);
	const listeners = new Set();
	const dataset = { siteMode: 'professional', theme: 'light' };
	const media = {
		matches: false,
		/** @param {string} type Event name. @param {Function} listener Listener to register. */
		addEventListener(type, listener) { listeners.add(listener); },
		/** @param {string} type Event name. @param {Function} listener Listener to remove. */
		removeEventListener(type, listener) { listeners.delete(listener); },
	};
	globalThis.window = {
		localStorage: {
			/** @param {string} key Preference key. @returns {string | null} Stored value. */
			getItem(key) { return saved.get(key) ?? null; },
			/** @param {string} key Preference key. @param {string} value New preference. */
			setItem(key, value) { saved.set(key, value); },
		},
		/** @returns {object} Simulated colour-scheme media query. */
		matchMedia() { return media; },
	};
	globalThis.document = {
		documentElement: { dataset },
		/** @returns {null} Metadata is unnecessary for this state transition test. */
		querySelector() { return null; },
	};
	try {
		const packageRoot = dirname(createRequire(import.meta.url).resolve('@getdom/studio/package.json'));
		const controllerUrl = pathToFileURL(resolve(packageRoot, 'src/pages/lib/vue/useTheme.js')).href;
		const source = (await readFile(new URL('src/composable/useTheme.js', root), 'utf8'))
			.replace("from 'vue'", `from '${import.meta.resolve('vue')}'`)
			.replace("from '@dom-studio-theme'", `from '${controllerUrl}'`);
		const { useTheme } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
		const theme = useTheme();
		theme.initTheme();
		assert.equal(dataset.theme, 'light');
		theme.setSiteMode('space');
		assert.equal(dataset.theme, 'dark');
		assert.equal(saved.get('theme-mode'), 'light');
		theme.setSiteMode('professional');
		assert.equal(dataset.theme, 'light');
		theme.setMode('system');
		media.matches = true;
		for (const listener of listeners) listener({ matches: true });
		await nextTick();
		assert.equal(dataset.theme, 'dark');
		theme.setSiteMode('ai-overlord');
		media.matches = false;
		for (const listener of listeners) listener({ matches: false });
		await nextTick();
		assert.equal(dataset.theme, 'dark');
		assert.equal(saved.get('theme-mode'), 'system');
		theme.setSiteMode('professional');
		assert.equal(dataset.theme, 'light');
		theme.setSiteMode('invalid');
		assert.equal(dataset.siteMode, 'professional');
		Object.defineProperty(window, 'localStorage', {
			/** @returns {never} Simulates a storage access restriction. */
			get() { throw new Error('Storage blocked'); },
		});
		theme.setSiteMode('space');
		theme.setMode('dark');
		await nextTick();
		assert.equal(dataset.siteMode, 'space');
		assert.equal(dataset.theme, 'dark');
	} finally {
		delete globalThis.window;
		delete globalThis.document;
	}
});
