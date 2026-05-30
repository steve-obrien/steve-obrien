import { ref } from 'vue';

/**
 * @typedef {import('vue').Component} DialogComponent
 * @typedef {Record<string, unknown>} DialogProps
 *
 * @typedef {Object} DialogOptions
 * @property {string} [id] Stable dialog id. Generated automatically when omitted.
 * @property {string} [title] Dialog title.
 * @property {string} [description] Supporting text under the title.
 * @property {string} [message] Body text for the default dialog body.
 * @property {DialogComponent|string} [component] Component rendered as the dialog body.
 * @property {DialogProps} [props] Props passed to a custom component body.
 * @property {boolean} [backdrop] Show the visual backdrop. Defaults to true.
 * @property {boolean} [static] Disable backdrop and Esc dismissal.
 * @property {boolean} [showCancel] Render a cancel action in the default footer.
 * @property {boolean} [footer] Set false to hide the default footer.
 * @property {string} [cancelText] Cancel button label.
 * @property {string} [confirmText] Confirm button label.
 * @property {'default'|'danger'|string} [tone] Visual tone for the confirm button.
 * @property {'dialog'|'confirm'|string} [type] Dialog interaction type.
 *
 * @typedef {Promise<unknown> & { id?: string }} DialogPromise
 *
 * @typedef {Object} DialogApi
 * @property {import('vue').Ref<DialogOptions[]>} dialogs Reactive dialog array for <ElDialogStack>.
 * @property {(input?: string|DialogOptions|DialogComponent, propsOrOptions?: DialogProps|DialogOptions, options?: DialogOptions) => DialogPromise} show Show a dialog and resolve with the user action.
 * @property {(input?: string|DialogOptions, options?: DialogOptions) => Promise<boolean>} confirm Show a confirmation dialog and resolve true or false.
 * @property {(input?: string|DialogOptions, options?: DialogOptions) => Promise<boolean>} confirmDialog Alias for confirm that avoids shadowing window.confirm.
 * @property {(component: DialogComponent, props?: DialogProps, options?: DialogOptions) => DialogPromise} form Show a custom component dialog.
 * @property {(id: string, value?: unknown) => void} resolve Resolve and remove a dialog by id.
 * @property {(id: string, value?: unknown) => void} dismiss Dismiss and remove a dialog by id.
 * @property {() => void} clear Dismiss all dialogs.
 */

/**
 * Creates a small controlled dialog store for <ElDialogStack>.
 *
 * @param {DialogOptions} [defaults] Options applied to every dialog shown by this store.
 * @returns {DialogApi}
 */
export function useDialogs(defaults = {}) {
	const dialogs = ref([]);
	const pending = new Map();

	/**
	 * Show a programmatic dialog.
	 *
	 * Strings and plain objects render a default body/footer:
	 * `show({ title: 'Saved', message: 'Everything is up to date.' })`.
	 *
	 * Components render as custom dialog bodies:
	 * `show(InviteForm, { email }, { title: 'Invite teammate' })`.
	 *
	 * @param {string|DialogOptions|DialogComponent} [input]
	 * @param {DialogProps|DialogOptions} [propsOrOptions]
	 * @param {DialogOptions} [options]
	 * @returns {DialogPromise}
	 */
	function show(input = {}, propsOrOptions = {}, options = {}) {
		const dialog = normalizeDialog(input, propsOrOptions, options, defaults);
		const promise = createDialogPromise(dialog);
		dialogs.value = [...dialogs.value, dialog];
		return promise;
	}

	/**
	 * Show a confirmation dialog.
	 *
	 * @param {string|DialogOptions} [input]
	 * @param {DialogOptions} [options]
	 * @returns {Promise<boolean>}
	 */
	function confirm(input = {}, options = {}) {
		const base = typeof input === 'string' ? { title: input } : { ...input };
		return show({
			type: 'confirm',
			showCancel: true,
			confirmText: 'Confirm',
			...base,
			...options,
		}).then(Boolean);
	}

	/**
	 * Show a custom component dialog.
	 *
	 * @param {DialogComponent} component
	 * @param {DialogProps} [props]
	 * @param {DialogOptions} [options]
	 * @returns {DialogPromise}
	 */
	function form(component, props = {}, options = {}) {
		return show(component, props, {
			footer: false,
			...options,
		});
	}

	/**
	 * Resolve and remove a dialog.
	 *
	 * @param {string} id
	 * @param {unknown} [value]
	 * @returns {void}
	 */
	function resolve(id, value = true) {
		settle(id, value);
	}

	/**
	 * Dismiss and remove a dialog.
	 *
	 * @param {string} id
	 * @param {unknown} [value]
	 * @returns {void}
	 */
	function dismiss(id, value = false) {
		settle(id, value);
	}

	/**
	 * Dismiss all visible dialogs.
	 *
	 * @returns {void}
	 */
	function clear() {
		for (const dialog of dialogs.value) dismiss(dialog.id);
	}

	function createDialogPromise(dialog) {
		let resolver = null;
		const promise = new Promise((resolvePromise) => {
			resolver = resolvePromise;
		});
		pending.set(dialog.id, resolver);
		promise.id = dialog.id;
		return promise;
	}

	function settle(id, value) {
		const resolver = pending.get(id);
		pending.delete(id);
		dialogs.value = dialogs.value.filter((dialog) => dialog.id !== id);
		if (resolver) resolver(value);
	}

	return {
		dialogs,
		show,
		confirm,
		confirmDialog: confirm,
		form,
		resolve,
		dismiss,
		clear,
	};
}

function normalizeDialog(input, propsOrOptions, options, defaults) {
	const isComponentDialog = isDialogComponent(input);
	const base = isComponentDialog
		? { component: input, props: propsOrOptions || {}, footer: false }
		: typeof input === 'string'
			? { title: input }
			: { ...input };
	const overrides = isComponentDialog ? options : propsOrOptions;

	return {
		id: createDialogId(),
		type: 'dialog',
		backdrop: true,
		static: false,
		showCancel: false,
		footer: true,
		cancelText: 'Cancel',
		confirmText: 'OK',
		tone: 'default',
		...defaults,
		...base,
		...overrides,
		props: {
			...(defaults.props || {}),
			...(base.props || {}),
			...(overrides.props || {}),
		},
	};
}

function isDialogComponent(value) {
	return Boolean(
		value
		&& (typeof value === 'function'
			|| (typeof value === 'object'
				&& (value.setup || value.render || value.template || value.__name || value.__file))),
	);
}

function createDialogId() {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
	return `dialog-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
