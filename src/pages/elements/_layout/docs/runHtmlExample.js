// Mount a self-contained HTML example (markup + inline module scripts) for
// headless docs. The same file is imported with ?raw for the code panel and
// passed here for the live preview — one source of truth.

const MODULE_LOADERS = {
	'@elements/headless/drawer.js': () => import('../../lib/headless/drawer.js'),
	'@elements/headless': () => import('../../lib/headless/index.js'),
};

const IMPORT_RE = /^\s*import\s+['"]([^'"]+)['"]\s*;?\s*$/gm;

function stripModuleScripts(source) {
	return source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').trim();
}

function extractModuleScripts(source) {
	const scripts = [];
	const re = /<script\b[^>]*type=["']module["'][^>]*>([\s\S]*?)<\/script>/gi;
	let match;
	while ((match = re.exec(source))) {
		scripts.push(match[1].trim());
	}
	return scripts;
}

function importSpecs(body) {
	return [...body.matchAll(IMPORT_RE)].map((m) => m[1]);
}

async function preloadImports(scripts) {
	const specs = new Set(scripts.flatMap(importSpecs));
	for (const spec of specs) {
		const load = MODULE_LOADERS[spec];
		if (!load) throw new Error(`Unknown @elements import in HTML example: ${spec}`);
		await load();
	}
}

function injectModuleScript(container, body) {
	const stripped = body.replace(IMPORT_RE, '').trim();
	if (!stripped) return;

	// Real <script type="module"> — AsyncFunction/eval is blocked by CSP.
	// `root` is the demo mount node (script.parentElement).
	const script = document.createElement('script');
	script.type = 'module';
	script.textContent = `\n${stripped}`;
	container.appendChild(script);
}

/** Inject example markup and run any `<script type="module">` blocks. */
export async function mountHtmlExample(container, source) {
	if (!container) return;
	const scripts = extractModuleScripts(source);

	await preloadImports(scripts);

	container.replaceChildren();
	container.insertAdjacentHTML('afterbegin', stripModuleScripts(source));

	for (const body of scripts) {
		injectModuleScript(container, body);
	}
}
