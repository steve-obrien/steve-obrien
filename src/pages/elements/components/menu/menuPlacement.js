import { computeFloatingPosition } from '../../lib/headless/floating.js';

export function positionSubmenuPanel(panel, trigger, options = {}) {
	const result = computeFloatingPosition(trigger, panel, options);
	if (!result) return null;

	const offsetParent = panel.offsetParent instanceof Element ? panel.offsetParent : null;
	const offsetRect = offsetParent?.getBoundingClientRect?.() || { left: 0, top: 0 };

	panel.style.position = 'absolute';
	panel.style.top = `${Math.round(result.y - offsetRect.top)}px`;
	panel.style.left = `${Math.round(result.x - offsetRect.left)}px`;
	panel.style.right = 'auto';
	panel.style.bottom = 'auto';
	panel.style.margin = '0';
	panel.style.transform = '';
	panel.style.setProperty('--el-floating-available-width', `${Math.round(result.availableWidth)}px`);
	panel.style.setProperty('--el-floating-available-height', `${Math.round(result.availableHeight)}px`);
	panel.dataset.placement = result.placement;
	panel.dataset.floatingMode = result.mode;
	panel.dataset.side = result.side;
	panel.dataset.align = result.align;
	panel.toggleAttribute('data-flipped', result.flipped);

	return result;
}
