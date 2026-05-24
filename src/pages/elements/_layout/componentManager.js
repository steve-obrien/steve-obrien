const eagerComponentModules = import.meta.glob([
	'../components/*/El*.vue',
	'../forms/*/El*.vue',
	'../visual/*/El*.vue',
	'!../components/playground/ElRenderer.vue',
	'!../components/toast/ElToastItem.vue',
], { eager: true, import: 'default' });

const lazyComponentModules = import.meta.glob([
	'../components/*/El*.vue',
	'../forms/*/El*.vue',
	'../visual/*/El*.vue',
	'!../components/playground/ElRenderer.vue',
	'!../components/toast/ElToastItem.vue',
], { import: 'default' });

export const componentSections = ['components', 'visual', 'forms'];

export function getComponentRecords() {
	return recordsFromModules(eagerComponentModules, 'component');
}

export function getLazyComponentRecords() {
	return recordsFromModules(lazyComponentModules, 'loader');
}

export function getComponentRecordByRoute(route) {
	return getComponentRecords().find((record) => record.route === route);
}

export function getFormRedirectRecords() {
	return getLazyComponentRecords()
		.filter((record) => record.section === 'forms')
		.map((record) => ({
			from: `/elements/components/${record.slug}`,
			to: record.route,
		}));
}

export function labelFromSection(section) {
	return {
		components: 'Components',
		forms: 'Forms',
		visual: 'Visual',
	}[section] || labelFromSlug(section);
}

export function labelFromSlug(slug) {
	return slug
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function recordsFromModules(modules, valueKey) {
	return Object.entries(modules)
		.map(([path, value]) => recordFromPath(path, valueKey, value))
		.filter(Boolean);
}

function recordFromPath(path, valueKey, value) {
	const match = path.match(/^\.\.\/(components|forms|visual)\/([^/]+)\/(El[^/]+)\.vue$/);
	if (!match) return null;
	const [, section, slug, exportName] = match;
	return {
		id: `${section}/${slug}`,
		path,
		section,
		slug,
		exportName,
		route: `/elements/${section}/${slug}`,
		[valueKey]: value,
	};
}
