<script setup>
import { baseParse, NodeTypes } from '@vue/compiler-dom';
import { computed, defineComponent, h, nextTick, onMounted, ref, watch } from 'vue';
import { ElClassToggleInput, ElCodeInput, ElSplitterPanel } from '../../elements/lib/vue';
import { tailwindClassIndex } from '../../elements/forms/_shared/serverLookup.js';

/**
 * This experiment is a small model of the future app-builder architecture:
 *
 * 1. Project/component registry: the app knows which Vue components exist,
 *    where they live, whether they are editable, and whether they can be
 *    inserted into another template.
 * 2. Code parser: Vue template code is parsed with the Vue compiler into an
 *    AST, then converted into a simpler editor tree.
 * 3. Visual editor: the editor tree renders on the stage with selection,
 *    drag/drop, source line lookup, and component drill-down.
 * 4. Code generator: visual edits update the editor tree, then regenerate a
 *    Vue SFC that can be saved back to the workspace.
 *
 * In a full app builder, this page would sit beside a Monaco file editor,
 * route/file browser, project graph, and data/source binding tools.
 */

/**
 * @typedef {Object} ComponentRecord
 * @property {string} name Vue component name used in templates.
 * @property {string} file Virtual path displayed by the experiment UI.
 * @property {'page' | 'layout' | 'component' | 'control'} role App-builder role.
 * @property {boolean} editable Whether double-click/editor navigation can open it.
 * @property {boolean} insertable Whether it appears in the drag/drop palette.
 * @property {{ name: string, type: string }[]} props Props exposed in the UI.
 * @property {string} source SFC source owned by this experimental registry.
 */

/**
 * @typedef {Object} EditorNode
 * @property {string} id Stable editor id, not part of Vue source.
 * @property {'root' | 'component' | 'element' | 'headline' | 'text' | 'paragraph' | 'literal'} type
 * @property {string=} tag Native tag or component name.
 * @property {string=} label Display label in layers/inspector.
 * @property {string=} text Plain text content.
 * @property {string=} binding Vue expression used for simple text interpolation.
 * @property {{ type: 'text' | 'binding', value: string }[]=} inline Inline text/interpolation parts.
 * @property {Record<string, string>=} props Parsed attributes/directives.
 * @property {{ source: string, item: string, index: string, list: string }=} repeat Parsed `v-for` metadata.
 * @property {number=} sourceLine Best-effort original source line from Vue compiler locations.
 * @property {EditorNode[]=} children Child nodes rendered inside this node.
 */

/**
 * Mock runtime data. The visual stage uses this to make bindings such as
 * `project.name` feel live without needing a real app data-source scanner yet.
 */
const dataModel = {
	project: {
		name: 'Launch OS',
		status: 'Prototype',
		owner: 'Product team',
		nextMilestone: 'Beta review',
	},
	metrics: [
		{ label: 'Tasks shipped', value: '38', trend: '+12%' },
		{ label: 'Open risks', value: '4', trend: '-2' },
		{ label: 'Readiness', value: '82%', trend: '+9%' },
	],
	tasks: [
		{ title: 'Map template regions', owner: 'Steve', due: 'Today' },
		{ title: 'Connect data bindings', owner: 'AI pair', due: 'Tomorrow' },
		{ title: 'Export Vue draft', owner: 'Design', due: 'Friday' },
	],
};

/**
 * Native HTML primitives are the foundation for building new components from
 * scratch. A real app builder would grow this into an HTML/CSS/layout toolbox.
 */
const primitivePalette = [
	{
		id: 'div',
		label: 'Div',
		icon: 'M5 5h14v14H5V5Zm3 3h8v8H8V8Z',
		create: () => ({ type: 'element', tag: 'div', label: 'div', props: { class: 'space-y-3' }, children: [] }),
	},
	{
		id: 'paragraph',
		label: 'Paragraph',
		icon: 'M6 7h12M6 12h9M6 17h11',
		create: () => ({ type: 'paragraph', label: 'Paragraph', text: 'hello', props: {}, children: [] }),
	},
	{
		id: 'heading',
		label: 'Heading',
		icon: 'M6 5v14M18 5v14M6 12h12',
		create: () => ({ type: 'headline', label: 'Heading', binding: 'project.name', props: {}, children: [] }),
	},
	{
		id: 'button',
		label: 'Button',
		icon: 'M8 8h8a4 4 0 0 1 0 8H8a4 4 0 0 1 0-8Z',
		create: () => ({ type: 'component', tag: 'ElButton', label: 'ElButton', text: 'Continue', props: {}, children: [] }),
	},
	{
		id: 'section',
		label: 'Section',
		icon: 'M5 6h14v12H5V6Zm3 4h8M8 14h5',
		create: () => ({ type: 'element', tag: 'section', label: 'section', props: { class: 'space-y-3' }, children: [] }),
	},
	{
		id: 'slot',
		label: 'Slot',
		icon: 'M8 6h8M8 18h8M6 9v6m12-6v6',
		create: () => ({ type: 'element', tag: 'slot', label: 'slot', props: {}, children: [] }),
	},
];

/**
 * Experimental component registry.
 *
 * `TemplateFrame` is not required for the editor itself. It is only a demo app
 * shell that gives the sample dashboard a visible page frame. Because it is a
 * shell/layout wrapper, it should be editable but not normally insertable into
 * arbitrary components. That distinction is the same idea a full app builder
 * would use for pages, layouts, low-level controls, and reusable components.
 *
 * New user-made components, such as a hero layout assembled from divs/slots,
 * would become new records here with `role: 'component'` and `insertable: true`.
 *
 * @type {import('vue').Ref<ComponentRecord[]>}
 */
const componentStore = ref([
	{
		name: 'ProjectDashboard',
		file: 'experiment://components/ProjectDashboard.vue',
		role: 'page',
		editable: true,
		insertable: false,
		props: [
			{ name: 'project', type: 'Object' },
			{ name: 'metrics', type: 'Array' },
			{ name: 'tasks', type: 'Array' },
		],
		source: `<template>
	<TemplateFrame>
		<HeroPanel>
			<Badge>{{ project.status }}</Badge>
			<h1>{{ project.name }}</h1>
			<p>{{ project.nextMilestone }}</p>
			<ElButton>Open roadmap</ElButton>
		</HeroPanel>
		<MetricGrid :items="metrics" />
		<SplitPanel>
			<TaskList :tasks="tasks" />
			<section>
				<ElTextInput model-value="designer@example.com" />
				<ElButton>Send invite</ElButton>
			</section>
		</SplitPanel>
	</TemplateFrame>
</template>

<script setup>
const props = defineProps({
	project: Object,
	metrics: Array,
	tasks: Array,
});
</` + `script>`,
	},
	{
		name: 'TemplateFrame',
		file: 'experiment://components/TemplateFrame.vue',
		role: 'layout',
		editable: true,
		insertable: false,
		props: [],
		source: `<template>
	<div class="mx-auto space-y-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-xl shadow-zinc-950/10">
		<slot />
	</div>
</template>`,
	},
	{
		name: 'HeroPanel',
		file: 'experiment://components/HeroPanel.vue',
		role: 'component',
		editable: true,
		insertable: true,
		props: [],
		source: `<template>
	<section class="flex items-start gap-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
		<div class="flex min-w-0 flex-1 flex-col gap-3">
			<slot />
		</div>
	</section>
</template>`,
	},
	{
		name: 'Badge',
		file: 'experiment://components/Badge.vue',
		role: 'component',
		editable: true,
		insertable: true,
		props: [],
		source: `<template>
	<span class="inline-flex w-fit rounded bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
		<slot />
	</span>
</template>`,
	},
	{
		name: 'MetricGrid',
		file: 'experiment://components/MetricGrid.vue',
		role: 'component',
		editable: true,
		insertable: true,
		props: [{ name: 'items', type: 'Array' }],
	source: `<template>
	<section class="grid grid-cols-1 gap-3 sm:grid-cols-3">
		<article v-for="item in items" :key="item.label" class="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
			<p>{{ item.label }}</p>
			<strong>{{ item.value }}</strong>
		</article>
	</section>
</template>

<script setup>
const props = defineProps({
	items: Array,
});
</` + `script>`,
	},
	{
		name: 'SplitPanel',
		file: 'experiment://components/SplitPanel.vue',
		role: 'component',
		editable: true,
		insertable: true,
		props: [],
		source: `<template>
	<section class="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_0.8fr]">
		<slot />
	</section>
</template>`,
	},
	{
		name: 'TaskList',
		file: 'experiment://components/TaskList.vue',
		role: 'component',
		editable: true,
		insertable: true,
		props: [{ name: 'tasks', type: 'Array' }],
		source: `<template>
	<section class="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
		<p>Tasks</p>
		<article v-for="task in tasks" :key="task.title" class="border-t border-zinc-100 py-2">
			<p>{{ task.title }}</p>
			<p>{{ task.owner }}</p>
			<p>{{ task.due }}</p>
		</article>
	</section>
</template>

<script setup>
const props = defineProps({
	tasks: Array,
});
</` + `script>`,
	},
	{
		name: 'ElButton',
		file: 'experiment://components/ElButton.vue',
		role: 'control',
		editable: true,
		insertable: true,
		props: [],
		source: `<template>
	<button type="button" class="inline-flex h-10 w-fit items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white shadow-sm">
		<slot />
	</button>
</template>`,
	},
	{
		name: 'ElTextInput',
		file: 'experiment://components/ElTextInput.vue',
		role: 'control',
		editable: true,
		insertable: true,
		props: [{ name: 'modelValue', type: 'String' }],
		source: `<template>
	<input class="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-700" :value="modelValue" readonly>
</template>

<script setup>
const props = defineProps({
	modelValue: String,
});
</` + `script>`,
	},
]);

let nextId = 0;
const activeComponentName = ref('ProjectDashboard');
const componentStack = ref(['ProjectDashboard']);
const selectedId = ref('');
const tree = ref(null);
const codeText = ref('');
const codeError = ref('');
const codeDirty = ref(false);
const savedAt = ref('');
const saveTarget = ref('Draft');
const draggingEntry = ref(null);
const draggingNodeId = ref('');
const dropTargetId = ref('');
const newProp = ref({ name: '', type: 'String' });
const isCreateMenuOpen = ref(false);
const isCreateDialogOpen = ref(false);
const createKind = ref('component');
const createFromSelection = ref(false);
const createName = ref('');
const createNameError = ref('');
const codePanelEl = ref(null);
const inactiveClassesForSelection = ref([]);
const componentPreviewCache = new Map();
let tailwindRefreshTimer = null;

