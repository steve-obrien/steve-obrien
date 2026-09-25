<script setup>
import { computed, inject, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute } from 'vue-router'
import StatusPill from '../components/StatusPill.vue'
import ManuscriptEditor from '../components/ManuscriptEditor.vue'
import { findChapter, getAdjacentChapters, renderMarkdown, splitChapterMarkdown } from '../lib/book.js'
import { saveChapter } from '../lib/editor.js'
import { manuscriptWordCount } from '../lib/document.js'

const route = useRoute()
const { isEditing, toggleEditing } = inject('bookEditor')
const contentDraft = ref('')
const guideDraft = ref('')
const isSaving = ref(false)
const saveError = ref('')
const savedSnapshot = ref('')
const editorMode = ref('rich')
const detailsDraft = reactive({
	title: '',
	question: '',
	status: 'seed',
	wordTarget: 1200,
})
const statuses = ['seed', 'outline', 'draft', 'review', 'complete']

/** Tracks all editable values so undoing a change also clears the unsaved state. */
const draftSnapshot = computed(() => JSON.stringify({ content: contentDraft.value, guide: guideDraft.value, ...detailsDraft }))
/** Reports whether manuscript, title or private metadata differs from the last save. */
const isDirty = computed(() => draftSnapshot.value !== savedSnapshot.value)
/** Counts only the manuscript; title and private notes are intentionally excluded. */
const wordCount = computed(() => manuscriptWordCount(contentDraft.value))
/** Caps the visual progress bar while retaining the actual count above the target. */
const targetProgress = computed(() => detailsDraft.wordTarget > 0 ? Math.min(100, Math.round(wordCount.value / detailsDraft.wordTarget * 100)) : 0)
/** Gives the toolbar a compact, honest saving status. */
const saveStatus = computed(() => isSaving.value ? 'Saving…' : saveError.value ? 'Save failed' : isDirty.value ? 'Unsaved' : 'Saved')

/** Resolves the current route to its chapter record. */
const match = computed(() => findChapter(route.params.slug))

/** Separates the current canonical chapter file into manuscript and author guidance. */
const chapterFields = computed(() => match.value
	? splitChapterMarkdown(match.value.chapter.markdown)
	: { content: '', guide: '' })

/** Renders only the reader-facing portion of the current Markdown source. */
const chapterHtml = computed(() => renderMarkdown(chapterFields.value.content))

/** Resolves the previous and next chapters in the configured reading order. */
const adjacent = computed(() => match.value ? getAdjacentChapters(match.value.index) : { previous: null, next: null })

/** Copies the current source values into the direct-edit fields. */
function resetEditor() {
	if (!match.value) {
		return
	}

	contentDraft.value = chapterFields.value.content
	guideDraft.value = chapterFields.value.guide
	detailsDraft.title = match.value.chapter.title
	detailsDraft.question = match.value.chapter.question
	detailsDraft.status = match.value.chapter.status
	detailsDraft.wordTarget = match.value.chapter.wordTarget
	saveError.value = ''
	savedSnapshot.value = draftSnapshot.value
	editorMode.value = 'rich'
}

/** Persists the chapter heading, planning details, manuscript, and guide notes. */
async function saveCurrentChapter() {
	if (!match.value || isSaving.value) {
		return false
	}

	isSaving.value = true
	saveError.value = ''
	const snapshot = draftSnapshot.value

	try {
		await saveChapter(match.value.chapter.slug, contentDraft.value, guideDraft.value, { ...detailsDraft })
		savedSnapshot.value = snapshot
		return true
	} catch (error) {
		saveError.value = error.message
		return false
	} finally {
		isSaving.value = false
	}
}

watch(() => route.params.slug, resetEditor, { immediate: true })

/** Starts each writing session with the latest canonical chapter data. */
watch(isEditing, (editing) => {
	if (editing) resetEditor()
})

/** Saves pending edits before returning to the chapter's reading view. */
async function finishEditing() {
	if (isSaving.value) return
	if (isDirty.value && !(await saveCurrentChapter())) return
	toggleEditing()
}

