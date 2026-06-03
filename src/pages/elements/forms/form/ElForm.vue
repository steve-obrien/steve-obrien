<script>
import { computed, defineComponent, h, inject, provide, reactive, toRaw, watch } from 'vue';
import ElAutocomplete from '../autocomplete/ElAutocomplete.vue';
import ElCalendar from '../calendar/ElCalendar.vue';
import ElCheckbox from '../checkbox/ElCheckbox.vue';
import ElCodeInput from '../code-input/ElCodeInput.vue';
import ElCombobox from '../combobox/ElCombobox.vue';
import ElDatePicker from '../date-picker/ElDatePicker.vue';
import ElEmailInput from '../email-input/ElEmailInput.vue';
import ElJsonInput from '../json-input/ElJsonInput.vue';
import ElJsonListInput from '../json-list-input/ElJsonListInput.vue';
import ElNativeSelect from '../native-select/ElNativeSelect.vue';
import ElNumberInput from '../number-input/ElNumberInput.vue';
import ElPasswordInput from '../password-input/ElPasswordInput.vue';
import ElRadioGroup from '../radio-group/ElRadioGroup.vue';
import ElSelectInput from '../select-input/ElSelectInput.vue';
import ElTagCombobox from '../tag-combobox/ElTagCombobox.vue';
import ElTextInput from '../text-input/ElTextInput.vue';
import ElTextareaInput from '../textarea-input/ElTextareaInput.vue';
import ElToggle from '../toggle/ElToggle.vue';
import ElUrlInput from '../url-input/ElUrlInput.vue';
import { formFieldProviderKey, normalizeErrors } from '../field/useField.js';
import { deletePathValue, forms, getPathValue, setPathValue } from './formApi.js';

const formComponents = {
	ElAutocomplete,
	ElCalendar,
	ElCheckbox,
	ElCodeInput,
	ElCombobox,
	ElDatePicker,
	ElEmailInput,
	ElJsonInput,
	ElJsonListInput,
	ElNativeSelect,
	ElNumberInput,
	ElPasswordInput,
	ElRadioGroup,
	ElSelectInput,
	ElTagCombobox,
	ElTextInput,
	ElTextareaInput,
	ElToggle,
	ElUrlInput,
};
let ElFormComponent;

function joinPath(scope, name) {
	if (!scope) return name || '';
	if (!name) return scope;
	return `${scope}.${name}`;
}

function htmlNameFromPath(path) {
	const parts = String(path || '').split('.').filter(Boolean);
	if (!parts.length) return '';
	return parts.slice(1).reduce((name, part) => `${name}[${part}]`, parts[0]);
}

function htmlIdFromPath(path) {
	return String(path || '')
		.split('.')
		.filter(Boolean)
		.join('_')
		.replace(/[^A-Za-z0-9_]+/g, '_')
		.replace(/^_+|_+$/g, '');
}

function ownField(path, scope) {
	return !scope || path === scope || String(path).startsWith(`${scope}.`);
}

function clone(value) {
	const next = toRaw(value);
	if (next == null || typeof next !== 'object') return next;
	if (Array.isArray(next)) return next.map((item) => clone(item));
	if (next instanceof Date) return new Date(next);
	return Object.fromEntries(Object.entries(next).map(([key, item]) => [key, clone(item)]));
}

function snapshot(value) {
	return clone(value || {});
}

function normalizeFieldState(state = {}) {
	const errors = normalizeErrors(state.errors);
	const hasValidationSignal = (
		'validating' in state
		|| 'invalid' in state
		|| 'valid' in state
		|| 'errors' in state
	);
	const interaction = state.interaction || (state.focused ? 'focused' : state.touched ? 'blurred' : 'untouched');
	const modification = state.modification || (state.dirty ? 'changed' : 'clean');
	let validation = 'unknown';

	if (state.validating) validation = 'validating';
	else if (state.invalid || errors.length) validation = 'invalid';
	else if (state.valid) validation = 'valid';
	else if (state.validation && state.validation !== 'unknown') validation = state.validation;
	else if (state.validation === 'unknown') validation = 'unknown';
	else if (hasValidationSignal) validation = 'valid';

	return {
		...state,
		interaction,
		modification,
		validation,
		focused: interaction === 'focused',
		touched: interaction !== 'untouched',
		dirty: modification === 'changed',
		validating: validation === 'validating',
		invalid: validation === 'invalid',
		valid: validation === 'valid',
		errors,
	};
}

