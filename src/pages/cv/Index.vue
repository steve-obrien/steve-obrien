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
		title: 'Engineering and technical leadership',
		text: 'Hands-on software engineering, system design, and rapid prototyping, backed by experience leading teams and delivering products for founders and larger organisations.',
	},
	{
		title: 'AI systems and strategy',
		text: 'Building AI applications with the OpenAI, Anthropic, and OpenRouter APIs, including document search, evidence discovery, and question answering. Connecting technical possibilities to useful business applications.',
	},
	{
		title: 'Product and platform engineering',
		text: 'Turning founders’ ideas into working technology across healthcare, finance, and aerospace, with experience spanning SaaS, connected devices, computer vision, and application frameworks.',
	},
	{
		title: 'Company leadership and advisory',
		text: 'Practical experience running a small technology company through acquisition and supporting larger businesses. Helping leaders weigh technology investment, delivery risk, and commercial priorities.',
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
		title: 'AI APIs, systems, and testing',
		items: ['OpenAI API', 'Anthropic API', 'OpenRouter API', 'LLM applications', 'Agent systems', 'Embeddings', 'Vector search', 'Knowledge graphs', 'Vitest', 'Playwright'],
	},
];

const experience = [
	{
		period: '2026—present',
		role: 'Engineer, Fractional CTO & AI Product Builder',
		company: 'Independent',
		summary: 'Helping organisations make sound technology decisions and turn AI opportunities into useful, well-engineered products.',
		items: [
			'Designing and building AI applications using the OpenAI, Anthropic, and OpenRouter APIs, alongside developer workflows and collaborative product experiences.',
			'Advising founders and leadership teams on product direction, architecture, delivery, and AI adoption.',
			'Researching intelligence across artificial intelligence, neuroscience, and cognitive systems.',
		],
	},
	{
		period: '2009—2026',
		role: 'Founder, CEO & CTO',
		company: 'Newicon Ltd',
		summary: 'Founded and ran a Bristol technology company whose core business was designing and building products for founders and established organisations, combining hands-on engineering with CEO and CTO responsibilities through to acquisition.',
		items: [
			'Built technology for founders across many products and businesses, turning ideas into software, connected systems, and working products.',
			'Led technology direction, product strategy, solution architecture, client partnerships, and complex project delivery.',
			'Grew Newicon to £1.5m turnover alongside a £0.5m digital marketing business that became Flex Digital.',
			'Delivered work across healthcare, financial services, and aerospace, supporting founders and larger organisations. Disclosed clients included Airbus, Thales, UWE, and Palladium.',
			'Guided Newicon into its 2025 acquisition by Linebreak and continued as CTO through January 2026.',
		],
	},
	{
		period: 'Sep 2006—Jun 2009',
		role: 'Systems Engineer (Modelling & Simulation)',
		company: 'Airbus UK, Filton',
		summary: 'Responsible for developing the modelling and simulation platforms used by the Airbus landing gear team.',
		items: [
			'Designed and built the AutoTR desktop application and its code interpreter, enabling test engineers to write automated tests for landing gear systems.',
			'AutoTR supported repeatable testing from fully simulated “-1” environments with no physical hardware through to hardware-in-the-loop test rigs, and received an Airbus international Award for Excellence.',
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
		eyebrow: 'Applied AI · Due diligence',
		title: 'AI for document search and legal questions',
		text: 'Designed and built an AI tool to support due diligence: searching large documents, identifying useful evidence, and helping users understand and answer legal questions about the material.',
	},
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
						<p class="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Curriculum vitae</p>
						<h1 class="font-serif text-5xl font-light tracking-tight sm:text-6xl">Steve O'Brien</h1>
						<p class="mt-5 text-xl font-medium leading-relaxed text-muted-foreground sm:text-2xl">
							Engineer <span aria-hidden="true">·</span> Founder <span aria-hidden="true">·</span> CEO & CTO
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
					I've spent two decades building real-world software and AI systems. I combine hands-on engineering with the experience of building products for founders, running a technology company through acquisition, and helping larger organisations solve technical problems.
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
						My experience comes from more than two decades of engineering and building technology for other people’s businesses. At Newicon, that was our business: founders and established organisations paid us to turn their ideas and difficult technical problems into working products.
					</p>
					<p>
						I worked as founder, CEO, and CTO, running a small company while helping clients across healthcare, finance, and aerospace. That gave me practical experience of commercial decisions, client relationships, delivery, and the work involved in preparing a technology business for acquisition.
					</p>
					<p>
						I remain deeply technical: I design systems, write software, and work from the underlying engineering principles. My AI work includes a due diligence tool for searching large documents, finding useful evidence, and exploring legal questions. I bring that engineering experience to advising CEOs and founders on technology, AI, and product investment.
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
