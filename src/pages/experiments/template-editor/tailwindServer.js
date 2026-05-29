import { readFile } from 'node:fs/promises';
import { compile } from 'tailwindcss';

const endpoint = '/experiments/template-editor/tailwind.css';
const maxBodyBytes = 512 * 1024;
const cssCache = new Map();
let compilerPromise = null;

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
