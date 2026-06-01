<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import Example from '../../_layout/docs/Example.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentSlots from '../../_layout/docs/ComponentSlots.vue';
import ComponentEvents from '../../_layout/docs/ComponentEvents.vue';
import { ElSplitterPanel } from '../../lib/vue';

import EditorWorkspace from './examples/EditorWorkspace.vue';
import EditorWorkspaceSrc from './examples/EditorWorkspace.vue?raw';
import InboxReview from './examples/InboxReview.vue';
import InboxReviewSrc from './examples/InboxReview.vue?raw';
import DataWorkbench from './examples/DataWorkbench.vue';
import DataWorkbenchSrc from './examples/DataWorkbench.vue?raw';
import NestedWorkspace from './examples/NestedWorkspace.vue';
import NestedWorkspaceSrc from './examples/NestedWorkspace.vue?raw';

const doc = ElSplitterPanel.__doc;

const usageVue = `<script setup>
import { ref } from 'vue';
import { ElSplitterPanel } from '@elements/vue';

const left = ref(280);
const right = ref(360);
<\/script>

<template>
\t<ElSplitterPanel
\t\tv-model:start-size="left"
\t\tv-model:end-size="right"
\t\tclass="h-screen"
\t\t:min-start="220"
\t\t:min-main="560"
\t\t:min-end="320"
\t\thandle-class="transition hover:bg-border/70 data-[dragging=true]:bg-ring/30"
\t>
\t\t<template #start>
\t\t\t<FileBrowser />
\t\t</template>

\t\t<VisualStage />

\t\t<template #end>
\t\t\t<InspectorPanel />
\t\t</template>
\t</ElSplitterPanel>
</template>`;

const verticalVue = `<script setup>
import { ref } from 'vue';
import { ElSplitterPanel } from '@elements/vue';

const previewHeight = ref(420);
<\/script>

<template>
\t<ElSplitterPanel
\t\tv-model:start-size="previewHeight"
\t\torientation="vertical"
\t\tclass="h-full"
\t\t:min-start="240"
\t\t:min-main="160"
\t\t:handle-size="10"
\t>
\t\t<template #start>
\t\t\t<PreviewCanvas />
\t\t</template>

\t\t<ConsolePanel />
\t</ElSplitterPanel>
</template>`;
</script>

<template>
	<ElementsLayout>
		<DocPage :name="doc.name" :tagline="doc.description" :tag="doc.tag">
			<DocSection eyebrow="Why" title="Use it as an application shell">
				<div class="max-w-3xl space-y-4 text-sm leading-7 text-muted-foreground">
					<p>
						A splitter rarely makes sense as an isolated widget. It is a layout primitive for tools where users need to balance navigation, work area, and detail panels without leaving the current screen.
					</p>
					<p>
						The component keeps the center pane fluid, clamps the side panes to useful minimum widths, supports horizontal or vertical split directions, and emits size updates so an app can remember a user's preferred workspace.
					</p>
				</div>
			</DocSection>

			<DocSection eyebrow="Demo" title="Editor workspace">
				<Example
					:source="EditorWorkspaceSrc"
					filename="EditorWorkspace.vue"
					description="A file browser, visual stage, and inspector: the same shape used by the experimental template editor."
					default-open
				>
					<EditorWorkspace />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Two-pane review">
				<Example
					:source="InboxReviewSrc"
					filename="InboxReview.vue"
					description="Omit the end slot when a list/detail layout only needs one resizable side panel."
				>
					<InboxReview />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Nested layout">
				<Example
					:source="NestedWorkspaceSrc"
					filename="NestedWorkspace.vue"
					description="Combine horizontal and vertical splitters to build denser editor, console, and inspector layouts."
				>
					<NestedWorkspace />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Data workbench">
				<Example
					:source="DataWorkbenchSrc"
					filename="DataWorkbench.vue"
					description="Three-pane layouts are useful for database browsers, admin tools, and API consoles."
				>
					<DataWorkbench />
				</Example>
			</DocSection>

			<DocSection eyebrow="Usage" title="Vue">
				<CodeBlock :code="usageVue" lang="vue" />
			</DocSection>

			<DocSection eyebrow="Usage" title="Vertical splitter">
				<CodeBlock :code="verticalVue" lang="vue" />
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElSplitterPanel" />
				<ComponentEvents :component="ElSplitterPanel" />
			</DocSection>

			<ComponentSlots :component="ElSplitterPanel" />
		</DocPage>
	</ElementsLayout>
</template>
