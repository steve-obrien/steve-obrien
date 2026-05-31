import { labelFromExportName, labelFromSlug } from './componentManager.js';

export function inspectComponentRecord(record) {
	const component = record.component;
	const doc = getComponentDoc(component);
	const studio = getStudioMeta(component);
	return {
		...record,
		doc,
		studio,
		label: doc.name || labelFromExportName(record.exportName) || labelFromSlug(record.slug),
		badge: doc.nav?.badge || doc.badge || null,
		icon: doc.nav?.icon || doc.icon || studio.icon || null,
		order: doc.order ?? 100,
		hidden: Boolean(doc.hidden),
		navHidden: Boolean(doc.hidden || doc.nav?.hidden),
		studioHidden: Boolean(doc.hidden || studio.hidden),
		props: getComponentProps(component),
	};
}

export function getComponentDoc(component) {
	return component?.__doc || {};
}

export function getStudioMeta(component) {
	const doc = getComponentDoc(component);
	return component?.__studio || doc.studio || {};
}

export function getComponentProps(component) {
	const props = component?.props;
	if (!props) return {};
	if (Array.isArray(props)) return Object.fromEntries(props.map((key) => [key, {}]));
	return props;
}
