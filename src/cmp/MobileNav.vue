<template>
	<button @click="isOpen = !isOpen" type="button" popovertarget="my-popover" class="rounded-full px-4 py-2 text-sm font-medium transition-colors">
		Menu
	</button>
	<Teleport to="body">
		<Transition enter-active-class="transition-opacity duration-500" leave-active-class="transition-opacity duration-500" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
			<div v-if="isOpen" @click="isOpen = false;" class="fixed top-0 left-0 bottom-0 right-0 w-full h-full backdrop-blur-xs z-40">
			</div>
		</Transition>
		<Transition enter-active-class="transform transition ease-in-out duration-500 sm:duration-700" enter-from-class="translate-x-full" enter-to-class="translate-x-0" leave-active-class="transform transition ease-in-out duration-500 sm:duration-700" leave-from-class="translate-x-0" leave-to-class="translate-x-full">
			<div
				v-if="isOpen"
				class="fixed top-0 right-0 w-full h-full max-w-sm ml-auto backdrop-blur-sm shadow-lg bg-zinc-50/70 ring-1 ring-zinc-900/5 z-50
					dark:bg-zinc-900/95 dark:ring-white/10"
			>
				<div class="flex flex-col">
					<RouterLink
						@click="isOpen = false;"
						v-for="link in links"
						:key="link.to"
						:to="link.to"
						class="px-4 py-5 text-sm border-b border-zinc-200 font-medium transition-colors dark:border-zinc-700"
						:class="route.path === link.to 
							? 'border-b bg-white/80 font-bold dark:bg-zinc-900/80 border-l-4 '
							: 'text-skin-secondary hover:text-skin-primary dark:text-zinc-300 dark:hover:text-white'"
					>
						{{ link.label }}
					</RouterLink>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();

const isOpen = ref(false);

const closeMenuAtDesktop = (event) => {
	if (event.matches) {
		isOpen.value = false;
	}
};

let mdBreakpoint = null;

onMounted(() => {
	// encapsulate browser specific code in onMounted
	mdBreakpoint = window.matchMedia('(min-width: 768px)');
	mdBreakpoint.addEventListener('change', closeMenuAtDesktop);
	closeMenuAtDesktop(mdBreakpoint);
});

onBeforeUnmount(() => {
	mdBreakpoint?.removeEventListener('change', closeMenuAtDesktop);
});

const links = [
	{ to: '/', label: 'About' },
	{ to: '/experiments', label: 'Experiments' },
	{ to: '/projects', label: 'Projects' },
	{ to: '/ideas', label: 'Ideas' },
];
</script>