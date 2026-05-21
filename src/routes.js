import AboutPage from './pages/AboutPage.vue';
import IdeasPage from './pages/IdeasPage.vue';
import NotFoundPage from './NotFoundPage.vue';

const pageRouteModules = import.meta.glob('./pages/**/Index.vue');

function filePathToRoutePath(globKey) {
	const m = globKey.match(/^\.\/pages\/(.+)\/Index\.vue$/);
	if (!m) return null;
	const inner = m[1];
	if (inner === '.' || inner === '..' || inner.includes('..')) return null;
	if (inner === 'index') return '/';
	return `/${inner}`;
}

function titleFromRoutePath(path) {
	if (path === '/') return 'Home';
	const seg = path.split('/').filter(Boolean).pop();
	if (!seg) return 'Index';
	return seg
		.replace(/-/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

const fileBasedRoutes = Object.entries(pageRouteModules)
	.map(([key, loader]) => {
		const path = filePathToRoutePath(key);
		if (!path) return null;
		return {
			path,
			component: loader,
			meta: { title: titleFromRoutePath(path) },
		};
	})
	.filter(Boolean);

const manualRoutes = [
	{ path: '/', component: AboutPage, meta: { title: 'About' } },
	{ path: '/ideas', component: IdeasPage, meta: { title: 'Ideas' } },
];

const manualPaths = new Set(manualRoutes.map((r) => r.path));

export const routes = [
	...manualRoutes,
	...fileBasedRoutes.filter((r) => !manualPaths.has(r.path)),
	{
		path: '/:pathMatch(.*)*',
		name: 'NotFound',
		component: NotFoundPage,
		meta: { title: 'Page not found' },
	},
];
