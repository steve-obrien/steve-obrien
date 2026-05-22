<script setup>
import HeadlessPage from '../../_layout/docs/HeadlessPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import HtmlDemo from '../../_layout/docs/HtmlDemo.vue';
import { ElementAutocomplete } from '../../lib/headless';

import BasicSrc from './examples/basic.html?raw';
</script>

<template>
	<HeadlessPage :element="ElementAutocomplete">
		<DocSection eyebrow="Demo" title="Styled datalist">
			<Example
				:source="BasicSrc"
				lang="html"
				filename="basic.html"
				description="A free-text input with styled suggestions. Typing emits query events; selecting a suggestion emits a separate select event."
			>
				<HtmlDemo :source="BasicSrc" />
			</Example>
		</DocSection>
	</HeadlessPage>
</template>
