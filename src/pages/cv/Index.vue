<script setup>
const highlights = [
	{
		value: '18 years',
		label: 'Building and leading Newicon',
	},
	{
		value: '2025',
		label: 'Successful company acquisition',
	},
	{
		value: '20+ years',
		label: 'Engineering and software experience',
	},
	{
		value: '£2m',
		label: 'Combined turnover across Newicon and the digital marketing business',
	},
];

const capabilities = [
	{
		title: 'Fractional CTO leadership',
		text: 'Hands-on technology strategy, architecture, and rapid prototyping—especially for ideas that have not been built before—combined with delivery leadership and pragmatic decisions that keep today’s build aligned with tomorrow’s scale.',
	},
	{
		title: 'AI systems and strategy',
		text: 'Practical AI products, intelligent workflows, human–AI collaboration, and the infrastructure and architecture needed to move from experiments to dependable systems.',
	},
	{
		title: 'Product and platform engineering',
		text: 'Turning ambitious ideas into robust software products across cloud platforms, SaaS, connected systems, and complex digital services.',
	},
	{
		title: 'Founder-level perspective',
		text: 'Balancing product, commercial, operational, and technical priorities with the accountability of someone who has built and sold a company.',
	},
];

const technicalDepth = [
	{
		title: 'Preferred stacks today',
		items: ['TypeScript', 'Vue 3', 'Node.js', 'Fastify', 'Laravel', 'PHP'],
	},
	{
		title: 'Frontend and real-time',
		items: ['React', 'Next.js', 'Web Components', 'WebSockets', 'SSR', 'Pinia'],
	},
	{
		title: 'Backend and data',
		items: ['PostgreSQL', 'MariaDB / MySQL', 'REST APIs', 'Background workers', 'Authentication', 'Stripe'],
	},
	{
		title: 'AI and engineering quality',
		items: ['LLM applications', 'Agent systems', 'Embeddings', 'Vector search', 'Knowledge graphs', 'Vitest', 'Playwright'],
	},
];

const experience = [
	{
		period: '2026—present',
		role: 'Fractional CTO, AI Systems Architect & Product Builder',
		company: 'Independent',
		summary: 'Helping organisations make sound technology decisions and turn AI opportunities into useful, well-engineered products.',
		items: [
			'Designing practical AI systems, developer workflows, and collaborative product experiences.',
			'Advising founders and leadership teams on product direction, architecture, delivery, and AI adoption.',
			'Researching intelligence across artificial intelligence, neuroscience, and cognitive systems.',
		],
	},
	{
		period: '2009—2026',
		role: 'Founder, CEO & CTO',
		company: 'Newicon Ltd',
		summary: 'Built and led a Bristol software, AI engineering, IoT, cloud, and product studio from its early-stage launch through acquisition.',
		items: [
			'Led technology direction, product strategy, solution architecture, client partnerships, and complex project delivery.',
			'Grew Newicon to £1.5m turnover alongside a £0.5m digital marketing business that became Flex Digital.',
			'Worked across regulated and technically demanding sectors, with disclosed clients including Airbus, Thales, UWE, and Palladium.',
			'Guided Newicon into its 2025 acquisition by Linebreak and continued as CTO through January 2026.',
		],
	},
	{
		period: 'Sep 2006—Jun 2009',
		role: 'Systems Engineer (Modelling & Simulation)',
		company: 'Airbus UK, Filton',
		summary: 'Hired into a full-time engineering role focused on modelling and simulation for Airbus UK.',
		items: [
			'Designed and built the code interpreter for AutoTR, an automated simulation-testing tool used across landing-gear test rigs—from fully simulated “-1” environments with no physical hardware to hardware-in-the-loop testing.',
			'AutoTR automated repeatable aircraft landing-gear testing and received an Airbus international Award for Excellence.',
			'Built LGTest, an internal PHP and MySQL web application that provided global configuration control and immediate access to landing-gear test results in the formats teams required.',
			'LGTest replaced a labour-intensive process in which test data was manually compiled, burned to DVDs, and posted to colleagues around the world.',
		],
	},
	{
		period: 'Sep 2002—Sep 2006',
		role: 'Technical Apprentice',
		company: 'Airbus UK, Filton',
		summary: 'Completed Airbus’s four-year Technical Apprenticeship before progressing into a full Systems Engineer position.',
		items: [
			'Named Airbus Apprentice of the Year three years in succession.',
			'Studied Aeronautical Engineering, Manufacturing Engineering, CAD, and computing.',
			'Completed an HND in Aeronautical Engineering alongside practical engineering training.',
		],
	},
];

