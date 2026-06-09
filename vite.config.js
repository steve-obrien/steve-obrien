import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

function themeAiServer() {
	let apiKey = '';
	let model = 'gpt-4.1-mini';
	let publicToken = '';

	return {
		name: 'theme-ai-server',
		configResolved(config) {
			const env = loadEnv(config.mode, config.root, '');
			apiKey = env.OPENAI_API_KEY || env.OPEN_AI_API_KEY || env.OPEN_AI_API || env.OPEN_AI_KEY || '';
			model = env.OPENAI_THEME_MODEL || model;
			publicToken = env.THEME_AI_PUBLIC_TOKEN || '';
		},
		configureServer(server) {
			server.middlewares.use('/api/theme-tokens', async (request, response, next) => {
				if (request.method !== 'POST') {
					next();
					return;
				}

				try {
					if (!apiKey) {
						sendJson(response, 500, { error: 'OPENAI_API_KEY is not available to the local dev server.' });
						return;
					}

					const body = await readJsonBody(request);
					if (publicToken && request.headers.authorization !== `Bearer ${publicToken}`) {
						sendJson(response, 401, { error: 'Unauthorized.' });
						return;
					}
					const theme = await requestThemeFromOpenAi({
						apiKey,
						model,
						prompt: body.prompt || '',
						tokens: body.tokens || {},
					});
					sendJson(response, 200, theme);
				} catch (error) {
					sendJson(response, 500, { error: error.message || 'Theme generation failed.' });
				}
			});
		},
	};
}

async function requestThemeFromOpenAi({ apiKey, model, prompt, tokens }) {
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

function readJsonBody(request) {
	return new Promise((resolve, reject) => {
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
				resolve(body ? JSON.parse(body) : {});
			} catch {
				reject(new Error('Request body must be valid JSON.'));
			}
		});
		request.on('error', reject);
	});
}

function sendJson(response, status, body) {
	response.statusCode = status;
	response.setHeader('Content-Type', 'application/json');
	response.end(JSON.stringify(body));
}

export default defineConfig({
	plugins: [
		themeAiServer(),
		vue({
			template: {
				compilerOptions: {
					isCustomElement: (tag) => tag.startsWith('element-'),
				},
			},
		}),
		tailwindcss(),
	],
	base: '/',
	server: {
		host: true,
		// https: true,
	}
});
