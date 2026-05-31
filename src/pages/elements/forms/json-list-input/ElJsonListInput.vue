<script setup>
import { computed, ref } from 'vue';
import ElField from '../field/ElField.vue';
import ElJsonInput from '../json-input/ElJsonInput.vue';
import { fieldProps } from '../field/fieldProps.js';
import { useField } from '../field/useField.js';

defineOptions({
	__doc: {
		name: 'JSON list input',
		tag: '<ElJsonListInput>',
		description: 'A schema-aware editor for arrays of objects. Edit rows through form controls, or toggle to raw JSON for bulk changes.',
		events: [
			{ name: 'update:modelValue', payload: 'Array<object>', description: 'Fired when rows are added, removed, reordered, edited, or replaced from valid raw JSON.' },
		],
	},
});

const props = defineProps({
	...fieldProps,
	modelValue: {
		type: Array,
		default: () => [],
		_edit: { component: 'ElJsonListInput', props: { compact: true } },
	},
	addLabel: {
		type: String,
		default: '+ Add row',
		_edit: { description: 'Button label for adding a row.' },
	},
	schema: {
		type: Array,
		default: () => [],
		_edit: {
			component: 'ElJsonInput',
			props: {
				label: 'Schema',
				description: 'Fields used by the visual editor.',
				rows: 8,
			},
		},
	},
	jsonToggle: {
		type: Boolean,
		default: true,
		_edit: { description: 'Show the visual/raw JSON mode switch.' },
	},
	compact: {
		type: Boolean,
		default: false,
		_edit: { description: 'Reduce vertical spacing for inspectors and narrow tool panels.' },
	},
});
const emit = defineEmits(['update:modelValue', 'focus', 'blur']);
const field = useField(props, emit, { idPrefix: 'el-json-list-input' });
const mode = ref('fields');
const rawError = ref('');

const rows = computed(() => (Array.isArray(field.value.value) ? field.value.value : []));
const update = (next) => field.onInput(next);

const fields = computed(() => {
	if (props.schema.length) return props.schema;
	const keys = [...new Set(rows.value.flatMap((row) => (isObject(row) ? Object.keys(row) : [])))];
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
	update(rows.value.map((row, index) => (index === rowIndex ? { ...row, [key]: value } : row)));
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
	update(rows.value.filter((_, index) => index !== rowIndex));
}

function add() {
	const index = rows.value.length;
	const row = Object.fromEntries(fields.value.map((field) => [field.key, defaultFor(field, index)]));
	update([...rows.value, row]);
}

function move(rowIndex, dir) {
	const nextIndex = rowIndex + dir;
	if (nextIndex < 0 || nextIndex >= rows.value.length) return;
	const next = [...rows.value];
	[next[rowIndex], next[nextIndex]] = [next[nextIndex], next[rowIndex]];
	update(next);
}

function setRawJson(value) {
	if (!Array.isArray(value)) {
		rawError.value = 'JSON list input expects an array of objects.';
		return;
	}

	rawError.value = '';
	update(value);
}
</script>

<template>
	<ElField v-bind="field.fieldAttrs.value" :chrome="chrome">
		<input
			v-if="field.htmlName.value"
			type="hidden"
			:name="field.htmlName.value"
			:value="JSON.stringify(rows)"
		/>
		<div :class="compact ? 'space-y-1.5' : 'space-y-2'">
			<div v-if="jsonToggle" class="flex justify-end">
				<div class="inline-flex rounded-lg border border-border bg-secondary/60 p-0.5">
					<button
							type="button"
							class="rounded-md px-2.5 py-1 text-xs font-medium transition"
							:class="mode === 'fields' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
							:aria-pressed="mode === 'fields'"
							@click="mode = 'fields'"
						>
						Fields
					</button>
					<button
							type="button"
							class="rounded-md px-2.5 py-1 text-xs font-medium transition"
							:class="mode === 'json' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
							:aria-pressed="mode === 'json'"
							@click="mode = 'json'"
						>
						JSON
					</button>
				</div>
			</div>

			<div v-if="mode === 'json'">
				<ElJsonInput
					:model-value="rows"
					:rows="compact ? 7 : 12"
					:editor="true"
					:chrome="'none'"
					:_register-field="false"
					@update:model-value="setRawJson"
					@focus="field.onFocus"
					@blur="field.onBlur"
				/>
				<p v-if="rawError" class="mt-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-mono text-destructive">
					{{ rawError }}
				</p>
			</div>

			<template v-else>
				<div
					v-for="(row, rowIndex) in rows"
					:key="rowIndex"
					class="rounded-lg border border-border bg-background"
					:class="compact ? 'space-y-1 p-1.5' : 'space-y-2 p-2'"
				>
					<div class="flex items-center justify-between gap-2">
						<span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Row {{ rowIndex + 1 }}</span>
						<span class="flex items-center gap-1">
								<button type="button" class="grid place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground" :class="compact ? 'size-6' : 'size-7'" title="Move up" :aria-label="`Move row ${rowIndex + 1} up`" @click="move(rowIndex, -1)">↑</button>
								<button type="button" class="grid place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground" :class="compact ? 'size-6' : 'size-7'" title="Move down" :aria-label="`Move row ${rowIndex + 1} down`" @click="move(rowIndex, 1)">↓</button>
								<button type="button" class="grid place-items-center rounded-md text-destructive hover:bg-destructive/10" :class="compact ? 'size-6' : 'size-7'" title="Remove" :aria-label="`Remove row ${rowIndex + 1}`" @click="remove(rowIndex)">×</button>
						</span>
					</div>
					<label
						v-for="column in fields"
						:key="column.key"
						:class="compact ? 'grid grid-cols-[4.75rem_minmax(0,1fr)] items-center gap-1.5' : 'block'"
					>
						<span
							class="text-[11px] font-medium text-muted-foreground"
							:class="compact ? 'truncate text-right' : 'mb-1 block'"
						>{{ column.label || column.key }}</span>
						<textarea
							v-if="column.type === 'json'"
							:value="fieldValue(row, column)"
							:placeholder="column.placeholder || column.key"
							:rows="compact ? 3 : 5"
							class="w-full resize-y rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs text-foreground outline-none focus:ring-2 focus:ring-ring/40"
							:class="compact ? 'min-h-16' : 'min-h-24'"
							@change="setField(rowIndex, column, $event.target.value)"
							@focus="field.onFocus"
							@blur="field.onBlur"
						></textarea>
						<input
							v-else
							:type="column.type || 'text'"
							:value="fieldValue(row, column)"
							:placeholder="column.placeholder || column.key"
							class="w-full rounded-md border border-border bg-background px-2 text-foreground outline-none focus:ring-2 focus:ring-ring/40"
							:class="compact ? 'h-7 text-xs' : 'h-8 text-sm'"
							@input="setField(rowIndex, column, $event.target.value)"
							@focus="field.onFocus"
							@blur="field.onBlur"
						/>
					</label>
				</div>
				<button
					type="button"
					class="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-background text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
					:class="compact ? 'py-1.5' : 'py-2'"
					@click="add"
				>{{ addLabel }}</button>
			</template>
		</div>
	</ElField>
</template>
