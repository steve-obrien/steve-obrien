<script setup>
import HeadlessPage from '../../_layout/docs/HeadlessPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import HtmlDemo from '../../_layout/docs/HtmlDemo.vue';
import { ElementDialog } from '../../lib/headless';

import BasicSrc from './examples/basic.html?raw';
import ProgrammaticSrc from './examples/programmatic.html?raw';
</script>

<template>
	<HeadlessPage :element="ElementDialog">
		<DocSection eyebrow="Demo" title="Confirm dialog">
			<Example
				:source="BasicSrc"
				lang="html"
				filename="basic.html"
				description="Trigger via slot=&quot;trigger&quot; — native &lt;dialog&gt; top layer, backdrop dismiss, and data-close buttons."
			>
				<HtmlDemo :source="BasicSrc" />
			</Example>
		</DocSection>

		<DocSection eyebrow="Demo" title="Without a trigger slot">
			<Example
				:source="ProgrammaticSrc"
				lang="html"
				filename="programmatic.html"
				description="Give the host an id, then open from any button with command=&quot;open&quot; commandfor=&quot;…&quot;, or call open() / close() / toggle() in script."
			>
				<HtmlDemo :source="ProgrammaticSrc" />
			</Example>
		</DocSection>
	</HeadlessPage>
</template>
