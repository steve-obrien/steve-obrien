import { ref } from 'vue';

const currentTheme = ref('light');

export function useTheme() {

	const setTheme = (theme) => {
		document.documentElement.dataset.theme = theme;
		currentTheme.value = theme;
		localStorage.setItem('theme', theme);
	};
	const toggleTheme = () => {
		setTheme(currentTheme.value === 'dark' ? 'light' : 'dark');
	};
	const initTheme = () => {
		const stored = localStorage.getItem('theme');
		currentTheme.value =
			stored ||
			document.documentElement.dataset.theme ||
			'light';
		document.documentElement.dataset.theme = currentTheme.value;
	};
	return {
		currentTheme,
		toggleTheme,
		setTheme,
		initTheme
	};

}