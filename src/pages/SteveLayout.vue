<script setup>
import SocialLinks from '../cmp/SocialLinks.vue';
import { onMounted } from 'vue';
import { useTheme } from '../composable/useTheme';
import Navbar from '../cmp/Navbar.vue';

const { initTheme } = useTheme();

onMounted(() => {
	initTheme();
});

defineProps({
	bgClass: {
		type: String,
		default: 'bg-background',
	},
});

</script>

<template>
	<div class="min-h-screen text-foreground transition-colors duration-200" :class="bgClass">
		<Navbar></Navbar>
		<main class="mx-auto w-full max-w-6xl px-6 pb-20">
			<slot />
		</main>
		<footer class="mx-auto w-full max-w-6xl border-t border-border px-6 py-10">
			<div class="flex flex-wrap items-center justify-between gap-5">
				<p class="text-sm text-muted-foreground">
					&copy; {{ new Date().getFullYear() }} Steve O’Brien · Building useful intelligence from Bristol.
				</p>
				<SocialLinks />
			</div>
		</footer>
	</div>
</template>
