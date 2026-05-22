<script setup>
import HeadlessPage from '../../_layout/docs/HeadlessPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import HtmlDemo from '../../_layout/docs/HtmlDemo.vue';
import { ElementCombobox } from '../../lib/headless';

import BasicSrc from './examples/basic.html?raw';
import AutocompleteSrc from './examples/autocomplete.html?raw';
</script>

<template>
	<HeadlessPage :element="ElementCombobox">
		<DocSection eyebrow="Demo" title="Combobox">
			<Example
				:source="BasicSrc"
				lang="html"
				filename="basic.html"
				description="Select-like input with a toggle button, filtering, arrow keys, Enter to commit, Esc to dismiss, and floating list positioning."
			>
				<HtmlDemo :source="BasicSrc" />
			</Example>
		</DocSection>
		<DocSection eyebrow="Demo" title="Autocomplete">
			<Example
				:source="AutocompleteSrc"
				lang="html"
				filename="autocomplete.html"
				description="Free-text input with optional suggestions. Typed values remain valid even when they do not match the list."
			>
				<HtmlDemo :source="AutocompleteSrc" />
			</Example>
		</DocSection>
	</HeadlessPage>
</template>
