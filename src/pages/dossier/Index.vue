<script setup>
import SteveLayout from '../SteveLayout.vue';
import meImage from '../../assets/me.jpeg';

const referenceSummary = [
	{
		value: 'May 2026',
		label: 'research snapshot',
	},
	{
		value: '5',
		label: 'research areas',
	},
	{
		value: 'Public',
		label: 'records and media',
	},
];

const profileReferences = [
	{
		id: 'career',
		eyebrow: 'Career',
		label: 'Career Narrative',
		text: 'Biography, public site copy, archived pages, and long-form interview material were used to clarify the arc from Airbus to Newicon and independent AI systems work.',
	},
	{
		id: 'companies',
		eyebrow: 'Companies',
		label: 'Company Records',
		text: 'Companies House records and public company material establish the dates, entities, roles, and Newicon transition into Linebreak.',
	},
	{
		id: 'public-record',
		eyebrow: 'Media',
		label: 'Public Record',
		text: 'Talks, podcasts, authored posts, festival material, and award listings provide a view of Steve\'s public voice and professional themes.',
	},
	{
		id: 'creative',
		eyebrow: 'Music',
		label: 'Creative History',
		text: 'Recovered web archives and music catalogs connect the early In Extremis band story to the practical origins of Steve\'s software work.',
	},
];

const navigation = [
	{ id: 'story', label: 'Story' },
	{ id: 'timeline', label: 'Timeline' },
	{ id: 'companies', label: 'Companies' },
	{ id: 'appearances', label: 'Appearances' },
	{ id: 'sources', label: 'References' },
];

const headlineStats = [
	{ value: '18+', label: 'years building Newicon' },
	{ value: '2006', label: 'company incorporated' },
	{ value: '5', label: 'public talks and interviews' },
	{ value: '2026', label: 'independent AI systems work' },
];

const storyBlocks = [
	{
		eyebrow: 'Origin',
		title: 'A practical route into computing',
		text: 'Steve\'s early route into software came through making tools for a teenage rock band: websites, shared spaces, and systems that helped people coordinate around real work.',
	},
	{
		eyebrow: 'Engineering',
		title: 'Airbus discipline before agency life',
		text: 'Before Newicon became the center of gravity, Steve trained and worked at Airbus Filton, bringing an industrial engineering backbone to his later product and consultancy work.',
	},
	{
		eyebrow: 'Builder',
		title: 'Newicon as a long-running studio',
		text: 'Newicon started as a side venture, publicly launched in 2009, and grew into a Bristol software, AI engineering, IoT, cloud, and product studio serving clients across complex regulated and technical domains.',
	},
	{
		eyebrow: 'Now',
		title: 'Independent AI systems work',
		text: 'Steve now focuses on practical AI systems, developer workflows, realtime collaboration, and documentation that adapts to user intent.',
	},
];

const timelineHighlights = [
	{
		year: '2002-2009',
		title: 'Airbus Filton',
		text: 'Technical apprenticeship, aeronautical engineering study, then modelling and simulation engineering.',
	},
	{
		year: '2004-2013',
		title: 'In Extremis',
		text: 'Vocals and rhythm guitar in a Bristol rock-funk band with releases that remain traceable in public music catalogs.',
	},
	{
		year: '2006',
		title: 'Newicon incorporated',
		text: 'Newicon Ltd is incorporated in Bristol, initially as a side venture before the public launch.',
	},
	{
		year: '2009',
		title: 'Public launch',
		text: 'Newicon moves into a full-time chapter with Steve holding CEO and CTO responsibilities.',
	},
	{
		year: '2021-2022',
		title: 'Public voice',
		text: 'Podcast interviews, Future Thinking episodes, Bristol Technology Festival activity, and South West 42 under 42 recognition.',
	},
	{
		year: '2025-2026',
		title: 'Linebreak and beyond',
		text: 'Newicon joins Linebreak, followed by Steve leaving the company and relaunching around practical AI systems.',
	},
];

