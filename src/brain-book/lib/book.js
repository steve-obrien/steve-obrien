import yaml from 'js-yaml'
import { shallowReactive } from 'vue'
import bookSource from '../../../brain-book/book.yml?raw'

export { renderMarkdown } from './markdown.js'

const markdownSources = import.meta.glob('../../../brain-book/chapters/**/*.md', {
	eager: true,
	query: '?raw',
	import: 'default',
})

const statusOrder = ['seed', 'outline', 'draft', 'review', 'complete']

/**
 * Converts an imported Markdown path into the chapter slug stored in book.yml.
 *
 * @param {string} path The Vite import path for a Markdown file.
 * @returns {string} The chapter slug without its file extension.
 */
function slugFromPath(path) {
	return path.split('/').at(-1).replace(/\.md$/, '')
}

/**
 * Builds a slug-to-Markdown lookup from Vite's eager file imports.
 *
 * @returns {Record<string, string>} Markdown source keyed by chapter slug.
 */
function buildMarkdownLookup() {
	return Object.fromEntries(
		Object.entries(markdownSources).map(([path, source]) => [slugFromPath(path), source]),
	)
}

const markdownBySlug = buildMarkdownLookup()
const parsedBook = yaml.load(bookSource)

/**
 * Validates and enriches the YAML book definition for use by the interface.
 *
 * @param {Record<string, any>} source Parsed book configuration.
 * @returns {Record<string, any>} Normalized book data with flattened navigation.
 * @throws {Error} When the contents file references invalid statuses or missing Markdown.
 */
function prepareBook(source) {
	const chapters = source.parts.flatMap((part, partIndex) =>
		part.chapters.map((chapter, chapterIndex) => ({
			...chapter,
			partTitle: part.title,
			partNumber: part.number,
			partIndex,
			chapterIndex,
			markdown: markdownBySlug[chapter.slug],
		})),
	)

	for (const chapter of chapters) {
		if (!statusOrder.includes(chapter.status)) {
			throw new Error(`Unknown status "${chapter.status}" for ${chapter.slug}`)
		}

		if (chapter.markdown === undefined) {
			throw new Error(`Missing Markdown file for ${chapter.slug}`)
		}
	}

	return {
		...source,
		chapters,
	}
}

// Retain the same reactive object through file saves so Vite can refresh source
// data without reloading the page, losing editor focus, or clearing undo history.
export const book = import.meta.hot?.data.book ?? shallowReactive({})
Object.assign(book, prepareBook(parsedBook))

if (import.meta.hot) {
	import.meta.hot.data.book = book
	import.meta.hot.accept()
}

/**
 * Returns a chapter and its position in the complete reading order.
 *
 * @param {string} slug The chapter slug from the current route.
 * @returns {{ chapter: Record<string, any>, index: number } | null} The matching chapter record.
 */
export function findChapter(slug) {
	const index = book.chapters.findIndex((chapter) => chapter.slug === slug)

	if (index === -1) {
		return null
	}

	return {
		chapter: book.chapters[index],
		index,
	}
}

/**
 * Separates reader-facing Markdown from private author guidance in a chapter file.
 * Legacy seed-note and question sections are recognized until the chapter is next saved.
 *
 * @param {string} source The complete canonical Markdown source.
 * @returns {{ content: string, guide: string }} The manuscript and guide fields.
 */
export function splitChapterMarkdown(source) {
	const explicitGuide = source.match(/<!-- book-guide\n([\s\S]*?)\n-->\s*/)

	if (explicitGuide) {
		return {
			content: source.replace(explicitGuide[0], '').trim(),
			guide: explicitGuide[1].trim(),
		}
	}

	if (source.startsWith('# Seed notes\n')) {
		return {
			content: '',
			guide: source.replace('# Seed notes\n', '').trim(),
		}
	}

	const questionsHeading = '\n## Questions to develop\n'
	const questionsIndex = source.indexOf(questionsHeading)

	if (questionsIndex !== -1) {
		return {
			content: source.slice(0, questionsIndex).trim(),
			guide: source.slice(questionsIndex + questionsHeading.length).trim(),
		}
	}

	return {
		content: source.trim(),
		guide: '',
	}
}

/**
 * Calculates book-wide chapter totals and completion percentages.
 *
 * @returns {{ total: number, started: number, complete: number, percentComplete: number }} Progress totals.
 */
export function getProgress() {
	const total = book.chapters.length
	const complete = book.chapters.filter((chapter) => chapter.status === 'complete').length
	const started = book.chapters.filter((chapter) => chapter.status !== 'seed').length

	return {
		total,
		started,
		complete,
		percentComplete: total === 0 ? 0 : Math.round((complete / total) * 100),
	}
}

/**
 * Finds the chapters immediately before and after a chapter in reading order.
 *
 * @param {number} index The chapter's zero-based index.
 * @returns {{ previous: Record<string, any> | null, next: Record<string, any> | null }} Adjacent chapters.
 */
export function getAdjacentChapters(index) {
	return {
		previous: book.chapters[index - 1] ?? null,
		next: book.chapters[index + 1] ?? null,
	}
}
