<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import Playground from '../../_layout/docs/Playground.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentEvents from '../../_layout/docs/ComponentEvents.vue';
import { ElJsonInput } from '../../lib/vue';

import JsonField from './examples/JsonField.vue';
import JsonFieldSrc from './examples/JsonField.vue?raw';
import FormAndJson from './examples/FormAndJson.vue';
import FormAndJsonSrc from './examples/FormAndJson.vue?raw';

const doc = ElJsonInput.__doc;
</script>

<template>
	<ElementsLayout>
		<DocPage :name="doc.name" :tagline="doc.description" :tag="doc.tag">
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:inspect="ElJsonInput"
					:initial="{ label: 'Feature config', description: 'Valid JSON emits parsed data.', modelValue: { name: 'Elements', editable: true }, rows: 8 }"
					title="JSON input playground"
					description="The JSON input is useful anywhere a form needs to expose structured data without hiding the raw value."
				/>
			</DocSection>

			<DocSection eyebrow="Demo" title="JSON form input">
				<Example
					:source="JsonFieldSrc"
					filename="JsonField.vue"
					description="Invalid JSON shows an inline error and does not emit until the value is valid again."
				>
					<JsonField />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Form plus raw JSON">
				<Example
					:source="FormAndJsonSrc"
					filename="FormAndJson.vue"
					description="A practical pattern: normal form fields for common edits, raw JSON for advanced edits."
				>
					<FormAndJson />
				</Example>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElJsonInput" />
			</DocSection>

			<ComponentEvents :component="ElJsonInput" />
		</DocPage>
	</ElementsLayout>
</template>