const selectedWork = [
	{
		eyebrow: 'Framework engineering · Financial services',
		title: 'Application frameworks from first principles',
		text: 'Designed and built capable application frameworks from scratch that powered complex, regulated financial services products, including the Hartley pension portal, with full-stack architecture, real-time WebSocket communication, data systems, authentication, and operational infrastructure.',
	},
	{
		eyebrow: 'Company building',
		title: 'Newicon: from startup to acquisition',
		text: 'Founded and led a design-led technology company for 18 years, combining commercial leadership with hands-on technical direction before its acquisition in 2025.',
	},
	{
		eyebrow: 'Health technology',
		title: 'EarSwitch in-ear monitoring platform',
		text: 'Newicon led software development across two phases of an in-ear health-monitoring system that secured £1.2m in investment and was selected for the UK Innovative Devices Access Pathway.',
	},
	{
		eyebrow: 'Computer vision · Aviation maintenance',
		title: 'Airbus Oleo measurement app',
		text: 'Led the development of an early iPhone computer-vision application that used the camera, OpenCV edge detection, and object recognition to measure a landing-gear Oleo shock absorber and give engineers an immediate pass/fail result.',
		url: 'https://newicon.net/work/airbus-oleo-measurement-app',
	},
	{
		eyebrow: 'Current research and development',
		title: 'Practical AI and adaptive software',
		text: 'Exploring AI-assisted development, real-time collaboration, adaptive documentation, and systems informed by how biological and artificial intelligence learn.',
	},
];

const recognition = [
	'Airbus Apprentice of the Year, three consecutive years',
	'Airbus international Award for Excellence, awarded for AutoTR',
	'Insider South West 42 under 42, 2022 cohort',
	'Bristol Technology Festival speaker, including a 2022 talk on the future of IoT',
	'Podcast guest on technology, leadership, innovation, and company building',
];

/**
 * Opens the browser print dialog so the web CV can be saved or shared as a PDF.
 *
 * @returns {void}
 */
function printCv() {
	window.print();
}
</script>

