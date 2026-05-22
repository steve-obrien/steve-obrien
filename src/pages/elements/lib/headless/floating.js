const SIDE_OPTIONS = ['top', 'right', 'bottom', 'left'];
const ALIGN_OPTIONS = ['start', 'center', 'end'];
const FLOATING_MODES = ['viewport', 'anchor'];

function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

function normalizeAlign(value) {
	if (value === 'left') return 'start';
	if (value === 'right') return 'end';
	return ALIGN_OPTIONS.includes(value) ? value : 'start';
}

function normalizeMode(value) {
	if (value === 'element') return 'anchor';
	return FLOATING_MODES.includes(value) ? value : 'viewport';
}

function parsePlacement(placement = 'bottom', align = 'start') {
	const [rawSide, rawAlign] = String(placement).split('-');
	return {
		side: SIDE_OPTIONS.includes(rawSide) ? rawSide : 'bottom',
		align: normalizeAlign(rawAlign || align),
	};
}

function oppositeSide(side) {
	return {
		top: 'bottom',
		right: 'left',
		bottom: 'top',
		left: 'right',
	}[side] || 'bottom';
}

function getViewportRect(padding) {
	const viewport = window.visualViewport;
	const left = viewport ? viewport.offsetLeft : 0;
	const top = viewport ? viewport.offsetTop : 0;
	const width = viewport ? viewport.width : window.innerWidth;
	const height = viewport ? viewport.height : window.innerHeight;

	return {
		top: top + padding,
		right: left + width - padding,
		bottom: top + height - padding,
		left: left + padding,
	};
}

function overflowFor(x, y, width, height, bounds) {
	return {
		top: Math.max(bounds.top - y, 0),
		right: Math.max((x + width) - bounds.right, 0),
		bottom: Math.max((y + height) - bounds.bottom, 0),
		left: Math.max(bounds.left - x, 0),
	};
}

function hasOverflow(overflow) {
	return Object.values(overflow).some((value) => value > 0);
}

function axisSpace(side, reference, bounds, offset) {
	if (side === 'top') return reference.top - bounds.top - offset;
	if (side === 'right') return bounds.right - reference.right - offset;
	if (side === 'bottom') return bounds.bottom - reference.bottom - offset;
	return reference.left - bounds.left - offset;
}

function baseCoords(side, align, reference, floating, offset) {
	let x = reference.left;
	let y = reference.bottom + offset;

	if (side === 'top') y = reference.top - floating.height - offset;
	if (side === 'right') x = reference.right + offset;
	if (side === 'left') x = reference.left - floating.width - offset;

	if (side === 'top' || side === 'bottom') {
		if (align === 'center') x = reference.left + (reference.width / 2) - (floating.width / 2);
		if (align === 'end') x = reference.right - floating.width;
	} else {
		y = reference.top;
		if (align === 'center') y = reference.top + (reference.height / 2) - (floating.height / 2);
		if (align === 'end') y = reference.bottom - floating.height;
	}

	return { x, y };
}

function getOverflowSides(overflow) {
	return Object.entries(overflow)
		.filter(([, value]) => value > 0)
		.map(([side]) => side);
}

function getScrollParents(node) {
	const parents = [];
	let parent = node?.parentElement;

	while (parent && parent !== document.body) {
		const style = getComputedStyle(parent);
		const overflow = `${style.overflow}${style.overflowX}${style.overflowY}`;
		if (/(auto|scroll|overlay|hidden|clip)/.test(overflow)) parents.push(parent);
		parent = parent.parentElement;
	}

	parents.push(window);
	return parents;
}