const companyCards = [
	{
		name: 'Newicon Ltd',
		meta: 'Founder, CEO and CTO',
		text: 'Bristol software, AI engineering, IoT, cloud, and product studio. Publicly launched in 2009 and joined Linebreak in 2025.',
		url: 'https://newicon.net',
	},
	{
		name: 'Flex Digital Solutions',
		meta: 'Director and shareholder',
		text: 'A related digital-solutions company formed during the 2025 transition around Newicon and its surrounding assets.',
		url: 'https://find-and-update.company-information.service.gov.uk/company/16201031',
	},
	{
		name: 'Alivio Botanicals',
		meta: 'Past side venture',
		text: 'A dissolved Bristol food-services company found through Companies House records.',
		url: 'https://find-and-update.company-information.service.gov.uk/company/12746813',
	},
];

const appearances = [
	{
		type: 'Talk',
		title: 'Exciting powerful future of IoT',
		meta: 'Bristol Technology Festival 2022',
		url: 'https://www.youtube.com/watch?v=LeiSDVHyBYs',
	},
	{
		type: 'Video',
		title: 'Unlock your technology potential',
		meta: 'New Icon, 2024',
		url: 'https://www.youtube.com/watch?v=V8sN_M8JmRM',
	},
	{
		type: 'Podcast',
		title: 'In Conversation: Steve O\'Brien',
		meta: 'The Leaders Council Podcast, 2021',
		url: 'https://podcasts.apple.com/us/podcast/in-conversation-steve-obrien/id1496330059?i=1000544186550',
	},
	{
		type: 'Podcast',
		title: 'The game of people',
		meta: 'Conscious Leaders with Ruth Farenga, 2021',
		url: 'https://podcasts.apple.com/us/podcast/the-game-of-people-steve-obrien/id1498754252?i=1000513698106',
	},
];

const musicNotes = [
	'In Extremis was a Bristol four-piece described in recovered web records as explosive rock-funk fusion.',
	'Public catalog evidence points to Killing Time in 2004 and Somewhere but Here in 2013.',
	'The band story gives the technical biography a useful human origin: websites and systems built around a real community.',
];
</script>

