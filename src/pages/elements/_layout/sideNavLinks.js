import { getComponentRecords, labelFromSection } from './componentManager.js';
import { inspectComponentRecord } from './componentInspector.js';

const sidebarComponentSectionOrder = ['components', 'forms', 'visual'];

const staticIconPaths = {
	'AI builders': 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm6 9 .9 2.6 2.6.9-2.6.9L18 20l-.9-2.6-2.6-.9 2.6-.9L18 12Z',
	Theming: 'M12 3v18M5 8h14M7 16h10',
	'Component spec': 'M6 5h12v14H6V5Zm3 4h6M9 13h6M9 17h3',
	Studio: 'M4 5h16v14H4V5Zm4 4h8M8 13h5',
	Playground: 'M8 4l8 8-8 8',
	Dashboard: 'M4 5h7v7H4V5Zm9 0h7v5h-7V5ZM4 14h7v5H4v-5Zm9-2h7v7h-7v-7Z',
	Chat: 'M5 6h14v9H9l-4 4V6Z',
	Mail: 'M4 6h16v12H4V6Zm0 0 8 7 8-7',
	Forms: 'M7 4h10l3 3v13H7V4Zm10 0v4h4M10 12h7M10 16h5',
	Login: 'M10 17l5-5-5-5M15 12H3M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5',
	'Application layout': 'M4 5h16v14H4V5Zm5 0v14M12 9h5M12 13h4',
	Overview: 'M5 5h14v14H5V5Zm4 4h6M9 13h6',
	Dropdown: 'M7 10l5 5 5-5',
	Dialog: 'M5 6h14v12H5V6Zm4 4h6',
	Drawer: 'M4 5h16v14H4V5Zm0 0h6v14',
	Popover: 'M6 7h12v8H9l-3 3V7Z',
	Tabs: 'M4 7h7v4H4V7Zm9 0h7v4h-7V7ZM4 11h16v8H4v-8Z',
	Toggle: 'M8 9h8a3 3 0 0 1 0 6H8a3 3 0 0 1 0-6Zm0 0a3 3 0 0 0 0 6',
	Tooltip: 'M5 5h14v9H9l-4 4V5Z',
	Accordion: 'M7 8h10M7 16h10M9 6l-2 2 2 2M15 14l2 2-2 2',
	Button: 'M8 8h8a4 4 0 0 1 0 8H8a4 4 0 0 1 0-8Z',
	'Command palette': 'M6 7h12M8 12h8M8 17h4M17 15l2 2-2 2',
	Menu: 'M6 7h12M6 12h12M6 17h12',
	Toast: 'M6 7h12v8H9l-3 3V7Z',
	Card: 'M5 7h14v10H5V7Zm3 3h8M8 14h5',
	Combobox: 'M5 7h14M7 12h8M7 17h5',
	Autocomplete: 'M5 11h10M5 16h7M16 16l3 3M14 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
	'Boolean input': 'M8 12l2.5 2.5L16 9M5 5h14v14H5V5Z',
	'Boolean Input': 'M8 12l2.5 2.5L16 9M5 5h14v14H5V5Z',
	Calendar: 'M7 4v3M17 4v3M5 8h14M6 6h12v13H6V6Zm3 6h2M13 12h2M9 16h2',
	Checkbox: 'M8 12l2.5 2.5L16 9M5 5h14v14H5V5Z',
	'Code input': 'M9 8l-4 4 4 4M15 8l4 4-4 4M13 6l-2 12',
	'Color input': 'M12 4a8 8 0 1 0 0 16h1.5a1.5 1.5 0 0 0 0-3H12a2 2 0 0 1 0-4h2a6 6 0 0 0-2-9ZM8 10h.01M10 7h.01M14 7h.01',
	'Color Input': 'M12 4a8 8 0 1 0 0 16h1.5a1.5 1.5 0 0 0 0-3H12a2 2 0 0 1 0-4h2a6 6 0 0 0-2-9ZM8 10h.01M10 7h.01M14 7h.01',
	Field: 'M6 7h12M6 11h12M6 15h8M5 5h14v14H5V5Z',
	'JSON input': 'M8 8l-3 4 3 4M16 8l3 4-3 4M11 6h2M10 18h4',
	'JSON list input': 'M8 7h11M8 12h11M8 17h11M5 7h.01M5 12h.01M5 17h.01',
	Listbox: 'M6 6h12v12H6V6Zm3 4h6M9 14h4',
	'Native select': 'M6 7h12v10H6V7Zm4 4h4M9 14l3 3 3-3',
	'Number input': 'M9 5l-2 14M15 5l-2 14M5 9h14M5 15h14',
	'Number Input': 'M9 5l-2 14M15 5l-2 14M5 9h14M5 15h14',
	'Password input': 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v8H6v-8Zm6 3v2',
	'Radio group': 'M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z',
	'Select input': 'M6 7h12v10H6V7Zm3 4h6M10 14l2 2 2-2',
	'Select Input': 'M6 7h12v10H6V7Zm3 4h6M10 14l2 2 2-2',
	'Text input': 'M5 7h14M12 7v10M8 17h8',
	'Text Input': 'M5 7h14M12 7v10M8 17h8',
	Textarea: 'M6 6h12v12H6V6Zm3 4h6M9 13h6M9 16h4',
	'Textarea Input': 'M6 6h12v12H6V6Zm3 4h6M9 13h6M9 16h4',
};

