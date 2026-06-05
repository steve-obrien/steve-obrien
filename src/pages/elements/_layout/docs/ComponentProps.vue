<script setup>
import { computed } from 'vue';
import { inspectComponent } from './inspect.js';
import CodeBlock from '../CodeBlock.vue';
import TypeCodeBlock from './TypeCodeBlock.vue';
import { ElPopover } from '../../lib/vue';

const props = defineProps({
	component: { required: true },
	source: { type: String, default: '' },
	title: { type: String, default: 'Props' },
});
const info = computed(() => inspectComponent(props.component, props.source));

const groupOrder = ['Control props', 'Field props'];
const propGroups = computed(() => {
	const groups = new Map();
	for (const prop of info.value?.props || []) {
		const name = prop.group || 'Control props';
		if (!groups.has(name)) groups.set(name, []);
		groups.get(name).push(prop);
	}
	return [...groups.entries()]
		.map(([name, props]) => ({ name, props }))
		.sort((a, b) => {
			const ai = groupOrder.indexOf(a.name);
			const bi = groupOrder.indexOf(b.name);
			if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
			if (ai === -1) return 1;
			if (bi === -1) return -1;
			return ai - bi;
		});
});

function typeTokens(prop) {
	const definitions = prop.typeDefinitions || {};
	const refs = new Set(Object.keys(definitions));
	return String(prop.ts || 'unknown')
		.split(/(\b[A-Z][A-Za-z0-9_]*\b)/g)
		.filter((token) => token !== '')
		.map((text) => ({
			definition: refs.has(text) ? definitions[text] : '',
			definitions,
			text,
		}));
}

function hoverCodeForProp(prop) {
	if (prop.example) return prop.example;
	if (prop.details && !Object.keys(prop.typeDefinitions || {}).length) return prop.details;
	return '';
}
</script>

<template>
	<section v-if="info?.props?.length" class="space-y-3">
		<h3 class="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{{ title }}</h3>
		<div
			v-for="group in propGroups"
			:key="group.name"
			class="relative rounded-2xl border border-border"
		>
			<div class="border-b border-border bg-background px-4 py-3">
				<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{{ group.name }}</p>
			</div>
			<table class="w-full text-left text-sm">
				<thead class="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
					<tr>
						<th class="px-4 py-2 font-medium">Name</th>
						<th class="px-4 py-2 font-medium">Type</th>
						<th class="px-4 py-2 font-medium">TS</th>
						<th class="px-4 py-2 font-medium">Default</th>
						<th class="px-4 py-2 font-medium">Description</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					<template v-for="p in group.props" :key="p.name">
						<tr>
							<td class="px-4 py-3 font-mono text-[12.5px] text-foreground">
								<ElPopover
									v-if="hoverCodeForProp(p)"
									trigger="hover-click"
									position="bottom-start"
									width="w-[min(34rem,80vw)]"
									padding="p-2"
								>
									<template #trigger>
										<span class="inline-flex items-baseline">
											<code class="cursor-help underline decoration-dotted underline-offset-4">{{ p.name }}</code>
											<span v-if="p.required" class="ml-0.5 text-destructive">*</span>
										</span>
									</template>
									<CodeBlock class="max-h-80" :code="hoverCodeForProp(p)" lang="ts" />
								</ElPopover>
								<span v-else class="inline-flex items-baseline">
									<code>{{ p.name }}</code><span v-if="p.required" class="ml-0.5 text-destructive">*</span>
								</span>
							</td>
							<td class="px-4 py-3 font-mono text-[12.5px] text-muted-foreground">{{ p.type }}</td>
							<td class="px-4 py-3 font-mono text-[12.5px] text-muted-foreground">
								<template v-for="(token, index) in typeTokens(p)" :key="`${p.name}:${index}`">
									<ElPopover
										v-if="token.definition"
										trigger="hover-click"
										position="bottom-start"
										width="w-[min(34rem,80vw)]"
										padding="p-0"
									>
										<template #trigger>
											<span class="cursor-help text-foreground underline decoration-dotted underline-offset-4">{{ token.text }}</span>
										</template>
										<TypeCodeBlock class="max-h-80" :code="token.definition" :definitions="token.definitions" :framed="false" />
									</ElPopover>
									<span v-else>{{ token.text }}</span>
								</template>
							</td>
							<td class="px-4 py-3 font-mono text-[12.5px] text-muted-foreground">{{ p.default }}</td>
							<td class="px-4 py-3 text-muted-foreground">{{ p.description || '—' }}</td>
						</tr>
					</template>
				</tbody>
			</table>
		</div>
		<p class="text-[11px] text-muted-foreground">
			Auto-generated from <code class="font-mono">{{ info.name || 'component' }}.props</code> and inline
			<code class="font-mono">_edit</code> hints.
		</p>
	</section>
</template>
