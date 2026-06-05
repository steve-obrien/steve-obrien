<script setup>
import { cloneVNode, computed, defineComponent, h, isVNode, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ElClassToggleInput, ElCodeInput, ElSplitterPanel, ElTreeView } from '../../elements/lib/vue';
import { tailwindClassIndex } from '../../elements/forms/_shared/serverLookup.js';
import { componentRegistry as elementsComponentRegistry, groupedRegistry as elementsGroupedRegistry } from '../../elements/_layout/inspector/componentRegistry.js';
import InspectorField from '../../elements/_layout/inspector/InspectorField.vue';
import { inferSchema } from '../../elements/_layout/inspector/useInspector.js';
import StageViewport from './components/StageViewport.vue';
import TemplateFileBrowser from './components/TemplateFileBrowser.vue';
import TemplateMonacoEditor from './components/TemplateMonacoEditor.vue';
import {
	buildSource,
	evaluatePreviewExpression,
	extractTemplateSource,
	isNativeTag,
	literalExpressionValue,
	parseRepeatSource,
	parseSource as parseEditorSource,
	replacedPreviewTags,
	scopeForRepeatItem,
	stampEditorNode,
	voidTags,
} from './lib/editorModel.js';
import { loadComponentFiles, saveComponentFile } from './lib/componentStorageClient.js';

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
 * @property {number=} sourceLine Best-effort original source start line from Vue compiler locations.
 * @property {number=} sourceEndLine Best-effort original source end line from Vue compiler locations.
 * @property {EditorNode[]=} children Child nodes rendered inside this node.
 */

/**
 * Mock runtime data. The visual stage uses this to make bindings such as
 * `project.name` feel live without needing a real app data-source scanner yet.
 */
