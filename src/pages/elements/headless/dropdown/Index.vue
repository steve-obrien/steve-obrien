<script setup>
import HeadlessPage from '../../_layout/docs/HeadlessPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import HtmlDemo from '../../_layout/docs/HtmlDemo.vue';
import { ElementDropdown } from '../../lib/headless';

import BasicSrc from './examples/basic.html?raw';
</script>

<template>
	<HeadlessPage :element="ElementDropdown">
		<DocSection eyebrow="Demo" title="Account menu">
			<Example
				:source="BasicSrc"
				lang="html"
				filename="basic.html"
				description="Menu items use role=&quot;menuitem&quot; and data-value — selection emits el:select."
			>
				<HtmlDemo :source="BasicSrc" />
			</Example>
		</DocSection>
	</HeadlessPage>
</template>
