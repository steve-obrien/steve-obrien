<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { foldingRangesForTemplateSource } from '../lib/templateFolding.js';

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
	externalDropTypes: {
		type: Array,
		default: () => [],
	},
	externalDropEffect: {
		type: String,
		default: 'copy',
	},
});

const emit = defineEmits(['update:modelValue', 'cursor-line-change', 'hover-line-change', 'folding-change', 'drop-insert', 'ready']);

const mountEl = ref(null);
const loading = ref(true);
const loadError = ref('');
const dropActive = ref(false);
const dropAllowed = ref(false);

let monacoApi = null;
let foldingControllerApi = null;
let editor = null;
let model = null;
let selectedDecorations = [];
let hoveredDecorations = [];
let dropDecorations = [];
let applyingExternalValue = false;
let applyingFoldingCommand = false;
let resizeObserver = null;
let themeObserver = null;
let foldingModelDisposable = null;
let dropListenerCleanup = [];
let cachedMonacoPromise = null;
let lastHoveredLine = 0;

async function loadMonaco() {
	if (cachedMonacoPromise) return cachedMonacoPromise;
	cachedMonacoPromise = Promise.all([
		import('monaco-editor/min/vs/editor/editor.main.css'),
		import('monaco-editor/esm/vs/editor/editor.api'),
		import('monaco-editor/esm/vs/editor/contrib/folding/browser/folding'),
		import('monaco-editor/esm/vs/editor/editor.worker?worker'),
	]).then(([, monaco, foldingModule, editorWorker]) => {
		foldingControllerApi = foldingModule.FoldingController;
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
	const languageExists = monaco.languages.getLanguages().some((language) => language.id === languageId);

	if (!languageExists) {
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
	registerTemplateVueFolding(monaco, languageId);
}

function registerTemplateVueFolding(monaco, languageId) {
	const providerKey = '__templateEditorFoldingProvider';
	if (typeof window !== 'undefined' && window[providerKey]) return;
	const provider = monaco.languages.registerFoldingRangeProvider(languageId, {
		provideFoldingRanges(model) {
			return foldingRangesForTemplateSource(model.getValue());
		},
	});
	if (typeof window !== 'undefined') {
		window[providerKey] = provider;
	}
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
			folding: true,
			foldingHighlight: true,
			foldingStrategy: 'auto',
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
			showFoldingControls: 'always',
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
			if (applyingExternalValue || applyingFoldingCommand) return;
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
		bindDropListeners();

		updateSelectedLine(props.selectedLine);
		updateHoveredLine(props.hoveredLine);
		watchFoldingState();
		queueFoldingStateEmit();
		loading.value = false;
		emit('ready');
	} catch (error) {
		console.error('[template-editor] Monaco failed to load', error);
		loadError.value = error instanceof Error ? error.message : 'Could not load Monaco editor.';
		loading.value = false;
	}
}

function bindDropListeners() {
	cleanupDropListeners();
	if (!mountEl.value) return;
	addDropListener('dragover', handleEditorDragOver);
	addDropListener('dragleave', handleEditorDragLeave);
	addDropListener('drop', handleEditorDrop);
}

function addDropListener(type, handler) {
	const element = mountEl.value;
	if (!element) return;
	element.addEventListener(type, handler, { capture: true });
	dropListenerCleanup.push(() => element.removeEventListener(type, handler, { capture: true }));
}

function cleanupDropListeners() {
	dropListenerCleanup.forEach((cleanup) => cleanup());
	dropListenerCleanup = [];
}

function handleEditorDragOver(event) {
	if (!canAcceptExternalDrop(event)) return;
	event.preventDefault();
	event.stopPropagation();
	const text = externalDropText(event);
	const plan = dropPlanForPosition(text, positionFromDragEvent(event));
	event.dataTransfer.dropEffect = plan.allowed ? props.externalDropEffect : 'none';
	dropActive.value = true;
	dropAllowed.value = plan.allowed;
	updateDropPreview(plan);
	if (plan.lineNumber && plan.lineNumber !== lastHoveredLine) {
		lastHoveredLine = plan.lineNumber;
		emit('hover-line-change', plan.lineNumber);
	}
}

function handleEditorDragLeave(event) {
	if (event.currentTarget.contains(event.relatedTarget)) return;
	clearEditorDropPreview();
}

function handleEditorDrop(event) {
	if (!canAcceptExternalDrop(event)) return;
	event.preventDefault();
	event.stopPropagation();
	const text = externalDropText(event);
	const inserted = insertDropText(text, positionFromDragEvent(event));
	clearEditorDropPreview();
	if (inserted) emit('drop-insert', inserted);
}

function clearEditorDropPreview() {
	if (!dropActive.value && !lastHoveredLine && !dropDecorations.length) return;
	dropActive.value = false;
	dropAllowed.value = false;
	dropDecorations = editor?.deltaDecorations(dropDecorations, []) || [];
	lastHoveredLine = 0;
	emit('hover-line-change', 0);
}

function canAcceptExternalDrop(event) {
	if (props.readOnly || !editor || !model) return false;
	const accepted = props.externalDropTypes.map(String).filter(Boolean);
	if (!accepted.length) return false;
	const types = dataTransferTypes(event);
	return accepted.some((type) => types.includes(type));
}

function externalDropText(event) {
	for (const type of props.externalDropTypes.map(String)) {
		const value = safeGetData(event, type);
		if (value) return value;
	}
	return '';
}

function dataTransferTypes(event) {
	return Array.from(event.dataTransfer?.types || []);
}

function safeGetData(event, type) {
	try {
		return event.dataTransfer?.getData(type) || '';
	} catch {
		return '';
	}
}

function positionFromDragEvent(event) {
	const target = editor?.getTargetAtClientPoint?.(event.clientX, event.clientY);
	return target?.position || editor?.getPosition() || { lineNumber: clampLine(props.selectedLine || 1), column: 1 };
}

function insertDropText(value, position) {
	const plan = dropPlanForPosition(value, position);
	if (!plan.allowed || !plan.text) return null;
	const startOffset = model.getOffsetAt(plan.range.getStartPosition());

	editor.pushUndoStop();
	editor.executeEdits('template-code-drop', [{ range: plan.range, text: plan.insertText, forceMoveMarkers: true }]);
	editor.pushUndoStop();
	const endPosition = model.getPositionAt(startOffset + plan.insertText.length);
	editor.setPosition(endPosition);
	editor.revealLineInCenterIfOutsideViewport(plan.insertedLineNumber);
	emit('cursor-line-change', plan.insertedLineNumber);

	return {
		lineNumber: plan.insertedLineNumber,
		column: plan.insertedColumn,
		text: plan.text,
	};
}

function updateDropPreview(plan) {
	if (!editor || !monacoApi || !model) return;
	const lineNumber = plan.lineNumber || clampLine(props.selectedLine || 1);
	const column = clampColumn(lineNumber, plan.column || 1);
	const cursorClass = plan.allowed ? 'template-monaco-drop-caret' : 'template-monaco-drop-caret-invalid';
	const lineClass = plan.allowed ? 'template-monaco-drop-line' : 'template-monaco-drop-line-invalid';
	const decorations = [
		{
			range: new monacoApi.Range(lineNumber, column, lineNumber, column),
			options: {
				beforeContentClassName: cursorClass,
				stickiness: monacoApi.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
			},
		},
		{
			range: new monacoApi.Range(lineNumber, 1, lineNumber, 1),
			options: {
				isWholeLine: true,
				className: lineClass,
			},
		},
	];
	if (plan.allowed && plan.endPosition) {
		const endLine = clampLine(plan.endPosition.lineNumber);
		const endColumn = clampColumn(endLine, plan.endPosition.column);
		decorations.push({
			range: new monacoApi.Range(endLine, endColumn, endLine, endColumn),
			options: {
				beforeContentClassName: 'template-monaco-drop-end-caret',
				stickiness: monacoApi.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
			},
		});
	}
	dropDecorations = editor.deltaDecorations(dropDecorations, decorations);
}

function dropPlanForPosition(value, position) {
	if (!editor || !monacoApi || !model) return { allowed: false, lineNumber: 1, column: 1 };
	const rawText = String(value || '').replace(/\r\n?/g, '\n').replace(/^\n+|\n+$/g, '');
	const lineNumber = clampLine(position?.lineNumber || 1);
	const column = clampColumn(lineNumber, position?.column || 1);
	const line = model.getLineContent(lineNumber);
	const illegalRange = tagSyntaxRangeAt(line, column);
	if (illegalRange) {
		return {
			allowed: false,
			column,
			lineNumber,
			reason: 'tag-syntax',
		};
	}

	const lineIndent = leadingWhitespace(line);
	const trimmed = line.trim();
	const openingLine = isOpeningTagLine(trimmed) && column >= line.length + 1;
	const blankLine = !trimmed;
	const indent = openingLine ? `${lineIndent}\t` : lineIndent;
	const text = rawText ? reindentDropText(rawText, indent) : '';
	const range = dropRangeForPosition({ blankLine, column, line, lineNumber, openingLine });
	const insertText = dropInsertTextForPosition({ blankLine, column, line, openingLine, text });
	const startPosition = range.getStartPosition();
	const endPosition = insertText
		? projectedEndPosition(startPosition, insertText)
		: null;

	return {
		allowed: true,
		column,
		endPosition,
		insertedColumn: startPosition.column,
		insertedLineNumber: openingLine ? lineNumber + 1 : lineNumber,
		insertText,
		lineNumber,
		range,
		text,
	};
}

function dropRangeForPosition({ blankLine, column, line, lineNumber, openingLine }) {
	if (openingLine) return new monacoApi.Range(lineNumber, line.length + 1, lineNumber, line.length + 1);
	if (blankLine) return new monacoApi.Range(lineNumber, 1, lineNumber, line.length + 1);
	return new monacoApi.Range(lineNumber, column, lineNumber, column);
}

function dropInsertTextForPosition({ blankLine, column, line, openingLine, text }) {
	if (!text) return '';
	if (openingLine) return `\n${text}`;
	if (blankLine) return text;
	if (column <= leadingWhitespace(line).length + 1) return `${text}\n`;
	if (column >= line.length + 1) return `\n${text}`;
	return text;
}

function projectedEndPosition(startPosition, text) {
	const lines = String(text || '').split('\n');
	if (lines.length === 1) {
		return {
			lineNumber: startPosition.lineNumber,
			column: startPosition.column + lines[0].length,
		};
	}
	return {
		lineNumber: startPosition.lineNumber + lines.length - 1,
		column: lines.at(-1).length + 1,
	};
}

function tagSyntaxRangeAt(line, column) {
	const value = String(line || '');
	const safeColumn = Math.max(Number(column) || 1, 1);
	const tagPattern = /<\/?[\w:-]+(?:\s[^<>]*)?\/?>/g;
	for (let match = tagPattern.exec(value); match; match = tagPattern.exec(value)) {
		const startColumn = match.index + 1;
		const endColumn = match.index + match[0].length;
		if (safeColumn > startColumn && safeColumn <= endColumn) {
			return { startColumn, endColumn };
		}
	}
	return null;
}

function isOpeningTagLine(value) {
	if (!value || value.startsWith('</') || value.endsWith('/>') || value.includes('</')) return false;
	if (/^<(script|style)\b/i.test(value)) return false;
	return /^<[\w:-]+(?:\s[\s\S]*)?>$/.test(value);
}

function reindentDropText(value, indent) {
	const lines = value.split('\n');
	const common = commonIndent(lines);
	return lines
		.map((line) => line.trim() ? `${indent}${line.slice(common.length)}` : indent)
		.join('\n');
}

function commonIndent(lines) {
	const indents = lines
		.filter((line) => line.trim())
		.map(leadingWhitespace);
	if (!indents.length) return '';
	return indents.reduce((shared, indent) => {
		let index = 0;
		while (index < shared.length && index < indent.length && shared[index] === indent[index]) index += 1;
		return shared.slice(0, index);
	});
}

function leadingWhitespace(value) {
	return String(value || '').match(/^\s*/)?.[0] || '';
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

function clampColumn(lineNumber, value) {
	const lineLength = model?.getLineMaxColumn(clampLine(lineNumber)) || 1;
	return Math.min(Math.max(Number(value) || 1, 1), lineLength);
}

function revealLine(value = props.selectedLine, options = {}) {
	if (!editor) return;
	const { unfoldAncestors = true } = options;
	const lineNumber = clampLine(value || 1);
	updateSelectedLine(lineNumber);
	Promise.resolve(unfoldAncestors ? unfoldAncestorRegionsForLine(lineNumber) : null).finally(() => {
		editor?.revealLineInCenterIfOutsideViewport(lineNumber);
	});
}

function layout() {
	editor?.layout();
}

function focus() {
	editor?.focus();
}

function foldAll() {
	return runFoldingAction('editor.foldAll');
}

function unfoldAll() {
	return runFoldingAction('editor.unfoldAll');
}

function foldSelection() {
	return runFoldingAction('editor.fold');
}

function unfoldSelection() {
	return runFoldingAction('editor.unfold');
}

function foldLine(value = props.selectedLine) {
	if (!editor) return Promise.resolve();
	const lineNumber = clampLine(value || 1);
	return runLineFoldingAction('editor.fold', lineNumber, { selectionLines: [lineNumber - 1] });
}

function unfoldLine(value = props.selectedLine, options = {}) {
	if (!editor) return Promise.resolve();
	const { ancestors = false, descendants = true, moveCursor = true } = options;
	const lineNumber = clampLine(value || 1);
	const actions = [];
	if (moveCursor) {
		applyingFoldingCommand = true;
		editor.setPosition({ lineNumber, column: 1 });
	}
	if (ancestors) {
		actions.push(runFoldingAction('editor.unfold', { levels: Number.MAX_VALUE, direction: 'up', selectionLines: [lineNumber - 1] }, { suppressCursor: moveCursor }));
	}
	if (descendants) {
		actions.push(runFoldingAction('editor.unfold', { levels: 1, direction: 'down', selectionLines: [lineNumber - 1] }, { suppressCursor: moveCursor }));
	}
	return Promise.all(actions).finally(() => {
		if (!moveCursor || actions.length) return;
		nextTick(() => {
			applyingFoldingCommand = false;
		});
	});
}

async function unfoldAncestorRegionsForLine(value) {
	if (!editor) return;
	const lineNumber = clampLine(value || 1);
	const foldingModel = await currentFoldingModel();
	if (!foldingModel?.regions) return;
	const regions = foldingModel.regions;
	const regionsToOpen = [];
	for (let index = 0; index < regions.length; index += 1) {
		const startLine = regions.getStartLineNumber(index);
		const endLine = regions.getEndLineNumber(index);
		if (startLine >= lineNumber || endLine < lineNumber || !regions.isCollapsed(index)) continue;
		regionsToOpen.push(regions.toRegion(index));
	}
	if (!regionsToOpen.length) return;
	applyingFoldingCommand = true;
	foldingModel.toggleCollapseState(regionsToOpen);
	queueFoldingStateEmit();
	nextTick(() => {
		applyingFoldingCommand = false;
	});
}

function runLineFoldingAction(actionId, lineNumber, args) {
	applyingFoldingCommand = true;
	editor?.setPosition({ lineNumber, column: 1 });
	return runFoldingAction(actionId, args, { suppressCursor: true });
}

function runFoldingAction(actionId, args, options = {}) {
	const action = editor?.getAction(actionId);
	if (!action) return Promise.resolve();
	if (options.suppressCursor) applyingFoldingCommand = true;
	return Promise.resolve(action.run(args)).finally(() => {
		queueFoldingStateEmit();
		if (!options.suppressCursor) return;
		nextTick(() => {
			applyingFoldingCommand = false;
		});
	});
}

async function watchFoldingState() {
	const foldingModel = await currentFoldingModel();
	if (!foldingModel || !editor) return;
	foldingModelDisposable?.dispose?.();
	foldingModelDisposable = foldingModel.onDidChange((event) => {
		if (event?.collapseStateChanged) queueFoldingStateEmit();
	});
}

async function currentFoldingModel() {
	const controller = foldingControllerApi?.get?.(editor);
	return controller?.getFoldingModel?.() || null;
}

function queueFoldingStateEmit() {
	if (typeof window === 'undefined') return;
	window.setTimeout(emitFoldingState, 0);
}

async function emitFoldingState() {
	const foldingModel = await currentFoldingModel();
	if (!foldingModel?.regions) return;
	const regions = foldingModel.regions;
	const collapsed = [];
	for (let index = 0; index < regions.length; index += 1) {
		if (!regions.isCollapsed(index)) continue;
		collapsed.push({
			startLine: regions.getStartLineNumber(index),
			endLine: regions.getEndLineNumber(index),
		});
	}
	emit('folding-change', collapsed);
}

function updateModelValue(value) {
	if (!model) return;
	const nextValue = value || '';
	if (model.getValue() === nextValue) return;
	const viewState = editor?.saveViewState() || null;
	applyingExternalValue = true;
	model.setValue(nextValue);
	nextTick(() => {
		if (viewState) editor?.restoreViewState(viewState);
		applyingExternalValue = false;
		updateSelectedLine(props.selectedLine);
		updateHoveredLine(props.hoveredLine);
	});
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
});

watch(() => props.hoveredLine, updateHoveredLine);

onMounted(mountEditor);

onBeforeUnmount(() => {
	cleanupDropListeners();
	resizeObserver?.disconnect();
	themeObserver?.disconnect();
	foldingModelDisposable?.dispose?.();
	editor?.dispose();
	model?.dispose();
	editor = null;
	model = null;
});

defineExpose({
	foldAll,
	foldLine,
	foldSelection,
	focus,
	layout,
	revealLine,
	unfoldAll,
	unfoldLine,
	unfoldSelection,
});
</script>

<template>
	<div
		class="template-monaco-editor relative h-full min-h-0 overflow-hidden bg-card text-card-foreground"
		:data-code-drop-state="dropActive ? (dropAllowed ? 'allowed' : 'blocked') : null"
	>
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

.template-monaco-editor[data-code-drop-state="allowed"] {
	box-shadow: inset 0 0 0 2px var(--ring);
}

.template-monaco-editor[data-code-drop-state="blocked"] {
	box-shadow: inset 0 0 0 2px var(--destructive);
}

.template-monaco-editor :deep(.template-monaco-drop-line) {
	background: color-mix(in oklch, var(--ring) 14%, transparent);
}

.template-monaco-editor :deep(.template-monaco-drop-line-invalid) {
	background: color-mix(in oklch, var(--destructive) 12%, transparent);
}

.template-monaco-editor :deep(.template-monaco-drop-caret),
.template-monaco-editor :deep(.template-monaco-drop-end-caret),
.template-monaco-editor :deep(.template-monaco-drop-caret-invalid) {
	display: inline-block;
	width: 0;
	height: 1.35em;
	margin-left: -1px;
	vertical-align: text-bottom;
	pointer-events: none;
}

.template-monaco-editor :deep(.template-monaco-drop-caret) {
	border-left: 2px solid var(--ring);
	box-shadow: 0 0 0 2px color-mix(in oklch, var(--ring) 14%, transparent);
}

.template-monaco-editor :deep(.template-monaco-drop-end-caret) {
	border-left: 2px dashed var(--ring);
	opacity: 0.75;
}

.template-monaco-editor :deep(.template-monaco-drop-caret-invalid) {
	border-left: 2px solid var(--destructive);
	box-shadow: 0 0 0 2px color-mix(in oklch, var(--destructive) 14%, transparent);
}
</style>
