<script setup>
import { nextTick, onMounted, ref } from 'vue';
import { ElButton, ElEmailInput, ElForm, ElTextInput } from '@elements/vue';

const formRef = ref(null);
const account = ref({
	name: '',
	email: 'steve.example.com',
});
const inspectedFields = [
	{ name: 'name', label: 'Name' },
	{ name: 'email', label: 'Email' },
];
const stateAxes = ['interaction', 'modification', 'validation'];
const derivedStateKeys = ['focused', 'touched', 'dirty', 'validating', 'invalid', 'valid'];

onMounted(async () => {
	await nextTick();
});

function fieldSnapshot(form, name) {
	return form.getState().fields[form.getFieldPath(name)];
}

function errorMessage(error) {
	if (typeof error === 'string') return error;
	return error?.message || String(error);
}
</script>

<template>
	<ElForm ref="formRef" v-model="account" name="account" v-slot="{ form, state }" class="w-full max-w-4xl space-y-5">
		<div class="grid gap-4 lg:grid-cols-[1fr_1.35fr]">
			<div class="space-y-4">
				<div class="grid gap-2 sm:grid-cols-[6rem_1fr] sm:items-start">
					<label :for="form.getHtmlId('name')" class="pt-2 text-sm font-semibold text-muted-foreground">
						Name
					</label>
					<ElTextInput
						name="name"
						placeholder="Steve O'Brien"
						:chrome="false"
						required
					/>
				</div>

				<div class="grid gap-2 sm:grid-cols-[6rem_1fr] sm:items-start">
					<label :for="form.getHtmlId('email')" class="pt-2 text-sm font-semibold text-muted-foreground">
						Email
					</label>
					<ElEmailInput
						name="email"
						:chrome="false"
						required
					/>
				</div>

				<div class="flex items-center justify-between rounded-md border border-border bg-secondary/35 px-3 py-2">
					<div class="text-xs text-muted-foreground">
						<span class="font-medium text-foreground">{{ state.fieldCount }}</span> fields,
						<span class="font-medium text-foreground">{{ state.errorCount }}</span> errors,
						<span class="font-medium text-foreground">{{ state.validation }}</span> validation
					</div>
					<ElButton type="button" size="sm" @click="form.validate()">
						Validate
					</ElButton>
				</div>
			</div>

			<div class="space-y-3">
				<div
					v-for="item in inspectedFields"
					:key="item.name"
					class="rounded-lg border border-border bg-background p-3"
				>
					<div class="flex items-start justify-between gap-3">
						<div>
							<h3 class="text-sm font-semibold text-foreground">{{ item.label }}</h3>
							<p class="mt-1 font-mono text-[11px] text-muted-foreground">
								{{ fieldSnapshot(form, item.name)?.path }}
							</p>
						</div>
						<span
							class="rounded-full px-2 py-0.5 text-[11px] font-medium"
							:class="fieldSnapshot(form, item.name)?.state.invalid ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'"
						>
							{{ fieldSnapshot(form, item.name)?.state.validation }}
						</span>
					</div>

					<dl class="mt-3 grid gap-2 text-xs sm:grid-cols-2">
						<div>
							<dt class="font-medium text-muted-foreground">Value</dt>
							<dd class="mt-0.5 truncate font-mono text-foreground">
								{{ JSON.stringify(fieldSnapshot(form, item.name)?.value) }}
							</dd>
						</div>
						<div>
							<dt class="font-medium text-muted-foreground">HTML name</dt>
							<dd class="mt-0.5 truncate font-mono text-foreground">
								{{ fieldSnapshot(form, item.name)?.htmlName }}
							</dd>
						</div>
						<div>
							<dt class="font-medium text-muted-foreground">HTML id</dt>
							<dd class="mt-0.5 truncate font-mono text-foreground">
								{{ fieldSnapshot(form, item.name)?.htmlId }}
							</dd>
						</div>
						<div>
							<dt class="font-medium text-muted-foreground">Errors</dt>
							<dd class="mt-0.5 text-destructive">
								<span v-if="!fieldSnapshot(form, item.name)?.errors.length">None</span>
								<span v-else>{{ fieldSnapshot(form, item.name).errors.map(errorMessage).join(' ') }}</span>
							</dd>
						</div>
					</dl>

					<div class="mt-3 flex flex-wrap gap-1.5">
						<span
							v-for="key in stateAxes"
							:key="key"
							class="rounded border px-2 py-1 text-[11px] font-medium"
							:class="fieldSnapshot(form, item.name)?.state[key] === 'unknown' || fieldSnapshot(form, item.name)?.state[key] === 'clean' || fieldSnapshot(form, item.name)?.state[key] === 'untouched' ? 'border-border bg-secondary/40 text-muted-foreground' : 'border-primary/30 bg-primary/10 text-primary'"
						>
							{{ key }}: {{ fieldSnapshot(form, item.name)?.state[key] }}
						</span>
					</div>

					<div class="mt-2 flex flex-wrap gap-1.5">
						<span
							v-for="key in derivedStateKeys"
							:key="key"
							class="rounded border px-2 py-1 text-[11px] font-medium"
							:class="fieldSnapshot(form, item.name)?.state[key] ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border bg-secondary/40 text-muted-foreground'"
						>
							{{ key }}: {{ fieldSnapshot(form, item.name)?.state[key] ? 'true' : 'false' }}
						</span>
					</div>
				</div>
			</div>
		</div>
	</ElForm>
</template>
