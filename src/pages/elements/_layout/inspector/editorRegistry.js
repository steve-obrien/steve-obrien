import { markRaw } from 'vue';
import {
	ElListInput,
	ElTextInput,
	ElTextareaInput,
	ElNumberInput,
	ElSelectInput,
	ElCombobox,
	ElBooleanInput,
	ElColorInput,
	ElJsonListInput,
} from '../../lib/vue';

// Editor components are referenced by their actual component name in spec
// schemas (e.g. `_edit: { editor: 'ElSelectInput' }`). The indirection keeps
// production output (anything rendered through ElRenderer) free of form code.
//
// To add your own editor: `registerEditor('MyEditor', MyEditorComponent)`.

const editors = {
	ElListInput: markRaw(ElListInput),
	ElTextInput: markRaw(ElTextInput),
	ElTextareaInput: markRaw(ElTextareaInput),
	ElNumberInput: markRaw(ElNumberInput),
	ElSelectInput: markRaw(ElSelectInput),
	ElCombobox: markRaw(ElCombobox),
	ElBooleanInput: markRaw(ElBooleanInput),
	ElColorInput: markRaw(ElColorInput),
	ElJsonListInput: markRaw(ElJsonListInput),
};

export function getEditor(name) { return editors[name] || null; }
export function getDefaultEditor() { return editors.ElTextInput; }
export function registerEditor(name, component) { editors[name] = markRaw(component); }
export function listEditors() { return Object.keys(editors); }
