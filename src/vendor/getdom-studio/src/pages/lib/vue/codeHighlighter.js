// Optional syntax highlighting via Shiki, loaded from an ESM CDN at runtime.
//
// Shiki is polish, not a hard runtime dependency. If the CDN is blocked,
// unavailable, or the app is rendering on the server, callers get null and
// can fall back to plain code rendering.

const SHIKI_URL = 'https://esm.sh/shiki@1';
const LIGHT = 'light-plus';
const DARK = 'dark-plus';
const LANGS = ['vue', 'html', 'javascript', 'typescript', 'css', 'json', 'markdown', 'python', 'bash', 'text'];
const LANG_ALIASES = {
	js: 'javascript',
	ts: 'typescript',
	md: 'markdown',
	sh: 'bash',
	txt: 'text',
};

let highlighterPromise = null;
let loadFailed = false;
const languagePromises = new Map();

/**
 * Loads the shared Shiki highlighter when the browser can reach the CDN.
 *
 * @returns {Promise<object|null>} Shiki highlighter instance, or null when unavailable.
 */
async function getHighlighter() {
	if (loadFailed) return null;
	if (highlighterPromise) return highlighterPromise;

	highlighterPromise = (async () => {
		if (typeof window === 'undefined') return null;
		try {
			const shiki = await import(/* @vite-ignore */ SHIKI_URL);
			const factory = shiki.createHighlighter || shiki.getHighlighter;
			if (!factory) throw new Error('shiki: no factory export');
			return await factory({ themes: [LIGHT, DARK], langs: [] });
		} catch (err) {
			loadFailed = true;
			if (typeof console !== 'undefined') {
				// eslint-disable-next-line no-console
				console.info('[dom-studio] Shiki CDN unavailable; using plain code blocks.', err?.message);
			}
			return null;
		}
	})();

	return highlighterPromise;
}

/**
 * Loads one bundled language grammar and shares concurrent requests for it.
 *
 * @param {object} highlighter Shiki highlighter instance.
 * @param {string} lang Normalized bundled language key.
 * @returns {Promise<void>} Resolves when the language grammar is available.
 */
async function ensureLanguage(highlighter, lang) {
	if (!languagePromises.has(lang)) {
		languagePromises.set(lang, highlighter.loadLanguage(lang));
	}

	try {
		await languagePromises.get(lang);
	} catch (err) {
		languagePromises.delete(lang);
		throw err;
	}
}

/**
 * Highlights source code with Shiki when available.
 *
 * @param {string} code Source code to highlight.
 * @param {string} lang Source language key.
 * @returns {Promise<string|null>} Highlighted HTML, or null for caller fallback.
 */
export async function highlight(code, lang = 'vue') {
	if (!code) return null;
	const h = await getHighlighter();
	if (!h) return null;
	try {
		const normalizedLang = LANG_ALIASES[lang] || lang;
		const resolvedLang = LANGS.includes(normalizedLang) ? normalizedLang : 'html';
		await ensureLanguage(h, resolvedLang);
		return h.codeToHtml(code, {
			lang: resolvedLang,
			themes: { light: LIGHT, dark: DARK },
		});
	} catch {
		return null;
	}
}