<template>
	<SteveLayout bg-class="cv-page-background">
		<article class="cv-document mx-auto max-w-5xl">
			<header class="cv-hero border-b border-border pb-12">
				<div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
					<div class="max-w-3xl">
						<p class="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Executive CV</p>
						<h1 class="font-serif text-5xl font-light tracking-tight sm:text-6xl">Steve O'Brien</h1>
						<p class="mt-5 text-xl font-medium leading-relaxed text-muted-foreground sm:text-2xl">
							CTO <span aria-hidden="true">·</span> AI Systems Architect <span aria-hidden="true">·</span> Technical Founder
						</p>
					</div>
					<div class="cv-actions flex flex-wrap gap-3">
						<button
							type="button"
							class="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
							@click="printCv"
						>
							Print / save PDF
						</button>
						<a
							href="https://www.linkedin.com/in/stevenaobrien/"
							target="_blank"
							rel="noopener noreferrer"
							class="rounded-full border border-border px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
						>
							LinkedIn
						</a>
					</div>
				</div>

				<blockquote class="cv-positioning mt-12 max-w-4xl border-l-2 border-foreground pl-6 font-serif text-2xl font-light leading-relaxed sm:text-3xl">
					I've spent two decades building real-world software systems. Today, I'm focused on understanding intelligence itself, both artificial and biological, and applying those insights to create practical AI systems that solve meaningful problems.
				</blockquote>

				<div class="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
					<span>Bristol, United Kingdom</span>
					<a href="https://steve-obrien.com" class="hover:text-foreground">steve-obrien.com</a>
					<a href="https://github.com/steve-obrien" target="_blank" rel="noopener noreferrer" class="hover:text-foreground">github.com/steve-obrien</a>
				</div>
			</header>

			<section class="cv-section grid gap-10 py-12 lg:grid-cols-[0.72fr_1.28fr]" aria-labelledby="profile-heading">
				<div>
					<p class="cv-kicker">Profile</p>
					<h2 id="profile-heading" class="cv-heading">Technology leadership grounded in building</h2>
				</div>
				<div class="space-y-5 text-lg leading-relaxed text-muted-foreground">
					<p>
						Founder, CTO, and hands-on systems architect with more than two decades of engineering and software experience. I work at the point where technology strategy, product thinking, and delivery meet.
					</p>
					<p>
						After building Newicon over 18 years and guiding the company through a successful acquisition, I now help founders and leadership teams shape technology strategy, de-risk difficult decisions, and create practical AI-enabled products.
					</p>
					<p>
						I’m at my best building and prototyping things that have not been done before. In fractional CTO and technical advisory roles, I roll up my sleeves and rapidly turn ambitious, ambiguous ideas into working prototypes that can be tested today and useful products a team can ship next week. I choose architecture for the stage the business is actually at—starting with the simplest system that works, while preserving a clear path to the resilience, scale, and operational maturity it will need tomorrow.
					</p>
				</div>
			</section>

			<section class="cv-section border-y border-border py-10" aria-label="Career highlights">
				<div class="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
					<div v-for="highlight in highlights" :key="highlight.label" class="bg-card p-6">
						<strong class="block font-serif text-3xl font-light">{{ highlight.value }}</strong>
						<span class="mt-2 block text-sm leading-relaxed text-muted-foreground">{{ highlight.label }}</span>
					</div>
				</div>
			</section>

			<section class="cv-section py-12" aria-labelledby="capabilities-heading">
				<div class="mb-8 max-w-2xl">
					<p class="cv-kicker">Core capabilities</p>
					<h2 id="capabilities-heading" class="cv-heading">Where I create the most value</h2>
				</div>
				<div class="grid gap-5 sm:grid-cols-2">
					<article v-for="capability in capabilities" :key="capability.title" class="rounded-2xl border border-border bg-card p-6">
						<h3 class="text-lg font-semibold">{{ capability.title }}</h3>
						<p class="mt-3 leading-relaxed text-muted-foreground">{{ capability.text }}</p>
					</article>
				</div>
			</section>

			<section class="cv-section border-t border-border py-12" aria-labelledby="technical-depth-heading">
				<div class="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
					<div>
						<p class="cv-kicker">Technical depth</p>
						<h2 id="technical-depth-heading" class="cv-heading">Grounded in fundamentals</h2>
					</div>
					<div class="space-y-5 text-lg leading-relaxed text-muted-foreground">
						<p>
							Frameworks come and go; the fundamentals do not. I work from first principles across system design, data modelling, APIs, security, real-time communication, testing, deployment, and failure modes.
						</p>
						<p>
							I have designed and built capable application frameworks from scratch, including systems that powered regulated financial services products such as the Hartley pension portal.
						</p>
					</div>
				</div>
				<div class="mt-9 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
					<article v-for="area in technicalDepth" :key="area.title" class="bg-card p-6">
						<h3 class="font-semibold">{{ area.title }}</h3>
						<ul class="mt-4 flex flex-wrap gap-2">
							<li
								v-for="item in area.items"
								:key="item"
								class="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
							>
								{{ item }}
							</li>
						</ul>
					</article>
				</div>
			</section>

			<section class="cv-section border-t border-border py-12" aria-labelledby="experience-heading">
				<div class="mb-10">
					<p class="cv-kicker">Experience</p>
					<h2 id="experience-heading" class="cv-heading">Selected career</h2>
				</div>
				<div class="space-y-10">
					<article
						v-for="position in experience"
						:key="position.period"
						class="cv-experience grid gap-5 border-l border-border pl-6 md:grid-cols-[10rem_1fr] md:border-l-0 md:pl-0"
					>
						<time class="text-sm font-semibold text-muted-foreground">{{ position.period }}</time>
						<div>
							<p class="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">{{ position.company }}</p>
							<h3 class="mt-2 font-serif text-2xl font-light sm:text-3xl">{{ position.role }}</h3>
							<p class="mt-4 max-w-3xl leading-relaxed text-muted-foreground">{{ position.summary }}</p>
							<ul class="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
								<li v-for="item in position.items" :key="item" class="flex gap-3">
									<span class="mt-[0.7em] h-1 w-1 shrink-0 rounded-full bg-foreground" aria-hidden="true"></span>
									<span>{{ item }}</span>
								</li>
							</ul>
						</div>
					</article>
				</div>
			</section>

			<section class="cv-section border-t border-border py-12" aria-labelledby="work-heading">
				<div class="mb-8 max-w-2xl">
					<p class="cv-kicker">Selected work</p>
					<h2 id="work-heading" class="cv-heading">Evidence of impact</h2>
				</div>
				<div class="grid gap-6 sm:grid-cols-2">
					<article v-for="item in selectedWork" :key="item.title" class="cv-work-card border-t-2 border-foreground pt-5">
						<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{{ item.eyebrow }}</p>
						<h3 class="mt-4 text-xl font-semibold leading-snug">{{ item.title }}</h3>
						<p class="mt-3 text-sm leading-relaxed text-muted-foreground">{{ item.text }}</p>
						<a
							v-if="item.url"
							:href="item.url"
							target="_blank"
							rel="noopener noreferrer"
							class="mt-4 inline-flex text-sm font-semibold underline decoration-border underline-offset-4 hover:decoration-foreground"
						>
							Read the case study
						</a>
					</article>
				</div>
			</section>

			<section class="cv-section grid gap-10 border-t border-border py-12 lg:grid-cols-[0.72fr_1.28fr]" aria-labelledby="recognition-heading">
				<div>
					<p class="cv-kicker">Recognition & public voice</p>
					<h2 id="recognition-heading" class="cv-heading">Sharing experience</h2>
				</div>
				<ul class="space-y-4 text-muted-foreground">
					<li v-for="item in recognition" :key="item" class="flex gap-4 border-b border-border pb-4 last:border-0">
						<span class="font-serif text-xl text-foreground" aria-hidden="true">↗</span>
						<span class="leading-relaxed">{{ item }}</span>
					</li>
				</ul>
			</section>

			<section class="cv-contact rounded-3xl bg-primary px-7 py-10 text-primary-foreground sm:px-10 sm:py-12" aria-labelledby="contact-heading">
				<p class="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">Work together</p>
				<div class="mt-5 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
					<div class="max-w-2xl">
						<h2 id="contact-heading" class="font-serif text-3xl font-light sm:text-4xl">Need experienced technical leadership?</h2>
						<p class="mt-4 text-lg leading-relaxed opacity-75">
							I’m open to fractional CTO, technical advisory, AI strategy, and selected product-building engagements.
						</p>
					</div>
					<a
						href="https://www.linkedin.com/in/stevenaobrien/"
						target="_blank"
						rel="noopener noreferrer"
						class="cv-contact-link shrink-0 rounded-full bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary"
					>
						Connect on LinkedIn
					</a>
				</div>
			</section>
		</article>
	</SteveLayout>
