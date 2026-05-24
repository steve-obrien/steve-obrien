<script setup>
import { computed, ref } from 'vue';
import ElField from './ElField.vue';

defineOptions({
	__doc: {
		name: 'Password input',
		tag: '<ElPasswordInput>',
		description: 'A styled password field with show/hide control, strength feedback, and an optional compromised-password warning.',
		events: [
			{ name: 'update:modelValue', payload: 'string', description: 'Fired when the password text changes.' },
		],
	},
});

const props = defineProps({
	modelValue: { type: String, default: '' },
	label: {
		type: String,
		default: 'Password',
		_edit: { description: 'Visible field label.' },
	},
	description: {
		type: String,
		default: '',
		_edit: { description: 'Optional helper copy below the label.' },
	},
	placeholder: {
		type: String,
		default: 'Enter password',
		_edit: { description: 'Placeholder text shown before entry.' },
	},
	disabled: {
		type: Boolean,
		default: false,
		_edit: { description: 'Disable input and visibility control.' },
	},
	required: {
		type: Boolean,
		default: false,
		_edit: { description: 'Show the required marker in the label.' },
	},
	showStrength: {
		type: Boolean,
		default: true,
		_edit: { description: 'Show a strength meter below the field.' },
	},
	compromised: {
		type: Boolean,
		default: false,
		_edit: { description: 'Show a warning when the current password has been found in a breach.' },
	},
	compromisedMessage: {
		type: String,
		default: 'This password appears in known breaches. Choose a different password.',
		_edit: { description: 'Warning copy shown when compromised is true.' },
	},
});

const emit = defineEmits(['update:modelValue']);
const visible = ref(false);

const strength = computed(() => {
	const value = props.modelValue || '';
	let score = 0;
	if (value.length >= 8) score += 1;
	if (value.length >= 12) score += 1;
	if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
	if (/\d/.test(value)) score += 1;
	if (/[^A-Za-z0-9]/.test(value)) score += 1;
	return Math.min(score, 5);
});

const strengthLabel = computed(() => {
	if (!props.modelValue) return 'No password yet';
	if (strength.value <= 2) return 'Weak password';
	if (strength.value <= 4) return 'Good password';
	return 'Strong password';
});

const strengthTone = computed(() => {
	if (!props.modelValue) return 'bg-muted';
	if (strength.value <= 2) return 'bg-destructive';
	if (strength.value <= 4) return 'bg-warning';
	return 'bg-success';
});
</script>

<template>
	<ElField :label="label" :description="description" :required="required">
		<div class="relative">
			<input
				:type="visible ? 'text' : 'password'"
				:value="modelValue"
				:placeholder="placeholder"
				:disabled="disabled"
				class="h-10 w-full rounded-lg border border-input bg-background px-3 pr-11 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-50"
				@input="emit('update:modelValue', $event.target.value)"
			/>
			<button
				type="button"
				class="absolute inset-y-1 right-1 grid size-8 place-items-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
				:disabled="disabled"
				:aria-label="visible ? 'Hide password' : 'Show password'"
				@click="visible = !visible"
			>
				<svg v-if="visible" class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path d="M3 3l18 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
					<path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
					<path d="M8.5 5.4A9.8 9.8 0 0 1 12 4.75c4.6 0 7.7 3.4 9 7.25a11 11 0 0 1-2.2 3.7M6.2 6.9A11 11 0 0 0 3 12c1.3 3.85 4.4 7.25 9 7.25 1.2 0 2.3-.23 3.3-.64" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				<svg v-else class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path d="M3 12c1.3-3.85 4.4-7.25 9-7.25s7.7 3.4 9 7.25c-1.3 3.85-4.4 7.25-9 7.25S4.3 15.85 3 12Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
					<path d="M12 14.75a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5Z" stroke="currentColor" stroke-width="1.8" />
				</svg>
			</button>
		</div>

		<div v-if="showStrength" class="mt-3 space-y-2">
			<div class="grid grid-cols-5 gap-1.5">
				<span
					v-for="step in 5"
					:key="step"
					class="h-1.5 rounded-full transition"
					:class="step <= strength ? strengthTone : 'bg-muted'"
				></span>
			</div>
			<p class="text-xs text-muted-foreground">{{ strengthLabel }}</p>
		</div>

		<p v-if="compromised" class="mt-3 rounded-lg border border-warning/40 bg-warning/15 px-3 py-2 text-xs leading-5 text-warning">
			{{ compromisedMessage }}
		</p>
	</ElField>
</template>
