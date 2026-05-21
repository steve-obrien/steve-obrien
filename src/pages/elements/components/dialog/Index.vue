<script setup>
import { ref } from 'vue';
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import Demo from '../../_layout/Demo.vue';
import PropsTable from '../../_layout/PropsTable.vue';
import { ElDialog, ElButton, ElTextInput } from '../../lib/vue';

const open = ref(false);

// Nested demo state
const outer = ref(false);
const confirm = ref(false);
const projectName = ref('');

const usageVue = `<script setup>
import { ElDialog, ElButton, ElTextInput } from '@elements/vue';
import { ref } from 'vue';
const open = ref(false);
const email = ref('');
<\/script>

<template>
  <ElButton @click="open = true">Invite teammate</ElButton>
  <ElDialog
    v-model="open"
    title="Invite teammate"
    description="They'll receive an email with a join link."
  >
    <ElTextInput v-model="email" label="Email" placeholder="email@team.com" />
    <template #footer>
      <ElButton variant="secondary" data-close>Cancel</ElButton>
      <ElButton>Send invite</ElButton>
    </template>
  </ElDialog>
</template>`;

const usageNested = `<template>
  <ElButton variant="danger" @click="outer = true">Delete project</ElButton>

  <ElDialog v-model="outer" title="Delete project?">
    <p>This will permanently delete the project and all of its data.</p>
    <template #footer>
      <ElButton variant="secondary" @click="outer = false">Cancel</ElButton>
      <ElButton variant="danger" @click="confirm = true">Continue</ElButton>
    </template>

    <!-- A second dialog nested inside the first — opens on top of it. -->
    <ElDialog v-model="confirm" title="Final confirmation">
      <p>Type the project name to confirm.</p>
      <ElTextInput v-model="name" />
      <template #footer>
        <ElButton variant="secondary" @click="confirm = false">Back</ElButton>
        <ElButton variant="danger" @click="confirm = false; outer = false">
          Delete forever
        </ElButton>
      </template>
    </ElDialog>
  </ElDialog>
</template>`;

const usageWeb = `<!-- <element-dialog> owns the native <dialog> internally (shadow DOM). You
  just write the trigger + content; data-close buttons dismiss the dialog. -->
<element-dialog>
  <button slot="trigger">Open</button>
  <h2>Confirm</h2>
  <p>Are you sure?</p>
  <button data-close>Cancel</button>
  <button data-close>OK</button>
</element-dialog>`;