<template>
	<SteveLayout bg-class="dossier-shell">
		<div class="dossier-page">
			<section class="hero-section" aria-labelledby="dossier-title">
				<div class="hero-copy">
					<p class="section-kicker">Profile</p>
					<h1 id="dossier-title">Steve O'Brien</h1>
					<p class="hero-intro">
						Steve O'Brien is a Bristol-based engineer, technical founder, and builder
						of practical AI systems. His work spans aerospace engineering, software
						consultancy, IoT, cloud platforms, and product engineering.
					</p>
					<div class="hero-actions" aria-label="Dossier page sections">
						<a
							v-for="item in navigation"
							:key="item.id"
							:href="`#${item.id}`"
						>
							{{ item.label }}
						</a>
					</div>
				</div>

				<div class="portrait-panel" aria-label="Steve O'Brien profile summary">
					<img :src="meImage" alt="Steve O'Brien" width="500" height="500">
					<div class="portrait-caption">
						<p>Steve O'Brien</p>
						<span>Engineer, founder, builder of practical AI systems</span>
					</div>
				</div>
			</section>

			<section class="stat-grid" aria-label="Profile highlights">
				<div
					v-for="stat in headlineStats"
					:key="stat.label"
					class="stat-card"
				>
					<strong>{{ stat.value }}</strong>
					<span>{{ stat.label }}</span>
				</div>
			</section>

			<section id="story" class="content-section" aria-labelledby="story-title">
				<div class="section-heading">
					<p class="section-kicker">Overview</p>
					<h2 id="story-title">Engineer, founder, AI systems builder</h2>
					<p>
						Steve's public story runs from engineering discipline, to long-term agency
						building, to a sharper independent focus on real-world AI systems.
					</p>
				</div>

				<div class="story-grid">
					<article
						v-for="block in storyBlocks"
						:key="block.title"
						class="story-card"
					>
						<span>{{ block.eyebrow }}</span>
						<h3>{{ block.title }}</h3>
						<p>{{ block.text }}</p>
					</article>
				</div>
			</section>

			<section id="timeline" class="content-section" aria-labelledby="timeline-title">
				<div class="section-heading">
					<p class="section-kicker">Chronology</p>
					<h2 id="timeline-title">Selected milestones</h2>
					<p>
						A concise chronology of the public work, company history, creative roots,
						and the transition into independent AI systems work.
					</p>
				</div>

				<div class="timeline-list">
					<article
						v-for="item in timelineHighlights"
						:key="`${item.year}-${item.title}`"
						class="timeline-item"
					>
						<time>{{ item.year }}</time>
						<div>
							<h3>{{ item.title }}</h3>
							<p>{{ item.text }}</p>
						</div>
					</article>
				</div>
			</section>

			<section id="companies" class="content-section" aria-labelledby="companies-title">
				<div class="section-heading">
					<p class="section-kicker">Companies</p>
					<h2 id="companies-title">Company threads</h2>
					<p>
						A clear view of the entities connected to Steve's public company history,
						anchored by the long-running Newicon story.
					</p>
				</div>

				<div class="company-grid">
					<article
						v-for="company in companyCards"
						:key="company.name"
						class="company-card"
					>
						<div>
							<h3>{{ company.name }}</h3>
							<p class="company-meta">{{ company.meta }}</p>
						</div>
						<p>{{ company.text }}</p>
						<a :href="company.url" target="_blank" rel="noopener noreferrer">
							View reference
						</a>
					</article>
				</div>
			</section>

			<section id="appearances" class="content-section media-section" aria-labelledby="appearances-title">
				<div class="section-heading">
					<p class="section-kicker">Public record</p>
					<h2 id="appearances-title">Talks, podcasts, and music</h2>
					<p>
						Beyond company work, Steve's public record includes festival talks,
						podcast conversations, authored writing, and a band history that predates
						his software career.
					</p>
				</div>

				<div class="media-layout">
					<div class="appearance-list">
						<a
							v-for="appearance in appearances"
							:key="appearance.title"
							:href="appearance.url"
							target="_blank"
							rel="noopener noreferrer"
							class="appearance-item"
						>
							<span>{{ appearance.type }}</span>
							<strong>{{ appearance.title }}</strong>
							<small>{{ appearance.meta }}</small>
						</a>
					</div>

					<aside class="music-panel">
						<p class="section-kicker">Music</p>
						<h3>In Extremis</h3>
						<ul>
							<li
								v-for="note in musicNotes"
								:key="note"
							>
								{{ note }}
							</li>
						</ul>
					</aside>
				</div>
			</section>

			<section id="sources" class="content-section" aria-labelledby="sources-title">
				<div class="section-heading">
					<p class="section-kicker">Reference basis</p>
					<h2 id="sources-title">How the profile was compiled</h2>
					<p>
						This profile is a public-facing synthesis, based on research notes,
						public records, archived pages, podcasts, videos, and company material.
					</p>
				</div>

				<div class="source-summary">
					<div
						v-for="item in referenceSummary"
						:key="item.label"
					>
						<strong>{{ item.value }}</strong>
						<span>{{ item.label }}</span>
					</div>
				</div>

				<div class="source-grid">
					<article
						v-for="reference in profileReferences"
						:key="reference.id"
						class="source-card"
					>
						<div>
							<p>{{ reference.eyebrow }}</p>
							<h3>{{ reference.label }}</h3>
						</div>
						<p>{{ reference.text }}</p>
					</article>
				</div>
			</section>
		</div>
	</SteveLayout>
</template>

<style scoped>
.dossier-page {
	display: flex;
	flex-direction: column;
	gap: 3.75rem;
	margin-top: -5rem;
	padding-bottom: 2rem;
}

