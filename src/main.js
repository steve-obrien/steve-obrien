import { ViteSSG } from 'vite-ssg';
import App from './App.vue';
import SteveLayout from './pages/SteveLayout.vue';
import './style.css';
import { routes } from './routes';

const getInitialTheme = () => {
	if (typeof window === 'undefined') {
		return 'light';
	}

	const storedTheme = window.localStorage.getItem('theme');
	if (storedTheme === 'light' || storedTheme === 'dark') {
		return storedTheme;
	}

	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const createApp = ViteSSG(
	App,
	{ routes },
	({ app, isClient }) => {
		app.component('SteveLayout', SteveLayout);

		if (!isClient) {
			return;
		}

		const theme = getInitialTheme();
		document.documentElement.dataset.theme = theme;
		window.localStorage.setItem('theme', theme);
	},
);
