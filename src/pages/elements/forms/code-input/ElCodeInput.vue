<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import ElField from '../field/ElField.vue';

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
	modelValue: {
		type: String,
		default: '',
		_edit: { component: 'ElTextareaInput', props: { rows: 8 }, description: 'Code text.' },
	},
	id: {
		type: String,
		default: '',
		_edit: { description: 'ID applied to the fallback textarea and used by the label.' },
	},
	name: {
		type: String,
		default: '',
		_edit: { description: 'Form field name. Defaults to the generated id.' },
	},
	label: {
		type: String,
		default: '',
		_edit: { description: 'Visible field label.' },
	},
	description: {
		type: String,
		default: '',
		_edit: { description: 'Optional helper copy below the label.' },
	},
	placeholder: {
		type: String,
		default: '',
		_edit: { description: 'Textarea placeholder used before the editor loads.' },
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
	disabled: {
		type: Boolean,
		default: false,
		_edit: { description: 'Disable editing.' },
	},
	invalid: {
		type: Boolean,
		default: false,
		_edit: { description: 'Mark the editor invalid.' },
	},
	required: {
		type: Boolean,
		default: false,
		_edit: { description: 'Show the required marker in the label.' },
	},
});

const emit = defineEmits(['update:modelValue', 'focus', 'blur']);
const mountEl = ref(null);
const enhanced = ref(false);
const generatedId = `el-code-input-${useId()}`;
const inputId = computed(() => props.id || generatedId);
const inputName = computed(() => props.name || inputId.value);
let editorView = null;

function update(value) {
	emit('update:modelValue', value);
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
	if (!props.editor || props.disabled || typeof window === 'undefined') return;
	try {
		if (!mountEl.value) return;
		const cm = await import(/* @vite-ignore */ CODEMIRROR_URL);
		const lang = await languageExtension(props.lang);
		const theme = cm.EditorView.theme({
			'&': {
				minHeight: `${Math.max(props.rows, 4) * 1.65 + 2.5}rem`,
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
			doc: props.modelValue,
			parent: mountEl.value,
			extensions: [
				cm.basicSetup,
				lang,
				theme,
				cm.EditorView.editable.of(!props.disabled),
				cm.EditorView.lineWrapping,
				cm.EditorView.updateListener.of((viewUpdate) => {
					if (viewUpdate.docChanged) update(viewUpdate.state.doc.toString());
					if (viewUpdate.focusChanged) emit(viewUpdate.view.hasFocus ? 'focus' : 'blur');
				}),
			],
		});
		enhanced.value = true;
	} catch {
		enhanced.value = false;
	}
}

watch(() => props.modelValue, (value) => {
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
	<ElField :label="label" :description="description" :html-for="inputId" :invalid="invalid" :required="required">
		<div class="overflow-hidden rounded-xl border border-input bg-background focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 data-[invalid]:border-destructive data-[invalid]:focus-within:border-destructive data-[invalid]:focus-within:ring-destructive/25" :data-invalid="invalid ? '' : undefined">
			<div v-show="enhanced" ref="mountEl"></div>
			<textarea
				v-if="!enhanced"
				:id="inputId"
				:name="inputName"
				:value="modelValue"
				:placeholder="placeholder"
				:rows="rows"
				:disabled="disabled"
				:required="required"
				:aria-invalid="invalid || undefined"
				spellcheck="false"
				class="block min-h-40 w-full resize-y bg-background p-3 font-mono text-[12.5px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
				@input="update($event.target.value)"
				@focus="emit('focus')"
				@blur="emit('blur')"
			></textarea>
		</div>
	</ElField>
</template>