const initialRootData = {
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
	<div class="mx-auto space-y-5 rounded-xl border border-border bg-background p-5 shadow-xl">
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
	<section class="flex items-start gap-6 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
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
	<span class="inline-flex w-fit rounded bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
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
		<article v-for="item in items" :key="item.label" class="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
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
	<section class="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
		<p>Tasks</p>
		<article v-for="task in tasks" :key="task.title" class="border-t border-border py-2">
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
	<button type="button" class="inline-flex h-10 w-fit items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm">
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
	<input class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground" :value="modelValue" readonly>
</template>

<script setup>
const props = defineProps({
	modelValue: String,
});
</` + `script>`,
	},
]);

const seedSources = new Map(componentStore.value.map((component) => [component.name, component.source]));

let nextId = 0;
const activeComponentName = ref('ProjectDashboard');
const componentStack = ref(['ProjectDashboard']);
const selectedId = ref('');
const tree = ref(null);
const codeText = ref('');
const codeError = ref('');
const codeDirty = ref(false);
const activeScriptData = ref({});
const rootData = ref(structuredClone(initialRootData));
const rootDataText = ref(JSON.stringify(initialRootData, null, '\t'));
const rootDataError = ref('');
const savedAt = ref('');
const saveTarget = ref('Disk');
const draggingEntry = ref(null);
const draggingNodeId = ref('');
const dropTargetId = ref('');
const dropTargetPosition = ref('');
const newProp = ref({ name: '', type: 'String' });
const newAttr = ref({ name: '', value: '' });
const isCreateMenuOpen = ref(false);
const isCreateDialogOpen = ref(false);
const isDeveloperMenuOpen = ref(false);
const isFileBrowserOpen = ref(false);
const fileBrowserValue = ref('');
const sidebarPanels = ref({ components: true, layers: true });
const createKind = ref('component');
const createFromSelection = ref(false);
const createName = ref('');
const createNameError = ref('');
const codeEditorEl = ref(null);
const stageViewportEl = ref(null);
const isCodeDrawerOpen = ref(true);
const codeDrawerHeight = ref(340);
const selectedCodeLineOverride = ref(0);
const hoveredCodeLineOverride = ref(0);
const hoveredNodeId = ref('');
const inactiveClassesForSelection = ref([]);
const forcedStatesByNodeId = ref({});
const visualUndoStack = ref([]);
const visualRedoStack = ref([]);
const componentPreviewCache = new Map();
let tailwindRefreshTimer = null;
let codeDrawerDrag = null;
let suppressLayerRevealOnce = false;
let suppressCodeRevealOnce = false;
let restoringVisualHistory = false;
let lastVisualHistorySnapshot = null;
let syncingLayerOpenFromCode = false;
let dropTargetHoverId = '';
const componentApiEndpoint = '/experiments/template-editor/components';
const fileBrowserEndpoint = '/experiments/template-editor/files';
const minCodeDrawerHeight = 220;
const maxCodeDrawerHeight = 560;
const maxVisualHistoryEntries = 80;
const paletteDragType = 'application/x-template-component';
const templateNodeDragType = 'application/x-template-node';
const codeDropType = 'application/x-template-code';
const statePreviewOptions = [
	{ id: 'hover', label: 'Hover', attr: 'data-template-force-hover' },
	{ id: 'active', label: 'Active', attr: 'data-template-force-active' },
	{ id: 'focus', label: 'Focus', attr: 'data-template-force-focus' },
	{ id: 'focus-visible', label: 'Focus visible', attr: 'data-template-force-focus-visible' },
	{ id: 'disabled', label: 'Disabled', attr: 'data-template-force-disabled' },
];
const statePreviewVariantOrder = statePreviewOptions.map((option) => option.id);

const activeComponent = computed(() => componentStore.value.find((component) => component.name === activeComponentName.value));
const sourceFile = computed(() => activeComponent.value?.file || 'experiment://components/Unknown.vue');
const sourceFileName = computed(() => shortSourceFile(sourceFile.value));
const flatNodes = computed(() => tree.value ? flatten(tree.value) : []);
const selectedNode = computed(() => findNode(tree.value, selectedId.value) || tree.value);
const stageRootScope = computed(() => ({
	$slots: {},
	...rootData.value,
	...activeScriptData.value,
}));
const selectedData = computed(() => selectedNode.value?.binding ? getPath(stageRootScope.value, selectedNode.value.binding) : null);
const source = computed(() => buildSource(tree.value, sourceComponentForBuild()));
const sourceText = computed(() => source.value.rows.map((row) => row.text).join('\n'));
const codeLineMode = computed(() => codeDirty.value || codeText.value !== sourceText.value);
const selectedSourceLine = computed(() => sourceLineForNode(selectedNode.value, selectedId.value) || 1);
const sourceFileLabel = computed(() => `${sourceFileName.value}:${selectedSourceLine.value}`);
const sourceFileTitle = computed(() => `${sourceFile.value}:${selectedSourceLine.value}`);
const selectedBaseClass = computed(() => selectedNode.value ? stageBaseClassForNode(selectedNode.value) : '');
const selectedStageLabel = computed(() => selectedNode.value ? nodeDisplayLabel(selectedNode.value) : '');
const canDeleteSelected = computed(() => Boolean(tree.value && selectedId.value && selectedId.value !== tree.value.id));
const isRootSelected = computed(() => Boolean(tree.value && selectedNode.value?.id === tree.value.id));
const canPreviewSelectedStates = computed(() => Boolean(selectedNode.value && !isRootSelected.value));
const selectedPreviewStateIds = computed(() => selectedId.value ? forcedStatesByNodeId.value[selectedId.value] || [] : []);
const selectedPreviewStateSet = computed(() => new Set(selectedPreviewStateIds.value));
const selectedPreviewStateClasses = computed(() => selectedNode.value ? statePreviewClassForNode(selectedNode.value) : '');
const selectedInspectorFields = computed(() => inspectorFieldsForNode(selectedNode.value));
const selectedInspectorAttrKeys = computed(() => new Set(selectedInspectorFields.value.flatMap((field) => propAttributeKeys(field.key))));
const selectedAttrs = computed(() => Object.entries(selectedNode.value?.props || {})
	.filter(([key]) => key !== 'class' && !selectedInspectorAttrKeys.value.has(key)));
const canUndoVisual = computed(() => visualUndoStack.value.length > 0);
const canRedoVisual = computed(() => visualRedoStack.value.length > 0);
const layerOpenValues = ref(['root']);
const layerTreeItems = computed(() => tree.value ? [layerItemFromNode(tree.value)] : []);
const selectedLayerValue = computed(() => selectedId.value ? layerValueForNodeId(tree.value, selectedId.value) : '');
const layerDragSourceValue = computed(() => draggingNodeId.value ? layerValueForNodeId(tree.value, draggingNodeId.value) : '');
const hoveredLayerValue = computed(() => hoveredNodeId.value ? layerValueForNodeId(tree.value, hoveredNodeId.value) : '');
const dropTargetLayerValue = computed(() => {
	const targetId = slotDropTargetFromId(dropTargetId.value)?.nodeId || dropTargetId.value;
	return targetId ? layerValueForNodeId(tree.value, targetId) : '';
});
const hoveredSourceLine = computed(() => {
	if (!hoveredNodeId.value) return 0;
	if (hoveredCodeLineOverride.value && nodeIdForSourceLine(hoveredCodeLineOverride.value) === hoveredNodeId.value) {
		return hoveredCodeLineOverride.value;
	}
	return sourceLineForNode(findNode(tree.value, hoveredNodeId.value), hoveredNodeId.value);
});
const normalizedEditorTree = computed(() => tree.value ? normalizeEditorTree(tree.value) : null);
const developerNodeSnapshot = computed(() => ({
	activeComponent: activeComponentName.value,
	sourceFile: sourceFile.value,
	selectedId: selectedId.value,
	hoveredNodeId: hoveredNodeId.value,
	nodeCount: flatNodes.value.length,
	visualHistory: {
		undo: visualUndoStack.value.length,
		redo: visualRedoStack.value.length,
	},
	forcedStatesById: forcedStatesByNodeId.value,
	scriptData: activeScriptData.value,
	tree: tree.value ? serializeEditorNode(tree.value) : null,
	normalizedTree: normalizedEditorTree.value,
}));
const developerNodeSnapshotText = computed(() => JSON.stringify(developerNodeSnapshot.value, null, '\t'));

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

const elementsPaletteGroups = computed(() => Object.entries(elementsGroupedRegistry)
	.map(([group, entries]) => ({
		group,
		entries: entries
			.filter((entry) => entry.group !== 'HTML' && entry.group !== 'Content')
			.map((entry) => ({
				id: `elements:${entry.id}`,
				label: entry.label,
				icon: svgPathIcon(entry.icon),
				create: () => editorNodeFromElementsEntry(entry),
			})),
	}))
	.filter((group) => group.entries.length));

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
		hoveredId: { type: String, default: '' },
		dropTargetId: { type: String, default: '' },
		dropTargetPosition: { type: String, default: '' },
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
			emit('drop-on-node', {
				id: props.node.id,
				position: stageDropPositionFromEvent(event, props.node),
			});
		}

		function dragOver(event) {
			event.preventDefault();
			event.stopPropagation();
			emit('node-drag-over', {
				id: props.node.id,
				position: stageDropPositionFromEvent(event, props.node),
			});
		}

		function dragNode(event) {
			if (props.node.type === 'root') return;
			event.stopPropagation();
			event.dataTransfer.effectAllowed = 'copyMove';
			event.dataTransfer.setData(templateNodeDragType, props.node.id);
			event.dataTransfer.setData(codeDropType, sourceSnippetForNode(props.node));
			event.dataTransfer.setData('text/plain', props.node.label || props.node.tag || props.node.id);
			emit('node-drag-start', props.node.id);
		}

		return () => renderNode(props.node, {
			selectedId: props.selectedId,
			hoveredId: props.hoveredId,
			dropTargetId: props.dropTargetId,
			dropTargetPosition: props.dropTargetPosition,
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

watch(activeComponentName, loadActiveComponent);

watch(selectedId, (id) => {
	inactiveClassesForSelection.value = [];
	if (suppressLayerRevealOnce) {
		suppressLayerRevealOnce = false;
	} else {
		revealNodeInLayers(id);
	}
	if (suppressCodeRevealOnce) {
		suppressCodeRevealOnce = false;
	} else {
		nextTick(applyCodeLineHighlight);
	}
});

watch(codeText, () => {
	queueExperimentTailwindRefresh();
});

watch(forcedStatesByNodeId, () => {
	queueExperimentTailwindRefresh();
}, { deep: true });

watch([isCodeDrawerOpen, codeDrawerHeight], () => {
	nextTick(() => {
		codeEditorEl.value?.layout();
		applyCodeLineHighlight();
	});
});

onMounted(async () => {
	window.addEventListener('keydown', onTemplateEditorKeydown);
	await loadSavedComponents();
	loadActiveComponent();
	nextTick(applyCodeLineHighlight);
	queueExperimentTailwindRefresh();
});

onBeforeUnmount(() => {
	if (typeof window !== 'undefined') window.removeEventListener('keydown', onTemplateEditorKeydown);
	endCodeDrawerResize();
});

function applyCodeLineHighlight() {
	codeEditorEl.value?.revealLine(selectedSourceLine.value);
}

function sourceLineForNode(node, id) {
	if (!node) return 0;
	if (id === selectedId.value && selectedCodeLineOverride.value && nodeIdForSourceLine(selectedCodeLineOverride.value) === id) {
		return selectedCodeLineOverride.value;
	}
	if (codeLineMode.value) return node.sourceLine || source.value.lineMap[id] || 0;
	return source.value.lineMap[id] || node.sourceLine || 0;
}

function selectFromCodeLine(line) {
	if (!line) return;
	const nodeId = nodeIdForSourceLine(line);
	if (!nodeId || !findNode(tree.value, nodeId)) return;
	const selectedNodeChanged = selectedId.value !== nodeId;
	suppressCodeRevealOnce = selectedNodeChanged;
	selectedCodeLineOverride.value = line;
	selectedId.value = nodeId;
	revealNodeInLayers(nodeId);
	if (!selectedNodeChanged) {
		nextTick(() => {
			suppressCodeRevealOnce = false;
		});
	}
}

function selectFromCodeDrop(event) {
	const line = Number(event?.lineNumber) || 0;
	if (!line) return;
	nextTick(() => selectFromCodeLine(line));
}

function nodeIdForSourceLine(line) {
	if (!codeLineMode.value) {
		const rowId = source.value.rows[line - 1]?.id;
		if (rowId) return rowId;
	}

	if (codeDirty.value || codeText.value !== sourceText.value) {
		const rangeId = nodeIdForSourceLineRange(line);
		if (rangeId) return rangeId;

		const nodes = flatNodes.value
			.map(({ node }) => node)
			.filter((node) => node.id && node.sourceLine && node.sourceLine <= line)
			.sort((a, b) => b.sourceLine - a.sourceLine);
		return nodes[0]?.id || null;
	}

	const rangeId = nodeIdForSourceLineRange(line);
	if (rangeId) return rangeId;

	const rows = source.value.rows;
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

function queueExperimentTailwindRefresh() {
	if (typeof window === 'undefined') return;
	window.clearTimeout(tailwindRefreshTimer);
	tailwindRefreshTimer = window.setTimeout(refreshExperimentTailwind, 250);
}

async function refreshExperimentTailwind() {
	if (typeof window === 'undefined') return;
	try {
		const sources = [
			codeText.value,
			sourceText.value,
			...componentStore.value.map((component) => sourceForComponent(component)),
		];
		const sourceContent = sources.join('\n');
		const content = [
			sourceContent,
			statePreviewClassContentForText(sourceContent),
			...flatNodes.value.map(({ node }) => statePreviewClassForNode(node)),
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
		style.textContent = `${css}\n${forcedStateCssForTailwind(css, sourceContent)}`;
	} catch {
		// The endpoint only exists in the local experiment dev server.
	}
}

/**
 * Loads the active component source into both editor surfaces:
 * the Monaco-backed source editor and the visual stage tree.
 */
function loadActiveComponent() {
	const component = activeComponent.value;
	if (!component) return;
	const nextSource = component.source;
	codeText.value = nextSource;
	applyCode(nextSource, { keepDirty: false, keepSelection: false, syncHistory: false });
	resetVisualHistory();
}

function resetVisualHistory() {
	lastVisualHistorySnapshot = captureVisualHistorySnapshot();
	visualUndoStack.value = [];
	visualRedoStack.value = [];
}

function syncVisualHistoryBaseline(options = {}) {
	lastVisualHistorySnapshot = captureVisualHistorySnapshot();
	if (options.clearStacks) {
		visualUndoStack.value = [];
		visualRedoStack.value = [];
	}
}

function captureVisualHistorySnapshot() {
	return cloneData({
		componentName: activeComponentName.value,
		tree: tree.value,
		componentProps: activeComponent.value?.props || [],
		rootData: rootData.value,
		rootDataText: rootDataText.value,
		forcedStatesByNodeId: forcedStatesByNodeId.value,
		selectedId: selectedId.value,
		layerOpenValues: layerOpenValues.value,
	});
}

function commitVisualHistory(afterSnapshot) {
	if (!afterSnapshot) return;
	if (!lastVisualHistorySnapshot) {
		lastVisualHistorySnapshot = cloneData(afterSnapshot);
		return;
	}
	if (historySnapshotsEqual(lastVisualHistorySnapshot, afterSnapshot)) {
		lastVisualHistorySnapshot = cloneData(afterSnapshot);
		return;
	}

	visualUndoStack.value = [
		...visualUndoStack.value,
		cloneData(lastVisualHistorySnapshot),
	].slice(-maxVisualHistoryEntries);
	visualRedoStack.value = [];
	lastVisualHistorySnapshot = cloneData(afterSnapshot);
}

function undoVisualEdit() {
	if (!visualUndoStack.value.length) return false;
	const current = captureVisualHistorySnapshot();
	const previous = visualUndoStack.value.at(-1);
	visualUndoStack.value = visualUndoStack.value.slice(0, -1);
	visualRedoStack.value = [
		cloneData(current),
		...visualRedoStack.value,
	].slice(0, maxVisualHistoryEntries);
	if (!restoreVisualHistorySnapshot(previous)) return false;
	lastVisualHistorySnapshot = cloneData(previous);
	return true;
}

function redoVisualEdit() {
	if (!visualRedoStack.value.length) return false;
	const current = captureVisualHistorySnapshot();
	const next = visualRedoStack.value[0];
	visualRedoStack.value = visualRedoStack.value.slice(1);
	visualUndoStack.value = [
		...visualUndoStack.value,
		cloneData(current),
	].slice(-maxVisualHistoryEntries);
	if (!restoreVisualHistorySnapshot(next)) return false;
	lastVisualHistorySnapshot = cloneData(next);
	return true;
}

function restoreVisualHistorySnapshot(snapshot) {
	if (!snapshot || snapshot.componentName !== activeComponentName.value) return false;
	restoringVisualHistory = true;
	try {
		tree.value = cloneData(snapshot.tree);
		if (activeComponent.value) activeComponent.value.props = cloneData(snapshot.componentProps || []);
		rootData.value = cloneData(snapshot.rootData || {});
		rootDataText.value = snapshot.rootDataText || JSON.stringify(rootData.value, null, '\t');
		forcedStatesByNodeId.value = cloneData(snapshot.forcedStatesByNodeId || {});
		layerOpenValues.value = Array.isArray(snapshot.layerOpenValues) ? [...snapshot.layerOpenValues] : ['root'];
		selectedCodeLineOverride.value = 0;
		selectedId.value = findNode(tree.value, snapshot.selectedId)
			? snapshot.selectedId
			: tree.value?.id || '';
		pruneForcedStates();
		codeDirty.value = false;
		codeError.value = '';
		savedAt.value = '';
		componentPreviewCache.clear();
		codeText.value = sourceText.value;
		restoreVisualEditFocus(selectedId.value);
		return true;
	} finally {
		restoringVisualHistory = false;
	}
}

function historySnapshotsEqual(left, right) {
	return JSON.stringify(left) === JSON.stringify(right);
}

function cloneData(value) {
	if (value === undefined || value === null) return value;
	return JSON.parse(JSON.stringify(value));
}

function onTemplateEditorKeydown(event) {
	if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
	const key = event.key.toLowerCase();
	if (key !== 'z' && key !== 'y') return;
	if (isEditableShortcutTarget(event.target)) return;

	const handled = key === 'z' && !event.shiftKey
		? undoVisualEdit()
		: redoVisualEdit();
	if (!handled) return;
	event.preventDefault();
}

function isEditableShortcutTarget(target) {
	if (!(target instanceof Element)) return false;
	return Boolean(target.closest('input, textarea, select, [contenteditable="true"], .monaco-editor'));
}

/**
 * Returns the most recent source known to the experiment for a component.
 * Parent previews use this so they stay in sync with saved child component
 * edits even before the user drills into that child component.
 */
function sourceForComponent(component) {
	return component.source;
}

async function loadSavedComponents() {
	try {
		const savedComponents = await loadComponentFiles(componentApiEndpoint);
		if (!savedComponents.length) return;

		const savedByName = new Map(savedComponents.map((component) => [component.name, component]));
		const merged = componentStore.value.map((component) => savedByName.has(component.name)
			? {
				...component,
				...savedByName.get(component.name),
				props: Array.isArray(savedByName.get(component.name).props) ? savedByName.get(component.name).props : component.props,
			}
			: component);
		const existing = new Set(merged.map((component) => component.name));
		componentStore.value = [
			...merged,
			...savedComponents.filter((component) => !existing.has(component.name)),
		];
		componentPreviewCache.clear();
	} catch {
		// The file-backed API only exists in Vite dev; the demo still works in static builds.
	}
}

async function saveComponentToDisk(component, source) {
	if (!component) return null;
	try {
		return await saveComponentFile(componentApiEndpoint, component, source);
	} catch (error) {
		codeError.value = error instanceof Error ? error.message : 'Could not save component to disk.';
		return null;
	}
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
	return stampEditorNode(node, allocateTemplateNodeId);
}

function allocateTemplateNodeId() {
	nextId += 1;
	return `template-node-${nextId}`;
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

function layerItemFromNode(node, path = []) {
	const children = (node.children || []).map((child, index) => layerItemFromNode(child, [...path, index]));
	return {
		id: layerValueForPath(path),
		nodeId: node.id,
		label: nodeDisplayLabel(node),
		icon: iconForEditorNode(node),
		acceptsChildren: canContain(node),
		draggable: node.type !== 'root',
		children,
	};
}

function nodeDisplayLabel(node) {
	return node.tag || node.label || node.text || node.binding || node.type;
}

function serializeEditorNode(node, path = []) {
	const snapshot = {
		id: node.id,
		path: layerValueForPath(path),
		type: node.type,
	};
	for (const key of ['tag', 'label', 'text', 'binding', 'sourceLine', 'sourceEndLine']) {
		if (node[key] !== undefined && node[key] !== null && node[key] !== '') snapshot[key] = node[key];
	}
	if (node.inline?.length) snapshot.inline = node.inline;
	if (node.repeat) snapshot.repeat = node.repeat;
	if (node.props && Object.keys(node.props).length) snapshot.props = node.props;
	if (node.children?.length) {
		snapshot.children = node.children.map((child, index) => serializeEditorNode(child, [...path, index]));
	}
	return snapshot;
}

function normalizeEditorTree(node) {
	const normalized = {
		rootId: node.id,
		selectedId: selectedId.value,
		hoveredId: hoveredNodeId.value,
		layerValueById: {},
		sourceLineById: {},
		sourceEndLineById: {},
		previewStatesById: {},
		nodesById: {},
	};
	normalizeEditorNode(node, normalized, null, []);
	return normalized;
}

function normalizeEditorNode(node, normalized, parentId, path) {
	const layerValue = layerValueForPath(path);
	normalized.layerValueById[node.id] = layerValue;
	if (node.sourceLine) normalized.sourceLineById[node.id] = node.sourceLine;
	if (node.sourceEndLine) normalized.sourceEndLineById[node.id] = node.sourceEndLine;
	if (forcedStatesByNodeId.value[node.id]?.length) normalized.previewStatesById[node.id] = forcedStatesByNodeId.value[node.id];
	normalized.nodesById[node.id] = {
		id: node.id,
		parentId,
		childIds: (node.children || []).map((child) => child.id),
		path: layerValue,
		type: node.type,
		tag: node.tag || null,
		label: node.label || node.tag || node.type,
		sourceLine: node.sourceLine || null,
		sourceEndLine: node.sourceEndLine || null,
		previewStates: forcedStatesByNodeId.value[node.id]?.length ? forcedStatesByNodeId.value[node.id] : undefined,
		props: node.props && Object.keys(node.props).length ? node.props : undefined,
		repeat: node.repeat || undefined,
	};
	(node.children || []).forEach((child, index) => normalizeEditorNode(child, normalized, node.id, [...path, index]));
}

function svgPathIcon(icon) {
	return typeof icon === 'string' && /^M[\d\s.,-]/.test(icon)
		? icon
		: 'M5 5h14v14H5V5Zm4 4h6M9 13h6';
}

function revealNodeInLayers(id) {
	const path = nodePathToLayerValues(tree.value, id);
	if (!path.length) return;
	sidebarPanels.value = {
		...sidebarPanels.value,
		layers: true,
	};
	const ancestorIds = path.slice(0, -1);
	if (!ancestorIds.length) return;
	const openValues = new Set(layerOpenValues.value.map(String));
	ancestorIds.forEach((value) => openValues.add(String(value)));
	layerOpenValues.value = [...openValues];
}

function onLayerOpenValuesUpdate(values) {
	layerOpenValues.value = values;
}

function onLayerToggle(event) {
	if (syncingLayerOpenFromCode) return;
	const nodeId = event?.item?.nodeId;
	const node = findNode(tree.value, nodeId);
	const line = codeFoldLineForNode(node, nodeId);
	if (!line) return;
	if (event.open) codeEditorEl.value?.unfoldLine(line, { descendants: true });
	else codeEditorEl.value?.foldLine(line);
}

function onCodeFoldingChange(ranges) {
	const nextOpenValues = layerOpenValuesForCollapsedCodeRanges(ranges);
	syncingLayerOpenFromCode = true;
	layerOpenValues.value = nextOpenValues;
	nextTick(() => {
		syncingLayerOpenFromCode = false;
	});
}

function layerOpenValuesForCollapsedCodeRanges(ranges) {
	const collapsedNodeIds = nodeIdsForCollapsedCodeRanges(ranges);
	return flatNodes.value
		.filter(({ node }) => node.children?.length)
		.filter(({ node }) => !collapsedNodeIds.has(node.id))
		.map(({ node }) => layerValueForNodeId(tree.value, node.id))
		.filter(Boolean);
}

function nodeIdsForCollapsedCodeRanges(ranges) {
	const ids = new Set();
	for (const range of normalizeCollapsedCodeRanges(ranges)) {
		const id = range.startLine === 1 && tree.value
			? tree.value.id
			: nodeIdForSourceLine(range.startLine);
		if (id && findNode(tree.value, id)) ids.add(id);
	}
	return ids;
}

function normalizeCollapsedCodeRanges(ranges) {
	return (Array.isArray(ranges) ? ranges : [])
		.map((range) => ({
			startLine: Number(range.startLine || range.startLineNumber || range.start || 0),
			endLine: Number(range.endLine || range.endLineNumber || range.end || 0),
		}))
		.filter((range) => range.startLine > 0 && range.endLine >= range.startLine);
}

function codeFoldLineForNode(node, id) {
	if (!node) return 0;
	if (node.type === 'root') return 1;
	if (!codeLineMode.value) return source.value.lineMap[id] || node.sourceLine || 0;
	return node.sourceLine || source.value.lineMap[id] || 0;
}

function layerValueForPath(path) {
	return path.length ? `root/${path.join('/')}` : 'root';
}

function layerValueForNodeId(node, id, path = []) {
	if (!node || !id) return '';
	if (node.id === id) return layerValueForPath(path);
	for (let index = 0; index < (node.children || []).length; index += 1) {
		const value = layerValueForNodeId(node.children[index], id, [...path, index]);
		if (value) return value;
	}
	return '';
}

function nodeIdForLayerValue(node, value, path = []) {
	if (!node || !value) return '';
	if (layerValueForPath(path) === value) return node.id;
	for (let index = 0; index < (node.children || []).length; index += 1) {
		const id = nodeIdForLayerValue(node.children[index], value, [...path, index]);
		if (id) return id;
	}
	return '';
}

function nodePathToLayerValues(node, id, path = [], values = []) {
	if (!node) return [];
	const nextValues = [...values, layerValueForPath(path)];
	if (node.id === id) return nextValues;
	for (let index = 0; index < (node.children || []).length; index += 1) {
		const childPath = nodePathToLayerValues(node.children[index], id, [...path, index], nextValues);
		if (childPath.length) return childPath;
	}
	return [];
}

function iconForEditorNode(node) {
	if (node.type === 'root') return 'M4 5h16v14H4V5Zm4 0v14M4 9h16';
	if (node.type === 'component') return 'M5 5h14v14H5V5Zm4 4h6M9 13h6';
	if (node.type === 'headline') return 'M6 5v14M18 5v14M6 12h12';
	if (node.type === 'text' || node.type === 'paragraph' || node.type === 'literal') return 'M6 7h12M6 12h9M6 17h11';
	return 'M5 6h14v12H5V6Z';
}

function editorNodeFromElementsEntry(entry) {
	const component = entry.componentName || entry.component;
	if (component == null) {
		return { type: 'paragraph', label: entry.label, text: entry.defaults?.text || 'Edit me', props: {}, children: [] };
	}

	const tag = typeof component === 'string' ? component : entry.componentName;
	const props = propsForTemplate(entry.defaults?.props || {});
	const children = (entry.defaults?.children || []).map((child) => editorNodeFromStudioSpec(child));
	const inlineText = entry.defaults?.text || '';
	const type = isNativeTag(tag) ? nativeEditorType(tag, children, inlineText) : 'component';

	return {
		type,
		tag,
		label: entry.label,
		text: inlineText,
		props,
		children,
	};
}

function editorNodeFromStudioSpec(spec) {
	if (spec.component == null && spec.text != null) {
		return { type: 'paragraph', label: 'Text', text: spec.text, props: {}, children: [] };
	}

	const tag = typeof spec.component === 'string' ? spec.component : spec.componentName;
	const children = (spec.children || []).map((child) => editorNodeFromStudioSpec(child));
	const text = spec.text || '';
	return {
		type: isNativeTag(tag) ? nativeEditorType(tag, children, text) : 'component',
		tag,
		label: spec.label || tag || 'Node',
		text,
		props: propsForTemplate(spec.props || {}),
		children,
	};
}

function nativeEditorType(tag, children, text) {
	if (tag === 'h1' || tag === 'h2' || tag === 'h3') return 'headline';
	if (tag === 'p') return text || !children.length ? 'paragraph' : 'element';
	return 'element';
}

function propsForTemplate(props) {
	return Object.fromEntries(Object.entries(props)
		.filter(([, value]) => value !== undefined && value !== null)
		.map(([key, value]) => typeof value === 'string'
			? [key, value]
			: [`:${key}`, JSON.stringify(value)]));
}

function templateExpressionForValue(value) {
	return JSON.stringify(value);
}

function inspectorFieldsForNode(node) {
	if (!node || node.type !== 'component') return [];

	const entry = elementsEntryForTag(node.tag);
	if (entry?.component && typeof entry.component !== 'string') {
		return inferSchema({
			id: node.id,
			label: node.label || entry.label,
			component: entry.component,
			props: node.props || {},
			children: [],
		}).filter((field) => field.key !== 'class');
	}

	const component = componentStore.value.find((item) => item.name === node.tag);
	return (component?.props || []).map((prop) => fieldForComponentProp(prop));
}

function elementsEntryForTag(tag) {
	return elementsComponentRegistry.find((entry) => entry.componentName === tag || entry.tag === tag);
}

function fieldForComponentProp(prop) {
	const type = prop.type || 'String';
	return {
		key: prop.name,
		label: prettifyPropName(prop.name),
		component: editorForPropType(type),
		props: type === 'Array' || type === 'Object'
			? { rows: 5, editor: false }
			: {},
	};
}

function editorForPropType(type) {
	if (type === 'Boolean') return 'ElToggle';
	if (type === 'Number') return 'ElNumberInput';
	if (type === 'Array' || type === 'Object') return 'ElJsonInput';
	return 'ElTextInput';
}

function propAttributeKeys(key) {
	const kebab = kebabCase(key);
	return [key, `:${key}`, kebab, `:${kebab}`];
}

function prettifyPropName(value) {
	return value
		.replace(/([A-Z])/g, ' $1')
		.replace(/^./, (letter) => letter.toUpperCase())
		.replace(/Model Value/, 'Value');
}

function shortSourceFile(file) {
	const parts = String(file || '').split('/').filter(Boolean);
	return parts[parts.length - 1] || 'Unknown.vue';
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

function sourceSnippetForEntry(entry) {
	if (!entry?.create) return '';
	return sourceSnippetForNode(entry.create());
}

function sourceSnippetForNode(node) {
	if (!node) return '';
	const cleanNode = clearIds(cloneData(node));
	const rows = buildSource({ type: 'root', label: 'Snippet', children: [cleanNode] }, { props: [] })
		.rows
		.map((row) => row.text)
		.slice(1, -1);
	return rows
		.map((line) => line.startsWith('\t') ? line.slice(1) : line)
		.join('\n')
		.trimEnd();
}

function onDragStart(entry, event) {
	draggingEntry.value = entry;
	clearDropTarget();
	event.dataTransfer.effectAllowed = 'copy';
	event.dataTransfer.setData(paletteDragType, entry.id);
	event.dataTransfer.setData(codeDropType, sourceSnippetForEntry(entry));
	event.dataTransfer.setData('text/plain', entry.label || entry.id);
}

function onDragEnd() {
	draggingEntry.value = null;
	draggingNodeId.value = '';
	clearDropTarget();
}

function clearHoveredStageNode() {
	setHoveredNode('');
}

function setHoveredNode(id, options = {}) {
	hoveredCodeLineOverride.value = options.codeLine || 0;
	if (hoveredNodeId.value !== id) hoveredNodeId.value = id;
}

function focusStageViewport() {
	nextTick(() => stageViewportEl.value?.focus());
}

function hoverNodeFromLayer(event) {
	setHoveredNode(event.item?.nodeId || '');
}

function clearNodeHoverFromLayer(event) {
	if (event?.item?.nodeId && hoveredNodeId.value !== event.item.nodeId) return;
	setHoveredNode('');
}

function hoverNodeFromCodeLine(line) {
	const nodeId = nodeIdForSourceLine(line);
	const resolvedId = nodeId && findNode(tree.value, nodeId) ? nodeId : '';
	setHoveredNode(resolvedId, { codeLine: resolvedId ? line : 0 });
}

function addToSelected(entry) {
	insertEntry(entry, selectedId.value);
}

function addFromDrop(target) {
	const { id: targetId, position } = dropDetailsFromTarget(target, selectedId.value);
	if (!targetId) return;
	const slotTarget = slotDropTargetFromId(targetId);
	if (slotTarget) {
		if (draggingNodeId.value) {
			moveNodeToSlot(draggingNodeId.value, slotTarget.nodeId, slotTarget.name);
			draggingNodeId.value = '';
			clearDropTarget();
			return;
		}
		if (!draggingEntry.value) return;
		insertEntryInSlot(draggingEntry.value, slotTarget.nodeId, slotTarget.name);
		draggingEntry.value = null;
		clearDropTarget();
		return;
	}
	if (draggingNodeId.value) {
		moveNodeTo(draggingNodeId.value, targetId, position);
		draggingNodeId.value = '';
		clearDropTarget();
		return;
	}
	if (!draggingEntry.value) return;
	insertEntryAt(draggingEntry.value, targetId, position);
	draggingEntry.value = null;
	clearDropTarget();
}

function startNodeDrag(id) {
	draggingNodeId.value = id;
	clearDropTarget();
	selectedCodeLineOverride.value = 0;
	selectedId.value = id;
	revealNodeInLayers(id);
}

function toggleDeveloperMenu() {
	isDeveloperMenuOpen.value = !isDeveloperMenuOpen.value;
	if (isDeveloperMenuOpen.value) isCreateMenuOpen.value = false;
}

function markDropTarget(target) {
	if (!draggingEntry.value && !draggingNodeId.value) return;
	const { id, position } = dropDetailsFromTarget(target);
	if (!canDropOnStageTarget(id, position)) {
		clearDropTarget();
		return;
	}
	const layerTargetId = slotDropTargetFromId(id)?.nodeId || id;
	if (dropTargetId.value !== id) revealNodeInLayers(layerTargetId);
	dropTargetId.value = id;
	dropTargetPosition.value = position;
	previewHoveredDropTarget(id);
}

function clearDropTarget() {
	dropTargetId.value = '';
	dropTargetPosition.value = '';
	clearDropTargetHover();
}

function dropDetailsFromTarget(target, fallbackId = '') {
	if (target && typeof target === 'object') {
		return {
			id: target.id || target.nodeId || target.item?.nodeId || '',
			position: normalizeDropPosition(target.position, dropTargetPosition.value || 'inside'),
		};
	}

	return {
		id: target || fallbackId,
		position: normalizeDropPosition(dropTargetPosition.value, 'inside'),
	};
}

function normalizeDropPosition(position, fallback = 'inside') {
	return ['before', 'inside', 'after'].includes(position) ? position : fallback;
}

function canDropOnStageTarget(id, position) {
	if (!id) return false;
	const slotTarget = slotDropTargetFromId(id);
	if (slotTarget) return canDropIntoSlotTarget(slotTarget, position);
	if (draggingNodeId.value) return canMoveNodeTo(draggingNodeId.value, id, position);
	if (draggingEntry.value) return canInsertAtLayer(id, position);
	return false;
}

function previewHoveredDropTarget(id) {
	const nodeId = slotDropTargetFromId(id)?.nodeId || id;
	const node = findNode(tree.value, nodeId);
	if (!node) return;
	dropTargetHoverId = nodeId;
	setHoveredNode(nodeId, { codeLine: sourceLineForNode(node, nodeId) });
}

function clearDropTargetHover() {
	if (dropTargetHoverId && hoveredNodeId.value === dropTargetHoverId) setHoveredNode('');
	dropTargetHoverId = '';
}

function canDropLayerItem({ source, target, position }) {
	return canMoveNodeTo(source?.nodeId, target?.nodeId, position);
}

function canDropExternalLayer({ item, position }) {
	if (!draggingEntry.value) return false;
	return canInsertAtLayer(item?.nodeId, position);
}

function onLayerReorder(event) {
	const sourceId = event.item?.nodeId || event.source?.nodeId || nodeIdForLayerValue(tree.value, event.sourceValue);
	const targetId = event.target?.nodeId || nodeIdForLayerValue(tree.value, event.targetValue);
	if (!moveNodeTo(sourceId, targetId, event.position)) return;
	draggingNodeId.value = '';
	clearDropTarget();
}

function onLayerExternalDrop(event) {
	const entry = paletteEntryForId(event.getData(paletteDragType));
	if (!entry || !canInsertAtLayer(event.item?.nodeId, event.position)) return;
	insertEntryAt(entry, event.item.nodeId, event.position);
	draggingEntry.value = null;
	clearDropTarget();
}

function onLayerDragPreview(event) {
	const targetId = event.item?.nodeId || nodeIdForLayerValue(tree.value, event.value);
	if (!targetId) return;
	if (dropTargetId.value !== targetId) revealNodeInLayers(targetId);
	dropTargetId.value = targetId;
	dropTargetPosition.value = normalizeDropPosition(event.position, 'inside');
	previewHoveredDropTarget(targetId);
}

function clearLayerDragPreview() {
	clearDropTarget();
}

function paletteEntryForId(id) {
	if (!id) return null;
	return [
		...componentPalette.value,
		...primitivePalette,
		...elementsPaletteGroups.value.flatMap((group) => group.entries),
	].find((entry) => entry.id === id);
}

function canInsertAtLayer(targetId, position) {
	const target = findNode(tree.value, targetId);
	if (!target) return false;
	if (position === 'inside') return canContain(target);
	return target.type !== 'root' && Boolean(findParent(tree.value, target.id));
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

function insertEntryAt(entry, targetId, position = 'inside') {
	const node = stamp(entry.create());
	if (!insertNodeAt(node, targetId, position)) return;
	selectedId.value = node.id;
	visualChanged();
}

function insertNodeAt(node, targetId, position = 'inside') {
	const target = findNode(tree.value, targetId) || tree.value;
	if (!target) return false;
	if (position === 'inside') {
		const parent = canContain(target) ? target : findParent(tree.value, target.id);
		if (!parent) return false;
		parent.children = [...(parent.children || []), node];
		return true;
	}

	if (target.type === 'root') return false;
	const parent = findParent(tree.value, target.id);
	if (!parent) return false;
	const targetIndex = parent.children.findIndex((child) => child.id === target.id);
	if (targetIndex < 0) return false;
	parent.children.splice(position === 'before' ? targetIndex : targetIndex + 1, 0, node);
	parent.children = [...parent.children];
	return true;
}

function insertEntryInSlot(entry, componentId, slotName) {
	const componentNode = findNode(tree.value, componentId);
	if (!componentNode || componentNode.type !== 'component') return false;
	const slotTemplate = ensureSlotTemplateNode(componentNode, slotName);
	const node = stamp(entry.create());
	slotTemplate.children = [...(slotTemplate.children || []), node];
	selectedId.value = node.id;
	visualChanged();
	return true;
}

function moveNodeToSlot(draggedId, componentId, slotName) {
	if (!canMoveNodeToSlot(draggedId, componentId, slotName)) return false;
	const dragged = findNode(tree.value, draggedId);
	const oldParent = findParent(tree.value, draggedId);
	const componentNode = findNode(tree.value, componentId);
	if (!dragged || !oldParent || !componentNode) return false;

	oldParent.children = oldParent.children.filter((child) => child.id !== draggedId);
	oldParent.children = [...oldParent.children];

	const slotTemplate = ensureSlotTemplateNode(componentNode, slotName);
	slotTemplate.children = [...(slotTemplate.children || []), dragged];
	selectedId.value = draggedId;
	visualChanged();
	return true;
}

function ensureSlotTemplateNode(componentNode, slotName = 'default') {
	const normalizedName = slotName || 'default';
	const existing = (componentNode.children || []).find((child) => namedSlotTemplateName(child) === normalizedName);
	if (existing) return existing;

	const slotTemplate = stamp({
		type: 'element',
		tag: 'template',
		label: normalizedName === 'default' ? '#default' : `#${normalizedName}`,
		props: {
			[`v-slot:${normalizedName}`]: '',
		},
		children: [],
	});
	componentNode.children = [...(componentNode.children || []), slotTemplate];
	return slotTemplate;
}

