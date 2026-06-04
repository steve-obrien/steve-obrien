import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

await loadEnvFile('.env');
await loadEnvFile('.env.local');

const endpoint = process.env.THEME_AI_ENDPOINT || 'http://127.0.0.1:8787/api/theme-tokens';
const publicToken = process.env.THEME_AI_PUBLIC_TOKEN || process.env.VITE_THEME_AI_PUBLIC_TOKEN || '';

const response = await fetch(endpoint, {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		...(publicToken ? { 'Authorization': `Bearer ${publicToken}` } : {}),
	},
	body: JSON.stringify({
		prompt: process.argv.slice(2).join(' ') || 'brand color is yellow and big and bold',
		tokens: {},
	}),
});

const payload = await response.json().catch(() => ({}));

if (!response.ok) {
	console.error(payload.error || `Theme endpoint returned ${response.status}`);
	process.exit(1);
}

const requiredModes = ['light', 'dark'];
const requiredTokens = ['--background', '--foreground', '--primary', '--primary-foreground', '--border', '--ring'];
const requiredAppearanceTokens = ['--radius', '--shadow-color', '--shadow-strength', '--shadow-distance', '--shadow-softness'];
const missing = requiredModes.flatMap((mode) => requiredTokens
	.filter((token) => !payload[mode]?.[token])
	.map((token) => `${mode}.${token}`));
const missingAppearance = requiredAppearanceTokens
	.filter((token) => !payload.appearance?.[token])
	.map((token) => `appearance.${token}`);

if (missing.length || missingAppearance.length) {
	console.error(`Theme endpoint response is missing: ${[...missing, ...missingAppearance].join(', ')}`);
	process.exit(1);
}

console.log(`Theme endpoint OK: ${payload.name || 'unnamed theme'}`);

async function loadEnvFile(path) {
	try {
		const contents = await readFile(resolve(path), 'utf8');
		for (const line of contents.split(/\r?\n/)) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith('#')) continue;
			const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
			if (!match || process.env[match[1]]) continue;
			process.env[match[1]] = unquoteEnvValue(match[2]);
		}
	} catch {
		// Optional env file.
	}
}

function unquoteEnvValue(value) {
	const trimmed = value.trim();
	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"'))
		|| (trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		return trimmed.slice(1, -1);
	}
	return trimmed;
}
