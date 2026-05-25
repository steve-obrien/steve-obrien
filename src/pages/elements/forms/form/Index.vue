<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentEvents from '../../_layout/docs/ComponentEvents.vue';
import ComponentSlots from '../../_layout/docs/ComponentSlots.vue';
import { ElForm } from '../../lib/vue';

import AccountForm from './examples/AccountForm.vue';
import AccountFormSrc from './examples/AccountForm.vue?raw';
import ChangeEvents from './examples/ChangeEvents.vue';
import ChangeEventsSrc from './examples/ChangeEvents.vue?raw';
import DynamicInvitees from './examples/DynamicInvitees.vue';
import DynamicInviteesSrc from './examples/DynamicInvitees.vue?raw';
import FormMethods from './examples/FormMethods.vue';
import FormMethodsSrc from './examples/FormMethods.vue?raw';
import NestedForm from './examples/NestedForm.vue';
import NestedFormSrc from './examples/NestedForm.vue?raw';
import ProgrammaticForm from './examples/ProgrammaticForm.vue';
import ProgrammaticFormSrc from './examples/ProgrammaticForm.vue?raw';
import ServerDefinedForm from './examples/ServerDefinedForm.vue';
import ServerDefinedFormSrc from './examples/ServerDefinedForm.vue?raw';
import StandaloneFields from './examples/StandaloneFields.vue';
import StandaloneFieldsSrc from './examples/StandaloneFields.vue?raw';
import ZodSchemaForm from './examples/ZodSchemaForm.vue';
import ZodSchemaFormSrc from './examples/ZodSchemaForm.vue?raw';

const doc = ElForm.__doc;

const piniaCode = `// stores/profileForm.js
import { defineStore } from 'pinia';
import { forms } from '@/elements/lib/vue';

export const useProfileFormStore = defineStore('profileForm', {
\tstate: () => ({
\t\tvalues: {
\t\t\tname: '',
\t\t\temail: '',
\t\t},
\t\terrors: {},
\t}),
\tactions: {
\t\tsetFromServer(values) {
\t\t\tthis.values = { ...values };
\t\t},
\t\tasync validate() {
\t\t\treturn forms.profile?.validate() ?? false;
\t\t},
\t\tonChange({ errors }) {
\t\t\tthis.errors = errors;
\t\t},
\t},
});

// ProfileForm.vue
import { storeToRefs } from 'pinia';

const store = useProfileFormStore();
const { values } = storeToRefs(store);

<ElForm name="profile" v-model="values" @change="store.onChange">
\t<ElTextInput name="name" label="Name" />
\t<ElEmailInput name="email" label="Email" />
</ElForm>`;

const zodCode = `import { z } from 'zod';

const accountSchema = z.object({
\tname: z.string().min(2).describe('Name'),
\temail: z.string().email().describe('Email address'),
\twebsite: z.string().url().optional().describe('Website'),
\tplan: z.enum(['starter', 'team', 'enterprise']).describe('Plan'),
});

<ElForm
\tname="account"
\tv-model="account"
\t:zod-schema="accountSchema"
\t:schema-options="{
\t\tfields: {
\t\t\tplan: {
\t\t\t\tprops: {
\t\t\t\t\toptions: [
\t\t\t\t\t\t{ label: 'Starter', value: 'starter' },
\t\t\t\t\t\t{ label: 'Team', value: 'team' },
\t\t\t\t\t\t{ label: 'Enterprise', value: 'enterprise' },
\t\t\t\t\t],
\t\t\t\t},
\t\t\t},
\t\t},
\t}"
/>`;

