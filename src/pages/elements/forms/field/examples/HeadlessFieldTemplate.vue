<script setup>
import { ref } from 'vue';
import { ElField, ElPopover, ElTextInput } from '@elements/vue';

const workspaceSlug = ref('Steve Site');
const errors = [
	'Use lowercase letters, numbers, and hyphens only.',
	'Spaces are not allowed.',
];
</script>

<template>
	<div class="w-full max-w-xl">
		<ElField
			label="Workspace slug"
			description="Shown in workspace URLs and invite links."
			html-for="workspaceSlug"
			:errors="errors"
			required
			class="grid gap-3 sm:grid-cols-[8rem_1fr] sm:items-start"
		>
			<template #label="{ label, htmlFor, required, invalid }">
				<label
					:for="htmlFor"
					class="pt-2 text-sm font-semibold transition-colors"
					:class="invalid ? 'text-destructive' : 'text-muted-foreground'"
				>
					{{ label }}
					<span v-if="required" aria-hidden="true">*</span>
				</label>
			</template>

			<template #default="{ errors: fieldErrors }">
				<div class="flex min-w-0 items-start gap-2">
					<ElTextInput
						id="workspaceSlug"
						v-model="workspaceSlug"
						name="workspaceSlug"
						placeholder="acme-studio"
						:errors="errors"
						:chrome="false"
						required
					/>
					<ElPopover
						v-if="fieldErrors.length"
						position="end"
						width="w-72"
						padding="p-3"
					>
						<template #trigger>
							<button
								type="button"
								class="mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10 text-sm font-semibold text-destructive transition hover:bg-destructive/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30"
								aria-label="Show validation errors"
							>
								!
							</button>
						</template>
						<div class="space-y-2">
							<p class="text-xs font-semibold uppercase tracking-wider text-destructive">Validation</p>
							<ul class="space-y-1 text-xs leading-5 text-popover-foreground">
								<li v-for="error in fieldErrors" :key="error">{{ error }}</li>
							</ul>
						</div>
					</ElPopover>
				</div>
			</template>

			<template #errors="{ errors, errorId }">
				<p v-if="errors.length" :id="errorId || undefined" class="sr-only">
					{{ errors.join(' ') }}
				</p>
			</template>

			<template #description="{ description, descriptionId }">
				<p
					v-if="description"
					:id="descriptionId || undefined"
					class="text-xs leading-5 text-muted-foreground sm:col-start-2"
				>
					{{ description }}
				</p>
			</template>
		</ElField>
	</div>
</template>
