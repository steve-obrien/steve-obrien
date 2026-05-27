# Forms Approach

Status: current architecture plus forward direction. The shared field contract, parent `ElForm` provider, nested fieldset forms, dynamic children, Zod-like schema generation, and programmatic form registry are implemented. Async server validation, richer validator editing, conditional fields, and backend data-type mapping are still future work.

## Goal

Elements form components should feel simple when used directly, but should also be able to participate in a larger form system.

The short-term goal was to reduce repeated field props across inputs. That first phase is now implemented with `fieldProps`, `useField`, `FieldChrome`, and `ElForm`.

The long-term goal is an active-field framework where a field can understand:

- its UI state
- its validation rules
- its value transformers
- its backend data type
- how to move data between user input, validation, storage, and display

This document captures the current contract and the longer-term active-field direction.

## Current Pattern

Form components are split into three responsibilities:

- `fieldProps`: the shared public prop contract for form-capable controls.
- `useField`: behaviour and state wiring; it talks to the nearest `ElForm` through Vue provide/inject when one exists.
- `ElField` / `ElFieldChrome`: the default visual chrome for labels, descriptions, required markers, and errors.

The control itself should mostly be presentation and interaction.

Example:

```vue
<script setup>
import { ElFieldChrome, fieldProps, useField } from '@elements/vue';

const props = defineProps({
	...fieldProps,
	type: { type: String, default: 'text' },
});
const emit = defineEmits(['update:modelValue', 'focus', 'blur']);
const field = useField(props, emit, { idPrefix: 'my-input' });
</script>

<template>
	<ElFieldChrome :field-attrs="field.fieldAttrs.value" :chrome="chrome">
	<input
		v-bind="field.inputAttrs.value"
		:type="type"
		class="el-input"
		@input="field.onInput($event.target.value)"
		@focus="field.onFocus"
		@blur="field.onBlur"
	/>
	</ElFieldChrome>
</template>
```

This keeps labels, descriptions, required markers, invalid state, and control chrome consistent while avoiding repeated prop and computed-value plumbing.

Packaged controls should support:

- standalone `v-model`
- registration with the nearest parent `ElForm`
- derived dot paths, native HTML names, and IDs
- validation state and error display
- `chrome="field"` by default
- `chrome="none"` for custom layouts

## Field Contract

A field should represent one named chunk of form data.

Current shared field-level props:

```js
{
	id: String,
	name: String,
	label: String,
	description: String,
	placeholder: String,
	modelValue: unknown,
	required: Boolean,
	errors: Object,
	visible: Boolean,
	disabled: Boolean,
	readOnly: Boolean,
	validators: Array,
	validateOnBlur: Boolean,
	chrome: 'field' | 'none',
}
```

Suggested field state:

```js
{
	focused: Boolean,
	touched: Boolean,
	dirty: Boolean,
	valid: Boolean,
	invalid: Boolean,
	validating: Boolean,
	errors: Object,
}
```

Definitions:

- `focused`: true while the control inside the field has focus.
- `touched`: true after the field has been focused and blurred at least once.
- `dirty`: true after the value changes from the initial value, or after input is received.
- `validating`: true while async validators are running.
- `errors`: an object keyed by validator name or error path.
- `visible`: false hides the field but keeps it in the form model unless explicitly removed.
- `readOnly`: value is visible but cannot be changed.
- `disabled`: value is unavailable to the user and may be omitted from native submission.

## Shared Field Props

Form inputs should not define the common prop block manually. They should spread the shared prop definition:

```js
export const fieldProps = {
	id: { type: String, default: '' },
	name: { type: String, default: '' },
	label: { type: String, default: '' },
	description: { type: String, default: '' },
	placeholder: { type: String, default: '' },
	modelValue: { default: undefined },
	required: { type: Boolean, default: false },
	disabled: { type: Boolean, default: false },
	readOnly: { type: Boolean, default: false },
	invalid: { type: Boolean, default: false },
	errors: { type: Object, default: () => ({}) },
	validators: { type: Array, default: () => [] },
	validateOnBlur: { type: Boolean, default: true },
	chrome: { type: String, default: 'field' },
};
```

Components can extend it:

```js
const props = defineProps({
	...fieldProps,
	type: { type: String, default: 'text' },
});
```

This gives every form input a consistent public shape.

## Field Composable

`useField` resolves field state and DOM wiring:

```js
useField(props, emit, options)
```

