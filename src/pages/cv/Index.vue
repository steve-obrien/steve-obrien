<script setup>
import meImage from '../../assets/me.jpeg';
import PrintCv from './PrintCv.vue';

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
		text: 'Generative AI product development with the OpenAI, Anthropic, and OpenRouter APIs, including document search, evidence discovery, and question answering. Connecting technical possibilities to useful business applications.',
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

const technicalApproach = 'I have deep technical experience across many languages and stacks. I work from fundamental programming concepts and choose the best tool for the job, understanding when Rust, Go, Node.js, or C best suits the problem, performance requirements, and team.';
const newiconTechnology = 'Built products and platforms primarily with PHP, Node.js, and web technologies.';
const airbusTechnology = 'Developed modelling, simulation, and test software using C++, MATLAB, and .NET.';
const frameworkSummary = 'Designed and built my own full-stack frameworks from scratch in PHP and TypeScript, covering data systems, authentication, real-time WebSockets, and operational infrastructure. Applications include regulated financial services products such as the Hartley pension portal.';

const technicalDepth = [
	{
		title: 'Languages',
		items: ['JavaScript', 'TypeScript', 'PHP', 'C++', 'MATLAB', 'Python'],
	},
	{
		title: 'Frameworks and runtimes',
		items: ['Node.js', '.NET', 'Vue 3', 'React', 'Next.js', 'Fastify', 'Laravel'],
	},
	{
		title: 'Frontend and real-time',
		items: ['Web Components', 'WebSockets', 'SSR', 'Pinia'],
	},
	{
		title: 'Backend and data',
		items: ['PostgreSQL', 'MariaDB / MySQL', 'REST APIs', 'Background workers', 'Authentication', 'Stripe'],
	},
	{
		title: 'AI APIs and systems',
		items: ['OpenAI API', 'Anthropic API', 'OpenRouter API', 'LLM applications', 'Open-weight LLMs', 'Agent systems', 'Embeddings', 'Vector search', 'Knowledge graphs'],
	},
	{
		title: 'Engineering tools and delivery',
		items: ['Git', 'Docker', 'Linux', 'CI/CD', 'DevOps', 'Automated testing', 'Vitest', 'Playwright'],
	},
];

