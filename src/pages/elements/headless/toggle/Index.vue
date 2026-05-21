<script setup>
import HeadlessPage from '../../_layout/docs/HeadlessPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import HtmlDemo from '../../_layout/docs/HtmlDemo.vue';
import { ElementToggle } from '../../lib/headless';

import BasicSrc from './examples/basic.html?raw';
</script>

<template>
	<HeadlessPage :element="ElementToggle">
		<DocSection eyebrow="Demo" title="Switch">
			<Example
				:source="BasicSrc"
				lang="html"
				filename="basic.html"
				description="role=&quot;switch&quot; with Space/Enter to toggle — emits el:change with detail.checked."
			>
				<HtmlDemo :source="BasicSrc" />
			</Example>
		</DocSection>
	</HeadlessPage>
</template>