const activeComponent = computed(() => componentStore.value.find((component) => component.name === activeComponentName.value));
const sourceFile = computed(() => activeComponent.value?.file || 'experiment://components/Unknown.vue');
const flatNodes = computed(() => tree.value ? flatten(tree.value) : []);
const selectedNode = computed(() => findNode(tree.value, selectedId.value) || tree.value);
const selectedData = computed(() => selectedNode.value?.binding ? getPath(dataModel, selectedNode.value.binding) : null);
const source = computed(() => buildSource(tree.value, activeComponent.value));
const sourceText = computed(() => source.value.rows.map((row) => row.text).join('\n'));
const selectedSourceLine = computed(() => source.value.lineMap[selectedId.value] || selectedNode.value?.sourceLine || 1);
const selectedBaseClass = computed(() => selectedNode.value ? stageBaseClassForNode(selectedNode.value) : '');

/**
 * The insert palette is intentionally narrower than the component registry.
 * Pages and shell/layout wrappers remain editable, but do not get dropped into
 * every component by accident.
 */
const componentPalette = computed(() => componentStore.value
	.filter((component) => component.insertable)
	.map((component) => ({
		id: component.name,
		label: component.name,
		icon: component.role === 'control' ? 'M8 8h8a4 4 0 0 1 0 8H8a4 4 0 0 1 0-8Z' : 'M5 5h14v14H5V5Zm4 4h6M9 13h6',
		create: () => ({
			type: 'component',
			tag: component.name,
			label: component.name,
			props: defaultPropsFor(component),
			children: component.name === 'Badge' || component.name === 'ElButton'
				? [{ type: 'paragraph', label: 'Text', text: component.name === 'Badge' ? 'New' : 'Action', children: [] }]
				: [],
		}),
	})));

/**
 * Recursive render component for the stage. It keeps Vue's normal event model
 * out of the template below and gives every visual node the same selection,
 * drill-down, and drop behavior.
 */
const TemplateNode = defineComponent({
	name: 'TemplateNode',
	props: {
		node: { type: Object, required: true },
		selectedId: { type: String, required: true },
		dropTargetId: { type: String, default: '' },
		dataScope: { type: Object, default: () => ({}) },
	},
	emits: ['select', 'open-component', 'drop-on-node', 'node-drag-start', 'node-drag-over'],
	setup(props, { emit }) {
		function select(event) {
			event.stopPropagation();
			emit('select', props.node.id);
		}

		function open(event) {
			event.stopPropagation();
			emit('open-component', props.node);
		}

		function drop(event) {
			event.preventDefault();
			event.stopPropagation();
			emit('drop-on-node', props.node.id);
		}

		function dragOver(event) {
			event.preventDefault();
			event.stopPropagation();
			emit('node-drag-over', props.node.id);
		}

		function dragNode(event) {
			if (props.node.type === 'root') return;
			event.stopPropagation();
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('application/x-template-node', props.node.id);
			emit('node-drag-start', props.node.id);
		}

		return () => renderNode(props.node, {
			selectedId: props.selectedId,
			dropTargetId: props.dropTargetId,
			scope: props.dataScope,
			select,
			open,
			drop,
			dragOver,
			dragNode,
			emit,
		});
	},
});

watch(activeComponentName, loadActiveComponent, { immediate: true });

watch(sourceText, (next) => {
	if (!codeDirty.value) codeText.value = next;
});

watch([selectedSourceLine, codeText], () => {
	nextTick(applyCodeLineHighlight);
});

watch(selectedId, () => {
	inactiveClassesForSelection.value = [];
});

watch(codeText, () => {
	queueExperimentTailwindRefresh();
});

onMounted(() => {
	loadCustomComponents();
	loadActiveComponent();
	nextTick(applyCodeLineHighlight);
	queueExperimentTailwindRefresh();
});

function applyCodeLineHighlight() {
	const root = codePanelEl.value;
	if (!root) return;
	root.querySelectorAll('.template-selected-code-line, .template-selected-code-gutter').forEach((element) => {
		element.classList.remove('template-selected-code-line', 'template-selected-code-gutter');
	});

	const line = Math.max(selectedSourceLine.value, 1);
	const codeLines = [...root.querySelectorAll('.cm-line')];
	if (!codeLines.length) {
		window.setTimeout(applyCodeLineHighlight, 150);
		return;
	}
	const targetLine = codeLines[line - 1];
	if (targetLine) {
		targetLine.classList.add('template-selected-code-line');
		targetLine.scrollIntoView({ block: 'nearest' });
	}

	const gutter = [...root.querySelectorAll('.cm-lineNumbers .cm-gutterElement')]
		.find((element) => element.textContent?.trim() === String(line));
	gutter?.classList.add('template-selected-code-gutter');
}

function selectFromCodeEvent(event) {
	const root = codePanelEl.value;
	if (!root) return;
	const line = codeLineFromEvent(event);
	if (!line) return;
	const nodeId = nodeIdForSourceLine(line);
	if (!nodeId || !findNode(tree.value, nodeId)) return;
	selectedId.value = nodeId;
	nextTick(applyCodeLineHighlight);
}

function codeLineFromEvent(event) {
	const root = codePanelEl.value;
	const directLine = event?.target?.closest?.('.cm-line');
	if (directLine && root.contains(directLine)) return codeLineIndex(directLine);

	const activeLine = root.querySelector('.cm-activeLine');
	if (activeLine) return codeLineIndex(activeLine);

	const selection = window.getSelection?.();
	const anchor = selection?.anchorNode?.nodeType === Node.TEXT_NODE ? selection.anchorNode.parentElement : selection?.anchorNode;
	const selectedLine = anchor?.closest?.('.cm-line');
	if (selectedLine && root.contains(selectedLine)) return codeLineIndex(selectedLine);
	return 0;
}

function codeLineIndex(lineElement) {
	const root = codePanelEl.value;
	const lines = [...root.querySelectorAll('.cm-line')];
	const index = lines.indexOf(lineElement);
	return index >= 0 ? index + 1 : 0;
}

function nodeIdForSourceLine(line) {
	if (codeDirty.value || codeText.value !== sourceText.value) {
		const nodes = flatNodes.value
			.map(({ node }) => node)
			.filter((node) => node.id && node.sourceLine && node.sourceLine <= line)
			.sort((a, b) => b.sourceLine - a.sourceLine);
		return nodes[0]?.id || null;
	}

	const rows = source.value.rows;
	for (let index = line - 1; index >= 0; index -= 1) {
		if (rows[index]?.id) return rows[index].id;
	}
	return null;
}

function queueExperimentTailwindRefresh() {
	if (typeof window === 'undefined') return;
	window.clearTimeout(tailwindRefreshTimer);
	tailwindRefreshTimer = window.setTimeout(refreshExperimentTailwind, 250);
}

async function refreshExperimentTailwind() {
	if (typeof window === 'undefined') return;
	try {
		const content = [
			codeText.value,
			sourceText.value,
			...componentStore.value.map((component) => sourceForComponent(component)),
		].join('\n');
		const response = await fetch('/experiments/template-editor/tailwind.css', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ content }),
		});
		if (!response.ok) return;
		const css = await response.text();
		let style = document.getElementById('template-editor-tailwind-runtime');
		if (!style) {
			style = document.createElement('style');
			style.id = 'template-editor-tailwind-runtime';
			document.head.appendChild(style);
		}
		style.textContent = css;
	} catch {
		// The endpoint only exists in the local experiment dev server.
	}
}

/**
 * Loads the active component source into both editor surfaces:
 * the CodeMirror-backed code input and the visual stage tree.
 */
function loadActiveComponent({ preferDraft = true } = {}) {
	const component = activeComponent.value;
	if (!component) return;
	const draft = preferDraft && typeof localStorage !== 'undefined'
		? localStorage.getItem(draftStorageKey(component.name))
		: null;
	const nextSource = draft || component.source;
	codeText.value = nextSource;
	applyCode(nextSource, { keepDirty: false, keepSelection: false });
}

function draftStorageKey(componentName) {
	return `template-editor:v2:${componentName}`;
}

/**
 * Returns the most recent source known to the experiment for a component.
 * Reading localStorage here keeps parent previews up to date after a reload,
 * even before the user has drilled into that child component in this session.
 */
function sourceForComponent(component) {
	if (typeof localStorage === 'undefined') return component.source;
	return localStorage.getItem(draftStorageKey(component.name)) || component.source;
}

/**
 * Adds editor-only metadata to a parsed or newly-created node. Vue source does
 * not carry stable node ids, so the visual editor creates them for selection,
 * layer rows, drag/drop, and line-number mapping.
 *
 * @param {Partial<EditorNode>} node
 * @returns {EditorNode}
 */
function stamp(node) {
	return {
		...node,
		id: node.id || `template-node-${++nextId}`,
		props: { ...(node.props || {}) },
		sourceLine: node.sourceLine || null,
		children: (node.children || []).map(stamp),
	};
}

/**
 * Builds the layer panel list from the editor tree while keeping depth for
 * indentation.
 *
 * @param {EditorNode | null} node
 * @param {number} depth
 * @param {{ node: EditorNode, depth: number }[]} out
 * @returns {{ node: EditorNode, depth: number }[]}
 */
function flatten(node, depth = 0, out = []) {
	if (!node) return out;
	out.push({ node, depth });
	(node.children || []).forEach((child) => flatten(child, depth + 1, out));
	return out;
}

/**
 * @param {EditorNode | null} node
 * @param {string} id
 * @returns {EditorNode | null}
 */
function findNode(node, id) {
	if (!node) return null;
	if (node.id === id) return node;
	for (const child of node.children || []) {
		const match = findNode(child, id);
		if (match) return match;
	}
	return null;
}

/**
 * @param {EditorNode | null} node
 * @param {string} id
 * @returns {EditorNode | null}
 */
