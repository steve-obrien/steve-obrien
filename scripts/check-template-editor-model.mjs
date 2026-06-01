import assert from 'node:assert/strict';
import {
	buildSource,
	evaluatePreviewExpression,
	extractTemplateSource,
	literalExpressionValue,
	parseScriptSetupData,
	parseRepeatSource,
	parseSource,
	stampEditorNode,
} from '../src/pages/experiments/template-editor/lib/editorModel.js';

let id = 0;
const stamp = (node) => stampEditorNode(node, () => `test-node-${++id}`);

const source = `<template>
	<section class="space-y-3" @click="save" v-if="ready">
		<CardPanel :items="items" v-model="selected">
			<p>Hello {{ user.name }}</p>
		</CardPanel>
		<article v-for="(task, index) in tasks" :key="task.id">{{ task.title }}</article>
	</section>
</template>

<script setup>
const props = defineProps({
	items: Array,
	tasks: Array,
});
</script>`;

const parsed = parseSource(source, { componentName: 'ProjectDashboard', stamp });
const section = parsed.tree.children[0];
const card = section.children[0];
const repeated = section.children[1];

assert.equal(section.type, 'element');
assert.equal(section.props.class, 'space-y-3');
assert.equal(section.props['@click'], 'save');
assert.equal(section.props['v-if'], 'ready');
assert.equal(card.type, 'component');
assert.equal(card.props[':items'], 'items');
assert.equal(card.props['v-model'], 'selected');
assert.deepEqual(repeated.repeat, {
	source: '(task, index) in tasks',
	item: 'task',
	index: 'index',
	list: 'tasks',
});
assert.deepEqual(parsed.props, [
	{ name: 'items', type: 'Array' },
	{ name: 'tasks', type: 'Array' },
]);

const rebuilt = buildSource(parsed.tree, { props: parsed.props }).rows.map((row) => row.text).join('\n');
assert.match(rebuilt, /@click="save"/);
assert.match(rebuilt, /v-if="ready"/);
assert.match(rebuilt, /v-model="selected"/);
assert.match(rebuilt, /v-for="\(task, index\) in tasks"/);

const nestedTemplateSource = `<template>
	<section>
		<template v-if="ready">
			<p>Nested template content</p>
		</template>
		<button>Done</button>
	</section>
</template>`;
const extractedNestedTemplate = extractTemplateSource(nestedTemplateSource);
assert.match(extractedNestedTemplate.template, /<template v-if="ready">/);
assert.match(extractedNestedTemplate.template, /<button>Done<\/button>/);
assert.equal(extractedNestedTemplate.hasTemplateBlock, true);
const parsedNested = parseSource(nestedTemplateSource, { componentName: 'NestedTemplate', stamp });
assert.equal(parsedNested.tree.children[0].tag, 'section');
assert.equal(parsedNested.tree.children[0].children.length, 2);

const parsedVoidTags = parseSource('<section><input value="Search"><img src="/icon.png" alt=""></section>', { componentName: 'VoidTags', stamp });
assert.equal(parsedVoidTags.tree.children[0].children[0].tag, 'input');
assert.equal(parsedVoidTags.tree.children[0].children[1].tag, 'img');

const scriptDataSource = `<template>
	<nav>
		<a v-for="item in nav" :key="item.href" :href="item.href">{{ item.label }}</a>
	</nav>
</template>

<script setup>
const nav = [
	{ label: 'Hero', href: '#hero' },
	{ label: 'Pricing', href: '#pricing' },
];
const ignored = buildNavigation();
</script>`;
const parsedScriptData = parseSource(scriptDataSource, { componentName: 'ScriptData', stamp });
assert.deepEqual(parsedScriptData.scriptData.nav, [
	{ label: 'Hero', href: '#hero' },
	{ label: 'Pricing', href: '#pricing' },
]);
assert.equal(parsedScriptData.scriptData.ignored, undefined);
assert.deepEqual(parseScriptSetupData(scriptDataSource).nav[0], { label: 'Hero', href: '#hero' });
assert.deepEqual(evaluatePreviewExpression("{ width: node.score + '%' }", { node: { score: 62 } }), {
	matched: true,
	value: { width: '62%' },
});
assert.deepEqual(evaluatePreviewExpression("plan.highlight ? 'active' : 'idle'", { plan: { highlight: false } }), {
	matched: true,
	value: 'idle',
});

assert.deepEqual(parseRepeatSource('item of items'), {
	source: 'item of items',
	item: 'item',
	index: '',
	list: 'items',
});
assert.deepEqual(literalExpressionValue('["a","b"]'), {
	matched: true,
	value: ['a', 'b'],
});

console.log('template editor model checks passed');