const formMethods = [
	{ name: 'get(name)', returns: 'Field API | Form API | null', description: 'Returns a field or nested form by local name or path. Use isField/isForm to branch safely.' },
	{ name: 'getField(name)', returns: 'Field API | null', description: 'Returns only a field API by local name or nested path.' },
	{ name: 'getForm(name)', returns: 'Form API | null', description: 'Returns this form when no name is passed, or a nested form by path.' },
	{ name: 'isForm(value)', returns: 'boolean', description: 'Checks whether a value returned from get is a form API.' },
	{ name: 'isField(value)', returns: 'boolean', description: 'Checks whether a value returned from get is a field API.' },
	{ name: 'getValue(name)', returns: 'unknown', description: 'Alias for getFieldValue. Reads a field value from this form scope.' },
	{ name: 'setValue(name, value)', returns: 'void', description: 'Alias for setFieldValue. Writes a field value in this form scope and emits change events.' },
	{ name: 'getFieldValue(name)', returns: 'unknown', description: 'Reads a value by local field name or nested path.' },
	{ name: 'setFieldValue(name, value)', returns: 'void', description: 'Writes a value by local field name or nested path.' },
	{ name: 'getFieldPath(name)', returns: 'string', description: 'Returns the derived dot path for a local field name inside this form scope.' },
	{ name: 'getHtmlName(name)', returns: 'string', description: 'Returns the bracket-style native form name, such as invitees[0][email].' },
	{ name: 'getHtmlId(name)', returns: 'string', description: 'Returns the default generated input ID, such as invitees_0_email.' },
	{ name: 'getFieldState(name)', returns: 'object', description: 'Reads touched, dirty, focused, validating, invalid, visible, disabled, and error state.' },
	{ name: 'setFieldState(name, patch)', returns: 'void', description: 'Applies state to one field. Passing errors also updates the form error object.' },
	{ name: 'validate()', returns: 'Promise<boolean>', description: 'Runs validators for all fields in this form scope.' },
	{ name: 'reset(nextValues)', returns: 'void', description: 'Resets values, errors, and field state for this form scope.' },
	{ name: 'getSubform(name)', returns: 'ElForm API', description: 'Returns a nested subform by local name or path.' },
	{ name: 'getChildren()', returns: 'Array', description: 'Returns the current dynamic children schema.' },
	{ name: 'setChildren(children)', returns: 'void', description: 'Replaces the dynamic children schema and emits update:children and schema-change.' },
	{ name: 'addChild(child, index)', returns: 'object', description: 'Inserts a schema node into the dynamic children list.' },
	{ name: 'removeChild(match)', returns: 'object | null', description: 'Removes a schema node by index, id, or name.' },
	{ name: 'replaceChild(match, child)', returns: 'object', description: 'Replaces a schema node, or appends it when no match is found.' },
	{ name: 'addSubform(path, children, options)', returns: 'object', description: 'Adds a nested ElForm schema node and optionally seeds its matching data path.' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage :name="doc.name" :tagline="doc.description" :tag="doc.tag">
			<DocSection eyebrow="Purpose" title="A provider for fields">
				<div class="space-y-3 text-sm leading-6 text-muted-foreground">
					<p>
						ElForm provides a field store to its children. Inputs with a
						<code class="font-mono text-foreground">name</code> register themselves,
						write into the form value, and report validation errors back to the form.
					</p>
					<p>
						Root forms own the data. Subforms scope child paths, so
						<code class="font-mono text-foreground">invitees.0.email</code>
						can be read, changed, and validated from the top-level form API.
					</p>
					<p>
						The global <code class="font-mono text-foreground">forms</code> registry
						is plain Vue state and integrates neatly with Pinia. A Pinia store can own
						the model value, while <code class="font-mono text-foreground">ElForm</code>
						continues to provide field registration, validation, and path helpers.
					</p>
				</div>
			</DocSection>

			<DocSection eyebrow="Demo" title="Child values and errors">
				<Example
					:source="AccountFormSrc"
					filename="AccountForm.vue"
					description="The form value is built from named children. Email validates on blur; website validates as the model changes."
				>
					<AccountForm />
				</Example>
			</DocSection>

			<DocSection eyebrow="Server definitions" title="Render fields from children">
				<Example
					:source="ServerDefinedFormSrc"
					filename="ServerDefinedForm.vue"
					description="The children prop accepts a Studio-style component tree. Slot content renders after those programmatic children, so submit buttons and local actions can still be authored normally."
				>
					<ServerDefinedForm />
				</Example>
			</DocSection>

			<DocSection eyebrow="Schema" title="Generate fields from a Zod-like shape">
				<div class="space-y-4">
					<p class="text-sm leading-6 text-muted-foreground">
						ElForm can compile a Zod schema, or a plain Zod-like object, into the
						same children records used by the Studio renderer. The adapter reads the
						data shape, chooses form controls, and keeps slots available for local
						buttons or supporting UI.
					</p>
					<p class="text-sm leading-6 text-muted-foreground">
						The exported
						<code class="font-mono text-foreground">zodSchemaToChildren(schema, options)</code>
						helper is available when an app wants to inspect or store the generated
						children before rendering.
					</p>
					<Example
						:source="ZodSchemaFormSrc"
						filename="ZodSchemaForm.vue"
						description="The schema defines the data shape. schemaOptions customises labels, components, options, and input props without changing the model."
					>
						<ZodSchemaForm />
					</Example>
					<CodeBlock lang="vue" :code="zodCode" />
				</div>
			</DocSection>

			<DocSection eyebrow="API" title="Programmatic updates">
				<Example
					:source="ProgrammaticFormSrc"
					filename="ProgrammaticForm.vue"
					description="Named forms are available through forms[name]. Values can be updated externally and validation can be triggered from code."
				>
					<ProgrammaticForm />
				</Example>
			</DocSection>

			<DocSection eyebrow="Standalone" title="Fields still work without a form">
				<Example
					:source="StandaloneFieldsSrc"
					filename="StandaloneFields.vue"
					description="Field components keep their normal modelValue/update:modelValue contract when they are not connected to ElForm."
				>
					<StandaloneFields />
				</Example>
			</DocSection>

			<DocSection eyebrow="Pinia" title="Use a store as the form model">
				<div class="space-y-4 text-sm leading-6 text-muted-foreground">
					<p>
						When an app already uses Pinia, keep business data in the store and bind
						it to <code class="font-mono text-foreground">ElForm</code> with
						<code class="font-mono text-foreground">v-model</code>. The named form API
						can still be used for validation and programmatic field updates.
					</p>
					<CodeBlock lang="vue" :code="piniaCode" />
				</div>
			</DocSection>

			<DocSection eyebrow="Nested data" title="Subforms and paths">
				<Example
					:source="NestedFormSrc"
					filename="NestedForm.vue"
					description="Nested forms scope field names while the root form owns the full object. Subforms can still be addressed and validated."
				>
					<NestedForm />
				</Example>
			</DocSection>

			<DocSection eyebrow="Dynamic schema" title="Add subforms programmatically">
				<Example
					:source="DynamicInviteesSrc"
					filename="DynamicInvitees.vue"
					description="The form schema can change at runtime. This example keeps top-level invitation settings beside a nested invitees array, then adds slot-provided actions after the generated fields."
				>
					<DynamicInvitees />
				</Example>
			</DocSection>

			<DocSection eyebrow="Events" title="Listen to all child changes">
				<Example
					:source="ChangeEventsSrc"
					filename="ChangeEvents.vue"
					description="The change event fires for child field updates with the field path, current value, values, errors, and form state."
				>
					<ChangeEvents />
				</Example>
			</DocSection>

			<DocSection eyebrow="Methods" title="Control a form from code">
				<div class="space-y-4">
					<p class="text-sm leading-6 text-muted-foreground">
						This example exposes its form API as
						<code class="font-mono text-foreground">window.elementsForm</code>.
						Try
						<code class="font-mono text-foreground">window.elementsForm.get('reviewer.email').setValue('you@example.com')</code>
						in the console.
					</p>
					<Example
						:source="FormMethodsSrc"
						filename="FormMethods.vue"
						description="Use get() for convenient lookup, or getField()/getForm() when you need a precise return type."
					>
						<FormMethods />
					</Example>
				</div>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElForm" />
			</DocSection>

			<ComponentSlots :component="ElForm" />
			<ComponentEvents :component="ElForm" />

			<DocSection title="Methods">
				<div class="overflow-hidden rounded-2xl border border-border">
					<table class="w-full text-left text-sm">
						<thead class="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
							<tr>
								<th class="px-4 py-2 font-medium">Method</th>
								<th class="px-4 py-2 font-medium">Returns</th>
								<th class="px-4 py-2 font-medium">Description</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border">
							<tr v-for="method in formMethods" :key="method.name">
								<td class="px-4 py-3 font-mono text-[12.5px] text-foreground">
									<code>{{ method.name }}</code>
								</td>
								<td class="px-4 py-3 font-mono text-[12.5px] text-muted-foreground">{{ method.returns }}</td>
								<td class="px-4 py-3 text-muted-foreground">{{ method.description }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
