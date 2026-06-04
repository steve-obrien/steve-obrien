import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { compile } from 'tailwindcss';

const endpoint = '/experiments/template-editor/tailwind.css';
const componentEndpoint = '/experiments/template-editor/components';
const fileEndpoint = '/experiments/template-editor/files';
const maxBodyBytes = 512 * 1024;
const cssCache = new Map();
let compilerPromise = null;
const componentDir = new URL('./components/', import.meta.url);
const componentFilePrefix = 'src/pages/experiments/template-editor/components/';
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
			server.middlewares.use(fileEndpoint, async (request, response) => {
				try {
					if (request.method !== 'GET') {
						response.statusCode = 405;
						response.setHeader('allow', 'GET');
						response.end('Method not allowed');
						return;
					}

					const url = requestUrl(request);
					const path = url.searchParams.get('path');

					if (path) {
						const file = await readTemplateFile(path);
						sendJson(response, { file });
						return;
					}

					const tree = await readTemplateFileTree();
					sendJson(response, { tree });
				} catch (error) {
					response.statusCode = 500;
					response.setHeader('content-type', 'text/plain; charset=utf-8');
					response.end(error instanceof Error ? error.message : 'Template editor file API failed');
				}
			});

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
	const vueFiles = await readVueFilePaths();

	return Promise.all(vueFiles.map(async (path) => {
		const name = componentNameFromPath(path);
		const source = await readFile(fileUrlForRelative(path), 'utf8');
		return {
			name,
			file: `${componentFilePrefix}${path}`,
			role: registry[name]?.role || 'component',
			editable: true,
			insertable: registry[name]?.insertable ?? (!isEditorInternalComponent(name) && registry[name]?.role !== 'page'),
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
	const path = componentRelativePath(component, name);

	await mkdir(parentDirForRelative(path), { recursive: true });
	await writeFile(fileUrlForRelative(path), `${source}\n`, 'utf8');

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
		file: `${componentFilePrefix}${path}`,
		source,
		custom: true,
		editable: true,
	};
}

async function readTemplateFileTree() {
	await mkdir(componentDir, { recursive: true });

	return {
		id: 'dir:',
		value: 'dir:',
		label: 'components',
		kind: 'directory',
		open: true,
		children: await readTemplateFileTreeChildren(componentDir, ''),
	};
}

async function readTemplateFileTreeChildren(dirUrl, prefix) {
	const entries = await readdir(dirUrl, { withFileTypes: true }).catch(() => []);
	const items = [];

	for (const entry of entries.sort((a, b) => {
		if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
		return a.name.localeCompare(b.name);
	})) {
		if (entry.name.startsWith('.')) continue;
		const path = `${prefix}${entry.name}`;

		if (entry.isDirectory()) {
			const children = await readTemplateFileTreeChildren(new URL(`${entry.name}/`, dirUrl), `${path}/`);
			if (!children.length) continue;
			items.push({
				id: `dir:${path}`,
				value: `dir:${path}`,
				label: entry.name,
				kind: 'directory',
				children,
			});
			continue;
		}

		if (!entry.isFile() || !entry.name.endsWith('.vue')) continue;
		items.push({
			id: `file:${path}`,
			value: `file:${path}`,
			label: entry.name,
			kind: 'file',
			path,
		});
	}

	return items;
}

async function readTemplateFile(path) {
	const safePath = safeRelativePath(path);
	if (!safePath.endsWith('.vue')) throw new Error('Only Vue component files can be opened.');

	const name = componentNameFromPath(safePath);
	const registry = await readRegistry();
	const source = await readFile(fileUrlForRelative(safePath), 'utf8');

	return {
		name,
		path: safePath,
		file: `${componentFilePrefix}${safePath}`,
		role: registry[name]?.role || 'component',
		editable: true,
		insertable: registry[name]?.insertable ?? (!isEditorInternalComponent(name) && registry[name]?.role !== 'page'),
		props: registry[name]?.props || [],
		custom: true,
		source,
	};
}

async function readVueFilePaths(dirUrl = componentDir, prefix = '') {
	const entries = await readdir(dirUrl, { withFileTypes: true }).catch(() => []);
	const paths = [];

	for (const entry of entries) {
		if (entry.name.startsWith('.')) continue;
		const path = `${prefix}${entry.name}`;

		if (entry.isDirectory()) {
			paths.push(...await readVueFilePaths(new URL(`${entry.name}/`, dirUrl), `${path}/`));
			continue;
		}

		if (entry.isFile() && entry.name.endsWith('.vue')) paths.push(path);
	}

	return paths.sort();
}

async function readRegistry() {
	try {
		return JSON.parse(await readFile(registryUrl, 'utf8'));
	} catch {
		return {};
	}
}

function requestUrl(request) {
	return new URL(request.url || '/', 'http://template-editor.local');
}

function safeComponentName(value) {
	const name = String(value || '').trim();
	if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
		throw new Error('Component names must be PascalCase letters and numbers.');
	}
	return name;
}

function componentNameFromPath(path) {
	const basename = String(path || '')
		.split('/')
		.pop()
		?.replace(/\.vue$/, '') || '';
	const normalized = basename
		.replace(/(^|[-_\s]+)([A-Za-z0-9])/g, (_, __, letter) => letter.toUpperCase())
		.replace(/[^A-Za-z0-9]/g, '');

	return safeComponentName(normalized || basename);
}

function componentRelativePath(component, name) {
	const file = typeof component.file === 'string' ? component.file : '';
	if (file.startsWith(componentFilePrefix)) return safeRelativePath(file.slice(componentFilePrefix.length));
	return `${name}.vue`;
}

function isEditorInternalComponent(name) {
	return ['StageViewport', 'TemplateFileBrowser', 'TemplateMonacoEditor'].includes(name);
}

function parentDirForRelative(path) {
	const parts = safeRelativePath(path).split('/');
	parts.pop();
	return parts.length ? new URL(`${parts.join('/')}/`, componentDir) : componentDir;
}

function fileUrlForRelative(path) {
	return new URL(safeRelativePath(path), componentDir);
}

function safeRelativePath(value) {
	const path = String(value || '').replaceAll('\\', '/').replace(/^\/+/, '');
	const parts = path.split('/').filter(Boolean);

	if (!parts.length || parts.some((part) => part === '..' || part === '.')) {
		throw new Error('Invalid template editor file path.');
	}

	return parts.join('/');
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
