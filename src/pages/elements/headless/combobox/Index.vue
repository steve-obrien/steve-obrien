<script setup>
import HeadlessPage from '../../_layout/docs/HeadlessPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import HtmlDemo from '../../_layout/docs/HtmlDemo.vue';
import { ElementCombobox } from '../../lib/headless';

import BasicSrc from './examples/basic.html?raw';
import PeopleSrc from './examples/people.html?raw';
</script>

<template>
	<HeadlessPage :element="ElementCombobox">
		<DocSection eyebrow="Demo" title="Select-like search">
			<Example
				:source="BasicSrc"
				lang="html"
				filename="basic.html"
				description="Select an option value while showing its label in the input. The list still supports filtering, arrow keys, Enter, Esc, and floating positioning."
			>
				<HtmlDemo :source="BasicSrc" />
			</Example>
		</DocSection>
		<DocSection eyebrow="Demo" title="Rich option markup">
			<Example
				:source="PeopleSrc"
				lang="html"
				filename="people.html"
				description="List items can be authored directly in the DOM with images and nested labels. data-label controls the text shown in the input, and data-value is the selected value."
			>
				<HtmlDemo :source="PeopleSrc" />
			</Example>
		</DocSection>
	</HeadlessPage>
</template>
