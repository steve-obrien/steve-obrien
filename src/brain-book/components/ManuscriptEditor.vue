<script setup>
import { ref, watch } from 'vue'
import { DomDocumentEditor, DomTextareaInput } from '@getdom/studio/vue'
import { manuscriptMarkdown } from '../lib/markdown.js'
import { chapterDocumentExtensions, chapterDocumentHtml, splitChapterDocument } from '../lib/document.js'
import '../editor.css'

const props = defineProps({
	modelValue: { type: String, default: '' },
	title: { type: String, default: '' },
	mode: { type: String, default: 'rich' },
	disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'update:title', 'update:mode'])
const runtimeError = ref('')
const htmlDraft = ref(chapterDocumentHtml(props.title, props.modelValue))
let currentSource = props.modelValue
let currentTitle = props.title
let lastEditorHtml = ''
let lastBodyHtml = ''
const tools = [
	'undo', 'redo', 'paragraph', 'heading2', 'heading3',
	'bold', 'italic', 'underline', 'bulletList', 'orderedList',
	'blockquote', 'codeBlock', 'link', 'table', 'image',
]

/**
 * Applies source changes without feeding each editor transaction back into
 * Tiptap, which would reset the selection and undo history.
 *
 * @param {[string, string]} values Latest manuscript and title.
 * @returns {void}
 */
function syncSource([source, title]) {
	if (source === currentSource && title === currentTitle) return
	currentSource = source
	currentTitle = title
	htmlDraft.value = chapterDocumentHtml(title, source)
}

/**
 * Stores a user formatting or typing transaction as Markdown.
 *
 * @param {string} html Current rich document HTML.
 * @returns {void}
 */
function updateDocument(html) {
	if (html === lastEditorHtml) return
	lastEditorHtml = html
	htmlDraft.value = html
	const { title, body } = splitChapterDocument(html)
	if (body !== lastBodyHtml) {
		lastBodyHtml = body
		currentSource = manuscriptMarkdown(body)
		emit('update:modelValue', currentSource)
	}
	if (title !== currentTitle) {
		currentTitle = title
		emit('update:title', title)
	}
}

/**
 * Records the editor's normalized initial HTML before its first model event.
 * This prevents merely opening a chapter from rewriting its Markdown source.
 *
 * @param {{ editor: { getHTML: () => string } }} payload Ready editor instance.
 * @returns {void}
 */
function handleReady({ editor }) {
	lastEditorHtml = editor.getHTML()
	lastBodyHtml = splitChapterDocument(lastEditorHtml).body
}

/**
 * Keeps the source editor available if the rich editor cannot initialize.
 *
 * @returns {void}
 */
function handleRuntimeError() {
	runtimeError.value = 'The rich-text editor could not load. You can still edit and save the Markdown below.'
	emit('update:mode', 'source')
}

watch(() => [props.modelValue, props.title], syncSource)
</script>

<template>
	<div class="book-rich-editor">
		<DomDocumentEditor
			v-if="mode === 'rich'"
			:model-value="htmlDraft"
			output="html"
			chrome="none"
			title="Chapter manuscript"
			placeholder="Write the chapter here…"
			min-height="36rem"
			:tools="tools"
			:configure-extensions="chapterDocumentExtensions"
			:editable="!disabled"
			:show-suggestion-rail="false"
			@ready="handleReady"
			@update:model-value="updateDocument"
			@runtime-error="handleRuntimeError"
		>
			<template #toolbar-start><slot name="navigation" /></template>
			<template #toolbar-end><slot name="actions" /></template>
		</DomDocumentEditor>
		<template v-else>
			<div class="source-toolbar" role="toolbar" aria-label="Document editor toolbar">
				<slot name="navigation" />
				<span class="source-mode-label">Markdown</span>
				<slot name="actions" />
			</div>
			<div class="source-document">
				<p v-if="runtimeError" class="save-error" role="alert">{{ runtimeError }}</p>
				<label class="source-title">
					<span class="sr-only">Chapter title</span>
					<DomTextareaInput :model-value="title" :disabled="disabled" :rows="1" autosize chrome="none" placeholder="Chapter title" @update:model-value="emit('update:title', $event)" />
				</label>
				<textarea
					class="manuscript-source"
					:value="modelValue"
					:disabled="disabled"
					aria-label="Book content · Markdown"
					rows="24"
					placeholder="Write the chapter here…"
					@input="emit('update:modelValue', $event.target.value)"
				></textarea>
			</div>
		</template>
	</div>
</template>
