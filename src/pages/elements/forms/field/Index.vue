<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import Example from '../../_layout/docs/Example.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentSlots from '../../_layout/docs/ComponentSlots.vue';
import { ElField } from '../../lib/vue';

import Basic from './examples/Basic.vue';
import BasicSrc from './examples/Basic.vue?raw';
import CustomControl from './examples/CustomControl.vue';
import CustomControlSrc from './examples/CustomControl.vue?raw';
import CustomInputComponent from './examples/CustomInputComponent.vue';
import CustomInputComponentSrc from './examples/CustomInputComponent.vue?raw';

const doc = ElField.__doc;
const usage = `<script setup>
import { ElField } from '@elements/vue';
import { ref } from 'vue';

const email = ref('');
<\/script>

<template>
  <ElField
    label="Email address"
    description="Used for account notifications."
    html-for="email"
    required
  >
    <input
      id="email"
      v-model="email"
      type="email"
      class="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
    />
  </ElField>
</template>`;
</script>

<template>
	<ElementsLayout>
		<DocPage :name="doc.name" :tagline="doc.description" :tag="doc.tag">
			<DocSection eyebrow="Purpose" title="The shared form wrapper">
				<div class="grid gap-4 text-sm text-muted-foreground md:grid-cols-3">
					<div class="rounded-2xl border border-border bg-card p-4 text-card-foreground">
						<p class="font-medium text-foreground">Use it for custom controls</p>
						<p class="mt-2 text-sm text-muted-foreground">When an input is not already covered by an Elements form component, wrap the control with ElField to keep labels and descriptions consistent.</p>
					</div>
					<div class="rounded-2xl border border-border bg-card p-4 text-card-foreground">
						<p class="font-medium text-foreground">Keep accessible labels</p>
						<p class="mt-2 text-sm text-muted-foreground">Pass htmlFor when the slotted control has an id, so clicking the label focuses the underlying input.</p>
					</div>
					<div class="rounded-2xl border border-border bg-card p-4 text-card-foreground">
						<p class="font-medium text-foreground">Avoid duplicated chrome</p>
						<p class="mt-2 text-sm text-muted-foreground">Packaged inputs share fieldProps and useField, then render this chrome by default. Set chrome="none" when you want to provide the wrapper yourself.</p>
					</div>
				</div>
			</DocSection>

			<DocSection eyebrow="Validation" title="Invalid fields">
				<div class="space-y-3 text-sm text-muted-foreground">
					<p>
						Pass <code class="font-mono text-foreground">invalid</code> or
						<code class="font-mono text-foreground">data-invalid</code> to mark the field wrapper invalid.
						Inputs using the shared <code class="font-mono text-foreground">el-input</code> or
						<code class="font-mono text-foreground">el-textarea</code> utility automatically pick up the destructive border and focus ring.
					</p>
					<CodeBlock
						:code="`<ElField label=&quot;Email&quot; html-for=&quot;email&quot; data-invalid>\n\t<input id=&quot;email&quot; name=&quot;email&quot; class=&quot;el-input&quot; aria-invalid=&quot;true&quot; />\n</ElField>`"
						lang="html"
					/>
				</div>
			</DocSection>

			<DocSection eyebrow="Demo" title="Native control">
				<Example
					:source="BasicSrc"
					filename="Basic.vue"
					description="A plain input receives the same label, required marker, spacing, and helper copy as the packaged form controls."
				>
					<Basic />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Custom control">
				<Example
					:source="CustomControlSrc"
					filename="CustomControl.vue"
					description="Use ElField around composed controls such as button groups, pickers, uploaders, or custom server-backed widgets."
				>
					<CustomControl />
				</Example>
			</DocSection>

			<DocSection eyebrow="Component pattern" title="Create your own form input">
				<div class="space-y-4">
					<p class="text-sm leading-6 text-muted-foreground">
						A custom input should compose
						<code class="font-mono text-foreground">fieldProps</code>,
						call <code class="font-mono text-foreground">useField</code>,
						and render <code class="font-mono text-foreground">ElFieldChrome</code>.
						That gives it standalone <code class="font-mono text-foreground">v-model</code>,
						parent form registration, generated names and IDs, validation state, and optional
						<code class="font-mono text-foreground">chrome="none"</code> support.
					</p>
					<Example
						:source="CustomInputComponentSrc"
						filename="CustomInputComponent.vue"
						description="A slug input with custom presentation, while still using the same form state contract as packaged controls."
					>
						<CustomInputComponent />
					</Example>
				</div>
			</DocSection>

			<DocSection eyebrow="Chrome slots" title="Override the wrapper pieces">
				<div class="space-y-3 text-sm leading-6 text-muted-foreground">
					<p>
						ElField is still a visual component, but its label, default content, errors,
						and description slots are scoped. This gives a light headless-template route:
						replace only the pieces you need, or set <code class="font-mono text-foreground">chrome="none"</code>
						on a packaged input and build the whole surrounding layout yourself.
					</p>
					<CodeBlock
						lang="vue"
						:code="`<ElField label=&quot;Email&quot; :errors=&quot;errors&quot;>\n\t<template #label=&quot;{ label, required }&quot;>\n\t\t<div class=&quot;flex items-center justify-between&quot;>\n\t\t\t<strong>{{ label }}</strong>\n\t\t\t<span v-if=&quot;required&quot;>Required</span>\n\t\t</div>\n\t</template>\n\n\t<input class=&quot;el-input&quot; />\n\n\t<template #errors=&quot;{ errors }&quot;>\n\t\t<ul class=&quot;text-xs text-destructive&quot;>\n\t\t\t<li v-for=&quot;error in errors&quot; :key=&quot;error&quot;>{{ error }}</li>\n\t\t</ul>\n\t</template>\n</ElField>`"
					/>
				</div>
			</DocSection>

			<DocSection eyebrow="Usage" title="Vue">
				<CodeBlock :code="usage" lang="vue" />
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElField" />
			</DocSection>

			<ComponentSlots :component="ElField" />
		</DocPage>
	</ElementsLayout>
</template>
