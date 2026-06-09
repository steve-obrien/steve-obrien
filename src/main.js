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

const updateDocumentHead = (route) => {
	const title = route.meta?.title ? `${route.meta.title} | ${siteName}` : siteName;
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
		scrollBehavior(to, from, savedPosition) {
			if (savedPosition) return savedPosition;
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