const experience = [
	{
		period: '2026—present',
		role: 'Engineer, Fractional CTO & AI Product Builder',
		company: 'Independent',
		printItems: [
			'Building db3.ai, a TypeScript framework for AI applications, with model orchestration, agents, provider failover, and usage and cost tracking.',
			'Developing DOM Studio, a Vue UI system for AI conversations and agent workflows, and GrowthScout, an AI-assisted search intelligence and publishing product.',
			'Advising founders and leadership teams on product direction, architecture, delivery, and AI adoption.',
		],
		summary: 'Helping organisations make sound technology decisions and turn AI opportunities into useful, well-engineered products.',
		items: [
			'Building db3.ai, a TypeScript application framework for AI features, including model orchestration, agents, provider failover, and usage and cost tracking.',
			'Developing and maintaining DOM Studio (getdom.studio), a Vue UI system with components and interaction patterns for AI conversations and agent workflows.',
			'Leading GrowthScout (growthscout.io), an AI-assisted SaaS product spanning site analysis, AI visibility research, content planning, and publishing.',
			'Advising founders and leadership teams on product direction, architecture, delivery, and AI adoption.',
		],
	},
	{
		period: '2009—2026',
		role: 'Founder, CEO & CTO',
		company: 'Newicon Ltd',
		printItems: [
			'Founded and led a Bristol technology company, building products for founders and established organisations across healthcare, finance, and aerospace.',
			newiconTechnology,
			'Combined CEO and CTO responsibilities with hands-on architecture, engineering, CI/CD, automated testing, and DevOps. Clients included Airbus, Thales, UWE, and Palladium.',
			'Grew Newicon to £1.5m turnover alongside a £0.5m digital marketing business that became Flex Digital.',
			'Led Newicon through its 2025 acquisition by Linebreak; continued as CTO through January 2026.',
		],
		summary: 'Founded and ran a Bristol technology company whose core business was designing and building products for founders and established organisations, combining hands-on engineering with CEO and CTO responsibilities through to acquisition.',
		items: [
			'Built technology for founders across many products and businesses, turning ideas into software, connected systems, and working products.',
			newiconTechnology,
			'Led technology direction, product strategy, solution architecture, client partnerships, and complex project delivery.',
			'Responsible for software architecture, CI/CD, automated testing, and DevOps across client products while remaining hands-on in design and implementation.',
			'Grew Newicon to £1.5m turnover alongside a £0.5m digital marketing business that became Flex Digital.',
			'Delivered work across healthcare, financial services, and aerospace, supporting founders and larger organisations. Disclosed clients included Airbus, Thales, UWE, and Palladium.',
			'Guided Newicon into its 2025 acquisition by Linebreak and continued as CTO through January 2026.',
		],
	},
	{
		period: 'Sep 2006—Jun 2009',
		role: 'Systems Engineer (Modelling & Simulation)',
		company: 'Airbus UK, Filton',
		printRole: 'Systems Engineer, Modelling & Simulation',
		printItems: [
			airbusTechnology,
			'Designed AutoTR and its code interpreter to automate landing-gear testing, from simulation to hardware-in-the-loop rigs. Received an Airbus international Award for Excellence.',
			'Built LGTest (PHP/MySQL) to give global teams immediate access to controlled test results, replacing manually compiled data sent around the world on DVDs.',
		],
		summary: 'Responsible for developing the modelling and simulation platforms used by the Airbus landing gear team.',
		items: [
			airbusTechnology,
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
		printItems: [
			'Completed a four-year Technical Apprenticeship and HND in Aeronautical Engineering. Named Airbus Apprentice of the Year three years in succession.',
		],
		summary: 'Completed Airbus’s four-year Technical Apprenticeship before progressing into a full Systems Engineer position.',
		items: [
			'Studied Aeronautical Engineering, Manufacturing Engineering, CAD, and computing.',
			'Completed an HND in Aeronautical Engineering alongside practical engineering training.',
			'Named Airbus Apprentice of the Year three years in succession.',
		],
	},
];

const selectedWork = [
	{
		eyebrow: 'Applied AI · Acquisition due diligence',
		title: 'Internal due diligence AI agent',
		printText: 'Built an internal agent for Newicon’s acquisition, using embeddings, vector search, retrieval-augmented generation (RAG), and OpenAI function calling to find evidence across company documents and policies.',
		text: 'Built an internal AI agent to support due diligence for Newicon’s acquisition. It used embeddings and a vector database to index company data, policies, and documents, then combined retrieval-augmented generation (RAG) with OpenAI function calling to surface evidence for due diligence questions.',
	},
	{
		eyebrow: 'Framework engineering · Financial services',
		title: 'Application frameworks from first principles',
		printText: frameworkSummary,
		text: frameworkSummary,
	},
	{
		eyebrow: 'Company building',
		title: 'Newicon: from startup to acquisition',
		text: 'Founded and led a design-led technology company for 18 years, combining commercial leadership with hands-on technical direction before its acquisition in 2025.',
	},
	{
		eyebrow: 'Health technology',
		title: 'EarSwitch assistive communication device',
		printText: 'Newicon built data capture and OpenCV analysis for Bath University research, then integrated Python software with the in-ear device and a caregiver app. The project secured £1.2m investment and UK Innovative Devices Access Pathway selection.',
		text: 'Newicon developed data capture and OpenCV-assisted analysis for Bath University research, then integrated Python software with the in-ear device and a caregiver configuration app. The project secured £1.2m in investment and was selected for the UK Innovative Devices Access Pathway.',
		url: 'https://newicon.net/work/earswitch-software-development',
	},
	{
		eyebrow: 'Computer vision · Aviation maintenance',
		title: 'Airbus Oleo measurement app',
		printText: 'Led an early iPhone computer-vision app using OpenCV to measure landing-gear shock absorbers and give engineers an immediate pass/fail result.',
		text: 'Led the development of an early iPhone computer-vision application that used the camera, OpenCV edge detection, and object recognition to measure a landing-gear Oleo shock absorber and give engineers an immediate pass/fail result.',
		url: 'https://newicon.net/work/airbus-oleo-measurement-app',
	},
	{
		eyebrow: 'AI product engineering · SaaS',
		title: 'GrowthScout search intelligence platform',
		printText: 'Leading product and full-stack TypeScript engineering for AI visibility tracking, keyword research, website audits, and content planning through to writing and publishing.',
		text: 'Building GrowthScout, an AI-assisted SaaS product that tracks AI visibility, researches keywords, audits websites, and connects a 30-day content plan to article writing and publishing. I lead product direction and work hands-on across full-stack TypeScript engineering, data integrations, background jobs, testing, and deployment.',
		url: 'https://growthscout.io',
		linkLabel: 'Explore GrowthScout',
	},
];

const recognition = [
	'Airbus international Award for Excellence, awarded for AutoTR',
	'Insider South West 42 under 42, 2022 cohort',
	'Bristol Technology Festival speaker, including a 2022 talk on the future of IoT',
	'Podcast guest on technology, leadership, innovation, and company building',
];

const interests = [
	'Following the Thousand Brains Project',
	'Robotics',
	'Coding for fun',
	'Playing guitar and piano',
];

/**
 * Opens the browser print dialog using the concise, two-page CV layout.
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
					<div class="cv-identity flex max-w-3xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<p class="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Curriculum vitae</p>
							<h1 class="font-serif text-5xl font-light tracking-tight sm:text-6xl">Steve O'Brien</h1>
							<p class="mt-5 text-xl font-medium leading-relaxed text-muted-foreground sm:text-2xl">
								Engineer <span aria-hidden="true">·</span> Founder <span aria-hidden="true">·</span> CEO & CTO
							</p>
						</div>
						<img :src="meImage" alt="Portrait of Steve O'Brien" class="cv-portrait h-24 w-24 shrink-0 rounded-2xl object-cover sm:h-28 sm:w-28" width="112" height="112" />
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
					I've spent two decades building real-world software and AI systems. I combine hands-on engineering with experience building products, solving complex technical problems for larger organisations, and running a technology company through acquisition.
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
						I remain deeply technical: I design systems, write software, and work from the underlying engineering principles. I bring that engineering experience to advising CEOs and founders on technology, AI, as well as educating team members and customers.
					</p>
				</div>
			</section>

			<section class="cv-section border-y border-border py-10" aria-label="Career highlights">
				<div class="cv-highlights-grid grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
					<div v-for="highlight in highlights" :key="highlight.label" class="cv-print-item bg-card p-6">
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
				<div class="cv-capabilities-grid grid gap-5 sm:grid-cols-2">
					<article v-for="capability in capabilities" :key="capability.title" class="cv-print-item rounded-2xl border border-border bg-card p-6">
						<h3 class="text-lg font-semibold">{{ capability.title }}</h3>
						<p class="mt-3 leading-relaxed text-muted-foreground">{{ capability.text }}</p>
					</article>
				</div>
			</section>

			<section class="cv-section border-t border-border py-12" aria-labelledby="technical-depth-heading">
				<div class="cv-technical-intro grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
					<div>
						<p class="cv-kicker">Technical depth</p>
						<h2 id="technical-depth-heading" class="cv-heading">Grounded in fundamentals</h2>
					</div>
					<div class="space-y-5 text-lg leading-relaxed text-muted-foreground">
						<p>{{ technicalApproach }}</p>
						<p>
							I have designed and built my own full-stack frameworks from scratch in PHP and TypeScript, with products ranging from regulated pension portals for Curtis Banks and Hartley to a real-time AI recruitment interviewing platform.
						</p>
					</div>
				</div>
				<div class="cv-technical-grid mt-9 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
					<article v-for="area in technicalDepth" :key="area.title" class="cv-print-item bg-card p-6">
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
				<div class="cv-work-grid grid gap-6 sm:grid-cols-2">
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
							{{ item.linkLabel || 'Read the case study' }}
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
					<li v-for="item in recognition" :key="item" class="cv-print-item flex gap-4 border-b border-border pb-4 last:border-0">
						<span class="font-serif text-xl text-foreground" aria-hidden="true">↗</span>
						<span class="leading-relaxed">{{ item }}</span>
					</li>
				</ul>
			</section>

			<section class="cv-section cv-interests grid gap-10 border-t border-border py-10 lg:grid-cols-[0.72fr_1.28fr]" aria-labelledby="interests-heading">
				<div>
					<p class="cv-kicker">Interests</p>
					<h2 id="interests-heading" class="cv-heading">Beyond work</h2>
				</div>
				<ul class="grid gap-3 text-muted-foreground sm:grid-cols-2">
					<li v-for="interest in interests" :key="interest">{{ interest }}</li>
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
		<PrintCv
			:portrait="meImage"
			:experience="experience"
			:work="selectedWork"
			:technical-approach="technicalApproach"
			:technical-depth="technicalDepth"
			:recognition="recognition"
			:interests="interests"
		/>
	</SteveLayout>
</template>

<style scoped>
.cv-page-background {
	background: var(--background);
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
		margin: 14mm 16mm;
	}

	:global(html) {
		color-scheme: light;
	}

	:global(body),
	.cv-page-background {
		background: white !important;
		color: #20252b !important;
	}

	:global(.site-shell > header),
	:global(.site-shell > footer),
	.cv-document {
		display: none !important;
	}

	:global(.site-shell main) {
		max-width: none;
		padding: 0;
	}
}
</style>
