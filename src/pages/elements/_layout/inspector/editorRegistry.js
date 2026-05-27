import { markRaw } from 'vue';
import {
	ElTextInput,
	ElTextareaInput,
	ElNumberInput,
	ElRangeInput,
	ElPositionInput,
	ElSelectInput,
	ElCombobox,
	ElToggle,
	ElColorInput,
	ElJsonListInput,
	ElCodeInput,
	ElJsonInput,
} from '../../lib/vue';

// Editor components are referenced by their actual component name in spec
// schemas (e.g. `_edit: { component: 'ElSelectInput' }`). The indirection keeps
// production output (anything rendered through ElRenderer) free of form code.
//
// To add your own editor: `registerEditor('MyEditor', MyEditorComponent)`.

const editors = {
	ElTextInput: markRaw(ElTextInput),
	ElTextareaInput: markRaw(ElTextareaInput),
	ElNumberInput: markRaw(ElNumberInput),
	ElRangeInput: markRaw(ElRangeInput),
	ElPositionInput: markRaw(ElPositionInput),
	ElSelectInput: markRaw(ElSelectInput),
	ElCombobox: markRaw(ElCombobox),
	ElToggle: markRaw(ElToggle),
	ElBooleanInput: markRaw(ElToggle),
	ElColorInput: markRaw(ElColorInput),
	ElJsonListInput: markRaw(ElJsonListInput),
	ElCodeInput: markRaw(ElCodeInput),
	ElJsonInput: markRaw(ElJsonInput),
};

export function getEditor(name) { return editors[name] || null; }
export function getDefaultEditor() { return editors.ElTextInput; }
export function registerEditor(name, component) { editors[name] = markRaw(component); }
export function listEditors() { return Object.keys(editors); }
