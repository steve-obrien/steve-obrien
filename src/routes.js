import AboutPage from './pages/AboutPage.vue';
import ArticlePage from './pages/articles/ArticlePage.vue';
import { articles } from './pages/articles/articles.js';
import IdeasPage from './pages/IdeasPage.vue';
import { dailyNewsFeeds } from './pages/news/dailyNews.js';
import NotFoundPage from './NotFoundPage.vue';
import { getFormRedirectRecords, getLazyComponentRecords } from './pages/elements/_layout/componentManager.js';

const pageRouteModules = import.meta.glob('./pages/**/Index.vue');
const generatedComponentPage = () => import('./pages/elements/_layout/GeneratedComponentPage.vue');

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
	{ path: '/news', component: () => import('./pages/news/Index.vue'), meta: { title: 'News' } },
];

const manualPaths = new Set(manualRoutes.map((r) => r.path));
const fileBasedPaths = new Set(fileBasedRoutes.map((r) => r.path));

const generatedComponentRoutes = getLazyComponentRecords()
	.map((record) => {
		if (fileBasedPaths.has(record.route)) return null;
		return {
			path: record.route,
			component: generatedComponentPage,
			props: { componentLoader: record.loader },
			meta: { title: titleFromRoutePath(record.route) },
		};
	})
	.filter(Boolean);

const movedFormRedirects = getFormRedirectRecords()
	.map((record) => ({
		path: record.from,
		redirect: record.to,
	}));

const articleDetailRoutes = articles.map((article) => ({
	path: `/articles/${article.slug}`,
	component: ArticlePage,
	props: { slug: article.slug },
	meta: {
		title: article.title,
		description: article.metaDescription,
		keywords: article.metaKeywords.join(', '),
	},
}));

const newsFeedRoutes = dailyNewsFeeds.map((feed) => ({
	path: `/news/${feed.date}`,
	component: () => import('./pages/news/Index.vue'),
	props: { date: feed.date },
	meta: { title: `News: ${feed.date}` },
}));

const newsSummaryRoutes = dailyNewsFeeds.flatMap((feed) => feed.items.map((item) => ({
	path: `/news/${feed.date}/${item.slug}`,
	component: () => import('./pages/news/SummaryPage.vue'),
	props: {
		date: feed.date,
		slug: item.slug,
	},
	meta: { title: item.title },
})));

export const routes = [
	...manualRoutes,
	...fileBasedRoutes.filter((r) => !manualPaths.has(r.path)),
	...generatedComponentRoutes,
	...movedFormRedirects,
	...articleDetailRoutes,
	...newsFeedRoutes,
	...newsSummaryRoutes,
	{
		path: '/:pathMatch(.*)*',
		name: 'NotFound',
		component: NotFoundPage,
		meta: { title: 'Page not found' },
	},
];
