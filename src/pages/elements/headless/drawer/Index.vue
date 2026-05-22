<script setup>
import HeadlessPage from '../../_layout/docs/HeadlessPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import HtmlDemo from '../../_layout/docs/HtmlDemo.vue';
import { ElementDrawer } from '../../lib/headless';

import NavigationSrc from './examples/navigation.html?raw';
import FiltersSrc from './examples/filters.html?raw';
import ProgrammaticSrc from './examples/programmatic.html?raw';
import TransitionsSrc from './examples/transitions.html?raw';
</script>

<template>
	<HeadlessPage :element="ElementDrawer">
		<DocSection eyebrow="Demo" title="Right edge (default)">
			<Example
				:source="NavigationSrc"
				lang="html"
				filename="navigation.html"
				description="Trigger via slot=&quot;trigger&quot; — the element wires the click handler and ARIA for you."
			>
				<HtmlDemo :source="NavigationSrc" />
			</Example>
		</DocSection>

		<DocSection eyebrow="Demo" title="Left edge">
			<Example
				:source="FiltersSrc"
				lang="html"
				filename="filters.html"
				description="Set the side attribute to left for filter panels and secondary surfaces."
			>
				<HtmlDemo :source="FiltersSrc" />
			</Example>
		</DocSection>

		<DocSection eyebrow="Demo" title="Custom transitions">
			<Example
				:source="TransitionsSrc"
				lang="html"
				filename="transitions.html"
				description="Headless UI–style enter/leave attributes with Tailwind classes on the panel instead of the default slide animation."
			>
				<HtmlDemo :source="TransitionsSrc" />
			</Example>
		</DocSection>

		<DocSection eyebrow="Demo" title="Programmatic control">
			<Example
				:source="ProgrammaticSrc"
				lang="html"
				filename="programmatic.html"
				description="show(), hide(), toggle(), and the open property work on the custom element instance."
			>
				<HtmlDemo :source="ProgrammaticSrc" />
			</Example>
		</DocSection>
	</HeadlessPage>
</template>
