<script>
import { computed, defineAsyncComponent, defineComponent, h, inject, provide, reactive, toRaw, watch } from 'vue';
import ElAutocomplete from '../autocomplete/ElAutocomplete.vue';
import ElCalendar from '../calendar/ElCalendar.vue';
import ElCheckbox from '../checkbox/ElCheckbox.vue';
import ElCodeInput from '../code-input/ElCodeInput.vue';
import ElCombobox from '../combobox/ElCombobox.vue';
import ElDatePicker from '../date-picker/ElDatePicker.vue';
import ElEmailInput from '../email-input/ElEmailInput.vue';
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
import { formNodeDefaultValue, normalizeFormChildren, normalizeFormNode } from './formDefinition.js';

const ElJsonInput = defineAsyncComponent(() => import('../json-input/ElJsonInput.vue'));
const ElJsonListInput = defineAsyncComponent(() => import('../json-list-input/ElJsonListInput.vue'));

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
	return clone(value ?? {});
}

function replaceReactiveValue(target, nextValue) {
	if (Array.isArray(target)) {
		const next = Array.isArray(nextValue) ? snapshot(nextValue) : [];
		target.splice(0, target.length, ...next);
		return;
	}
	const next = nextValue && typeof nextValue === 'object' && !Array.isArray(nextValue) ? snapshot(nextValue) : {};
	for (const key of Object.keys(target)) delete target[key];
	Object.assign(target, next);
}

function syncReactiveObject(target, nextValue) {
	const incoming = nextValue && typeof nextValue === 'object' && !Array.isArray(nextValue) ? nextValue : {};
	for (const key of Object.keys(target)) {
		if (!(key in incoming)) delete target[key];
	}
	Object.assign(target, incoming);
}

function singularLabel(label) {
	const normalized = String(label || 'row').trim().toLowerCase();
	if (normalized === 'children') return 'child';
	if (normalized.endsWith('ies')) return `${normalized.slice(0, -3)}y`;
	if (normalized.endsWith('s')) return normalized.slice(0, -1);
	return normalized;
}

