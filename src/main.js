import { ViteSSG } from 'vite-ssg';
import App from './App.vue';
import SteveLayout from './pages/SteveLayout.vue';
import './style.css';
import { routes } from './routes';

const siteName = "Steve O'Brien";

// Apply the stored theme mode to `<html data-theme>` as early as possible so
// the first paint matches what useTheme would do on mount. `system` mode
// resolves against the OS preference. Legacy `theme` key (which only held
// 'light' or 'dark') is honoured for users who set their preference before
// the three-mode toggle landed.
const applyInitialTheme = () => {
	if (typeof window === 'undefined') return;
	const stored = window.localStorage.getItem('theme-mode')
		|| window.localStorage.getItem('theme')
		|| 'system';
	let theme = stored;
	if (stored === 'system' || (stored !== 'light' && stored !== 'dark')) {
		theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	document.documentElement.dataset.theme = theme;
};

const updateMetaTag = (selector, attributes) => {
	let tag = document.head.querySelector(selector);
	if (!tag) {
		tag = document.createElement('meta');
		document.head.appendChild(tag);
	}

	for (const [key, value] of Object.entries(attributes)) {
		tag.setAttribute(key, value);
	}
};

const removeMetaTag = (selector) => {
	document.head.querySelector(selector)?.remove();
};

/**
 * Updates the browser document metadata for the active route.
 *
 * Routes may opt out of the default site-name suffix by setting
 * `meta.titleIsAbsolute` when their title already contains the full value.
 *
 * @param {import('vue-router').RouteLocationNormalizedLoaded} route Active route.
 * @returns {void}
 */
const updateDocumentHead = (route) => {
	const routeTitle = route.meta?.title || '';
	const title = route.meta?.titleIsAbsolute
		? routeTitle
		: routeTitle
			? `${routeTitle} | ${siteName}`
			: siteName;
	const description = route.meta?.description || '';
	const keywords = route.meta?.keywords || '';

	document.title = title;

	if (description) {
		updateMetaTag('meta[name="description"]', {
			name: 'description',
			content: description,
		});
	} else {
		removeMetaTag('meta[name="description"]');
	}

	if (keywords) {
		updateMetaTag('meta[name="keywords"]', {
			name: 'keywords',
			content: keywords,
		});
	} else {
		removeMetaTag('meta[name="keywords"]');
	}
};

export const createApp = ViteSSG(
	App,
	{
		routes,
		/**
		 * Restore saved positions and anchor mantra detail routes to their expanded entry.
		 *
		 * @param {import('vue-router').RouteLocationNormalized} to Destination route.
		 * @param {import('vue-router').RouteLocationNormalized} from Previous route.
		 * @param {import('vue-router')._ScrollPositionNormalized | null} savedPosition Browser history position.
		 * @returns {import('vue-router').RouterScrollBehaviorReturn} Requested scroll position.
		 */
		scrollBehavior(to, from, savedPosition) {
			if (savedPosition) return savedPosition;
			if (to.hash) return { el: to.hash, top: 24, behavior: 'smooth' };
			return { top: 0 };
		},
	},
	({ app, router, isClient }) => {
		app.component('SteveLayout', SteveLayout);

		if (!isClient) {
			return;
		}

		applyInitialTheme();
		router.afterEach((to) => updateDocumentHead(to));
	},
);
