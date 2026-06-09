import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { handleOutrankWebhookPayload } from './lib/outrank-webhook.mjs';

const contentDir = await mkdtemp(path.join(os.tmpdir(), 'outrank-webhook-'));

try {
	const publishResult = await handleOutrankWebhookPayload({
		event_type: 'publish_articles',
		timestamp: '2026-06-06T10:30:00Z',
		data: {
			articles: [
				{
					id: '123456',
					title: 'How to Implement Webhooks',
					content_markdown: 'Webhooks are a powerful way to publish content.',
					meta_description: 'Learn how to implement webhooks in your application.',
					created_at: '2026-06-01T12:00:00Z',
					image_url: 'https://example.com/images/webhook-article.jpg',
					slug: 'how-to-implement-webhooks',
					tags: ['webhooks', 'integration', 'api'],
				},
			],
		},
	}, { contentDir });

	assert.equal(publishResult.eventType, 'publish_articles');
	assert.equal(publishResult.count, 1);
	assert.equal(publishResult.articles[0].action, 'created');

	const articlePath = path.join(contentDir, 'how-to-implement-webhooks.md');
	let markdown = await readFile(articlePath, 'utf8');

	assert.match(markdown, /title: How to Implement Webhooks/);
	assert.match(markdown, /description: Learn how to implement webhooks in your application\./);
	assert.match(markdown, /date: 2026-06-01/);
	assert.match(markdown, /tags: \["webhooks", "integration", "api"\]/);
	assert.match(markdown, /imageUrl: https:\/\/example\.com\/images\/webhook-article\.jpg/);
	assert.match(markdown, /outrankId: 123456/);
	assert.match(markdown, /Webhooks are a powerful way to publish content\./);

	const updateResult = await handleOutrankWebhookPayload({
		event_type: 'update_article',
		timestamp: '2026-06-06T11:00:00Z',
		data: {
			article: {
				id: '123456',
				title: 'How to Implement Webhooks Updated',
				content_markdown: 'The article body has been updated.',
				meta_description: 'Updated meta description.',
				image_url: 'https://example.com/images/webhook-article-updated.jpg',
				slug: 'how-to-implement-webhooks',
				tags: ['webhooks', 'api'],
			},
		},
	}, { contentDir });

	assert.equal(updateResult.eventType, 'update_article');
	assert.equal(updateResult.count, 1);
	assert.equal(updateResult.articles[0].action, 'updated');

	markdown = await readFile(articlePath, 'utf8');
	assert.match(markdown, /title: How to Implement Webhooks Updated/);
	assert.match(markdown, /date: 2026-06-01/);
	assert.match(markdown, /tags: \["webhooks", "api"\]/);
	assert.match(markdown, /The article body has been updated\./);

	await assert.rejects(
		() => handleOutrankWebhookPayload({ event_type: 'unknown_event' }, { contentDir }),
		/Unsupported Outrank event_type/,
	);

	console.log('Outrank webhook payload handling check passed.');
} finally {
	await rm(contentDir, { recursive: true, force: true });
}
