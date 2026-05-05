import AboutPage from './pages/AboutPage.vue';
import ExperimentsPage from './pages/ExperimentsPage.vue';
import IdeasPage from './pages/IdeasPage.vue';
import ProjectsPage from './pages/ProjectsPage.vue';

export const routes = [
	{ path: '/', component: AboutPage, meta: { title: 'About' } },
	{ path: '/experiments', component: ExperimentsPage, meta: { title: 'Experiments' } },
	{ path: '/projects', component: ProjectsPage, meta: { title: 'Projects' } },
	{ path: '/ideas', component: IdeasPage, meta: { title: 'Ideas' } },
];
