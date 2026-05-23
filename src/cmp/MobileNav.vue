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
				class="fixed top-0 right-0 z-50 ml-auto h-full w-full max-w-sm bg-card-skin/95 text-card shadow-lg ring-1 ring-border backdrop-blur-sm"
			>
				<div class="flex flex-col">
					<RouterLink
						@click="isOpen = false;"
						v-for="link in links"
						:key="link.to"
						:to="link.to"
						class="border-b border-border px-4 py-5 text-sm font-medium transition-colors"
						:class="route.path === link.to 
							? 'border-l-4 border-l-primary-skin bg-secondary-skin font-bold'
							: 'text-secondary hover:bg-accent-skin hover:text-accent'"
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


</script>
