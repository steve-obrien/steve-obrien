<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import Playground from '../../_layout/docs/Playground.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentEvents from '../../_layout/docs/ComponentEvents.vue';
import ComponentKeyboard from '../../_layout/docs/ComponentKeyboard.vue';
import { ElTreeView } from '../../lib/vue';
import Layers from './examples/Layers.vue';
import LayersSrc from './examples/Layers.vue?raw';
import FileBrowser from './examples/FileBrowser.vue';
import FileBrowserSrc from './examples/FileBrowser.vue?raw';
import AsyncLoading from './examples/AsyncLoading.vue';
import AsyncLoadingSrc from './examples/AsyncLoading.vue?raw';

const folderIcon = 'M4 6h6l2 2h8v10H4V6Z';
const fileIcon = 'M6 4h8l4 4v12H6V4Zm8 0v5h5';
const initialItems = [
	{
		id: 'frame',
		label: 'Frame',
		icon: folderIcon,
		open: true,
		children: [
			{ id: 'header', label: 'Header', icon: folderIcon, children: [{ id: 'logo', label: 'Logo', icon: fileIcon }] },
			{ id: 'content', label: 'Content', icon: fileIcon },
		],
	},
	{ id: 'footer', label: 'Footer', icon: fileIcon },
];
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Tree view"
			tagline="Keyboard navigable trees for layers panels, file browsers, document outlines, and async server-backed hierarchies."
			tag="<ElTreeView>"
		>
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:inspect="ElTreeView"
					:initial="{ modelValue: 'content', items: initialItems }"
					title="Tree view playground"
					description="Edit the data, select nodes, expand branches, and reorder items with drag and drop."
				/>
			</DocSection>

			<DocSection eyebrow="Demo" title="Figma-style layers">
				<Example
					:source="LayersSrc"
					filename="Layers.vue"
					description="Use v-model to programmatically highlight a layer from the stage, custom slots for metadata, and drag/drop to reorder the tree."
				>
					<Layers />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="File browser">
				<Example
					:source="FileBrowserSrc"
					filename="FileBrowser.vue"
					description="A file tree can use folder/file icons and comfortable row density while keeping the same keyboard navigation."
				>
					<FileBrowser />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Async loading">
				<Example
					:source="AsyncLoadingSrc"
					filename="AsyncLoading.vue"
					description="Lazy nodes emit load-children on expand. Show loading on the node, then replace its children from the server response."
				>
					<AsyncLoading />
				</Example>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElTreeView" />
				<ComponentEvents :component="ElTreeView" />
				<ComponentKeyboard :component="ElTreeView" />
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
