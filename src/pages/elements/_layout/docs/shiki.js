// Optional syntax highlighting via Shiki, loaded from an ESM CDN at runtime.
//
// We deliberately do NOT add Shiki as a project dependency — code highlighting
// is a polish feature, not a critical one. If the CDN fails or the user is
// offline, callers receive `null` and fall back to plain <pre> rendering.

const SHIKI_URL = 'https://esm.sh/shiki@1';
const LIGHT = 'github-light';
const DARK = 'github-dark';
const LANGS = ['vue', 'html', 'javascript', 'typescript', 'css', 'json', 'markdown', 'text'];
const LANG_ALIASES = {
	js: 'javascript',
	ts: 'typescript',
	md: 'markdown',
	txt: 'text',
};

let highlighterPromise = null;
let loadFailed = false;

async function getHighlighter() {
	if (loadFailed) return null;
	if (highlighterPromise) return highlighterPromise;

	highlighterPromise = (async () => {
		if (typeof window === 'undefined') return null;
		try {
			// `@vite-ignore` keeps Vite from trying to bundle / resolve the URL.
			const shiki = await import(/* @vite-ignore */ SHIKI_URL);
			const factory = shiki.createHighlighter || shiki.getHighlighter;
			if (!factory) throw new Error('shiki: no factory export');
			return await factory({ themes: [LIGHT, DARK], langs: LANGS });
		} catch (err) {
			loadFailed = true;
			if (typeof console !== 'undefined') {
				// eslint-disable-next-line no-console
				console.info('[elements] Shiki CDN unavailable — using plain code blocks.', err?.message);
			}
			return null;
		}
	})();

	return highlighterPromise;
}

export async function highlight(code, lang = 'vue') {
	if (!code) return null;
	const h = await getHighlighter();
	if (!h) return null;
	try {
		const normalizedLang = LANG_ALIASES[lang] || lang;
		return h.codeToHtml(code, {
			lang: LANGS.includes(normalizedLang) ? normalizedLang : 'html',
			themes: { light: LIGHT, dark: DARK },
		});
	} catch {
		return null;
	}
}