export function computeFloatingPosition(referenceEl, floatingEl, options = {}) {
	if (!referenceEl || !floatingEl || typeof window === 'undefined') return null;

	const {
		placement = 'bottom',
		align = 'start',
		offset = 8,
		padding = 8,
		flip,
		shift,
	} = options;
	const mode = normalizeMode(options.mode || options.floatingMode);
	const shouldFlip = flip ?? mode === 'viewport';
	const shouldShift = shift ?? mode === 'viewport';
	const preferred = parsePlacement(placement, align);
	const bounds = getViewportRect(Number(padding) || 0);
	const reference = referenceEl.getBoundingClientRect();
	const floating = floatingEl.getBoundingClientRect();
	let side = preferred.side;
	const resolvedAlign = preferred.align;

	let coords = baseCoords(side, resolvedAlign, reference, floating, Number(offset) || 0);
	const initialOverflow = overflowFor(coords.x, coords.y, floating.width, floating.height, bounds);

	if (shouldFlip && hasOverflow(initialOverflow)) {
		const opposite = oppositeSide(side);
		if (axisSpace(opposite, reference, bounds, Number(offset) || 0) > axisSpace(side, reference, bounds, Number(offset) || 0)) {
			side = opposite;
			coords = baseCoords(side, resolvedAlign, reference, floating, Number(offset) || 0);
		}
	}

	let x = coords.x;
	let y = coords.y;

	if (shouldShift) {
		x = clamp(x, bounds.left, Math.max(bounds.left, bounds.right - floating.width));
		y = clamp(y, bounds.top, Math.max(bounds.top, bounds.bottom - floating.height));
	}

	const overflow = overflowFor(x, y, floating.width, floating.height, bounds);
	const placementName = resolvedAlign === 'center' ? side : `${side}-${resolvedAlign}`;

	return {
		x,
		y,
		mode,
		side,
		align: resolvedAlign,
		placement: placementName,
		flipped: side !== preferred.side,
		collision: initialOverflow,
		collisionSides: getOverflowSides(initialOverflow),
		overflow,
		overflowSides: getOverflowSides(overflow),
		availableWidth: Math.max(bounds.right - bounds.left, 0),
		availableHeight: Math.max(side === 'top'
			? reference.top - bounds.top - (Number(offset) || 0)
			: side === 'bottom'
				? bounds.bottom - reference.bottom - (Number(offset) || 0)
				: bounds.bottom - bounds.top, 0),
	};
}

export function applyFloatingPosition(referenceEl, floatingEl, options = {}) {
	const result = computeFloatingPosition(referenceEl, floatingEl, options);
	if (!result) return null;

	floatingEl.style.position = options.strategy || 'fixed';
	floatingEl.style.top = `${Math.round(result.y)}px`;
	floatingEl.style.left = `${Math.round(result.x)}px`;
	floatingEl.style.right = 'auto';
	floatingEl.style.bottom = 'auto';
	floatingEl.style.margin = '0';
	floatingEl.style.transform = '';
	floatingEl.style.setProperty('--el-floating-available-width', `${Math.round(result.availableWidth)}px`);
	floatingEl.style.setProperty('--el-floating-available-height', `${Math.round(result.availableHeight)}px`);
	floatingEl.dataset.placement = result.placement;
	floatingEl.dataset.floatingMode = result.mode;
	floatingEl.dataset.side = result.side;
	floatingEl.dataset.align = result.align;
	floatingEl.toggleAttribute('data-flipped', result.flipped);

	for (const side of SIDE_OPTIONS) {
		floatingEl.toggleAttribute(`data-collision-${side}`, result.collision[side] > 0);
		floatingEl.toggleAttribute(`data-overflow-${side}`, result.overflow[side] > 0);
	}

	return result;
}

export function autoUpdateFloating(referenceEl, floatingEl, update) {
	if (!referenceEl || !floatingEl || typeof window === 'undefined') return () => {};

	let frame = 0;
	const requestUpdate = () => {
		if (frame) return;
		frame = requestAnimationFrame(() => {
			frame = 0;
			update();
		});
	};
	const parents = new Set([
		...getScrollParents(referenceEl),
		...getScrollParents(floatingEl),
	]);
	const viewport = window.visualViewport;
	const resizeObserver = 'ResizeObserver' in window
		? new ResizeObserver(requestUpdate)
		: null;

	for (const parent of parents) parent.addEventListener('scroll', requestUpdate, { passive: true });
	window.addEventListener('resize', requestUpdate);
	viewport?.addEventListener('resize', requestUpdate);
	viewport?.addEventListener('scroll', requestUpdate);
	resizeObserver?.observe(referenceEl);
	resizeObserver?.observe(floatingEl);
	requestUpdate();

	return () => {
		if (frame) cancelAnimationFrame(frame);
		for (const parent of parents) parent.removeEventListener('scroll', requestUpdate);
		window.removeEventListener('resize', requestUpdate);
		viewport?.removeEventListener('resize', requestUpdate);
		viewport?.removeEventListener('scroll', requestUpdate);
		resizeObserver?.disconnect();
	};
}
