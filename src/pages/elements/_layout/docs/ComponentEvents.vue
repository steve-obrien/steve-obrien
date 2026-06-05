<script setup>
import { computed } from 'vue';
import { inspectComponent } from './inspect.js';
import CodeBlock from '../CodeBlock.vue';
import TypeCodeBlock from './TypeCodeBlock.vue';
import { ElPopover } from '../../lib/vue';

const props = defineProps({
	component: { required: true },
	source: { type: String, default: '' },
	title: { type: String, default: 'Events' },
	// Vue-side events are listened to with `@select` — that's the natural prefix.
	// Headless / web-component events use plain names (`el:open`), so pass `prefix=""`.
	prefix: { type: String, default: '@' },
});
const info = computed(() => inspectComponent(props.component, props.source));

function payloadTokens(event) {
	return event.payloadTokens?.length
		? event.payloadTokens
		: [{ text: event.payload || '—', definition: '', typeDefinitions: {} }];
}
</script>

<template>
	<section v-if="info?.events?.length" class="space-y-3">
		<h3 class="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{{ title }}</h3>
		<div class="overflow-hidden rounded-2xl border border-border">
			<table class="w-full text-left text-sm">
				<thead class="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
					<tr>
						<th class="px-4 py-2 font-medium">Name</th>
						<th class="px-4 py-2 font-medium">Payload</th>
						<th class="px-4 py-2 font-medium">Description</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					<template v-for="e in info.events" :key="e.name">
						<tr>
							<td class="px-4 py-3 font-mono text-[12.5px] text-foreground">{{ prefix }}{{ e.name }}</td>
							<td class="px-4 py-3 font-mono text-[12.5px] text-muted-foreground">
								<template v-for="(token, index) in payloadTokens(e)" :key="`${e.name}:${index}`">
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
										<TypeCodeBlock class="max-h-80" :code="token.definition" :definitions="token.typeDefinitions || {}" :framed="false" />
									</ElPopover>
									<span v-else>{{ token.text }}</span>
								</template>
							</td>
							<td class="px-4 py-3 text-muted-foreground">{{ e.description || '—' }}</td>
						</tr>
						<tr v-if="e.details" class="bg-secondary/30">
							<td colspan="3" class="px-4 py-3">
								<TypeCodeBlock
									v-if="Object.keys(e.typeDefinitions || {}).length"
									class="max-h-96"
									:code="e.details"
									:definitions="e.typeDefinitions"
								/>
								<CodeBlock v-else class="max-h-96" :code="e.details" lang="ts" />
							</td>
						</tr>
					</template>
				</tbody>
			</table>
		</div>
		<p class="text-[11px] text-muted-foreground">
			Names auto-detected from <code class="font-mono">defineEmits</code> and source <code class="font-mono">emit()</code> calls; payload and description from
			<code class="font-mono">__doc.events</code> when present.
		</p>
	</section>
</template>