function mergeFieldState(previous = {}, patch = {}) {
	const next = {
		...previous,
		...patch,
	};

	if (!('interaction' in patch)) {
		if (patch.focused === true) next.interaction = 'focused';
		else if (patch.touched === true) next.interaction = 'blurred';
		else if (patch.focused === false && patch.touched === false) next.interaction = 'untouched';
		else if ('focused' in patch || 'touched' in patch) delete next.interaction;
	}
	if (!('modification' in patch) && 'dirty' in patch) {
		next.modification = patch.dirty ? 'changed' : 'clean';
	}
	if (!('validation' in patch) && ('validating' in patch || 'invalid' in patch || 'valid' in patch || 'errors' in patch)) {
		const patchErrors = 'errors' in patch ? normalizeErrors(patch.errors) : null;
		if (patch.validating === true) next.validation = 'validating';
		else if (patch.invalid === true || patchErrors?.length) next.validation = 'invalid';
		else if (patch.valid === true || patch.invalid === false || (patchErrors && !patchErrors.length)) next.validation = 'valid';
		else delete next.validation;
	}
	if ('validation' in patch || 'validating' in patch || 'invalid' in patch || 'valid' in patch || 'errors' in patch) {
		if (patch.validating !== true) delete next.validating;
		if (patch.invalid !== true) delete next.invalid;
		if (patch.valid !== true) delete next.valid;
	}

	return normalizeFieldState(next);
}

const RenderNode = defineComponent({
	name: 'ElFormRenderNode',
	props: {
		node: { type: [Object, String], required: true },
	},
	setup(props) {
		return () => {
			const node = props.node;
			if (typeof node === 'string') return node;
			if (node.type === 'text' || node.text != null) return node.text || '';
			const componentName = node.component || node.type || 'div';
			const component = componentName === 'ElForm' ? ElFormComponent : formComponents[componentName] || componentName;
			const children = (node.children || []).map((child, index) => h(RenderNode, { node: child, key: child.id || index }));
			return h(component, { ...(node.props || {}) }, children.length ? () => children : undefined);
		};
	},
});