/** Supports the familiar Command/Ctrl+S shortcut within the chapter workspace. */
function handleSaveShortcut(event) {
	if (!isEditing.value || !(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 's') return
	event.preventDefault()
	void saveCurrentChapter()
}

/** Protects unsaved local drafts when a browser tab is refreshed or closed. */
function handleBeforeUnload(event) {
	if (!isEditing.value || !isDirty.value) return
	event.preventDefault()
	event.returnValue = ''
}

/** Protects an unsaved draft when navigating to contents or another chapter. */
function confirmNavigation() {
	return !isEditing.value || !isDirty.value || window.confirm('Leave this chapter without saving your changes?')
}

/** Registers shortcuts only while this chapter page is mounted. */
onMounted(() => {
	window.addEventListener('keydown', handleSaveShortcut)
	window.addEventListener('beforeunload', handleBeforeUnload)
})

/** Removes chapter-specific browser listeners on navigation. */
onBeforeUnmount(() => {
	window.removeEventListener('keydown', handleSaveShortcut)
	window.removeEventListener('beforeunload', handleBeforeUnload)
})

onBeforeRouteLeave(confirmNavigation)
onBeforeRouteUpdate(confirmNavigation)
</script>

<template>
	<article v-if="match" class="chapter-page" :class="{ 'is-editing': isEditing }">
		<header v-if="!isEditing" class="chapter-header">
			<RouterLink class="back-link" to="/brain-book">← All chapters</RouterLink>
			<p class="eyebrow">
				{{ match.chapter.partNumber === 0 ? 'Introduction' : `Part ${match.chapter.partNumber} · ${match.chapter.partTitle}` }}
			</p>
			<h1>{{ match.chapter.title }}</h1>
		</header>

		<section v-if="isEditing" class="chapter-editor">
			<div class="chapter-editor-grid">
				<ManuscriptEditor
					:key="match.chapter.slug"
					v-model="contentDraft"
					v-model:title="detailsDraft.title"
					v-model:mode="editorMode"
					:disabled="isSaving"
				>
					<template #navigation>
						<RouterLink class="workspace-back" to="/brain-book" aria-label="All chapters" title="All chapters">←</RouterLink>
					</template>
					<template #actions>
						<div class="workspace-actions">
							<span class="workspace-save-status" role="status" :data-dirty="isDirty">{{ saveStatus }}</span>
							<button class="workspace-save" type="button" :disabled="isSaving" aria-keyshortcuts="Meta+S Control+S" @click="saveCurrentChapter">{{ isSaving ? 'Saving…' : 'Save' }}</button>
							<button class="workspace-done" type="button" :disabled="isSaving" title="Save and return to reading" @click="finishEditing">Done</button>
						</div>
					</template>
				</ManuscriptEditor>
				<aside class="writing-sidebar" aria-label="Chapter details">
					<div class="writing-stats">
						<p class="eyebrow">{{ match.chapter.partNumber === 0 ? 'Introduction' : `Part ${match.chapter.partNumber} · Chapter ${match.chapter.number}` }}</p>
						<h2>Chapter details</h2>
						<p class="writing-word-count"><strong>{{ wordCount.toLocaleString() }}</strong> <span>words</span></p>
						<progress :value="wordCount" :max="Math.max(detailsDraft.wordTarget, wordCount, 1)" aria-label="Manuscript word target"></progress>
						<p class="writing-target-copy">{{ targetProgress }}% of {{ detailsDraft.wordTarget.toLocaleString() }} word target</p>
					</div>
					<p v-if="saveError" class="save-error" role="alert">{{ saveError }}</p>
					<div class="chapter-edit-meta">
						<label class="editor-field">
							<span>Status</span>
							<select v-model="detailsDraft.status" :disabled="isSaving">
								<option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
							</select>
						</label>
						<label class="editor-field">
							<span>Word target</span>
							<input v-model.number="detailsDraft.wordTarget" :disabled="isSaving" type="number" min="100" step="100">
						</label>
					</div>
					<div class="writing-guide-heading"><h3>Private guide</h3><p>Notes for you, outside the manuscript.</p></div>
					<label class="editor-field">
						<span>Chapter question</span>
						<textarea v-model="detailsDraft.question" :disabled="isSaving" rows="4"></textarea>
					</label>
					<label class="editor-field">
						<span>Notes and prompts</span>
						<textarea v-model="guideDraft" :disabled="isSaving" rows="7" placeholder="Private prompts, research notes, questions…"></textarea>
					</label>
					<div class="editor-mode-switch" role="group" aria-label="Manuscript editing mode">
						<button type="button" :aria-pressed="editorMode === 'rich'" :disabled="isSaving" @click="editorMode = 'rich'">Rich text</button>
						<button type="button" :aria-pressed="editorMode === 'source'" :disabled="isSaving" @click="editorMode = 'source'">Markdown</button>
					</div>
				</aside>
			</div>
		</section>

		<template v-else>
			<aside class="chapter-guide">
				<div class="guide-panel-label">Chapter guide · not part of the book</div>
				<p class="chapter-question">{{ match.chapter.question }}</p>
				<div class="chapter-meta">
					<StatusPill :status="match.chapter.status" />
					<span>{{ match.chapter.wordTarget.toLocaleString() }} word target</span>
				</div>
				<div v-if="chapterFields.guide" class="guide-notes" v-html="renderMarkdown(chapterFields.guide)"></div>
			</aside>

			<section class="manuscript-section">
				<div class="manuscript-label">
					<strong>Book content</strong>
					<span>This is the manuscript</span>
				</div>
				<div v-if="chapterFields.content" class="chapter-body" v-html="chapterHtml"></div>
				<p v-else class="empty-manuscript">This chapter has not been written yet.</p>
			</section>
		</template>

		<nav v-if="!isEditing" class="chapter-navigation" aria-label="Chapter navigation">
			<RouterLink v-if="adjacent.previous" :to="`/brain-book/${adjacent.previous.slug}`">
				<small>Previous</small>
				<span>← {{ adjacent.previous.title }}</span>
			</RouterLink>
			<span v-else></span>
			<RouterLink v-if="adjacent.next" :to="`/brain-book/${adjacent.next.slug}`" class="next-link">
				<small>Next</small>
				<span>{{ adjacent.next.title }} →</span>
			</RouterLink>
		</nav>
	</article>

	<section v-else class="not-found">
		<p class="eyebrow">Chapter not found</p>
		<h1>This thought wandered off.</h1>
		<RouterLink to="/brain-book">Return to the contents</RouterLink>
	</section>
</template>
