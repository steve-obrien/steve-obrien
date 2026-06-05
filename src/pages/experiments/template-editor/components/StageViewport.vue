<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, Teleport, watch } from 'vue';
import { createStageFrameMessage, isStageFrameMessage } from '../lib/stageFrameBridge.js';

const props = defineProps({
	selectedLabel: {
		type: String,
		default: '',
	},
	canDelete: {
		type: Boolean,
		default: false,
	},
	dragging: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits([
	'stage-drop',
	'clear-drop-target',
	'hover-node',
	'clear-hover',
	'delete-selected',
	'select-node',
	'frame-message',
]);

const stageShellEl = ref(null);
const stageFrameEl = ref(null);
const frameMountEl = shallowRef(null);
const frameReady = ref(false);
const stageFrameKey = ref(0);
const viewportMode = ref('desktop');
const zoom = ref(1);

let styleObserver = null;
let styleSyncTimer = null;
let frameDocumentCheckTimer = null;
let frameRecoveryTimer = null;

const viewportOptions = [
	{ id: 'desktop', label: 'Desktop', width: 1280, height: 720 },
	{ id: 'tablet', label: 'Tablet', width: 768, height: 1024 },
	{ id: 'mobile', label: 'Mobile', width: 390, height: 844 },
];
const zoomSteps = [0.5, 0.75, 1, 1.25, 1.5];

const activeViewport = computed(() => viewportOptions.find((option) => option.id === viewportMode.value) || viewportOptions[0]);
const zoomLabel = computed(() => `${Math.round(zoom.value * 100)}%`);
const frameSizerStyle = computed(() => ({
	width: `${activeViewport.value.width * zoom.value}px`,
	minHeight: `${activeViewport.value.height * zoom.value}px`,
}));
const frameStyle = computed(() => ({
	width: `${activeViewport.value.width * zoom.value}px`,
	height: `${activeViewport.value.height * zoom.value}px`,
	minHeight: `${activeViewport.value.height * zoom.value}px`,
}));
const frameState = computed(() => ({
	viewport: activeViewport.value,
	viewportMode: viewportMode.value,
	zoom: zoom.value,
	selectedLabel: props.selectedLabel,
	canDelete: props.canDelete,
	dragging: props.dragging,
}));
const stageSrcdoc = computed(() => `<!doctype html>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<base href="about:srcdoc">
		<style>
			html,
			body,
			#template-stage-scroll,
			#template-stage-root {
				min-height: 100%;
				margin: 0;
			}

			body {
				overflow: auto;
				overscroll-behavior: contain;
				background: var(--background, #fff);
				color: var(--foreground, #111827);
			}
		</style>
	</head>
	<body>
		<div id="template-stage-scroll">
			<div id="template-stage-root"></div>
		</div>
		<script>
			(() => {
				const channel = 'template-editor-stage';
				let latestState = {};
				let resizeObserver = null;

				function send(type, payload = {}) {
					window.parent.postMessage({ channel, type, payload }, '*');
				}

				function applyState(state) {
					latestState = state || {};
					const root = document.getElementById('template-stage-root');
					if (!root) return;
					const viewport = latestState.viewport || {};
					const zoom = Number(latestState.zoom) || 1;
					root.style.width = (Number(viewport.width) || 1280) + 'px';
					root.style.minHeight = (Number(viewport.height) || 720) + 'px';
					root.style.transform = 'scale(' + zoom + ')';
					root.style.transformOrigin = 'top left';
					syncScrollSize();
				}

				function syncScrollSize() {
					const root = document.getElementById('template-stage-root');
					const scroll = document.getElementById('template-stage-scroll');
					if (!root || !scroll) return;
					const viewport = latestState.viewport || {};
					const zoom = Number(latestState.zoom) || 1;
					const width = Number(viewport.width) || 1280;
					const height = Math.max(Number(viewport.height) || 720, root.scrollHeight || root.offsetHeight || 0);
					scroll.style.width = (width * zoom) + 'px';
					scroll.style.minHeight = (height * zoom) + 'px';
				}

				function observeRootSize() {
					const root = document.getElementById('template-stage-root');
					if (!root || resizeObserver) return;
					if (typeof ResizeObserver !== 'function') return;
					resizeObserver = new ResizeObserver(syncScrollSize);
					resizeObserver.observe(root);
				}

				function closestStageLink(target) {
					return target instanceof Element ? target.closest('a[href]') : null;
				}

				function closestTemplateNode(target) {
					return target instanceof Element ? target.closest('[data-template-node]') : null;
				}

				function decodeHashTarget(hash) {
					try {
						return decodeURIComponent(hash);
					} catch {
						return hash;
					}
				}

				function handleStageLinkClick(event) {
					const link = closestStageLink(event.target);
					if (!link) return;

					const node = closestTemplateNode(event.target);
					const nodeId = node?.getAttribute('data-template-node') || '';
					const href = link.getAttribute('href') || '';
					event.preventDefault();
					event.stopPropagation();
					event.stopImmediatePropagation();
					send('link-click', {
						href,
						nodeId,
						text: (link.textContent || '').trim(),
					});
					if (nodeId) send('select-node', { id: nodeId });

					if (href === '#') {
						window.scrollTo({ top: 0, behavior: 'smooth' });
						return;
					}

					if (!href.startsWith('#')) return;
					const target = document.getElementById(decodeHashTarget(href.slice(1)));
					target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}

				window.addEventListener('message', (event) => {
					const message = event.data || {};
					if (message.channel !== channel) return;
					if (message.type === 'render-state') {
						applyState(message.payload);
						send('render-state-applied', latestState);
					}
					if (message.type === 'focus') document.body.focus({ preventScroll: true });
					if (message.type === 'ping') send('pong', { state: latestState });
				});

				document.addEventListener('pointermove', (event) => {
					const node = closestTemplateNode(event.target);
					send('hover-node', { id: node?.getAttribute('data-template-node') || '' });
				});
				window.addEventListener('click', handleStageLinkClick, true);
				window.addEventListener('auxclick', handleStageLinkClick, true);
				document.addEventListener('pointerleave', () => send('clear-hover'));
				document.addEventListener('dragover', (event) => event.preventDefault());
				document.addEventListener('dragleave', (event) => {
					if (event.relatedTarget) return;
					send('clear-drop-target');
				});
				document.addEventListener('drop', (event) => {
					event.preventDefault();
					send('stage-drop');
				});
				document.addEventListener('keydown', (event) => {
					if (!['Backspace', 'Delete'].includes(event.key)) return;
					if (event.metaKey || event.ctrlKey || event.altKey) return;
					if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
					event.preventDefault();
					send('delete-selected');
				});
				document.body.tabIndex = 0;
				observeRootSize();
				requestAnimationFrame(syncScrollSize);
				send('ready');
			})();
		</` + `script>
	</body>
</html>`);

watch(frameState, (state) => {
	postFrameMessage('render-state', state);
}, { deep: true });

onMounted(() => {
	queueFrameDocumentCheck();
});

onBeforeUnmount(() => {
	window.removeEventListener('message', handleFrameMessage);
	if (styleObserver) styleObserver.disconnect();
	window.clearTimeout(styleSyncTimer);
	window.clearTimeout(frameDocumentCheckTimer);
	window.clearTimeout(frameRecoveryTimer);
});

function setViewport(mode) {
	viewportMode.value = mode;
	focus();
}

function stepZoom(direction) {
	const currentIndex = zoomSteps.findIndex((value) => value === zoom.value);
	const fallbackIndex = zoomSteps.findIndex((value) => value === 1);
	const nextIndex = Math.min(Math.max((currentIndex >= 0 ? currentIndex : fallbackIndex) + direction, 0), zoomSteps.length - 1);
	zoom.value = zoomSteps[nextIndex];
	focus();
}

function handleFrameLoad() {
	const frame = stageFrameEl.value;
	const document = frame?.contentDocument;
	const mount = document?.getElementById('template-stage-root') || null;
	if (!mount) {
		recoverFrameDocument();
		return;
	}
	frameMountEl.value = mount;
	frameReady.value = Boolean(frameMountEl.value);
	syncFrameStyles();
	observeParentStyles();
	window.removeEventListener('message', handleFrameMessage);
	window.addEventListener('message', handleFrameMessage);
	postFrameMessage('render-state', frameState.value);
	nextTick(focus);
}

function handleFrameMessage(event) {
	if (event.source !== stageFrameEl.value?.contentWindow) return;
	if (!isStageFrameMessage(event.data)) return;

	const { type, payload = {} } = event.data;
	emit('frame-message', { type, payload });

	if (type === 'ready') {
		frameReady.value = true;
		postFrameMessage('render-state', frameState.value);
		return;
	}
	if (type === 'hover-node') {
		emit('hover-node', payload.id || '');
		return;
	}
	if (type === 'select-node') {
		if (payload.id) emit('select-node', payload.id);
		return;
	}
	if (type === 'clear-hover') {
		emit('clear-hover');
		return;
	}
	if (type === 'clear-drop-target') {
		emit('clear-drop-target');
		return;
	}
	if (type === 'stage-drop') {
		emit('stage-drop');
		return;
	}
	if (type === 'delete-selected') {
		emit('delete-selected');
	}
}

function handlePointerDown(event) {
	if (isEditableTarget(event.target)) return;
	focus();
}

function handleDelete(event) {
	if (!props.canDelete) return;
	if (event) event.preventDefault();
	emit('delete-selected');
	focus();
}

function handleKeydown(event) {
	if (!['Backspace', 'Delete'].includes(event.key)) return;
	if (event.metaKey || event.ctrlKey || event.altKey) return;
	if (isEditableTarget(event.target)) return;
	handleDelete(event);
}

function isEditableTarget(target) {
	if (!(target instanceof HTMLElement)) return false;
	return target.closest('input, textarea, select, [contenteditable="true"]');
}

function focus() {
	stageShellEl.value?.focus({ preventScroll: true });
	postFrameMessage('focus');
}

function postFrameMessage(type, payload = {}) {
	const frameWindow = stageFrameEl.value?.contentWindow;
	if (!frameWindow) return false;
	frameWindow.postMessage(createStageFrameMessage(type, payload), '*');
	return true;
}

function syncFrameStyles() {
	const frameDocument = stageFrameEl.value?.contentDocument;
	if (!frameDocument) return;

	frameDocument.head
		.querySelectorAll('[data-template-frame-style]')
		.forEach((node) => node.remove());

	document.head
		.querySelectorAll('link[rel="stylesheet"], style')
		.forEach((node) => {
			const clone = node.cloneNode(true);
			clone.setAttribute('data-template-frame-style', '');
			frameDocument.head.appendChild(clone);
		});
}

function observeParentStyles() {
	if (styleObserver) return;
	styleObserver = new MutationObserver(queueStyleSync);
	styleObserver.observe(document.head, {
		childList: true,
		characterData: true,
		subtree: true,
	});
}

function queueStyleSync() {
	window.clearTimeout(styleSyncTimer);
	styleSyncTimer = window.setTimeout(syncFrameStyles, 50);
}

function queueFrameDocumentCheck() {
	window.clearTimeout(frameDocumentCheckTimer);
	frameDocumentCheckTimer = window.setTimeout(() => {
		frameDocumentCheckTimer = null;
		const document = stageFrameEl.value?.contentDocument;
		if (!document || document.readyState === 'loading') return;
		if (!document.getElementById('template-stage-root')) recoverFrameDocument();
	}, 250);
}

function recoverFrameDocument() {
	if (frameRecoveryTimer) return;
	frameReady.value = false;
	frameMountEl.value = null;
	window.removeEventListener('message', handleFrameMessage);
	frameRecoveryTimer = window.setTimeout(() => {
		frameRecoveryTimer = null;
		stageFrameKey.value += 1;
	}, 0);
}

defineExpose({ focus, postFrameMessage });
</script>

<template>
	<section class="flex min-h-0 flex-1 flex-col bg-background text-foreground">
		<div class="flex min-h-12 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-3 text-card-foreground">
			<div class="flex min-w-0 items-center gap-2">
				<div class="flex rounded-md border border-border bg-background p-0.5">
					<button
						v-for="option in viewportOptions"
						:key="option.id"
						type="button"
						class="h-7 rounded px-2 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
						:class="viewportMode === option.id && 'bg-secondary text-foreground'"
						@click="setViewport(option.id)"
					>
						{{ option.label }}
					</button>
				</div>
				<div class="flex items-center rounded-md border border-border bg-background">
					<button type="button" class="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground" title="Zoom out" @click="stepZoom(-1)">-</button>
					<span class="w-12 text-center text-[11px] font-medium text-muted-foreground">{{ zoomLabel }}</span>
					<button type="button" class="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground" title="Zoom in" @click="stepZoom(1)">+</button>
				</div>
				<span class="hidden text-[11px] text-muted-foreground sm:inline">{{ activeViewport.width }} x {{ activeViewport.height }}</span>
			</div>
			<div class="flex shrink-0 items-center gap-2">
				<p v-if="selectedLabel" class="hidden max-w-48 truncate text-[11px] text-muted-foreground md:block">{{ selectedLabel }}</p>
				<button
					type="button"
					class="h-8 rounded-md border border-destructive/30 px-2 text-[11px] font-medium text-destructive hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-40"
					:disabled="!canDelete"
					@click="handleDelete"
				>
					Delete
				</button>
			</div>
		</div>

		<div
			ref="stageShellEl"
			tabindex="0"
			class="min-h-0 flex-1 overflow-auto bg-muted/35 p-6 outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
			:class="dragging && 'bg-accent/30'"
			@keydown="handleKeydown"
			@pointerdown="handlePointerDown"
		>
			<div class="mx-auto" :style="frameSizerStyle">
				<iframe
					:key="stageFrameKey"
					ref="stageFrameEl"
					class="block overflow-hidden border border-border bg-background shadow-sm"
					:srcdoc="stageSrcdoc"
					:style="frameStyle"
					title="Template editor stage"
					sandbox="allow-scripts allow-same-origin"
					@load="handleFrameLoad"
				></iframe>
			</div>
		</div>

		<Teleport v-if="frameMountEl" :to="frameMountEl">
			<slot />
		</Teleport>
	</section>
</template>
