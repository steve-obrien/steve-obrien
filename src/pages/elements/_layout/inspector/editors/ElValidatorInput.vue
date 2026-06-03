<script setup>
import { computed } from 'vue';
import ElField from '../../../forms/field/ElField.vue';
import ElJsonInput from '../../../forms/json-input/ElJsonInput.vue';
import { listValidators } from '../../../forms/field/validators.js';
import ElPropDefinitionInput from './ElPropDefinitionInput.vue';

defineOptions({
	__doc: {
		name: 'Validator input',
		tag: '<ElValidatorInput>',
		description: 'An inspector editor for serializable field validator records.',
		hidden: true,
	},
});

const CUSTOM_VALIDATOR = '__custom';

const props = defineProps({
	label: {
		type: String,
		default: '',
	},
	description: {
		type: String,
		default: '',
	},
	modelValue: {
		type: Array,
		default: () => [],
	},
	compact: {
		type: Boolean,
		default: true,
	},
});

const emit = defineEmits(['update:modelValue']);

const rows = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []));
const registeredValidators = computed(() => listValidators());
const validatorsByName = computed(() => new Map(registeredValidators.value.map((validator) => [validator.name, validator])));
const options = computed(() => [
	...registeredValidators.value.map((validator) => ({
		label: validator.label || prettify(validator.name),
		value: validator.name,
	})),
	{ label: 'Custom', value: CUSTOM_VALIDATOR },
]);

function selectedType(record = {}) {
	return validatorsByName.value.has(record.name) ? record.name : CUSTOM_VALIDATOR;
}

function definitionFor(record = {}) {
	return validatorsByName.value.get(record.name) || {
		name: record.name || '',
		label: record.name || 'Custom',
		description: 'Use a validator registered by the app.',
		props: {},
	};
}

function defaultValue(definition) {
	if (!definition || !Object.prototype.hasOwnProperty.call(definition, 'default')) {
		return definition?.type === Boolean ? false : undefined;
	}
	if (typeof definition.default === 'function' && definition.type !== Function) return definition.default();
	return definition.default;
}

function defaultProps(definitions = {}) {
	return Object.fromEntries(Object.entries(definitions)
		.map(([key, definition]) => [key, defaultValue(definition)])
		.filter(([, value]) => value !== undefined));
}

function cleanRecord(record = {}) {
	const next = {
		name: String(record.name || '').trim(),
	};
	const recordProps = record.props && typeof record.props === 'object' && !Array.isArray(record.props)
		? Object.fromEntries(Object.entries(record.props).filter(([, value]) => value !== undefined && value !== ''))
		: {};

	if (Object.keys(recordProps).length) next.props = recordProps;
	if (record.message) next.message = record.message;
	return next;
}

function emitRows(nextRows) {
	emit('update:modelValue', nextRows.map((row) => cleanRecord(row)).filter((row) => row.name));
}

function setRow(rowIndex, nextRow) {
	emitRows(rows.value.map((row, index) => (index === rowIndex ? nextRow : row)));
}

function add() {
	const validator = registeredValidators.value[0];
	emitRows([...rows.value, {
		name: validator?.name || '',
		props: defaultProps(validator?.props),
	}]);
}

function remove(rowIndex) {
	emitRows(rows.value.filter((_, index) => index !== rowIndex));
}

function move(rowIndex, direction) {
	const nextIndex = rowIndex + direction;
	if (nextIndex < 0 || nextIndex >= rows.value.length) return;
	const nextRows = [...rows.value];
	[nextRows[rowIndex], nextRows[nextIndex]] = [nextRows[nextIndex], nextRows[rowIndex]];
	emitRows(nextRows);
}

function changeType(rowIndex, type) {
	const current = rows.value[rowIndex] || {};
	if (type === CUSTOM_VALIDATOR) {
		setRow(rowIndex, {
			name: validatorsByName.value.has(current.name) ? 'customValidator' : current.name,
			props: current.props || {},
			message: current.message || '',
		});
		return;
	}

	const validator = validatorsByName.value.get(type);
	setRow(rowIndex, {
		name: type,
		props: defaultProps(validator?.props),
		message: current.message || '',
	});
}

