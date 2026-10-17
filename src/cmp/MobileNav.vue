<template>
	<button @click="isOpen = !isOpen" type="button" popovertarget="my-popover" class="rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:text-foreground">
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
				class="skin-card liquid-glass fixed top-3 right-3 bottom-3 z-50 ml-auto w-[calc(100%-1.5rem)] max-w-sm overflow-hidden rounded-[2rem] text-card-foreground"
			>
				<div class="flex flex-col p-3">
					<div class="flex items-center justify-between px-4 pt-2 pb-4">
						<span class="font-display text-sm font-semibold text-foreground">Steve O’Brien</span>
						<button type="button" class="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground" @click="isOpen = false">
							Close
						</button>
					</div>
					<RouterLink
						@click="isOpen = false;"
						v-for="link in links"
						:key="link.to"
						:to="link.to"
						class="rounded-2xl px-4 py-4 text-sm font-medium transition-colors"
						:class="route.path === link.to 
							? 'bg-secondary text-foreground'
							: 'text-muted-foreground hover:bg-secondary hover:text-foreground'"
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
import { links } from '../composable/navigationLinks';

const route = useRoute();

const isOpen = ref(false);

/** @param {MediaQueryListEvent | MediaQueryList} event Breakpoint state. @returns {void} Closes the mobile drawer on desktop. */
const closeMenuAtDesktop = (event) => {
	if (event.matches) {
		isOpen.value = false;
	}
};

let mdBreakpoint = null;

onMounted(() => {
	// encapsulate browser specific code in onMounted
	mdBreakpoint = window.matchMedia('(min-width: 1024px)');
	mdBreakpoint.addEventListener('change', closeMenuAtDesktop);
	closeMenuAtDesktop(mdBreakpoint);
});

onBeforeUnmount(() => {
	mdBreakpoint?.removeEventListener('change', closeMenuAtDesktop);
});


</script>