function findParent(node, id) {
	if (!node) return null;
	for (const child of node.children || []) {
		if (child.id === id) return node;
		const match = findParent(child, id);
		if (match) return match;
	}
	return null;
}

/**
 * Resolves any clicked visual node to the nearest Vue component boundary.
 * This is what makes double-clicking a rendered `<h1>` inside `<HeroPanel>`
 * open HeroPanel.vue instead of editing the raw h1 in isolation.
 *
 * @param {EditorNode | null} node
 * @param {string} id
 * @returns {EditorNode | null}
 */
function findNearestComponent(node, id) {
	const target = findNode(node, id);
	if (!target) return null;
	if (target.type === 'component') return target;

	let parent = findParent(node, id);
	while (parent) {
		if (parent.type === 'component') return parent;
		parent = findParent(node, parent.id);
	}

	return null;
}

/**
 * Reads a simple dot-path from the mock data model. This keeps the POC focused
 * on the editor mechanics; a full builder would replace this with real route,
 * prop, store, and API metadata.
 */
function getPath(obj, path) {
	return path.split('.').reduce((value, key) => value?.[key], obj);
}

function valueFor(binding, fallback = '', scope = {}) {
	const value = binding ? resolveExpression(binding, scope) : null;
	if (Array.isArray(value) || (value && typeof value === 'object')) return fallback;
	return value ?? fallback;
}

function defaultPropsFor(component) {
	return Object.fromEntries((component.props || []).map((prop) => [prop.name, '']));
}

function onDragStart(entry, event) {
	draggingEntry.value = entry;
	dropTargetId.value = '';
	event.dataTransfer.effectAllowed = 'copy';
	event.dataTransfer.setData('application/x-template-component', entry.id);
}

function onDragEnd() {
	draggingEntry.value = null;
	draggingNodeId.value = '';
	dropTargetId.value = '';
}

function addToSelected(entry) {
	insertEntry(entry, selectedId.value);
}

function addFromDrop(targetId) {
	if (draggingNodeId.value) {
		moveNodeAfter(draggingNodeId.value, targetId);
		draggingNodeId.value = '';
		dropTargetId.value = '';
		return;
	}
	if (!draggingEntry.value) return;
	insertEntry(draggingEntry.value, targetId);
	draggingEntry.value = null;
	dropTargetId.value = '';
}

function startNodeDrag(id) {
	draggingNodeId.value = id;
	dropTargetId.value = '';
	selectedId.value = id;
}

function markDropTarget(id) {
	if (!draggingEntry.value && !draggingNodeId.value) return;
	dropTargetId.value = id;
}

function clearDropTarget() {
	dropTargetId.value = '';
}

/**
 * Adds a palette entry to the selected/drop target. If the target is text-like,
 * insertion falls back to the nearest parent container.
 */
function insertEntry(entry, targetId) {
	const target = findNode(tree.value, targetId) || tree.value;
	const parent = canContain(target) ? target : findParent(tree.value, target.id);
	if (!parent) return;
	const node = stamp(entry.create());
	parent.children = [...(parent.children || []), node];
	selectedId.value = node.id;
	visualChanged();
}

function moveNodeAfter(draggedId, targetId) {
	if (!tree.value || draggedId === targetId) return;
	const dragged = findNode(tree.value, draggedId);
	const oldParent = findParent(tree.value, draggedId);
	if (!dragged || !oldParent || isDescendant(dragged, targetId)) return;

	oldParent.children = oldParent.children.filter((child) => child.id !== draggedId);
	const target = findNode(tree.value, targetId);
	if (!target) {
		oldParent.children = [...oldParent.children, dragged];
		return;
	}

	const targetParent = target.type === 'root' ? target : findParent(tree.value, targetId);
	if (!targetParent) {
		oldParent.children = [...oldParent.children, dragged];
		return;
	}

	if (target.type === 'root') {
		target.children = [...(target.children || []), dragged];
	} else {
		const targetIndex = targetParent.children.findIndex((child) => child.id === targetId);
		targetParent.children.splice(targetIndex + 1, 0, dragged);
		targetParent.children = [...targetParent.children];
	}

	selectedId.value = draggedId;
	visualChanged();
}

function isDescendant(node, id) {
	if (!node?.children?.length) return false;
	return node.children.some((child) => child.id === id || isDescendant(child, id));
}

/**
 * Text and binding nodes cannot receive children. Containers, native elements,
 * slots, and component nodes can.
 */
function canContain(node) {
	return !['headline', 'text', 'paragraph', 'literal', 'input'].includes(node.type);
}

function selectNode(id) {
	selectedId.value = id;
}

/**
 * Opens a component editor by switching the active registry record. This is
 * the POC version of moving from an app preview into an individual `.vue` file.
 */
function openComponent(node) {
	const target = findNearestComponent(tree.value, node.id);
	if (!target) return;
	const component = componentStore.value.find((item) => item.name === target.tag);
	if (!component?.editable) return;
	activeComponentName.value = component.name;
	componentStack.value = [...componentStack.value, component.name];
}

function openFromStack(index) {
	const next = componentStack.value[index];
	componentStack.value = componentStack.value.slice(0, index + 1);
	activeComponentName.value = next;
}

function removeSelected() {
	if (!tree.value || selectedId.value === tree.value.id) return;
	const parent = findParent(tree.value, selectedId.value);
	if (!parent) return;
	parent.children = parent.children.filter((child) => child.id !== selectedId.value);
	selectedId.value = parent.id;
	visualChanged();
}

function duplicateSelected() {
	const parent = findParent(tree.value, selectedId.value);
	const node = selectedNode.value;
	if (!parent || !node || node.id === tree.value.id) return;
	const clone = stamp(clearIds(JSON.parse(JSON.stringify(node))));
	parent.children = [...parent.children, clone];
	selectedId.value = clone.id;
	visualChanged();
}

function openCreateDialog(kind, options = {}) {
	createKind.value = kind;
	createFromSelection.value = !!options.fromSelection;
	createName.value = suggestedComponentName(kind, createFromSelection.value ? selectedNode.value : null);
	createNameError.value = '';
	isCreateMenuOpen.value = false;
	isCreateDialogOpen.value = true;
}

function suggestedComponentName(kind, node) {
	if (node?.tag && node.type !== 'element') return `${node.tag}Copy`;
	if (node?.label && node.label !== 'root') return `${node.label.replace(/[^A-Za-z0-9]+/g, '') || 'Custom'}Component`;
	return kind === 'page' ? 'NewPage' : 'NewComponent';
}

function normalizeComponentName(value) {
	const words = value
		.trim()
		.replace(/[^A-Za-z0-9]+/g, ' ')
		.split(' ')
		.filter(Boolean);
	const name = words.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join('');
	return /^[A-Za-z]/.test(name) ? name : `Component${name}`;
}

function createComponentRecord() {
	if (!createName.value.trim()) {
		createNameError.value = 'Name required.';
		return;
	}
	const name = normalizeComponentName(createName.value);
	if (componentStore.value.some((component) => component.name === name)) {
		createNameError.value = 'A component with this name already exists.';
		return;
	}

	const role = createKind.value === 'page' ? 'page' : 'component';
	const source = createFromSelection.value && selectedNode.value && selectedNode.value.type !== 'root'
		? sourceFromSelectedNode(name)
		: blankComponentSource(name, role);

	const component = {
		name,
		file: `experiment://components/${name}.vue`,
		role,
		editable: true,
		insertable: role === 'component',
		custom: true,
		props: [],
		source,
	};

	componentStore.value = [...componentStore.value, component];
	if (role === 'component' && createFromSelection.value) {
		replaceSelectedWithComponent(name);
		saveCurrentDraft();
	}
	persistCustomComponents();
	localStorage.setItem(draftStorageKey(name), source);
	componentPreviewCache.clear();
	activeComponentName.value = name;
	componentStack.value = [...componentStack.value, name];
	isCreateDialogOpen.value = false;
	createName.value = '';
	createNameError.value = '';
}

function sourceFromSelectedNode(name) {
	const node = stamp(clearIds(JSON.parse(JSON.stringify(selectedNode.value))));
	return buildSource({ type: 'root', label: name, children: [node] }, { props: [] }).rows.map((row) => row.text).join('\n');
}

function blankComponentSource(name, role) {
	const label = role === 'page' ? `${name} page` : name;
	return `<template>
	<section class="space-y-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
		<h1>${label}</h1>
		<p>Start building visually or paste Vue template code here.</p>
	</section>
</template>`;
}

function replaceSelectedWithComponent(name) {
	const parent = findParent(tree.value, selectedId.value);
	if (!parent) return;
	const targetIndex = parent.children.findIndex((child) => child.id === selectedId.value);
	if (targetIndex < 0) return;
	const instance = stamp({ type: 'component', tag: name, label: name, props: {}, children: [] });
	parent.children.splice(targetIndex, 1, instance);
	parent.children = [...parent.children];
	selectedId.value = instance.id;
	visualChanged();
}

function saveCurrentDraft() {
	if (!activeComponent.value || typeof localStorage === 'undefined') return;
	const nextSource = sourceText.value;
	activeComponent.value.source = nextSource;
	localStorage.setItem(draftStorageKey(activeComponent.value.name), nextSource);
	if (activeComponent.value.custom) persistCustomComponents();
}

function persistCustomComponents() {
	if (typeof localStorage === 'undefined') return;
	const customComponents = componentStore.value.filter((component) => component.custom);
	localStorage.setItem(customComponentStorageKey(), JSON.stringify(customComponents));
}

function loadCustomComponents() {
	if (typeof localStorage === 'undefined') return;
	try {
		const customComponents = JSON.parse(localStorage.getItem(customComponentStorageKey()) || '[]');
		if (!Array.isArray(customComponents)) return;
		const existing = new Set(componentStore.value.map((component) => component.name));
		componentStore.value = [
			...componentStore.value,
			...customComponents.filter((component) => component?.name && !existing.has(component.name)),
		];
	} catch {
		// Ignore broken experimental drafts rather than blocking the editor.
	}
}

function customComponentStorageKey() {
	return 'template-editor:v2:custom-components';
}

