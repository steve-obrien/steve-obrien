export const dailyNewsFeeds = [
	{
		date: '2026-05-27',
		generatedAt: '2026-05-27T22:00:00+01:00',
		limit: 5,
		description: 'What I am reading across AI research, neuroscience, agents, and engineering practice.',
		items: [
			{
				id: 'openai-unit-distance',
				slug: 'ai-research',
				category: 'AI research',
				title: 'An OpenAI model challenges a classic Erdős geometry conjecture',
				description: 'A general-purpose reasoning model found a construction that improves the planar unit-distance lower bound and changes a long-running discrete geometry debate.',
				sourceName: 'OpenAI',
				sourceUrl: 'https://openai.com/index/model-disproves-discrete-geometry-conjecture/',
				publishedAt: '2026-05-20',
				image: '/news/ai-mathematics.webp',
				imageAlt: 'Luminous geometric graph floating in a dark abstract research space.',
				gradient: 'radial-gradient(circle at 18% 14%, rgba(103, 232, 249, 0.34), transparent 30%), linear-gradient(142deg, #070817 0%, #141044 49%, #061524 100%)',
				accent: '#67e8f9',
				summary: {
					deck: 'Reasoning models are beginning to contribute to research by searching strange corners of problem spaces, not just by summarising papers.',
					paragraphs: [
						'The interesting bit is not only that a model produced a better unit-distance construction. It is that the result sits in the awkward middle ground between software output and mathematical work: a generated object that still needs human interpretation, verification, and cultural acceptance.',
						'For a daily reading feed, this is the kind of AI research signal worth tracking because it shows models being useful in open-ended exploration. They are not replacing proof culture, but they are becoming tools that can propose candidates at a scale and weirdness level people may not naturally try first.',
						'The practical question is what tooling grows around this: reproducible search traces, automatic verification, interfaces for inspecting candidate constructions, and publication norms for model-assisted discoveries.',
					],
					takeaways: [
						'AI research is moving from answer generation toward structured discovery workflows.',
						'Mathematics gives a useful test bed because claims can often be checked rigorously.',
						'The next step is not a prettier chatbot; it is better verification and provenance around model-generated research objects.',
					],
				},
			},
			{
				id: 'gpt-rosalind',
				slug: 'ai-life-sciences',
				category: 'AI and life sciences',
				title: 'GPT-Rosalind points specialist models at biology workflows',
				description: 'OpenAI introduced a life-sciences reasoning model for research tasks spanning biology, drug discovery, and translational medicine.',
				sourceName: 'OpenAI',
				sourceUrl: 'https://openai.com/index/introducing-gpt-rosalind/',
				publishedAt: '2026-04-16',
				image: '/news/ai-biology.webp',
				imageAlt: 'Glowing protein ribbons and molecular traces in a dark bioinformatics scene.',
				gradient: 'radial-gradient(circle at 82% 18%, rgba(251, 191, 36, 0.28), transparent 28%), linear-gradient(145deg, #03120e 0%, #064638 48%, #081512 100%)',
				accent: '#5eead4',
				summary: {
					deck: 'Specialist scientific models are becoming workflow components for research teams rather than generic chat surfaces.',
					paragraphs: [
						'GPT-Rosalind is worth watching because biology is full of messy representational layers: papers, assays, protein structures, genomics, trial design, and tacit lab constraints. A useful model has to reason across those layers without pretending the world is cleaner than it is.',
						'The public signal here is that frontier labs are packaging domain models around research workflows. The value will likely depend less on isolated benchmark scores and more on how well these models integrate with validated tools, audit trails, and expert review.',
						'This is also a reminder that AI in science will not be one product category. Biology, chemistry, neuroscience, and clinical translation each need their own interfaces, guardrails, and evidence standards.',
					],
					takeaways: [
						'Domain-specific model packaging matters when the surrounding workflow is complex.',
						'Scientific usefulness depends on integration with evidence, provenance, and expert review.',
						'Biology remains one of the most important frontiers for applied AI systems.',
					],
				},
			},
			{
				id: 'brain-code-flux',
				slug: 'brain-research',
				category: 'Brain research',
				title: 'Neural drift keeps asking what a stable brain code really means',
				description: 'A Nature news feature follows evidence that neural responses can shift over time, with implications for memory, brain-computer interfaces, and AI systems.',
				sourceName: 'Nature',
				sourceUrl: 'https://www.nature.com/articles/d41586-026-01554-0',
				publishedAt: '2026-05-20',
				image: '/news/brain-behaviour.webp',
				imageAlt: 'Translucent brain-like network connected to flowing behavioural trajectories.',
				gradient: 'radial-gradient(circle at 22% 22%, rgba(251, 113, 133, 0.3), transparent 28%), linear-gradient(144deg, #070b18 0%, #2d1638 52%, #08111f 100%)',
				accent: '#fb7185',
				summary: {
					deck: 'If neural representations keep shifting, intelligence may be less like a static codebook and more like a living control process.',
					paragraphs: [
						'Neural drift is one of those brain-science ideas that quietly changes the metaphor. Instead of assuming that stable behaviour requires stable individual-neuron encodings, the evidence suggests that populations can move while the organism still remembers, recognises, and acts.',
						'That matters for brain-computer interfaces because decoders trained on today’s neural activity may decay tomorrow. It also matters for AI because representation drift is usually treated as a training problem, while biology may treat it as a feature of robust adaptive systems.',
						'The most interesting bridge is between neuroscience and engineering: how do you design systems whose internal representations can change without breaking the external skill?',
					],
					takeaways: [
						'Stable behaviour does not necessarily require stable single-neuron responses.',
						'Brain-computer interfaces may need adaptation as a core design principle.',
						'AI systems could learn from biological robustness under representation drift.',
					],
				},
			},
			{
				id: 'consciousness-adversarial-ai',
				slug: 'neuroscience-and-ai',
				category: 'Neuroscience and AI',
				title: 'Adversarial AI probes mechanisms behind disordered consciousness',
				description: 'A Nature Neuroscience paper uses adversarial models to connect consciousness detection with interpretable neural field models and possible treatment targets.',
				sourceName: 'Nature Neuroscience',
				sourceUrl: 'https://www.nature.com/articles/s41593-026-02220-4',
				publishedAt: '2026-03-24',
				image: '/news/consciousness-ai.webp',
				imageAlt: 'Golden neural network and opposing signal waves in a dark clinical neuroscience visual.',
				gradient: 'radial-gradient(circle at 78% 18%, rgba(250, 204, 21, 0.3), transparent 30%), linear-gradient(145deg, #10040b 0%, #3b1022 48%, #160b07 100%)',
				accent: '#facc15',
				summary: {
					deck: 'AI is becoming a microscope for causal questions in neuroscience, especially when direct experimentation is hard.',
					paragraphs: [
						'This work is interesting because it uses adversarial modelling to ask what changes would move a brain-state classifier. In disorders of consciousness, the stakes are unusually high: detection, interpretation, and potential treatment are all tangled together.',
						'The useful pattern is not “AI diagnoses consciousness”. It is AI as a stress-testing tool for mechanistic hypotheses. When paired with interpretable neural models, adversarial examples can suggest where a system is fragile, what signals matter, and what interventions might be worth studying.',
						'For the broader feed, this belongs next to AI research because the best agentic systems may also need this kind of counterfactual reasoning: not just predicting a label, but exploring what would have to change for the state of the world to change.',
					],
					takeaways: [
						'Adversarial methods can expose model sensitivities and possible mechanisms.',
						'Clinical neuroscience needs interpretable AI, not only accurate classification.',
						'Counterfactual tools are becoming central to both science and agent design.',
					],
				},
			},
			{
				id: 'agents-sdk-evolution',
				slug: 'agentic-engineering',
				category: 'Agentic engineering',
				title: 'Agent infrastructure keeps moving from demos into systems work',
				description: 'The latest Agents SDK release adds a more capable harness for agents that need to work with documents, files, and real software systems.',
				sourceName: 'OpenAI',
				sourceUrl: 'https://openai.com/index/the-next-evolution-of-the-agents-sdk',
				publishedAt: '2026-04-15',
				image: '/news/agentic-engineering.webp',
				imageAlt: 'Autonomous agent core orchestrating abstract code paths and review checkpoints.',
				gradient: 'radial-gradient(circle at 80% 16%, rgba(110, 231, 183, 0.3), transparent 31%), linear-gradient(145deg, #050914 0%, #102c5c 50%, #06130f 100%)',
				accent: '#6ee7b7',
				summary: {
					deck: 'Agentic engineering is becoming an infrastructure problem: context, tools, state, permissions, evaluation, and handoff.',
					paragraphs: [
						'The agents story is shifting from impressive demos to the less glamorous systems work that makes them dependable. An SDK matters when it standardises how agents call tools, carry context, work with files, and surface results to people.',
						'For software engineering, the real question is orchestration. A useful agent has to move between repository search, code editing, tests, browser verification, issue context, and review without blurring boundaries or hiding risk.',
						'The feed should track this category closely because agentic information is changing quickly. The meaningful news is often not a new model, but a new pattern for safely giving models more agency inside real systems.',
					],
					takeaways: [
						'Agent quality depends heavily on workflow design around the model.',
						'Permissions, observability, and verification are first-class engineering concerns.',
						'The next gains may come from better agent scaffolding, not only larger models.',
					],
				},
			},
		],
	},
];

export const dailyNewsFeed = dailyNewsFeeds[0];

export function getNewsFeedByDate(date) {
	return dailyNewsFeeds.find((feed) => feed.date === date) || null;
}

export function getLatestNewsFeed() {
	return dailyNewsFeeds[0];
}

export function getNewsFeedAdjacent(date) {
	const index = dailyNewsFeeds.findIndex((feed) => feed.date === date);
	if (index === -1) {
		return {
			previous: null,
			next: null,
		};
	}

	return {
		previous: dailyNewsFeeds[index + 1] || null,
		next: dailyNewsFeeds[index - 1] || null,
	};
}

export function getNewsItemByDateAndSlug(date, slug) {
	const feed = getNewsFeedByDate(date);
	if (!feed) return null;
	return feed.items.find((item) => item.slug === slug) || null;
}

export function getNewsItemPath(feed, item) {
	return `/news/${feed.date}/${item.slug}`;
}
