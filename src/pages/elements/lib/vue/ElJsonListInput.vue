<script setup>
import { computed } from 'vue';
import ElField from './ElField.vue';

const props = defineProps({
	modelValue: {
		type: Array,
		default: () => [],
		_edit: { component: 'ElJsonListInput' },
	},
	label: String,
	description: String,
	addLabel: { type: String, default: '+ Add row' },
	schema: {
		type: Array,
		default: () => [],
	},
});
const emit = defineEmits(['update:modelValue']);

const update = (next) => emit('update:modelValue', next);

const fields = computed(() => {
	if (props.schema.length) return props.schema;
	const keys = [...new Set(props.modelValue.flatMap((row) => (isObject(row) ? Object.keys(row) : [])))];
	return keys.map((key) => ({
		key,
		label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
		type: key.includes('url') || key.includes('avatar') || key.includes('image') ? 'url' : 'text',
	}));
});

function isObject(value) {
	return value && typeof value === 'object' && !Array.isArray(value);
}

function defaultFor(field, index) {
	if ('default' in field) return typeof field.default === 'function' ? field.default(index) : field.default;
	if (field.key === 'label') return `Item ${index + 1}`;
	if (field.key === 'value') return `item-${index + 1}`;
	return '';
}

function setRow(rowIndex, key, value) {
	update(props.modelValue.map((row, index) => (index === rowIndex ? { ...row, [key]: value } : row)));
}

function setField(rowIndex, field, value) {
	if (field.type !== 'json') {
		setRow(rowIndex, field.key, value);
		return;
	}

	try {
		setRow(rowIndex, field.key, JSON.parse(value));
	} catch {
		// Leave invalid JSON untouched. The field will snap back on blur/change.
	}
}

function fieldValue(row, field) {
	const value = row?.[field.key];
	if (field.type !== 'json') return value ?? '';
	return JSON.stringify(value ?? null, null, 2);
}

function remove(rowIndex) {
	update(props.modelValue.filter((_, index) => index !== rowIndex));
}

function add() {
	const index = props.modelValue.length;
	const row = Object.fromEntries(fields.value.map((field) => [field.key, defaultFor(field, index)]));
	update([...props.modelValue, row]);
}

function move(rowIndex, dir) {
	const nextIndex = rowIndex + dir;
	if (nextIndex < 0 || nextIndex >= props.modelValue.length) return;
	const next = [...props.modelValue];
	[next[rowIndex], next[nextIndex]] = [next[nextIndex], next[rowIndex]];
	update(next);
}
</script>

<template>
	<ElField :label="label" :description="description">
		<div class="space-y-2">
			<div
				v-for="(row, rowIndex) in modelValue"
				:key="rowIndex"
				class="space-y-2 rounded-lg border border-skin-border bg-skin-background p-2"
			>
				<div class="flex items-center justify-between gap-2">
					<span class="text-[11px] font-semibold uppercase tracking-wider text-skin-muted">Row {{ rowIndex + 1 }}</span>
					<span class="flex items-center gap-1">
						<button type="button" class="grid size-7 place-items-center rounded-md text-skin-secondary hover:bg-skin-surface hover:text-skin-primary" title="Move up" @click="move(rowIndex, -1)">↑</button>
						<button type="button" class="grid size-7 place-items-center rounded-md text-skin-secondary hover:bg-skin-surface hover:text-skin-primary" title="Move down" @click="move(rowIndex, 1)">↓</button>
						<button type="button" class="grid size-7 place-items-center rounded-md text-red-500 hover:bg-red-500/10" title="Remove" @click="remove(rowIndex)">×</button>
					</span>
				</div>
				<label v-for="field in fields" :key="field.key" class="block">
					<span class="mb-1 block text-[11px] font-medium text-skin-muted">{{ field.label || field.key }}</span>
					<textarea
						v-if="field.type === 'json'"
						:value="fieldValue(row, field)"
						:placeholder="field.placeholder || field.key"
						rows="5"
						class="min-h-24 w-full resize-y rounded-md border border-skin-border bg-skin-background px-2 py-1.5 font-mono text-xs text-skin-primary outline-none focus:ring-2 focus:ring-skin-primary/40"
						@change="setField(rowIndex, field, $event.target.value)"
					></textarea>
					<input
						v-else
						:type="field.type || 'text'"
						:value="fieldValue(row, field)"
						:placeholder="field.placeholder || field.key"
						class="h-8 w-full rounded-md border border-skin-border bg-skin-background px-2 text-sm text-skin-primary outline-none focus:ring-2 focus:ring-skin-primary/40"
						@input="setField(rowIndex, field, $event.target.value)"
					/>
				</label>
			</div>
			<button
				type="button"
				class="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-skin-border bg-skin-background py-2 text-xs font-medium text-skin-secondary hover:border-skin-primary/40 hover:text-skin-primary"
				@click="add"
			>{{ addLabel }}</button>
		</div>
	</ElField>
</template>
