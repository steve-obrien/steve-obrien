<script setup>
import { computed, inject, reactive, ref } from 'vue'
import StatusPill from '../components/StatusPill.vue'
import { book, getProgress } from '../lib/book.js'
import { cloneBookParts, saveBookParts } from '../lib/editor.js'
import bookCover from '../../pages/projects/intelligence-book-mockup.webp'

/** Keeps book-wide progress current after a chapter is saved in the workspace. */
const progress = computed(getProgress)
const { isEditing } = inject('bookEditor')
const draftParts = reactive(cloneBookParts(book.parts))
const isSaving = ref(false)
const saveError = ref('')
const statuses = ['seed', 'outline', 'draft', 'review', 'complete']

/** Saves all visible contents-page edits back to the canonical YAML file. */
async function saveStructure() {
	isSaving.value = true
	saveError.value = ''

	try {
		await saveBookParts(draftParts)
	} catch (error) {
		saveError.value = error.message
	} finally {
		isSaving.value = false
	}
}
</script>

<template>
	<div class="contents-page">
		<section class="book-hero">
			<div class="book-hero-copy">
				<p class="eyebrow">A book in progress · Steve O’Brien</p>
				<h1>Intelligence</h1>
				<p class="book-themes"><span>Human</span><i aria-hidden="true"></i><span>Artificial</span><i aria-hidden="true"></i><span>Future</span></p>
				<p class="book-deck">{{ book.subtitle }}</p>
				<a class="book-contents-cta" href="#contents-title">Explore the chapters <span aria-hidden="true">↗</span></a>
			</div>
			<figure class="book-cover-art">
				<img :src="bookCover" alt="Intelligence by Steve O’Brien — a human brain joined to gold electronic circuitry on a black cover." width="1024" height="1536" fetchpriority="high">
			</figure>
		</section>

		<section class="progress-card" aria-labelledby="progress-title">
			<div class="progress-copy">
				<p id="progress-title" class="eyebrow">Writing progress</p>
				<p><strong>{{ progress.total }}</strong> small chapters</p>
			</div>
			<div class="progress-numbers">
				<div>
					<strong>{{ progress.started }}</strong>
					<span>started</span>
				</div>
				<div>
					<strong>{{ progress.complete }}</strong>
					<span>complete</span>
				</div>
				<div>
					<strong>{{ progress.percentComplete }}%</strong>
					<span>of chapters</span>
				</div>
			</div>
			<div class="progress-track" aria-hidden="true">
				<span :style="{ width: `${progress.percentComplete}%` }"></span>
			</div>
		</section>

		<section class="contents-list" aria-labelledby="contents-title">
			<div class="section-heading">
				<p class="eyebrow">The shape of the book</p>
				<h2 id="contents-title">Contents</h2>
				<p v-if="!isEditing">Choose <strong>Edit book</strong> above to reshape headings and chapter text here.</p>
				<p v-else>Your changes are saved directly into <code>brain-book/book.yml</code>.</p>
			</div>

			<div v-if="isEditing" class="editor-notice">
				<div>
					<strong>Editing the book structure</strong>
					<span>Titles are book content. Questions, descriptions, targets, and statuses are private guide material.</span>
				</div>
				<button type="button" :disabled="isSaving" @click="saveStructure">
					{{ isSaving ? 'Saving…' : 'Save headings' }}
				</button>
				<p v-if="saveError" class="save-error">{{ saveError }}</p>
			</div>

			<section v-for="part in (isEditing ? draftParts : book.parts)" :key="part.number" class="book-part">
				<div class="part-heading">
					<span>{{ part.number === 0 ? 'Opening' : `Part ${part.number}` }}</span>
					<template v-if="isEditing">
						<label class="editor-field editor-title-field">
							<span>Book heading</span>
							<input v-model="part.title" type="text">
						</label>
						<label class="editor-field">
							<span>Guide · part intention</span>
							<textarea v-model="part.description" rows="3"></textarea>
						</label>
					</template>
					<template v-else>
						<h3>{{ part.title }}</h3>
						<p><span class="guide-chip">Guide</span>{{ part.description }}</p>
					</template>
				</div>

				<ol class="chapter-list">
					<li v-for="chapter in part.chapters" :key="chapter.slug">
						<div v-if="isEditing" class="chapter-edit-card">
							<span class="chapter-number">{{ chapter.number }}</span>
							<div class="chapter-edit-fields">
								<label class="editor-field editor-title-field">
									<span>Book heading</span>
									<input v-model="chapter.title" type="text">
								</label>
								<label class="editor-field">
									<span>Guide · chapter question</span>
									<textarea v-model="chapter.question" rows="2"></textarea>
								</label>
								<div class="chapter-edit-meta">
									<label class="editor-field">
										<span>Status</span>
										<select v-model="chapter.status">
											<option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
										</select>
									</label>
									<label class="editor-field">
										<span>Word target</span>
										<input v-model.number="chapter.wordTarget" type="number" min="100" step="100">
									</label>
									<RouterLink class="edit-text-link" :to="`/brain-book/${chapter.slug}`">Edit chapter text →</RouterLink>
								</div>
							</div>
						</div>
						<RouterLink v-else :to="`/brain-book/${chapter.slug}`" class="chapter-link">
							<span class="chapter-number">{{ chapter.number }}</span>
							<span class="chapter-copy">
								<strong>{{ chapter.title }}</strong>
								<small><span class="guide-chip">Guide</span>{{ chapter.question }}</small>
							</span>
							<StatusPill :status="chapter.status" />
							<span class="chapter-arrow" aria-hidden="true">→</span>
						</RouterLink>
					</li>
				</ol>
			</section>
		</section>

		<aside class="status-key" aria-label="Chapter status key">
			<span>Status moves from</span>
			<StatusPill status="seed" />
			<span>→</span>
			<StatusPill status="outline" />
			<span>→</span>
			<StatusPill status="draft" />
			<span>→</span>
			<StatusPill status="review" />
			<span>→</span>
			<StatusPill status="complete" />
		</aside>
	</div>
</template>
