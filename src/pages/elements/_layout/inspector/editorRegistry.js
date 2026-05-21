import { markRaw } from 'vue';
import {
	ElListInput,
	ElTextInput,
	ElTextareaInput,
	ElNumberInput,
	ElSelectInput,
	ElBooleanInput,
	ElColorInput,
} from '../../lib/vue';

// Editor components are referenced by string name in spec schemas (e.g.
// `_edit: { component: 'ElListInput' }`). This indirection keeps production
// output (anything rendered through ElRenderer) free of inspector / form code.
//
// To add your own editor: `registerEditor('MyEditor', MyEditorComponent)`.

const editors = {
	ElListInput: markRaw(ElListInput),
	ElTextInput: markRaw(ElTextInput),
	ElTextareaInput: markRaw(ElTextareaInput),
	ElNumberInput: markRaw(ElNumberInput),
	ElSelectInput: markRaw(ElSelectInput),
	ElBooleanInput: markRaw(ElBooleanInput),
	ElColorInput: markRaw(ElColorInput),
};

export function getEditor(name) { return editors[name] || null; }
export function registerEditor(name, component) { editors[name] = markRaw(component); }
export function listEditors() { return Object.keys(editors); }
