<script setup>
defineProps({
	portrait: { type: String, required: true },
	experience: { type: Array, required: true },
	work: { type: Array, required: true },
	technicalApproach: { type: String, required: true },
	technicalDepth: { type: Array, required: true },
	recognition: { type: Array, required: true },
	interests: { type: Array, required: true },
});
</script>

<template>
	<article class="print-cv" aria-label="Concise printable CV">
		<div class="print-page">
			<header class="print-header">
				<div>
					<p class="print-eyebrow">Curriculum vitae</p>
					<h1>Steve O'Brien</h1>
					<p class="print-role">Engineer · Founder · CEO & CTO</p>
				</div>
				<img :src="portrait" alt="Portrait of Steve O'Brien" width="88" height="88" />
			</header>
			<div class="print-contact">
				<span>Bristol, UK</span>
				<a href="https://steve-obrien.com">steve-obrien.com</a>
				<a href="https://github.com/steve-obrien">github.com/steve-obrien</a>
				<a href="https://www.linkedin.com/in/stevenaobrien/">linkedin.com/in/stevenaobrien</a>
			</div>
			<p class="print-profile">
				I build software, AI systems, and technology businesses. Over more than 20 years, I’ve combined hands-on engineering with product and commercial leadership across healthcare, finance, and aerospace. I founded Newicon and led it through acquisition. Today I build AI products and advise founders and leadership teams on technology and delivery.
			</p>

			<section class="print-section" aria-labelledby="print-experience-heading">
				<h2 id="print-experience-heading">Experience</h2>
				<article v-for="position in experience" :key="position.period" class="print-position">
					<div class="print-position-meta">
						<p class="print-company">{{ position.company }}</p>
						<p class="print-dates">{{ position.period.replace('—', ' - ') }}</p>
					</div>
					<h3>{{ position.printRole || position.role }}</h3>
					<ul>
						<li v-for="item in position.printItems" :key="item">{{ item }}</li>
					</ul>
				</article>
			</section>
			<footer class="print-footer">
				<span>Steve O'Brien · Curriculum vitae</span>
				<span>1 / 2</span>
			</footer>
		</div>

		<div class="print-page">
			<header class="print-running-header">
				<span>Steve O'Brien</span>
				<span>Selected work & technical depth</span>
			</header>
			<section class="print-section print-projects" aria-labelledby="print-projects-heading">
				<h2 id="print-projects-heading">Selected projects</h2>
				<template v-for="item in work" :key="item.title">
					<article v-if="item.printText" class="print-project">
						<h3>
							<a v-if="item.url" :href="item.url">{{ item.title }}</a>
							<template v-else>{{ item.title }}</template>
						</h3>
						<p>{{ item.printText }}</p>
					</article>
				</template>
			</section>

			<section class="print-section" aria-labelledby="print-skills-heading">
				<h2 id="print-skills-heading">Technical skills</h2>
				<p class="print-technical-approach">{{ technicalApproach }}</p>
				<dl class="print-skills">
					<div v-for="area in technicalDepth" :key="area.title">
						<dt>{{ area.title }}:</dt>
						<dd>{{ ' ' + area.items.join(' · ') }}</dd>
					</div>
				</dl>
			</section>

			<section class="print-section" aria-labelledby="print-recognition-heading">
				<h2 id="print-recognition-heading">Recognition & speaking</h2>
				<ul class="print-recognition">
					<!-- The first award is already included with the Airbus role on page one. -->
					<li v-for="item in recognition.slice(1)" :key="item">{{ item }}</li>
				</ul>
			</section>

			<section class="print-section print-interests" aria-labelledby="print-interests-heading">
				<h2 id="print-interests-heading">Interests</h2>
				<p>{{ interests.join(' · ') }}</p>
			</section>
			<footer class="print-footer">
				<a href="https://steve-obrien.com/cv">Full CV & project links: steve-obrien.com/cv</a>
				<span>2 / 2</span>
			</footer>
		</div>
	</article>
