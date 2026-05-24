<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import Playground from '../../_layout/docs/Playground.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentEvents from '../../_layout/docs/ComponentEvents.vue';
import { ElCodeInput } from '../../lib/vue';

import CodeField from './examples/CodeField.vue';
import CodeFieldSrc from './examples/CodeField.vue?raw';

const doc = ElCodeInput.__doc;
const playgroundInitial = {
	label: 'Configuration',
	description: 'Enhanced editor is optional.',
	lang: 'json',
	modelValue: `{
	"name": "Elements",
	"editable": true
}`,
	rows: 8,
};
</script>

<template>
	<ElementsLayout>
		<DocPage :name="doc.name" :tagline="doc.description" :tag="doc.tag">
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:inspect="ElCodeInput"
					:initial="playgroundInitial"
					title="Code input playground"
					description="The enhanced editor is loaded after mount. If the CDN is unavailable, the textarea fallback still works."
				/>
			</DocSection>

			<DocSection eyebrow="Demo" title="Progressive editor">
				<Example
					:source="CodeFieldSrc"
					filename="CodeField.vue"
					description="Useful for JSON, prompts, templates, snippets, and other structured text inside forms."
				>
					<CodeField />
				</Example>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElCodeInput" />
			</DocSection>

			<ComponentEvents :component="ElCodeInput" />
		</DocPage>
	</ElementsLayout>
</template>
