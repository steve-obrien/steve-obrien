import { isBrowser, uid } from './base.js';
import {
	applyFloatingPosition,
	autoUpdateFloating,
} from './floating.js';

const leaveTimers = new WeakMap();
const leaveDuration = 820;
const transitionClasses = ['el-floating-transition', 'el-popover-transition'];

function hasFloatingTransition(panel) {
	return transitionClasses.some((className) => panel?.classList.contains(className));
}

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

function sideOf(placement = 'bottom') {
	return String(placement).split('-')[0] || 'bottom';
}

/** Show a popover panel and anchor it under `trigger` (re-run after top-layer promotion). */
export function openPopoverPanel(panel, trigger, options = {}, afterPlace) {
	if (!panel) return;
	const pendingClose = leaveTimers.get(panel);
	if (pendingClose) {
		clearTimeout(pendingClose);
		leaveTimers.delete(panel);
	}
	delete panel.dataset.leaving;
	delete panel.dataset.skipLeave;
	panel.dataset.side = sideOf(options.placement);
	panel.dataset.placement = options.placement || 'bottom';
	panel.dataset.entering = 'from';
	const place = () => {
		if (trigger) positionPopoverPanel(panel, trigger, { ...options, animatePlacement: true });
		afterPlace?.();
	};
	if (!isPopoverOpen(panel)) panel.showPopover?.();
	place();
	requestAnimationFrame(() => {
		place();
		panel.dataset.entering = 'to';
		const finish = () => {
			if (panel.dataset.entering === 'to') delete panel.dataset.entering;
			panel.removeEventListener('transitionend', finish);
		};
		panel.addEventListener('transitionend', finish);
		setTimeout(finish, 320);
	});
}

function finishClose(panel) {
	leaveTimers.delete(panel);
	panel.dataset.skipLeave = 'true';
	if (isPopoverOpen(panel)) panel.hidePopover?.();
	delete panel.dataset.skipLeave;
	delete panel.dataset.leaving;
}

export function closePopoverPanel(panel, { immediate = false } = {}) {
	if (!panel) return;
	delete panel.dataset.entering;
	const pendingClose = leaveTimers.get(panel);
	if (pendingClose) clearTimeout(pendingClose);
	if (immediate || !isPopoverOpen(panel) || !hasFloatingTransition(panel)) {
		finishClose(panel);
		return;
	}
	panel.dataset.leaving = 'from';
	panel.getBoundingClientRect();
	requestAnimationFrame(() => {
		if (panel.dataset.leaving === 'from') panel.dataset.leaving = 'to';
	});
	leaveTimers.set(panel, setTimeout(() => finishClose(panel), leaveDuration));
}

export function isPopoverOpen(panel) {
	return !!panel?.matches?.(':popover-open');
}

/** Anchor a top-layer popover panel under its trigger (fixed coords). */
export function positionPopoverPanel(panel, trigger, { align = 'left', offset = 8, placement = 'bottom', padding = 8, mode = 'viewport', flip = true, animatePlacement } = {}) {
	if (!panel || !trigger || typeof window === 'undefined') return;
	const result = applyFloatingPosition(trigger, panel, { align, offset, placement, padding, mode, flip });
	if (result) {
		const shouldAnimatePlacement = panel.dataset.entering || panel.dataset.leaving
			? true
			: animatePlacement ?? !result.flipped;
		panel.toggleAttribute('data-placement-ready', true);
		panel.toggleAttribute('data-animate-placement', shouldAnimatePlacement);
	}
	return result;
}

/** Keep the panel aligned while scrolling or resizing. Returns an unbind fn. */
export function attachPopoverReflow(panel, trigger, options = {}) {
	const update = () => positionPopoverPanel(panel, trigger, options);
	update();
	return autoUpdateFloating(trigger, panel, update);
}

export function readFloatingPositionOptions(host, defaults = {}) {
	const {
		align = 'left',
		offset = 8,
		placement = 'bottom',
		padding = 8,
		mode = 'viewport',
		flip,
	} = defaults;
	const options = {
		align: host.getAttribute('align') || align,
		offset: Number(host.getAttribute('offset') || offset),
		placement: host.getAttribute('placement') || placement,
		padding: Number(host.getAttribute('collision-padding') || padding),
		mode: host.getAttribute('floating-mode') || mode,
	};
	if (flip !== undefined) options.flip = host.getAttribute('flip') !== 'false';
	return options;
}

export function bindFloatingReflow(host, panel, trigger, options = {}) {
	host._reflowOff?.();
	host._reflowOff = attachPopoverReflow(panel, trigger, options);
}

export function unbindFloatingReflow(host) {
	host._reflowOff?.();
	host._reflowOff = null;
}

export function syncFloatingScrollLock(host, panel, next, stateKey = '_scrollLocked') {
	if (next && host.hasAttribute('lock-scroll') && !host[stateKey]) {
		lockDocumentScroll(panel);
		host[stateKey] = true;
	} else if ((!next || !host.hasAttribute('lock-scroll')) && host[stateKey]) {
		unlockDocumentScroll(panel);
		host[stateKey] = false;
	}
}