function moveNodeTo(draggedId, targetId, position = 'after') {
	if (!canMoveNodeTo(draggedId, targetId, position)) return false;
	const dragged = findNode(tree.value, draggedId);
	const oldParent = findParent(tree.value, draggedId);
	const target = findNode(tree.value, targetId);
	const targetParent = position === 'inside' ? target : findParent(tree.value, targetId);
	if (!dragged || !oldParent || !target || !targetParent) return false;

	oldParent.children = oldParent.children.filter((child) => child.id !== draggedId);
	oldParent.children = [...oldParent.children];

	if (position === 'inside') {
		target.children = [...(target.children || []), dragged];
	} else {
		const targetIndex = targetParent.children.findIndex((child) => child.id === targetId);
		targetParent.children.splice(position === 'before' ? targetIndex : targetIndex + 1, 0, dragged);
		targetParent.children = [...targetParent.children];
	}

	selectedId.value = draggedId;
	visualChanged();
	return true;
}

function canDropIntoSlotTarget(slotTarget, position) {
	if (position !== 'inside') return false;
	if (!slotTarget?.nodeId || !slotTarget.name) return false;
	const componentNode = findNode(tree.value, slotTarget.nodeId);
	if (!componentNode || componentNode.type !== 'component') return false;
	if (draggingEntry.value) return true;
	if (draggingNodeId.value) return canMoveNodeToSlot(draggingNodeId.value, slotTarget.nodeId, slotTarget.name);
	return false;
}