const props = [
	{ name: 'v-model', type: 'boolean', default: 'false', description: 'Two-way bound open state.' },
	{ name: 'title', type: 'string', default: '—', description: 'Optional heading rendered inside the panel.' },
	{ name: 'description', type: 'string', default: '—', description: 'Optional supporting copy.' },
];
const slots = [
	{ name: 'trigger', type: 'slot', default: '—', description: 'Element that opens the dialog when clicked.' },
	{ name: 'default', type: 'slot', default: '—', description: 'Dialog body.' },
	{ name: 'footer', type: 'slot', default: 'Close button', description: 'Action buttons. Add `data-close` to any to dismiss.' },
];
const keys = [
	{ k: 'Esc', d: 'Closes the topmost open dialog (native).' },
	{ k: 'Tab / Shift+Tab', d: 'Focus stays within the dialog while open (native top-layer).' },
	{ k: 'Click backdrop', d: 'Dismisses the dialog. Add `static` on the host to disable.' },
];
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Dialog"
			tagline="A modal you trust — built on the native HTML <dialog> element. Top-layer rendering escapes any parent overflow or stacking context, and dialogs stack correctly when nested."
			tag="<element-dialog>"
		>
			<DocSection eyebrow="Demo" title="Live preview">
				<Demo>
					<ElButton variant="danger" @click="open = true">Delete project</ElButton>
					<ElDialog v-model="open" title="Delete project?" description="This will permanently delete the project and all of its data.">
						<p class="text-sm text-skin-secondary">There is no undo. Type the project name to confirm.</p>
						<input class="mt-3 h-10 w-full rounded-full border border-skin-border bg-skin-background px-4 text-sm" placeholder="my-project" />
						<template #footer>
							<ElButton variant="secondary" @click="open = false">Cancel</ElButton>
							<ElButton variant="danger" @click="open = false">Delete</ElButton>
						</template>
					</ElDialog>
				</Demo>
			</DocSection>

			<DocSection eyebrow="Demo" title="Nested dialogs">
				<Demo>
					<ElButton variant="danger" @click="outer = true">Delete project…</ElButton>

					<ElDialog v-model="outer" title="Delete project?" description="This action cannot be undone.">
						<p class="text-sm text-skin-secondary">All issues, comments, and uploads will be removed.</p>
						<template #footer>
							<ElButton variant="secondary" @click="outer = false">Cancel</ElButton>
							<ElButton variant="danger" @click="confirm = true">Continue</ElButton>
						</template>

						<ElDialog v-model="confirm" title="Final confirmation" description="Type the project name to confirm deletion.">
							<ElTextInput v-model="projectName" label="Project name" placeholder="my-project" />
							<template #footer>
								<ElButton variant="secondary" @click="confirm = false">Back</ElButton>
								<ElButton variant="danger" :disabled="projectName !== 'my-project'" @click="confirm = false; outer = false; projectName = ''">
									Delete forever
								</ElButton>
							</template>
						</ElDialog>
					</ElDialog>
				</Demo>
				<p class="mt-3 text-sm text-skin-secondary">
					The second dialog opens on top of the first — native top-layer stacking means no z-index gymnastics. Press
					<kbd class="rounded bg-skin-surface px-1.5 py-0.5 font-mono text-[11px] ring-1 ring-skin-border">Esc</kbd>
					to dismiss the topmost dialog; the one behind stays open.
				</p>
				<CodeBlock class="mt-4" :code="usageNested" lang="vue" />
			</DocSection>

			<DocSection eyebrow="Why <dialog>" title="Built on the platform">
				<div class="grid gap-3 sm:grid-cols-2">
					<div v-for="b in [
						{ t: 'Top layer', d: 'showModal() promotes the dialog above every stacking context — no overflow, transform or z-index can clip it.' },
						{ t: 'Native stacking', d: 'Open as many dialogs as you need; the browser stacks them and Esc dismisses the topmost.' },
						{ t: 'Scroll lock', d: 'Body scroll is locked automatically while a modal is open.' },
						{ t: '::backdrop', d: 'A pseudo-element you can style with CSS — blur, fade, animate, all native.' },
					]" :key="b.t" class="rounded-xl border border-skin-border bg-skin-surface/40 p-4">
						<p class="text-sm font-semibold tracking-tight text-skin-primary">{{ b.t }}</p>
						<p class="mt-1 text-sm text-skin-secondary">{{ b.d }}</p>
					</div>
				</div>
			</DocSection>

			<DocSection eyebrow="Usage" title="Vue">
				<CodeBlock :code="usageVue" lang="vue" />
			</DocSection>

			<DocSection eyebrow="Usage" title="Web component">
				<CodeBlock :code="usageWeb" lang="html" />
			</DocSection>

			<DocSection title="Props">
				<PropsTable :rows="props" />
			</DocSection>

			<DocSection title="Slots">
				<PropsTable :rows="slots" title="Slots" />
			</DocSection>

			<DocSection title="Keyboard">
				<ul class="space-y-2 rounded-2xl border border-skin-border bg-skin-surface/40 p-5 text-sm">
					<li v-for="row in keys" :key="row.k" class="flex items-start gap-4">
						<kbd class="rounded bg-skin-background px-2 py-0.5 font-mono text-xs ring-1 ring-skin-border">{{ row.k }}</kbd>
						<span class="text-skin-secondary">{{ row.d }}</span>
					</li>
				</ul>
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