function clearIds(node) {
	const { id, ...rest } = node;
	return {
		...rest,
		children: (rest.children || []).map(clearIds),
	};
}

function updateLabel(value) {
	selectedNode.value.label = value;
	visualChanged();
}

function updateText(value) {
	selectedNode.value.text = value;
	if (selectedNode.value.inline?.some((part) => part.type === 'binding')) {
		selectedNode.value.inline = [
			...selectedNode.value.inline.filter((part) => part.type === 'binding'),
			...(value ? [{ type: 'text', value: ` ${value}` }] : []),
		];
	}
	visualChanged();
}

function updateBinding(value) {
	selectedNode.value.binding = value || null;
	visualChanged();
}

function updateRepeatSource(value) {
	if (!selectedNode.value?.repeat) return;
	selectedNode.value.repeat = parseRepeatSource(value);
	visualChanged();
}

function updateSelectedProp(key, value) {
	selectedNode.value.props = {
		...(selectedNode.value.props || {}),
		[key]: value,
	};
	visualChanged();
}

function updateSelectedClass(value) {
	updateSelectedProp('class', value);
}

function updateSelectedInactiveClasses(values) {
	inactiveClassesForSelection.value = values;
}

/**
 * Visual edits make the editor tree authoritative, so the code pane is
 * regenerated immediately. Direct code edits go through `applyCode` instead.
 */
function visualChanged() {
	codeDirty.value = false;
	codeText.value = sourceText.value;
	savedAt.value = '';
}

function addProp() {
	const name = newProp.value.name.trim();
	if (!name || !activeComponent.value) return;
	activeComponent.value.props = [
		...(activeComponent.value.props || []).filter((prop) => prop.name !== name),
		{ name, type: newProp.value.type || 'String' },
	];
	newProp.value = { name: '', type: 'String' };
	visualChanged();
}

function removeProp(name) {
	if (!activeComponent.value) return;
	activeComponent.value.props = activeComponent.value.props.filter((prop) => prop.name !== name);
	visualChanged();
}

function onCodeInput(value) {
	if (value === codeText.value) return;
	codeText.value = value;
	codeDirty.value = true;
	applyCode(value, { keepDirty: true, keepSelection: true });
}

/**
 * Parses code edits back into the editor tree. The Vue compiler handles
 * supported template syntax, which is why raw fragments like `<p>hello</p>`
 * can now be accepted instead of using brittle line-based parsing.
 */
function applyCode(value, options = {}) {
	try {
		const parsed = parseSource(value);
		tree.value = parsed.tree;
		if (parsed.props.length) activeComponent.value.props = parsed.props;
		if (!options.keepSelection || !findNode(tree.value, selectedId.value)) {
			selectedId.value = tree.value.children[0]?.id || tree.value.id;
		}
		codeError.value = '';
		if (!options.keepDirty) codeDirty.value = false;
	} catch (error) {
		codeError.value = error.message;
	}
}

/**
 * Saves the active component inside this isolated experiment. For now that
 * means localStorage only: no dev middleware, no generated files, and no global
 * app behavior. A later app-builder shell can swap this for real project-file
 * or database persistence.
 */
async function saveActiveComponent() {
	applyCode(codeText.value, { keepDirty: true, keepSelection: true });
	if (codeError.value || !activeComponent.value) return;

	const nextSource = codeForSave(codeText.value);
	codeText.value = nextSource;
	activeComponent.value.source = nextSource;
	componentPreviewCache.clear();
	localStorage.setItem(draftStorageKey(activeComponent.value.name), nextSource);
	if (activeComponent.value.custom) persistCustomComponents();
	saveTarget.value = 'Draft';
	codeDirty.value = false;
	savedAt.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * If the user typed only a template fragment, save a complete SFC generated
 * from the current tree. If they typed a full SFC, preserve it as written.
 */
function codeForSave(value) {
	if (hasTemplateBlock(value)) return replaceTemplateBlock(value, sourceText.value);
	return sourceText.value;
}

function hasTemplateBlock(value) {
	return /<template>[\s\S]*?<\/template>/.test(value);
}

function replaceTemplateBlock(value, generatedSource) {
	const generatedMatch = generatedSource.match(/<template>[\s\S]*?<\/template>/);
	if (!generatedMatch) return generatedSource;
	return value.replace(/<template>[\s\S]*?<\/template>/, generatedMatch[0]);
}

function resetActiveComponent() {
	const seed = componentStore.value.find((component) => component.name === activeComponentName.value);
	if (!seed) return;
	if (typeof localStorage !== 'undefined') localStorage.removeItem(draftStorageKey(seed.name));
	componentPreviewCache.clear();
	loadActiveComponent({ preferDraft: false });
	codeDirty.value = false;
	codeError.value = '';
	savedAt.value = '';
}

/**
 * Converts the simplified editor tree back to a Vue SFC. This generator is
 * intentionally small for the POC; a production builder would preserve comments,
 * formatting, unsupported expressions, imports, styles, and script regions.
 *
 * @param {EditorNode | null} root
 * @param {ComponentRecord | undefined} component
 * @returns {{ rows: { line: number, text: string, id: string | null }[], lineMap: Record<string, number> }}
 */
function buildSource(root, component) {
	const rows = [];
	const lineMap = {};

	push('<template>');
	(root?.children || []).forEach((child) => emitNode(child, 1));
	push('</template>');

	if (component?.props?.length) {
		push('');
		push('<script setup>');
		push('const props = defineProps({');
		component.props.forEach((prop) => push(`\t${prop.name}: ${prop.type || 'String'},`));
		push('});');
		push('</' + 'script>');
	}

	function push(text, id = null, indent = 0) {
		rows.push({
			line: rows.length + 1,
			text: `${'\t'.repeat(indent)}${text}`,
			id,
		});
		if (id && !lineMap[id]) lineMap[id] = rows.length;
	}

	function emitNode(node, depth) {
		if (node.type === 'literal') {
			push(encodeText(node.text || ''), node.id, depth);
			return;
		}
		if (node.type === 'headline') {
			push(`<h1${attrsForNode(node)}>${inlineSource(node)}</h1>`, node.id, depth);
			return;
		}
		if (node.type === 'text') {
			push(`<p${attrsForNode(node)}>${inlineSource(node)}</p>`, node.id, depth);
			return;
		}
		if (node.type === 'paragraph') {
			push(`<p${attrsForNode(node)}>${inlineSource(node)}</p>`, node.id, depth);
			return;
		}
		if (node.type === 'element') {
			emitElement(node, node.tag || 'section', depth);
			return;
		}
		if (node.type === 'component') {
			emitElement(node, node.tag, depth);
		}
	}

	function emitElement(node, tag, depth) {
		const props = attrsForNode(node);
		const inline = inlineSource(node);
		if (!node.children?.length && inline) {
			push(`<${tag}${props}>${inline}</${tag}>`, node.id, depth);
			return;
		}
		if (!node.children?.length && voidTags.has(tag)) {
			push(`<${tag}${props}>`, node.id, depth);
			return;
		}
		if (!node.children?.length) {
			push(`<${tag}${props} />`, node.id, depth);
			return;
		}
		push(`<${tag}${props}>`, node.id, depth);
		node.children.forEach((child) => emitNode(child, depth + 1));
		push(`</${tag}>`, null, depth);
	}

	return { rows, lineMap };
}

function attrsForNode(node) {
	const props = node.props || {};
	const repeat = node.repeat?.source ? ` v-for="${encodeAttribute(node.repeat.source)}"` : '';
	const attrs = Object.entries(props)
		.filter(([, value]) => value !== '' && value != null)
		.map(([key, value]) => key.startsWith(':')
			? ` ${key}="${encodeAttribute(value)}"`
			: ` ${key}="${encodeAttribute(value)}"`)
		.join('');
	return `${repeat}${attrs}`;
}

function bindingExpression(node) {
	return node.binding ? node.binding : JSON.stringify(node.text || node.label);
}

function inlineSource(node) {
	if (node.inline?.length) {
		return node.inline.map((part) => part.type === 'binding'
			? `{{ ${part.value} }}`
			: encodeText(part.value))
			.join('')
			.trim();
	}
	if (node.binding) return `{{ ${bindingExpression(node)} }}`;
	return encodeText(node.text || '');
}

/**
 * Parses either a full Vue SFC or a bare template fragment into the editor tree.
 * Vue compiler locations are kept so stage clicks can point back to source lines.
 */
function parseSource(value, componentName = activeComponentName.value) {
	const templateMatch = value.match(/<template>([\s\S]*?)<\/template>/);
	const template = templateMatch?.[1] ?? value;
	if (!template.trim()) throw new Error('Expected a Vue template.');

	const templateStartLine = templateMatch ? value.slice(0, templateMatch.index).split('\n').length : 1;
	const ast = baseParse(template, { comments: false, decodeEntities });
	const tree = stamp({
		type: 'root',
		label: componentName,
		sourceLine: templateStartLine,
		children: ast.children.map((node) => nodeFromAst(node, templateStartLine)).filter(Boolean),
	});

	return {
		tree,
		props: parseProps(value),
	};
}

/**
 * Converts Vue compiler AST nodes into the smaller node model used by the
 * visual editor. This is where arbitrary Vue syntax gets narrowed into POC
 * concepts such as component, element, paragraph, and binding.
 */
function nodeFromAst(astNode, templateStartLine) {
	if (astNode.type === NodeTypes.TEXT) {
		const text = astNode.content.trim();
		if (!text) return null;
		return stamp({ type: 'literal', label: 'Text', text, sourceLine: sourceLineFor(astNode, templateStartLine), children: [] });
	}
	if (astNode.type === NodeTypes.INTERPOLATION) {
		return stamp({ type: 'text', label: 'Binding', binding: astNode.content.content.trim(), sourceLine: sourceLineFor(astNode, templateStartLine), children: [] });
	}
	if (astNode.type !== NodeTypes.ELEMENT) return null;

	const sourceLine = sourceLineFor(astNode, templateStartLine);
	const attrs = propsFromAst(astNode);
	const repeat = repeatFromAst(astNode);
	const firstText = textContentFromChildren(astNode.children);
	const firstBinding = bindingFromChildren(astNode.children);
	const inline = inlinePartsFromChildren(astNode.children);
	const children = inlineOnlyChildren(astNode.children)
		? []
		: astNode.children.map((child) => nodeFromAst(child, templateStartLine)).filter(Boolean);

	if (astNode.tag === 'h1' && inlineOnlyChildren(astNode.children)) return stamp({ type: 'headline', label: 'Heading', binding: firstBinding, inline, text: firstText, props: attrs, sourceLine, children: [] });
	if (astNode.tag === 'p' && inlineOnlyChildren(astNode.children)) return stamp({ type: firstBinding ? 'text' : 'paragraph', label: firstBinding ? 'Text' : 'Paragraph', binding: firstBinding, inline, text: firstText, props: attrs, sourceLine, children: [] });
	if (isNativeTag(astNode.tag)) return stamp({ type: 'element', tag: astNode.tag, label: astNode.tag, props: attrs, repeat, binding: firstBinding, inline, text: firstText, sourceLine, children });
	return stamp({ type: 'component', tag: astNode.tag, label: astNode.tag, props: attrs, repeat, binding: firstBinding, inline, text: firstText, sourceLine, children });
}

function parseProps(value) {
	const match = value.match(/defineProps\(\{\s*([\s\S]*?)\s*\}\)/);
	if (!match) return [];
	return match[1]
		.split('\n')
		.map((line) => line.trim().replace(/,$/, ''))
		.filter(Boolean)
		.map((line) => {
			const [name, type] = line.split(':').map((part) => part.trim());
			return name ? { name, type: type || 'String' } : null;
		})
		.filter(Boolean);
}

function propsFromAst(astNode) {
	const out = {};
	const hasEditorMarker = astNode.props.some((prop) => prop.type === NodeTypes.ATTRIBUTE && prop.name === 'data-template-node');
	for (const prop of astNode.props) {
		if (prop.type === NodeTypes.ATTRIBUTE) {
			if (prop.name === 'data-template-node') continue;
			if (hasEditorMarker && prop.name === 'draggable') continue;
			const value = prop.value?.content || '';
			out[prop.name] = hasEditorMarker && prop.name === 'class'
				? cleanPastedEditorClasses(value)
				: value;
		}
		if (prop.type === NodeTypes.DIRECTIVE && prop.name !== 'for' && prop.arg?.content) out[`:${prop.arg.content}`] = prop.exp?.content || '';
	}
	return out;
}

function cleanPastedEditorClasses(value) {
	const editorClasses = new Set([
		'relative',
		'transition',
		'outline-none',
		'hover:ring-2',
		'hover:ring-teal-300/60',
		'ring-2',
		'ring-teal-500',
		'ring-offset-2',
		'ring-offset-zinc-50',
		'template-drop-after',
	]);
	return value
		.split(/\s+/)
		.filter((token) => token && !editorClasses.has(token))
		.join(' ');
}

function repeatFromAst(astNode) {
	const directive = astNode.props.find((prop) => prop.type === NodeTypes.DIRECTIVE && prop.name === 'for');
	if (!directive?.exp?.content) return null;
	return parseRepeatSource(directive.exp.content);
}

/**
 * Supports the common `item in items` and `(item, index) in items` forms. The
 * full Vue compiler understands more, but this shape is enough to demonstrate
 * Webflow-style collection/template editing.
 */
function parseRepeatSource(source) {
	const normalized = source.trim();
	const match = normalized.match(/^(?:\(([^)]+)\)|([A-Za-z_$][\w$]*))\s+(?:in|of)\s+(.+)$/);
	if (!match) return { source: normalized, item: 'item', index: '', list: normalized };

	const aliases = (match[1] || match[2] || 'item').split(',').map((part) => part.trim());
	return {
		source: normalized,
		item: aliases[0] || 'item',
		index: aliases[1] || '',
		list: match[3].trim(),
	};
}

