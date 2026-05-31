<script setup>
import { computed, ref } from 'vue';
import { ElField, ElForm, ElTextInput } from '@elements/vue';

const person = ref({
	first: '',
	last: '',
});

const firstErrors = computed(() => (person.value.first ? [] : ['First name is required.']));
const lastErrors = computed(() => (person.value.last ? [] : ['Last name is required.']));
const nameErrors = computed(() => [...firstErrors.value, ...lastErrors.value]);
</script>

<template>
	<ElForm v-model="person" name="person" class="w-full max-w-xl">
		<ElField
			label="Name"
			html-for="name-first"
			:errors="nameErrors"
			required
			class="grid gap-3 sm:grid-cols-[5rem_1fr] sm:items-start"
		>
			<template #label="{ label, htmlFor, required, invalid }">
				<label
					:for="htmlFor"
					class="pt-2 text-sm font-semibold"
					:class="invalid ? 'text-destructive' : 'text-muted-foreground'"
				>
					{{ label }}<span v-if="required" aria-hidden="true">*</span>
				</label>
			</template>

			<div class="min-w-0 space-y-1">
				<div class="grid gap-2 sm:grid-cols-2">
					<ElTextInput
						id="name-first"
						v-model="person.first"
						name="first"
						placeholder="First"
						:chrome="false"
						:invalid="firstErrors.length > 0"
						required
					/>
					<ElTextInput
						id="name-last"
						v-model="person.last"
						name="last"
						placeholder="Last"
						:chrome="false"
						:invalid="lastErrors.length > 0"
						required
					/>
				</div>
				<div class="grid gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:grid-cols-2">
					<span>First</span>
					<span>Last</span>
				</div>
			</div>

			<template #errors="{ errors, errorId }">
				<ul
					v-if="errors.length"
					:id="errorId || undefined"
					class="space-y-1 text-xs leading-5 text-destructive sm:col-start-2"
				>
					<li v-for="error in errors" :key="error">{{ error }}</li>
				</ul>
			</template>
		</ElField>
	</ElForm>
</template>
