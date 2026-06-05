<script setup>
import ElementsLayout from '../_layout/ElementsLayout.vue';
import DocPage from '../_layout/DocPage.vue';
import DocSection from '../_layout/DocSection.vue';
import Example from '../_layout/docs/Example.vue';
import MobileExampleSection from './_components/MobileExampleSection.vue';
import MobileWorkspace from './examples/MobileWorkspace.vue';
import MobileWorkspaceSource from './examples/MobileWorkspace.vue?raw';

const mobileFoundations = [
	['ElAppShell', 'Full-screen app surface with safe-area-aware top and bottom slots.'],
	['ElAppTopBar', 'Compact app header with leading and trailing action slots.'],
	['ElAppBottomNav', 'Thumb-friendly primary navigation for app tabs.'],
	['ElAppListItem', 'Touch-sized rows for settings, menus, inboxes, and task lists.'],
	['ElSafeArea', 'Safe-area padding for app chrome around cutouts and home indicators.'],
	['ElTextInput', 'Use the shared text input with type="search" for mobile search fields.'],
	['ElActionSheet', 'Bottom action sheet for app choices and destructive commands.'],
];

const platformPoints = [
	{
		title: 'The web works brilliantly for apps',
		description: 'The DOM, CSS, and browser event model are stable platform contracts. Every major device vendor has to keep the web working, which makes it a calmer base for mobile apps than another proprietary rendering bridge.',
	},
	{
		title: 'Avoid another rendering pipeline',
		description: 'A React-to-native layer turns browser-oriented UI into native widgets through an extra conversion step. As iOS and Android shift, that bridge needs constant maintenance. A web UI keeps the rendering path direct.',
	},
	{
		title: 'Native feel is humble CSS',
		description: 'Safe areas, fixed app chrome, contained scrolling, motion, large touch targets, active states, and thumb-first layouts are all achievable with straightforward CSS and reusable Elements primitives.',
	},
	{
		title: 'Use JavaScript for device behaviour',
		description: 'Haptics, sharing, camera flows, keyboard behaviour, notifications, and storage can be reached through JavaScript APIs and Capacitor plugins while the interface remains normal web code.',
	},
];
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Mobile"
			eyebrow="Elements"
			tag="<ElAppShell>"
			tagline="Capacitor-ready app components shown inside a phone preview shell, with safe areas, thumb navigation, sheets, and native-feeling app chrome."
		>
			<DocSection eyebrow="Overview" title="Web-first mobile apps">
				<div class="max-w-3xl space-y-4 text-sm leading-7 text-muted-foreground">
					<p>
						The web works brilliantly for mobile apps. It gives you the most stable rendering platform we have: HTML, CSS, and JavaScript running in a browser engine that every major device vendor must keep compatible.
					</p>
					<p>
						A native bridge such as React Native adds another rendering and conversion pipeline between React and proprietary native components. That can be useful in some teams, but it also creates extra maintenance pressure as iOS and Android evolve. With a web-first app, the DOM remains the rendering surface and your interface code stays portable.
					</p>
					<p>
						Capacitor gives the best of both worlds: reuse the web logic, components, routing, state, and styling you already have, then expose native functionality to JavaScript only where the app actually needs it.
					</p>
				</div>

				<div class="mt-6 grid gap-3 md:grid-cols-2">
					<div
						v-for="point in platformPoints"
						:key="point.title"
						class="rounded-lg border border-border bg-card p-4"
					>
						<p class="text-sm font-semibold text-foreground">{{ point.title }}</p>
						<p class="mt-1 text-xs leading-5 text-muted-foreground">{{ point.description }}</p>
					</div>
				</div>
			</DocSection>

			<MobileExampleSection
				title="Phone-first preview"
				description="App primitives in this section can be previewed in mobile chrome so docs feel closer to a real Capacitor app than a desktop component sandbox."
			>
				<template #notes>
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="rounded-lg border border-border bg-card p-4">
							<p class="text-sm font-semibold text-foreground">Capacitor posture</p>
							<p class="mt-1 text-xs leading-5 text-muted-foreground">Keep the UI web-native, then bridge native status bar, haptics, keyboard, camera, and share actions through Capacitor plugins.</p>
						</div>
						<div class="rounded-lg border border-border bg-card p-4">
							<p class="text-sm font-semibold text-foreground">Mobile defaults</p>
							<p class="mt-1 text-xs leading-5 text-muted-foreground">One scroll container, safe-area-aware chrome, large touch targets, and bottom actions for thumb reach.</p>
						</div>
					</div>
				</template>

				<Example
					:source="MobileWorkspaceSource"
					title="Live app shell"
					description="The rendered preview and source come from the same SFC, with the output mounted inside mobile chrome."
					filename="MobileWorkspace.vue"
					presentation="mobile"
					device-title="Live app shell"
					:preview-lines="10"
				>
					<MobileWorkspace />
				</Example>
			</MobileExampleSection>

			<DocSection eyebrow="Components" title="App primitives for mobile">
				<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					<div
						v-for="item in mobileFoundations"
						:key="item[0]"
						class="rounded-lg border border-border bg-card p-4"
					>
						<code class="text-xs font-semibold text-foreground">&lt;{{ item[0] }}&gt;</code>
						<p class="mt-2 text-sm leading-6 text-muted-foreground">{{ item[1] }}</p>
					</div>
				</div>
			</DocSection>

		</DocPage>
	</ElementsLayout>
</template>
