import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { timingSafeEqual } from 'node:crypto';
import {
	OutrankWebhookError,
	defaultArticleContentDir,
	handleOutrankWebhookPayload,
} from './lib/outrank-webhook.mjs';

await loadEnvFile('.env');
await loadEnvFile('.env.local');

const port = Number(process.env.PORT || process.env.OUTRANK_WEBHOOK_PORT || 8790);
const accessToken = process.env.OUTRANK_WEBHOOK_ACCESS_TOKEN || process.env.OUTRANK_ACCESS_TOKEN || '';
const configuredPath = normalisePath(process.env.OUTRANK_WEBHOOK_PATH || '/api/outrank/webhook');
const webhookPaths = [...new Set([configuredPath, '/webhook'])];
const contentDir = resolve(process.env.OUTRANK_ARTICLE_CONTENT_DIR || defaultArticleContentDir());
const maxBodyBytes = Number(process.env.OUTRANK_WEBHOOK_MAX_BODY_BYTES || 5 * 1024 * 1024);

if (!accessToken) {
	console.error('OUTRANK_WEBHOOK_ACCESS_TOKEN is required. Add it to .env on the webhook server.');
	process.exit(1);
}

createServer(async (request, response) => {
	const url = new URL(request.url || '/', 'http://localhost');

	if (url.pathname === '/health') {
		sendJson(response, 200, { ok: true });
		return;
	}

	if (!webhookPaths.includes(url.pathname)) {
		sendJson(response, 404, { error: 'Not found.' });
		return;
	}

	if (request.method !== 'POST') {
		sendJson(response, 405, { error: 'Method not allowed.' });
		return;
	}

	if (!validateAccessToken(request.headers.authorization || '')) {
		sendJson(response, 401, { error: 'Invalid access token.' });
		return;
	}

	try {
		const payload = await readJsonBody(request, maxBodyBytes);
		const result = await handleOutrankWebhookPayload(payload, { contentDir });
		sendJson(response, 200, {
			message: 'Webhook processed successfully.',
			...result,
		});
	} catch (error) {
		const status = error instanceof OutrankWebhookError ? error.status : 500;
		sendJson(response, status, {
			error: error.message || 'Webhook processing failed.',
		});
	}
}).listen(port, () => {
	console.log(`Outrank webhook server listening on http://0.0.0.0:${port}`);
	console.log(`Webhook paths: ${webhookPaths.join(', ')}`);
	console.log(`Article content directory: ${contentDir}`);
});

function validateAccessToken(authHeader) {
	if (!authHeader.startsWith('Bearer ')) return false;
	const token = authHeader.slice('Bearer '.length).trim();
	return secureEqual(token, accessToken);
}

function secureEqual(left, right) {
	const leftBuffer = Buffer.from(left);
	const rightBuffer = Buffer.from(right);
	if (leftBuffer.length !== rightBuffer.length) return false;
	return timingSafeEqual(leftBuffer, rightBuffer);
}

function readJsonBody(request, limit) {
	return new Promise((resolveBody, reject) => {
		let body = '';
		request.on('data', (chunk) => {
			body += chunk;
			if (Buffer.byteLength(body) > limit) {
				request.destroy();
				reject(new OutrankWebhookError('Request body is too large.', 413));
			}
		});
		request.on('end', () => {
			try {
				resolveBody(body ? JSON.parse(body) : {});
			} catch {
				reject(new OutrankWebhookError('Request body must be valid JSON.'));
			}
		});
		request.on('error', reject);
	});
}

function sendJson(response, status, body) {
	response.statusCode = status;
	response.setHeader('Content-Type', 'application/json');
	response.setHeader('Cache-Control', 'no-store');
	response.end(JSON.stringify(body));
}

function normalisePath(value) {
	const path = String(value || '').trim();
	if (!path) return '/api/outrank/webhook';
	return path.startsWith('/') ? path : `/${path}`;
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
