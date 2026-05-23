import { ref } from 'vue';
import ElToastItem from './ElToastItem.vue';

/**
 * @typedef {import('vue').Component} ToastComponent
 * @typedef {Record<string, unknown>} ToastProps
 *
 * @typedef {Object} ToastOptions
 * @property {string} [id] Stable toast id. Generated automatically when omitted.
 * @property {'default'|'success'|'danger'|'warning'|string} [tone] Visual tone used by the default toast item.
 * @property {number} [duration] Auto-dismiss delay in milliseconds. Use 0 for manual dismissal.
 * @property {boolean} [dismissible] Set false to hide the default dismiss button.
 * @property {string} [title] Default toast title.
 * @property {string} [description] Default toast description.
 * @property {ToastComponent|string} [component] Component used for a custom toast template.
 * @property {ToastProps} [props] Props passed to a custom toast template.
 *
 * @typedef {Object} ToastApi
 * @property {import('vue').Ref<ToastOptions[]>} toasts Reactive toast array for <ElToastStack>.
 * @property {(input?: string|ToastOptions|ToastComponent, propsOrOverrides?: ToastProps|ToastOptions, options?: ToastOptions) => string} show Show a toast and return its id.
 * @property {(input?: string|ToastOptions|ToastComponent, propsOrOverrides?: ToastProps|ToastOptions, options?: ToastOptions) => string} normal Show a default-tone toast and return its id.
 * @property {(input?: string|ToastOptions|ToastComponent, propsOrOverrides?: ToastProps|ToastOptions, options?: ToastOptions) => string} success Show a success-tone toast and return its id.
 * @property {(input?: string|ToastOptions|ToastComponent, propsOrOverrides?: ToastProps|ToastOptions, options?: ToastOptions) => string} danger Show a danger-tone toast and return its id.
 * @property {(id: string) => void} dismiss Remove a toast by id.
 * @property {() => void} clear Remove all toasts.
 */

/**
 * Creates a small controlled toast store for <ElToastStack>.
 *
 * @param {ToastOptions} [defaults] Options applied to every toast shown by this store.
 * @returns {ToastApi}
 */
export function useToasts(defaults = {}) {
	const toasts = ref([]);

	/**
	 * Show a toast and return its generated id.
	 *
	 * Plain strings and toast objects render with the default ToastItem:
	 * `show('Saved', { description: 'Changes stored.' })`.
	 *
	 * Vue components render as template toasts:
	 * `show(AvatarToast, { name: 'Maya' }, { duration: 0 })`.
	 *
	 * @param {string|ToastOptions|ToastComponent} [input] Toast text, full toast object, or Vue component.
	 * @param {ToastProps|ToastOptions} [propsOrOverrides] Props for component toasts, or option overrides for default toasts.
	 * @param {ToastOptions} [options] Options for component toasts.
	 * @returns {string}
	 */
	function show(input = {}, propsOrOverrides = {}, options = {}) {
		const toast = normalizeToast(input, propsOrOverrides, options, defaults);
		toasts.value = [...toasts.value, toast];
		return toast.id;
	}

	/**
	 * Show a default-tone toast. Supports the same arguments as show().
	 *
	 * @param {string|ToastOptions|ToastComponent} [input]
	 * @param {ToastProps|ToastOptions} [propsOrOverrides]
	 * @param {ToastOptions} [options]
	 * @returns {string}
	 */
	function normal(input, propsOrOverrides, options) {
		return showWithTone('default', input, propsOrOverrides, options);
	}

	/**
	 * Show a success-tone toast. Supports the same arguments as show().
	 *
	 * @param {string|ToastOptions|ToastComponent} [input]
	 * @param {ToastProps|ToastOptions} [propsOrOverrides]
	 * @param {ToastOptions} [options]
	 * @returns {string}
	 */
	function success(input, propsOrOverrides, options) {
		return showWithTone('success', input, propsOrOverrides, options);
	}

	/**
	 * Show a danger-tone toast. Supports the same arguments as show().
	 *
	 * @param {string|ToastOptions|ToastComponent} [input]
	 * @param {ToastProps|ToastOptions} [propsOrOverrides]
	 * @param {ToastOptions} [options]
	 * @returns {string}
	 */
	function danger(input, propsOrOverrides, options) {
		return showWithTone('danger', input, propsOrOverrides, options);
	}

	/**
	 * Remove a toast by id.
	 *
	 * @param {string} id
	 * @returns {void}
	 */
	function dismiss(id) {
		toasts.value = toasts.value.filter((toast) => toast.id !== id);
	}

	/**
	 * Remove all visible toasts.
	 *
	 * @returns {void}
	 */
	function clear() {
		toasts.value = [];
	}

	return {
		toasts,
		show,
		normal,
		success,
		danger,
		dismiss,
		clear,
	};

	function showWithTone(tone, input, propsOrOverrides = {}, options = {}) {
		const toastOptions = tone === 'default'
			? { tone, ...options }
			: { ...options, tone };
		const toastOverrides = tone === 'default'
			? { tone, ...propsOrOverrides }
			: { ...propsOrOverrides, tone };
		if (isToastComponent(input)) return show(input, propsOrOverrides, toastOptions);
		return show(input, toastOverrides);
	}
}

function normalizeToast(input, propsOrOverrides, options, defaults) {
	if (isToastComponent(input)) {
		return {
			id: createToastId(),
			tone: 'default',
			...defaults,
			...options,
			component: input,
			props: propsOrOverrides || {},
		};
	}

	const base = typeof input === 'string' ? { title: input } : { ...input };
	const toast = {
		id: createToastId(),
		tone: 'default',
		...defaults,
		...base,
		...propsOrOverrides,
	};

	return withDefaultComponent(toast);
}

function withDefaultComponent(toast) {
	if (toast.component) return { ...toast, props: toast.props || {} };
	return {
		...toast,
		component: ElToastItem,
		props: {
			title: toast.title,
			description: toast.description,
			tone: toast.tone,
			dismissible: toast.dismissible !== false,
			...(toast.props || {}),
		},
	};
}

function isToastComponent(value) {
	return Boolean(
		value
		&& (typeof value === 'function'
			|| (typeof value === 'object'
				&& (value.setup || value.render || value.template || value.__name || value.__file))),
	);
}

function createToastId() {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
	return `toast-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
