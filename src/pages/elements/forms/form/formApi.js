import { reactive } from 'vue';

export const forms = reactive({});

export function getPathValue(source, path) {
	if (!path) return source;
	return String(path)
		.split('.')
		.filter(Boolean)
		.reduce((value, part) => value?.[part], source);
}

export function setPathValue(source, path, value) {
	const parts = String(path).split('.').filter(Boolean);
	if (!parts.length) return;
	let target = source;
	for (let index = 0; index < parts.length - 1; index += 1) {
		const part = parts[index];
		const nextPart = parts[index + 1];
		if (target[part] == null || typeof target[part] !== 'object') {
			target[part] = /^\d+$/.test(nextPart) ? [] : {};
		}
		target = target[part];
	}
	target[parts[parts.length - 1]] = value;
}

export function deletePathValue(source, path) {
	const parts = String(path).split('.').filter(Boolean);
	if (!parts.length) return;
	const key = parts.pop();
	const target = getPathValue(source, parts.join('.'));
	if (target && typeof target === 'object') delete target[key];
}

export function createFormRegistry() {
	return reactive({});
}
