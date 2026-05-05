<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();
const currentTheme = ref('light');

const toggleTheme = () => {
	const html = document.documentElement;
	const nextTheme = html.dataset.theme === 'dark' ? 'light' : 'dark';
	html.dataset.theme = nextTheme;
	currentTheme.value = nextTheme;
	window.localStorage.setItem('theme', nextTheme);
};

onMounted(() => {
	currentTheme.value = document.documentElement.dataset.theme ?? 'light';
});

const links = [
	{ to: '/', label: 'About' },
	{ to: '/experiments', label: 'Experiments' },
	{ to: '/projects', label: 'Projects' },
	{ to: '/ideas', label: 'Ideas' },
];
</script>

<template>
	<div class="min-h-screen bg-skin-background text-skin-primary transition-colors duration-200">
		<header class="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-8">
			<nav class="flex items-center gap-2 rounded-full border border-skin-border bg-skin-surface p-1">
				<RouterLink
					v-for="link in links"
					:key="link.to"
					:to="link.to"
					class="rounded-full px-4 py-2 text-sm font-medium transition-colors"
					:class="route.path === link.to ? 'bg-skin-primary text-skin-inverse' : 'text-skin-secondary hover:text-skin-primary'"
				>
					{{ link.label }}
				</RouterLink>
			</nav>
			<div class="flex items-center gap-2">
				<a
					href="https://www.linkedin.com/in/stevenaobrien/"
					target="_blank"
					rel="noreferrer"
					class="rounded-full border border-skin-border bg-skin-surface px-4 py-2 text-sm font-medium text-skin-secondary transition-colors hover:text-skin-primary"
				>
					LinkedIn
				</a>
				<button
					type="button"
					class="rounded-full border border-skin-border bg-skin-surface px-4 py-2 text-sm font-medium text-skin-secondary transition-colors hover:text-skin-primary"
					@click="toggleTheme"
				>
					{{ currentTheme === 'dark' ? 'Light mode' : 'Dark mode' }}
				</button>
			</div>
		</header>
		<main class="mx-auto w-full max-w-5xl px-6 pb-14">
			<router-view />
		</main>
		<footer class="mx-auto w-full max-w-5xl px-6 py-8">
			<p>No AI's were harmed in the making of this site</p>
			<p class="text-sm text-skin-secondary">
				&copy; {{ new Date().getFullYear() }} Steve O'Brien. All rights reserved.
			</p>
			<a
				href="https://www.linkedin.com/in/stevenaobrien/"
				target="_blank"
				rel="noreferrer"
				class="text-sm text-skin-secondary hover:text-skin-primary"
			>
				LinkedIn
			</a>
			<a
				href="https://github.com/steve-obrien"
				target="_blank"
				rel="noreferrer"
				class="text-sm text-skin-secondary hover:text-skin-primary"
			>
				GitHub
			</a>
			<a
				href="https://x.com/steveaob"
				target="_blank"
				rel="noreferrer"
				class="text-sm text-skin-secondary hover:text-skin-primary"
			>
				X
			</a>
		</footer>
	</div>
</template>
