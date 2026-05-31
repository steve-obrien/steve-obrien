---
name: elements
description: Build, edit, or review application UI with the Elements library in this repo. Use when generating Vue UI with @elements/vue, creating editable Studio specs, composing Elements blocks/components/forms/headless primitives, adding Elements components or docs metadata, or replacing custom UI behavior with Elements primitives.
---

# Elements

Elements is the house UI system for app-like interfaces built by humans and AI. Prefer its blocks, Vue components, headless primitives, Studio specs, and theme tokens before inventing custom UI behavior.

## Workflow

1. Classify the screen: dashboard, chat, mail, form, login, application shell, settings, detail, or custom.
2. Start from the closest block or example under `src/pages/elements/blocks` when the request matches a common app pattern.
3. Compose with `@elements/vue` components before writing custom markup.
4. Use props for behavior and classes for layout, spacing, and small visual adjustments.
5. Use semantic theme utilities, not raw colors, unless defining a theme.
6. Return a Studio spec when the UI should remain visually editable.
7. Validate by running the app or build and checking the changed route at desktop and mobile sizes.

## References

Read only what the task needs:

- `public/llms.txt`: terse public AI contract.
- `src/pages/elements/ai/Index.vue`: strategy and AI-facing examples.
- `src/pages/elements/theming/Index.vue`: token names and color usage.
- `src/pages/elements/component-spec/Index.vue`: discovery, `__doc`, `_edit`, and Studio spec contracts.
- `src/pages/elements/forms/Index.vue`: form field architecture overview.
- `src/pages/elements/lib/vue/index.js`: public Vue export surface.
- `src/pages/elements/lib/headless/index.js`: headless custom element registration.

## Imports

Use Vue components from `@elements/vue`:

```js
import {
	ElButton,
	ElCard,
	ElCombobox,
	ElForm,
	ElTextInput,
} from '@elements/vue';
```

Use headless custom elements by importing `@elements/headless`; Vite treats tags beginning with `element-` as custom elements.

## Component Choice

- Use blocks for complete screens: dashboard, chat, mail, forms, login, and application layout.
- Use `ElCard` for contained app surfaces and grouped content.
- Use `ElButton` for actions; set `variant`, `size`, `loading`, and `disabled` with props.
- Use `ElDialog`, `ElDrawer`, `ElPopover`, `ElDropdown`, `ElMenu`, `ElContextMenu`, and `ElCommandPalette` instead of recreating overlays, focus handling, or keyboard navigation.
- Use `ElTabs`, `ElAccordion`, and `ElTreeView` for structured navigation and disclosure.
- Use `ElToastStack`, `ElToastItem`, and `useToasts` for notifications.
- Use `ElNativeSelect` for small native option lists, `ElListbox` for custom single-choice lists, `ElCombobox` for search plus committed selection, and `ElAutocomplete` for free text with suggestions.
- Use `ElCalendar` for month-grid date picking and `ElDatePicker` for typed date entry with a popover calendar.
- Use `ElCodeInput` for prompts, snippets, templates, and structured text; use `ElJsonInput` for parsed JSON values; use `ElJsonListInput` for schema-aware arrays such as options, commands, menu rows, and inspector data.

## Forms

Form-capable controls should use the shared field contract. Do not duplicate label, description, errors, required state, ids, or validation plumbing.

```vue
<script setup>
import { ElField, fieldProps, useField } from '@elements/vue';

const props = defineProps({
	...fieldProps,
	type: { type: String, default: 'text' },
});
const emit = defineEmits(['update:modelValue', 'focus', 'blur']);
const field = useField(props, emit, {
	type: props.type,
	defaultValue: '',
});
</script>

<template>
	<ElField v-bind="field.fieldAttrs.value" :chrome="chrome">
		<input
			v-bind="field.inputAttrs.value"
			:type="type"
			class="el-input"
			@input="field.onInput($event.target.value)"
			@focus="field.onFocus"
			@blur="field.onBlur"
		>
	</ElField>
</template>
```

Use local field names only. `ElForm` derives nested dot paths, native names, ids, validation state, and submit payloads.

## Studio Specs

Return a Studio spec when generated UI should be editable later. A spec is a UI tree, not a component discovery record.

```json
{
	"id": "account-settings",
	"label": "Account settings",
	"component": "ElCard",
	"props": {
		"padding": "lg",
		"class": "w-full max-w-2xl"
	},
	"children": [
		{
			"id": "email",
			"label": "Email input",
			"component": "ElTextInput",
			"props": {
				"label": "Email address",
				"placeholder": "you@example.com"
			}
		}
	]
}
```

Give every generated node a stable `id` and human `label`. Use component export names such as `ElTextInput` or ordinary HTML tags such as `section`, `h2`, and `p`. Avoid anonymous layers and large unstructured HTML blobs when a spec would preserve intent.

## Theme Tokens

Use token utilities from the theming docs:

- Surfaces: `bg-background`, `bg-card`, `bg-popover`, `bg-primary`, `bg-secondary`, `bg-muted`, `bg-accent`, `bg-success`, `bg-warning`, `bg-destructive`.
- Text: `text-foreground`, `text-card-foreground`, `text-popover-foreground`, `text-primary-foreground`, `text-secondary-foreground`, `text-muted-foreground`, `text-accent-foreground`, `text-success-foreground`, `text-warning-foreground`, `text-destructive-foreground`.
- Edges and focus: `border-border`, `border-input`, `divide-border`, `ring-ring`, `focus-visible:ring-ring`.

Do not invent token names. Do not use raw hex, RGB, or OKLCH values in component markup.

## Adding Components

Add Vue components as `El*.vue` under one of:

- `src/pages/elements/components/<slug>/`
- `src/pages/elements/forms/<slug>/`
- `src/pages/elements/visual/<slug>/`

Add an `Index.vue` beside the component for bespoke docs. If no `Index.vue` exists, generated docs use inspected metadata. Export public Vue components from `src/pages/elements/lib/vue/index.js`.

Use `defineOptions({ __doc: ... })` for docs and Studio metadata:

```vue
<script setup>
defineOptions({
	__doc: {
		name: 'Text input',
		tag: '<ElTextInput>',
		description: 'A labelled single-line text field.',
		icon: 'M5 7h14M12 7v10M8 17h8',
		studio: {
			group: 'Forms',
			icon: 'T',
		},
		events: [
			{ name: 'update:modelValue', payload: 'string', description: 'Fired when text changes.' },
		],
	},
});
</script>
```

Use prop `_edit` metadata for Studio inspector editors. Put editor component names in `_edit.component`.

## Avoid

- Recreating dropdown, dialog, drawer, popover, menu, combobox, autocomplete, toast, or keyboard navigation behavior by hand.
- Returning custom markup when an Elements component or block already represents the intent.
- Using raw colors, invented token names, or one-off visual systems.
- Creating Studio specs without stable ids and clear labels.
- Editing discovery internals unless the task is about the component system itself.
