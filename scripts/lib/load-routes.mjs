import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const routesFilePath = path.join(rootDir, 'src', 'routes.js');
const pagesDirPath = path.join(rootDir, 'src', 'pages');

const toPathFromPageFile = (fileName) => {
	const baseName = fileName.replace(/\.vue$/i, '');
	if (baseName === 'AboutPage') {
		return '/';
	}
	const slug = baseName
		.replace(/Page$/i, '')
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.toLowerCase();
	return `/${slug}`;
};

const loadRoutesFromRoutesFile = async () => {
	const routesFile = await readFile(routesFilePath, 'utf8');
	const matches = [...routesFile.matchAll(/path:\s*['"`]([^'"`]+)['"`]/g)];
	return [
		...new Set(
			matches
				.map((match) => match[1]?.trim())
				.filter(Boolean)
				.filter((routePath) => routePath.startsWith('/'))
				.filter((routePath) => !routePath.includes(':') && !routePath.includes('*')),
		),
	];
};

const loadRoutesFromPagesDirectory = async () => {
	const files = await readdir(pagesDirPath);
	const pageFiles = files.filter((file) => file.endsWith('.vue'));
	return [...new Set(pageFiles.map(toPathFromPageFile))];
};

const loadRoutesFromNestedPageVue = async () => {
	const routePaths = [];

	const walk = async (dir, relSegments) => {
		const entries = await readdir(dir, { withFileTypes: true });
		for (const ent of entries) {
			if (ent.name.startsWith('.')) continue;
			const full = path.join(dir, ent.name);
			if (ent.isDirectory()) {
				await walk(full, [...relSegments, ent.name]);
			} else if (ent.name === 'Page.vue' && relSegments.length > 0) {
				const inner = relSegments.join('/');
				routePaths.push(inner === 'index' ? '/' : `/${inner}`);
			}
		}
	};

	await walk(pagesDirPath, []);
	return [...new Set(routePaths)];
};

export const loadStaticRoutes = async () => {
	let fromRoutesFile = [];
	try {
		fromRoutesFile = await loadRoutesFromRoutesFile();
	} catch {
		fromRoutesFile = [];
	}

	if (fromRoutesFile.length === 0) {
		fromRoutesFile = await loadRoutesFromPagesDirectory();
	}

	const fromNestedPages = await loadRoutesFromNestedPageVue();
	return [...new Set([...fromRoutesFile, ...fromNestedPages])];
};
