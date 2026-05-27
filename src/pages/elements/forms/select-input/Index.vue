<script setup>
import { ref } from 'vue';
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import Demo from '../../_layout/Demo.vue';
import Playground from '../../_layout/docs/Playground.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import { ElSelectInput } from '../../lib/vue';

const size = ref('md');

const usage = `<script setup>
import { ElSelectInput } from '@elements/vue';
import { ref } from 'vue';
const size = ref('md');
<\/script>

<template>
  <ElSelectInput
    v-model="size"
    label="Size"
    description="Three balanced sizes."
    :options="['sm', 'md', 'lg']"
  />
</template>`;

</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Select input"
			tagline="A pill-style segmented selector. Compact, keyboard-friendly, ideal for short option lists."
			tag="<ElSelectInput>"
		>
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:inspect="ElSelectInput"
					:initial="{ label: 'Size', description: 'Three balanced sizes.', options: ['sm', 'md', 'lg'], modelValue: 'md' }"
					title="Select input playground"
					description="Edit props in the inspector — options array and selected value update live."
				/>
			</DocSection>

			<DocSection eyebrow="Demo" title="Live preview">
				<Demo>
					<div class="w-full max-w-sm">
						<ElSelectInput
							v-model="size"
							label="Size"
							description="Three balanced sizes."
							:options="['sm', 'md', 'lg']"
						/>
						<p class="mt-3 text-xs text-muted-foreground">Value: <code class="text-foreground">{{ size }}</code></p>
					</div>
				</Demo>
			</DocSection>

			<DocSection eyebrow="Usage" title="Vue">
				<CodeBlock :code="usage" lang="vue" />
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElSelectInput" />
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