function canMoveNodeToSlot(draggedId, componentId, slotName) {
	if (!tree.value || !draggedId || !componentId || draggedId === componentId || !slotName) return false;
	const dragged = findNode(tree.value, draggedId);
	const componentNode = findNode(tree.value, componentId);
	const oldParent = findParent(tree.value, draggedId);
	if (!dragged || !componentNode || !oldParent) return false;
	if (namedSlotTemplateName(dragged)) return false;
	if (isDescendant(dragged, componentId)) return false;
	return true;
}

function canMoveNodeTo(draggedId, targetId, position) {
	if (!tree.value || !draggedId || !targetId || draggedId === targetId) return false;
	const dragged = findNode(tree.value, draggedId);
	const target = findNode(tree.value, targetId);
	const oldParent = findParent(tree.value, draggedId);
	if (!dragged || !target || !oldParent || isDescendant(dragged, targetId)) return false;
	if (position === 'inside') return canContain(target);
	if (target.type === 'root') return false;
	return Boolean(findParent(tree.value, targetId));
}

function isDescendant(node, id) {
	if (!node?.children?.length) return false;
	return node.children.some((child) => child.id === id || isDescendant(child, id));
}

function stageDropPositionFromEvent(event, node) {
	if (!node || node.type === 'root') return 'inside';
	const rect = event.currentTarget?.getBoundingClientRect?.();
	if (!rect?.height) return canContain(node) ? 'inside' : 'after';
	const y = event.clientY - rect.top;

	if (canContain(node)) {
		if (y < rect.height * 0.25) return 'before';
		if (y > rect.height * 0.75) return 'after';
		return 'inside';
	}

	return y < rect.height / 2 ? 'before' : 'after';
}

/**
 * Text and binding nodes cannot receive children. Containers, native elements,
 * slots, and component nodes can.
 */
function canContain(node) {
	return !['headline', 'text', 'paragraph', 'literal', 'input'].includes(node.type);
}

