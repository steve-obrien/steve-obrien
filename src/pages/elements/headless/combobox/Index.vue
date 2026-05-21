<script setup>
import HeadlessPage from '../../_layout/docs/HeadlessPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import HtmlDemo from '../../_layout/docs/HtmlDemo.vue';
import { ElementCombobox } from '../../lib/headless';

import BasicSrc from './examples/basic.html?raw';
</script>

<template>
	<HeadlessPage :element="ElementCombobox">
		<DocSection eyebrow="Demo" title="Type-ahead select">
			<Example
				:source="BasicSrc"
				lang="html"
				filename="basic.html"
				description="Filter options as you type — arrow keys, Enter to commit, Esc to dismiss."
			>
				<HtmlDemo :source="BasicSrc" />
			</Example>
		</DocSection>
	</HeadlessPage>
</template>
