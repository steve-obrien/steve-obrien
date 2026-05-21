<script setup>
import HeadlessPage from '../../_layout/docs/HeadlessPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import HtmlDemo from '../../_layout/docs/HtmlDemo.vue';
import { ElementTabs } from '../../lib/headless';

import BasicSrc from './examples/basic.html?raw';
</script>

<template>
	<HeadlessPage :element="ElementTabs">
		<DocSection eyebrow="Demo" title="Tab panels">
			<Example
				:source="BasicSrc"
				lang="html"
				filename="basic.html"
				description="Tabs use data-tab on buttons and matching data-panel regions — roving focus and arrow keys built in."
			>
				<HtmlDemo :source="BasicSrc" />
			</Example>
		</DocSection>
	</HeadlessPage>
</template>
