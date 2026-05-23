<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import ElToastItem from './ElToastItem.vue';

defineOptions({
	__doc: {
		name: 'Toast stack',
		tag: '<ElToastStack>',
		description: 'A polite live-region stack for transient notifications.',
		slots: [
			{ name: 'default', payload: '{ toast, dismiss }', description: 'Custom toast content rendered inside the card. Use this for avatars, actions, or richer markup.' },
		],
		events: [
			{ name: 'dismiss', payload: '(id: string)', description: 'Emitted when a toast is dismissed.' },
			{ name: 'action', payload: '({ id, toast, ...payload })', description: 'Emitted by toast template content, useful for buttons and menus inside a toast.' },
		],
	},
});

const props = defineProps({
	toasts: {
		type: Array,
		default: () => [],
		_edit: {
			component: 'ElJsonListInput',
			description: 'Visible toasts. Set duration to 0 for a toast that requires manual dismissal.',
			props: {
				addLabel: '+ Add toast',
				schema: [
					{ key: 'id', label: 'ID', placeholder: 'toast-id', default: (index) => `toast-${index + 1}` },
					{ key: 'title', label: 'Title', placeholder: 'Successfully saved' },
					{ key: 'description', label: 'Description', placeholder: 'Your changes have been stored.' },
					{ key: 'tone', label: 'Tone', placeholder: 'default | success | danger | warning', default: 'default' },
					{ key: 'duration', label: 'Duration', type: 'number', default: 3600 },
				],
			},
		},
	},
	position: {
		type: String,
		default: 'top-right',
		_edit: { options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'], description: 'Viewport corner.' },
	},
	duration: {
		type: Number,
		default: 3600,
		_edit: { description: 'Default auto-dismiss delay in milliseconds. Set to 0 to keep toasts until manually dismissed.' },
	},
	autoDismiss: {
		type: Boolean,
		default: true,
		_edit: { description: 'Automatically emit dismiss after each toast duration.' },
	},
});
const emit = defineEmits(['dismiss', 'action']);
const renderedToasts = ref([]);
const isMounted = ref(false);
const timers = new Map();
const motionTimers = new Map();

onMounted(async () => {
	isMounted.value = true;
	await import('../headless/toast.js');
});
watch(() => props.toasts, syncTimers, { immediate: true, deep: true });
onBeforeUnmount(() => {
	for (const timer of timers.values()) clearClientTimeout(timer);
	for (const timer of motionTimers.values()) clearClientTimeout(timer);
	timers.clear();
	motionTimers.clear();
});

function dismiss(id) {
	clearClientTimeout(timers.get(id));
	timers.delete(id);
	emit('dismiss', id);
}

// Auto-dismiss timers live in the stack so callers only need to update the
// controlled toast array when dismiss is emitted.
function syncTimers(toasts) {
	const ids = new Set(toasts.map((toast) => toast.id));
	for (const [id, timer] of timers) {
		if (!ids.has(id)) {
			clearClientTimeout(timer);
			timers.delete(id);
		}
	}

	if (!props.autoDismiss || typeof window === 'undefined') return;
	for (const toast of toasts) {
		if (!toast.id || timers.has(toast.id)) continue;
		const delay = Number(toast.duration ?? props.duration);
		if (delay <= 0) continue;
		timers.set(toast.id, window.setTimeout(() => dismiss(toast.id), delay));
	}
}

watch(() => props.toasts, syncRendered, { immediate: true, deep: true });

// Keep leaving toasts in a local render list long enough for both opacity and
// height transitions to finish before removing them from the DOM.
function syncRendered(toasts) {
	const nextIds = new Set(toasts.map((toast) => toast.id));
	const current = new Map(renderedToasts.value.map((toast) => [toast.id, toast]));

	for (const toast of toasts) {
		const existing = current.get(toast.id);
		if (existing) {
			clearClientTimeout(motionTimers.get(toast.id));
			motionTimers.delete(toast.id);
			Object.assign(existing, toast, {
				expanded: true,
				motion: existing.motion === 'leaving' ? 'entering' : existing.motion,
			});
			if (existing.motion === 'entering') settleToast(existing);
			continue;
		}

		const shouldAnimate = isMounted.value && typeof window !== 'undefined';
		const next = {
			...toast,
			expanded: true,
			motion: shouldAnimate ? 'entering' : 'open',
		};
		renderedToasts.value.push(next);
		if (shouldAnimate) settleToast(next);
	}

	for (const toast of renderedToasts.value) {
		if (nextIds.has(toast.id) || toast.motion === 'leaving') continue;
		toast.motion = 'leaving';
		toast.expanded = false;
		clearClientTimeout(motionTimers.get(toast.id));
		if (typeof window === 'undefined') {
			renderedToasts.value = renderedToasts.value.filter((item) => item.id !== toast.id);
			continue;
		}
		motionTimers.set(toast.id, window.setTimeout(() => {
			renderedToasts.value = renderedToasts.value.filter((item) => item.id !== toast.id);
			motionTimers.delete(toast.id);
		}, 300));
	}
}

function settleToast(toast) {
	requestClientFrame(() => {
		toast.expanded = true;
		if (typeof window === 'undefined') {
			toast.motion = 'open';
			return;
		}
		motionTimers.set(toast.id, window.setTimeout(() => {
			if (toast.motion === 'entering') toast.motion = 'open';
			motionTimers.delete(toast.id);
		}, 320));
	});
}

function clearClientTimeout(timer) {
	if (typeof window !== 'undefined') window.clearTimeout(timer);
}

function requestClientFrame(callback) {
	if (typeof window === 'undefined') {
		callback();
		return;
	}
	window.requestAnimationFrame(callback);
}

const toneClass = (tone) => ({
	default: 'border-border',
	success: 'border-success/35',
	danger: 'border-destructive/35',
	warning: 'border-warning/35',
}[tone] || 'border-border');

function toastComponent(toast) {
	return toast.component || ElToastItem;
}

function toastProps(toast) {
	if (toast.component) return toast.props || {};
	return {
		title: toast.title,
		description: toast.description,
		tone: toast.tone,
		dismissible: toast.dismissible !== false,
	};
}

// Template components can emit action payloads for app-specific work, or emit
// dismiss when they want the stack to remove their own toast.
function onToastAction(toast, payload) {
	const detail = {
		id: toast.id,
		toast,
		...(payload && typeof payload === 'object' ? payload : { action: payload }),
	};
	if (detail.action === 'dismiss') dismiss(toast.id);
	emit('action', detail);
}
</script>

<template>
	<element-toast-region
		class="fixed z-[80] grid w-[min(92vw,22rem)] gap-2"
		:class="{
			'top-4 right-4': position === 'top-right',
			'top-4 left-4': position === 'top-left',
			'bottom-4 right-4': position === 'bottom-right',
			'bottom-4 left-4': position === 'bottom-left',
		}"
	>
		<div>
			<div
				v-for="toast in renderedToasts"
				:key="toast.id"
				class="toast-shell"
				:class="[
					toast.expanded && 'toast-shell-open',
					toast.motion === 'leaving' && 'toast-leaving',
				]"
			>
				<div class="toast-shell-inner">
					<div
						:role="toast.tone === 'danger' ? 'alert' : 'status'"
						class="overflow-hidden rounded-2xl border bg-card/95 p-4 text-card-foreground shadow-[0_18px_50px_rgba(0,0,0,0.18),0_2px_10px_rgba(0,0,0,0.08)] ring-1 ring-border/60 backdrop-blur-xl"
						:class="[
							toneClass(toast.tone),
							toast.motion === 'entering' && 'toast-entering',
							toast.motion === 'leaving' && 'toast-card-leaving',
						]"
					>
						<slot :toast="toast" :dismiss="dismiss">
							<component
								:is="toastComponent(toast)"
								v-bind="toastProps(toast)"
								@action="onToastAction(toast, $event)"
								@dismiss="dismiss(toast.id)"
							/>
						</slot>
					</div>
				</div>
			</div>
		</div>
	</element-toast-region>
</template>

<style scoped>
.toast-shell {
	display: grid;
	grid-template-rows: 0fr;
	padding-bottom: 0;
	transition:
		grid-template-rows 300ms cubic-bezier(0.22, 1, 0.36, 1),
		padding-bottom 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

.toast-shell-open {
	grid-template-rows: 1fr;
	padding-bottom: 0.5rem;
}

.toast-shell:last-child {
	padding-bottom: 0;
}

.toast-shell-inner {
	min-height: 0;
	overflow: visible;
}

.toast-entering {
	animation: toast-in 280ms both;
}

.toast-card-leaving {
	animation: toast-out 260ms both;
}

@keyframes toast-in {
	0% {
		opacity: 0;
		transform: translateY(-12px) scale(0.965);
	}
	68% {
		opacity: 1;
		transform: translateY(1px) scale(1.012);
	}
	100% {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}

@keyframes toast-out {
	0% {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
	100% {
		opacity: 0;
		transform: translateY(-8px) scale(0.985);
	}
}

@media (prefers-reduced-motion: reduce) {
	.toast-entering,
	.toast-card-leaving {
		animation-duration: 1ms;
	}

	.toast-shell {
		transition-duration: 1ms;
	}
}
</style>
