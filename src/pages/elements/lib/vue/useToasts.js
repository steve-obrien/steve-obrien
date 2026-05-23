import { ref } from 'vue';

export function useToasts(defaults = {}) {
	const toasts = ref([]);

	function show(input = {}, propsOrOverrides = {}, options = {}) {
		const toast = normalizeToast(input, propsOrOverrides, options, defaults);
		toasts.value = [...toasts.value, toast];
		return toast.id;
	}

	function normal(input, propsOrOverrides, options) {
		return showWithTone('default', input, propsOrOverrides, options);
	}

	function success(input, propsOrOverrides, options) {
		return showWithTone('success', input, propsOrOverrides, options);
	}

	function danger(input, propsOrOverrides, options) {
		return showWithTone('danger', input, propsOrOverrides, options);
	}

	function dismiss(id) {
		toasts.value = toasts.value.filter((toast) => toast.id !== id);
	}

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
	return {
		id: createToastId(),
		tone: 'default',
		...defaults,
		...base,
		...propsOrOverrides,
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
