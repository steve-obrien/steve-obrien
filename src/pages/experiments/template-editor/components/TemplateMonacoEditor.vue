<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
	modelValue: {
		type: String,
		default: '',
	},
	lang: {
		type: String,
		default: 'text',
	},
	path: {
		type: String,
		default: 'untitled.vue',
	},
	selectedLine: {
		type: Number,
		default: 1,
	},
	hoveredLine: {
		type: Number,
		default: 0,
	},
	readOnly: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(['update:modelValue', 'cursor-line-change', 'hover-line-change', 'ready']);

const mountEl = ref(null);
const loading = ref(true);
const loadError = ref('');

let monacoApi = null;
let editor = null;
let model = null;
let selectedDecorations = [];
let hoveredDecorations = [];
let applyingExternalValue = false;
let resizeObserver = null;
let themeObserver = null;
let cachedMonacoPromise = null;
let lastHoveredLine = 0;

async function loadMonaco() {
	if (cachedMonacoPromise) return cachedMonacoPromise;
	cachedMonacoPromise = Promise.all([
		import('monaco-editor/min/vs/editor/editor.main.css'),
		import('monaco-editor/esm/vs/editor/editor.api'),
		import('monaco-editor/esm/vs/editor/editor.worker?worker'),
	]).then(([, monaco, editorWorker]) => {
		configureMonacoWorkers({
			editorWorker: editorWorker.default,
		});
		defineThemes(monaco);
		registerTemplateVueLanguage(monaco);
		return monaco;
	});
	return cachedMonacoPromise;
}

function configureMonacoWorkers(workers) {
	if (typeof window === 'undefined') return;
	const existing = window.MonacoEnvironment || {};
	if (existing.__templateEditorWorkers) return;

	window.MonacoEnvironment = {
		...existing,
		__templateEditorWorkers: true,
		getWorker() {
			return new workers.editorWorker();
		},
	};
}

function defineThemes(monaco) {
	monaco.editor.defineTheme('template-editor-light', {
		base: 'vs',
		inherit: true,
		rules: [
			{ token: 'tag', foreground: '7c3aed' },
			{ token: 'tag.html', foreground: '7c3aed' },
			{ token: 'delimiter.html', foreground: '52525b' },
			{ token: 'attribute.name', foreground: '0369a1' },
			{ token: 'attribute.name.html', foreground: '0369a1' },
			{ token: 'attribute.value', foreground: '047857' },
			{ token: 'attribute.value.html', foreground: '047857' },
			{ token: 'string', foreground: '047857' },
			{ token: 'comment', foreground: '71717a', fontStyle: 'italic' },
			{ token: 'delimiter', foreground: '52525b' },
			{ token: 'delimiter.bracket', foreground: '7c3aed' },
			{ token: 'keyword', foreground: 'be123c' },
			{ token: 'number', foreground: 'c2410c' },
			{ token: 'variable', foreground: '2563eb' },
		],
		colors: {
			'editor.background': '#ffffff',
			'editor.foreground': '#171717',
			'editorGutter.background': '#ffffff',
			'editorLineNumber.foreground': '#737373',
			'editorCursor.foreground': '#262626',
			'editor.selectionBackground': '#d4d4d8',
			'editor.inactiveSelectionBackground': '#e5e5e5',
			'editor.lineHighlightBackground': '#f5f5f5',
		},
	});
	monaco.editor.defineTheme('template-editor-dark', {
		base: 'vs-dark',
		inherit: true,
		rules: [
			{ token: 'tag', foreground: 'c4b5fd' },
			{ token: 'tag.html', foreground: 'c4b5fd' },
			{ token: 'delimiter.html', foreground: 'a1a1aa' },
			{ token: 'attribute.name', foreground: '7dd3fc' },
			{ token: 'attribute.name.html', foreground: '7dd3fc' },
			{ token: 'attribute.value', foreground: '86efac' },
			{ token: 'attribute.value.html', foreground: '86efac' },
			{ token: 'string', foreground: '86efac' },
			{ token: 'comment', foreground: 'a1a1aa', fontStyle: 'italic' },
			{ token: 'delimiter', foreground: 'a1a1aa' },
			{ token: 'delimiter.bracket', foreground: 'c4b5fd' },
			{ token: 'keyword', foreground: 'fda4af' },
			{ token: 'number', foreground: 'fdba74' },
			{ token: 'variable', foreground: '93c5fd' },
		],
		colors: {
			'editor.background': '#262626',
			'editor.foreground': '#fafafa',
			'editorGutter.background': '#262626',
			'editorLineNumber.foreground': '#a3a3a3',
			'editorCursor.foreground': '#fafafa',
			'editor.selectionBackground': '#525252',
			'editor.inactiveSelectionBackground': '#404040',
			'editor.lineHighlightBackground': '#333333',
		},
	});
}

