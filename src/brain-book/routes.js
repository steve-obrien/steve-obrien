/** Local authoring routes, included only by the development router. */
export const brainBookRoutes = [
	{
		path: '/brain-book',
		component: () => import('./BookLayout.vue'),
		meta: { title: 'Brain Book', description: 'A local writing workspace.' },
		children: [
			{ path: '', name: 'brain-book-contents', component: () => import('./pages/ContentsPage.vue') },
			{ path: ':slug', name: 'brain-book-chapter', component: () => import('./pages/ChapterPage.vue') },
		],
	},
];