function sourceLineFor(astNode, templateStartLine) {
	return templateStartLine + astNode.loc.start.line - 1;
}

function decodeEntities(value) {
	if (typeof document === 'undefined') {
		return value
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&quot;/g, '"')
			.replace(/&amp;/g, '&');
	}
	const textarea = document.createElement('textarea');
	textarea.innerHTML = value;
	return textarea.value;
}

function textContentFromChildren(children) {
	return children.filter((child) => child.type === NodeTypes.TEXT).map((child) => child.content).join('').trim();
}

function bindingFromChildren(children) {
	return children.find((child) => child.type === NodeTypes.INTERPOLATION)?.content.content.trim() || null;
}

function inlinePartsFromChildren(children) {
	const parts = children
		.map((child) => {
			if (child.type === NodeTypes.TEXT) {
				const value = child.content.replace(/\s+/g, ' ');
				return value.trim() ? { type: 'text', value } : null;
			}
			if (child.type === NodeTypes.INTERPOLATION) {
				return { type: 'binding', value: child.content.content.trim() };
			}
			return null;
		})
		.filter(Boolean);
	return parts.length ? parts : null;
}

function inlineOnlyChildren(children) {
	return children.every((child) => {
		if (child.type === NodeTypes.TEXT) return true;
		return child.type === NodeTypes.INTERPOLATION;
	});
}