/** Sync host state when the browser opens/closes the popover. Returns an unbind fn. */
export function bindPopoverToggle(panel, handler) {
	const onBeforeToggle = (e) => {
		if (
			e.newState === 'closed'
			&& panel.dataset.skipLeave !== 'true'
			&& hasFloatingTransition(panel)
			&& isPopoverOpen(panel)
		) {
			e.preventDefault();
			handler(false);
			closePopoverPanel(panel);
		}
	};
	const onToggle = (e) => handler(e.newState === 'open');
	panel.addEventListener('beforetoggle', onBeforeToggle);
	panel.addEventListener('toggle', onToggle);
	return () => {
		panel.removeEventListener('beforetoggle', onBeforeToggle);
		panel.removeEventListener('toggle', onToggle);
	};
}

let scrollLockCount = 0;
let previousHtmlOverflow = '';
let previousHtmlOverscrollBehavior = '';
let previousBodyOverflow = '';
let previousBodyPaddingRight = '';
let previousBodyOverscrollBehavior = '';
let scrollLockOff = null;
let touchStartY = 0;
const scrollLockPanels = new Set();

function lockedPanelFor(target) {
	for (const panel of scrollLockPanels) {
		if (panel?.isConnected && panel.contains(target)) return panel;
	}
	return null;
}

function closestScrollable(target, panel) {
	let node = target instanceof Element ? target : target?.parentElement;
	while (node && node !== document.body) {
		if (node instanceof Element) {
			const style = window.getComputedStyle(node);
			const overflow = `${style.overflowY} ${style.overflow}`;
			if (/(auto|scroll|overlay)/.test(overflow) && node.scrollHeight > node.clientHeight) {
				return node;
			}
		}
		if (node === panel) break;
		node = node.parentElement;
	}
	return null;
}

function canScrollElement(element, deltaY) {
	if (!element || !deltaY) return false;
	if (deltaY < 0) return element.scrollTop > 0;
	return element.scrollTop + element.clientHeight < element.scrollHeight - 1;
}

function canScrollInsideLockedPanel(target, deltaY) {
	const panel = lockedPanelFor(target);
	if (!panel) return false;
	return canScrollElement(closestScrollable(target, panel), deltaY);
}

function bindScrollLockEvents() {
	const onWheel = (event) => {
		if (canScrollInsideLockedPanel(event.target, event.deltaY)) return;
		event.preventDefault();
	};
	const onTouchStart = (event) => {
		touchStartY = event.touches?.[0]?.clientY ?? 0;
	};
	const onTouchMove = (event) => {
		const nextY = event.touches?.[0]?.clientY ?? touchStartY;
		const deltaY = touchStartY - nextY;
		if (canScrollInsideLockedPanel(event.target, deltaY)) {
			touchStartY = nextY;
			return;
		}
		event.preventDefault();
	};
	const onKeydown = (event) => {
		if (lockedPanelFor(event.target)) return;
		if (!['ArrowDown', 'ArrowUp', 'End', 'Home', 'PageDown', 'PageUp', ' '].includes(event.key)) return;
		event.preventDefault();
	};
	document.addEventListener('wheel', onWheel, { capture: true, passive: false });
	document.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
	document.addEventListener('touchmove', onTouchMove, { capture: true, passive: false });
	document.addEventListener('keydown', onKeydown, true);
	return () => {
		document.removeEventListener('wheel', onWheel, true);
		document.removeEventListener('touchstart', onTouchStart, true);
		document.removeEventListener('touchmove', onTouchMove, true);
		document.removeEventListener('keydown', onKeydown, true);
	};
}

export function lockDocumentScroll(panel) {
	if (!isBrowser) return;
	if (panel) scrollLockPanels.add(panel);
	scrollLockCount += 1;
	if (scrollLockCount > 1) return;
	previousHtmlOverflow = document.documentElement.style.overflow;
	previousHtmlOverscrollBehavior = document.documentElement.style.overscrollBehavior;
	previousBodyOverflow = document.body.style.overflow;
	previousBodyPaddingRight = document.body.style.paddingRight;
	previousBodyOverscrollBehavior = document.body.style.overscrollBehavior;
	const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
	document.documentElement.style.overflow = 'hidden';
	document.documentElement.style.overscrollBehavior = 'contain';
	document.body.style.overflow = 'hidden';
	document.body.style.overscrollBehavior = 'contain';
	if (scrollbarWidth > 0) {
		document.body.style.paddingRight = `${scrollbarWidth}px`;
	}
	scrollLockOff = bindScrollLockEvents();
}

export function unlockDocumentScroll(panel) {
	if (!isBrowser || scrollLockCount === 0) return;
	if (panel) scrollLockPanels.delete(panel);
	scrollLockCount -= 1;
	if (scrollLockCount > 0) return;
	scrollLockPanels.clear();
	scrollLockOff?.();
	scrollLockOff = null;
	document.documentElement.style.overflow = previousHtmlOverflow;
	document.documentElement.style.overscrollBehavior = previousHtmlOverscrollBehavior;
	document.body.style.overflow = previousBodyOverflow;
	document.body.style.paddingRight = previousBodyPaddingRight;
	document.body.style.overscrollBehavior = previousBodyOverscrollBehavior;
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
	overflow: visible;
}
[popover].el-popover-panel:not(:popover-open),
[popover].el-dropdown-menu:not(:popover-open) {
	display: none;
}
`;
	document.head.appendChild(style);
}

ensurePopoverPanelStyles();
