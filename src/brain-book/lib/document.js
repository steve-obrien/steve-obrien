import { renderMarkdown } from './markdown.js'

/**
 * Creates an editor-only title node while retaining DOM Studio's block tools.
 * The schema keeps the title separate from the manuscript when saving.
 *
 * @param {{ modules: Record<string, any>, extensions: Array<any> }} context DOM Studio extension context.
 * @returns {Array<any>} Extensions for a chapter document with a required title.
 */
export function chapterDocumentExtensions({ modules, extensions }) {
	return [
		...extensions.map((extension) => extension.name === 'starterKit'
			? extension.configure({ document: false })
			: extension),
		modules.Node.create({ name: 'doc', topNode: true, content: 'chapterTitle block+' }),
		modules.Node.create({
			name: 'chapterTitle',
			content: 'text*',
			marks: '',
			defining: true,
			isolating: true,
			/** Identifies only the workspace title, leaving manuscript headings intact. */
			parseHTML() { return [{ tag: 'h1[data-chapter-title]' }] },
			/** Renders the editable title as a normal heading on the document page. */
			renderHTML() { return ['h1', { 'data-chapter-title': '', 'aria-label': 'Chapter title' }, 0] },
			/** Moves from the protected title into a new manuscript paragraph on Enter. */
			addKeyboardShortcuts() {
				return {
					/** Splits title text at the caret without allowing body text to merge into it. */
					Enter: () => {
						if (this.editor.state.selection.$from.parent.type !== this.type) return false
						return this.editor.chain().command(({ tr, commands }) => {
							tr.deleteSelection()
							const { $from } = tr.selection
							const remainder = $from.parent.content.cut($from.parentOffset)
							tr.delete($from.pos, $from.end())
							const nextBlock = tr.selection.$from.after()
							tr.insert(nextBlock, this.editor.schema.nodes.paragraph.create(null, remainder))
							return commands.setTextSelection(nextBlock + 1)
						}).scrollIntoView().run()
					},
				}
			},
		}),
	]
}

/**
 * Escapes a plain-text chapter title before including it in the rich document.
 *
 * @param {string} title Chapter metadata title.
 * @param {string} source Manuscript Markdown, excluding private guide notes.
 * @returns {string} Rich editor HTML containing the title and manuscript.
 */
export function chapterDocumentHtml(title, source) {
	const escapedTitle = title.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
	return `<h1 data-chapter-title>${escapedTitle}</h1>${renderMarkdown(source) || '<p></p>'}`
}

/**
 * Separates the editor-only title from the manuscript without regex-parsing HTML.
 *
 * @param {string} html HTML emitted by the chapter editor.
 * @returns {{ title: string, body: string }} Plain title and manuscript HTML.
 */
export function splitChapterDocument(html) {
	const document = new DOMParser().parseFromString(html, 'text/html')
	const heading = document.body.firstElementChild
	if (!heading?.hasAttribute('data-chapter-title')) throw new Error('The chapter title is missing from the document.')
	const title = heading.textContent
	heading.remove()
	return { title, body: document.body.innerHTML }
}

/**
 * Counts reader-facing words without Markdown syntax, URLs or private notes.
 * Block boundaries prevent adjacent table cells and paragraphs becoming one word.
 *
 * @param {string} source Reader-facing manuscript Markdown.
 * @returns {number} Live manuscript word count, excluding the title.
 */
export function manuscriptWordCount(source) {
	const html = renderMarkdown(source).replace(/<\/(?:p|h[1-6]|li|td|th|tr|div|pre|blockquote)>|<br\s*\/?\s*>/gi, '$& ')
	const document = new DOMParser().parseFromString(html, 'text/html')
	for (const node of document.querySelectorAll('script, style, template')) node.remove()
	return [...new Intl.Segmenter('en', { granularity: 'word' }).segment(document.body.textContent)]
		.filter((segment) => segment.isWordLike).length
}
