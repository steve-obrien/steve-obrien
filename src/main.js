import { ViteSSG } from 'vite-ssg';
import App from './App.vue';
import SteveLayout from './pages/SteveLayout.vue';
import './style.css';
import { routes } from './routes';

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

export const createApp = ViteSSG(
	App,
	{ routes },
	({ app, isClient }) => {
		app.component('SteveLayout', SteveLayout);

		if (!isClient) {
			return;
		}

		applyInitialTheme();
	},
);