function selectNode(id) {
	selectedCodeLineOverride.value = 0;
	selectedId.value = id;
	revealNodeInLayers(id);
	focusStageViewport();
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

async function createComponentRecord() {
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
		await saveCurrentDraft();
	}
	const saved = await saveComponentToDisk(component, source);
	if (saved) Object.assign(component, saved);
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
	<section class="space-y-3 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
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

async function saveCurrentDraft() {
	if (!activeComponent.value) return;
	const nextSource = sourceText.value;
	activeComponent.value.source = nextSource;
	const saved = await saveComponentToDisk(activeComponent.value, nextSource);
	if (saved) Object.assign(activeComponent.value, saved);
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

function updateRootData(value) {
	rootDataText.value = value;
	try {
		const parsed = JSON.parse(value);
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Root data must be a JSON object.');
		rootData.value = parsed;
		rootDataError.value = '';
		syncVisualHistoryBaseline({ clearStacks: true });
	} catch (error) {
		rootDataError.value = error instanceof Error ? error.message : 'Invalid JSON.';
	}
}

function toggleFileBrowser() {
	isFileBrowserOpen.value = !isFileBrowserOpen.value;
	if (isFileBrowserOpen.value) {
		isCreateMenuOpen.value = false;
		isDeveloperMenuOpen.value = false;
	}
}

function openFileFromBrowser(file) {
	if (!file?.name || !file?.source) return;
	const existing = componentStore.value.find((component) => component.file === file.file || component.name === file.name);
	const record = {
		name: file.name,
		file: file.file,
		role: file.role || existing?.role || 'component',
		editable: true,
		insertable: file.insertable ?? existing?.insertable ?? file.role !== 'page',
		props: Array.isArray(file.props) ? file.props : existing?.props || [],
		custom: true,
		source: file.source,
	};

	if (existing) Object.assign(existing, record);
	else componentStore.value = [...componentStore.value, record];

	componentPreviewCache.clear();
	fileBrowserValue.value = file.path ? `file:${file.path}` : file.file;
	componentStack.value = [record.name];
	isFileBrowserOpen.value = false;
	saveTarget.value = 'Disk';
	savedAt.value = '';

	if (activeComponentName.value === record.name) loadActiveComponent();
	else activeComponentName.value = record.name;
}

function toggleSidebarPanel(panel) {
	sidebarPanels.value = {
		...sidebarPanels.value,
		[panel]: !sidebarPanels.value[panel],
	};
}

function toggleCodeDrawer() {
	isCodeDrawerOpen.value = !isCodeDrawerOpen.value;
}

function foldCode() {
	codeEditorEl.value?.foldAll();
}

function unfoldCode() {
	codeEditorEl.value?.unfoldAll();
}

function beginCodeDrawerResize(event) {
	if (!isCodeDrawerOpen.value) return;
	event.preventDefault();
	codeDrawerDrag = {
		y: event.clientY,
		height: codeDrawerHeight.value,
	};
	window.addEventListener('pointermove', resizeCodeDrawer);
	window.addEventListener('pointerup', endCodeDrawerResize, { once: true });
	document.body.style.cursor = 'row-resize';
	document.body.style.userSelect = 'none';
}

function resizeCodeDrawer(event) {
	if (!codeDrawerDrag) return;
	const delta = codeDrawerDrag.y - event.clientY;
	codeDrawerHeight.value = clamp(codeDrawerDrag.height + delta, minCodeDrawerHeight, maxCodeDrawerHeight);
}

function endCodeDrawerResize() {
	if (typeof window === 'undefined') return;
	window.removeEventListener('pointermove', resizeCodeDrawer);
	window.removeEventListener('pointerup', endCodeDrawerResize);
	document.body.style.cursor = '';
	document.body.style.userSelect = '';
	codeDrawerDrag = null;
}

function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
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

function selectedInspectorFieldValue(field) {
	const node = selectedNode.value;
	if (!node?.props) return undefined;

	const props = node.props;
	const keys = propAttributeKeys(field.key);
	const dynamicKey = keys.find((key) => key.startsWith(':') && Object.prototype.hasOwnProperty.call(props, key));
	if (dynamicKey) {
		const literal = literalExpressionValue(props[dynamicKey]);
		if (literal.matched) return literal.value;
		return resolveExpression(props[dynamicKey]) ?? props[dynamicKey];
	}

	const staticKey = keys.find((key) => !key.startsWith(':') && Object.prototype.hasOwnProperty.call(props, key));
	return staticKey ? props[staticKey] : undefined;
}

function updateSelectedInspectorField(field, value) {
	const node = selectedNode.value;
	if (!node) return;

	const nextProps = { ...(node.props || {}) };
	for (const key of propAttributeKeys(field.key)) delete nextProps[key];

	if (value !== undefined && value !== null && value !== '') {
		if (typeof value === 'string') {
			nextProps[field.key] = value;
		} else {
			nextProps[`:${field.key}`] = templateExpressionForValue(value);
		}
	}

	node.props = nextProps;
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

function updateSelectedClass(value) {
	updateSelectedProp('class', value);
}

function updateSelectedInactiveClasses(values) {
	inactiveClassesForSelection.value = values;
}

function isSelectedPreviewStateEnabled(id) {
	return selectedPreviewStateSet.value.has(id);
}

function toggleSelectedPreviewState(id) {
	if (!canPreviewSelectedStates.value || !statePreviewOptions.some((option) => option.id === id)) return;
	const current = new Set(selectedPreviewStateIds.value);
	if (current.has(id)) current.delete(id);
	else current.add(id);

	const next = { ...forcedStatesByNodeId.value };
	if (current.size) next[selectedId.value] = statePreviewVariantOrder.filter((stateId) => current.has(stateId));
	else delete next[selectedId.value];
	forcedStatesByNodeId.value = next;
	commitVisualHistory(captureVisualHistorySnapshot());
	restoreVisualEditFocus(selectedId.value);
}

function pruneForcedStates() {
	if (!tree.value) {
		forcedStatesByNodeId.value = {};
		return;
	}

	const allowedStates = new Set(statePreviewVariantOrder);
	const allowedNodeIds = new Set(flatNodes.value.map(({ node }) => node.id).filter(Boolean));
	const next = {};
	let changed = false;

	for (const [id, states] of Object.entries(forcedStatesByNodeId.value)) {
		const cleanStates = Array.isArray(states) ? states.filter((state) => allowedStates.has(state)) : [];
		if (!allowedNodeIds.has(id) || id === tree.value.id || !cleanStates.length) {
			changed = true;
			continue;
		}
		next[id] = cleanStates;
		if (cleanStates.length !== states.length) changed = true;
	}

	if (changed) forcedStatesByNodeId.value = next;
}

/**
 * Visual edits make the editor tree authoritative, so the code pane is
 * regenerated immediately. Direct code edits go through `applyCode` instead.
 */
function visualChanged() {
	const preservedSelectedId = selectedId.value;
	selectedCodeLineOverride.value = 0;
	codeDirty.value = false;
	pruneForcedStates();
	if (!restoringVisualHistory) commitVisualHistory(captureVisualHistorySnapshot());
	codeText.value = sourceText.value;
	savedAt.value = '';
	restoreVisualEditFocus(preservedSelectedId);
}

function restoreVisualEditFocus(id) {
	if (!id) return;
	nextTick(() => {
		if (!findNode(tree.value, id)) return;
		if (selectedId.value !== id) selectedId.value = id;
		revealNodeInLayers(id);
		applyCodeLineHighlight();
	});
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
		const previousLayerValue = options.keepSelection ? layerValueForNodeId(tree.value, selectedId.value) : '';
		const parsed = parseSource(value);
		tree.value = parsed.tree;
		activeScriptData.value = previewScriptDataForParsedTree(parsed.tree, parsed.scriptData || {});
		if (activeComponent.value) activeComponent.value.props = parsed.props;
		pruneForcedStates();
		const preservedSelection = previousLayerValue ? nodeIdForLayerValue(tree.value, previousLayerValue) : '';
		if (options.keepSelection && preservedSelection) {
			if (selectedId.value !== preservedSelection) {
				suppressLayerRevealOnce = true;
				selectedId.value = preservedSelection;
			}
		} else if (!options.keepSelection || !findNode(tree.value, selectedId.value)) {
			selectedId.value = tree.value.children[0]?.id || tree.value.id;
		}
		codeError.value = '';
		if (!options.keepDirty) {
			selectedCodeLineOverride.value = 0;
			codeDirty.value = false;
		}
		if (options.syncHistory !== false) syncVisualHistoryBaseline({ clearStacks: options.clearHistory !== false });
	} catch (error) {
		codeError.value = error.message;
	}
}

function sourceComponentForBuild() {
	if (!activeComponent.value) return null;
	return {
		...activeComponent.value,
		scriptData: activeScriptData.value,
	};
}

function previewScriptDataForParsedTree(parsedTree, parsedScriptData) {
	const nextData = { ...(parsedScriptData || {}) };
	for (const name of repeatListRootNames(parsedTree)) {
		if (Object.prototype.hasOwnProperty.call(nextData, name)) continue;
		if (!Object.prototype.hasOwnProperty.call(activeScriptData.value, name)) continue;
		nextData[name] = cloneData(activeScriptData.value[name]);
	}
	return nextData;
}

function repeatListRootNames(node, names = new Set()) {
	if (!node) return names;
	const rootName = expressionRootName(node.repeat?.list);
	if (rootName) names.add(rootName);
	(node.children || []).forEach((child) => repeatListRootNames(child, names));
	return names;
}

function expressionRootName(expression) {
	const match = String(expression || '').trim().match(/^([A-Za-z_$][\w$]*)/);
	return match?.[1] || '';
}

/**
 * Saves the active component through the experiment dev server. In Vite dev it
 * writes a real `.vue` file under this experiment; static builds still keep the
 * in-memory editor working without persistence.
 */
async function saveActiveComponent() {
	applyCode(codeText.value, { keepDirty: true, keepSelection: true, clearHistory: false });
	if (codeError.value || !activeComponent.value) return;

	const nextSource = codeForSave(codeText.value);
	codeText.value = nextSource;
	activeComponent.value.source = nextSource;
	applyCode(nextSource, { keepDirty: false, keepSelection: true, clearHistory: false });
	componentPreviewCache.clear();
	const saved = await saveComponentToDisk(activeComponent.value, nextSource);
	if (!saved) return;
	Object.assign(activeComponent.value, saved);
	saveTarget.value = 'Disk';
	codeDirty.value = false;
	savedAt.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * If the user typed only a template fragment, save a complete SFC generated
 * from the current tree. If they typed a full SFC, preserve it as written.
 */
function codeForSave(value) {
	if (extractTemplateSource(value).hasTemplateBlock) return value;
	return sourceText.value;
}

async function resetActiveComponent() {
	const seed = componentStore.value.find((component) => component.name === activeComponentName.value);
	if (!seed) return;
	if (seedSources.has(seed.name)) seed.source = seedSources.get(seed.name);
	componentPreviewCache.clear();
	loadActiveComponent();
	codeDirty.value = false;
	codeError.value = '';
	savedAt.value = '';
	await saveComponentToDisk(seed, seed.source);
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
/**
 * Parses either a full Vue SFC or a bare template fragment into the editor tree.
 * Vue compiler locations are kept so stage clicks can point back to source lines.
 */
function parseSource(value, componentName = activeComponentName.value) {
	return parseEditorSource(value, { componentName, stamp });
}

function resolveExpression(expression, scope = {}) {
	if (!expression) return null;
	const evaluated = evaluatePreviewExpression(expression, {
		...stageRootScope.value,
		...scope,
	});
	return evaluated.matched ? evaluated.value : null;
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

/**
 * Parent previews should reflect the saved child component template, not a
 * hard-coded placeholder. This reads the latest saved component source,
 * parses it once, and reuses the parsed tree until that source changes.
 */
function componentPreviewModel(component) {
	const source = sourceForComponent(component);
	const cacheKey = `${component.name}\n${source}`;
	if (componentPreviewCache.has(cacheKey)) return componentPreviewCache.get(cacheKey);
	const parsed = parseSource(source, component.name);
	componentPreviewCache.set(cacheKey, parsed);
	return parsed;
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

function forcedStateIdsForNode(node) {
	if (!node?.id) return [];
	return forcedStatesByNodeId.value[node.id] || [];
}

function forcedStateAttrsForNode(node) {
	const states = forcedStateIdsForNode(node);
	const attrs = {};
	for (const option of statePreviewOptions) {
		if (states.includes(option.id)) attrs[option.attr] = 'true';
	}
	if (states.length) attrs['data-template-preview-states'] = states.join(' ');
	if (states.includes('disabled')) {
		attrs['aria-disabled'] = 'true';
		if (supportsDisabledState(node)) attrs.disabled = true;
	}
	return attrs;
}

function supportsDisabledState(node) {
	if (!node) return false;
	if (node.type === 'component') return true;
	return node.type === 'element' && ['button', 'fieldset', 'input', 'optgroup', 'option', 'select', 'textarea'].includes(node.tag);
}

function forcedStateIdsFromAttrs(attrs) {
	return statePreviewOptions
		.filter((option) => attrs?.[option.attr] === 'true')
		.map((option) => option.id);
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

function classWithPreviewStates(attrs, ...values) {
	const classValue = mergeClassValues(...values);
	if (!classValue) return '';
	return mergeClassValues(classValue, statePreviewClassForClassValue(classValue, forcedStateIdsFromAttrs(attrs)));
}

function statePreviewClassForNode(node) {
	if (!node) return '';
	return statePreviewClassForClassValue(
		mergeClassValues(node.props?.class, basePreviewClassForNode(node)),
		forcedStateIdsForNode(node),
	);
}

function statePreviewClassForClassValue(value, stateIds) {
	if (!stateIds.length) return '';
	return mergeClassValues(classTokens(value).flatMap((token) => statePreviewClassesForToken(token, stateIds)));
}

function statePreviewClassContentForText(value) {
	const tokens = String(value || '').match(/[^\s"'`<>]+:[^\s"'`<>]+/g) || [];
	return mergeClassValues(tokens.flatMap((token) => statePreviewClassesForToken(token, statePreviewVariantOrder)));
}

function forcedStateCssForTailwind(css, content) {
	if (typeof CSS === 'undefined' || typeof CSS.escape !== 'function') return '';
	const rules = new Set();
	for (const token of statePreviewVariantTokensForText(content)) {
		const rule = forcedStateCssForToken(css, token);
		if (rule) rules.add(rule);
	}
	return [...rules].join('\n');
}

function statePreviewVariantTokensForText(value) {
	const tokens = new Set();
	const attrPattern = /(?:^|\s)(?::?class|className)\s*=\s*(["'`])([\s\S]*?)\1/g;
	let match;

	while ((match = attrPattern.exec(String(value || '')))) {
		for (const token of match[2].split(/\s+/)) {
			const candidate = cleanClassCandidate(token);
			if (candidate && statePreviewOptionForToken(candidate)) tokens.add(candidate);
		}
	}

	return [...tokens];
}

function cleanClassCandidate(token) {
	return String(token || '')
		.trim()
		.replace(/^['"`{([]+/, '')
		.replace(/['"`}:,;)\]]+$/, '');
}

function forcedStateCssForToken(css, token) {
	const option = statePreviewOptionForToken(token);
	if (!option) return '';

	const selector = `.${CSS.escape(token)}`;
	const body = cssRuleBodyForSelector(css, selector);
	if (!body) return '';

	const pseudo = pseudoClassForState(option.id);
	const forcedBody = body.replaceAll(`&:${pseudo}`, '&');
	if (forcedBody === body) return '';
	return `[${option.attr}="true"]${selector} {${forcedBody}}\n`;
}

function statePreviewOptionForToken(token) {
	const parts = splitClassVariantToken(token);
	if (parts.length < 2) return null;
	const variants = parts.slice(0, -1);
	return statePreviewOptions.find((option) => variants.includes(option.id)) || null;
}

function pseudoClassForState(stateId) {
	return stateId;
}

function cssRuleBodyForSelector(css, selector) {
	let index = 0;
	while ((index = css.indexOf(selector, index)) >= 0) {
		const open = css.indexOf('{', index + selector.length);
		if (open < 0) return '';
		const selectorText = css.slice(index, open).trim();
		if (selectorText === selector) {
			const close = matchingBraceIndex(css, open);
			return close > open ? css.slice(open + 1, close) : '';
		}
		index += selector.length;
	}
	return '';
}

function matchingBraceIndex(value, openIndex) {
	let depth = 0;
	for (let index = openIndex; index < value.length; index += 1) {
		if (value[index] === '{') depth += 1;
		if (value[index] === '}') {
			depth -= 1;
			if (depth === 0) return index;
		}
	}
	return -1;
}

function statePreviewClassesForToken(token, stateIds) {
	const value = String(token || '').trim();
	if (!value || !value.includes(':')) return [];
	const parts = splitClassVariantToken(value);
	if (parts.length < 2) return [];
	const variants = parts.slice(0, -1);
	const className = parts.at(-1);
	return statePreviewVariantOrder.flatMap((stateId) => {
		if (!stateIds.includes(stateId)) return [];
		return variants.includes(stateId) && className ? [className] : [];
	});
}

function splitClassVariantToken(value) {
	const parts = [];
	let current = '';
	let bracketDepth = 0;

	for (const character of value) {
		if (character === '[') bracketDepth += 1;
		if (character === ']') bracketDepth = Math.max(bracketDepth - 1, 0);
		if (character === ':' && bracketDepth === 0) {
			parts.push(current);
			current = '';
			continue;
		}
		current += character;
	}

	parts.push(current);
	return parts.filter(Boolean);
}

/**
 * Converts saved-template attrs into render attrs. Dynamic attrs are resolved
 * against the component scope so `:value="modelValue"` and `{{ task.title }}`
 * behave like a tiny, visual-only Vue runtime.
 */
function previewAttrsForNode(node, scope, rootCommon = null) {
	const attrs = {};
	for (const [key, value] of Object.entries(node.props || {})) {
		if (isPreviewStructuralProp(key)) continue;
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
		const mergedClass = mergeClassValues(inheritedClass, savedClass);
		if (mergedClass) attrs.class = mergedClass;
		else delete attrs.class;
	}

	if (attrs.class) attrs.class = classWithPreviewStates(attrs, attrs.class);
	if (isImageNode(node)) prepareImagePreviewAttrs(attrs);
	return attrs;
}

function isPreviewStructuralProp(key) {
	return key === 'v-if'
		|| key === 'v-else-if'
		|| key === 'v-else'
		|| key === 'v-show'
		|| key.startsWith('v-slot');
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
		const previewModel = componentPreviewModel(component);
		const previewTree = previewModel.tree;
		const previewSlots = slotContentWithHints(slotChildren, componentSlotHintNames(component, slotChildren, node, ctx));
		const componentScope = {
			...(previewModel.scriptData || {}),
			...componentScopeFor(node, component, scope),
			$slots: slotPresenceForScope(previewSlots),
		};
		const roots = previewTree.children.flatMap((child) => toArray(renderPreviewNode(child, ctx, node, componentScope, previewSlots, null, depth + 1)));
		if (!roots.length) return null;
		if (roots.length > 1) return h('section', common, roots);
		return renderPreviewNode(previewTree.children[0], ctx, node, componentScope, previewSlots, common, depth + 1);
	} catch {
		return null;
	}
}

function shouldRenderPreviewNode(node, scope) {
	const props = node.props || {};
	if (Object.prototype.hasOwnProperty.call(props, 'v-if')) return Boolean(resolveExpression(props['v-if'], scope));
	if (Object.prototype.hasOwnProperty.call(props, 'v-else-if')) return Boolean(resolveExpression(props['v-else-if'], scope));
	return true;
}

/**
 * Renders a saved component template as a preview inside its parent. Internal
 * component nodes deliberately do not get their own editor ids here; clicks
 * bubble to the component instance in the parent, while slotted parent nodes
 * keep their real ids and can still be selected directly.
 */
function renderPreviewNode(node, ctx, ownerNode, scope, slotChildren, rootCommon = null, depth = 0) {
	if (!shouldRenderPreviewNode(node, scope)) return null;
	if (node.type === 'literal') return renderInlineValue(node, node.text || 'Text', scope);
	if (node.repeat) return renderPreviewRepeatNode(node, ctx, ownerNode, scope, slotChildren, rootCommon, depth);
	if (node.type === 'element' && node.tag === 'slot') {
		const name = slotOutletName(node);
		const projectedSlot = slotContentByName(slotChildren, name);
		if (projectedSlot.length) return projectedSlot;
		if (slotHinted(slotChildren, name)) return renderSlotHint(ownerNode, node, ctx, name);
		const fallbackChildren = renderPreviewChildren(node, ctx, ownerNode, scope, slotChildren, depth);
		return fallbackChildren.length
			? fallbackChildren
			: h('div', previewAttrsForNode(node, scope, rootCommon), `${name} slot`);
	}

	const attrs = previewAttrsForNode(node, scope, rootCommon);

	if (node.type === 'headline') return h('h1', attrs, renderInlineValue(node, 'Heading', scope));
	if (node.type === 'text') return h('p', attrs, renderInlineValue(node, 'Text', scope));
	if (node.type === 'paragraph') return h('p', attrs, renderInlineValue(node, 'Paragraph', scope));
	if (node.type === 'element' && node.tag === 'template') {
		return renderPreviewChildren(node, ctx, ownerNode, scope, slotChildren, depth);
	}

	const children = renderPreviewChildren(node, ctx, ownerNode, scope, slotChildren, depth);

	if (node.type === 'element') {
		const tag = node.tag || 'section';
		return h(tag, attrs, voidTags.has(tag) ? null : (children.length ? children : inlineContentForNode(node, scope)));
	}
	if (node.type === 'component') {
		const previewSlotChildren = slotContentForNode(node, (child, slotDepth) => renderPreviewNode(child, ctx, node, scope, slotChildren, null, slotDepth), scope, depth + 1);
		const preview = renderComponentPreview(node, ctx, attrs, scope, previewSlotChildren, depth + 1);
		if (preview) return preview;
		const defaultSlot = slotContentByName(previewSlotChildren);
		return h('section', attrs, defaultSlot.length ? defaultSlot : node.text || node.label);
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
		const rowScope = scopeForRepeatItem(node.repeat, item, index, scope);
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
	if (!shouldRenderPreviewNode(node, ctx.scope || {})) return null;

	const selected = ctx.selectedId === node.id;
	const hovered = ctx.hoveredId === node.id;
	const scope = ctx.scope || {};
	const dropTarget = ctx.dropTargetId === node.id && node.type !== 'root';
	const dropPosition = dropTarget ? normalizeDropPosition(ctx.dropTargetPosition, 'inside') : '';
	const common = previewAttrsForNode(node, scope, {
		'data-template-node': node.id,
		'data-template-hovered': hovered ? 'true' : null,
		'data-template-selected': selected ? 'true' : null,
		'data-template-drop-target': dropTarget ? 'true' : null,
		'data-template-drop-position': dropPosition || null,
		...forcedStateAttrsForNode(node),
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

	if (node.type === 'root') return h('div', { ...common, class: classWithPreviewStates(common, 'min-h-full w-full', stageClass, common.class) }, children);
	if (node.type === 'component') {
		const slotChildren = slotContentForNode(node, (child) => h(TemplateNode, {
			key: child.id,
			node: child,
			selectedId: ctx.selectedId,
			hoveredId: ctx.hoveredId,
			dropTargetId: ctx.dropTargetId,
			dropTargetPosition: ctx.dropTargetPosition,
			dataScope: scope,
			onSelect: (id) => ctx.emit('select', id),
			onOpenComponent: (target) => ctx.emit('open-component', target),
			onDropOnNode: (target) => ctx.emit('drop-on-node', target),
			onNodeDragStart: (id) => ctx.emit('node-drag-start', id),
			onNodeDragOver: (target) => ctx.emit('node-drag-over', target),
		}), scope);
		const defaultSlot = slotContentByName(slotChildren);
		if (elementsEntryForTag(node.tag)?.component && stageClass && !common.class) common.class = classWithPreviewStates(common, stageClass);
		const elementsPreview = renderElementsComponent(node, common, defaultSlot);
		if (elementsPreview) return elementsPreview;
		const preview = renderComponentPreview(node, ctx, common, scope, slotChildren);
		if (preview) return preview;
		if (stageClass && !common.class) common.class = classWithPreviewStates(common, stageClass);
	}

	if (stageClass && !common.class) common.class = classWithPreviewStates(common, stageClass);

	if (node.type === 'headline') return h('h1', common, renderInlineValue(node, 'Heading', scope));
	if (node.type === 'text') return h('p', common, renderInlineValue(node, 'Text', scope));
	if (node.type === 'paragraph') return h('p', common, renderInlineValue(node, 'Paragraph', scope));
	if (node.type === 'element' && node.tag === 'slot') return h('div', common, 'Slot content');
	if (node.type === 'element' && node.tag === 'template') return children;
	if (node.type === 'element') return h(node.tag || 'section', common, children.length ? children : inlineContentForNode(node, scope));
	if (node.type === 'component' && node.tag === 'MetricGrid') {
		return h('section', common, rootData.value.metrics.map((item) => h('article', { class: 'rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm' }, [
			h('p', { class: 'text-xs font-medium text-muted-foreground' }, item.label),
			h('strong', { class: 'mt-3 block text-2xl font-semibold text-foreground' }, item.value),
		])));
	}
	if (node.type === 'component' && node.tag === 'TaskList') {
		return h('section', common, children.length ? children : renderTaskListPreview(common));
	}
	if (node.type === 'component') return h('section', common, children.length ? children : h('span', { class: 'text-xs text-muted-foreground' }, `Double-click to edit ${node.tag}`));
	return h('section', common, children.length ? children : node.label);
}

function renderElementsComponent(node, attrs, slotChildren) {
	const entry = elementsComponentRegistry.find((item) => item.componentName === node.tag);
	if (!entry || typeof entry.component === 'string' || !entry.component) return null;
	const props = { ...attrs };
	delete props.draggable;
	return h(entry.component, props, slotChildren.length ? { default: () => slotChildren } : undefined);
}

function renderSlotHint(ownerNode, slotNode, ctx, name) {
	const targetId = slotDropTargetId(ownerNode.id, name);
	const dropTarget = ctx.dropTargetId === targetId;
	const label = name === 'default' ? 'Default slot' : `${name} slot`;

	return h('div', {
		class: 'template-slot-hint',
		'data-template-node': ownerNode.id,
		'data-template-slot-target': targetId,
		'data-template-drop-target': dropTarget ? 'true' : null,
		'data-template-drop-position': dropTarget ? 'inside' : null,
		onClick: (event) => {
			event.stopPropagation();
			ctx.emit('select', ownerNode.id);
		},
		onDrop: (event) => {
			event.preventDefault();
			event.stopPropagation();
			ctx.emit('drop-on-node', { id: targetId, position: 'inside' });
		},
		onDragover: (event) => {
			event.preventDefault();
			event.stopPropagation();
			ctx.emit('node-drag-over', { id: targetId, position: 'inside' });
		},
	}, [
		h('span', { class: 'template-slot-hint__label' }, label),
		h('span', { class: 'template-slot-hint__helper' }, 'Drop content here'),
	]);
}

function componentSlotHintNames(component, slotContent, node, ctx) {
	if (!shouldShowSlotHints(node, ctx)) return [];
	return componentSlotNames(component)
		.filter((name) => !slotContentByName(slotContent, name).length);
}

function shouldShowSlotHints() {
	return Boolean(draggingEntry.value || draggingNodeId.value || dropTargetId.value);
}

function componentSlotNames(component) {
	try {
		const model = componentPreviewModel(component);
		const names = new Set();
		collectSlotNames(model.tree, names);
		return [...names];
	} catch {
		return [];
	}
}

function collectSlotNames(node, names) {
	if (!node) return;
	if (node.type === 'element' && node.tag === 'slot') names.add(slotOutletName(node));
	(node.children || []).forEach((child) => collectSlotNames(child, names));
}

function slotContentForNode(node, renderChild, scope, childDepth = 0) {
	const slotContent = { default: [], named: {} };

	for (const child of node.children || []) {
		const slotName = namedSlotTemplateName(child);
		if (slotName) {
			slotContent.named[slotName] = [
				...(slotContent.named[slotName] || []),
				...(child.children || []).flatMap((slotChild) => toArray(renderChild(slotChild, childDepth + 1))),
			];
			continue;
		}
		slotContent.default.push(...toArray(renderChild(child, childDepth)));
	}

	if (!slotContent.default.length && (node.inline?.length || node.binding || node.text)) {
		slotContent.default.push(renderInlineValue(node, node.text || node.label, scope));
	}

	return slotContent;
}

function slotContentWithHints(slotContent, names) {
	const hinted = Object.fromEntries((names || []).map((name) => [name || 'default', true]));
	if (!Object.keys(hinted).length) return slotContent;
	return {
		default: slotContent?.default || [],
		named: slotContent?.named || {},
		hinted: {
			...(slotContent?.hinted || {}),
			...hinted,
		},
	};
}

function slotContentByName(slotContent, name = 'default') {
	if (Array.isArray(slotContent)) return name === 'default' ? slotContent : [];
	if (!slotContent) return [];
	return name === 'default'
		? slotContent.default || []
		: slotContent.named?.[name] || [];
}

function slotHinted(slotContent, name = 'default') {
	return Boolean(slotContent?.hinted?.[name || 'default']);
}

function slotPresenceForScope(slotContent) {
	const slots = {};
	if (slotContentByName(slotContent).length) slots.default = true;
	for (const [name, content] of Object.entries(slotContent?.named || {})) {
		if (content.length) slots[name] = true;
	}
	for (const name of Object.keys(slotContent?.hinted || {})) {
		slots[name] = true;
	}
	return slots;
}

function slotOutletName(node) {
	return node.props?.name || 'default';
}

function namedSlotTemplateName(node) {
	if (node?.type !== 'element' || node.tag !== 'template') return '';
	const entry = Object.entries(node.props || {}).find(([key]) => key.startsWith('v-slot:'));
	return entry ? entry[0].slice('v-slot:'.length) || 'default' : '';
}

function slotDropTargetId(nodeId, name = 'default') {
	return `${nodeId}::slot:${encodeURIComponent(name || 'default')}`;
}

function slotDropTargetFromId(id) {
	const match = String(id || '').match(/^(.*?)::slot:(.+)$/);
	if (!match) return null;
	return {
		nodeId: match[1],
		name: decodeURIComponent(match[2] || 'default') || 'default',
	};
}

function renderChildren(node, ctx, scope) {
	return (node.children || []).map((child) => h(TemplateNode, {
		key: child.id,
		node: child,
		selectedId: ctx.selectedId,
		hoveredId: ctx.hoveredId,
		dropTargetId: ctx.dropTargetId,
		dropTargetPosition: ctx.dropTargetPosition,
		dataScope: scope,
		onSelect: (id) => ctx.emit('select', id),
		onOpenComponent: (target) => ctx.emit('open-component', target),
		onDropOnNode: (target) => ctx.emit('drop-on-node', target),
		onNodeDragStart: (id) => ctx.emit('node-drag-start', id),
		onNodeDragOver: (target) => ctx.emit('node-drag-over', target),
	}));
}

function inlineContentForNode(node, scope) {
	if (node.inline?.length || node.binding) return renderInlineValue(node, node.text || node.label, scope);
	return node.text || '';
}

function renderTaskListPreview(common) {
	return [
		h('p', { class: 'text-sm font-semibold text-foreground' }, 'Tasks'),
		h('div', { class: 'grid gap-2 rounded-md border border-dashed border-ring/60 bg-accent/40 p-2' }, [
			h('div', { class: 'flex items-center justify-between px-1 text-[11px] font-medium uppercase tracking-[0.14em] text-accent-foreground' }, [
				h('span', 'task in tasks'),
				h('span', 'template'),
			]),
			...rootData.value.tasks.map((task, index) => h('article', {
				class: `border-t border-border py-2 ${index > 0 ? 'opacity-90' : ''}`,
				onClick: common.onClick,
				onDblclick: common.onDblclick,
				onDrop: common.onDrop,
				onDragover: common.onDragover,
			}, [
				h('p', { class: 'text-sm text-foreground' }, task.title),
				h('p', { class: 'text-xs text-muted-foreground' }, task.owner),
				h('p', { class: 'text-xs text-muted-foreground' }, task.due),
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
	return rows.flatMap((item, index) => {
		const repeatScope = scopeForRepeatItem(node.repeat, item, index, scope);
		return toArray(renderNode({ ...node, repeat: null }, { ...ctx, scope: repeatScope }))
			.map((row) => withRepeatKey(row, node.id, index));
	});
}

function withRepeatKey(row, nodeId, index) {
	if (!isVNode(row)) return row;
	return cloneVNode(row, {
		key: row.key ?? `${nodeId}-${index}`,
		'data-repeat-template': nodeId,
		'data-repeat-index': String(index),
	});
}

/**
 * Visual styling for known demo components. These are preview defaults, not
 * source-code classes. The inspector shows them separately from the editable
 * `class=""` attribute so users can understand what the stage is adding.
 */
function basePreviewClassForNode(node) {
	if (node.type === 'root') return 'min-h-full space-y-5 bg-card';
	if (node.type === 'element' && node.tag === 'slot') return '';
	if (node.type === 'component' && node.tag === 'HeroPanel') return 'flex items-start gap-6 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm';
	if (node.type === 'component' && node.tag === 'TemplateFrame') return 'space-y-5 bg-card';
	if (node.type === 'component' && node.tag === 'Badge') return 'inline-flex w-fit rounded bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary';
	if (node.type === 'component' && node.tag === 'SplitPanel') return 'grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_0.8fr]';
	if (node.type === 'component' && node.tag === 'MetricGrid') return 'grid grid-cols-1 gap-3 sm:grid-cols-3';
	if (node.type === 'component' && node.tag === 'TaskList') return 'rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm';
	if (node.type === 'component' && node.tag === 'ElButton') return 'inline-flex h-10 w-fit items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm';
	if (node.type === 'component' && node.tag === 'ElTextInput') return 'h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground';
	if (node.type === 'headline') return 'max-w-xl text-3xl font-semibold tracking-tight text-foreground';
	if (node.type === 'text' || node.type === 'paragraph') return 'max-w-lg text-sm leading-6 text-muted-foreground';
	if (node.type === 'element' && isEmptyElement(node)) return 'min-h-12 rounded-lg border border-dashed border-border bg-background/80 p-4';
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
		<div class="min-h-screen bg-background text-foreground">
				<ElSplitterPanel class="h-screen min-h-screen" :start-size="280" :end-size="460" :min-start="240" :min-main="420" :min-end="360">
				<template #start>
					<aside class="flex h-screen min-h-0 flex-col overflow-hidden border-r border-border bg-card text-card-foreground">
						<div class="shrink-0 border-b border-border p-4">
							<div class="flex items-start gap-3">
								<button
									type="button"
									class="grid size-9 shrink-0 place-items-center rounded-md border border-border bg-background text-muted-foreground hover:border-ring hover:bg-secondary hover:text-foreground"
									:class="isFileBrowserOpen && 'border-ring bg-secondary text-foreground'"
									:aria-pressed="isFileBrowserOpen"
									aria-label="Open file browser"
									title="Open file browser"
									@click="toggleFileBrowser"
								>
									<svg viewBox="0 0 24 24" class="size-4" fill="none" aria-hidden="true">
										<path d="M4 6.5h6l2 2h8v9.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
										<path d="M4 10h16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
									</svg>
								</button>
								<div class="min-w-0 flex-1">
									<p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Experiment</p>
									<h1 class="mt-1 text-sm font-semibold text-foreground">Template Studio</h1>
									<div class="mt-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
										<button
											v-for="(name, index) in componentStack"
											:key="`${name}-${index}`"
											type="button"
											class="max-w-full truncate rounded px-1.5 py-1 hover:bg-secondary hover:text-foreground"
											:class="index === componentStack.length - 1 && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'"
											@click="openFromStack(index)"
										>{{ name }}</button>
									</div>
								</div>
							</div>
						</div>

						<TemplateFileBrowser
							v-if="isFileBrowserOpen"
							v-model="fileBrowserValue"
							class="min-h-0 flex-1"
							:endpoint="fileBrowserEndpoint"
							@open-file="openFileFromBrowser"
							@close="isFileBrowserOpen = false"
						/>

						<template v-else>
						<section
							class="flex min-h-0 flex-col border-b border-border"
							:class="sidebarPanels.components ? 'flex-[1.25_1_0]' : 'flex-none'"
						>
							<button
								type="button"
								class="flex h-10 shrink-0 items-center justify-between border-b border-border px-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:bg-secondary hover:text-foreground"
								:aria-expanded="sidebarPanels.components"
								@click="toggleSidebarPanel('components')"
							>
								<span>Components</span>
								<span class="font-mono text-sm">{{ sidebarPanels.components ? '-' : '+' }}</span>
							</button>
							<div v-show="sidebarPanels.components" class="min-h-0 flex-1 overflow-y-auto p-4">
								<div class="grid gap-5">
									<div>
										<h2 class="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Project components</h2>
										<div class="grid gap-2">
											<button
												v-for="entry in componentPalette"
												:key="entry.id"
												type="button"
												draggable="true"
												class="group flex h-10 items-center gap-3 rounded-md border border-border bg-background px-3 text-left transition hover:border-ring hover:bg-secondary"
												@dragstart="onDragStart(entry, $event)"
												@dragend="onDragEnd"
												@click="addToSelected(entry)"
											>
												<svg class="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" viewBox="0 0 24 24" fill="none" aria-hidden="true">
													<path :d="entry.icon" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
												</svg>
												<span class="truncate text-sm font-medium text-foreground">{{ entry.label }}</span>
											</button>
										</div>
									</div>

									<div>
										<h2 class="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Elements</h2>
										<div class="grid gap-3">
											<div v-for="group in elementsPaletteGroups" :key="group.group" class="grid gap-2">
												<p class="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{{ group.group }}</p>
												<div class="grid grid-cols-2 gap-2">
													<button
														v-for="entry in group.entries"
														:key="entry.id"
														type="button"
														draggable="true"
														class="flex h-9 min-w-0 items-center gap-2 rounded-md border border-border bg-background px-2 text-left text-xs text-foreground hover:border-ring hover:bg-secondary"
														@dragstart="onDragStart(entry, $event)"
														@dragend="onDragEnd"
														@click="addToSelected(entry)"
													>
														<svg class="size-3.5 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" aria-hidden="true">
															<path :d="entry.icon" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
														</svg>
														<span class="truncate">{{ entry.label }}</span>
													</button>
												</div>
											</div>
										</div>
									</div>

									<div>
										<h2 class="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">HTML</h2>
										<div class="grid grid-cols-2 gap-2">
											<button
												v-for="entry in primitivePalette"
												:key="entry.id"
												type="button"
												draggable="true"
												class="flex h-9 items-center gap-2 rounded-md border border-border bg-background px-2 text-xs text-foreground hover:border-ring hover:bg-secondary"
												@dragstart="onDragStart(entry, $event)"
												@dragend="onDragEnd"
												@click="addToSelected(entry)"
											>
												<svg class="size-3.5 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" aria-hidden="true">
													<path :d="entry.icon" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
												</svg>
												{{ entry.label }}
											</button>
										</div>
									</div>
								</div>
							</div>
						</section>

						<section
							class="flex min-h-0 flex-col"
							:class="sidebarPanels.layers ? 'flex-1' : 'flex-none'"
						>
							<button
								type="button"
								class="flex h-10 shrink-0 items-center justify-between border-b border-border px-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:bg-secondary hover:text-foreground"
								:aria-expanded="sidebarPanels.layers"
								@click="toggleSidebarPanel('layers')"
							>
								<span>Layers</span>
								<span class="font-mono text-sm">{{ sidebarPanels.layers ? '-' : '+' }}</span>
							</button>
							<div v-show="sidebarPanels.layers" class="min-h-0 flex-1 overflow-y-auto bg-background">
								<ElTreeView
									:model-value="selectedLayerValue"
									:items="layerTreeItems"
									:open-values="layerOpenValues"
									:hovered-value="hoveredLayerValue"
									:external-drag-value="layerDragSourceValue"
									:external-drop-target-value="dropTargetLayerValue"
									:external-drop-position="dropTargetPosition"
									:external-drop-types="[paletteDragType]"
									:can-drop-item="canDropLayerItem"
									:can-drop-external="canDropExternalLayer"
									:chrome="false"
									:draggable="true"
									label="Template layers"
									class="template-layer-tree"
									external-drop-effect="copy"
									@select="selectNode($event.item.nodeId)"
									@hover="hoverNodeFromLayer"
									@hover-end="clearNodeHoverFromLayer"
									@drag-preview="onLayerDragPreview"
									@drag-preview-end="clearLayerDragPreview"
									@reorder="onLayerReorder"
									@external-drop="onLayerExternalDrop"
									@toggle="onLayerToggle"
									@update:open-values="onLayerOpenValuesUpdate"
								/>
							</div>
						</section>
						</template>
					</aside>
				</template>

					<main class="flex h-screen min-w-0 flex-col bg-background text-foreground">
						<div class="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 text-card-foreground">
							<div class="min-w-0">
								<p class="truncate text-sm font-semibold">{{ activeComponentName }}</p>
								<p class="truncate text-xs text-muted-foreground" :title="sourceFileTitle">{{ sourceFileLabel }}</p>
							</div>
							<div class="flex items-center gap-2">
								<div class="relative">
									<button type="button" class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90" aria-label="Create" @click="isCreateMenuOpen = !isCreateMenuOpen">
										<svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
											<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
										</svg>
									</button>
									<div v-if="isCreateMenuOpen" class="absolute right-0 top-10 z-40 grid w-48 gap-1 rounded-md border border-border bg-popover p-1 text-xs text-popover-foreground shadow-xl">
										<button type="button" class="rounded px-3 py-2 text-left hover:bg-secondary" @click="openCreateDialog('component')">New component</button>
										<button type="button" class="rounded px-3 py-2 text-left hover:bg-secondary" @click="openCreateDialog('page')">New page</button>
										<button v-if="selectedNode && selectedNode.type !== 'root'" type="button" class="rounded px-3 py-2 text-left hover:bg-secondary" @click="openCreateDialog('component', { fromSelection: true })">Component from selection</button>
									</div>
								</div>
								<div class="relative">
									<button
										type="button"
										class="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
										:aria-expanded="isDeveloperMenuOpen"
										aria-label="Developer menu"
										@click="toggleDeveloperMenu"
									>
										<svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
											<path d="M8 7 4 12l4 5M16 7l4 5-4 5M14 4l-4 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
										</svg>
									</button>
									<div
										v-if="isDeveloperMenuOpen"
										class="absolute right-0 top-10 z-50 flex max-h-[70vh] w-[min(32rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-xl"
									>
										<div class="flex shrink-0 items-center justify-between gap-3 border-b border-border px-3 py-2">
											<div class="min-w-0">
												<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Developer</p>
												<p class="truncate text-xs text-foreground">{{ developerNodeSnapshot.nodeCount }} nodes in editor tree</p>
											</div>
											<button type="button" class="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground" @click="isDeveloperMenuOpen = false">Close</button>
										</div>
										<pre class="min-h-0 flex-1 overflow-auto bg-background p-3 font-mono text-[11px] leading-5 text-foreground">{{ developerNodeSnapshotText }}</pre>
									</div>
								</div>
								<button
									type="button"
									class="h-8 rounded-md border border-border px-3 text-xs font-medium hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
									:disabled="!canUndoVisual"
									@click="undoVisualEdit"
								>
									Undo
								</button>
								<button
									type="button"
									class="h-8 rounded-md border border-border px-3 text-xs font-medium hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
									:disabled="!canRedoVisual"
									@click="redoVisualEdit"
								>
									Redo
								</button>
								<button type="button" class="h-8 rounded-md border border-border px-3 text-xs font-medium hover:bg-secondary" @click="duplicateSelected">Duplicate</button>
								<button type="button" class="h-8 rounded-md border border-border px-3 text-xs font-medium hover:bg-secondary" @click="toggleCodeDrawer">
									{{ isCodeDrawerOpen ? 'Hide code' : 'Show code' }}
								</button>
									<button
										type="button"
										class="h-8 rounded-md border border-destructive/30 px-3 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-40"
										:disabled="!canDeleteSelected"
										@click="removeSelected"
									>
										Delete
									</button>
							</div>
						</div>

						<StageViewport
							ref="stageViewportEl"
							:selected-label="selectedStageLabel"
							:can-delete="canDeleteSelected"
							:dragging="Boolean(draggingEntry || draggingNodeId || dropTargetId)"
							@stage-drop="addFromDrop(dropTargetId || selectedId)"
							@clear-drop-target="clearDropTarget"
							@hover-node="setHoveredNode"
							@clear-hover="clearHoveredStageNode"
							@delete-selected="removeSelected"
							@select-node="selectNode"
						>
							<TemplateNode
								v-if="tree"
								:node="tree"
								:selected-id="selectedId"
								:hovered-id="hoveredNodeId"
								:drop-target-id="dropTargetId"
								:drop-target-position="dropTargetPosition"
								:data-scope="stageRootScope"
								@select="selectNode"
								@open-component="openComponent"
								@drop-on-node="addFromDrop"
								@node-drag-start="startNodeDrag"
								@node-drag-over="markDropTarget"
							/>
						</StageViewport>

						<section
							class="template-code-drawer grid shrink-0 grid-rows-[auto_auto_minmax(0,1fr)] border-t border-border bg-card text-card-foreground transition-[height]"
							:style="{ height: isCodeDrawerOpen ? `${codeDrawerHeight}px` : '3rem' }"
						>
							<button
								v-if="isCodeDrawerOpen"
								type="button"
								class="group h-2 cursor-row-resize bg-border/60 outline-none transition hover:bg-ring/40 focus-visible:bg-ring/50"
								aria-label="Resize code drawer"
								@pointerdown="beginCodeDrawerResize"
							>
								<span class="mx-auto block h-0.5 w-10 rounded-full bg-muted-foreground/35 transition group-hover:bg-foreground/50"></span>
							</button>
							<div class="flex h-12 min-w-0 items-center justify-between gap-3 border-b border-border px-4">
								<button
									type="button"
									class="flex min-w-0 items-center gap-2 text-left"
									:aria-expanded="isCodeDrawerOpen"
									@click="toggleCodeDrawer"
								>
									<span class="flex size-6 shrink-0 items-center justify-center rounded border border-border bg-background text-muted-foreground">
										<svg class="size-3.5 transition-transform" :class="isCodeDrawerOpen ? '' : 'rotate-180'" viewBox="0 0 24 24" fill="none" aria-hidden="true">
											<path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
										</svg>
									</span>
									<span class="min-w-0">
										<span class="block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Code</span>
										<code class="block truncate text-[11px] text-muted-foreground" :title="sourceFileTitle">{{ sourceFileLabel }}</code>
									</span>
								</button>
								<div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
									<p class="text-[11px]" :class="codeError ? 'text-destructive' : 'text-muted-foreground'">
										{{ codeError || (codeDirty ? 'Unsaved' : savedAt ? `${saveTarget} saved ${savedAt}` : 'Synced') }}
									</p>
									<button type="button" class="h-7 rounded-md border border-border px-2 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground" @click="foldCode">Fold all</button>
									<button type="button" class="h-7 rounded-md border border-border px-2 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground" @click="unfoldCode">Unfold</button>
									<button type="button" class="h-7 rounded-md border border-border px-2 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground" @click="resetActiveComponent">Reset</button>
									<button type="button" class="h-7 rounded-md bg-primary px-2 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90" @click="saveActiveComponent">Save</button>
								</div>
							</div>
							<div v-show="isCodeDrawerOpen" class="min-h-0">
								<TemplateMonacoEditor
									ref="codeEditorEl"
									:model-value="codeText"
									:selected-line="selectedSourceLine"
									:hovered-line="hoveredSourceLine"
									:external-drop-types="[codeDropType]"
									:path="sourceFile"
									lang="vue"
									@cursor-line-change="selectFromCodeLine"
									@drop-insert="selectFromCodeDrop"
									@folding-change="onCodeFoldingChange"
									@hover-line-change="hoverNodeFromCodeLine"
									@ready="applyCodeLineHighlight"
									@update:model-value="onCodeInput"
								/>
							</div>
						</section>
					</main>

					<template #end>
						<aside class="h-screen w-full min-w-0 overflow-hidden border-l border-border bg-card text-card-foreground">
							<section class="h-full min-w-0 overflow-y-auto overflow-x-hidden p-4">
						<div class="flex items-center justify-between gap-3">
							<div>
								<h2 class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Component</h2>
								<p class="mt-1 text-sm font-medium text-foreground">{{ activeComponentName }}</p>
							</div>
							<div class="flex items-center gap-2">
								<button type="button" class="h-7 rounded-md border border-border px-2 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground" @click="resetActiveComponent">Reset</button>
								<button type="button" class="h-7 rounded-md bg-primary px-2 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90" @click="saveActiveComponent">Save</button>
							</div>
						</div>

						<div class="mt-4 grid gap-3">
							<label class="grid gap-1">
								<span class="text-xs text-muted-foreground">Selected label</span>
								<input class="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring" :value="selectedNode?.label || ''" @input="updateLabel($event.target.value)">
							</label>
							<label v-if="selectedNode && 'binding' in selectedNode" class="grid gap-1">
								<span class="text-xs text-muted-foreground">Data binding</span>
								<input class="h-9 rounded-md border border-input bg-background px-3 font-mono text-xs text-foreground outline-none focus:border-ring" :value="selectedNode.binding || ''" @input="updateBinding($event.target.value)">
							</label>
							<div v-if="selectedData != null" class="rounded-md border border-border bg-background px-3 py-2">
								<p class="text-[11px] font-medium text-muted-foreground">Resolved value</p>
								<code class="mt-1 block truncate font-mono text-xs text-primary">{{ selectedData }}</code>
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
								<span class="text-xs text-muted-foreground">Template class</span>
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
							<div v-if="canPreviewSelectedStates" class="grid gap-2 rounded-md border border-border bg-background p-3">
								<div class="flex items-center justify-between gap-3">
									<span class="text-xs font-medium text-muted-foreground">States</span>
									<span class="text-[11px] text-muted-foreground">{{ selectedPreviewStateIds.length ? selectedPreviewStateIds.join(', ') : 'Default' }}</span>
								</div>
								<div class="flex flex-wrap gap-1.5">
									<button
										v-for="state in statePreviewOptions"
										:key="state.id"
										type="button"
										class="h-8 rounded-md border px-2.5 text-xs font-medium transition"
										:class="isSelectedPreviewStateEnabled(state.id) ? 'border-ring bg-primary text-primary-foreground' : 'border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'"
										:aria-pressed="isSelectedPreviewStateEnabled(state.id)"
										@click="toggleSelectedPreviewState(state.id)"
									>
										{{ state.label }}
									</button>
								</div>
								<label v-if="selectedPreviewStateClasses" class="grid gap-1">
									<span class="text-[11px] text-muted-foreground">Expanded classes</span>
									<textarea class="min-h-14 resize-none rounded-md border border-input bg-background px-3 py-2 font-mono text-[11px] text-muted-foreground outline-none" readonly :value="selectedPreviewStateClasses"></textarea>
								</label>
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
							<label v-if="selectedBaseClass" class="grid gap-1">
								<span class="text-xs text-muted-foreground">Preview base classes</span>
								<textarea class="min-h-16 resize-none rounded-md border border-input bg-background px-3 py-2 font-mono text-[11px] text-muted-foreground outline-none" readonly :value="selectedBaseClass"></textarea>
							</label>
						</div>

							<div v-if="selectedNode?.type === 'component'" class="mt-4 rounded-md border border-border bg-background p-3">
								<div class="mb-2 flex items-center justify-between">
									<p class="text-xs font-medium text-muted-foreground">Instance props</p>
									<button type="button" class="text-[11px] text-primary hover:text-primary/80" @click="openComponent(selectedNode)">Edit {{ selectedNode.tag }}</button>
								</div>
								<div v-if="selectedInspectorFields.length" class="grid gap-3">
									<InspectorField
										v-for="field in selectedInspectorFields"
										:key="field.key"
										:field="field"
										:model-value="selectedInspectorFieldValue(field)"
										@update:model-value="updateSelectedInspectorField(field, $event)"
									/>
								</div>
								<p v-else class="rounded-md border border-dashed border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
									This component has no inspector properties.
								</p>
							</div>

						<div v-if="isRootSelected" class="mt-4 rounded-md border border-border bg-background p-3">
							<div class="mb-2 flex items-center justify-between">
								<p class="text-xs font-medium text-muted-foreground">Component props</p>
								<span class="text-[11px] text-muted-foreground">{{ activeComponent?.props?.length || 0 }}</span>
							</div>
							<div class="mb-2 grid grid-cols-[1fr_84px_auto] gap-2">
								<input v-model="newProp.name" class="h-8 min-w-0 rounded-md border border-input bg-background px-2 text-xs text-foreground outline-none focus:border-ring" placeholder="propName">
								<select v-model="newProp.type" class="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground outline-none focus:border-ring">
									<option>String</option>
									<option>Number</option>
									<option>Boolean</option>
									<option>Array</option>
									<option>Object</option>
								</select>
								<button type="button" class="h-8 rounded-md bg-secondary px-2 text-xs text-secondary-foreground hover:bg-secondary/80" @click="addProp">Add</button>
							</div>
							<div class="flex flex-wrap gap-1">
								<button
									v-for="prop in activeComponent?.props || []"
									:key="prop.name"
									type="button"
									class="rounded bg-secondary px-2 py-1 font-mono text-[11px] text-secondary-foreground hover:bg-destructive/10 hover:text-destructive"
									@click="removeProp(prop.name)"
								>{{ prop.name }}: {{ prop.type }}</button>
							</div>
						</div>

						<div v-if="isRootSelected" class="mt-4 rounded-md border border-border bg-background p-3">
							<div class="mb-2 flex items-center justify-between">
								<p class="text-xs font-medium text-muted-foreground">Page root data</p>
								<span class="text-[11px]" :class="rootDataError ? 'text-destructive' : 'text-muted-foreground'">{{ rootDataError || 'Live' }}</span>
							</div>
							<ElCodeInput
								:model-value="rootDataText"
								:rows="9"
								:editor="true"
								:_register-field="false"
								:chrome="false"
								lang="json"
								class="template-root-data-input"
								@update:model-value="updateRootData"
							/>
						</div>
						</section>
					</aside>
				</template>
		</ElSplitterPanel>

		<div v-if="isCreateDialogOpen" class="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
			<form class="w-full max-w-sm rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-2xl" @submit.prevent="createComponentRecord">
				<div class="flex items-start justify-between gap-3">
					<div>
						<p class="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Create</p>
						<h2 class="mt-1 text-base font-semibold text-foreground">{{ createKind === 'page' ? 'New page' : createFromSelection ? 'Component from selection' : 'New component' }}</h2>
					</div>
					<button type="button" class="rounded px-2 py-1 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground" @click="isCreateDialogOpen = false">Close</button>
				</div>
				<label class="mt-4 grid gap-1">
					<span class="text-xs text-muted-foreground">Name</span>
					<input v-model="createName" class="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring" placeholder="HeroFeature">
				</label>
				<p v-if="createNameError" class="mt-2 text-xs text-destructive">{{ createNameError }}</p>
				<p class="mt-3 text-xs leading-5 text-muted-foreground">
					The draft opens immediately so you can build visually or paste Vue template code, then save it back into this experiment.
				</p>
				<div class="mt-4 flex justify-end gap-2">
					<button type="button" class="h-8 rounded-md border border-border px-3 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground" @click="isCreateDialogOpen = false">Cancel</button>
					<button type="submit" class="h-8 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90">Create</button>
				</div>
			</form>
		</div>
	</div>
</template>

<style scoped>
.template-root-data-input {
	min-height: 11rem;
}

.template-class-input :deep(.el-input) {
	border-color: var(--input);
	background: var(--background);
	color: var(--foreground);
	outline: none;
}

.template-class-input :deep(.el-input:focus) {
	border-color: var(--ring);
	box-shadow: none;
}

.template-class-input :deep(label) {
	color: var(--foreground);
}

.template-class-input :deep(label.opacity-50) {
	color: var(--muted-foreground);
	opacity: 1;
}

.template-class-input :deep(input[type="checkbox"]) {
	accent-color: var(--primary);
}

.template-layer-tree {
	border-radius: 0.5rem;
}

:deep([data-template-node]) {
	outline: 0 solid transparent;
	outline-offset: 2px;
	transition: outline-color 120ms ease, box-shadow 120ms ease;
}

:deep([data-template-hovered="true"]) {
	outline: 2px solid color-mix(in oklch, var(--ring) 65%, transparent);
}

:deep([data-template-preview-states]) {
	box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--primary) 35%, transparent);
}

:deep([data-template-selected="true"]) {
	outline: 2px solid var(--ring);
	box-shadow: 0 0 0 4px color-mix(in oklch, var(--ring) 18%, transparent);
}

:deep([data-template-selected="true"][data-template-preview-states]) {
	box-shadow: 0 0 0 4px color-mix(in oklch, var(--ring) 18%, transparent), inset 0 0 0 1px color-mix(in oklch, var(--primary) 45%, transparent);
}

:deep([data-template-force-disabled="true"]) {
	cursor: not-allowed;
}

:deep([data-template-drop-target="true"]) {
	outline: 3px dashed var(--ring);
	box-shadow: 0 0 0 4px color-mix(in oklch, var(--ring) 18%, transparent), 0 8px 18px color-mix(in oklch, var(--ring) 22%, transparent);
}

:deep(.template-slot-hint) {
	position: relative;
	display: flex;
	min-height: 3rem;
	align-items: center;
	justify-content: space-between;
	gap: 0.75rem;
	border: 1px dashed color-mix(in oklch, var(--ring) 62%, transparent);
	border-radius: 0.5rem;
	background: color-mix(in oklch, var(--background) 86%, var(--accent));
	padding: 0.75rem 0.875rem;
	color: var(--foreground);
	cursor: copy;
}

:deep(.template-slot-hint__label) {
	font-size: 0.75rem;
	font-weight: 650;
	letter-spacing: 0.08em;
	text-transform: uppercase;
}

:deep(.template-slot-hint__helper) {
	font-size: 0.75rem;
	color: var(--muted-foreground);
}

:deep([data-template-drop-position]) {
	position: relative;
}

:deep([data-template-drop-position]::before),
:deep([data-template-drop-position]::after) {
	position: absolute;
	left: 0.75rem;
	right: 0.75rem;
	z-index: 30;
	height: 3px;
	border-radius: 999px;
	background: var(--ring);
	opacity: 0;
	box-shadow:
		0 0 0 2px var(--background),
		0 5px 12px color-mix(in oklch, var(--ring) 32%, transparent);
	content: "";
	pointer-events: none;
}

:deep([data-template-drop-position]::before) {
	top: 0.125rem;
}

:deep([data-template-drop-position]::after) {
	bottom: 0.125rem;
}

:deep([data-template-drop-position="before"]::before) {
	opacity: 1;
}

:deep([data-template-drop-position="after"]::after) {
	opacity: 1;
}

:deep([data-template-drop-position="inside"]::after) {
	bottom: 0.5rem;
	opacity: 1;
}
</style>
