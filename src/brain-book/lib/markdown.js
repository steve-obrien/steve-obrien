import { marked } from 'marked'
import TurndownService from 'turndown'
import { strikethrough } from 'turndown-plugin-gfm'

const converter = new TurndownService({
	headingStyle: 'atx',
	codeBlockStyle: 'fenced',
	bulletListMarker: '-',
	emDelimiter: '*',
})

converter.use(strikethrough)
converter.addRule('bookRichFormatting', {
	filter: ['u', 'table'],
	/**
	 * Keeps formatting that Markdown cannot faithfully represent, including
	 * underlines, merged table cells and paragraphs inside table cells.
	 *
	 * @param {string} content Converted child content, deliberately unused.
	 * @param {HTMLElement} node Original editor element.
	 * @returns {string} Portable HTML embedded in the Markdown manuscript.
	 */
	replacement(content, node) {
		return node.nodeName === 'TABLE' ? `\n\n${node.outerHTML}\n\n` : node.outerHTML
	},
})

/**
 * Renders trusted local manuscript or guide Markdown, including embedded HTML.
 *
 * @param {string} source Canonical Markdown source.
 * @returns {string} HTML suitable for the reader and DOM Studio editor.
 */
export function renderMarkdown(source) {
	return marked.parse(source, { gfm: true, breaks: false })
}

/**
 * Serializes an actual rich-text edit back into the canonical Markdown format.
 * Opening an editor never calls this function, preserving untouched source.
 *
 * @param {string} html HTML emitted by DOM Studio's document editor.
 * @returns {string} Markdown with embedded HTML for richer formatting.
 */
export function manuscriptMarkdown(html) {
	return converter.turndown(html)
}
