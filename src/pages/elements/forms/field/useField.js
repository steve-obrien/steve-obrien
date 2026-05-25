import { computed, inject, onBeforeUnmount, ref, unref, useId, watch } from 'vue';
import { normalizeValidatorResult, requiredValidator } from './validators.js';

export const formFieldProviderKey = Symbol('elements.formFieldProvider');

function providerValue(provider, name) {
	if (!provider || !name) return undefined;
	if (typeof provider.getValue === 'function') return unref(provider.getValue(name));
	const values = provider.values || provider.data;
	if (!values) return undefined;
	return unref(values)?.[name];
}

function setProviderValue(provider, name, value) {
	if (!provider || !name) return;
	if (typeof provider.setValue === 'function') {
		provider.setValue(name, value);
		return;
	}
	const values = unref(provider.values || provider.data);
	if (values && typeof values === 'object') values[name] = value;
}

function providerState(provider, name) {
	if (!provider || !name) return {};
	if (typeof provider.getFieldState === 'function') return unref(provider.getFieldState(name)) || {};
	const states = unref(provider.fieldStates || provider.states);
	return states?.[name] || {};
}

function setProviderState(provider, name, patch) {
	if (!provider || !name) return;
	if (typeof provider.setFieldState === 'function') {
		provider.setFieldState(name, patch);
		return;
	}
	const states = unref(provider.fieldStates || provider.states);
	if (states && typeof states === 'object') {
		states[name] = {
			...(states[name] || {}),
			...patch,
		};
	}
}

function providerPath(provider, name) {
	if (!provider || !name) return name || '';
	if (typeof provider.getFieldPath === 'function') return unref(provider.getFieldPath(name));
	return name;
}

function providerHtmlName(provider, name) {
	if (!provider || !name) return name || '';
	if (typeof provider.getHtmlName === 'function') return unref(provider.getHtmlName(name));
	return name;
}

function htmlIdFromPath(path) {
	return String(path || '')
		.split('.')
		.filter(Boolean)
		.join('_')
		.replace(/[^A-Za-z0-9_]+/g, '_')
		.replace(/^_+|_+$/g, '');
}

function providerHtmlId(provider, name) {
	if (!provider || !name) return htmlIdFromPath(name);
	if (typeof provider.getHtmlId === 'function') return unref(provider.getHtmlId(name));
	return htmlIdFromPath(name);
}

function normalizeErrors(errors) {
	const value = unref(errors);
	if (!value) return [];
	if (typeof value === 'string') return value ? [value] : [];
	if (Array.isArray(value)) {
		return value
			.flatMap((error) => normalizeErrors(error))
			.filter(Boolean);
	}
	if (typeof value === 'object') {
		if (value.message) return [value.message];
		return Object.values(value)
			.flatMap((error) => normalizeErrors(error))
			.filter(Boolean);
	}
	return [];
}

