/**
 * Sends an edit to the local authoring endpoint and surfaces a useful error.
 *
 * @param {string} url The development-only endpoint URL.
 * @param {Record<string, any>} payload The content to persist.
 * @returns {Promise<Record<string, any>>} The endpoint response.
 */
async function postEdit(url, payload) {
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	})
	const result = await response.json()

	if (!response.ok) {
		throw new Error(result.error ?? 'The edit could not be saved')
	}

	return result
}

/**
 * Saves the complete ordered list of parts and chapter metadata to book.yml.
 *
 * @param {Array<Record<string, any>>} parts The editable part definitions.
 * @returns {Promise<Record<string, any>>} The save result.
 */
export function saveBookParts(parts) {
	return postEdit('/__brain-book/book', { parts })
}

/**
 * Saves one chapter's manuscript and guide notes to its canonical Markdown file.
 *
 * @param {string} slug The chapter's stable filename slug.
 * @param {string} content The reader-facing Markdown.
 * @param {string} guide The private author guidance.
 * @param {Record<string, any>} details The editable chapter heading and planning metadata.
 * @returns {Promise<Record<string, any>>} The save result.
 */
export function saveChapter(slug, content, guide, details) {
	return postEdit(`/__brain-book/chapter/${slug}`, { content, guide, details })
}

/**
 * Creates clean editable book data without runtime-only Markdown and navigation fields.
 *
 * @param {Array<Record<string, any>>} parts The source part definitions.
 * @returns {Array<Record<string, any>>} A detached editable copy.
 */
export function cloneBookParts(parts) {
	return structuredClone(parts)
}