Responsibilities:

- generate a stable fallback `id`
- resolve the local `name`
- expose the derived dot `path`
- expose the derived native HTML `name`
- expose the derived native HTML `id`
- normalize `modelValue`
- expose `inputAttrs`
- expose `fieldProps`
- track `focused`
- track `touched`
- track `dirty`
- merge local errors with form-provided errors
- run validators
- communicate value changes to a parent form if present

Current return shape:

```js
const field = useField(props, emit, {
	type: 'email',
	defaultValue: '',
});

field.id;
field.name;
field.path;
field.htmlName;
field.htmlId;
field.value;
field.errors;
field.invalid;
field.focused;
field.touched;
field.dirty;
field.inputAttrs;
field.fieldAttrs;
field.setFieldState(patch);
field.onInput(value);
field.onFocus();
field.onBlur();
field.validate();
```

`name` is the local field segment. The full path is derived from the form hierarchy and should not be manually set on the field. For example, an `email` field inside an `invitees.0` subform has the dot path `invitees.0.email`, the native HTML input name `invitees[0][email]`, and the default input ID `invitees_0_email`.

An input component then becomes mostly presentation:

```vue
<ElFieldChrome :field-attrs="field.fieldAttrs.value" :chrome="chrome">
	<input
		v-bind="field.inputAttrs.value"
		class="el-input"
		@input="field.onInput($event.target.value)"
		@focus="field.onFocus"
		@blur="field.onBlur"
	/>
</ElFieldChrome>
```

`ElFieldChrome` is a small bridge used by packaged controls. It renders `ElField` when `chrome !== 'none'`, renders only the control when `chrome="none"`, and exposes a `chrome` slot for components that want a custom wrapper without giving up the shared field attrs.

`ElField` remains visual chrome, not form behaviour. It now exposes scoped `label`, default, `errors`, and `description` slots so authors can replace parts of the wrapper while keeping the basic field contract.

## Form Context

A form should group data and state for many fields.

Possible component/composable:

```js
useForm()
```

or:

```vue
<ElForm v-model="data">
	<ElTextInput name="firstName" />
</ElForm>
```

The form context can be provided with Vue `provide/inject`.

Field components can work in two modes:

- standalone with `v-model`
- inside a form context with `name`

Forms should integrate well with Pinia. If an app already uses Pinia, the store can own the model value and bind it to `ElForm` with `v-model`; the form instance can still provide field registration, validation, path helpers, and programmatic updates through the named `forms` registry. If Pinia is not used, the parent form component acts as the data provider with ordinary Vue state.

When inside a form context, a field can register itself:

```js
form.registerField({
	name,
	type,
	initialValue,
	validators,
	transformers,
});
```

The form owns:

- data object
- field registry
- field state
- form-level validity
- submission state
- validation lifecycle
- nested form contexts

Suggested provider contract:

```js
{
	values,
	fieldStates,
	getValue(name),
	setValue(name, value),
	getFieldState(name),
	setFieldState(name, patch),
	registerField(field),
	unregisterField(name),
}
```

Fields should only depend on this contract, not on Pinia directly.

## Nested Forms And Array Fields

Forms should allow sub forms, but they must not create nested native `<form>` elements. A root `ElForm` renders a native `<form>`. An `ElForm` inside another form context automatically renders as a `<fieldset>` while keeping the same scoped form API.

Examples:

- a billing address inside a checkout form
- a list of contacts
- repeatable fields such as phone numbers
- a toggle that reveals additional fields

Suggested model:

```js
{
	name: 'contacts',
	type: 'array',
	fields: [
		{
			name: '0',
			type: 'object',
			fields: {
				email: 'sam@example.com',
				role: 'admin',
			},
		},
	],
}
```

Each subform contributes its local name to the derived path. A root form owns the full data object, and nested forms act as path scopes. That means a field named `email` inside an `invitees.0` subform writes to `invitees.0.email`, while its rendered input receives the native HTML name `invitees[0][email]` and the default ID `invitees_0_email`.

The same active-field rules should apply at every level.

## Validators

Validators should be attachable at multiple levels:

- field component defaults
- field props
- form schema
- backend-provided schema
- Studio inspector configuration

A validator should be a small object or function.

Possible object shape:

```js
{
	name: 'email',
	message: 'Enter a valid email address.',
	validate(value, context) {
		return true;
	},
}
```

Async validators should be allowed:

