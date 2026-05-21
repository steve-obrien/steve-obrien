<script setup>
import HeadlessPage from '../../_layout/docs/HeadlessPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import HtmlDemo from '../../_layout/docs/HtmlDemo.vue';
import { ElementTooltip } from '../../lib/headless';

import BasicSrc from './examples/basic.html?raw';
</script>

<template>
	<HeadlessPage :element="ElementTooltip">
		<DocSection eyebrow="Demo" title="Hover tooltip">
			<Example
				:source="BasicSrc"
				lang="html"
				filename="basic.html"
				description="Wrap any focusable child — text and placement are attributes on the host."
			>
				<HtmlDemo :source="BasicSrc" />
			</Example>
		</DocSection>
	</HeadlessPage>
</template>
