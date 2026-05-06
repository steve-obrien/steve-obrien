<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import BtnLightDarkMode from './cmp/BtnLightDarkMode.vue';
import { useTheme } from './composable/useTheme';
import meImg from './assets/me.jpeg';
import MobileNav from './cmp/MobileNav.vue';

const {
	currentTheme,
	toggleTheme,
	initTheme
} = useTheme();

onMounted(() => {
	initTheme();
});

const route = useRoute();

const links = [
	{ to: '/', label: 'About' },
	{ to: '/experiments', label: 'Experiments' },
	{ to: '/projects', label: 'Projects' },
	{ to: '/ideas', label: 'Ideas' },
];
</script>

<template>
	<div class="min-h-screen bg-skin-background text-skin-primary transition-colors duration-200">
		<header class="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8 mb-20">
			<div class="flex flex-1">
				<div class="h-10 w-10 rounded-full bg-white/90 p-0.5 shadow-lg ring-1 shadow-black/5 ring-zinc-900/5 dark:bg-zinc-800/90 dark:ring-white/10">
					<img width="512" height="512" :src="meImg" class="rounded-full bg-zinc-100 object-cover dark:bg-zinc-800 h-9 w-9" alt="Steve O'Brien" sizes="2.25rem" />
				</div>
			</div>
			<div class="flex flex-1 justify-end md:justify-center">
				<div class="flex h-10 items-center gap-4 md:hidden mr-2 rounded-full bg-white/90 text-sm font-medium text-zinc-800 shadow-lg ring-1 shadow-zinc-800/5 ring-zinc-900/5 backdrop-blur-sm dark:bg-zinc-800/90 dark:text-zinc-200 dark:ring-white/10">
					<MobileNav />
				</div>
				<nav class="items-center gap-4 hidden md:flex rounded-full p-1 bg-white/90 text-sm font-medium text-zinc-800 shadow-lg ring-1 shadow-zinc-800/5 ring-zinc-900/5 backdrop-blur-sm dark:bg-zinc-800/90 dark:text-zinc-200 dark:ring-white/10">
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
			</div>
			<div class="flex justify-end md:flex-1">
				<BtnLightDarkMode />
			</div>
		</header>
		<main class="mx-auto w-full max-w-6xl px-6 pb-14">
			<router-view />
		</main>
		<footer class="mx-auto w-full max-w-6xl px-6 py-8">
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