function registerTemplateVueLanguage(monaco) {
	const languageId = 'template-vue';
	if (monaco.languages.getLanguages().some((language) => language.id === languageId)) return;

	monaco.languages.register({
		id: languageId,
		aliases: ['Vue template', 'vue'],
		extensions: ['.vue'],
	});
	monaco.languages.setLanguageConfiguration(languageId, {
		comments: {
			blockComment: ['<!--', '-->'],
		},
		brackets: [
			['<', '>'],
			['{', '}'],
			['[', ']'],
			['(', ')'],
		],
		autoClosingPairs: [
			{ open: '<', close: '>' },
			{ open: '"', close: '"' },
			{ open: "'", close: "'" },
			{ open: '{', close: '}' },
			{ open: '[', close: ']' },
			{ open: '(', close: ')' },
		],
	});
	monaco.languages.setMonarchTokensProvider(languageId, {
		defaultToken: '',
		tokenizer: {
			root: [
				[/<!--/, 'comment', '@comment'],
				[/<\/?[\w:-]+/, 'tag', '@tag'],
				[/{{/, 'delimiter.bracket', '@mustache'],
				[/\b(const|let|var|import|from|defineProps|return|if|else|for|in|of|true|false|null|undefined)\b/, 'keyword'],
				[/"[^"]*"/, 'string'],
				[/'[^']*'/, 'string'],
				[/\b\d+(?:\.\d+)?\b/, 'number'],
			],
			tag: [
				[/\s+/, ''],
				[/\/?>/, 'delimiter.html', '@pop'],
				[/[\w:@.#-]+(?=\=)/, 'attribute.name'],
				[/[\w:@.#-]+/, 'attribute.name'],
				[/=/, 'delimiter'],
				[/"[^"]*"/, 'attribute.value'],
				[/'[^']*'/, 'attribute.value'],
				[/{{/, 'delimiter.bracket', '@mustache'],
			],
			mustache: [
				[/}}/, 'delimiter.bracket', '@pop'],
				[/\b(const|let|var|return|if|else|for|in|of|true|false|null|undefined)\b/, 'keyword'],
				[/[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*/, 'variable'],
				[/"[^"]*"/, 'string'],
				[/'[^']*'/, 'string'],
				[/\b\d+(?:\.\d+)?\b/, 'number'],
			],
			comment: [
				[/-->/, 'comment', '@pop'],
				[/[^-]+/, 'comment'],
				[/./, 'comment'],
			],
		},
	});
}

async function mountEditor() {
	if (!mountEl.value || typeof window === 'undefined') return;
	try {
		loading.value = true;
		monacoApi = await loadMonaco();
		model = monacoApi.editor.createModel(props.modelValue || '', languageFor(props.lang));
		editor = monacoApi.editor.create(mountEl.value, {
			model,
			automaticLayout: true,
			contextmenu: true,
			detectIndentation: false,
			fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
			fontLigatures: true,
			fontSize: 12.5,
			insertSpaces: false,
			lineHeight: 20,
			lineNumbersMinChars: 3,
			minimap: { enabled: false },
			padding: { top: 12, bottom: 12 },
			readOnly: props.readOnly,
			renderLineHighlight: 'all',
			scrollBeyondLastLine: false,
			stickyScroll: { enabled: false },
			tabSize: 4,
			theme: themeName(),
			wordWrap: 'on',
		});

		editor.onDidChangeModelContent(() => {
			if (!model || applyingExternalValue) return;
			emit('update:modelValue', model.getValue());
		});
		editor.onDidChangeCursorPosition((event) => {
			emit('cursor-line-change', event.position.lineNumber);
		});
		editor.onMouseMove((event) => {
			const lineNumber = event.target?.position?.lineNumber || 0;
			if (lineNumber === lastHoveredLine) return;
			lastHoveredLine = lineNumber;
			emit('hover-line-change', lineNumber);
		});
		editor.onMouseLeave(() => {
			if (!lastHoveredLine) return;
			lastHoveredLine = 0;
			emit('hover-line-change', 0);
		});

		resizeObserver = new ResizeObserver(() => editor?.layout());
		resizeObserver.observe(mountEl.value);
		themeObserver = new MutationObserver(() => monacoApi?.editor.setTheme(themeName()));
		themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

		updateSelectedLine(props.selectedLine);
		updateHoveredLine(props.hoveredLine);
		loading.value = false;
		emit('ready');
	} catch (error) {
		console.error('[template-editor] Monaco failed to load', error);
		loadError.value = error instanceof Error ? error.message : 'Could not load Monaco editor.';
		loading.value = false;
	}
}

function languageFor(lang) {
	if (lang === 'vue') return 'template-vue';
	if (lang === 'js') return 'javascript';
	if (lang === 'md') return 'markdown';
	return lang || 'text';
}

function themeName() {
	if (typeof document === 'undefined') return 'template-editor-light';
	return document.documentElement.dataset.theme === 'dark'
		? 'template-editor-dark'
		: 'template-editor-light';
}

function updateSelectedLine(value) {
	if (!editor || !monacoApi || !model) return;
	const lineNumber = clampLine(value || 1);
	selectedDecorations = editor.deltaDecorations(selectedDecorations, [
		{
			range: new monacoApi.Range(lineNumber, 1, lineNumber, 1),
			options: {
				isWholeLine: true,
				className: 'template-monaco-selected-line',
				linesDecorationsClassName: 'template-monaco-selected-gutter',
			},
		},
	]);
}

function updateHoveredLine(value) {
	if (!editor || !monacoApi || !model) return;
	const lineNumber = Number(value) || 0;
	if (!lineNumber) {
		hoveredDecorations = editor.deltaDecorations(hoveredDecorations, []);
		return;
	}
	const clampedLine = clampLine(lineNumber);
	hoveredDecorations = editor.deltaDecorations(hoveredDecorations, [
		{
			range: new monacoApi.Range(clampedLine, 1, clampedLine, 1),
			options: {
				isWholeLine: true,
				className: 'template-monaco-hovered-line',
				linesDecorationsClassName: 'template-monaco-hovered-gutter',
			},
		},
	]);
}

function clampLine(value) {
	const lineCount = model?.getLineCount() || 1;
	return Math.min(Math.max(Number(value) || 1, 1), lineCount);
}

function revealLine(value = props.selectedLine) {
	if (!editor) return;
	const lineNumber = clampLine(value || 1);
	updateSelectedLine(lineNumber);
	editor.revealLineInCenterIfOutsideViewport(lineNumber);
}

function layout() {
	editor?.layout();
}

function focus() {
	editor?.focus();
}

function updateModelValue(value) {
	if (!model) return;
	const nextValue = value || '';
	if (model.getValue() === nextValue) return;
	applyingExternalValue = true;
	model.setValue(nextValue);
	applyingExternalValue = false;
	updateSelectedLine(props.selectedLine);
	updateHoveredLine(props.hoveredLine);
}

watch(() => props.modelValue, updateModelValue);

watch(() => props.lang, (lang) => {
	if (!monacoApi || !model) return;
	monacoApi.editor.setModelLanguage(model, languageFor(lang));
});

watch(() => props.readOnly, (readOnly) => {
	editor?.updateOptions({ readOnly });
});

watch(() => props.selectedLine, (line) => {
	updateSelectedLine(line);
	nextTick(() => revealLine(line));
});

watch(() => props.hoveredLine, updateHoveredLine);

onMounted(mountEditor);

onBeforeUnmount(() => {
	resizeObserver?.disconnect();
	themeObserver?.disconnect();
	editor?.dispose();
	model?.dispose();
	editor = null;
	model = null;
});

defineExpose({
	focus,
	layout,
	revealLine,
});
</script>

<template>
	<div class="template-monaco-editor relative h-full min-h-0 overflow-hidden bg-card text-card-foreground">
		<div v-show="!loadError" ref="mountEl" class="h-full min-h-0"></div>
		<textarea
			v-if="loadError"
			class="block h-full min-h-0 w-full resize-none bg-card p-3 font-mono text-[12.5px] leading-relaxed text-card-foreground outline-none placeholder:text-muted-foreground"
			spellcheck="false"
			:value="modelValue"
			@input="$emit('update:modelValue', $event.target.value)"
		></textarea>
		<div v-if="loading && !loadError" class="absolute inset-0 grid place-items-center bg-card text-xs text-muted-foreground">
			Loading Monaco...
		</div>
	</div>
</template>

<style scoped>
.template-monaco-editor :deep(.monaco-editor),
.template-monaco-editor :deep(.monaco-editor-background),
.template-monaco-editor :deep(.monaco-editor .margin) {
	background-color: var(--card) !important;
}

.template-monaco-editor :deep(.monaco-editor),
.template-monaco-editor :deep(.monaco-editor .monaco-editor-background),
.template-monaco-editor :deep(.monaco-editor .inputarea.ime-input) {
	color: var(--foreground);
}

.template-monaco-editor :deep(.line-numbers) {
	color: var(--muted-foreground) !important;
}

.template-monaco-editor :deep(.template-monaco-hovered-line) {
	background: color-mix(in oklch, var(--accent) 60%, transparent);
}

.template-monaco-editor :deep(.template-monaco-hovered-gutter) {
	background: color-mix(in oklch, var(--accent) 75%, transparent);
}

.template-monaco-editor :deep(.template-monaco-selected-line) {
	background: color-mix(in oklch, var(--ring) 22%, transparent);
	box-shadow: inset 3px 0 0 var(--ring);
}

.template-monaco-editor :deep(.template-monaco-selected-gutter) {
	background: color-mix(in oklch, var(--ring) 30%, transparent);
}
</style>