export function useField(props, emit, options = {}) {
	const provider = inject(formFieldProviderKey, null);
	const generatedId = `${options.idPrefix || 'el-field'}-${useId()}`;
	const focused = ref(false);
	const touched = ref(false);
	const dirty = ref(false);
	const validating = ref(false);
	const internalValue = ref(props.modelValue);
	const localErrors = ref([]);
	let validationRun = 0;

	const name = computed(() => props.name || props.id || generatedId);
	const path = computed(() => providerPath(provider, name.value));
	const htmlName = computed(() => providerHtmlName(provider, name.value));
	const htmlId = computed(() => props.id || providerHtmlId(provider, name.value) || htmlIdFromPath(path.value) || generatedId);
	const id = htmlId;
	const value = computed(() => {
		const provided = providerValue(provider, name.value);
		return provided !== undefined ? provided : internalValue.value;
	});
	const providerFieldState = computed(() => providerState(provider, name.value));
	const errors = computed(() => [
		...normalizeErrors(props.errors),
		...normalizeErrors(providerFieldState.value.errors),
		...normalizeErrors(localErrors.value),
	]);
	const invalid = computed(() => Boolean(props.invalid || providerFieldState.value.invalid || errors.value.length));
	const visible = computed(() => props.visible !== false && providerFieldState.value.visible !== false);
	const disabled = computed(() => Boolean(props.disabled || providerFieldState.value.disabled));
	const readOnly = computed(() => Boolean(props.readOnly || providerFieldState.value.readOnly));

	const fieldAttrs = computed(() => ({
		label: props.label,
		description: props.description,
		htmlFor: id.value,
		invalid: invalid.value,
		required: props.required,
		errors: errors.value,
		visible: visible.value,
	}));

	const inputAttrs = computed(() => ({
		id: id.value,
		name: htmlName.value,
		value: value.value,
		placeholder: props.placeholder,
		disabled: disabled.value || undefined,
		readonly: readOnly.value || undefined,
		required: props.required || undefined,
		'aria-invalid': invalid.value || undefined,
		'data-invalid': invalid.value ? '' : undefined,
	}));

	watch(() => props.modelValue, (nextValue) => {
		internalValue.value = nextValue;
	});

	watch(value, () => {
		if (!props.validateOnBlur) validate();
	});

	onBeforeUnmount(() => {
		if (name.value && provider?.unregisterField) provider.unregisterField(name.value);
	});

	function setFieldState(patch) {
		setProviderState(provider, name.value, patch);
	}

	function setValue(nextValue) {
		internalValue.value = nextValue;
		setProviderValue(provider, name.value, nextValue);
		emit?.('update:modelValue', nextValue);
		dirty.value = true;
		setFieldState({ dirty: true, value: nextValue });
	}

	function onInput(nextValue) {
		setValue(nextValue);
	}

	function onFocus(event) {
		focused.value = true;
		setFieldState({ focused: true });
		emit?.('focus', event);
	}

	async function onBlur(event) {
		focused.value = false;
		touched.value = true;
		setFieldState({ focused: false, touched: true });
		emit?.('blur', event);
		if (props.validateOnBlur) await validate();
	}

	async function validate(extraContext = {}) {
		const currentRun = ++validationRun;
		const nextErrors = [];
		const validators = [
			...(props.required ? [requiredValidator] : []),
			...(props.validators || []),
		];
		validating.value = true;
		setFieldState({ validating: true });
		for (const validator of validators) {
			const validateFn = typeof validator === 'function' ? validator : validator.validate;
			if (!validateFn) continue;
			const result = await validateFn(value.value, {
				id: id.value,
				name: name.value,
				path: path.value,
				htmlName: htmlName.value,
				htmlId: htmlId.value,
				props,
				provider,
				...extraContext,
			});
			const normalized = normalizeValidatorResult(result, validator);
			if (normalized) nextErrors.push(normalized);
		}
		if (currentRun === validationRun) {
			localErrors.value = provider ? [] : nextErrors;
			validating.value = false;
			setFieldState({
				errors: nextErrors,
				invalid: nextErrors.length > 0,
				validating: false,
			});
		}
		return nextErrors.length === 0;
	}

	watch(name, (nextName, previousName) => {
		if (previousName && provider?.unregisterField) provider.unregisterField(previousName);
		if (nextName && provider?.registerField) {
			provider.registerField({
				id: id.value,
				name: nextName,
				path: path.value,
				htmlName: htmlName.value,
				htmlId: htmlId.value,
				label: props.label,
				required: props.required,
				initialValue: internalValue.value,
				validators: props.validators,
				validate,
			});
		}
	}, { immediate: true });

	return {
		id,
		name,
		path,
		htmlName,
		htmlId,
		value,
		errors,
		invalid,
		focused,
		touched,
		dirty,
		validating,
		visible,
		disabled,
		readOnly,
		fieldAttrs,
		inputAttrs,
		setValue,
		onInput,
		onFocus,
		onBlur,
		validate,
	};
}
