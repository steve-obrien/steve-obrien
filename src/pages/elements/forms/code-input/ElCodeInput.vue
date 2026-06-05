<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import ElField from '../field/ElField.vue';
import { fieldProps } from '../field/fieldProps.js';
import { useField } from '../field/useField.js';

const CODEMIRROR_URL = 'https://esm.sh/codemirror@6.0.1';
const JSON_LANG_URL = 'https://esm.sh/@codemirror/lang-json@6.0.2';
const JS_LANG_URL = 'https://esm.sh/@codemirror/lang-javascript@6.2.2';

defineOptions({
	__doc: {
		name: 'Code input',
		tag: '<ElCodeInput>',
		description: 'A form input for code or structured text. It progressively enhances to CodeMirror from a CDN and falls back to a textarea if loading fails.',
		events: [
			{ name: 'update:modelValue', payload: 'string', description: 'Fired when the code changes.' },
			{ name: 'focus', description: 'Fired when the input receives focus.' },
			{ name: 'blur', description: 'Fired when the input loses focus.' },
		],
	},
});

const props = defineProps({
	...fieldProps,
	modelValue: {
		type: String,
		default: '',
		_edit: { component: 'ElTextareaInput', props: { rows: 8 }, description: 'Code text.' },
	},
	lang: {
		type: String,
		default: 'text',
		_edit: { options: ['text', 'json', 'js', 'html', 'css', 'vue', 'md'], description: 'Language hint for the optional enhanced editor.' },
	},
	rows: {
		type: Number,
		default: 10,
		_edit: { description: 'Textarea fallback rows.' },
	},
	editor: {
		type: Boolean,
		default: true,
		_edit: { description: 'Attempt to load the enhanced editor from the CDN.' },
	},
	_registerField: {
		type: Boolean,
		default: true,
	},
});

const emit = defineEmits(['update:modelValue', 'focus', 'blur']);
const mountEl = ref(null);
const textareaEl = ref(null);
const enhanced = ref(false);
const field = useField(props, emit, { idPrefix: 'el-code-input', register: props._registerField });
const labelId = computed(() => (field.fieldAttrs.value.label ? `${field.id.value}-label` : ''));
let editorView = null;

function update(value) {
	field.onInput(value);
}

function applyEditorAttrs() {
	if (!editorView?.dom) return;
	editorView.dom.id = field.id.value;
	editorView.dom.setAttribute('role', 'textbox');
	editorView.dom.setAttribute('aria-multiline', 'true');
	if (labelId.value) editorView.dom.setAttribute('aria-labelledby', labelId.value);
	else editorView.dom.removeAttribute('aria-labelledby');
	if (field.describedBy.value) editorView.dom.setAttribute('aria-describedby', field.describedBy.value);
	else editorView.dom.removeAttribute('aria-describedby');
	if (field.invalid.value) editorView.dom.setAttribute('aria-invalid', 'true');
	else editorView.dom.removeAttribute('aria-invalid');
}

function focusControl() {
	if (editorView) {
		editorView.focus();
		return;
	}
	textareaEl.value?.focus?.();
}

async function languageExtension(lang) {
	if (lang === 'json') {
		const mod = await import(/* @vite-ignore */ JSON_LANG_URL);
		return mod.json();
	}
	if (['js', 'vue'].includes(lang)) {
		const mod = await import(/* @vite-ignore */ JS_LANG_URL);
		return mod.javascript();
	}
	return [];
}

async function mountEditor() {
	if (!props.editor || field.disabled.value || typeof window === 'undefined') return;
	try {
		if (!mountEl.value) return;
		const cm = await import(/* @vite-ignore */ CODEMIRROR_URL);
		const lang = await languageExtension(props.lang);
		const theme = cm.EditorView.theme({
			'&': {
				backgroundColor: 'var(--background)',
				color: 'var(--foreground)',
				fontSize: '12.5px',
				borderRadius: '0.75rem',
				outline: 'none',
			},
			'.cm-content': {
				fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
				padding: '0.75rem',
			},
			'.cm-scroller': {
				fontFamily: 'inherit',
			},
			'.cm-focused': {
				outline: 'none',
			},
			'.cm-gutters': {
				backgroundColor: 'color-mix(in oklch, var(--secondary) 55%, transparent)',
				color: 'var(--muted-foreground)',
				borderRight: '1px solid var(--border)',
			},
			'.cm-activeLineGutter, .cm-activeLine': {
				backgroundColor: 'color-mix(in oklch, var(--secondary) 55%, transparent)',
			},
		});
		editorView = new cm.EditorView({
			doc: field.value.value,
			parent: mountEl.value,
			extensions: [
				cm.basicSetup,
				lang,
				theme,
				cm.EditorView.editable.of(!field.disabled.value && !field.readOnly.value),
				cm.EditorView.lineWrapping,
				cm.EditorView.updateListener.of((viewUpdate) => {
					if (viewUpdate.docChanged) update(viewUpdate.state.doc.toString());
					if (viewUpdate.focusChanged) {
						if (viewUpdate.view.hasFocus) field.onFocus();
						else field.onBlur();
					}
				}),
			],
		});
		applyEditorAttrs();
		enhanced.value = true;
	} catch {
		enhanced.value = false;
	}
}

watch([labelId, field.describedBy, field.invalid], applyEditorAttrs);

watch(field.value, (value) => {
	if (!editorView) return;
	const current = editorView.state.doc.toString();
	if (current === value) return;
	editorView.dispatch({
		changes: { from: 0, to: current.length, insert: value || '' },
	});
});

onMounted(mountEditor);
onBeforeUnmount(() => {
	editorView?.destroy();
	editorView = null;
});
</script>

<template>
	<ElField v-bind="field.fieldAttrs.value" :chrome="chrome">
		<template #label="{ label, required, htmlFor }">
			<label
				v-if="label"
				:id="labelId || undefined"
				:for="enhanced ? undefined : htmlFor"
				class="block cursor-pointer text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
				@click="enhanced ? focusControl() : undefined"
			>
				{{ label }}
				<span v-if="required" class="text-destructive">*</span>
			</label>
		</template>
		<div class="overflow-hidden rounded-xl border border-input bg-background focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 data-[invalid]:border-destructive data-[invalid]:focus-within:border-destructive data-[invalid]:focus-within:ring-destructive/25" :data-invalid="field.invalid.value ? '' : undefined">
			<div v-show="enhanced" ref="mountEl"></div>
			<textarea
				v-if="!enhanced"
				ref="textareaEl"
				v-bind="field.inputAttrs.value"
				:rows="rows"
				spellcheck="false"
				class="block min-h-40 w-full resize-y bg-background p-3 font-mono text-[12.5px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
				@input="update($event.target.value)"
				@focus="field.onFocus"
				@blur="field.onBlur"
			></textarea>
		</div>
	</ElField>
</template>
