import assert from 'node:assert/strict';
import {
	buildSource,
	literalExpressionValue,
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
