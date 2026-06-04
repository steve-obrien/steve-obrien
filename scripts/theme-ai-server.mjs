import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const tokenNames = [
	'--background',
	'--foreground',
	'--card',
	'--card-foreground',
	'--popover',
	'--popover-foreground',
	'--primary',
	'--primary-foreground',
	'--secondary',
	'--secondary-foreground',
	'--muted',
	'--muted-foreground',
	'--accent',
	'--accent-foreground',
	'--destructive',
	'--destructive-foreground',
	'--success',
	'--success-foreground',
	'--warning',
	'--warning-foreground',
	'--border',
	'--input',
	'--ring',
];

const appearanceTokenNames = [
	'--radius',
	'--shadow-color',
	'--shadow-strength',
	'--shadow-distance',
	'--shadow-softness',
];

await loadEnvFile('.env');
await loadEnvFile('.env.local');

const port = Number(process.env.PORT || 8787);
const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_API_KEY || process.env.OPEN_AI_API || process.env.OPEN_AI_KEY || '';
const model = process.env.OPENAI_THEME_MODEL || 'gpt-4.1-mini';
const allowedOrigins = parseList(process.env.THEME_AI_ALLOWED_ORIGINS || 'http://localhost:5174,http://localhost:5175,https://steve-obrien.com');
const publicToken = process.env.THEME_AI_PUBLIC_TOKEN || '';

if (!apiKey) {
	console.error('OPENAI_API_KEY is required. Add it to .env on the server.');
	process.exit(1);
}

createServer(async (request, response) => {
	const origin = request.headers.origin || '';

	if (request.url === '/health') {
		sendJson(response, 200, { ok: true }, origin);
		return;
	}

	if (request.url !== '/api/theme-tokens') {
		sendJson(response, 404, { error: 'Not found.' }, origin);
		return;
	}

	if (!isOriginAllowed(origin)) {
		sendJson(response, 403, { error: 'Origin is not allowed.' }, origin);
		return;
	}

	if (request.method === 'OPTIONS') {
		sendJson(response, 204, null, origin);
		return;
	}

	if (request.method !== 'POST') {
		sendJson(response, 405, { error: 'Method not allowed.' }, origin);
		return;
	}

	if (publicToken && request.headers.authorization !== `Bearer ${publicToken}`) {
		sendJson(response, 401, { error: 'Unauthorized.' }, origin);
		return;
	}

	try {
		const body = await readJsonBody(request);
		const theme = await requestThemeFromOpenAi({
			prompt: body.prompt || '',
			tokens: body.tokens || {},
		});
		sendJson(response, 200, theme, origin);
	} catch (error) {
		sendJson(response, 500, { error: error.message || 'Theme generation failed.' }, origin);
	}
}).listen(port, () => {
	console.log(`Theme AI server listening on http://0.0.0.0:${port}`);
});

async function requestThemeFromOpenAi({ prompt, tokens }) {
	const result = await fetch('https://api.openai.com/v1/responses', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			model,
			instructions: 'Generate accessible CSS theme tokens for a component library. Return only the requested structured JSON. Colour tokens must be hex. Appearance tokens should keep the UI usable: radius in rem, shadow strength in percent, and shadow distance/softness as unitless multipliers.',
			input: `Theme direction: ${prompt || 'surprise me with a polished, production-ready theme'}\n\nCurrent tokens:\n${JSON.stringify(tokens, null, 2)}`,
			text: {
				format: {
					type: 'json_schema',
					name: 'elements_theme_tokens',
					schema: themeResponseSchema(),
				},
			},
			max_output_tokens: 2200,
		}),
	});

	const data = await result.json();
	if (!result.ok) throw new Error(data.error?.message || 'OpenAI request failed.');

	return JSON.parse(extractResponseText(data));
}

function themeResponseSchema() {
	const tokenProperties = Object.fromEntries(tokenNames.map((name) => [name, {
		type: 'string',
		pattern: '^#[0-9a-fA-F]{6}$',
	}]));
	const appearanceProperties = {
		'--radius': {
			type: 'string',
			pattern: '^(0|0?\\.\\d+|1(\\.\\d+)?)rem$',
		},
		'--shadow-color': {
			type: 'string',
			pattern: '^#[0-9a-fA-F]{6}$',
		},
		'--shadow-strength': {
			type: 'string',
			pattern: '^([0-9]|1[0-9]|2[0-8])%$',
		},
		'--shadow-distance': {
			type: 'string',
			pattern: '^(0|0?\\.\\d+|1(\\.\\d+)?|2(\\.0+)?)$',
		},
		'--shadow-softness': {
			type: 'string',
			pattern: '^(0\\.2[5-9]|0\\.[3-9]\\d*|1(\\.\\d+)?|2(\\.0+)?)$',
		},
	};

	return {
		type: 'object',
		additionalProperties: false,
		required: ['name', 'appearance', 'light', 'dark'],
		properties: {
			name: { type: 'string' },
			appearance: {
				type: 'object',
				additionalProperties: false,
				required: appearanceTokenNames,
				properties: appearanceProperties,
			},
			light: {
				type: 'object',
				additionalProperties: false,
				required: tokenNames,
				properties: tokenProperties,
			},
			dark: {
				type: 'object',
				additionalProperties: false,
				required: tokenNames,
				properties: tokenProperties,
			},
		},
	};
}

function extractResponseText(data) {
	if (data.output_text) return data.output_text;
	const text = data.output
		?.flatMap((item) => item.content || [])
		.find((content) => content.type === 'output_text' || content.type === 'text')
		?.text;
	if (!text) throw new Error('OpenAI response did not include text output.');
	return text;
}

async function readJsonBody(request) {
	return new Promise((resolveBody, reject) => {
		let body = '';
		request.on('data', (chunk) => {
			body += chunk;
			if (body.length > 200000) {
				request.destroy();
				reject(new Error('Request body is too large.'));
			}
		});
		request.on('end', () => {
			try {
				resolveBody(body ? JSON.parse(body) : {});
			} catch {
				reject(new Error('Request body must be valid JSON.'));
			}
		});
		request.on('error', reject);
	});
}

function sendJson(response, status, body, origin = '') {
	response.statusCode = status;
	response.setHeader('Content-Type', 'application/json');
	response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	if (isOriginAllowed(origin)) response.setHeader('Access-Control-Allow-Origin', origin);
	response.end(body == null ? '' : JSON.stringify(body));
}

function isOriginAllowed(origin) {
	if (!origin) return true;
	return allowedOrigins.includes('*') || allowedOrigins.includes(origin);
}

function parseList(value) {
	return value.split(',').map((item) => item.trim()).filter(Boolean);
}

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
