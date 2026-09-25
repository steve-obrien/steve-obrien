import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

/** Rejects generated pages, assets, source maps or sitemap entries for the private local book. */
async function checkDirectory(directory) {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const file = path.join(directory, entry.name);
		if (/brain-book|brainbook/i.test(file)) throw new Error(`Local book was included in the build: ${file}`);
		if (entry.isDirectory()) {
			await checkDirectory(file);
		} else if (/\.(?:html|js|css|json|map|xml|txt|md|ya?ml)$/i.test(file)) {
			const content = await readFile(file, 'utf8');
			if (/brain-book|__brain-book|book-guide|Human Brains, Artificial Brains, Future Brains/.test(content)) {
				throw new Error(`Local book content was included in the build: ${file}`);
			}
		}
	}
}

await checkDirectory(path.resolve('dist'));
console.log('Verified: local book routes, editor and manuscript are absent from the production build.');