ElFormComponent = defineComponent({
	name: 'ElForm',
	inheritAttrs: false,
	__doc: {
		name: 'Form',
		tag: '<ElForm>',
		description: 'A Pinia-friendly form provider that gathers child field values, errors, and field state.',
		icon: 'M6 4h12v16H6V4Zm3 5h6M9 13h6M9 17h4',
		slots: [
			{ name: '(default)', description: 'Form fields. Slot props include values, errors, state, validate, and reset.' },
		],
		events: [
			{ name: 'update:modelValue', payload: 'Record<string, unknown>', description: 'Fired when any child field updates the form value.' },
			{ name: 'update:children', payload: 'Array', description: 'Fired when the programmatic schema children change.' },
			{ name: 'schema-change', payload: '{ children, form }', description: 'Fired when children are added, removed, or replaced through the form API.' },
			{ name: 'change', payload: '{ name, value, values, errors, state }', description: 'Fired whenever a child field changes.' },
			{ name: 'submit', payload: '{ values, errors, state }', description: 'Fired after successful validation when the form is submitted.' },
			{ name: 'invalid', payload: '{ values, errors, state }', description: 'Fired when submit validation fails.' },
		],
	},
	props: {
		modelValue: {
			type: Object,
			default: () => ({}),
			_edit: { component: 'ElJsonInput', description: 'Current form value keyed by field path.' },
		},
		name: {
			type: String,
			default: '',
			_edit: { description: 'Root forms use name as the global registry key. Nested forms use name as their local path segment.' },
		},
		children: {
			type: Array,
			default: () => [],
			_edit: {
				component: 'ElJsonInput',
				description: 'Server/studio-style field definitions to render when slot children are not supplied.',
			},
		},
		validateOnSubmit: {
			type: Boolean,
			default: true,
			_edit: { description: 'Run all registered field validators before emitting submit.' },
		},
	},
	emits: ['update:modelValue', 'update:children', 'schema-change', 'change', 'submit', 'invalid'],
	setup(props, { attrs, emit, expose, slots }) {
		const parent = inject(formFieldProviderKey, null);
		const isRoot = !parent;
		const values = isRoot ? reactive(snapshot(props.modelValue)) : parent.values;
		const fieldStates = isRoot ? reactive({}) : parent.fieldStates;
		const fields = isRoot ? reactive(new Map()) : parent.fields;
		const errors = isRoot ? reactive({}) : parent.errors;
		const subforms = isRoot ? reactive({}) : parent.subforms;
		const schemaChildren = reactive([]);
		const scopePath = computed(() => (isRoot ? '' : joinPath(parent?.scopePath || '', props.name)));

		const scopedFieldEntries = computed(() => Array.from(fields.entries()).filter(([path]) => ownField(path, scopePath.value)));
		const scopedErrorEntries = computed(() => Object.entries(errors).filter(([path]) => ownField(path, scopePath.value)));
		const errorCount = computed(() => scopedErrorEntries.value.reduce((count, [, fieldErrors]) => (
			count + (Array.isArray(fieldErrors) ? fieldErrors.length : fieldErrors ? 1 : 0)
		), 0));

		const state = computed(() => {
			const states = Object.entries(fieldStates)
				.filter(([path]) => ownField(path, scopePath.value))
				.map(([, field]) => normalizeFieldState(field));
			const fieldErrorCount = states.reduce((count, field) => count + field.errors.length, 0);
			const nextErrorCount = Math.max(errorCount.value, fieldErrorCount);
			const validation = states.some((field) => field.validation === 'validating')
				? 'validating'
				: nextErrorCount > 0 || states.some((field) => field.validation === 'invalid')
					? 'invalid'
					: states.length && states.every((field) => field.validation === 'valid')
						? 'valid'
						: 'unknown';
			const interaction = states.some((field) => field.interaction === 'focused')
				? 'focused'
				: states.some((field) => field.interaction === 'blurred')
					? 'blurred'
					: 'untouched';
			const modification = states.some((field) => field.modification === 'changed') ? 'changed' : 'clean';
			return {
				interaction,
				modification,
				validation,
				dirty: modification === 'changed',
				touched: interaction !== 'untouched',
				focused: interaction === 'focused',
				validating: validation === 'validating',
				invalid: validation === 'invalid',
				valid: validation === 'valid',
				errorCount: nextErrorCount,
				fieldCount: scopedFieldEntries.value.length,
				path: scopePath.value,
			};
		});

		function modelSnapshot() {
			return snapshot(values);
		}

		function payload(name = '') {
			return {
				name,
				value: name ? getPathValue(values, name) : undefined,
				values: modelSnapshot(),
				errors: { ...errors },
				state: state.value,
				form: provider,
			};
		}

		function emitModel() {
			if (isRoot) emit('update:modelValue', modelSnapshot());
			else parent.emitModel?.();
		}

		function emitChange(name) {
			emit('change', payload(name));
			if (!isRoot) parent.emitChange?.(name);
		}

		function emitSchemaChange() {
			const nextChildren = snapshot(schemaChildren);
			emit('update:children', nextChildren);
			emit('schema-change', {
				children: nextChildren,
				form: provider,
			});
		}

		function setChildren(nextChildren = []) {
			schemaChildren.splice(0, schemaChildren.length, ...snapshot(nextChildren));
			emitSchemaChange();
		}

		function syncChildren() {
			schemaChildren.splice(0, schemaChildren.length, ...snapshot(props.children || []));
		}

		function getChildren() {
			return snapshot(schemaChildren);
		}

		function addChild(child, index = schemaChildren.length) {
			const at = Math.max(0, Math.min(index, schemaChildren.length));
			schemaChildren.splice(at, 0, snapshot(child));
			emitSchemaChange();
			return schemaChildren[at];
		}

		function childIndex(match) {
			if (typeof match === 'number') return match;
			return schemaChildren.findIndex((child) => (
				child.id === match
				|| child.props?.name === match
			));
		}

		function removeChild(match) {
			const index = childIndex(match);
			if (index < 0) return null;
			const [removed] = schemaChildren.splice(index, 1);
			emitSchemaChange();
			return removed;
		}

		function replaceChild(match, child) {
			const index = childIndex(match);
			if (index < 0) return addChild(child);
			schemaChildren.splice(index, 1, snapshot(child));
			emitSchemaChange();
			return schemaChildren[index];
		}

		function addSubform(path, children = [], options = {}) {
			const node = {
				id: options.id || `subform-${String(path).replace(/\W+/g, '-')}`,
				component: 'ElForm',
				props: {
					name: path,
					class: options.class || 'space-y-3 rounded-xl border border-border bg-secondary/25 p-4',
					...(options.props || {}),
				},
				children,
			};
			if ('value' in options) setFieldValue(path, options.value);
			return addChild(node, options.index ?? schemaChildren.length);
		}

		function setFieldErrors(name, nextErrors) {
			if (Array.isArray(nextErrors) && nextErrors.length) {
				setPathValue(errors, name, nextErrors);
				return;
			}
			if (nextErrors && !Array.isArray(nextErrors)) {
				setPathValue(errors, name, nextErrors);
				return;
			}
			deletePathValue(errors, name);
		}

		function getFieldPath(name) {
			return joinPath(scopePath.value, name);
		}

		function getHtmlName(name) {
			return htmlNameFromPath(getFieldPath(name));
		}

		function getHtmlId(name) {
			return htmlIdFromPath(getFieldPath(name));
		}

		function registerField(field) {
			if (!field?.name) return;
			const path = getFieldPath(field.name);
			fields.set(path, {
				...field,
				name: field.name,
				path,
				htmlName: htmlNameFromPath(path),
				htmlId: htmlIdFromPath(path),
				kind: 'field',
				getValue: () => getPathValue(values, path),
				setValue: (value) => {
					setPathValue(values, path, value);
					emitModel();
					emitChange(path);
				},
				getState: () => normalizeFieldState(getPathValue(fieldStates, path) || {}),
				setState: (patch) => {
					setPathValue(fieldStates, path, mergeFieldState(getPathValue(fieldStates, path) || {}, patch));
					if ('errors' in patch) setFieldErrors(path, patch.errors);
				},
			});
			if (getPathValue(values, path) === undefined) {
				setPathValue(values, path, field.initialValue ?? '');
				emitModel();
			}
			if (!getPathValue(fieldStates, path)) setPathValue(fieldStates, path, normalizeFieldState());
		}

		function unregisterField(name) {
			const path = getFieldPath(name);
			fields.delete(path);
			deletePathValue(fieldStates, path);
			deletePathValue(errors, path);
		}

		function getFieldValue(name) {
			return getPathValue(values, getFieldPath(name));
		}

		function setFieldValue(name, value) {
			const path = getFieldPath(name);
			setPathValue(values, path, value);
			emitModel();
			emitChange(path);
		}

		function getValue(name) {
			return getFieldValue(name);
		}

		function setValue(name, value) {
			setFieldValue(name, value);
		}

		function getFieldState(name) {
			return normalizeFieldState(getPathValue(fieldStates, getFieldPath(name)) || {});
		}

		function getSubform(name) {
			return subforms[getFieldPath(name)];
		}

		function getField(name) {
			return fields.get(getFieldPath(name)) || null;
		}

		function getForm(name = '') {
			if (!name) return provider;
			return getSubform(name) || null;
		}

		function get(name) {
			return getForm(name) || getField(name);
		}

		function isFormApi(value = provider) {
			return value?.kind === 'form';
		}

		function isFieldApi(value) {
			return value?.kind === 'field';
		}

		function setFieldState(name, patch) {
			const path = getFieldPath(name);
			setPathValue(fieldStates, path, mergeFieldState(getPathValue(fieldStates, path) || {}, patch));
			if ('errors' in patch) setFieldErrors(path, patch.errors);
		}

		function getState() {
			const fieldEntries = scopedFieldEntries.value.map(([path, field]) => {
				const fieldState = normalizeFieldState(getPathValue(fieldStates, path) || {});
				return [path, {
					name: field.name,
					path,
					label: field.label,
					required: Boolean(field.required),
					htmlName: field.htmlName,
					htmlId: field.htmlId,
					value: typeof field.getValue === 'function' ? field.getValue() : getPathValue(values, path),
					state: fieldState,
					errors: fieldState.errors,
				}];
			});

			return {
				path: scopePath.value,
				state: state.value,
				values: snapshot(scopePath.value ? getPathValue(values, scopePath.value) : values),
				errors: snapshot(errors),
				fieldStates: Object.fromEntries(scopedFieldEntries.value.map(([path]) => [
					path,
					normalizeFieldState(getPathValue(fieldStates, path) || {}),
				])),
				fields: Object.fromEntries(fieldEntries),
			};
		}

		async function validate() {
			const results = await Promise.all(scopedFieldEntries.value.map(async ([, field]) => {
				if (typeof field.validate !== 'function') return true;
				return field.validate({ form: provider });
			}));
			return results.every(Boolean);
		}

		function reset(nextValues = props.modelValue || {}) {
			if (isRoot) {
				for (const key of Object.keys(values)) delete values[key];
				Object.assign(values, nextValues);
				for (const key of Object.keys(fieldStates)) delete fieldStates[key];
				for (const key of Object.keys(errors)) delete errors[key];
			} else {
				setPathValue(values, scopePath.value, nextValues);
				for (const [path] of scopedFieldEntries.value) {
					deletePathValue(fieldStates, path);
					deletePathValue(errors, path);
				}
			}
			emitModel();
			emitChange(scopePath.value);
		}

		async function onSubmit(event) {
			if (event) event.preventDefault();
			const valid = props.validateOnSubmit ? await validate() : state.value.valid;
			emit(valid ? 'submit' : 'invalid', payload(scopePath.value));
		}

		const provider = {
			kind: 'form',
			values,
			errors,
			fieldStates,
			fields,
			subforms,
			state,
			children: schemaChildren,
			scopePath: scopePath.value,
			getValue,
			setValue,
			getFieldPath,
			getHtmlName,
			getHtmlId,
			getFieldState,
			setFieldState,
			getState,
			getFieldValue,
			setFieldValue,
			get,
			getField,
			getForm,
			isForm: isFormApi,
			isField: isFieldApi,
			getSubform,
			getChildren,
			setChildren,
			addChild,
			removeChild,
			replaceChild,
			addSubform,
			registerField,
			unregisterField,
			validate,
			reset,
			emitModel,
			emitChange,
		};

		watch(scopePath, (nextPath) => {
			provider.scopePath = nextPath;
		}, { immediate: true });

		watch(() => props.modelValue, (nextValue) => {
			if (!isRoot) return;
			const incoming = nextValue || {};
			for (const key of Object.keys(values)) {
				if (!(key in incoming)) delete values[key];
			}
			Object.assign(values, incoming);
		}, { deep: true });

		watch(() => props.children, syncChildren, { deep: true, immediate: true });

		watch(() => props.name, (nextName, previousName) => {
			if (previousName && forms[previousName] === provider) delete forms[previousName];
			if (nextName && isRoot) forms[nextName] = provider;
		}, { immediate: true });

		watch(scopePath, (nextPath, previousPath) => {
			if (previousPath && subforms[previousPath] === provider) delete subforms[previousPath];
			if (nextPath && !isRoot) {
				subforms[nextPath] = provider;
				const directName = props.name;
				if (directName && !String(directName).includes('.')) parent[directName] = provider;
			}
		}, { immediate: true });

		provide(formFieldProviderKey, provider);
		expose(provider);

		return () => {
			const slotProps = {
				values,
				errors,
				state: state.value,
				form: provider,
				children: schemaChildren,
				validate,
				reset,
			};
			const renderedChildren = schemaChildren.map((node, index) => (
				h(RenderNode, { node, key: `schema-${node.id || index}` })
			));
			const slotChildren = slots.default ? slots.default(slotProps) : [];

			return h(isRoot ? 'form' : 'fieldset', {
				...attrs,
				...(isRoot ? {
					noValidate: attrs.noValidate ?? attrs.novalidate ?? true,
					onSubmit,
				} : {}),
			}, [
				...renderedChildren,
				...slotChildren,
			]);
		};
	},
});

export default ElFormComponent;
</script>
