import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { compile } from 'tailwindcss';

const endpoint = '/experiments/template-editor/tailwind.css';
const componentEndpoint = '/experiments/template-editor/components';
const maxBodyBytes = 512 * 1024;
const cssCache = new Map();
let compilerPromise = null;
const componentDir = new URL('./components/', import.meta.url);
const registryUrl = new URL('./components/registry.json', import.meta.url);

/**
 * Dev-only Tailwind compiler for the template-editor experiment.
 *
 * Pasted templates can contain utility classes that are absent from Vite's
 * normal source scan. This endpoint compiles just the classes found in the
 * current experiment draft and returns a small stylesheet the editor injects
 * into the preview page.
 */
export default function templateEditorTailwindServer() {
	return {
		name: 'template-editor-tailwind-server',
		apply: 'serve',
		configureServer(server) {
			server.middlewares.use(componentEndpoint, async (request, response) => {
				try {
					if (request.method === 'GET') {
						const components = await readSavedComponents();
						sendJson(response, { components });
						return;
					}

					if (request.method === 'POST') {
						const body = await readRequestBody(request);
						const payload = body ? JSON.parse(body) : {};
						const record = await saveComponent(payload.component);
						sendJson(response, { component: record });
						return;
					}

					response.statusCode = 405;
					response.setHeader('allow', 'GET, POST');
					response.end('Method not allowed');
				} catch (error) {
					response.statusCode = 500;
					response.setHeader('content-type', 'text/plain; charset=utf-8');
					response.end(error instanceof Error ? error.message : 'Template editor component API failed');
				}
			});

			server.middlewares.use(endpoint, async (request, response) => {
				try {
					const body = request.method === 'POST' ? await readRequestBody(request) : '';
					const payload = body ? JSON.parse(body) : {};
					const content = String(payload.content || '');
					const candidates = extractTailwindCandidates(content);
					const cacheKey = candidates.join(' ');

					if (!cssCache.has(cacheKey)) {
						const compiler = await getTailwindCompiler();
						cssCache.set(cacheKey, compiler.build(candidates));
					}

					response.statusCode = 200;
					response.setHeader('content-type', 'text/css; charset=utf-8');
					response.end(cssCache.get(cacheKey));
				} catch (error) {
					response.statusCode = 500;
					response.setHeader('content-type', 'text/plain; charset=utf-8');
					response.end(error instanceof Error ? error.message : 'Tailwind compile failed');
				}
			});
		},
	};
}

async function readSavedComponents() {
	await mkdir(componentDir, { recursive: true });
	const registry = await readRegistry();
	const files = await readdir(componentDir).catch(() => []);
	const vueFiles = files.filter((file) => file.endsWith('.vue'));

	return Promise.all(vueFiles.map(async (file) => {
		const name = file.replace(/\.vue$/, '');
		const source = await readFile(new URL(file, componentDir), 'utf8');
		return {
			name,
			file: `src/pages/experiments/template-editor/components/${file}`,
			role: registry[name]?.role || 'component',
			editable: true,
			insertable: registry[name]?.insertable ?? registry[name]?.role !== 'page',
			props: registry[name]?.props || [],
			custom: true,
			source,
		};
	}));
}

async function saveComponent(component) {
	if (!component || typeof component !== 'object') throw new Error('Expected component record.');
	const name = safeComponentName(component.name);
	const source = String(component.source || '').trim();
	if (!source) throw new Error('Expected component source.');

	await mkdir(componentDir, { recursive: true });
	await writeFile(new URL(`${name}.vue`, componentDir), `${source}\n`, 'utf8');

	const registry = await readRegistry();
	registry[name] = {
		role: component.role === 'page' ? 'page' : 'component',
		insertable: Boolean(component.insertable),
		props: Array.isArray(component.props) ? component.props : [],
	};
	await writeFile(registryUrl, `${JSON.stringify(registry, null, '\t')}\n`, 'utf8');

	return {
		...component,
		name,
		file: `src/pages/experiments/template-editor/components/${name}.vue`,
		source,
		custom: true,
		editable: true,
	};
}

async function readRegistry() {
	try {
		return JSON.parse(await readFile(registryUrl, 'utf8'));
	} catch {
		return {};
	}
}

function safeComponentName(value) {
	const name = String(value || '').trim();
	if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
		throw new Error('Component names must be PascalCase letters and numbers.');
	}
	return name;
}

function sendJson(response, payload) {
	response.statusCode = 200;
	response.setHeader('content-type', 'application/json; charset=utf-8');
	response.end(JSON.stringify(payload));
}

async function getTailwindCompiler() {
	if (!compilerPromise) {
		const theme = await readFile(new URL('../../../../node_modules/tailwindcss/theme.css', import.meta.url), 'utf8');
		compilerPromise = compile(`${theme}\n@tailwind utilities;`);
	}
	return compilerPromise;
}

function extractTailwindCandidates(content) {
	const candidates = new Set();
	const attrPattern = /(?:^|\s)(?::?class|className)\s*=\s*(["'`])([\s\S]*?)\1/g;
	let match;

	while ((match = attrPattern.exec(content))) {
		for (const token of match[2].split(/\s+/)) {
			const candidate = cleanCandidate(token);
			if (candidate) candidates.add(candidate);
		}
	}

	return [...candidates].sort();
}

function cleanCandidate(token) {
	return token
		.trim()
		.replace(/^['"`{]+/, '')
		.replace(/['"`},;]+$/, '');
}

function readRequestBody(request) {
	return new Promise((resolve, reject) => {
		let body = '';
		request.setEncoding('utf8');
		request.on('data', (chunk) => {
			body += chunk;
			if (body.length > maxBodyBytes) {
				reject(new Error('Template editor Tailwind payload is too large.'));
				request.destroy();
			}
		});
		request.on('end', () => resolve(body));
		request.on('error', reject);
	});
}