:global(.dossier-shell) {
	background:
		linear-gradient(180deg, #f7f2e8 0%, #f7f5f0 34%, #eef5f2 100%);
	color: #18201f;
}

:global([data-theme="dark"] .dossier-shell) {
	background:
		linear-gradient(180deg, #101312 0%, #141816 48%, #111315 100%);
	color: var(--foreground);
}

.hero-section {
	align-items: center;
	display: grid;
	gap: 2rem;
	grid-template-columns: minmax(0, 1.25fr) minmax(17rem, 0.75fr);
	min-height: min(34rem, calc(100svh - 11rem));
}

.hero-copy {
	align-items: flex-start;
	border: 1px solid color-mix(in oklch, var(--border) 70%, transparent);
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding: clamp(1.5rem, 4vw, 3rem) 0;
}

.section-kicker {
	color: #0f766e;
	font-size: 0.74rem;
	font-weight: 800;
	letter-spacing: 0.14em;
	line-height: 1.2;
	margin: 0;
	text-transform: uppercase;
}

:global([data-theme="dark"]) .section-kicker {
	color: #5eead4;
}

.hero-copy h1,
.section-heading h2 {
	color: currentColor;
	font-family: Georgia, "Times New Roman", serif;
	font-weight: 400;
	letter-spacing: 0;
	line-height: 1;
	margin: 0;
}

.hero-copy h1 {
	font-size: clamp(3.25rem, 6.6vw, 5.1rem);
	max-width: 16ch;
	padding-top: 1rem;
}

.hero-intro {
	color: color-mix(in oklch, currentColor 72%, transparent);
	font-size: clamp(1rem, 1.7vw, 1.2rem);
	line-height: 1.7;
	margin: 1.2rem 0 0;
	max-width: 44rem;
}

.hero-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.7rem;
	margin-top: 2rem;
}

.hero-actions a {
	align-items: center;
	background: color-mix(in oklch, white 72%, transparent);
	border: 1px solid color-mix(in oklch, currentColor 16%, transparent);
	border-radius: 0.5rem;
	color: currentColor;
	display: inline-flex;
	font-size: 0.9rem;
	font-weight: 700;
	min-height: 2.75rem;
	padding: 0 1rem;
	text-decoration: none;
	transition:
		background-color 180ms ease,
		border-color 180ms ease,
		transform 180ms ease;
}

.hero-actions a:hover {
	background: color-mix(in oklch, #0f766e 14%, white);
	border-color: color-mix(in oklch, #0f766e 36%, transparent);
	transform: translateY(-1px);
}

:global([data-theme="dark"]) .hero-actions a {
	background: color-mix(in oklch, var(--card) 78%, transparent);
}

:global([data-theme="dark"]) .hero-actions a:hover {
	background: color-mix(in oklch, #0f766e 28%, var(--card));
}

.portrait-panel {
	align-self: center;
	background: #18201f;
	border: 1px solid color-mix(in oklch, #18201f 18%, transparent);
	border-radius: 0.5rem;
	box-shadow: var(--shadow-xl);
	color: #f8f6ef;
	justify-self: end;
	max-width: 21rem;
	overflow: hidden;
	width: 100%;
}

.portrait-panel img {
	aspect-ratio: 4 / 5;
	display: block;
	height: auto;
	object-fit: cover;
	width: 100%;
}

.portrait-caption {
	padding: 1.1rem;
}

.portrait-caption p {
	font-family: Georgia, "Times New Roman", serif;
	font-size: 1.6rem;
	line-height: 1.1;
	margin: 0;
}

.portrait-caption span {
	color: color-mix(in oklch, #f8f6ef 70%, transparent);
	display: block;
	font-size: 0.95rem;
	line-height: 1.5;
	margin-top: 0.45rem;
}

.stat-grid,
.story-grid,
.company-grid,
.source-grid {
	display: grid;
	gap: 1rem;
}

.stat-grid {
	grid-template-columns: repeat(4, minmax(0, 1fr));
	margin-top: -1rem;
}

.stat-card,
.story-card,
.company-card,
.source-card,
.appearance-item,
.music-panel {
	background: color-mix(in oklch, white 82%, transparent);
	border: 1px solid color-mix(in oklch, currentColor 12%, transparent);
	border-radius: 0.5rem;
	box-shadow: var(--shadow-sm);
}

:global([data-theme="dark"]) .stat-card,
:global([data-theme="dark"]) .story-card,
:global([data-theme="dark"]) .company-card,
:global([data-theme="dark"]) .source-card,
:global([data-theme="dark"]) .appearance-item,
:global([data-theme="dark"]) .music-panel {
	background: color-mix(in oklch, var(--card) 84%, transparent);
}

.stat-card {
	display: flex;
	flex-direction: column;
	gap: 0.35rem;
	min-height: 8rem;
	padding: 1.2rem;
}

.stat-card strong {
	color: #be123c;
	font-family: Georgia, "Times New Roman", serif;
	font-size: clamp(2rem, 4vw, 3.5rem);
	font-weight: 400;
	letter-spacing: 0;
	line-height: 1;
}

:global([data-theme="dark"]) .stat-card strong {
	color: #fb7185;
}

.stat-card span {
	color: color-mix(in oklch, currentColor 68%, transparent);
	font-size: 0.92rem;
	line-height: 1.5;
}

.content-section {
	display: flex;
	flex-direction: column;
	gap: 2rem;
	scroll-margin-top: 2rem;
}

.section-heading {
	max-width: 45rem;
}

.section-heading h2 {
	font-size: clamp(2.75rem, 6vw, 5.5rem);
	margin-top: 0.65rem;
}

.section-heading p:not(.section-kicker) {
	color: color-mix(in oklch, currentColor 68%, transparent);
	font-size: 1.04rem;
	line-height: 1.75;
	margin: 1rem 0 0;
}

.section-heading code {
	background: color-mix(in oklch, currentColor 8%, transparent);
	border-radius: 0.35rem;
	font-size: 0.92em;
	padding: 0.14rem 0.3rem;
}

.story-grid {
	grid-template-columns: repeat(2, minmax(0, 1fr));
}

.story-card,
.company-card,
.source-card {
	padding: 1.35rem;
}

.story-card span,
.appearance-item span,
.source-card > div:first-child p,
.company-meta {
	color: #0f766e;
	font-size: 0.78rem;
	font-weight: 800;
	letter-spacing: 0.09em;
	line-height: 1.25;
	margin: 0;
	text-transform: uppercase;
}

:global([data-theme="dark"]) .story-card span,
:global([data-theme="dark"]) .appearance-item span,
:global([data-theme="dark"]) .source-card > div:first-child p,
:global([data-theme="dark"]) .company-meta {
	color: #5eead4;
}

.story-card h3,
.company-card h3,
.music-panel h3,
.source-card h3,
.timeline-item h3 {
	color: currentColor;
	font-family: Georgia, "Times New Roman", serif;
	font-size: 1.75rem;
	font-weight: 400;
	letter-spacing: 0;
	line-height: 1.15;
	margin: 0.55rem 0 0;
}

.story-card p,
.company-card p:not(.company-meta),
.source-card p,
.timeline-item p,
.music-panel li {
	color: color-mix(in oklch, currentColor 66%, transparent);
	font-size: 0.98rem;
	line-height: 1.7;
	margin: 1rem 0 0;
}

.timeline-list {
	border-top: 1px solid color-mix(in oklch, currentColor 14%, transparent);
}

.timeline-item {
	border-bottom: 1px solid color-mix(in oklch, currentColor 14%, transparent);
	display: grid;
	gap: 1.5rem;
	grid-template-columns: minmax(6.5rem, 0.3fr) minmax(0, 1fr);
	padding: 1.3rem 0;
}

.timeline-item time {
	color: #be123c;
	font-family: Georgia, "Times New Roman", serif;
	font-size: 1.45rem;
	line-height: 1.1;
}

:global([data-theme="dark"]) .timeline-item time {
	color: #fb7185;
}

.timeline-item h3 {
	margin-top: 0;
}

.timeline-item p {
	margin-top: 0.35rem;
	max-width: 48rem;
}

.company-grid {
	grid-template-columns: repeat(3, minmax(0, 1fr));
}

.company-card {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	min-height: 17rem;
}

.company-card p:not(.company-meta) {
	margin: 0;
}

.company-card a {
	color: currentColor;
	font-size: 0.92rem;
	font-weight: 800;
	margin-top: auto;
	text-decoration: underline;
	text-decoration-color: color-mix(in oklch, currentColor 28%, transparent);
	text-underline-offset: 0.22em;
}

.company-card a:hover {
	text-decoration-color: currentColor;
}

.media-layout {
	display: grid;
	gap: 1rem;
	grid-template-columns: minmax(0, 1fr) minmax(17rem, 0.55fr);
}

.appearance-list {
	display: grid;
	gap: 0.85rem;
}

.appearance-item {
	color: currentColor;
	display: grid;
	gap: 0.3rem;
	min-height: 7rem;
	padding: 1.1rem;
	text-decoration: none;
	transition:
		border-color 180ms ease,
		transform 180ms ease;
}

.appearance-item:hover {
	border-color: color-mix(in oklch, #0f766e 42%, transparent);
	transform: translateY(-1px);
}

.appearance-item strong {
	font-family: Georgia, "Times New Roman", serif;
	font-size: 1.45rem;
	font-weight: 400;
	line-height: 1.15;
}

.appearance-item small {
	color: color-mix(in oklch, currentColor 60%, transparent);
	font-size: 0.9rem;
	line-height: 1.5;
}

.music-panel {
	align-self: start;
	padding: 1.3rem;
}

.music-panel ul {
	list-style: none;
	margin: 1rem 0 0;
	padding: 0;
}

.music-panel li {
	border-top: 1px solid color-mix(in oklch, currentColor 12%, transparent);
	margin: 0;
	padding: 0.9rem 0;
}

.music-panel li:first-child {
	border-top: 0;
	padding-top: 0;
}

.source-summary {
	background: #18201f;
	border-radius: 0.5rem;
	color: #f8f6ef;
	display: grid;
	gap: 1px;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	overflow: hidden;
}

.source-summary div {
	background: color-mix(in oklch, #18201f 92%, #0f766e);
	display: flex;
	flex-direction: column;
	gap: 0.35rem;
	min-height: 8rem;
	padding: 1.25rem;
}

.source-summary strong {
	font-family: Georgia, "Times New Roman", serif;
	font-size: clamp(1.7rem, 4vw, 3rem);
	font-weight: 400;
	line-height: 1;
}

.source-summary span {
	color: color-mix(in oklch, #f8f6ef 66%, transparent);
	font-size: 0.9rem;
	line-height: 1.45;
}

.source-grid {
	grid-template-columns: repeat(2, minmax(0, 1fr));
}

.source-card {
	display: flex;
	flex-direction: column;
	gap: 1.1rem;
}

.source-card h3 {
	margin-top: 0.25rem;
}

.source-card p:not(:first-child) {
	margin: 0;
}

.source-card dl {
	border-top: 1px solid color-mix(in oklch, currentColor 12%, transparent);
	display: grid;
	gap: 0.75rem;
	margin: 0;
	padding-top: 1rem;
}

.source-card dl > div {
	align-items: baseline;
	display: flex;
	gap: 1rem;
	justify-content: space-between;
}

.source-card dt {
	color: color-mix(in oklch, currentColor 52%, transparent);
	font-size: 0.82rem;
	font-weight: 700;
}

.source-card dd {
	color: currentColor;
	font-size: 0.9rem;
	margin: 0;
	text-align: right;
}

@media (max-width: 900px) {
	.dossier-page {
		gap: 4rem;
		margin-top: -2.5rem;
	}

	.hero-section,
	.media-layout {
		grid-template-columns: 1fr;
	}

	.hero-section {
		min-height: 0;
	}

	.hero-copy {
		padding-bottom: 0;
	}

	.portrait-panel {
		max-width: 28rem;
		justify-self: start;
	}

	.stat-grid,
	.company-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (max-width: 640px) {
	.dossier-page {
		gap: 3.25rem;
	}

	.hero-copy h1 {
		font-size: clamp(3.15rem, 18vw, 5rem);
	}

	.hero-actions a {
		flex: 1 1 8rem;
		justify-content: center;
	}

	.stat-grid,
	.story-grid,
	.company-grid,
	.source-grid,
	.source-summary {
		grid-template-columns: 1fr;
	}

	.timeline-item {
		gap: 0.55rem;
		grid-template-columns: 1fr;
	}

	.source-card dl > div {
		align-items: flex-start;
		flex-direction: column;
		gap: 0.2rem;
	}

	.source-card dd {
		text-align: left;
	}
}
</style>
