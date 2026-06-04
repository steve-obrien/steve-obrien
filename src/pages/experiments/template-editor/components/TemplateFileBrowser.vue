<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { ElTreeView } from '../../../elements/lib/vue';

const props = defineProps({
	endpoint: {
		type: String,
		default: '/experiments/template-editor/files',
	},
	modelValue: {
		type: String,
		default: '',
	},
});

const emit = defineEmits(['update:modelValue', 'open-file', 'close']);
const rootItem = ref(null);
const openValues = ref(['dir:']);
const selectedValue = ref(props.modelValue);
const loading = ref(false);
const loadingPath = ref('');
const error = ref('');

const treeItems = computed(() => rootItem.value ? [rootItem.value] : []);

watch(() => props.modelValue, (value) => {
	selectedValue.value = value || '';
});

onMounted(loadFileTree);

async function loadFileTree() {
	loading.value = true;
	error.value = '';
	try {
		const payload = await fetchJson(props.endpoint);
		rootItem.value = payload.tree;
		openValues.value = collectOpenValues(payload.tree);
	} catch (loadError) {
		error.value = loadError instanceof Error ? loadError.message : 'Could not load files.';
	} finally {
		loading.value = false;
	}
}

async function selectTreeItem(event) {
	const item = event?.item;
	if (!item) return;
	selectedValue.value = event.value || item.id;
	emit('update:modelValue', selectedValue.value);
	if (item.kind !== 'file' || !item.path) return;

	loadingPath.value = item.path;
	error.value = '';
	try {
		const payload = await fetchJson(fileUrl(item.path));
		emit('open-file', payload.file);
	} catch (loadError) {
		error.value = loadError instanceof Error ? loadError.message : 'Could not open file.';
	} finally {
		loadingPath.value = '';
	}
}

function fileUrl(path) {
	const url = new URL(props.endpoint, window.location.origin);
	url.searchParams.set('path', path);
	return url.toString();
}

async function fetchJson(url) {
	const response = await fetch(url, { headers: { accept: 'application/json' } });
	if (!response.ok) throw new Error(await response.text() || 'Template file request failed.');
	return response.json();
}

function collectOpenValues(item, values = []) {
	if (!item) return values;
	if (item.open || item.id === 'dir:') values.push(item.id);
	for (const child of item.children || []) collectOpenValues(child, values);
	return values;
}
</script>

<template>
	<section class="flex h-full min-h-0 flex-col bg-card text-card-foreground">
		<header class="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
			<div class="min-w-0">
				<p class="truncate text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Files</p>
			</div>
			<div class="flex shrink-0 items-center gap-1">
				<button
					type="button"
					class="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
					aria-label="Refresh files"
					title="Refresh files"
					:disabled="loading"
					@click="loadFileTree"
				>
					<svg viewBox="0 0 24 24" class="size-4" fill="none" aria-hidden="true">
						<path d="M20 6v5h-5M4 18v-5h5M18.5 9A7 7 0 0 0 6.8 5.7M5.5 15a7 7 0 0 0 11.7 3.3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</button>
				<button
					type="button"
					class="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
					aria-label="Close file browser"
					title="Close file browser"
					@click="emit('close')"
				>
					<svg viewBox="0 0 24 24" class="size-4" fill="none" aria-hidden="true">
						<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</button>
			</div>
		</header>

		<div v-if="error" class="border-b border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive">
			{{ error }}
		</div>

		<div class="min-h-0 flex-1 overflow-y-auto bg-background p-2">
			<div v-if="loading && !treeItems.length" class="px-2 py-3 text-xs text-muted-foreground">Loading files...</div>
			<ElTreeView
				v-else-if="treeItems.length"
				:model-value="selectedValue"
				:items="treeItems"
				:open-values="openValues"
				:chrome="false"
				:draggable="false"
				label="Template files"
				class="template-file-tree"
				@select="selectTreeItem"
				@update:open-values="openValues = $event"
			>
				<template #item="{ item }">
					<span class="flex min-w-0 items-center gap-2">
						<span class="truncate">{{ item.label }}</span>
						<span
							v-if="item.kind === 'file'"
							class="ml-auto shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground group-aria-selected:bg-primary-foreground/15 group-aria-selected:text-primary-foreground/80"
						>Vue</span>
						<span v-if="loadingPath === item.path" class="shrink-0 text-[10px] text-muted-foreground group-aria-selected:text-primary-foreground/80">Opening</span>
					</span>
				</template>
			</ElTreeView>
			<p v-else class="px-2 py-3 text-xs text-muted-foreground">No Vue files found.</p>
		</div>

		<footer class="shrink-0 truncate border-t border-border px-4 py-3 text-[11px] text-muted-foreground">
			src/pages/experiments/template-editor/components
		</footer>
	</section>
</template>
