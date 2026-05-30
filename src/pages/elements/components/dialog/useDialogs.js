import { ref } from 'vue';

/**
 * @typedef {import('vue').Component} DialogComponent
 * @typedef {Record<string, unknown>} DialogProps
 * @typedef {Array<{ component: string, props?: Record<string, unknown> }>} DialogFormSchema
 *
 * @typedef {Object} DialogOptions
 * @property {string} [id] Stable dialog id. Generated automatically when omitted.
 * @property {string} [title] Dialog title.
 * @property {string} [description] Supporting text under the title.
 * @property {string} [message] Body text for the default dialog body.
 * @property {DialogComponent|string} [component] Component rendered as the dialog body.
 * @property {DialogProps} [props] Props passed to a custom component body.
 * @property {DialogFormSchema} [formSchema] ElForm children schema rendered as a dialog form.
 * @property {Record<string, unknown>} [formValues] Initial values for a schema dialog form.
 * @property {boolean} [backdrop] Show the visual backdrop. Defaults to true.
 * @property {boolean} [static] Disable backdrop and Esc dismissal.
 * @property {boolean} [showCancel] Render a cancel action in the default footer.
 * @property {boolean} [footer] Set false to hide the default footer.
 * @property {string} [cancelText] Cancel button label.
 * @property {string} [confirmText] Confirm button label.
 * @property {string} [invalidMessage] Validation message shown by schema dialog forms.
 * @property {'default'|'danger'|string} [tone] Visual tone for the confirm button.
 * @property {'dialog'|'confirm'|'form'|string} [type] Dialog interaction type.
 *
 * Promise returned by dialog helpers. Resolves with submitted form data, a custom
 * component payload, or a truthy/falsey result for default and confirm dialogs.
 * The assigned dialog id is exposed on `.id`.
 * @typedef {Promise<unknown> & { id: string }} DialogPromise
 *
 * @typedef {Object} DialogApi
 * @property {import('vue').Ref<Array<DialogOptions & { id: string }>>} dialogStack Reactive dialog array for <ElDialogStack>.
 * @property {(input?: string|DialogOptions|DialogComponent, propsOrOptions?: DialogProps|DialogOptions, options?: DialogOptions) => DialogPromise} showDialog Show a dialog and resolve with the user action.
 * @property {(input?: string|DialogOptions, options?: DialogOptions) => Promise<boolean>} confirmDialog Show a confirmation dialog and resolve true or false.
 * @property {(input: DialogComponent|DialogFormSchema, propsOrOptions?: DialogProps|DialogOptions, options?: DialogOptions) => DialogPromise} dialogForm Show a custom component or schema-driven form dialog.
 * @property {(id: string, value?: unknown) => void} resolveDialog Resolve and remove a dialog by id.
 * @property {(id: string, value?: unknown) => void} dismissDialog Dismiss and remove a dialog by id.
 * @property {() => void} clearDialogs Dismiss all dialogs.
 */

/**
 * Creates a small controlled dialog store for <ElDialogStack>.
 *
 * @param {DialogOptions} [defaults] Options applied to every dialog shown by this store.
 * @returns {DialogApi}
 */
