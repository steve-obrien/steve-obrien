<script setup>
import { ref } from 'vue';
import { ElButton, ElCard, ElCheckbox, ElPasswordInput, ElTextInput } from '../../../lib/vue';

const email = ref('steve@example.com');
const password = ref('');
const remember = ref(true);

const socialProviders = [
	{
		label: 'Google',
		mark: 'G',
	},
	{
		label: 'GitHub',
		mark: 'GH',
	},
	{
		label: 'Apple',
		mark: 'A',
	},
];
</script>

<template>
	<div class="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-background shadow-2xl shadow-black/10 md:grid-cols-[0.9fr_1.1fr]">
		<section class="hidden bg-primary p-8 text-primary-foreground md:flex md:flex-col md:justify-between">
			<div>
				<span class="grid size-10 place-items-center rounded-2xl bg-primary-foreground/15 text-sm font-bold">E</span>
				<h3 class="mt-8 text-3xl font-semibold tracking-tight">Build with components AI can edit.</h3>
				<p class="mt-3 text-sm leading-6 text-primary-foreground/75">
					Sign in to continue refining app blocks, specs, tokens, and reusable UI.
				</p>
			</div>
			<div class="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 p-4">
				<p class="text-sm font-medium">Studio-ready output</p>
				<p class="mt-1 text-sm text-primary-foreground/70">Every generated layer keeps a stable id and readable label.</p>
			</div>
		</section>

		<ElCard padding="lg" glass class="rounded-none border-0 shadow-none">
			<div class="mx-auto max-w-sm">
				<div class="text-center md:text-left">
					<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Welcome back</p>
					<h2 class="mt-2 text-3xl font-semibold tracking-tight">Sign in</h2>
					<p class="mt-2 text-sm text-muted-foreground">Use your workspace account or continue with a provider.</p>
				</div>

				<div class="mt-6 grid gap-2 sm:grid-cols-3">
					<button
						v-for="provider in socialProviders"
						:key="provider.label"
						type="button"
						class="flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground transition hover:bg-secondary hover:text-secondary-foreground"
					>
						<span class="grid size-5 place-items-center rounded bg-secondary text-[10px] font-semibold">{{ provider.mark }}</span>
						{{ provider.label }}
					</button>
				</div>

				<div class="my-6 flex items-center gap-3">
					<span class="h-px flex-1 bg-border"></span>
					<span class="text-xs text-muted-foreground">or use email</span>
					<span class="h-px flex-1 bg-border"></span>
				</div>

				<form class="space-y-4">
					<ElTextInput
						v-model="email"
						label="Email"
						placeholder="you@example.com"
						required
					/>
					<ElPasswordInput
						v-model="password"
						label="Password"
						placeholder="Enter your password"
						:show-strength="false"
						required
					/>

					<div class="flex items-center justify-between gap-4">
						<ElCheckbox v-model="remember" label="Remember me" />
						<a href="#" class="text-sm font-medium text-foreground hover:underline">Forgot password?</a>
					</div>

					<ElButton class="w-full" size="lg">Sign in</ElButton>
				</form>

				<p class="mt-6 text-center text-sm text-muted-foreground">
					New here?
					<a href="#" class="font-medium text-foreground hover:underline">Create an account</a>
				</p>
			</div>
		</ElCard>
	</div>
</template>
