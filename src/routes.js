import HomePage from './pages/HomePage.vue';
import ArticlePage from './pages/articles/ArticlePage.vue';
import { articles } from './pages/articles/articles.js';
import IdeasPage from './pages/IdeasPage.vue';
import { dailyNewsFeeds } from './pages/news/dailyNews.js';
import NotFoundPage from './NotFoundPage.vue';

const externalRedirectPage = () => import('./pages/ExternalRedirectPage.vue');
const pageRouteModules = import.meta.glob('./pages/**/Index.vue');
const cvPage = pageRouteModules['./pages/cv/Index.vue'];
const domStudioOrigin = 'https://getdom.studio';

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

function getDomStudioUrl(path) {
	const suffix = path.replace(/^\/elements\/?/, '/');
	if (!suffix || suffix === '/') return domStudioOrigin;
	return `${domStudioOrigin}${suffix}`;
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
	{
		path: '/',
		component: HomePage,
		meta: {
			title: "Steve O'Brien | Founder, Engineer & Author",
			titleIsAbsolute: true,
			description: 'Steve O’Brien builds AI products, technical systems and companies, and writes about human, artificial and future intelligence.',
			keywords: 'Steve O’Brien, technical founder, AI systems, intelligence, GrowthScout, DOM Studio, technology companies, Bristol',
		},
	},
	{
		path: '/cv',
		component: cvPage,
		meta: {
			title: 'Executive CV',
			description: 'Steve O’Brien is a fractional CTO, AI systems architect, technical founder, and product builder with more than two decades of engineering experience.',
			keywords: 'Steve O’Brien, fractional CTO, executive CV, AI systems architect, technology advisor, Bristol',
		},
	},
	{ path: '/ideas', component: IdeasPage, meta: { title: 'Ideas' } },
	{ path: '/news', component: () => import('./pages/news/Index.vue'), meta: { title: 'News' } },
	{
		path: '/elements',
		component: externalRedirectPage,
		props: { to: domStudioOrigin, label: 'Open DOM Studio' },
		meta: { title: 'DOM Studio' },
	},
	{
		path: '/elements/:pathMatch(.*)*',
		component: externalRedirectPage,
		props: (route) => ({
			to: getDomStudioUrl(route.path),
			label: 'Open DOM Studio',
		}),
		meta: { title: 'DOM Studio' },
	},
];

const manualPaths = new Set(manualRoutes.map((r) => r.path));

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
