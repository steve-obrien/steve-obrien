<script setup>
import { computed, provide, ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { book } from './lib/book.js'
import bookCover from '../pages/projects/intelligence-book-mockup.webp'
import './styles.css'

const editingAvailable = import.meta.env.DEV
const isEditing = ref(false)
const route = useRoute()
/** The chapter editor supplies its own single navigation and formatting bar. */
const isWriting = computed(() => isEditing.value && route.name === 'brain-book-chapter')

/** Toggles the local authoring controls throughout the book interface. */
function toggleEditing() {
	isEditing.value = !isEditing.value
}

provide('bookEditor', {
	isEditing,
	editingAvailable,
	toggleEditing,
})
</script>

<template>
	<div class="brain-book" :class="{ 'is-writing': isWriting }">
		<div class="site-shell">
			<header v-if="!isWriting" class="site-header">
				<RouterLink class="wordmark" to="/brain-book" aria-label="Book contents">
					<img :src="bookCover" alt="" width="32" height="48">
				</RouterLink>
				<RouterLink class="site-title" to="/brain-book">{{ book.shortTitle }}</RouterLink>
				<div class="header-actions">
					<RouterLink class="contents-link" to="/brain-book">Contents</RouterLink>
					<button
						v-if="editingAvailable"
						class="edit-toggle"
						:class="{ active: isEditing }"
						type="button"
						:aria-pressed="isEditing"
						@click="toggleEditing"
					>
						{{ isEditing ? 'Finish editing' : 'Edit book' }}
					</button>
				</div>
			</header>

			<main>
				<RouterView />
			</main>

			<footer v-if="!isWriting" class="site-footer">
				<p>A book in progress, assembled one small chapter at a time.</p>
				<RouterLink to="/">← Back to Steve O’Brien</RouterLink>
			</footer>
		</div>
	</div>
</template>