function jsonListSchemaForNode(node) {
	if (node.props?.schema) return node.props.schema;
	if (node.type !== 'array') return undefined;
	return {
		type: 'array',
		...(node.props?.label ? { label: node.props.label } : {}),
		...(node.items ? { items: node.items } : {}),
	};
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
			const nodeProps = {
				...(node.props || {}),
				...(componentName === 'ElForm' ? {
					type: node.type,
					items: node.items,
				} : {}),
				...(componentName === 'ElJsonListInput' ? {
					schema: jsonListSchemaForNode(node),
				} : {}),
			};
			return h(component, nodeProps, children.length ? () => children : undefined);
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
			type: [Array, Object],
			default: () => ({}),
			_edit: { component: 'ElJsonInput', description: 'Current form value keyed by field path.' },
		},
		type: {
			type: String,
			default: 'object',
			_edit: { options: ['object', 'array'], description: 'Render a single object form or an array of form rows.' },
		},
		multiple: {
			type: Boolean,
			default: false,
			_edit: { description: 'Render this form as a repeatable array of itself.' },
		},
		items: {
			type: [Array, Object],
			default: null,
			_edit: { component: 'ElJsonInput', description: 'Schema used for each row when type is array.' },
		},
		addLabel: {
			type: String,
			default: '',
			_edit: { description: 'Button label for adding a row in array mode.' },
		},
		compact: {
			type: Boolean,
			default: false,
			_edit: { description: 'Reduce spacing for inspectors and narrow layouts.' },
		},
		label: {
			type: String,
			default: '',
			_edit: { description: 'Optional group label.' },
		},
		description: {
			type: String,
			default: '',
			_edit: { description: 'Optional group description.' },
		},
		required: {
			type: Boolean,
			default: false,
			_edit: { description: 'Show a required marker on the group label.' },
		},
		visible: {
			type: Boolean,
			default: true,
			_edit: { description: 'Show or hide the rendered form.' },
		},
		tag: {
			type: String,
			default: '',
			_edit: { description: 'Override the rendered root element.' },
		},
		isolated: {
			type: Boolean,
			default: false,
			_edit: { description: 'Create a standalone provider even when nested inside another form.' },
		},
		name: {
			type: String,
			default: '',
			_edit: { description: 'Root forms use name as the global registry key. Nested forms use name as their local path segment.' },
		},
		children: {
			type: [Array, Object],
			default: () => [],
			_edit: {
				component: 'ElJsonInput',
				description: 'Server/studio-style field definitions to render when slot children are not supplied. Accepts an array or keyed object.',
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
		const injectedParent = inject(formFieldProviderKey, null);
		const parent = props.isolated ? null : injectedParent;
		const isRoot = !parent;
		const initialValue = props.multiple || props.type === 'array'
			? (Array.isArray(props.modelValue) ? props.modelValue : [])
			: (props.modelValue || {});
		const values = isRoot ? reactive(snapshot(initialValue)) : parent.values;
		const fieldStates = isRoot ? reactive({}) : parent.fieldStates;
		const fields = isRoot ? reactive(new Map()) : parent.fields;
		const errors = isRoot ? reactive({}) : parent.errors;
		const subforms = isRoot ? reactive({}) : parent.subforms;
		const schemaChildren = reactive([]);
		const scopePath = computed(() => (isRoot ? '' : joinPath(parent?.scopePath || '', props.name)));
		const isArrayMode = computed(() => props.multiple || props.type === 'array');
		const normalizedItems = computed(() => {
			if (props.items) return normalizeFormNode(props.items);
			if (schemaChildren.length) {
				return normalizeFormNode({
					type: 'ElForm',
					children: schemaChildren,
				});
			}
			return normalizeFormNode({ type: 'ElForm', children: [] });
		});
		const arrayRows = computed(() => {
			const value = isRoot ? values : getPathValue(values, scopePath.value);
			return Array.isArray(value) ? value : [];
		});
		const arrayAddLabel = computed(() => props.addLabel || `+ Add ${singularLabel(props.label || props.name || 'row')}`);

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

		function setArrayRows(nextRows) {
			const next = Array.isArray(nextRows) ? snapshot(nextRows) : [];
			if (isRoot) {
				replaceReactiveValue(values, next);
			} else if (scopePath.value) {
				setPathValue(values, scopePath.value, next);
			}
			emitModel();
			emitChange(scopePath.value);
		}

		function addArrayRow() {
			const index = arrayRows.value.length;
			setArrayRows([...arrayRows.value, formNodeDefaultValue(normalizedItems.value, { index })]);
		}

		function removeArrayRow(rowIndex) {
			setArrayRows(arrayRows.value.filter((_, index) => index !== rowIndex));
		}

		function moveArrayRow(rowIndex, dir) {
			const nextIndex = rowIndex + dir;
			if (nextIndex < 0 || nextIndex >= arrayRows.value.length) return;
			const next = [...arrayRows.value];
			[next[rowIndex], next[nextIndex]] = [next[nextIndex], next[rowIndex]];
			setArrayRows(next);
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
			schemaChildren.splice(0, schemaChildren.length, ...snapshot(normalizeFormChildren(nextChildren)));
			emitSchemaChange();
		}

		function syncChildren() {
			schemaChildren.splice(0, schemaChildren.length, ...snapshot(normalizeFormChildren(props.children || [])));
		}

		function getChildren() {
			return snapshot(schemaChildren);
		}

		function addChild(child, index = schemaChildren.length) {
			const at = Math.max(0, Math.min(index, schemaChildren.length));
			schemaChildren.splice(at, 0, snapshot(normalizeFormNode(child)));
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
			schemaChildren.splice(index, 1, snapshot(normalizeFormNode(child)));
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
				replaceReactiveValue(values, isArrayMode.value ? (Array.isArray(nextValues) ? nextValues : []) : nextValues);
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
			addArrayRow,
			removeArrayRow,
			moveArrayRow,
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
			if (isArrayMode.value) {
				replaceReactiveValue(values, Array.isArray(nextValue) ? nextValue : []);
				return;
			}
			syncReactiveObject(values, nextValue);
		}, { deep: true });

		watch([isArrayMode, scopePath], () => {
			if (!isArrayMode.value || isRoot || !scopePath.value) return;
			if (!Array.isArray(getPathValue(values, scopePath.value))) {
				setPathValue(values, scopePath.value, []);
				emitModel();
			}
		}, { immediate: true });

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

		function renderGroupHeader() {
			if (!props.label && !props.description) return [];
			return [
				h('div', { class: 'space-y-0.5' }, [
					props.label
						? h('p', { class: 'text-[11px] font-semibold uppercase tracking-wider text-muted-foreground' }, [
							props.label,
							props.required ? h('span', { class: 'text-destructive' }, '*') : null,
						])
						: null,
					props.description
						? h('p', { class: 'text-[11px] leading-snug text-muted-foreground' }, props.description)
						: null,
				]),
			];
		}

		function renderRoot(children) {
			if (props.visible === false) return null;
			const tag = props.tag || (isRoot ? 'form' : 'fieldset');
			const rootProps = {
				...attrs,
				...(tag === 'form' ? {
					noValidate: attrs.noValidate ?? attrs.novalidate ?? true,
					onSubmit,
				} : {}),
			};
			return h(tag, rootProps, children);
		}

		function rowButton(label, title, onClick) {
			return h('button', {
				type: 'button',
				class: [
					'grid place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground',
					props.compact ? 'size-6' : 'size-7',
				],
				title,
				'aria-label': title,
				onClick,
			}, label);
		}

		function renderArrayItem(row, rowIndex) {
			const item = normalizedItems.value || normalizeFormNode({ type: 'json' });
			const itemContent = item.type === 'object'
				? h(ElFormComponent, {
					name: String(rowIndex),
					type: 'object',
					children: item.children || [],
					compact: props.compact,
					tag: 'fieldset',
					class: props.compact ? 'space-y-1.5' : 'space-y-2',
				})
				: h(RenderNode, {
					node: {
						...item,
						props: {
							...(item.props || {}),
							name: String(rowIndex),
							label: item.props?.label || `Row ${rowIndex + 1}`,
						},
					},
				});

			return h('div', {
				key: rowIndex,
				class: [
					'rounded-lg border border-border bg-background',
					props.compact ? 'space-y-1.5 p-1.5' : 'space-y-2 p-2',
				],
			}, [
				h('div', { class: 'flex items-center justify-between gap-2' }, [
					h('span', { class: 'text-[11px] font-semibold uppercase tracking-wider text-muted-foreground' }, `Row ${rowIndex + 1}`),
					h('span', { class: 'flex items-center gap-1' }, [
						rowButton('↑', `Move row ${rowIndex + 1} up`, () => moveArrayRow(rowIndex, -1)),
						rowButton('↓', `Move row ${rowIndex + 1} down`, () => moveArrayRow(rowIndex, 1)),
						h('button', {
							type: 'button',
							class: [
								'grid place-items-center rounded-md text-destructive hover:bg-destructive/10',
								props.compact ? 'size-6' : 'size-7',
							],
							title: 'Remove',
							'aria-label': `Remove row ${rowIndex + 1}`,
							onClick: () => removeArrayRow(rowIndex),
						}, '×'),
					]),
				]),
				itemContent,
			]);
		}

		function renderArray(slotChildren) {
			return [
				...renderGroupHeader(),
				h('div', { class: props.compact ? 'space-y-1.5' : 'space-y-2' }, [
					...arrayRows.value.map((row, index) => renderArrayItem(row, index)),
					h('button', {
						type: 'button',
						class: [
							'flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-background text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground',
							props.compact ? 'py-1.5' : 'py-2',
						],
						onClick: addArrayRow,
					}, arrayAddLabel.value),
				]),
				...slotChildren,
			];
		}

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

			return renderRoot(isArrayMode.value
				? renderArray(slotChildren)
				: [
					...renderGroupHeader(),
					...renderedChildren,
					...slotChildren,
				]);
		};
	},
});

export default ElFormComponent;
</script>