function setName(rowIndex, name) {
	setRow(rowIndex, {
		...(rows.value[rowIndex] || {}),
		name,
	});
}

function setProps(rowIndex, nextProps) {
	setRow(rowIndex, {
		...(rows.value[rowIndex] || {}),
		props: nextProps && typeof nextProps === 'object' && !Array.isArray(nextProps) ? nextProps : {},
	});
}

function setMessage(rowIndex, message) {
	setRow(rowIndex, {
		...(rows.value[rowIndex] || {}),
		message,
	});
}

function prettify(value) {
	return String(value || '')
		.replace(/[-_]+/g, ' ')
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/^./, (letter) => letter.toUpperCase());
}
</script>

<template>
	<ElField :label="label" :description="description">
		<div class="space-y-2">
			<div
				v-for="(validator, rowIndex) in rows"
				:key="rowIndex"
				class="rounded-lg border border-border bg-background p-2"
			>
				<div class="flex items-start justify-between gap-2">
					<div class="min-w-0">
						<p class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Validator {{ rowIndex + 1 }}</p>
						<p class="truncate text-xs text-muted-foreground">{{ definitionFor(validator).description }}</p>
					</div>
					<div class="flex shrink-0 items-center gap-1">
						<button type="button" class="h-7 rounded-md px-2 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground" title="Move up" :aria-label="`Move validator ${rowIndex + 1} up`" @click="move(rowIndex, -1)">Up</button>
						<button type="button" class="h-7 rounded-md px-2 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground" title="Move down" :aria-label="`Move validator ${rowIndex + 1} down`" @click="move(rowIndex, 1)">Down</button>
						<button type="button" class="h-7 rounded-md px-2 text-[11px] font-medium text-destructive hover:bg-destructive/10" title="Remove" :aria-label="`Remove validator ${rowIndex + 1}`" @click="remove(rowIndex)">Remove</button>
					</div>
				</div>

				<label class="mt-2 block">
					<span class="mb-1 block text-[11px] font-medium text-muted-foreground">Type</span>
					<select
						:value="selectedType(validator)"
						class="h-8 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring/40"
						@change="changeType(rowIndex, $event.target.value)"
					>
						<option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
					</select>
				</label>

				<label v-if="selectedType(validator) === CUSTOM_VALIDATOR" class="mt-2 block">
					<span class="mb-1 block text-[11px] font-medium text-muted-foreground">Validator name</span>
					<input
						:value="validator.name || ''"
						placeholder="serverUnique"
						class="h-8 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring/40"
						@input="setName(rowIndex, $event.target.value)"
					/>
				</label>

				<ElPropDefinitionInput
					v-if="selectedType(validator) !== CUSTOM_VALIDATOR && Object.keys(definitionFor(validator).props || {}).length"
					:model-value="validator.props || {}"
					label="Props"
					:definitions="definitionFor(validator).props"
					:compact="compact"
					@update:model-value="setProps(rowIndex, $event)"
				/>

				<ElJsonInput
					v-if="selectedType(validator) === CUSTOM_VALIDATOR"
					:model-value="validator.props || {}"
					label="Props"
					:rows="compact ? 5 : 8"
					:editor="false"
					:_register-field="false"
					@update:model-value="setProps(rowIndex, $event)"
				/>

				<label class="mt-2 block">
					<span class="mb-1 block text-[11px] font-medium text-muted-foreground">Custom message</span>
					<input
						:value="validator.message || ''"
						placeholder="Optional error message"
						class="h-8 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring/40"
						@input="setMessage(rowIndex, $event.target.value)"
					/>
				</label>
			</div>

			<p v-if="!rows.length" class="rounded-lg border border-dashed border-border bg-secondary/30 px-3 py-3 text-xs text-muted-foreground">
				No validators yet.
			</p>

			<button
				type="button"
				class="flex w-full items-center justify-center rounded-lg border border-dashed border-border bg-background py-2 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
				@click="add"
			>
				Add validator
			</button>
		</div>
	</ElField>
</template>
