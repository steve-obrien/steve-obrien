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
import FormFieldStatePanel from './examples/FormFieldStatePanel.vue';
import FormFieldStatePanelSrc from './examples/FormFieldStatePanel.vue?raw';
import GroupedNameFields from './examples/GroupedNameFields.vue';
import GroupedNameFieldsSrc from './examples/GroupedNameFields.vue?raw';
import HeadlessFieldTemplate from './examples/HeadlessFieldTemplate.vue';
import HeadlessFieldTemplateSrc from './examples/HeadlessFieldTemplate.vue?raw';
import InvoiceFieldLayout from './examples/InvoiceFieldLayout.vue';
import InvoiceFieldLayoutSrc from './examples/InvoiceFieldLayout.vue?raw';
import InvoiceLetterFieldLayoutSrc from './examples/InvoiceLetterFieldLayout.vue?raw';
import ElGridFieldLayoutSrc from './layouts/ElGridFieldLayout.vue?raw';
import ManualLayout from './examples/ManualLayout.vue';
import ManualLayoutSrc from './examples/ManualLayout.vue?raw';
import SlugInputSrc from './examples/SlugInput.vue?raw';

const doc = ElField.__doc;
const inputAttrsCode = `{
\tid: 'article_slug',
\tname: 'article[slug]',
\tvalue: 'launch-notes',
\tplaceholder: 'launch-notes',
\tdisabled: undefined,
\treadonly: undefined,
\trequired: true,
\t'aria-invalid': undefined,
\t'aria-describedby': 'article_slug-description',
\t'aria-errormessage': undefined,
\t'data-invalid': undefined,
}`;
const fieldAttrsCode = `{
\tlabel: 'Article slug',
\tdescription: 'The field writes to article.slug.',
\thtmlFor: 'article_slug',
\tdescriptionId: 'article_slug-description',
\terrorId: '',
\tinvalid: false,
\trequired: true,
\terrors: [],
\tvisible: true,
}`;
const useFieldReturns = [
	{ name: 'identity', value: 'id, name, path, htmlName, htmlId', description: 'Generated from props and the nearest ElForm path.' },
	{ name: 'state', value: 'value, errors, interaction, modification, validation, valid', description: 'Local state-machine axes merged with any parent form state plus derived booleans.' },
	{ name: 'visibility', value: 'visible, disabled, readOnly', description: 'Field state the control and wrapper both need to respect.' },
	{ name: 'attrs', value: 'fieldAttrs, inputAttrs', description: 'Ready-to-bind attributes for ElField and the native control.' },
	{ name: 'actions', value: 'onInput, onFocus, onBlur, validate, setValue, setFieldState', description: 'Handlers that keep v-model, ElForm, and validation state aligned.' },
];
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
						<p class="mt-2 text-sm text-muted-foreground">Packaged inputs share fieldProps and useField, then render ElField by default. Set :chrome="false" when a parent ElField owns the visual layout.</p>
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
						and render <code class="font-mono text-foreground">ElField</code>.
						That gives it standalone <code class="font-mono text-foreground">v-model</code>,
						parent form registration, generated names and IDs, validation state, and optional
						<code class="font-mono text-foreground">:chrome="false"</code> support.
					</p>
					<Example
						:source="SlugInputSrc"
						filename="SlugInput.vue"
						description="A slug input with custom presentation, while still using the same form state contract as packaged controls. The rendered demo wraps it in ElForm."
						default-open
						code-first
					>
						<CustomInputComponent />
					</Example>
				</div>
			</DocSection>

			<DocSection eyebrow="Behaviour" title="What useField gives you">
				<div class="space-y-4 text-sm leading-6 text-muted-foreground">
					<p>
						<code class="font-mono text-foreground">useField()</code> is the behaviour layer.
						It reads and writes the nearest <code class="font-mono text-foreground">ElForm</code>
						when one exists, falls back to standalone <code class="font-mono text-foreground">v-model</code>
						when it does not, and returns the state and attributes needed by both
						<code class="font-mono text-foreground">ElField</code> and the real control.
						<code class="font-mono text-foreground">ElField</code> itself stays presentational:
						it receives <code class="font-mono text-foreground">fieldAttrs</code> or listens to
						child fields through a display-only provider.
					</p>
					<div class="overflow-hidden rounded-lg border border-border">
						<table class="w-full text-left text-sm">
							<thead class="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
								<tr>
									<th class="px-4 py-2 font-medium">Group</th>
									<th class="px-4 py-2 font-medium">Returns</th>
									<th class="px-4 py-2 font-medium">Why it matters</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-border">
								<tr v-for="item in useFieldReturns" :key="item.name">
									<td class="px-4 py-3 font-mono text-[12.5px] text-foreground">{{ item.name }}</td>
									<td class="px-4 py-3 font-mono text-[12.5px] text-muted-foreground">{{ item.value }}</td>
									<td class="px-4 py-3 text-muted-foreground">{{ item.description }}</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="grid gap-4 lg:grid-cols-2">
						<div class="space-y-2">
							<p>
								Bind <code class="font-mono text-foreground">field.fieldAttrs.value</code>
								to <code class="font-mono text-foreground">ElField</code>. This is the display
								state: label, helper text, IDs, required marker, errors, and visibility.
							</p>
							<CodeBlock :code="fieldAttrsCode" lang="js" filename="fieldAttrs.value" />
						</div>
						<div class="space-y-2">
							<p>
								Bind <code class="font-mono text-foreground">field.inputAttrs.value</code>
								to the native input. This automates form names, IDs, ARIA, invalid styling,
								and disabled/read-only wiring.
							</p>
							<CodeBlock :code="inputAttrsCode" lang="js" filename="inputAttrs.value" />
						</div>
					</div>
				</div>
			</DocSection>

			<DocSection eyebrow="Headless" title="Wrap a control with custom chrome">
				<div class="space-y-3 text-sm leading-6 text-muted-foreground">
					<p>
						ElField can act as a headless display provider for child controls. Wrap the
						control in <code class="font-mono text-foreground">ElField</code>, set the inner
						packaged input to <code class="font-mono text-foreground">:chrome="false"</code>,
						and use ElField slots to place labels, controls, descriptions, and errors.
					</p>
					<p>
						The display provider is separate from the
						<code class="font-mono text-foreground">ElForm</code> data provider, so nested
						visual fields do not create form scopes, change field paths, or write values.
						If all you need is your own markup, make the wrapping
						<code class="font-mono text-foreground">ElField</code> headless with
						<code class="font-mono text-foreground">:chrome="false"</code> and read the
						slot props yourself.
					</p>
					<Example
						:source="ManualLayoutSrc"
						filename="ManualLayout.vue"
						description="The wrapper ElField renders no chrome, but its slot provides the label target, invalid state, description, and aggregated child errors for custom markup."
						default-open
					>
						<ManualLayout />
					</Example>
					<Example
						:source="HeadlessFieldTemplateSrc"
						filename="HeadlessFieldTemplate.vue"
						description="The label moves to the left, turns red when invalid, and errors live in a popover while the underlying ElTextInput still owns value, ids, and aria state."
						default-open
					>
						<HeadlessFieldTemplate />
					</Example>
				</div>
			</DocSection>

			<DocSection eyebrow="Form state" title="Display field state separately">
				<div class="space-y-4 text-sm leading-6 text-muted-foreground">
					<p>
						When the surrounding UI should not use
						<code class="font-mono text-foreground">ElField</code> slots at all, the
						<code class="font-mono text-foreground">ElForm</code> slot exposes the form API.
						Read field values, field state, generated IDs, native names, paths, and errors
						from the form, then render them wherever the design needs them.
					</p>
					<Example
						:source="FormFieldStatePanelSrc"
						filename="FormFieldStatePanel.vue"
						description="The inputs render without field chrome, while a separate panel reads each field through form.getFieldState(), form.getValue(), and the form path helpers."
						default-open
					>
						<FormFieldStatePanel />
					</Example>
				</div>
			</DocSection>

			<DocSection eyebrow="Reusable layout" title="Provide a field layout component">
				<div class="space-y-4 text-sm leading-6 text-muted-foreground">
					<p>
						Use scoped slots for one-off exceptions. When a whole section should share a
						field shape, pass a layout component through
						<code class="font-mono text-foreground">fieldLayout</code> on
						<code class="font-mono text-foreground">ElField</code>. Use
						<code class="font-mono text-foreground">:chrome="false"</code> when the field
						only provides layout to descendant controls. Nested forms can still scope data
						paths, but they do not know or care about the layout.
					</p>
					<Example
						:source="InvoiceFieldLayoutSrc"
						filename="InvoiceFieldLayout.vue"
						description="The invoice form uses ElField to provide a custom letter layout, then uses another ElField to provide the shipped ElGridFieldLayout inside line item rows."
						:preview-lines="8"
					>
						<InvoiceFieldLayout />
					</Example>
					<div class="grid gap-4 lg:grid-cols-2">
						<div class="space-y-2">
							<p>
								This local layout renders labels to the left and keeps the normal field
								error and description slots.
							</p>
							<CodeBlock
								:code="InvoiceLetterFieldLayoutSrc"
								lang="vue"
								filename="InvoiceLetterFieldLayout.vue"
								:default-open="false"
								:preview-lines="6"
							/>
						</div>
						<div class="space-y-2">
							<p>
								This shipped grid layout keeps labels accessible while letting parent
								grid headers provide the visible column labels.
							</p>
							<CodeBlock
								:code="ElGridFieldLayoutSrc"
								lang="vue"
								filename="ElGridFieldLayout.vue"
								:default-open="false"
								:preview-lines="6"
							/>
						</div>
					</div>
				</div>
			</DocSection>

			<DocSection eyebrow="Composite layout" title="Represent multiple fields as one row">
				<div class="space-y-4 text-sm leading-6 text-muted-foreground">
					<p>
						For grouped inputs, keep one visual <code class="font-mono text-foreground">ElField</code>
						around the row and set the internal controls to
						<code class="font-mono text-foreground">:chrome="false"</code>. Each input can
						still write its own form value while shared label and group errors stay in one
						place.
					</p>
					<Example
						:source="GroupedNameFieldsSrc"
						filename="GroupedNameFields.vue"
						description="First and last name are two logical fields, but the user sees one labelled row with combined errors below."
					>
						<GroupedNameFields />
					</Example>
				</div>
			</DocSection>

			<DocSection eyebrow="Usage" title="Vue">
				<div class="space-y-3 text-sm leading-6 text-muted-foreground">
					<p>
						This is the same component used in the rendered native-control demo above,
						so the source and output stay coupled.
					</p>
					<CodeBlock :code="BasicSrc" lang="vue" filename="Basic.vue" />
				</div>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElField" />
			</DocSection>

			<ComponentSlots :component="ElField" />
		</DocPage>
	</ElementsLayout>
</template>
