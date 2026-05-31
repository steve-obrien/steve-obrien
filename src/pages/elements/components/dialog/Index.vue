<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import Playground from '../../_layout/docs/Playground.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentSlots from '../../_layout/docs/ComponentSlots.vue';
import ComponentEvents from '../../_layout/docs/ComponentEvents.vue';
import ComponentKeyboard from '../../_layout/docs/ComponentKeyboard.vue';
import RelatedComponents from '../../_layout/docs/RelatedComponents.vue';
import { ElDialog } from '../../lib/vue';

import PlaygroundDialog from './examples/Playground.vue';
import PlaygroundDialogSrc from './examples/Playground.vue?raw';
import Delete from './examples/Delete.vue';
import DeleteSrc from './examples/Delete.vue?raw';
import TermsScroll from './examples/TermsScroll.vue';
import TermsScrollSrc from './examples/TermsScroll.vue?raw';
import Nested from './examples/Nested.vue';
import NestedSrc from './examples/Nested.vue?raw';
import Programmatic from './examples/Programmatic.vue';
import ProgrammaticSrc from './examples/Programmatic.vue?raw';
import ProgrammaticDialogs from './examples/ProgrammaticDialogs.vue';
import ProgrammaticDialogsSrc from './examples/ProgrammaticDialogs.vue?raw';
import Custom from './examples/Custom.vue';
import CustomSrc from './examples/Custom.vue?raw';

const doc = ElDialog.__doc;
</script>

<template>
	<ElementsLayout>
		<DocPage :name="doc.name" :tagline="doc.description" :tag="doc.tag">
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:component="PlaygroundDialog"
					:source="PlaygroundDialogSrc"
					:inspect="ElDialog"
					filename="Playground.vue"
					title="Dialog playground"
					description="Edit any prop on the right — open the dialog with the trigger to preview title, description, and footer actions. Source shows the SFC you would write; Data shows the live props object."
				/>
			</DocSection>

			<DocSection eyebrow="Demo" title="Delete confirmation">
				<Example
					:source="DeleteSrc"
					filename="Delete.vue"
					description="A destructive action pattern — title, description, body copy, and footer buttons bound with v-model."
				>
					<Delete />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Scrollable terms">
				<Example
					:source="TermsScrollSrc"
					filename="TermsScroll.vue"
					description="A long-form agreement pattern that keeps the dialog footer visible while the terms scroll inside the dialog body."
				>
					<TermsScroll />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Programmatic control">
				<Example
					:source="ProgrammaticSrc"
					filename="Programmatic.vue"
					description="Omit the trigger slot — open, close, or toggle via a template ref, or drive state with v-model."
				>
					<Programmatic />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Programmatic dialogs">
				<Example
					:source="ProgrammaticDialogsSrc"
					filename="ProgrammaticDialogs.vue"
					description="Mount one stack and call useDialogs() from script to await confirmations, component forms, or schema-driven forms."
				>
					<ProgrammaticDialogs />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Nested dialogs">
				<Example
					:source="NestedSrc"
					filename="Nested.vue"
					description="Nest a second dialog inside the first — native top-layer stacking means no z-index gymnastics. Esc dismisses the topmost dialog; the one behind stays open."
				>
					<Nested />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Custom dialogs">
				<Example
					:source="CustomSrc"
					filename="Custom.vue"
					description="Full inner control"
				>
					<Custom />
				</Example>
			</DocSection>

			<DocSection eyebrow="Usage" title="Plain HTML">
				<p class="text-sm leading-relaxed text-muted-foreground">
					Use the headless custom element when you want the same native dialog behaviour in plain HTML or another framework.
					The headless page includes copyable dialog examples with trigger, close, static, and programmatic controls.
				</p>
				<RouterLink
					to="/elements/headless/dialog"
					class="mt-4 inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
				>
					View headless dialog
				</RouterLink>
			</DocSection>

			<DocSection eyebrow="Why &lt;dialog&gt;" title="Built on the platform">
				<div class="grid gap-3 sm:grid-cols-2">
					<div
						v-for="b in [
							{ t: 'Top layer', d: 'showModal() promotes the dialog above every stacking context — no overflow, transform or z-index can clip it.' },
							{ t: 'Native stacking', d: 'Open as many dialogs as you need; the browser stacks them and Esc dismisses the topmost.' },
							{ t: 'Scroll lock', d: 'Body scroll is locked automatically while a modal is open.' },
							{ t: '::backdrop', d: 'A pseudo-element you can style with CSS — blur, fade, animate, all native.' },
						]"
						:key="b.t"
						class="rounded-xl border border-border bg-secondary/40 p-4"
					>
						<p class="text-sm font-semibold tracking-tight text-foreground">{{ b.t }}</p>
						<p class="mt-1 text-sm text-muted-foreground">{{ b.d }}</p>
					</div>
				</div>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElDialog" />
			</DocSection>

			<ComponentSlots :component="ElDialog" />
			<ComponentEvents :component="ElDialog" />
			<ComponentKeyboard :component="ElDialog" />
			<RelatedComponents />
		</DocPage>
	</ElementsLayout>
</template>