</template>

<style scoped>
.print-cv {
	display: none;
}

@media print {
	.print-cv {
		display: block;
		color: #20252b;
		font-family: Arial, Helvetica, sans-serif;
		font-size: 10.5pt;
		line-height: 1.4;
		-webkit-print-color-adjust: exact;
		print-color-adjust: exact;
	}

	/* Natural flow allows longer content to grow; only the second page starts a new sheet. */
	.print-page {
		display: flex;
		flex-direction: column;
		min-height: 266mm;
	}

	.print-page + .print-page {
		break-before: page;
	}

	.print-cv :is(h1, h2, h3, p, ul, dl, dd) {
		margin: 0;
	}

	.print-cv :is(h1, h2, h3) {
		font-family: Arial, Helvetica, sans-serif;
		break-after: avoid;
	}

	.print-cv a {
		color: inherit;
		text-decoration: none;
	}

	.print-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8mm;
	}

	.print-eyebrow {
		color: #52616f;
		font-size: 8pt;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.print-header h1 {
		margin: 1.5mm 0;
		font-size: 29pt;
		font-weight: 700;
		letter-spacing: -0.035em;
		line-height: 1.1;
	}

	.print-role {
		font-size: 11pt;
	}

	.print-header img {
		width: 23mm;
		height: 23mm;
		border-radius: 3mm;
		object-fit: cover;
	}

	.print-contact {
		display: flex;
		flex-wrap: wrap;
		gap: 1mm 4mm;
		margin-top: 4mm;
		padding-bottom: 3.5mm;
		border-bottom: 0.5mm solid #273c4c;
		font-size: 8.5pt;
	}

	.print-profile {
		margin-top: 4mm !important;
	}

	.print-section {
		margin-top: 5mm;
	}

	.print-section h2 {
		margin-bottom: 3mm;
		padding-bottom: 1.5mm;
		border-bottom: 0.25mm solid #c9cfd4;
		color: #273c4c;
		font-size: 10pt;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.print-cv h3 {
		font-size: 11pt;
		font-weight: 700;
		line-height: 1.3;
	}

	.print-position + .print-position {
		margin-top: 4.5mm;
	}

	.print-position-meta {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 4mm;
		margin-bottom: 1mm;
		font-size: 9pt;
	}

	.print-company {
		font-weight: 700;
	}

	.print-dates {
		color: #52616f;
		white-space: nowrap;
	}

	.print-position ul,
	.print-recognition {
		padding-left: 4mm;
		list-style: disc;
	}

	.print-position ul {
		margin-top: 1.5mm;
	}

	.print-cv li + li {
		margin-top: 1.4mm;
	}

	.print-position,
	.print-project,
	.print-skills > div,
	.print-recognition,
	.print-interests {
		break-inside: avoid;
	}

	.print-cv :is(p, li) {
		orphans: 3;
		widows: 3;
	}

	.print-running-header {
		display: flex;
		justify-content: space-between;
		padding-bottom: 3mm;
		border-bottom: 0.5mm solid #273c4c;
		font-size: 9pt;
	}

	.print-running-header > :first-child {
		font-weight: 700;
	}

	.print-project + .print-project {
		margin-top: 3mm;
	}

	.print-project p {
		margin-top: 1mm;
	}

	.print-skills > div + div {
		margin-top: 2mm;
	}

	.print-technical-approach {
		margin-bottom: 3mm !important;
	}

	.print-skills {
		font-size: 10pt;
	}

	.print-skills dt {
		display: inline;
		font-weight: 700;
	}

	.print-skills dd {
		display: inline;
	}

	.print-footer {
		display: flex;
		justify-content: space-between;
		gap: 5mm;
		margin-top: auto;
		padding-top: 4mm;
		color: #52616f;
		font-size: 8pt;
	}
}
</style>
