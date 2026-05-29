import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import templateEditorTailwindServer from './src/pages/experiments/template-editor/tailwindServer.js';

export default defineConfig({
	plugins: [
		templateEditorTailwindServer(),
		vue({
			template: {
				compilerOptions: {
					isCustomElement: (tag) => tag.startsWith('element-'),
				},
			},
		}),
		tailwindcss(),
	],
	resolve: {
		// Aliases so example SFCs (and any docs `?raw` snippets) can import via
		// `@elements/vue` / `@elements/headless` — what a real consumer would
		// write — instead of the in-repo relative paths.
		alias: {
			'@elements/vue': fileURLToPath(new URL('./src/pages/elements/lib/vue', import.meta.url)),
			'@elements/headless': fileURLToPath(new URL('./src/pages/elements/lib/headless', import.meta.url)),
		},
	},
	base: '/',
	server: {
		host: true,
		// https: true,
	}
});
