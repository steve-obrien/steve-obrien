<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Playground from '../../_layout/docs/Playground.vue';
import PropsTable from '../../_layout/PropsTable.vue';
import Example from '../../_layout/docs/Example.vue';
import { ElTagCombobox } from '../../lib/vue';
import TailwindClasses from './examples/TailwindClasses.vue';
import TailwindClassesSrc from './examples/TailwindClasses.vue?raw';
import EmailRecipients from './examples/EmailRecipients.vue';
import EmailRecipientsSrc from './examples/EmailRecipients.vue?raw';
import ServerLoadedClasses from './examples/ServerLoadedClasses.vue';
import ServerLoadedClassesSrc from './examples/ServerLoadedClasses.vue?raw';

const options = [
	{ value: 'text-sm', label: 'text-sm', group: 'Typography' },
	{ value: 'text-lg', label: 'text-lg', group: 'Typography' },
	{ value: 'text-zinc-900', label: 'text-zinc-900', group: 'Typography' },
	{ value: 'bg-white', label: 'bg-white', group: 'Background' },
	{ value: 'rounded-xl', label: 'rounded-xl', group: 'Borders' },
	{ value: 'shadow-sm', label: 'shadow-sm', group: 'Effects' },
];

const props = [
	{ name: 'v-model', type: 'Array<string | number>', default: '[]', description: 'Selected tag values.' },
	{ name: 'options', type: 'Array<{ value, label, description?, group? }> | string[]', default: '[]', description: 'Available autocomplete options.' },
	{ name: 'allowCustom', type: 'boolean', default: 'false', description: 'Allow values that do not exist in options.' },
	{ name: 'filterOptions', type: 'boolean', default: 'true', description: 'Filter options locally. Set false for server-filtered results.' },
	{ name: 'loading', type: 'boolean', default: 'false', description: 'Show an inline spinner while async options are being fetched.' },
	{ name: 'emptyText', type: 'string', default: "'No matches'", description: 'Message shown when there are no matches.' },
	{ name: 'placeholder', type: 'string', default: "'Add tags...'", description: 'Input placeholder when no query is active.' },
	{ name: 'maxOptions', type: 'number', default: '8', description: 'Maximum matching suggestions to show.' },
	{ name: 'tokenSeparators', type: 'string[]', default: "[' ', ',']", description: 'Characters used to split pasted text into multiple tags.' },
	{ name: 'clearable', type: 'boolean', default: 'false', description: 'Show a clear-all button when tags are selected.' },
];

const events = [
	{ name: 'update:modelValue', description: 'Fired with the next selected values array.' },
	{ name: 'query', description: 'Fired as the user types.' },
	{ name: 'add', description: 'Fired when a tag is added.' },
	{ name: 'remove', description: 'Fired when a tag is removed.' },
	{ name: 'select', description: 'Fired when an option or custom value is committed.' },
	{ name: 'change', description: 'Fired after the selected values array changes.' },
];

const keys = [
	{ k: 'Up / Down', d: 'Move the active suggestion.' },
	{ k: 'Enter', d: 'Commit the active suggestion, or create a custom tag when allowed.' },
	{ k: 'Backspace', d: 'Remove the last tag when the query is empty.' },
	{ k: 'Paste', d: 'Split whitespace or comma-separated text into multiple tags.' },
	{ k: 'Esc', d: 'Close the suggestion list.' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage name="Tag combobox" tagline="A multi-select autocomplete that turns selected or custom values into editable tags." tag="<ElTagCombobox>">
			<DocSection eyebrow="Playground" title="Try strict or custom tags">
				<Playground
					:inspect="ElTagCombobox"
					:initial="{ modelValue: ['bg-white', 'text-sm'], options, allowCustom: true, label: 'Classes', placeholder: 'Add a token' }"
					title="Tag combobox playground"
					description="Toggle allowCustom to switch between known-option-only and free-entry modes."
				/>
			</DocSection>

			<DocSection eyebrow="Demo" title="Tailwind class tokens">
				<Example
					:source="TailwindClassesSrc"
					filename="TailwindClasses.vue"
					description="Use permissive mode for Tailwind so known classes autocomplete, while arbitrary values like w-[100px] can still be added."
				>
					<TailwindClasses />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Email recipients">
				<Example
					:source="EmailRecipientsSrc"
					filename="EmailRecipients.vue"
					description="Use the same component for a To field: select contacts or type a new address manually."
				>
					<EmailRecipients />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Server-loaded options">
				<Example
					:source="ServerLoadedClassesSrc"
					filename="ServerLoadedClasses.vue"
					description="@query lets the parent fetch options. Set filterOptions=false when the server already returns the matching rows."
				>
					<ServerLoadedClasses />
				</Example>
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

			<DocSection title="Keyboard">
				<ul class="space-y-2 rounded-2xl border border-border bg-secondary/40 p-5 text-sm">
					<li v-for="row in keys" :key="row.k" class="flex items-start gap-4">
						<kbd class="rounded bg-background px-2 py-0.5 font-mono text-xs ring-1 ring-border">{{ row.k }}</kbd>
						<span class="text-muted-foreground">{{ row.d }}</span>
					</li>
				</ul>
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