```js
{
	name: 'available',
	message: 'This value is already in use.',
	async validate(value, context) {
		return await context.api.isAvailable(value);
	},
}
```

Validator results should normalize to:

```js
{
	valid: Boolean,
	message: String,
	code: String,
	meta: Object,
}
```

Validation timing:

- `validateOnBlur`: default true
- `validateOnInput`: useful for live feedback
- `validateOnSubmit`: always required before submit

Async validators need cancellation or stale-result protection.

## Validator Input For Studio

Studio should eventually expose a validator editor.

Possible `ElValidatorInput` responsibilities:

- choose validators from a known registry
- configure validator props
- attach validators to a field
- show whether a validator runs client-side, server-side, or both

Example configured validators:

```js
[
	{ name: 'required' },
	{ name: 'email' },
	{ name: 'maxLength', props: { max: 120 } },
	{ name: 'serverUnique', props: { endpoint: '/api/users/unique-email' } },
]
```

This fits the current Studio inspector pattern because validators are just a prop.

## Prepackaged Field Components

Some inputs should exist as convenience components with default presentation, type, validators, and transformers.

Examples:

- `ElEmailInput`
- `ElUrlInput`
- `ElPhoneInput`
- `ElSearchInput`
- `ElMoneyInput`
- `ElDateInput`

These should probably wrap a more primitive text field, not duplicate it.

Possible layering:

```txt
ElField
	Shared label, description, error display, required marker

ElTextInput
	Generic text entry with field contract

ElEmailInput
	Text input with type=email, autocomplete=email, email validator

ElUrlInput
	Text input with type=url, URL validator and optional normalization
```

This gives app builders fast defaults without making the core text input too clever.

## Backend Data Types

Longer term, a field may map to a backend data type.

Examples:

- string
- text
- integer
- decimal
- boolean
- date
- datetime
- json
- enum
- relation
- array
- object
- file

The field should know how to:

- accept HTML/user input
- validate user input
- transform user input to an application value
- transform application value to a storage value
- transform storage value back to a display value

This is the active-field idea.

Possible field definition:

```js
{
	name: 'price',
	label: 'Price',
	component: 'ElMoneyInput',
	dataType: 'decimal',
	storageType: 'decimal(10,2)',
	transformers: ['trim', 'emptyStringToNull', 'currencyToDecimal'],
	validators: [
		{ name: 'required' },
		{ name: 'min', props: { value: 0 } },
	],
}
```

## Server-Side Assembly

Eventually, forms may be assembled on the server.

The server could provide:

- fields
- labels
- defaults
- validation rules
- backend data types
- transformers
- permissions
- conditional visibility rules
- relation options

The client renders the form from that schema, then posts structured data back.

The server form class can ask each field to:

1. read submitted input
2. validate
3. transform to domain data
4. transform to storage data
5. persist
6. hydrate stored data back into display data

This mirrors the previous PHP-managed approach, but keeps the browser field components useful and editable.

## Conditional Fields

Fields may need to observe other fields.

Examples:

- a toggle that reveals a sub form
- a country select that changes postcode validation
- a payment method select that changes required fields
- a checkbox that enables an email preferences section

Avoid coupling fields directly to each other where possible.

Prefer field expressions or form-level watchers:

```js
{
	name: 'companyDetails',
	visibleWhen: { field: 'accountType', equals: 'company' },
}
```

Later this can become a richer expression language if needed.

## Implemented Component Coverage

The ordinary form controls now use the shared field contract:

- text, textarea, number, password
- email and URL convention wrappers
- native select, select input, listbox, radio group, combobox, autocomplete
- checkbox, toggle, toggle button, toggle button group
- calendar, color, code, JSON, JSON list, position input

Wrapper components such as `ElEmailInput` and `ElUrlInput` delegate to `ElTextInput` rather than registering an extra field. Composite components such as `ElJsonInput` and `ElJsonListInput` own the form field themselves and disable internal child registration where needed.

## Questions To Resolve

1. Should validators become serializable Studio records, app functions, or both?
2. Should server validators be represented as validators, transformers, or separate field actions?
3. Should field visibility remove data from the form result, or only hide the input?
4. Should active-field data types live in component docs, Studio metadata, field props, or a future server schema?
5. How should conditional field expressions be represented so they work in Studio, AI-generated schemas, and server-provided forms?
6. Should form submission serialize hidden JSON/list fields as JSON strings, or should native submission be treated as a secondary fallback?
