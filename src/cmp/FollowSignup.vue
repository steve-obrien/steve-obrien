<script setup>
import { onBeforeUnmount, onMounted } from 'vue';

/**
 * Email signup for the main mailing list. Posts to Kit; when Kit's script has
 * loaded the form submits inline, otherwise it falls back to Kit's own page.
 */
const props = defineProps({
	/** Unique id prefix, so the form can appear more than once on a page. */
	id: {
		type: String,
		default: 'follow',
	},
	/** Submit button label. */
	button: {
		type: String,
		default: 'Follow along',
	},
});

// The "My book on Intelligence" list. Swap for a dedicated newsletter form if one is created in Kit.
const FORM_ID = '9469273';
const FORM_UID = '4b5ef441c9';
const KIT_SCRIPT = 'https://f.convertkit.com/ckjs/ck.5.js';

const options = JSON.stringify({
	settings: {
		after_subscribe: {
			action: 'message',
			success_message: 'Thanks. Check your email to confirm your subscription.',
			redirect_url: '',
		},
	},
	version: '5',
});

let script = null;

/**
 * Loads Kit's form script once per page so the form submits without leaving the site.
 *
 * @returns {void}
 */
function loadKit() {
	if (document.querySelector(`script[src="${KIT_SCRIPT}"]`)) return;
	script = document.createElement('script');
	script.async = true;
	script.src = KIT_SCRIPT;
	document.body.appendChild(script);
}

onMounted(loadKit);
onBeforeUnmount(() => {
	script?.remove();
	script = null;
});
</script>

<template>
	<form
		:action="`https://app.kit.com/forms/${FORM_ID}/subscriptions`"
		method="post"
		:data-sv-form="FORM_ID"
		:data-uid="FORM_UID"
		data-format="inline"
		data-version="5"
		:data-options="options"
	>
		<div data-style="full">
			<div class="formkit-container" aria-live="polite">
				<ul class="formkit-alert formkit-alert-error mb-3 space-y-1 text-sm text-destructive empty:hidden" data-element="errors" data-group="alert" role="alert"></ul>
				<div data-element="fields" class="grid gap-3 sm:grid-cols-[1fr_auto]">
					<label :for="`${props.id}-email`" class="sr-only">Email address</label>
					<input
						:id="`${props.id}-email`"
						class="w-full rounded-full border border-border bg-background/50 px-5 py-3.5 text-base outline-none transition placeholder:text-muted-foreground focus:border-nebula/60 focus:bg-background/70"
						name="email_address"
						placeholder="you@company.com"
						autocomplete="email"
						required
						type="email"
					>
					<button type="submit" data-element="submit" class="skin-action launch-button group/submit cursor-pointer rounded-full px-7 py-3.5 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02] disabled:cursor-wait disabled:opacity-70">
						<span class="group-data-[active]/submit:hidden">{{ props.button }}</span>
						<span class="hidden group-data-[active]/submit:inline">Joining…</span>
					</button>
				</div>
				<p class="mt-3 text-sm text-muted-foreground" data-element="disclaimer">No spam. Unsubscribe at any time.</p>
			</div>
		</div>
	</form>
</template>