function resolveExpression(expression, scope = {}) {
	if (!expression) return null;
	const path = expression.trim();
	const [rootKey, ...keys] = path.split('.');
	const root = Object.prototype.hasOwnProperty.call(scope, rootKey) ? scope[rootKey] : dataModel[rootKey];
	return keys.reduce((value, key) => value?.[key], root);
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

function encodeText(value) {
	return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function encodeAttribute(value) {
	return encodeText(value).replace(/"/g, '&quot;');
}

const nativeTags = new Set([
	'a',
	'abbr',
	'address',
	'article',
	'aside',
	'audio',
	'b',
	'blockquote',
	'br',
	'button',
	'canvas',
	'caption',
	'cite',
	'code',
	'col',
	'colgroup',
	'data',
	'dd',
	'del',
	'details',
	'dfn',
	'div',
	'dl',
	'dt',
	'em',
	'fieldset',
	'figcaption',
	'figure',
	'footer',
	'form',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'header',
	'hr',
	'i',
	'iframe',
	'img',
	'input',
	'ins',
	'kbd',
	'label',
	'legend',
	'li',
	'main',
	'mark',
	'meter',
	'nav',
	'ol',
	'optgroup',
	'option',
	'output',
	'p',
	'picture',
	'pre',
	'progress',
	'q',
	'rp',
	'rt',
	'ruby',
	's',
	'samp',
	'select',
	'slot',
	'small',
	'source',
	'span',
	'strong',
	'sub',
	'summary',
	'sup',
	'svg',
	'animate',
	'circle',
	'clipPath',
	'defs',
	'ellipse',
	'feBlend',
	'feColorMatrix',
	'feComposite',
	'feDropShadow',
	'feFlood',
	'feGaussianBlur',
	'feMerge',
	'feMergeNode',
	'feOffset',
	'filter',
	'foreignObject',
	'g',
	'line',
	'linearGradient',
	'marker',
	'mask',
	'path',
	'pattern',
	'polygon',
	'polyline',
	'radialGradient',
	'rect',
	'stop',
	'symbol',
	'text',
	'textPath',
	'tspan',
	'use',
	'view',
	'table',
	'tbody',
	'td',
	'template',
	'textarea',
	'tfoot',
	'th',
	'thead',
	'time',
	'tr',
	'u',
	'ul',
	'var',
	'video',
	'wbr',
]);
const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const replacedPreviewTags = new Set(['audio', 'canvas', 'embed', 'iframe', 'img', 'object', 'picture', 'svg', 'video']);
function isNativeTag(tag) {
	return nativeTags.has(tag);
}

/**
 * Parent previews should reflect the saved child component template, not a
 * hard-coded placeholder. This reads the latest saved component source,
 * parses it once, and reuses the parsed tree until that source changes.
 */
function componentPreviewTree(component) {
	const source = sourceForComponent(component);
	const cacheKey = `${component.name}\n${source}`;
	if (componentPreviewCache.has(cacheKey)) return componentPreviewCache.get(cacheKey);
	const parsed = parseSource(source, component.name);
	componentPreviewCache.set(cacheKey, parsed.tree);
	return parsed.tree;
}

/**
 * Creates the scope a child component template sees when rendered inside a
 * parent. For example `<TaskList :tasks="tasks" />` maps the child prop
 * `tasks` to the parent/mock data array before rendering TaskList.vue.
 */
function componentScopeFor(node, component, outerScope) {
	const scope = { ...(outerScope || {}) };
	const props = node.props || {};
	for (const prop of component.props || []) {
		const propName = prop.name;
		const attrName = kebabCase(propName);
		const dynamicKey = [`:${propName}`, `:${attrName}`].find((key) => Object.prototype.hasOwnProperty.call(props, key));
		const staticKey = [propName, attrName].find((key) => Object.prototype.hasOwnProperty.call(props, key));

		if (dynamicKey) {
			scope[propName] = resolveExpression(props[dynamicKey], outerScope);
		} else if (staticKey) {
			scope[propName] = props[staticKey];
		}
	}
	return scope;
}

function kebabCase(value) {
	return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function camelCase(value) {
	return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function domPropName(name) {
	if (name === 'class' || name.startsWith('data-') || name.startsWith('aria-')) return name;
	return camelCase(name);
}

function toArray(value) {
	if (Array.isArray(value)) return value;
	return value ? [value] : [];
}

function isImageNode(node) {
	return node.type === 'element' && node.tag === 'img';
}

/**
 * Converts saved-template attrs into render attrs. Dynamic attrs are resolved
 * against the component scope so `:value="modelValue"` and `{{ task.title }}`
 * behave like a tiny, visual-only Vue runtime.
 */
function previewAttrsForNode(node, scope, rootCommon = null) {
	const attrs = {};
	for (const [key, value] of Object.entries(node.props || {})) {
		if (key.startsWith(':')) {
			const name = domPropName(key.slice(1));
			const resolved = resolveExpression(value, scope);
			if (isImageNode(node) && name === 'src' && resolved == null) {
				attrs['data-template-src-expression'] = value;
			} else {
				attrs[name] = resolved ?? '';
			}
		} else {
			attrs[domPropName(key)] = value === '' ? true : value;
		}
	}

	if (rootCommon) {
		const savedClass = attrs.class;
		const inheritedClass = rootCommon.class;
		Object.assign(attrs, rootCommon);
		const mergedClass = [inheritedClass, savedClass].filter(Boolean).join(' ');
		if (mergedClass) attrs.class = mergedClass;
		else delete attrs.class;
	}

	if (isImageNode(node)) prepareImagePreviewAttrs(attrs);
	return attrs;
}

function prepareImagePreviewAttrs(attrs) {
	const src = typeof attrs.src === 'string' ? attrs.src.trim() : attrs.src;
	const label = attrs['data-template-src-expression']
		? `:${attrs['data-template-src-expression']}`
		: src || attrs.alt || 'image';
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
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><rect width="960" height="540" rx="24" fill="#f4f4f5"/><rect x="40" y="40" width="880" height="460" rx="18" fill="#fff" stroke="#d4d4d8" stroke-width="4" stroke-dasharray="18 14"/><path d="M250 340l120-130 95 95 58-62 187 197H250z" fill="#ccfbf1" stroke="#14b8a6" stroke-width="8" stroke-linejoin="round"/><circle cx="660" cy="178" r="54" fill="#fde68a" stroke="#f59e0b" stroke-width="8"/><text x="480" y="472" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="28" fill="#52525b">${safeLabel}</text></svg>`;
	return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function renderComponentPreview(node, ctx, common, scope, slotChildren, depth = 0) {
	if (depth > 6) return null;
	const component = componentStore.value.find((item) => item.name === node.tag);
	if (!component) return null;

	try {
		const previewTree = componentPreviewTree(component);
		const componentScope = componentScopeFor(node, component, scope);
		const roots = previewTree.children.flatMap((child) => toArray(renderPreviewNode(child, ctx, node, componentScope, slotChildren, null, depth + 1)));
		if (!roots.length) return null;
		if (roots.length > 1) return h('section', common, roots);
		return renderPreviewNode(previewTree.children[0], ctx, node, componentScope, slotChildren, common, depth + 1);
	} catch {
		return null;
	}
}

/**
 * Renders a saved component template as a preview inside its parent. Internal
 * component nodes deliberately do not get their own editor ids here; clicks
 * bubble to the component instance in the parent, while slotted parent nodes
 * keep their real ids and can still be selected directly.
 */
function renderPreviewNode(node, ctx, ownerNode, scope, slotChildren, rootCommon = null, depth = 0) {
	if (node.type === 'literal') return renderInlineValue(node, node.text || 'Text', scope);
	if (node.repeat) return renderPreviewRepeatNode(node, ctx, ownerNode, scope, slotChildren, rootCommon, depth);
	if (node.type === 'element' && node.tag === 'slot') {
		return slotChildren.length ? slotChildren : h('div', previewAttrsForNode(node, scope, rootCommon), 'Slot content');
	}

	const attrs = previewAttrsForNode(node, scope, rootCommon);
	const children = renderPreviewChildren(node, ctx, ownerNode, scope, slotChildren, depth);

	if (node.type === 'headline') return h('h1', attrs, renderInlineValue(node, 'Heading', scope));
	if (node.type === 'text') return h('p', attrs, renderInlineValue(node, 'Text', scope));
	if (node.type === 'paragraph') return h('p', attrs, renderInlineValue(node, 'Paragraph', scope));
	if (node.type === 'element') {
		const tag = node.tag || 'section';
		return h(tag, attrs, voidTags.has(tag) ? null : (children.length ? children : inlineContentForNode(node, scope)));
	}
	if (node.type === 'component') {
		const previewSlotChildren = slotContentForNode(node, children, scope);
		const preview = renderComponentPreview(node, ctx, attrs, scope, previewSlotChildren, depth + 1);
		if (preview) return preview;
		return h('section', attrs, previewSlotChildren.length ? previewSlotChildren : node.text || node.label);
	}
	return h('section', attrs, children.length ? children : node.label);
}

function renderPreviewChildren(node, ctx, ownerNode, scope, slotChildren, depth) {
	return (node.children || []).flatMap((child) => toArray(renderPreviewNode(child, ctx, ownerNode, scope, slotChildren, null, depth + 1)));
}

function renderPreviewRepeatNode(node, ctx, ownerNode, scope, slotChildren, rootCommon, depth) {
	const items = resolveExpression(node.repeat.list, scope);
	const rows = Array.isArray(items) && items.length ? items : [{ title: 'Example row' }];
	const repeatedRows = rows.flatMap((item, index) => {
		const rowScope = {
			...scope,
			[node.repeat.item]: item,
			...(node.repeat.index ? { [node.repeat.index]: index } : {}),
		};
		const repeatedNode = { ...node, repeat: null };
		return toArray(renderPreviewNode(repeatedNode, ctx, ownerNode, rowScope, slotChildren, null, depth + 1));
	});

	return rootCommon ? h('div', rootCommon, repeatedRows) : repeatedRows;
}

/**
 * Renders one editor node on the visual stage. It does not try to execute real
 * Vue components; instead it approximates them enough for selection, inspection,
 * data-binding previews, and component drill-down.
 */
function renderNode(node, ctx) {
	if (node.type === 'literal') return renderInlineValue(node, node.text || 'Text', ctx.scope || {});

	const selected = ctx.selectedId === node.id;
	const scope = ctx.scope || {};
	const dropTarget = ctx.dropTargetId === node.id && node.type !== 'root';
	const common = previewAttrsForNode(node, scope, {
		'data-template-node': node.id,
		'data-template-selected': selected ? 'true' : null,
		'data-template-drop-target': dropTarget ? 'true' : null,
		draggable: node.type !== 'root',
		onClick: ctx.select,
		onDblclick: ctx.open,
		onDragstart: ctx.dragNode,
		onDragend: onDragEnd,
		onDrop: ctx.drop,
		onDragover: ctx.dragOver,
	});

	const children = renderChildren(node, ctx, scope);

	if (node.repeat) {
		return renderRepeatNode(node, ctx, common, scope);
	}

	const stageClass = stageBaseClassForNode(node);

	if (node.type === 'root') return h('div', { ...common, class: ['min-w-[760px]', stageClass, common.class].filter(Boolean).join(' ') }, children);
	if (node.type === 'component') {
		const slotChildren = slotContentForNode(node, children, scope);
		const preview = renderComponentPreview(node, ctx, common, scope, slotChildren);
		if (preview) return preview;
		if (stageClass && !common.class) common.class = stageClass;
	}

	if (stageClass && !common.class) common.class = stageClass;

	if (node.type === 'headline') return h('h1', common, renderInlineValue(node, 'Heading', scope));
	if (node.type === 'text') return h('p', common, renderInlineValue(node, 'Text', scope));
	if (node.type === 'paragraph') return h('p', common, renderInlineValue(node, 'Paragraph', scope));
	if (node.type === 'element' && node.tag === 'slot') return h('div', common, 'Slot content');
	if (node.type === 'element') return h(node.tag || 'section', common, children.length ? children : inlineContentForNode(node, scope));
	if (node.type === 'component' && node.tag === 'MetricGrid') {
		return h('section', common, dataModel.metrics.map((item) => h('article', { class: 'rounded-lg border border-zinc-200 bg-white p-4 shadow-sm' }, [
			h('p', { class: 'text-xs font-medium text-zinc-500' }, item.label),
			h('strong', { class: 'mt-3 block text-2xl font-semibold text-zinc-950' }, item.value),
		])));
	}
	if (node.type === 'component' && node.tag === 'TaskList') {
		return h('section', common, children.length ? children : renderTaskListPreview(common));
	}
	if (node.type === 'component' && node.tag === 'ElTextInput') return h('input', { ...common, value: node.props?.['model-value'] || node.props?.modelValue || '', readonly: true });
	if (node.type === 'component' && node.tag === 'ElButton') return h('button', { ...common, type: 'button' }, children.length ? children : node.text || 'Button');
	if (node.type === 'component') return h('section', common, children.length ? children : h('span', { class: 'text-xs text-zinc-500' }, `Double-click to edit ${node.tag}`));
	return h('section', common, children.length ? children : node.label);
}

function slotContentForNode(node, renderedChildren, scope) {
	if (renderedChildren.length) return renderedChildren;
	if (!node.inline?.length && !node.binding && !node.text) return [];
	return [renderInlineValue(node, node.text || node.label, scope)];
}

function renderChildren(node, ctx, scope) {
	return (node.children || []).map((child) => h(TemplateNode, {
		key: child.id,
		node: child,
		selectedId: ctx.selectedId,
		dropTargetId: ctx.dropTargetId,
		dataScope: scope,
		onSelect: (id) => ctx.emit('select', id),
		onOpenComponent: (target) => ctx.emit('open-component', target),
		onDropOnNode: (id) => ctx.emit('drop-on-node', id),
		onNodeDragStart: (id) => ctx.emit('node-drag-start', id),
		onNodeDragOver: (id) => ctx.emit('node-drag-over', id),
	}));
}

function inlineContentForNode(node, scope) {
	if (node.inline?.length || node.binding) return renderInlineValue(node, node.text || node.label, scope);
	return node.text || '';
}

function renderTaskListPreview(common) {
	return [
		h('p', { class: 'text-sm font-semibold text-zinc-950' }, 'Tasks'),
		h('div', { class: 'grid gap-2 rounded-md border border-dashed border-teal-300/60 bg-teal-50/40 p-2' }, [
			h('div', { class: 'flex items-center justify-between px-1 text-[11px] font-medium uppercase tracking-[0.14em] text-teal-700' }, [
				h('span', 'task in tasks'),
				h('span', 'template'),
			]),
			...dataModel.tasks.map((task, index) => h('article', {
				class: `border-t border-zinc-100 py-2 ${index > 0 ? 'opacity-90' : ''}`,
				onClick: common.onClick,
				onDblclick: common.onDblclick,
				onDrop: common.onDrop,
				onDragover: common.onDragover,
			}, [
				h('p', { class: 'text-sm text-zinc-700' }, task.title),
				h('p', { class: 'text-xs text-zinc-500' }, task.owner),
				h('p', { class: 'text-xs text-zinc-500' }, task.due),
			])),
		]),
	];
}

/**
 * A `v-for` is represented as one template node with many rendered samples.
 * Dropping a paragraph on any rendered task row edits the single repeated
 * `<article v-for="task in tasks">` template, so all rows update together.
 */
function renderRepeatNode(node, ctx, common, scope) {
	const items = resolveExpression(node.repeat.list, scope);
	const rows = Array.isArray(items) && items.length ? items : [{ title: 'Example row' }];
	return h('div', {
		class: 'grid gap-2 rounded-md border border-dashed border-teal-300/60 bg-teal-50/40 p-2',
		'data-repeat-template': node.id,
	}, [
		h('div', {
			class: 'flex items-center justify-between px-1 text-[11px] font-medium uppercase tracking-[0.14em] text-teal-700',
			onClick: common.onClick,
			onDblclick: common.onDblclick,
			onDrop: common.onDrop,
			onDragover: common.onDragover,
		}, [
			h('span', `${node.repeat.item} in ${node.repeat.list}`),
			h('span', 'template'),
		]),
		...rows.map((item, index) => {
			const repeatScope = {
				...scope,
				[node.repeat.item]: item,
				...(node.repeat.index ? { [node.repeat.index]: index } : {}),
			};
			const children = renderChildren(node, ctx, repeatScope);
			return h(node.tag || 'div', {
				...common,
				key: `${node.id}-${index}`,
				class: `${common.class} ${index > 0 ? 'opacity-90' : ''}`,
			}, children.length ? children : `${node.repeat.item} ${index + 1}`);
		}),
	]);
}

/**
 * Visual styling for known demo components. These are preview defaults, not
 * source-code classes. The inspector shows them separately from the editable
 * `class=""` attribute so users can understand what the stage is adding.
 */
function basePreviewClassForNode(node) {
	if (node.type === 'root') return 'mx-auto space-y-5 rounded-xl border border-zinc-200 bg-zinc-50 p-5 shadow-xl shadow-zinc-950/10';
	if (node.type === 'element' && node.tag === 'slot') return '';
	if (node.type === 'component' && node.tag === 'HeroPanel') return 'flex items-start gap-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm';
	if (node.type === 'component' && node.tag === 'TemplateFrame') return 'mx-auto space-y-5 rounded-xl border border-zinc-200 bg-zinc-50 p-5';
	if (node.type === 'component' && node.tag === 'Badge') return 'inline-flex w-fit rounded bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700';
	if (node.type === 'component' && node.tag === 'SplitPanel') return 'grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_0.8fr]';
	if (node.type === 'component' && node.tag === 'MetricGrid') return 'grid grid-cols-1 gap-3 sm:grid-cols-3';
	if (node.type === 'component' && node.tag === 'TaskList') return 'rounded-xl border border-zinc-200 bg-white p-4 shadow-sm';
	if (node.type === 'component' && node.tag === 'ElButton') return 'inline-flex h-10 w-fit items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white shadow-sm';
	if (node.type === 'component' && node.tag === 'ElTextInput') return 'h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-700';
	if (node.type === 'headline') return 'max-w-xl text-3xl font-semibold tracking-tight text-zinc-950';
	if (node.type === 'text' || node.type === 'paragraph') return 'max-w-lg text-sm leading-6 text-zinc-700';
	if (node.type === 'element' && isEmptyElement(node)) return 'min-h-12 rounded-lg border border-dashed border-zinc-300 bg-white/80 p-4';
	return '';
}

function stageBaseClassForNode(node) {
	if (node.type === 'root') return basePreviewClassForNode(node);
	if (node.props?.class) return '';
	return basePreviewClassForNode(node);
}

function isEmptyElement(node) {
	if (node.type !== 'element') return false;
	if (voidTags.has(node.tag) || replacedPreviewTags.has(node.tag)) return false;
	return !node.children?.length && !node.text && !node.inline?.length;
}
</script>

<template>
	<div class="min-h-screen bg-zinc-950 text-zinc-100">
		<ElSplitterPanel class="h-screen min-h-screen" :start-size="280" :end-size="460" :min-start="220" :min-main="560" :min-end="340">
			<template #start>
				<aside class="h-screen overflow-y-auto border-r border-white/10 bg-zinc-950">
				<div class="border-b border-white/10 p-4">
					<p class="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Experiment</p>
					<h1 class="mt-1 text-sm font-semibold text-white">Vue visual editor</h1>
					<div class="mt-3 flex flex-wrap items-center gap-1 text-xs text-zinc-500">
						<button
							v-for="(name, index) in componentStack"
							:key="`${name}-${index}`"
							type="button"
							class="rounded px-1.5 py-1 hover:bg-white/10 hover:text-white"
							:class="index === componentStack.length - 1 && 'bg-teal-300 text-zinc-950 hover:bg-teal-200 hover:text-zinc-950'"
							@click="openFromStack(index)"
						>{{ name }}</button>
					</div>
				</div>

				<div class="space-y-5 p-4">
					<section>
						<h2 class="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Project components</h2>
						<div class="grid gap-2">
							<button
								v-for="entry in componentPalette"
								:key="entry.id"
								type="button"
								draggable="true"
								class="group flex h-10 items-center gap-3 rounded-md border border-white/10 bg-white/[0.03] px-3 text-left transition hover:border-teal-400/50 hover:bg-teal-400/10"
								@dragstart="onDragStart(entry, $event)"
								@dragend="onDragEnd"
								@click="addToSelected(entry)"
							>
								<svg class="size-4 shrink-0 text-zinc-400 group-hover:text-teal-300" viewBox="0 0 24 24" fill="none" aria-hidden="true">
									<path :d="entry.icon" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
								<span class="truncate text-sm font-medium text-zinc-100">{{ entry.label }}</span>
							</button>
						</div>
					</section>

					<section>
						<h2 class="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">HTML</h2>
						<div class="grid grid-cols-2 gap-2">
							<button
								v-for="entry in primitivePalette"
								:key="entry.id"
								type="button"
								draggable="true"
								class="flex h-9 items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-2 text-xs text-zinc-200 hover:border-teal-400/50 hover:bg-teal-400/10"
								@dragstart="onDragStart(entry, $event)"
								@dragend="onDragEnd"
								@click="addToSelected(entry)"
							>
								<svg class="size-3.5 shrink-0 text-zinc-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
									<path :d="entry.icon" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
								{{ entry.label }}
							</button>
						</div>
					</section>

					<section>
						<h2 class="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Layers</h2>
						<div class="max-h-[32vh] space-y-1 overflow-auto pr-1">
							<button
								v-for="{ node, depth } in flatNodes"
								:key="node.id"
								type="button"
								class="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-xs transition"
								:class="selectedId === node.id ? 'bg-teal-400 text-zinc-950' : 'text-zinc-400 hover:bg-white/10 hover:text-white'"
								:style="{ paddingLeft: `${8 + depth * 14}px` }"
								@click="selectNode(node.id)"
							>
								<span class="size-1.5 rounded-full" :class="selectedId === node.id ? 'bg-zinc-950' : 'bg-zinc-600'"></span>
								<span class="truncate">{{ node.tag || node.label }}</span>
							</button>
						</div>
					</section>
				</div>
				</aside>
			</template>

			<main class="h-screen min-w-0 bg-zinc-100 text-zinc-950">
				<div class="flex h-16 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4">
					<div class="min-w-0">
						<p class="truncate text-sm font-semibold">{{ activeComponentName }}</p>
						<p class="truncate text-xs text-zinc-500">{{ sourceFile }}:{{ selectedSourceLine }}</p>
					</div>
					<div class="flex items-center gap-2">
						<div class="relative">
							<button type="button" class="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-950 text-white hover:bg-zinc-800" aria-label="Create" @click="isCreateMenuOpen = !isCreateMenuOpen">
								<svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
									<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
								</svg>
							</button>
							<div v-if="isCreateMenuOpen" class="absolute right-0 top-10 z-40 grid w-48 gap-1 rounded-md border border-zinc-200 bg-white p-1 text-xs shadow-xl">
								<button type="button" class="rounded px-3 py-2 text-left hover:bg-zinc-100" @click="openCreateDialog('component')">New component</button>
								<button type="button" class="rounded px-3 py-2 text-left hover:bg-zinc-100" @click="openCreateDialog('page')">New page</button>
								<button v-if="selectedNode && selectedNode.type !== 'root'" type="button" class="rounded px-3 py-2 text-left hover:bg-zinc-100" @click="openCreateDialog('component', { fromSelection: true })">Component from selection</button>
							</div>
						</div>
						<button type="button" class="h-8 rounded-md border border-zinc-200 px-3 text-xs font-medium hover:bg-zinc-50" @click="duplicateSelected">Duplicate</button>
						<button type="button" class="h-8 rounded-md border border-rose-200 px-3 text-xs font-medium text-rose-700 hover:bg-rose-50" @click="removeSelected">Delete</button>
					</div>
				</div>

				<div
					class="h-[calc(100vh-4rem)] overflow-auto p-5"
					:class="(draggingEntry || draggingNodeId) && 'bg-teal-50'"
					@dragover.prevent
					@dragleave="clearDropTarget"
					@drop="addFromDrop(selectedId)"
				>
					<TemplateNode
						v-if="tree"
						:node="tree"
						:selected-id="selectedId"
						:drop-target-id="dropTargetId"
						@select="selectNode"
						@open-component="openComponent"
						@drop-on-node="addFromDrop"
						@node-drag-start="startNodeDrag"
						@node-drag-over="markDropTarget"
					/>
				</div>
			</main>

			<template #end>
				<aside class="h-screen min-w-0 overflow-hidden border-l border-white/10 bg-zinc-950">
				<div class="grid h-full min-h-0 grid-rows-[minmax(12rem,auto)_minmax(0,1fr)]">
					<section class="max-h-[48vh] overflow-y-auto border-b border-white/10 p-4">
						<div class="flex items-center justify-between gap-3">
							<div>
								<h2 class="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Component</h2>
								<p class="mt-1 text-sm font-medium text-white">{{ activeComponentName }}</p>
							</div>
							<div class="flex items-center gap-2">
								<button type="button" class="h-7 rounded-md border border-white/10 px-2 text-[11px] font-medium text-zinc-300 hover:bg-white/10" @click="resetActiveComponent">Reset</button>
								<button type="button" class="h-7 rounded-md bg-teal-300 px-2 text-[11px] font-semibold text-zinc-950 hover:bg-teal-200" @click="saveActiveComponent">Save</button>
							</div>
						</div>

						<div class="mt-4 grid gap-3">
							<label class="grid gap-1">
								<span class="text-xs text-zinc-500">Selected label</span>
								<input class="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-teal-300" :value="selectedNode?.label || ''" @input="updateLabel($event.target.value)">
							</label>
							<label v-if="selectedNode && 'binding' in selectedNode" class="grid gap-1">
								<span class="text-xs text-zinc-500">Data binding</span>
								<input class="h-9 rounded-md border border-white/10 bg-white/5 px-3 font-mono text-xs text-white outline-none focus:border-teal-300" :value="selectedNode.binding || ''" @input="updateBinding($event.target.value)">
							</label>
							<label v-if="selectedNode && 'text' in selectedNode" class="grid gap-1">
								<span class="text-xs text-zinc-500">Text</span>
								<input class="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-teal-300" :value="selectedNode.text || ''" @input="updateText($event.target.value)">
							</label>
							<label v-if="selectedNode?.repeat" class="grid gap-1">
								<span class="text-xs text-zinc-500">Repeated template</span>
								<input class="h-9 rounded-md border border-white/10 bg-white/5 px-3 font-mono text-xs text-white outline-none focus:border-teal-300" :value="selectedNode.repeat.source" @input="updateRepeatSource($event.target.value)">
							</label>
							<div v-if="selectedNode && selectedNode.type !== 'root'" class="grid gap-1">
								<span class="text-xs text-zinc-500">Template class</span>
								<div class="template-class-input">
									<ElClassToggleInput
										:key="selectedNode.id"
										:chrome="false"
										:model-value="selectedNode.props?.class || ''"
										:inactive-values="inactiveClassesForSelection"
										:options="tailwindClassIndex"
										placeholder="Add new class"
										@update:model-value="updateSelectedClass"
										@update:inactive-values="updateSelectedInactiveClasses"
									/>
								</div>
							</div>
							<label v-if="selectedBaseClass" class="grid gap-1">
								<span class="text-xs text-zinc-500">Preview base classes</span>
								<textarea class="min-h-16 resize-none rounded-md border border-white/10 bg-black/20 px-3 py-2 font-mono text-[11px] text-zinc-400 outline-none" readonly :value="selectedBaseClass"></textarea>
							</label>
						</div>

						<div v-if="selectedNode?.type === 'component'" class="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3">
							<div class="mb-2 flex items-center justify-between">
								<p class="text-xs font-medium text-zinc-400">Instance props</p>
								<button type="button" class="text-[11px] text-teal-300 hover:text-teal-100" @click="openComponent(selectedNode)">Edit {{ selectedNode.tag }}</button>
							</div>
							<label
								v-for="prop in componentStore.find((component) => component.name === selectedNode.tag)?.props || []"
								:key="prop.name"
								class="mb-2 grid gap-1 last:mb-0"
							>
								<span class="text-[11px] text-zinc-500">{{ prop.name }}</span>
								<input class="h-8 rounded-md border border-white/10 bg-black/20 px-2 font-mono text-xs text-white outline-none focus:border-teal-300" :value="selectedNode.props?.[prop.name] || selectedNode.props?.[`:${prop.name}`] || ''" @input="updateSelectedProp(prop.name, $event.target.value)">
							</label>
						</div>

						<div class="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3">
							<div class="mb-2 flex items-center justify-between">
								<p class="text-xs font-medium text-zinc-400">Component props</p>
								<span class="text-[11px] text-zinc-500">{{ activeComponent?.props?.length || 0 }}</span>
							</div>
							<div class="mb-2 grid grid-cols-[1fr_84px_auto] gap-2">
								<input v-model="newProp.name" class="h-8 rounded-md border border-white/10 bg-black/20 px-2 text-xs text-white outline-none focus:border-teal-300" placeholder="propName">
								<select v-model="newProp.type" class="h-8 rounded-md border border-white/10 bg-black/20 px-2 text-xs text-white outline-none focus:border-teal-300">
									<option>String</option>
									<option>Number</option>
									<option>Boolean</option>
									<option>Array</option>
									<option>Object</option>
								</select>
								<button type="button" class="h-8 rounded-md bg-white/10 px-2 text-xs text-white hover:bg-white/15" @click="addProp">Add</button>
							</div>
							<div class="flex flex-wrap gap-1">
								<button
									v-for="prop in activeComponent?.props || []"
									:key="prop.name"
									type="button"
									class="rounded bg-black/25 px-2 py-1 font-mono text-[11px] text-zinc-300 hover:bg-rose-500/20 hover:text-rose-100"
									@click="removeProp(prop.name)"
								>{{ prop.name }}: {{ prop.type }}</button>
							</div>
						</div>
					</section>

					<section class="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] p-4">
						<div class="mb-2 flex items-center justify-between gap-3">
							<div class="min-w-0">
								<h2 class="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Code</h2>
								<code class="block truncate text-[11px] text-zinc-500">{{ sourceFile }}:{{ selectedSourceLine }}</code>
							</div>
							<p class="shrink-0 text-[11px]" :class="codeError ? 'text-rose-300' : 'text-zinc-500'">
								{{ codeError || (codeDirty ? 'Unsaved' : savedAt ? `${saveTarget} saved ${savedAt}` : 'Synced') }}
							</p>
						</div>
						<div ref="codePanelEl" class="template-code-panel min-h-0 overflow-hidden" @click="selectFromCodeEvent" @keyup="selectFromCodeEvent" @mouseup="selectFromCodeEvent">
							<ElCodeInput
								:model-value="codeText"
								:rows="26"
								:editor="true"
								_register-field="false"
								:chrome="false"
								lang="vue"
								class="template-code-input"
								@update:model-value="onCodeInput"
							/>
						</div>
					</section>
				</div>
				</aside>
			</template>
		</ElSplitterPanel>

		<div v-if="isCreateDialogOpen" class="fixed inset-0 z-50 grid place-items-center bg-zinc-950/70 p-4">
			<form class="w-full max-w-sm rounded-lg border border-white/10 bg-zinc-950 p-4 shadow-2xl" @submit.prevent="createComponentRecord">
				<div class="flex items-start justify-between gap-3">
					<div>
						<p class="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Create</p>
						<h2 class="mt-1 text-base font-semibold text-white">{{ createKind === 'page' ? 'New page' : createFromSelection ? 'Component from selection' : 'New component' }}</h2>
					</div>
					<button type="button" class="rounded px-2 py-1 text-sm text-zinc-400 hover:bg-white/10 hover:text-white" @click="isCreateDialogOpen = false">Close</button>
				</div>
				<label class="mt-4 grid gap-1">
					<span class="text-xs text-zinc-500">Name</span>
					<input v-model="createName" class="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-teal-300" placeholder="HeroFeature">
				</label>
				<p v-if="createNameError" class="mt-2 text-xs text-rose-300">{{ createNameError }}</p>
				<p class="mt-3 text-xs leading-5 text-zinc-500">
					The draft opens immediately so you can build visually or paste Vue template code, then save it back into this experiment.
				</p>
				<div class="mt-4 flex justify-end gap-2">
					<button type="button" class="h-8 rounded-md border border-white/10 px-3 text-xs font-medium text-zinc-300 hover:bg-white/10" @click="isCreateDialogOpen = false">Cancel</button>
					<button type="submit" class="h-8 rounded-md bg-teal-300 px-3 text-xs font-semibold text-zinc-950 hover:bg-teal-200">Create</button>
				</div>
			</form>
		</div>
	</div>
</template>

<style scoped>
:deep(.template-selected-code-line) {
	background: color-mix(in oklch, var(--color-teal-300, #5eead4) 22%, transparent);
	box-shadow: inset 3px 0 0 rgb(45 212 191);
}

:deep(.template-selected-code-gutter) {
	background: color-mix(in oklch, var(--color-teal-300, #5eead4) 30%, transparent);
	color: rgb(15 23 42);
	font-weight: 700;
}

.template-code-panel {
	height: 100%;
	min-height: 0;
}

:deep(.template-code-panel [class*="border-input"]) {
	box-sizing: border-box;
	height: 100%;
	min-height: 0;
}

:deep(.template-code-panel [class*="border-input"] > div) {
	height: 100%;
	min-height: 0;
}

:deep(.template-code-panel .cm-editor) {
	height: 100%;
	min-height: 0 !important;
}

:deep(.template-code-panel .cm-scroller) {
	overflow: auto;
}

:deep(.template-code-panel textarea) {
	height: 100%;
	min-height: 0;
	overflow: auto;
	resize: none;
}

.template-class-input :deep(.el-input) {
	border-color: rgb(255 255 255 / 0.1);
	background: rgb(255 255 255 / 0.05);
	color: white;
	outline: none;
}

.template-class-input :deep(.el-input:focus) {
	border-color: rgb(94 234 212);
	box-shadow: none;
}

.template-class-input :deep(label) {
	color: rgb(228 228 231);
}

.template-class-input :deep(label.opacity-50) {
	color: rgb(113 113 122);
	opacity: 1;
}

.template-class-input :deep(input[type="checkbox"]) {
	accent-color: rgb(45 212 191);
}

:deep([data-template-node]) {
	outline: 0 solid transparent;
	outline-offset: 2px;
	transition: outline-color 120ms ease, box-shadow 120ms ease;
}

:deep([data-template-node]:hover) {
	outline: 2px solid rgb(94 234 212 / 0.65);
}

:deep([data-template-selected="true"]) {
	outline: 2px solid rgb(20 184 166);
	box-shadow: 0 0 0 4px rgb(240 253 250 / 0.9);
}

:deep([data-template-drop-target="true"]) {
	outline: 3px dashed rgb(20 184 166);
	box-shadow: 0 0 0 4px rgb(240 253 250 / 0.9), 0 8px 18px rgb(15 118 110 / 0.22);
}
</style>
