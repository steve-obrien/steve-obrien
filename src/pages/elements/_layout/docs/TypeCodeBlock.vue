<script setup>
import { computed, ref } from 'vue';
import { ElPopover } from '../../lib/vue';

defineOptions({ name: 'TypeCodeBlock' });

const props = defineProps({
	code: { type: String, default: '' },
	definitions: { type: Object, default: () => ({}) },
	depth: { type: Number, default: 0 },
	framed: { type: Boolean, default: true },
	maxDepth: { type: Number, default: 8 },
});

const openTokens = ref({});
const keywords = new Set(['const', 'export', 'extends', 'false', 'function', 'import', 'interface', 'new', 'return', 'true', 'type']);
const primitives = new Set(['any', 'boolean', 'never', 'null', 'number', 'object', 'string', 'undefined', 'unknown', 'void']);
const knownGlobals = new Set(['Array', 'DataTransfer', 'DragEvent', 'MouseEvent', 'Promise', 'Record']);

const displayCode = computed(() => String(props.code || ''));
const declaration = computed(() => {
	const rows = displayCode.value.split('\n');
	for (let index = 0; index < rows.length; index += 1) {
		const match = rows[index].match(/^\s*(?:export\s+)?(?:type|interface)\s+([A-Za-z_$][\w$]*)\b/);
		if (match) return { line: index, name: match[1] };
	}
	return null;
});
const lines = computed(() => displayCode.value.split('\n').map((line, index) => tokenizeLine(line, index)));

function tokenKey(rowIndex, tokenIndex) {
	return `${props.depth}:${rowIndex}:${tokenIndex}`;
}

function markOpen(key) {
	openTokens.value = { ...openTokens.value, [key]: true };
}

function isOpen(key) {
	return Boolean(openTokens.value[key]);
}

function referenceDefinition(text) {
	if (props.depth >= props.maxDepth) return '';
	return props.definitions?.[text] || '';
}

function tokenizeLine(line, rowIndex) {
	const commentIndex = line.indexOf('//');
	if (commentIndex < 0) return tokenizeCode(line, rowIndex);
	return [
		...tokenizeCode(line.slice(0, commentIndex), rowIndex),
		{ kind: 'comment', text: line.slice(commentIndex) },
	];
}

function tokenizeCode(code, rowIndex) {
	let declarationNameRendered = false;
	return code
		.split(/(\b[A-Za-z_$][\w$]*\b|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|\d+(?:\.\d+)?)/g)
		.filter((text) => text !== '')
		.map((text) => {
			if (!declarationNameRendered && isDeclarationName(text, rowIndex)) {
				declarationNameRendered = true;
				return { kind: 'type', text };
			}
			const definition = referenceDefinition(text);
			if (definition) return { definition, kind: 'reference', text };
			if (keywords.has(text)) return { kind: 'keyword', text };
			if (primitives.has(text)) return { kind: 'primitive', text };
			if (knownGlobals.has(text) || /^[A-Z][A-Za-z0-9_]*$/.test(text)) return { kind: 'type', text };
			if (/^['"`]/.test(text)) return { kind: 'string', text };
			if (/^\d/.test(text)) return { kind: 'number', text };
			return { kind: 'plain', text };
		});
}

function isDeclarationName(text, rowIndex) {
	return declaration.value?.line === rowIndex && declaration.value?.name === text;
}

function tokenClass(token) {
	if (token.kind === 'reference') return 'cursor-help text-[#0550ae] underline decoration-dotted underline-offset-4 dark:text-[#79c0ff]';
	if (token.kind === 'keyword') return 'text-[#cf222e] dark:text-[#ff7b72]';
	if (token.kind === 'primitive' || token.kind === 'type') return 'text-[#0550ae] dark:text-[#79c0ff]';
	if (token.kind === 'string') return 'text-[#0a3069] dark:text-[#a5d6ff]';
	if (token.kind === 'number') return 'text-[#0550ae] dark:text-[#79c0ff]';
	if (token.kind === 'comment') return 'text-[#6e7781] dark:text-[#8b949e]';
	return 'text-[#24292f] dark:text-[#e6edf3]';
}
</script>

<template>
	<div
		class="el-code overflow-auto rounded-lg bg-popover"
		:class="framed ? 'border border-border' : ''"
	>
		<pre class="overflow-auto rounded-lg bg-popover p-4 text-[12.5px] leading-relaxed text-popover-foreground"><code><template v-for="(line, rowIndex) in lines" :key="rowIndex"><template v-for="(token, tokenIndex) in line" :key="`${rowIndex}:${tokenIndex}`"><ElPopover
						v-if="token.definition"
						trigger="hover-click"
						position="bottom-start"
						width="w-[min(34rem,80vw)]"
						padding="p-0"
						@open="markOpen(tokenKey(rowIndex, tokenIndex))"
					>
						<template #trigger><span :class="tokenClass(token)">{{ token.text }}</span></template>
						<TypeCodeBlock
							v-if="isOpen(tokenKey(rowIndex, tokenIndex))"
							:code="token.definition"
							:definitions="definitions"
							:depth="depth + 1"
							:framed="false"
							:max-depth="maxDepth"
						/>
					</ElPopover><span v-else :class="tokenClass(token)">{{ token.text }}</span></template>{{ rowIndex < lines.length - 1 ? '\n' : '' }}</template></code></pre>
	</div>
</template>
