<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';

const formSchemaCode = `const inviteFormSchema = [
\t{
\t\tcomponent: 'ElTextInput',
\t\tprops: {
\t\t\tname: 'name',
\t\t\tlabel: 'Name',
\t\t\trequired: true,
\t\t\tmaxlength: 150,
\t\t},
\t\tstorage: {
\t\t\tcolumn: 'name',
\t\t\ttype: 'varchar',
\t\t\tlength: 150,
\t\t\tnullable: false,
\t\t},
\t},
\t{
\t\tcomponent: 'ElEmailInput',
\t\tprops: {
\t\t\tname: 'email',
\t\t\tlabel: 'Email',
\t\t\trequired: true,
\t\t},
\t\tstorage: {
\t\t\tcolumn: 'email',
\t\t\ttype: 'varchar',
\t\t\tlength: 254,
\t\t\tnullable: false,
\t\t\tunique: true,
\t\t},
\t},
];`;

const formDataCode = `const inviteFormData = {
\tname: 'Maya Patel',
\temail: 'maya@example.com',
};`;

const lifecycleCode = `const textFieldDefinition = {
\tcomponent: 'ElTextInput',
\tstorage: {
\t\ttype: 'varchar',
\t\tlength: 150,
\t},
\tfromDatabase(value) {
\t\treturn value ?? '';
\t},
\ttoDatabase(value) {
\t\treturn String(value || '').trim();
\t},
};`;

const generatedFormCode = `// Database first.
const userTable = {
\tname: 'users',
\tcolumns: [
\t\t{ name: 'name', type: 'varchar', length: 150, nullable: false },
\t\t{ name: 'email', type: 'varchar', length: 254, nullable: false },
\t],
};

const formSchema = createFormSchemaFromTable(userTable);

// Form builder first.
const tableSchema = createTableSchemaFromForm(formSchema);`;

const relationships = [
	{
		name: 'Form schema',
		description: 'The authored definition: components, labels, validation, layout, permissions, and future storage metadata.',
		example: 'ElEmailInput named email, required, stored as varchar(254)',
	},
	{
		name: 'Form data',
		description: 'The values collected from a rendered form. It should stay small and portable.',
		example: '{ email: "maya@example.com" }',
	},
	{
		name: 'Database schema',
		description: 'The persistence shape: table, column, datatype, length, nullability, indexes, and relationships.',
		example: 'users.email varchar(254) not null unique',
	},
	{
		name: 'Transform lifecycle',
		description: 'The conversion layer between UI values and database values.',
		example: 'fromDatabase(value), toDatabase(value)',
	},
];
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Form Schema"
			tagline="How a form definition relates to form data, storage metadata, and future form-builder workflows."
			tag="Schema + data"
		>
			<DocSection eyebrow="Model" title="Schema is not submission data">
				<div class="space-y-4 text-sm leading-6 text-muted-foreground">
					<p>
						A form system stores two different things. The schema describes how to render,
						validate, and eventually persist a form. The data is the object a user creates
						by filling that form in.
					</p>
					<p>
						This is the same architectural split described in
						<a
							href="https://form.io/form-json-schema-vs-submission/"
							target="_blank"
							rel="noreferrer"
							class="font-medium text-foreground underline underline-offset-4"
						>Form.io's schema/submission model</a>:
						the definition and the submitted values are related, but they should not be
						stored as one thing.
					</p>
				</div>
			</DocSection>

			<DocSection eyebrow="Example" title="Definition and values">
				<div class="grid gap-4 lg:grid-cols-2">
					<div class="space-y-3">
						<h3 class="text-sm font-semibold text-foreground">Form schema</h3>
						<p class="text-sm leading-6 text-muted-foreground">
							The schema chooses components and records the data contract those components represent.
						</p>
						<CodeBlock lang="js" :code="formSchemaCode" />
					</div>
					<div class="space-y-3">
						<h3 class="text-sm font-semibold text-foreground">Form data</h3>
						<p class="text-sm leading-6 text-muted-foreground">
							The model only contains the values keyed by field names.
						</p>
						<CodeBlock lang="js" :code="formDataCode" />
					</div>
				</div>
			</DocSection>

			<DocSection eyebrow="Relationship" title="Four layers">
				<div class="overflow-hidden rounded-2xl border border-border">
					<table class="w-full text-left text-sm">
						<thead class="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
							<tr>
								<th class="px-4 py-2 font-medium">Layer</th>
								<th class="px-4 py-2 font-medium">Purpose</th>
								<th class="px-4 py-2 font-medium">Example</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border">
							<tr v-for="row in relationships" :key="row.name">
								<td class="px-4 py-3 font-medium text-foreground">{{ row.name }}</td>
								<td class="px-4 py-3 text-muted-foreground">{{ row.description }}</td>
								<td class="px-4 py-3 font-mono text-[12.5px] text-muted-foreground">{{ row.example }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</DocSection>

			<DocSection eyebrow="Direction" title="Generate either way">
				<div class="space-y-4 text-sm leading-6 text-muted-foreground">
					<p>
						A database table is often enough to generate a useful first form: strings become
						text inputs, booleans become toggles, dates become date pickers, required columns
						become required fields. Product teams can then add richer UI context: labels,
						help text, grouping, conditional visibility, validation messages, and component
						choices that the raw database cannot know.
					</p>
					<p>
						The reverse should also work. A form builder can let someone pick front-end
						components, and each component can contribute a sensible storage default. That
						form definition can generate table metadata or migrations later.
					</p>
					<CodeBlock lang="js" :code="generatedFormCode" />
				</div>
			</DocSection>

			<DocSection eyebrow="Lifecycle" title="Transform at the boundary">
				<div class="space-y-4 text-sm leading-6 text-muted-foreground">
					<p>
						Components should eventually know how their values travel through the system.
						The browser value, the submitted form value, and the database value are usually
						close, but they are not always identical. Keeping conversion functions near the
						field definition makes that lifecycle explicit.
					</p>
					<CodeBlock lang="js" :code="lifecycleCode" />
				</div>
			</DocSection>

			<DocSection eyebrow="Current scope" title="Frontend first">
				<div class="space-y-4 text-sm leading-6 text-muted-foreground">
					<p>
						Right now, Elements concentrates on the frontend contract:
						<code class="font-mono text-foreground">ElForm</code>
						renders fields from
						<code class="font-mono text-foreground">children</code>
						and stores user input in
						<code class="font-mono text-foreground">v-model</code>.
					</p>
					<p>
						The next layer can add storage metadata without changing that core relationship.
						The form schema remains the master definition; the data remains the values; server
						adaptors can translate between the schema and real database tables when that part
						of the stack is ready.
					</p>
				</div>
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
