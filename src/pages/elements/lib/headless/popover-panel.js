import { isBrowser, uid } from './base.js';

/** Wire a panel for the native Popover API (top layer + light dismiss). */
export function preparePopoverPanel(panel, trigger) {
	if (!panel) return;
	const id = uid('pop');
	panel.id = panel.id || `${id}-panel`;
	if (!panel.hasAttribute('popover')) {
		panel.setAttribute('popover', 'auto');
	}
	trigger?.setAttribute('aria-controls', panel.id);
}

export function setPopoverOpen(panel, open) {
	if (!panel) return;
	if (open) openPopoverPanel(panel);
	else closePopoverPanel(panel);
}

/** Show a popover panel and anchor it under `trigger` (re-run after top-layer promotion). */
export function openPopoverPanel(panel, trigger, options = {}, afterPlace) {
	if (!panel) return;
	const place = () => {
		if (trigger) positionPopoverPanel(panel, trigger, options);
		afterPlace?.();
	};
	panel.showPopover?.();
	place();
	requestAnimationFrame(place);
}

export function closePopoverPanel(panel) {
	panel.hidePopover?.();
}

export function isPopoverOpen(panel) {
	return !!panel?.matches?.(':popover-open');
}

/** Anchor a top-layer popover panel under its trigger (fixed coords). */
export function positionPopoverPanel(panel, trigger, { align = 'left', offset = 8 } = {}) {
	if (!panel || !trigger || typeof window === 'undefined') return;
	const r = trigger.getBoundingClientRect();
	panel.style.position = 'fixed';
	panel.style.top = `${r.bottom + offset}px`;
	panel.style.margin = '0';
	panel.style.transform = '';
	if (align === 'right') {
		panel.style.left = 'auto';
		panel.style.right = `${window.innerWidth - r.right}px`;
	} else if (align === 'center') {
		panel.style.left = `${r.left + r.width / 2}px`;
		panel.style.right = 'auto';
		panel.style.transform = 'translateX(-50%)';
	} else {
		panel.style.left = `${r.left}px`;
		panel.style.right = 'auto';
	}
}

/** Keep the panel aligned while scrolling or resizing. Returns an unbind fn. */
export function attachPopoverReflow(panel, trigger, options = {}) {
	const update = () => positionPopoverPanel(panel, trigger, options);
	update();
	const onScroll = () => update();
	const onResize = () => update();
	window.addEventListener('scroll', onScroll, { capture: true, passive: true });
	window.addEventListener('resize', onResize);
	return () => {
		window.removeEventListener('scroll', onScroll, { capture: true });
		window.removeEventListener('resize', onResize);
	};
}

/** Sync host state when the browser opens/closes the popover. Returns an unbind fn. */
export function bindPopoverToggle(panel, handler) {
	const onToggle = (e) => handler(e.newState === 'open');
	panel.addEventListener('toggle', onToggle);
	return () => panel.removeEventListener('toggle', onToggle);
}

const STYLE_ID = 'element-popover-panel-styles';

/** Hide closed popover panels; reset UA margin so fixed coords work. */
export function ensurePopoverPanelStyles() {
	if (!isBrowser || document.getElementById(STYLE_ID)) return;
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = `
[popover].el-popover-panel,
[popover].el-dropdown-menu {
	margin: 0;
}
[popover].el-popover-panel:not(:popover-open),
[popover].el-dropdown-menu:not(:popover-open) {
	display: none;
}
`;
	document.head.appendChild(style);
}

ensurePopoverPanelStyles();
