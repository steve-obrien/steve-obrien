const eagerComponentModules = import.meta.glob([
	'../components/*/El*.vue',
	'../forms/*/El*.vue',
	'../mobile/*/El*.vue',
	'../visual/*/El*.vue',
	'!../components/playground/ElRenderer.vue',
	'!../components/toast/ElToastItem.vue',
	'!../forms/_shared/El*.vue',
], { eager: true, import: 'default' });

const eagerComponentSourceModules = import.meta.glob([
	'../components/*/El*.vue',
	'../forms/*/El*.vue',
	'../mobile/*/El*.vue',
	'../visual/*/El*.vue',
	'!../components/playground/ElRenderer.vue',
	'!../components/toast/ElToastItem.vue',
	'!../forms/_shared/El*.vue',
], { eager: true, import: 'default', query: '?raw' });

const lazyComponentModules = import.meta.glob([
	'../components/*/El*.vue',
	'../forms/*/El*.vue',
	'../mobile/*/El*.vue',
	'../visual/*/El*.vue',
	'!../components/playground/ElRenderer.vue',
	'!../components/toast/ElToastItem.vue',
	'!../forms/_shared/El*.vue',
], { import: 'default' });

const lazyComponentSourceModules = import.meta.glob([
	'../components/*/El*.vue',
	'../forms/*/El*.vue',
	'../mobile/*/El*.vue',
	'../visual/*/El*.vue',
	'!../components/playground/ElRenderer.vue',
	'!../components/toast/ElToastItem.vue',
	'!../forms/_shared/El*.vue',
], { import: 'default', query: '?raw' });

export const componentSections = ['components', 'visual', 'forms', 'mobile'];

export function getComponentRecords() {
	return recordsFromModules(eagerComponentModules, 'component', eagerComponentSourceModules, 'source');
}

export function getLazyComponentRecords() {
	return recordsFromModules(lazyComponentModules, 'loader', lazyComponentSourceModules, 'sourceLoader');
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
		mobile: 'Mobile',
		visual: 'Visual',
	}[section] || labelFromSlug(section);
}

export function labelFromSlug(slug) {
	return slug
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

export function labelFromExportName(exportName) {
	return labelFromSlug(
		String(exportName || '')
			.replace(/^El/, '')
			.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
			.toLowerCase(),
	);
}

export function componentAnchor(record) {
	return String(record?.exportName || record?.slug || '')
		.replace(/^El/, 'el-')
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.toLowerCase();
}

export function primaryExportNameForSlug(slug) {
	return `El${slug
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join('')}`;
}

function recordsFromModules(modules, valueKey, sourceModules = {}, sourceKey = 'source') {
	return Object.entries(modules)
		.map(([path, value]) => recordFromPath(path, valueKey, value, sourceKey, sourceModules[path]))
		.filter(Boolean);
}

function recordFromPath(path, valueKey, value, sourceKey, source) {
	const match = path.match(/^\.\.\/(components|forms|mobile|visual)\/([^/]+)\/(El[^/]+)\.vue$/);
	if (!match) return null;
	const [, section, slug, exportName] = match;
	return {
		id: `${section}/${slug}`,
		path,
		section,
		slug,
		exportName,
		route: `/elements/${section}/${slug}`,
		[sourceKey]: source,
		[valueKey]: value,
	};
}