const componentNavGroups = groupsFromDiscoveredComponents();

export const sideNavLinks = [
	{
		label: 'Tooling',
		items: [
			{ to: '/elements/ai', label: 'AI builders', tag: 'New' },
			{ to: '/elements/theming', label: 'Theming', tag: 'New' },
			{ to: '/elements/component-spec', label: 'Component spec', tag: 'New' },
			{ to: '/elements/components/studio', label: 'Studio', tag: 'Pro' },
			{ to: '/elements/components/playground', label: 'Playground' },
		],
	},
	...componentNavGroups,
	{
		label: 'Blocks',
		items: [
			{ to: '/elements/blocks/dashboard', label: 'Dashboard', tag: 'New' },
			{ to: '/elements/blocks/chat', label: 'Chat', tag: 'New' },
			{ to: '/elements/blocks/mail', label: 'Mail', tag: 'New' },
			{ to: '/elements/blocks/forms', label: 'Forms', tag: 'New' },
			{ to: '/elements/blocks/login', label: 'Login', tag: 'New' },
			{ to: '/elements/blocks/application-layout', label: 'Application layout', tag: 'New' },
		],
	},
	{
		label: 'Headless',
		items: [
			{ to: '/elements/headless', label: 'Overview' },
			{ to: '/elements/headless/dropdown', label: 'Dropdown' },
			{ to: '/elements/headless/dialog', label: 'Dialog' },
			{ to: '/elements/headless/drawer', label: 'Drawer' },
			{ to: '/elements/headless/popover', label: 'Popover' },
			{ to: '/elements/headless/tabs', label: 'Tabs' },
			{ to: '/elements/headless/toggle', label: 'Toggle' },
			{ to: '/elements/headless/tooltip', label: 'Tooltip' },
			{ to: '/elements/headless/accordion', label: 'Accordion' },
			{ to: '/elements/headless/combobox', label: 'Combobox' },
			{ to: '/elements/headless/autocomplete', label: 'Autocomplete' },
		],
	},
].map((group) => ({
	...group,
	items: group.items.map((item) => ({
		...item,
		icon: item.icon || staticIconPaths[item.label] || 'M5 12h14',
	})),
}));

function groupsFromDiscoveredComponents() {
	const records = getComponentRecords()
		.map(inspectComponentRecord)
		.filter((record) => !record.navHidden)
		.sort(sortRecords);

	return sidebarComponentSectionOrder
		.map((section) => ({
			label: labelFromSection(section),
			items: records
				.filter((record) => record.section === section)
				.map((record) => ({
					to: record.route,
					label: record.label,
					tag: record.badge,
					icon: record.icon,
				})),
		}))
		.filter((group) => group.items.length);
}

function sortRecords(a, b) {
	const orderDelta = a.order - b.order;
	if (orderDelta) return orderDelta;
	return a.label.localeCompare(b.label);
}
