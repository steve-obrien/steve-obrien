<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import Demo from '../../_layout/Demo.vue';
import PropsTable from '../../_layout/PropsTable.vue';
import { ElListInput, ElDropdown } from '../../lib/vue';

const items = ref([
	{ label: 'Apple', value: 'apple' },
	{ label: 'Banana', value: 'banana' },
	{ label: 'Cherry', value: 'cherry' },
]);

const usageVue = `<script setup>
import { ElListInput } from '@elements/vue';
import { ref } from 'vue';

const items = ref([
  { label: 'Apple',  value: 'apple' },
  { label: 'Banana', value: 'banana' },
]);
<\/script>

<template>
  <ElListInput v-model="items" add-label="+ Add fruit" />
</template>`;

const usageInspector = `// Any component prop can opt into ElListInput by declaring an inline
// inspector hint. The reference is a *string* so production output never
// imports form components.

defineProps({
  items: {
    type: Array,
    required: true,
    _edit: { component: 'ElListInput' },
  },
});`;

const props = [
	{ name: 'v-model', type: 'Array<{ label, value }>', default: '[]', description: 'List of items.' },
	{ name: 'addLabel', type: 'string', default: "'+ Add item'", description: 'Button label for the "add" row.' },
	{ name: 'labelPlaceholder', type: 'string', default: "'Label'", description: 'Placeholder for the label input on each row.' },
	{ name: 'valuePlaceholder', type: 'string', default: "'value'", description: 'Placeholder for the value input on each row.' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="List input"
			tagline="A friendly editor for arrays of label/value items — add, reorder, remove inline. Works as a form input and as an inspector editor."
			tag="<ElListInput>"
		>
			<DocSection eyebrow="Demo" title="Live preview">
				<Demo>
					<div class="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
						<div>
							<p class="mb-2 text-xs font-medium uppercase tracking-wider text-skin-muted">Editor</p>
							<ElListInput v-model="items" add-label="+ Add fruit" />
						</div>
						<div>
							<p class="mb-2 text-xs font-medium uppercase tracking-wider text-skin-muted">Bound elsewhere</p>
							<ElDropdown :items="items" label="Pick a fruit" />
							<pre class="mt-3 overflow-auto rounded-lg border border-skin-border bg-[#0b1020] p-3 font-mono text-[11.5px] leading-relaxed text-white/90"><code>{{ JSON.stringify(items, null, 2) }}</code></pre>
						</div>
					</div>
				</Demo>
				<p class="mt-3 text-sm text-skin-secondary">
					Edits flow through <code>v-model</code> — the dropdown on the right is bound to the same array.
				</p>
			</DocSection>

			<DocSection eyebrow="Usage" title="Vue">
				<CodeBlock :code="usageVue" lang="vue" />
			</DocSection>

			<DocSection eyebrow="Inspector" title="As an inline editor hint">
				<CodeBlock :code="usageInspector" lang="js" />
				<p class="mt-3 text-sm text-skin-secondary">
					When the studio inspects this prop it resolves <code>'ElListInput'</code> against the editor registry and
					renders the list editor — the same component you see here. Strings (not direct refs) keep form code out of
					production bundles. See the <RouterLink to="/elements/components/studio" class="font-medium text-skin-primary underline-offset-2 hover:underline">Studio</RouterLink> for a live example via ElDropdown.
				</p>
			</DocSection>

			<DocSection title="Props">
				<PropsTable :rows="props" />
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
