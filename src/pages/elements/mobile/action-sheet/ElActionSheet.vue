<script setup>
import { computed, onMounted, ref, useId, watch } from 'vue';

defineOptions({
	__doc: {
		name: 'Action sheet',
		tag: '<ElActionSheet>',
		description: 'A bottom action sheet for app choices, destructive actions, and quick commands.',
		events: [
			{ name: 'update:modelValue', payload: 'boolean', description: 'Fired when the sheet opens or closes.' },
			{ name: 'select', payload: 'object', description: 'Fired with the selected action.' },
		],
		playground: {
			mobileSlot: 'overlay',
			initial: {
				modelValue: true,
				title: 'Project actions',
				description: 'Use for app commands that should stay near the thumb.',
				actions: [
					{ label: 'Share project', description: 'Open the native share sheet', value: 'share' },
					{ label: 'Duplicate screen', value: 'duplicate' },
					{ label: 'Delete draft', value: 'delete', variant: 'danger' },
				],
			},
		},
	},
});

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false,
		_edit: { description: 'Whether the action sheet is open.' },
	},
	title: {
		type: String,
		default: '',
		_edit: { description: 'Optional action sheet title.' },
	},
	description: {
		type: String,
		default: '',
		_edit: { description: 'Optional supporting text below the title.' },
	},
	actions: {
		type: Array,
		default: () => [],
		_edit: {
			component: 'ElJsonListInput',
			props: {
				addLabel: '+ Add action',
				compact: true,
				schema: {
					type: 'array',
					items: {
						type: 'ElForm',
						properties: {
							label: {
								type: 'string',
								label: 'Label',
								placeholder: 'Share project',
							},
							description: {
								type: 'string',
								label: 'Description',
								placeholder: 'Open the native share sheet',
							},
							value: {
								type: 'string',
								label: 'Value',
								placeholder: 'share',
							},
							variant: {
								type: 'string',
								component: 'ElSelectInput',
								label: 'Variant',
								options: [
									{ label: 'Default', value: '' },
									{ label: 'Danger', value: 'danger' },
								],
							},
						},
					},
				},
			},
			description: 'Action rows: { label, description, value, variant }.',
		},
	},
	cancelLabel: {
		type: String,
		default: 'Cancel',
		_edit: { description: 'Dismiss button label.' },
	},
});
const emit = defineEmits(['update:modelValue', 'select']);

const drawer = ref(null);
const uniqueId = useId();
const titleId = computed(() => (props.title ? `el-action-sheet-${uniqueId}-title` : ''));

function close() {
	emit('update:modelValue', false);
}

function selectAction(action) {
	emit('select', action);
	close();
}

function setOpen(value) {
	if (drawer.value) drawer.value.open = value;
}

onMounted(async () => {
	await import('../../lib/headless/drawer.js');
	drawer.value?.addEventListener('el:open', () => {
		emit('update:modelValue', true);
	});
	drawer.value?.addEventListener('el:close', () => {
		emit('update:modelValue', false);
	});
	if (props.modelValue) setOpen(true);
});

watch(() => props.modelValue, setOpen);
</script>

<template>
	<element-drawer
		ref="drawer"
		side="bottom"
		class="absolute inset-0 z-30 block pointer-events-none data-[state=open]:pointer-events-auto"
		:aria-labelledby="titleId || null"
	>
		<div
			data-overlay
			data-no-defaults
			class="absolute inset-0 pointer-events-none data-[state=open]:pointer-events-auto"
		>
			<div
				data-backdrop
				data-no-defaults
				class="absolute inset-0 bg-black/40 opacity-0 backdrop-blur-sm transition-opacity duration-300 data-[state=open]:opacity-100"
			></div>
			<section
				data-panel
				data-no-defaults
				class="absolute inset-x-3 bottom-3 translate-y-full outline-none transition-transform duration-300 ease-out data-[state=open]:translate-y-0"
				:class="'pb-[env(safe-area-inset-bottom,0px)]'"
			>
				<button
					data-drag-handle
					type="button"
					class="group mx-auto mb-1 flex h-8 w-full items-center justify-center"
					aria-label="Drag to close action sheet"
				>
					<span class="block h-1.5 w-12 rounded-full bg-white/70 shadow-sm transition group-hover:bg-white"></span>
				</button>
				<div class="overflow-hidden rounded-[1.75rem] border border-border bg-card text-card-foreground shadow-2xl shadow-black/25">
					<div v-if="title || description" class="border-b border-border px-5 py-4 text-center">
						<h2 v-if="title" :id="titleId" class="text-sm font-semibold text-foreground">{{ title }}</h2>
						<p v-if="description" class="mt-1 text-xs leading-5 text-muted-foreground">{{ description }}</p>
					</div>
					<div>
						<button
							v-for="action in actions"
							:key="action.value || action.label"
							type="button"
							class="block min-h-14 w-full border-b border-border px-5 py-3 text-center transition last:border-b-0 hover:bg-secondary/70 active:bg-secondary"
							:class="action.variant === 'danger' ? 'text-destructive' : 'text-foreground'"
							@click="selectAction(action)"
						>
							<span class="block text-sm font-medium">{{ action.label }}</span>
							<span v-if="action.description" class="mt-0.5 block text-xs text-muted-foreground">{{ action.description }}</span>
						</button>
					</div>
				</div>
				<button
					data-close
					type="button"
					class="mt-2 min-h-14 w-full rounded-[1.5rem] border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-xl shadow-black/10 transition hover:bg-secondary active:bg-secondary"
				>{{ cancelLabel }}</button>
			</section>
		</div>
	</element-drawer>
</template>