</template>

<style scoped>
.cv-page-background {
	background:
		radial-gradient(circle at 50% 0%, color-mix(in oklch, var(--foreground) 5%, transparent), transparent 28rem),
		var(--background);
}

.cv-document {
	padding-bottom: 2rem;
}

.cv-kicker {
	margin-bottom: 0.75rem;
	font-size: 0.75rem;
	font-weight: 700;
	letter-spacing: 0.18em;
	text-transform: uppercase;
	color: var(--muted-foreground);
}

.cv-heading {
	font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
	font-size: clamp(2rem, 4vw, 2.75rem);
	font-weight: 300;
	line-height: 1.1;
	letter-spacing: -0.025em;
}

@media print {
	@page {
		size: A4;
		margin: 14mm;
	}

	:global(html) {
		font-size: 10pt;
		color-scheme: light;
	}

	:global(body) {
		background: white !important;
		color: #111 !important;
	}

	:global(body > #app > div > header),
	:global(body > #app > div > footer),
	.cv-actions,
	.cv-contact-link {
		display: none !important;
	}

	.cv-document {
		max-width: none;
		padding: 0;
	}

	.cv-hero {
		padding-bottom: 7mm;
	}

	.cv-positioning {
		margin-top: 7mm;
		font-size: 18pt;
	}

	.cv-section {
		break-inside: auto;
		padding-top: 7mm;
		padding-bottom: 7mm;
	}

	.cv-experience,
	.cv-work-card,
	.cv-contact {
		break-inside: avoid;
	}

	.cv-contact {
		background: #111 !important;
		color: white !important;
		print-color-adjust: exact;
		-webkit-print-color-adjust: exact;
	}

	a {
		color: inherit !important;
		text-decoration: none !important;
	}
}
</style>