export function useDialogs(defaults = {}) {
	const dialogStack = ref([]);
	const pending = new Map();

	/**
	 * Show a programmatic dialog.
	 *
	 * Strings and plain objects render a default body/footer:
	 * `showDialog({ title: 'Saved', message: 'Everything is up to date.' })`.
	 *
	 * Components render as custom dialog bodies:
	 * `showDialog(InviteForm, { email }, { title: 'Invite teammate' })`.
	 *
	 * @param {string|DialogOptions|DialogComponent} [input] Dialog title string, full dialog options, or Vue component body.
	 * @param {DialogProps|DialogOptions} [propsOrOptions] Props for component dialogs, or option overrides for default dialogs.
	 * @param {DialogOptions} [options] Additional options when the first argument is a Vue component.
	 * @returns {DialogPromise}
	 */
	function showDialog(input = {}, propsOrOptions = {}, options = {}) {
		const dialog = normalizeDialog(input, propsOrOptions, options, defaults);
		const promise = createDialogPromise(dialog);
		dialogStack.value = [...dialogStack.value, dialog];
		return promise;
	}

	/**
	 * Show a confirmation dialog and resolve with a boolean.
	 *
	 * `confirmDialog('Archive project?', { tone: 'danger', confirmText: 'Archive' })`.
	 *
	 * @param {string|DialogOptions} [input] Confirmation title string or full dialog options.
	 * @param {DialogOptions} [options] Additional option overrides merged into the confirm dialog.
	 * @returns {Promise<boolean>} True when confirmed, false when cancelled or dismissed.
	 */
	function confirmDialog(input = {}, options = {}) {
		const base = typeof input === 'string' ? { title: input } : { ...input };
		return showDialog({
			type: 'confirm',
			showCancel: true,
			confirmText: 'Confirm',
			...base,
			...options,
		}).then(Boolean);
	}

	/**
	 * Show a custom component dialog or render an ElForm from a children schema.
	 *
	 * Component forms:
	 * `dialogForm(InviteForm, { defaultEmail }, { title: 'Invite teammate' })`.
	 *
	 * Schema forms:
	 * `dialogForm(schema, { initialValues: { email: '' } }, { title: 'Invite' })`.
	 *
	 * @param {DialogComponent|DialogFormSchema} input Vue component body or ElForm children schema.
	 * @param {DialogProps|DialogOptions} [propsOrOptions] Component props, or for schema forms `{ initialValues, values, ...dialogOptions }`.
	 * @param {DialogOptions} [options] Dialog chrome overrides such as title, description, and confirmText.
	 * @returns {DialogPromise}
	 */
	function dialogForm(input, propsOrOptions = {}, options = {}) {
		if (Array.isArray(input)) {
			const { initialValues, values, ...dialogOptions } = propsOrOptions || {};
			return showDialog({
				title: 'Form',
				confirmText: 'Submit',
				footer: false,
				...dialogOptions,
				...options,
				type: 'form',
				formSchema: input,
				formValues: values || initialValues || {},
			});
		}

		return showDialog(input, propsOrOptions, {
			footer: false,
			...options,
		});
	}

	/**
	 * Resolve and remove a dialog. Wire to <ElDialogStack> `@resolve`.
	 *
	 * @param {string} id Dialog id from the returned promise `.id` or `dialogStack` entry.
	 * @param {unknown} [value] Value passed to the dialog promise resolver. Defaults to `true`.
	 * @returns {void}
	 */
	function resolveDialog(id, value = true) {
		settle(id, value);
	}

	/**
	 * Dismiss and remove a dialog. Wire to <ElDialogStack> `@dismiss`.
	 *
	 * @param {string} id Dialog id from the returned promise `.id` or `dialogStack` entry.
	 * @param {unknown} [value] Value passed to the dialog promise resolver. Defaults to `false`.
	 * @returns {void}
	 */
	function dismissDialog(id, value = false) {
		settle(id, value);
	}

	/**
	 * Dismiss all visible dialogs. Each open promise resolves with `false`.
	 *
	 * @returns {void}
	 */
	function clearDialogs() {
		for (const dialog of dialogStack.value) dismissDialog(dialog.id);
	}

	/**
	 * @param {DialogOptions & { id: string }} dialog
	 * @returns {DialogPromise}
	 */
	function createDialogPromise(dialog) {
		let resolver = null;
		const promise = new Promise((resolvePromise) => {
			resolver = resolvePromise;
		});
		pending.set(dialog.id, resolver);
		promise.id = dialog.id;
		return promise;
	}

	/**
	 * @param {string} id
	 * @param {unknown} value
	 * @returns {void}
	 */
	function settle(id, value) {
		const resolver = pending.get(id);
		pending.delete(id);
		dialogStack.value = dialogStack.value.filter((dialog) => dialog.id !== id);
		if (resolver) resolver(value);
	}

	return {
		dialogStack,
		showDialog,
		confirmDialog,
		dialogForm,
		resolveDialog,
		dismissDialog,
		clearDialogs,
	};
}

/**
 * Merge caller input into a normalized dialog record for the stack.
 *
 * @param {string|DialogOptions|DialogComponent} input
 * @param {DialogProps|DialogOptions} propsOrOptions
 * @param {DialogOptions} options
 * @param {DialogOptions} defaults
 * @returns {DialogOptions & { id: string }}
 */
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
		invalidMessage: 'Complete the required fields before continuing.',
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

/**
 * @param {unknown} value
 * @returns {value is DialogComponent}
 */
function isDialogComponent(value) {
	return Boolean(
		value
		&& (typeof value === 'function'
			|| (typeof value === 'object'
				&& (value.setup || value.render || value.template || value.__name || value.__file))),
	);
}

/**
 * @returns {string}
 */
function createDialogId() {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
	return `dialog-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
