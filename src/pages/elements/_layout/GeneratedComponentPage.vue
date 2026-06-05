<script setup>
import { computed, onMounted, shallowRef } from 'vue';
import ElementsLayout from './ElementsLayout.vue';
import DocPage from './DocPage.vue';
import DocSection from './DocSection.vue';
import Playground from './docs/Playground.vue';
import ComponentProps from './docs/ComponentProps.vue';
import ComponentSlots from './docs/ComponentSlots.vue';
import ComponentEvents from './docs/ComponentEvents.vue';

const props = defineProps({
	component: { type: Object, default: null },
	componentLoader: { type: Function, default: null },
	componentSource: { type: String, default: '' },
	componentSourceLoader: { type: Function, default: null },
	section: { type: String, default: '' },
});

const loadedComponent = shallowRef(props.component);
const loadedSource = shallowRef(props.componentSource);

onMounted(async () => {
	if (!loadedComponent.value && props.componentLoader) {
		const module = await props.componentLoader();
		loadedComponent.value = module.default || module;
	}
	if (!loadedSource.value && props.componentSourceLoader) {
		const module = await props.componentSourceLoader();
		loadedSource.value = module.default || module;
	}
});

const doc = computed(() => loadedComponent.value?.__doc || {});
const name = computed(() => doc.value.name || loadedComponent.value?.__name || loadedComponent.value?.name || 'Component');
const tagline = computed(() => doc.value.description || 'Auto-generated documentation from the component metadata and runtime props.');
const tag = computed(() => doc.value.tag || `<${loadedComponent.value?.__name || loadedComponent.value?.name || 'Component'}>`);
const playgroundPresentation = computed(() => (props.section === 'mobile' ? 'mobile' : 'default'));
const playgroundInitial = computed(() => doc.value.playground?.initial || {});
</script>

<template>
	<ElementsLayout>
		<DocPage :name="name" :tagline="tagline" :tag="tag">
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					v-if="loadedComponent"
					:inspect="loadedComponent"
					:title="`${name} playground`"
					description="This page is generated automatically from the component folder. Add a custom Index.vue beside the component when it needs richer docs."
					:presentation="playgroundPresentation"
					:initial="playgroundInitial"
				/>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps v-if="loadedComponent" :component="loadedComponent" :source="loadedSource" />
			</DocSection>

			<ComponentSlots v-if="loadedComponent" :component="loadedComponent" />
			<ComponentEvents v-if="loadedComponent" :component="loadedComponent" :source="loadedSource" />
		</DocPage>
	</ElementsLayout>
</template>
