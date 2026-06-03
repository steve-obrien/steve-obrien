<script setup>
import { cloneVNode, computed, defineComponent, h, isVNode, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { ElClassToggleInput, ElCodeInput, ElSplitterPanel, ElTreeView } from '../../lib/vue';
import { tailwindClassIndex } from '../../forms/_shared/serverLookup.js';
import { componentRegistry as elementsComponentRegistry } from '../inspector/componentRegistry.js';
import InspectorField from '../inspector/InspectorField.vue';
import { inferSchema } from '../inspector/useInspector.js';
import TemplateMonacoEditor from '../../../experiments/template-editor/components/TemplateMonacoEditor.vue';
import {
	buildSource,
	evaluatePreviewExpression,
	isNativeTag,
	literalExpressionValue,
	parseRepeatSource,
	parseSource as parseEditorSource,
	replacedPreviewTags,
	scopeForRepeatItem,
	stampEditorNode,
	voidTags,
} from '../../../experiments/template-editor/lib/editorModel.js';

const props = defineProps({
	source: { type: String, default: '' },
	title: { type: String, default: '' },
	description: { type: String, default: '' },
	filename: { type: String, default: 'Example.vue' },
	rootData: { type: Object, default: () => ({}) },
	defaultCodeOpen: { type: Boolean, default: true },
	previewClass: { type: String, default: '' },
	codeHeight: { type: Number, default: 260 },
	wide: { type: Boolean, default: true },
});

const codeEditorEl = ref(null);
const codeText = ref(props.source);
const codeError = ref('');
const tree = ref(null);
const componentProps = ref([]);
const scriptData = ref({});
const selectedId = ref('');
const hoveredId = ref('');
const selectedCodeLineOverride = ref(0);
const isCodeOpen = ref(props.defaultCodeOpen);
const newAttr = ref({ name: '', value: '' });
const rootData = ref(cloneData(props.rootData));
const rootDataText = ref(JSON.stringify(rootData.value, null, '\t'));
const rootDataError = ref('');
const layerOpenValues = ref([]);

let nextNodeId = 0;
let suppressCodeRevealOnce = false;
let tailwindRefreshTimer = null;

const flatNodes = computed(() => tree.value ? flatten(tree.value) : []);
const selectedNode = computed(() => findNode(tree.value, selectedId.value) || tree.value);
const sourceModel = computed(() => buildSource(tree.value, { props: componentProps.value }));
const sourceText = computed(() => sourceModel.value.rows.map((row) => row.text).join('\n'));
const codeLineMode = computed(() => codeText.value !== sourceText.value);
const stageScope = computed(() => ({
	...rootData.value,
	...scriptData.value,
}));
const selectedSourceLine = computed(() => sourceLineForNode(selectedNode.value, selectedId.value) || 1);
const hoveredSourceLine = computed(() => hoveredId.value ? sourceLineForNode(findNode(tree.value, hoveredId.value), hoveredId.value) : 0);
const sourceFileLabel = computed(() => `${props.filename}:${selectedSourceLine.value}`);
const selectedInspectorFields = computed(() => inspectorFieldsForNode(selectedNode.value));
const selectedInspectorAttrKeys = computed(() => new Set(selectedInspectorFields.value.flatMap((field) => propAttributeKeys(field.key))));
const selectedAttrs = computed(() => Object.entries(selectedNode.value?.props || {})
	.filter(([key]) => key !== 'class' && !selectedInspectorAttrKeys.value.has(key)));
const selectedResolvedValue = computed(() => selectedNode.value?.binding ? resolveExpression(selectedNode.value.binding) : null);
const layerTreeItems = computed(() => tree.value ? [layerItemFromNode(tree.value)] : []);
const selectedLayerValue = computed(() => selectedId.value || '');
const hoveredLayerValue = computed(() => hoveredId.value || '');
const codePanelStyle = computed(() => ({
	height: isCodeOpen.value ? `${props.codeHeight}px` : '0px',
}));

const TemplateExampleNode = defineComponent({
	name: 'TemplateExampleNode',
	props: {
		node: { type: Object, required: true },
		selectedId: { type: String, required: true },
		hoveredId: { type: String, default: '' },
		dataScope: { type: Object, default: () => ({}) },
	},
	emits: ['select', 'hover', 'hover-end'],
	setup(nodeProps, { emit }) {
		function select(event) {
			event.stopPropagation();
			emit('select', nodeProps.node.id);
		}

		function hover(event) {
			event.stopPropagation();
			emit('hover', nodeProps.node.id);
		}

		function hoverEnd(event) {
			event.stopPropagation();
			emit('hover-end', nodeProps.node.id);
		}

		return () => renderNode(nodeProps.node, {
			selectedId: nodeProps.selectedId,
			hoveredId: nodeProps.hoveredId,
			scope: nodeProps.dataScope,
			select,
			hover,
			hoverEnd,
			emit,
		});
	},
});

watch(() => props.source, (value) => {
	resetFromSource(value);
}, { immediate: true });

watch(() => props.rootData, (value) => {
	rootData.value = cloneData(value);
	rootDataText.value = JSON.stringify(rootData.value, null, '\t');
}, { deep: true });

watch(selectedId, () => {
	revealNodeInLayers(selectedId.value);
	if (suppressCodeRevealOnce) {
		suppressCodeRevealOnce = false;
		return;
	}
	nextTick(applyCodeLineHighlight);
});

watch([codeText, sourceText], queueTailwindRefresh);

onBeforeUnmount(() => {
	if (typeof window !== 'undefined') window.clearTimeout(tailwindRefreshTimer);
});

function resetFromSource(value = props.source) {
	nextNodeId = 0;
	codeText.value = value || '';
	codeError.value = '';
	selectedCodeLineOverride.value = 0;
	layerOpenValues.value = [];
	applyCode(codeText.value, { keepSelection: false });
	queueTailwindRefresh();
}

function parseSource(value, componentName = componentNameFromFilename(props.filename)) {
	return parseEditorSource(value, { componentName, stamp });
}

function stamp(node) {
	return stampEditorNode(node, allocateNodeId);
}

function allocateNodeId() {
	nextNodeId += 1;
	return `template-example-node-${nextNodeId}`;
}

function applyCode(value, options = {}) {
	try {
		const previousLine = options.keepSelection ? selectedSourceLine.value : 0;
		const parsed = parseSource(value);
		tree.value = parsed.tree;
		componentProps.value = parsed.props || [];
		scriptData.value = parsed.scriptData || {};
		layerOpenValues.value = [tree.value.id];
		if (options.keepSelection && previousLine) {
			selectedId.value = nodeIdForSourceLine(previousLine) || tree.value.children[0]?.id || tree.value.id;
		} else {
			selectedId.value = tree.value.children[0]?.id || tree.value.id;
		}
		codeError.value = '';
	} catch (error) {
		codeError.value = error instanceof Error ? error.message : 'Could not parse template source.';
	}
}

function onCodeInput(value) {
	if (value === codeText.value) return;
	codeText.value = value;
	applyCode(value, { keepSelection: true });
}

function visualChanged() {
	selectedCodeLineOverride.value = 0;
	codeText.value = sourceText.value;
	nextTick(applyCodeLineHighlight);
}

function selectNode(id) {
	selectedCodeLineOverride.value = 0;
	selectedId.value = id;
}

function selectFromLayer(event) {
	const id = event?.item?.nodeId || event?.value || '';
	if (!id) return;
	selectNode(id);
}

function hoverFromLayer(event) {
	hoveredId.value = event?.item?.nodeId || event?.value || '';
}

function clearHoverFromLayer() {
	hoveredId.value = '';
}

function revealNodeInLayers(id) {
	const path = nodePathToIds(tree.value, id);
	if (!path.length) return;
	const ancestors = path.slice(0, -1);
	if (!ancestors.length) return;
	const open = new Set(layerOpenValues.value.map(String));
	ancestors.forEach((value) => open.add(String(value)));
	layerOpenValues.value = [...open];
}

function selectFromCodeLine(line) {
	if (!line) return;
	const id = nodeIdForSourceLine(line);
	if (!id || !findNode(tree.value, id)) return;
	const changed = selectedId.value !== id;
	suppressCodeRevealOnce = changed;
	selectedCodeLineOverride.value = line;
	selectedId.value = id;
	if (!changed) {
		nextTick(() => {
			suppressCodeRevealOnce = false;
		});
	}
}

function hoverFromCodeLine(line) {
	hoveredId.value = line ? nodeIdForSourceLine(line) || '' : '';
}

function applyCodeLineHighlight() {
	codeEditorEl.value?.revealLine(selectedSourceLine.value);
}

function foldCode() {
	codeEditorEl.value?.foldAll();
}

function unfoldCode() {
	codeEditorEl.value?.unfoldAll();
}

function sourceLineForNode(node, id) {
	if (!node) return 0;
	if (id === selectedId.value && selectedCodeLineOverride.value && nodeIdForSourceLine(selectedCodeLineOverride.value) === id) {
		return selectedCodeLineOverride.value;
	}
	if (!codeLineMode.value) return sourceModel.value.lineMap[id] || node.sourceLine || 0;
	return node.sourceLine || sourceModel.value.lineMap[id] || 0;
}

function nodeIdForSourceLine(line) {
	if (!codeLineMode.value) {
		const rowId = sourceModel.value.rows[line - 1]?.id;
		if (rowId) return rowId;
	}

	const rangeId = nodeIdForSourceLineRange(line);
	if (rangeId) return rangeId;

	if (codeLineMode.value) {
		const nodes = flatNodes.value
			.map(({ node }) => node)
			.filter((node) => node.id && node.sourceLine && node.sourceLine <= line)
			.sort((a, b) => b.sourceLine - a.sourceLine);
		return nodes[0]?.id || null;
	}

	const rows = sourceModel.value.rows;
	for (let index = line - 1; index >= 0; index -= 1) {
		if (rows[index]?.id) return rows[index].id;
	}
	return null;
}

function nodeIdForSourceLineRange(line) {
	const matches = flatNodes.value
		.filter(({ node }) => node.id && node.sourceLine && node.sourceLine <= line && (node.sourceEndLine || node.sourceLine) >= line)
		.sort((a, b) => b.depth - a.depth || (b.node.sourceLine || 0) - (a.node.sourceLine || 0));
	return matches[0]?.node.id || null;
}

function updateText(value) {
	if (!selectedNode.value || !('text' in selectedNode.value)) return;
	selectedNode.value.text = value;
	selectedNode.value.inline = null;
	visualChanged();
}

function updateBinding(value) {
	if (!selectedNode.value || !('binding' in selectedNode.value)) return;
	selectedNode.value.binding = value;
	selectedNode.value.inline = null;
	visualChanged();
}

function updateRepeatSource(value) {
	if (!selectedNode.value?.repeat) return;
	selectedNode.value.repeat = parseRepeatSource(value);
	visualChanged();
}

function updateSelectedClass(value) {
	updateSelectedProp('class', value);
}

function updateSelectedProp(key, value) {
	if (!selectedNode.value || selectedNode.value.type === 'root') return;
	selectedNode.value.props = {
		...(selectedNode.value.props || {}),
		[key]: value,
	};
	visualChanged();
}

function addSelectedAttr() {
	const name = newAttr.value.name.trim();
	if (!name || !selectedNode.value || selectedNode.value.type === 'root') return;
	updateSelectedProp(name, newAttr.value.value);
	newAttr.value = { name: '', value: '' };
}

function removeSelectedAttr(key) {
	if (!selectedNode.value?.props) return;
	const { [key]: removed, ...nextProps } = selectedNode.value.props;
	selectedNode.value.props = nextProps;
	visualChanged();
}

function selectedInspectorFieldValue(field) {
	const node = selectedNode.value;
	if (!node?.props) return undefined;
	const keys = propAttributeKeys(field.key);
	const dynamicKey = keys.find((key) => key.startsWith(':') && Object.prototype.hasOwnProperty.call(node.props, key));
	if (dynamicKey) {
		const literal = literalExpressionValue(node.props[dynamicKey]);
		if (literal.matched) return literal.value;
		return resolveExpression(node.props[dynamicKey]) ?? node.props[dynamicKey];
	}

	const staticKey = keys.find((key) => !key.startsWith(':') && Object.prototype.hasOwnProperty.call(node.props, key));
	return staticKey ? node.props[staticKey] : undefined;
}

function updateSelectedInspectorField(field, value) {
	const node = selectedNode.value;
	if (!node) return;

	const nextProps = { ...(node.props || {}) };
	for (const key of propAttributeKeys(field.key)) delete nextProps[key];

	if (value !== undefined && value !== null && value !== '') {
		if (typeof value === 'string') nextProps[field.key] = value;
		else nextProps[`:${field.key}`] = JSON.stringify(value);
	}

	node.props = nextProps;
	visualChanged();
}

function updateRootData(value) {
	rootDataText.value = value;
	try {
		rootData.value = JSON.parse(value || '{}');
		rootDataError.value = '';
	} catch (error) {
		rootDataError.value = error instanceof Error ? error.message : 'Invalid JSON';
	}
}

function inspectorFieldsForNode(node) {
	if (!node || node.type !== 'component') return [];
	const entry = elementsEntryForTag(node.tag);
	if (!entry?.component || typeof entry.component === 'string') return [];
	return inferSchema({
		id: node.id,
		label: node.label || entry.label,
		component: entry.component,
		props: node.props || {},
		children: [],
	}).filter((field) => field.key !== 'class');
}

function renderNode(node, ctx) {
	if (node.type === 'literal') return renderInlineValue(node, node.text || 'Text', ctx.scope || {});

	const selected = ctx.selectedId === node.id;
	const hovered = ctx.hoveredId === node.id;
	const scope = ctx.scope || {};
	const common = previewAttrsForNode(node, scope, {
		'data-template-node': node.id,
		'data-template-hovered': hovered ? 'true' : null,
		'data-template-selected': selected ? 'true' : null,
		onClick: ctx.select,
		onMouseenter: ctx.hover,
		onMouseleave: ctx.hoverEnd,
	});

	if (node.repeat) return renderRepeatNode(node, ctx, common, scope);

	const children = renderChildren(node, ctx, scope);
	const stageClass = stageBaseClassForNode(node);
	if (stageClass && !common.class) common.class = stageClass;

	if (node.type === 'root') return h('div', { ...common, class: mergeClassValues('min-h-full w-full', common.class) }, children);
	if (node.type === 'component') {
		const slotChildren = slotContentForNode(node, children, scope);
		const elementsPreview = renderElementsComponent(node, common, slotChildren);
		if (elementsPreview) return elementsPreview;
	}
	if (node.type === 'headline') return h('h1', common, renderInlineValue(node, 'Heading', scope));
	if (node.type === 'text') return h('p', common, renderInlineValue(node, 'Text', scope));
	if (node.type === 'paragraph') return h('p', common, renderInlineValue(node, 'Paragraph', scope));
	if (node.type === 'element' && node.tag === 'slot') return h('div', common, 'Slot content');
	if (node.type === 'element') return h(node.tag || 'section', common, voidTags.has(node.tag) ? null : (children.length ? children : inlineContentForNode(node, scope)));
	if (node.type === 'component') return h('section', common, slotContentForNode(node, children, scope).length ? slotContentForNode(node, children, scope) : node.text || node.label);
	return h('section', common, children.length ? children : node.label);
}

function renderRepeatNode(node, ctx, common, scope) {
	const items = resolveExpression(node.repeat.list, scope);
	const rows = repeatRows(items);
	return rows.flatMap((item, index) => {
		const repeatScope = scopeForRepeatItem(node.repeat, item, index, scope);
		return toArray(renderNode({ ...node, repeat: null }, { ...ctx, scope: repeatScope }))
			.map((row) => withRepeatKey(row, node.id, index));
	});
}

function renderChildren(node, ctx, scope) {
	return (node.children || []).map((child) => h(TemplateExampleNode, {
		key: child.id,
		node: child,
		selectedId: ctx.selectedId,
		hoveredId: ctx.hoveredId,
		dataScope: scope,
		onSelect: (id) => ctx.emit('select', id),
		onHover: (id) => ctx.emit('hover', id),
		onHoverEnd: () => ctx.emit('hover-end', ''),
	}));
}

function renderElementsComponent(node, attrs, slotChildren) {
	const entry = elementsEntryForTag(node.tag);
	if (!entry || typeof entry.component === 'string' || !entry.component) return null;
	const componentProps = { ...attrs };
	return h(entry.component, componentProps, slotChildren.length ? { default: () => slotChildren } : undefined);
}

function previewAttrsForNode(node, scope, rootCommon = null) {
	const attrs = {};
	let classValue = '';
	for (const [key, value] of Object.entries(node.props || {})) {
		if (key === 'v-model') {
			attrs.modelValue = resolveExpression(value, scope) ?? '';
			continue;
		}
		if (key.startsWith('v-model:')) {
			attrs[camelCase(key.slice('v-model:'.length))] = resolveExpression(value, scope) ?? '';
			continue;
		}
		if (key === 'v-bind') {
			const resolved = resolveExpression(value, scope);
			if (resolved && typeof resolved === 'object' && !Array.isArray(resolved)) Object.assign(attrs, resolved);
			continue;
		}
		if (key.startsWith('@') || key.startsWith('v-')) continue;

		const name = key.startsWith(':') ? domPropName(key.slice(1)) : domPropName(key);
		const resolved = key.startsWith(':') ? resolveExpression(value, scope) : value === '' ? true : value;
		if (name === 'class') {
			classValue = mergeClassValues(classValue, resolved);
			continue;
		}
		attrs[name] = resolved ?? '';
	}

	if (rootCommon) {
		classValue = mergeClassValues(rootCommon.class, classValue);
		Object.assign(attrs, rootCommon);
	}

	const baseClass = stageBaseClassForNode(node);
	const mergedClass = mergeClassValues(classValue || baseClass);
	if (mergedClass) attrs.class = mergedClass;
	if (isImageNode(node)) prepareImagePreviewAttrs(attrs);
	return attrs;
}

function renderInlineValue(node, fallback = '', scope = {}) {
	if (!node.inline?.length) return valueFor(node.binding, node.text || fallback, scope);
	const value = node.inline.map((part) => {
		if (part.type === 'text') return part.value;
		const resolved = resolveExpression(part.value, scope);
		if (resolved == null || typeof resolved === 'object') return '';
		return resolved;
	}).join('').replace(/\s+/g, ' ').trim();
	return value || fallback;
}

function inlineContentForNode(node, scope) {
	if (node.inline?.length || node.binding) return renderInlineValue(node, node.text || node.label, scope);
	return node.text || '';
}

function slotContentForNode(node, renderedChildren, scope) {
	if (renderedChildren.length) return renderedChildren;
	if (!node.inline?.length && !node.binding && !node.text) return [];
	return [renderInlineValue(node, node.text || node.label, scope)];
}

function resolveExpression(expression, scope = {}) {
	if (!expression) return null;
	const evaluated = evaluatePreviewExpression(expression, {
		...stageScope.value,
		...scope,
	});
	return evaluated.matched ? evaluated.value : null;
}

function valueFor(binding, fallback = '', scope = {}) {
	const value = binding ? resolveExpression(binding, scope) : null;
	if (Array.isArray(value) || (value && typeof value === 'object')) return fallback;
	return value ?? fallback;
}

function repeatRows(value) {
	if (Array.isArray(value)) return value.length ? value : [{ title: 'Example row' }];
	if (Number.isFinite(value)) return Array.from({ length: Math.max(value, 0) }, (_, index) => index + 1);
	return [{ title: 'Example row' }];
}

function withRepeatKey(row, nodeId, index) {
	if (!isVNode(row)) return row;
	return cloneVNode(row, {
		key: row.key ?? `${nodeId}-${index}`,
		'data-repeat-template': nodeId,
		'data-repeat-index': String(index),
	});
}

function flatten(node, depth = 0, out = []) {
	if (!node) return out;
	out.push({ node, depth });
	(node.children || []).forEach((child) => flatten(child, depth + 1, out));
	return out;
}

function layerItemFromNode(node) {
	return {
		id: node.id,
		nodeId: node.id,
		label: nodeDisplayLabel(node),
		icon: iconForNode(node),
		children: (node.children || []).map((child) => layerItemFromNode(child)),
	};
}

function nodeDisplayLabel(node) {
	if (!node) return 'Node';
	if (node.type === 'root') return componentNameFromFilename(props.filename);
	return node.label || node.tag || node.text || node.binding || node.type;
}

function iconForNode(node) {
	if (node?.type === 'root') return 'M4 5h16v14H4V5Zm3 4h10M7 13h7';
	if (node?.type === 'component') return 'M5 6h14v12H5V6Zm4 4h6M9 14h6';
	if (node?.type === 'headline') return 'M6 5v14M18 5v14M6 12h12';
	if (node?.type === 'text' || node?.type === 'paragraph' || node?.type === 'literal') return 'M6 7h12M6 12h9M6 17h11';
	return 'M5 5h14v14H5V5Z';
}

function findNode(node, id) {
	if (!node) return null;
	if (node.id === id) return node;
	for (const child of node.children || []) {
		const match = findNode(child, id);
		if (match) return match;
	}
	return null;
}

function nodePathToIds(node, id, path = []) {
	if (!node) return [];
	const nextPath = [...path, node.id];
	if (node.id === id) return nextPath;
	for (const child of node.children || []) {
		const match = nodePathToIds(child, id, nextPath);
		if (match.length) return match;
	}
	return [];
}

function propAttributeKeys(key) {
	const kebab = kebabCase(key);
	return [key, `:${key}`, kebab, `:${kebab}`];
}

function elementsEntryForTag(tag) {
	return elementsComponentRegistry.find((entry) => entry.componentName === tag || entry.tag === tag);
}

function componentNameFromFilename(value) {
	return String(value || 'Example.vue').split('/').pop().replace(/\.vue$/i, '') || 'Example';
}

function kebabCase(value) {
	return String(value || '').replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function camelCase(value) {
	return String(value || '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function domPropName(name) {
	if (name === 'class' || name === 'style' || name.startsWith('data-') || name.startsWith('aria-')) return name;
	return camelCase(name);
}

function toArray(value) {
	if (Array.isArray(value)) return value;
	return value ? [value] : [];
}

function classTokens(value) {
	if (!value) return [];
	if (Array.isArray(value)) return value.flatMap(classTokens);
	if (typeof value === 'object') {
		return Object.entries(value)
			.filter(([, enabled]) => enabled)
			.flatMap(([name]) => classTokens(name));
	}
	return String(value).split(/\s+/).map((token) => token.trim()).filter(Boolean);
}

function mergeClassValues(...values) {
	const seen = new Set();
	const tokens = [];
	for (const token of values.flatMap(classTokens)) {
		if (seen.has(token)) continue;
		seen.add(token);
		tokens.push(token);
	}
	return tokens.join(' ');
}

function basePreviewClassForNode(node) {
	if (node.type === 'root') return 'min-h-full bg-background';
	if (node.type === 'headline') return 'text-2xl font-semibold tracking-tight text-foreground';
	if (node.type === 'text' || node.type === 'paragraph') return 'text-sm leading-6 text-muted-foreground';
	if (node.type === 'element' && isEmptyElement(node)) return 'min-h-12 rounded-md border border-dashed border-border bg-background/80 p-4';
	return '';
}

function stageBaseClassForNode(node) {
	if (node.props?.class) return '';
	return basePreviewClassForNode(node);
}

function isEmptyElement(node) {
	if (node.type !== 'element') return false;
	if (voidTags.has(node.tag) || replacedPreviewTags.has(node.tag)) return false;
	return !node.children?.length && !node.text && !node.inline?.length;
}

function isImageNode(node) {
	return node.type === 'element' && node.tag === 'img';
}

function prepareImagePreviewAttrs(attrs) {
	const src = typeof attrs.src === 'string' ? attrs.src.trim() : attrs.src;
	const label = src || attrs.alt || 'image';
	if (!src) attrs.src = imagePlaceholderSrc(label);
	if (!attrs.alt) attrs.alt = label;
	attrs.onError = (event) => {
		if (event.currentTarget.dataset.templateImageFallback === 'true') return;
		event.currentTarget.dataset.templateImageFallback = 'true';
		event.currentTarget.src = imagePlaceholderSrc(label);
	};
}

function imagePlaceholderSrc(label) {
	const safeLabel = String(label || 'image').replace(/[<>&"]/g, '').slice(0, 80);
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><rect width="960" height="540" rx="24" fill="#f4f4f5"/><rect x="40" y="40" width="880" height="460" rx="18" fill="#fff" stroke="#d4d4d8" stroke-width="4" stroke-dasharray="18 14"/><text x="480" y="286" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="28" fill="#52525b">${safeLabel}</text></svg>`;
	return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function cloneData(value) {
	if (value === undefined || value === null) return {};
	return JSON.parse(JSON.stringify(value));
}

function queueTailwindRefresh() {
	if (typeof window === 'undefined') return;
	window.clearTimeout(tailwindRefreshTimer);
	tailwindRefreshTimer = window.setTimeout(refreshTailwind, 250);
}

async function refreshTailwind() {
	if (typeof window === 'undefined') return;
	try {
		const response = await fetch('/experiments/template-editor/tailwind.css', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ content: [codeText.value, sourceText.value].join('\n') }),
		});
		if (!response.ok) return;
		const css = await response.text();
		let style = document.getElementById('template-example-editor-tailwind-runtime');
		if (!style) {
			style = document.createElement('style');
			style.id = 'template-example-editor-tailwind-runtime';
			document.head.appendChild(style);
		}
		style.textContent = css;
	} catch {
		// The Tailwind endpoint is available in the local experiment server only.
	}
}
</script>

<template>
	<figure
		class="template-example-editor-shell my-6 overflow-hidden rounded-2xl border border-border bg-background text-foreground"
		:class="wide && 'template-example-editor-wide'"
	>
		<figcaption v-if="title || description" class="border-b border-border bg-secondary/40 px-5 py-3">
			<p v-if="title" class="text-sm font-semibold tracking-tight text-foreground">{{ title }}</p>
			<p v-if="description" class="mt-0.5 text-sm text-muted-foreground">{{ description }}</p>
		</figcaption>

		<ElSplitterPanel
			class="template-example-editor-workspace min-h-[42rem] bg-background"
			:start-size="240"
			:end-size="360"
			:min-start="180"
			:min-main="460"
			:min-end="280"
		>
			<template #start>
				<aside class="flex h-full min-h-0 flex-col overflow-hidden border-r border-border bg-card text-card-foreground">
					<div class="shrink-0 border-b border-border px-4 py-3">
						<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Layers</p>
						<p class="mt-1 truncate text-sm font-medium text-foreground">{{ componentNameFromFilename(filename) }}</p>
					</div>
					<div class="min-h-0 flex-1 overflow-y-auto bg-background p-2">
						<ElTreeView
							:model-value="selectedLayerValue"
							:items="layerTreeItems"
							:open-values="layerOpenValues"
							:hovered-value="hoveredLayerValue"
							:chrome="false"
							:draggable="false"
							label="Template example layers"
							class="template-example-layer-tree"
							@select="selectFromLayer"
							@hover="hoverFromLayer"
							@hover-end="clearHoverFromLayer"
							@update:open-values="layerOpenValues = $event"
						/>
					</div>
				</aside>
			</template>

			<section class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
				<div class="flex min-h-12 items-center justify-between gap-3 border-b border-border bg-card px-4 text-card-foreground">
					<div class="min-w-0">
						<p class="truncate text-sm font-medium">{{ selectedNode?.label || selectedNode?.tag || 'Template' }}</p>
						<p class="truncate font-mono text-[11px] text-muted-foreground">{{ sourceFileLabel }}</p>
					</div>
					<div class="flex shrink-0 items-center gap-2">
						<button type="button" class="h-7 rounded-md border border-border px-2 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground" @click="foldCode">Fold all</button>
						<button type="button" class="h-7 rounded-md border border-border px-2 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground" @click="unfoldCode">Unfold</button>
						<button type="button" class="h-7 rounded-md border border-border px-2 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground" @click="resetFromSource()">Reset</button>
						<button type="button" class="h-7 rounded-md bg-secondary px-2 text-[11px] font-medium text-secondary-foreground hover:bg-secondary/80" @click="isCodeOpen = !isCodeOpen">{{ isCodeOpen ? 'Hide code' : 'Show code' }}</button>
					</div>
				</div>

				<div class="min-h-0 flex-1 overflow-auto bg-muted/35 p-5">
					<div class="mx-auto min-h-full max-w-5xl rounded-lg border border-border bg-background p-5 shadow-sm" :class="previewClass">
						<TemplateExampleNode
							v-if="tree"
							:node="tree"
							:selected-id="selectedId"
							:hovered-id="hoveredId"
							:data-scope="stageScope"
							@select="selectNode"
							@hover="hoveredId = $event"
							@hover-end="hoveredId = ''"
						/>
						<p v-else class="text-sm text-muted-foreground">No template loaded.</p>
					</div>
				</div>

				<section class="grid shrink-0 grid-rows-[auto_minmax(0,1fr)] border-t border-border bg-card text-card-foreground transition-[height]" :style="codePanelStyle">
					<div v-show="isCodeOpen" class="flex h-10 items-center justify-between border-b border-border px-4">
						<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Code</p>
						<p class="truncate text-[11px]" :class="codeError ? 'text-destructive' : 'text-muted-foreground'">{{ codeError || filename }}</p>
					</div>
					<div v-show="isCodeOpen" class="min-h-0">
						<TemplateMonacoEditor
							ref="codeEditorEl"
							:model-value="codeText"
							:selected-line="selectedSourceLine"
							:hovered-line="hoveredSourceLine"
							:path="filename"
							lang="vue"
							@cursor-line-change="selectFromCodeLine"
							@hover-line-change="hoverFromCodeLine"
							@ready="applyCodeLineHighlight"
							@update:model-value="onCodeInput"
						/>
					</div>
				</section>
			</section>

			<template #end>
				<aside class="h-full min-h-0 overflow-hidden border-l border-border bg-card text-card-foreground">
					<div class="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
						<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Properties</p>
						<p class="mt-1 truncate text-sm font-medium text-foreground">{{ selectedNode?.tag || selectedNode?.label || 'Template' }}</p>
					</div>
					<div class="h-[calc(100%-4.5rem)] min-h-0 space-y-4 overflow-y-auto p-4">
						<label v-if="selectedNode && 'binding' in selectedNode" class="grid gap-1">
							<span class="text-xs text-muted-foreground">Data binding</span>
							<input class="h-9 rounded-md border border-input bg-background px-3 font-mono text-xs text-foreground outline-none focus:border-ring" :value="selectedNode.binding || ''" @input="updateBinding($event.target.value)">
						</label>
						<div v-if="selectedResolvedValue != null" class="rounded-md border border-border bg-background px-3 py-2">
							<p class="text-[11px] font-medium text-muted-foreground">Resolved value</p>
							<code class="mt-1 block truncate font-mono text-xs text-primary">{{ selectedResolvedValue }}</code>
						</div>
						<label v-if="selectedNode && 'text' in selectedNode" class="grid gap-1">
							<span class="text-xs text-muted-foreground">Text</span>
							<input class="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring" :value="selectedNode.text || ''" @input="updateText($event.target.value)">
						</label>
						<label v-if="selectedNode?.repeat" class="grid gap-1">
							<span class="text-xs text-muted-foreground">Repeated template</span>
							<input class="h-9 rounded-md border border-input bg-background px-3 font-mono text-xs text-foreground outline-none focus:border-ring" :value="selectedNode.repeat.source" @input="updateRepeatSource($event.target.value)">
						</label>

						<div v-if="selectedNode && selectedNode.type !== 'root'" class="grid gap-1">
							<span class="text-xs text-muted-foreground">Class</span>
							<div class="template-example-class-input">
								<ElClassToggleInput
									:key="selectedNode.id"
									:chrome="false"
									:model-value="selectedNode.props?.class || ''"
									:options="tailwindClassIndex"
									placeholder="Add class"
									@update:model-value="updateSelectedClass"
								/>
							</div>
						</div>

						<div v-if="selectedInspectorFields.length" class="grid gap-3">
							<p class="text-xs font-medium text-muted-foreground">Component props</p>
							<InspectorField
								v-for="field in selectedInspectorFields"
								:key="field.key"
								:field="field"
								:model-value="selectedInspectorFieldValue(field)"
								@update:model-value="updateSelectedInspectorField(field, $event)"
							/>
						</div>

						<div v-if="selectedNode && selectedNode.type !== 'root'" class="grid gap-2">
							<div class="flex items-center justify-between">
								<span class="text-xs text-muted-foreground">HTML attributes</span>
								<span class="text-[11px] text-muted-foreground">{{ selectedAttrs.length }}</span>
							</div>
							<div v-if="selectedAttrs.length" class="grid gap-2">
								<div
									v-for="[key, value] in selectedAttrs"
									:key="key"
									class="grid min-w-0 grid-cols-[minmax(4.5rem,0.35fr)_minmax(0,1fr)_auto] gap-2"
								>
									<input class="h-8 min-w-0 rounded-md border border-input bg-muted px-2 font-mono text-[11px] text-muted-foreground outline-none" readonly :value="key">
									<input class="h-8 min-w-0 rounded-md border border-input bg-background px-2 font-mono text-xs text-foreground outline-none focus:border-ring" :value="value" @input="updateSelectedProp(key, $event.target.value)">
									<button type="button" class="h-8 rounded-md border border-border px-2 text-[11px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive" @click="removeSelectedAttr(key)">Remove</button>
								</div>
							</div>
							<div class="grid min-w-0 grid-cols-[minmax(4.5rem,0.35fr)_minmax(0,1fr)_auto] gap-2">
								<input v-model="newAttr.name" class="h-8 min-w-0 rounded-md border border-input bg-background px-2 font-mono text-[11px] text-foreground outline-none focus:border-ring" placeholder="aria-label">
								<input v-model="newAttr.value" class="h-8 min-w-0 rounded-md border border-input bg-background px-2 font-mono text-xs text-foreground outline-none focus:border-ring" placeholder="value">
								<button type="button" class="h-8 rounded-md bg-secondary px-2 text-xs text-secondary-foreground hover:bg-secondary/80" @click="addSelectedAttr">Add</button>
							</div>
						</div>

						<div v-if="selectedNode?.type === 'root'" class="grid gap-2">
							<div class="flex items-center justify-between">
								<span class="text-xs text-muted-foreground">Root data</span>
								<span class="text-[11px]" :class="rootDataError ? 'text-destructive' : 'text-muted-foreground'">{{ rootDataError || 'Live' }}</span>
							</div>
							<ElCodeInput
								:model-value="rootDataText"
								:rows="8"
								:editor="true"
								:_register-field="false"
								:chrome="false"
								lang="json"
								class="template-example-root-data"
								@update:model-value="updateRootData"
							/>
						</div>
					</div>
				</aside>
			</template>
		</ElSplitterPanel>
	</figure>
</template>

<style scoped>
.template-example-editor-shell {
	max-width: none;
}

@media (min-width: 1024px) {
	.template-example-editor-wide {
		width: min(96rem, calc(100vw - 21rem));
		margin-left: 50%;
		transform: translateX(-50%);
	}
}

.template-example-editor-workspace {
	height: min(78vh, 52rem);
}

.template-example-layer-tree {
	border-radius: 0.5rem;
}

.template-example-class-input :deep(.el-input) {
	border-color: var(--input);
	background: var(--background);
	color: var(--foreground);
	outline: none;
}

.template-example-class-input :deep(.el-input:focus) {
	border-color: var(--ring);
	box-shadow: none;
}

.template-example-class-input :deep(label) {
	color: var(--foreground);
}

.template-example-class-input :deep(label.opacity-50) {
	color: var(--muted-foreground);
	opacity: 1;
}

.template-example-class-input :deep(input[type="checkbox"]) {
	accent-color: var(--primary);
}

.template-example-root-data {
	min-height: 10rem;
}

:deep([data-template-node]) {
	outline: 0 solid transparent;
	outline-offset: 2px;
	transition: outline-color 120ms ease, box-shadow 120ms ease;
}

:deep([data-template-hovered="true"]) {
	outline: 2px solid color-mix(in oklch, var(--ring) 65%, transparent);
}

:deep([data-template-selected="true"]) {
	outline: 2px solid var(--ring);
	box-shadow: 0 0 0 4px color-mix(in oklch, var(--ring) 18%, transparent);
}
</style>
