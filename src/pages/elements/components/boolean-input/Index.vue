<script setup>
import { ref } from 'vue';
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import Demo from '../../_layout/Demo.vue';
import PropsTable from '../../_layout/PropsTable.vue';
import { ElBooleanInput } from '../../lib/vue';

const enabled = ref(true);

const usage = `<script setup>
import { ElBooleanInput } from '@elements/vue';
import { ref } from 'vue';
const enabled = ref(true);
<\/script>

<template>
  <ElBooleanInput
    v-model="enabled"
    label="Notifications"
    description="Send a weekly digest of new components."
  />
</template>`;

const props = [
	{ name: 'v-model', type: 'boolean', default: 'false', description: 'On / off state.' },
	{ name: 'label', type: 'string', default: '—', description: 'Label above the switch.' },
	{ name: 'description', type: 'string', default: '—', description: 'Hint shown below the switch.' },
	{ name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the switch.' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Boolean input"
			tagline="Switch field with a label above and an optional description below — wraps ElToggle inside ElField."
			tag="<ElBooleanInput>"
		>
			<DocSection eyebrow="Demo" title="Live preview">
				<Demo>
					<div class="w-full max-w-sm">
						<ElBooleanInput
							v-model="enabled"
							label="Notifications"
							description="Send a weekly digest of new components."
						/>
						<p class="mt-3 text-xs text-skin-muted">Value: <code class="text-skin-primary">{{ enabled }}</code></p>
					</div>
				</Demo>
			</DocSection>

			<DocSection eyebrow="Usage" title="Vue">
				<CodeBlock :code="usage" lang="vue" />
			</DocSection>

			<DocSection title="Props">
				<PropsTable :rows="props" />
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
