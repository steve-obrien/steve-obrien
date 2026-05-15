<script setup>
import { RouterLink, useRoute } from 'vue-router';
import BtnLightDarkMode from '../cmp/BtnLightDarkMode.vue';
import meImg from '../assets/me.jpeg';
import sigImg from '../assets/sig.png';
import MobileNav from '../cmp/MobileNav.vue';
import SocialLinks from '../cmp/SocialLinks.vue';
import { onMounted } from 'vue';
import { useTheme } from '../composable/useTheme';

const { initTheme } = useTheme();

onMounted(() => {
	console.log('init theme')
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
			<a class="flex flex-1 items-center" href="/">
				<div class="h-14 max-w-20 flex items-center rounded-full p-0.5">
					<img width="512" height="512" :src="meImg" class="rounded-full bg-zinc-100 object-cover dark:bg-zinc-800" alt="Steve O'Brien" sizes="2.25rem" />
				</div>
				<div class="h-14 w-20 flex items-center justify-center">
					<img width="321" height="205" :src="sigImg" class="rounded-full object-cover dark:invert" alt="Steve O'Brien" sizes="2.25rem" />
				</div>
			</a>
			<div class="flex flex-1 justify-end md:justify-center">
				<div class="flex h-10 items-center gap-4 md:hidden mr-2 rounded-full bg-white/90 text-sm font-medium text-zinc-800 shadow-lg ring-1 shadow-zinc-800/5 ring-zinc-900/5 backdrop-blur-sm dark:bg-zinc-800/90 dark:text-zinc-200 dark:ring-white/10">
					<MobileNav />
					<BtnLightDarkMode />
				</div>
			</div>
			<div class="flex justify-end md:flex-1">
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
					<BtnLightDarkMode />
				</nav>
			</div>
		</header>
		<main class="mx-auto w-full max-w-6xl px-6 pb-14">
			<slot />
		</main>
		<footer class="mx-auto w-full max-w-6xl space-y-4 px-6 py-8">
			<p class="text-sm text-skin-secondary">No AI's were harmed in the making of this site</p>
			<div class="flex flex-wrap items-center justify-between gap-4">
				<p class="text-sm text-skin-secondary">
					&copy; {{ new Date().getFullYear() }} Steve O'Brien. All rights reserved.
				</p>
				<SocialLinks />
			</div>
		</footer>
	</div>
</template>
