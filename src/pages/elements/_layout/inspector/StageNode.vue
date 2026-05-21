<script setup>
import { computed } from 'vue';
import { useInspector } from './useInspector.js';
import { isTextNode } from './componentRegistry.js';

const props = defineProps({ node: { type: Object, required: true } });
const ctx = useInspector();
const selected = computed(() => ctx?.selectedId === props.node.id);
const isText = computed(() => isTextNode(props.node));
</script>

<template>
	<span
		v-if="isText"
		:data-node-id="node.id"
		:data-selected="selected || null"
		class="el-text-node"
	>{{ node.text }}</span>
	<component
		v-else
		:is="node.component || 'div'"
		v-bind="node.props"
		:data-node-id="node.id"
		:data-selected="selected || null"
		class="el-stage-node"
	>
		<StageNode v-for="c in node.children" :key="c.id" :node="c" />
	</component>
</template>
