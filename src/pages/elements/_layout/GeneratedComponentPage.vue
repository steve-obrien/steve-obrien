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
});

const loadedComponent = shallowRef(props.component);

onMounted(async () => {
	if (!loadedComponent.value && props.componentLoader) {
		const module = await props.componentLoader();
		loadedComponent.value = module.default || module;
	}
});

const doc = computed(() => loadedComponent.value?.__doc || {});
const name = computed(() => doc.value.name || loadedComponent.value?.__name || loadedComponent.value?.name || 'Component');
const tagline = computed(() => doc.value.description || 'Auto-generated documentation from the component metadata and runtime props.');
const tag = computed(() => doc.value.tag || `<${loadedComponent.value?.__name || loadedComponent.value?.name || 'Component'}>`);
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
				/>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps v-if="loadedComponent" :component="loadedComponent" />
			</DocSection>

			<ComponentSlots v-if="loadedComponent" :component="loadedComponent" />
			<ComponentEvents v-if="loadedComponent" :component="loadedComponent" />
		</DocPage>
	</ElementsLayout>
</template>
