<script setup>
import { RouterLink, useRoute } from 'vue-router';
import BtnLightDarkMode from '../cmp/BtnLightDarkMode.vue';
import meImg from '../assets/me.jpeg';
import sigImg from '../assets/sig.png';
import MobileNav from '../cmp/MobileNav.vue';
import SocialLinks from '../cmp/SocialLinks.vue';
import { onMounted } from 'vue';
import { useTheme } from '../composable/useTheme';
import { links } from '../composable/navigationLinks';
import Navbar from '../cmp/Navbar.vue';

const { initTheme } = useTheme();

onMounted(() => {
	console.log('init theme')
	initTheme();
});

const route = useRoute();
</script>

<template>
	<div class="min-h-screen bg-skin-background text-skin-primary transition-colors duration-200">
		<Navbar></Navbar>
		<main class="mx-auto w-full bg-white dark:bg-black max-w-6xl px-6 pb-14 ">
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
