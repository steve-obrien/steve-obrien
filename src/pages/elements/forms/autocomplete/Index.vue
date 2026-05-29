<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Playground from '../../_layout/docs/Playground.vue';
import PropsTable from '../../_layout/PropsTable.vue';
import Example from '../../_layout/docs/Example.vue';
import { ElAutocomplete } from '../../lib/vue';
import SearchPeople from './examples/SearchPeople.vue';
import SearchPeopleSrc from './examples/SearchPeople.vue?raw';
import ServerLoadedPeople from './examples/ServerLoadedPeople.vue';
import ServerLoadedPeopleSrc from './examples/ServerLoadedPeople.vue?raw';
import { RouterLink } from 'vue-router';

const people = [
	{ value: '1', label: 'Ada Lovelace', email: 'ada@example.com' },
	{ value: '2', label: 'Grace Hopper', email: 'grace@example.com' },
	{ value: '3', label: 'Katherine Johnson', email: 'katherine@example.com' },
];

const props = [
	{ name: 'v-model', type: 'string', default: '—', description: 'Current text in the input.' },
	{ name: 'options', type: 'Array<{ value, label, ...meta }> | string[]', default: '[]', description: 'Suggestions. May be replaced as query results arrive.' },
	{ name: 'placeholder', type: 'string', default: "'Search...'", description: 'Input placeholder.' },
	{ name: 'floatingMode', type: "'viewport' | 'anchor'", default: "'viewport'", description: 'Choose whether suggestions stay in the browser or follow the input while scrolling.' },
	{ name: 'loading', type: 'boolean', default: 'false', description: 'Show an inline spinner while async suggestions are being fetched.' },
];

const events = [
	{ name: 'update:modelValue', description: 'Fired as the text changes.' },
	{ name: 'query', description: 'Fired as the user types. Use this to fetch suggestions.' },
	{ name: 'select', description: 'Fired when a suggestion is chosen. Receives the original item plus value, label, text, and query.' },
	{ name: 'commit', description: 'Fired when Enter commits the current text.' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage name="Autocomplete" tagline="A styled datalist-like text input: free text stays separate from selected suggestions." tag="<element-autocomplete>">
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:inspect="ElAutocomplete"
					:initial="{ options: people, placeholder: 'Search people' }"
					title="Autocomplete playground"
					description="Edit props in the inspector — type to filter suggestions and test the free-text path."
				/>
			</DocSection>

			<DocSection eyebrow="Demo" title="Search people">
				<Example
					:source="SearchPeopleSrc"
					filename="SearchPeople.vue"
					description="v-model is the typed text. @select receives the original option object when a suggestion is chosen."
				>
					<SearchPeople />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Server-loaded suggestions">
				<Example
					:source="ServerLoadedPeopleSrc"
					filename="ServerLoadedPeople.vue"
					description="@query lets the parent fetch suggestions and pass the current server results back through options."
				>
					<ServerLoadedPeople />
				</Example>
			</DocSection>

			<DocSection eyebrow="Usage" title="Plain HTML">
				<p class="text-sm leading-relaxed text-muted-foreground">
					Use the headless custom element when you want autocomplete in plain HTML or another framework.
					The headless page includes a copyable HTML and JavaScript example.
				</p>
				<RouterLink
					to="/elements/headless/autocomplete"
					class="mt-4 inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
				>
					View headless autocomplete
				</RouterLink>
			</DocSection>

			<DocSection title="Props">
				<PropsTable :rows="props" />
			</DocSection>

			<DocSection title="Events">
				<ul class="space-y-2 rounded-2xl border border-border bg-secondary/40 p-5 text-sm">
					<li v-for="event in events" :key="event.name" class="flex items-start gap-4">
						<code class="rounded bg-background px-2 py-0.5 font-mono text-xs ring-1 ring-border">{{ event.name }}</code>
						<span class="text-muted-foreground">{{ event.description }}</span>
					</li>
				</ul>
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
