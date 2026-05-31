<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import {
	componentAnchor,
	getComponentRecords,
	primaryExportNameForSlug,
} from '../componentManager.js';
import { inspectComponentRecord } from '../componentInspector.js';
import ComponentProps from './ComponentProps.vue';
import ComponentSlots from './ComponentSlots.vue';
import ComponentEvents from './ComponentEvents.vue';
import ComponentKeyboard from './ComponentKeyboard.vue';

const route = useRoute();

const related = computed(() => {
	const family = getComponentRecords()
		.map(inspectComponentRecord)
		.filter((record) => !record.hidden && record.route === route.path);
	const primary = primaryRecord(family);
	return family
		.filter((record) => record !== primary && !record.navHidden)
		.sort(sortRecords)
		.map((record) => ({
			...record,
			anchor: componentAnchor(record),
		}));
});

function primaryRecord(family) {
	const slug = family[0]?.slug || '';
	const expected = primaryExportNameForSlug(slug);
	return family.find((record) => record.doc.nav?.primary)
		|| family.find((record) => record.exportName === expected)
		|| family[0];
}

function sortRecords(a, b) {
	const orderDelta = a.order - b.order;
	if (orderDelta) return orderDelta;
	return a.label.localeCompare(b.label);
}
</script>

<template>
	<section v-if="related.length" class="space-y-4">
		<div>
			<h2 class="text-2xl font-semibold tracking-tight text-foreground">Related components</h2>
			<p class="mt-2 text-sm leading-6 text-muted-foreground">
				Generated from sibling component files that share this documentation route.
			</p>
		</div>

		<details
			v-for="record in related"
			:id="record.anchor"
			:key="record.exportName"
			:open="route.hash === `#${record.anchor}`"
			class="group rounded-2xl border border-border bg-secondary/25"
		>
			<summary class="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3">
				<span class="min-w-0">
					<span class="block truncate text-sm font-semibold text-foreground">{{ record.label }}</span>
					<span v-if="record.doc.description" class="mt-1 block text-sm leading-5 text-muted-foreground">
						{{ record.doc.description }}
					</span>
				</span>
				<span class="text-sm text-muted-foreground transition group-open:rotate-180">⌄</span>
			</summary>
			<div class="space-y-6 border-t border-border p-4">
				<div v-if="record.doc.tag" class="text-sm text-muted-foreground">
					<code class="font-mono text-foreground">{{ record.doc.tag }}</code>
				</div>
				<ComponentProps :component="record.component" />
				<ComponentSlots :component="record.component" />
				<ComponentEvents :component="record.component" />
				<ComponentKeyboard :component="record.component" />
			</div>
		</details>
	</section>
</template>
