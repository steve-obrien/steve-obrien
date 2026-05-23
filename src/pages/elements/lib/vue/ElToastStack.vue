<script setup>
import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue';

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
					{ key: 'content', label: 'Content template', type: 'json', placeholder: '{ "component": "AvatarToast", "props": {} }', default: null },
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
	contentComponents: {
		type: Object,
		default: () => ({}),
		_edit: { description: 'Component registry used by toast.content templates, keyed by component name.' },
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
	default: 'border-skin-border',
	success: 'border-emerald-500/35',
	danger: 'border-red-500/35',
	warning: 'border-amber-500/35',
}[tone] || 'border-skin-border');

const accentClass = (tone) => ({
	default: 'bg-skin-primary',
	success: 'bg-emerald-500',
	danger: 'bg-red-500',
	warning: 'bg-amber-500',
}[tone] || 'bg-skin-primary');

const canDismiss = (toast) => toast.dismissible !== false;
const toastSpec = (toast) => toast.content || (toast.component ? toast : null);

const SpecContent = defineComponent({
	name: 'SpecContent',
	props: {
		spec: { type: [Object, Array, String, Number], required: true },
		components: { type: Object, default: () => ({}) },
	},
	emits: ['action'],
	setup(props, { emit }) {
		return () => renderSpec(props.spec, props.components, (payload) => emit('action', payload));
	},
});

function renderSpec(spec, components, emitAction) {
	if (spec == null || spec === false) return null;
	if (typeof spec === 'string' || typeof spec === 'number') return String(spec);
	if (Array.isArray(spec)) return spec.map((child) => renderSpec(child, components, emitAction));
	if (spec.text != null) return String(spec.text);

	const component = resolveSpecComponent(spec.component, components);
	const attrs = {
		...(spec.props || {}),
		onAction: emitAction,
		onDismiss: () => emitAction({ action: 'dismiss' }),
	};
	const children = (spec.children || []).map((child) => renderSpec(child, components, emitAction));
	if (!children.length) return h(component, attrs);
	return typeof component === 'string'
		? h(component, attrs, children)
		: h(component, attrs, { default: () => children });
}

function resolveSpecComponent(component, components) {
	if (!component) return 'div';
	if (typeof component !== 'string') return component;
	return components[component] || component;
}

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
						class="overflow-hidden rounded-2xl border bg-skin-background/95 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18),0_2px_10px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04] backdrop-blur-xl"
						:class="[
							toneClass(toast.tone),
							toast.motion === 'entering' && 'toast-entering',
							toast.motion === 'leaving' && 'toast-card-leaving',
						]"
					>
						<slot :toast="toast" :dismiss="dismiss">
							<SpecContent
								v-if="toastSpec(toast)"
								:spec="toastSpec(toast)"
								:components="contentComponents"
								@action="onToastAction(toast, $event)"
							/>
							<div v-else class="flex items-start gap-3">
								<span class="mt-1 size-2.5 shrink-0 rounded-full" :class="accentClass(toast.tone)"></span>
								<div class="min-w-0 flex-1">
									<div
										v-if="toast.html"
										class="text-sm text-skin-secondary [&_strong]:font-semibold [&_strong]:text-skin-primary"
										v-html="toast.html"
									></div>
									<template v-else>
										<p v-if="toast.title" class="text-sm font-semibold text-skin-primary">{{ toast.title }}</p>
										<p v-if="toast.description" class="mt-1 text-sm text-skin-secondary">{{ toast.description }}</p>
									</template>
								</div>
								<button
									v-if="canDismiss(toast)"
									type="button"
									aria-label="Dismiss notification"
									class="-mr-1 -mt-1 rounded-full px-2 text-lg leading-none text-skin-muted hover:bg-skin-surface hover:text-skin-primary"
									@click="dismiss(toast.id)"
								>×</button>
							</div>
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
