<script setup>
import { computed, ref, useId } from 'vue';
import ElField from '../field/ElField.vue';

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
	id: {
		type: String,
		default: '',
		_edit: { description: 'ID applied to the password input and used by the label.' },
	},
	name: {
		type: String,
		default: '',
		_edit: { description: 'Form field name. Defaults to the generated id.' },
	},
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
	invalid: {
		type: Boolean,
		default: false,
		_edit: { description: 'Mark the password input invalid.' },
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
const generatedId = `el-password-input-${useId()}`;
const inputId = computed(() => props.id || generatedId);
const inputName = computed(() => props.name || inputId.value);

const SECONDS_PER_YEAR = 31557600;

const secondsToHuman = (seconds) => {
	if (seconds < 1) return 'instantly';
	if (seconds < 60) return `${Math.round(seconds)} seconds`;
	if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
	if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
	if (seconds < SECONDS_PER_YEAR) return `${Math.round(seconds / 86400)} days`;
	const years = seconds / SECONDS_PER_YEAR;
	if (years < 1_000) return `${Math.round(years)} years`;
	if (years < 1_000_000) return `${Math.round(years / 1_000)} thousand years`;
	if (years < 1_000_000_000) return `${Math.round(years / 1_000_000)} million years`;
	if (years < 1_000_000_000_000) return `${Math.round(years / 1_000_000_000)} billion years`;
	return 'trillions of years';
};

const scoreFromCrackSeconds = (seconds) => {
	if (seconds < SECONDS_PER_YEAR) return [1, 'Very weak'];
	if (seconds < SECONDS_PER_YEAR * 1_000) return [2, 'Weak'];
	if (seconds < SECONDS_PER_YEAR * 1_000_000) return [3, 'Okay'];
	if (seconds < SECONDS_PER_YEAR * 1_000_000_000) return [4, 'Strong'];
	return [5, 'Very strong'];
};

const estimateCrackTime = (entropy, guessesPerSecond = 1_000_000_000_000) => {

	// Average crack time is half the search space
	const combinations = 2 ** entropy;
	const averageSeconds = combinations / guessesPerSecond / 2;
	return {
		seconds: averageSeconds,
		human: secondsToHuman(averageSeconds),
	};
};

function passwordStrength(password) {
	const value = password || '';
	if (!value) {
		return {
			score: 0,
			label: 'Empty',
			entropy: 0,
			crackTime: null,
		};
	}
	const length = value.length;
	let pool = 0;
	if (/[a-z]/.test(value)) pool += 26;
	if (/[A-Z]/.test(value)) pool += 26;
	if (/\d/.test(value)) pool += 10;
	if (/[^A-Za-z0-9]/.test(value)) pool += 33;
	let entropy = Math.log2(pool || 1) * length;
	if (/^(.)\1+$/.test(value)) entropy *= 0.1;
	if (/123456|password|qwerty|letmein|admin|welcome/i.test(value)) entropy *= 0.3;
	if (/(.)\1{2,}/.test(value)) entropy *= 0.8;
	if (/^\d+$/.test(value)) entropy *= 0.5;
	const crack = estimateCrackTime(entropy);
	const [score, label] = scoreFromCrackSeconds(crack.seconds);
	return {
		score,
		label,
		entropy: Math.round(entropy),
		crackTime: crack.human,
		crackSeconds: crack.seconds,
	};
}

const passwordInfo = computed(() => passwordStrength(props.modelValue));

// index matches score (1–5)
const strengthTones = ['', 'bg-destructive', 'bg-destructive', 'bg-warning', 'bg-warning', 'bg-success'];
</script>

<template>
	<ElField :label="label" :description="description" :html-for="inputId" :invalid="invalid || compromised" :required="required">
		<div class="relative">
			<input
				:id="inputId"
				:name="inputName"
				:type="visible ? 'text' : 'password'"
				:value="modelValue"
				:placeholder="placeholder"
				:disabled="disabled"
				:required="required"
				:aria-invalid="invalid || compromised || undefined"
				class="el-input pr-11"
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
				:class="step <= passwordInfo.score ? strengthTones[passwordInfo.score] : 'bg-muted'"></span>
			</div>
			<p class="text-xs text-muted-foreground">
				{{ modelValue ? `${passwordInfo.label} password` : 'No password yet' }}
			</p>
			<p v-if="passwordInfo.crackTime" class="text-xs text-muted-foreground">Time to crack your password: {{ passwordInfo.crackTime }}</p>
		</div>

		<p v-if="compromised" class="mt-3 rounded-lg border border-warning/40 bg-warning/15 px-3 py-2 text-xs leading-5 text-warning">
			{{ compromisedMessage }}
		</p>
	</ElField>
</template>
