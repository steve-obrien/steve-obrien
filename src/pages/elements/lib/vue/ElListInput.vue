<script setup>
import ElField from './ElField.vue';

// An editor for arrays of `{ label, value }` items: add, remove, reorder, and
// edit each row inline. Works as a standalone form input and as an inspector
// editor for props that take a list (registered as `ElListInput` in the
// editor registry, used by ElDropdown.items).
const props = defineProps({
	modelValue: {
		type: Array,
		default: () => [],
		// Self-edit: when the inspector lands on an ElListInput's `modelValue`,
		// render an ElListInput to edit its value.
		_edit: { component: 'ElListInput' },
	},
	label: String,
	description: String,
	addLabel: { type: String, default: '+ Add item' },
	labelPlaceholder: { type: String, default: 'Label' },
	valuePlaceholder: { type: String, default: 'value' },
});
const emit = defineEmits(['update:modelValue']);

const update = (next) => emit('update:modelValue', next);

function setRow(i, key, value) {
	update(props.modelValue.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)));
}
function remove(i) { update(props.modelValue.filter((_, idx) => idx !== i)); }
function add() {
	const n = props.modelValue.length + 1;
	update([...props.modelValue, { label: `Item ${n}`, value: `item-${n}` }]);
}
function move(i, dir) {
	const j = i + dir;
	if (j < 0 || j >= props.modelValue.length) return;
	const arr = [...props.modelValue];
	[arr[i], arr[j]] = [arr[j], arr[i]];
	update(arr);
}
</script>

<template>
	<ElField :label="label" :description="description">
		<div class="space-y-2">
			<div
				v-for="(it, i) in modelValue"
				:key="i"
				class="space-y-1.5 rounded-lg border border-skin-border bg-skin-background p-2"
			>
				<div class="flex items-center gap-1">
					<input
						:value="it.label"
						:placeholder="labelPlaceholder"
						class="h-8 flex-1 rounded-md border border-skin-border bg-skin-background px-2 text-sm text-skin-primary outline-none focus:ring-2 focus:ring-skin-primary/40"
						@input="setRow(i, 'label', $event.target.value)"
					/>
					<button type="button" class="grid size-7 place-items-center rounded-md text-skin-secondary hover:bg-skin-surface hover:text-skin-primary" title="Move up" @click="move(i, -1)">↑</button>
					<button type="button" class="grid size-7 place-items-center rounded-md text-skin-secondary hover:bg-skin-surface hover:text-skin-primary" title="Move down" @click="move(i, 1)">↓</button>
					<button type="button" class="grid size-7 place-items-center rounded-md text-red-500 hover:bg-red-500/10" title="Remove" @click="remove(i)">×</button>
				</div>
				<input
					:value="it.value"
					:placeholder="valuePlaceholder"
					class="h-7 w-full rounded-md border border-skin-border bg-skin-background px-2 font-mono text-[12px] text-skin-secondary outline-none focus:ring-2 focus:ring-skin-primary/40"
					@input="setRow(i, 'value', $event.target.value)"
				/>
			</div>
			<button
				type="button"
				class="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-skin-border bg-skin-background py-2 text-xs font-medium text-skin-secondary hover:border-skin-primary/40 hover:text-skin-primary"
				@click="add"
			>{{ addLabel }}</button>
		</div>
	</ElField>
</template>
