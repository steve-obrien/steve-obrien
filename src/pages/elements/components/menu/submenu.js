export const SUBMENU_CLOSE_DELAY = 650;

export function submenuOptions() {
	return {
		placement: 'right',
		align: 'start',
		offset: 4,
		padding: 8,
		mode: 'viewport',
		flip: true,
	};
}

export function isSubmenuSafeTarget(target) {
	if (!(target instanceof Element)) return false;
	return Boolean(target.closest('[data-el-menu-submenu-panel]'));
}

export function isLeavingSubmenu(event, trigger, panel) {
	return !(
		panel?.contains(event.relatedTarget)
		|| trigger?.contains(event.relatedTarget)
		|| isSubmenuSafeTarget(event.relatedTarget)
	);
}

export function focusFirstMenuItem(panel) {
	panel?.querySelector('[role="menuitem"]')?.focus();
}

export function isSubmenuOpenKey(event) {
	return event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ';
}

export function isSubmenuCloseKey(event) {
	return event.key === 'ArrowLeft' || event.key === 'Escape';
}

export function createSubmenuCloseTimer(close, delay = SUBMENU_CLOSE_DELAY) {
	let timer = null;

	function cancel() {
		if (!timer) return;
		clearTimeout(timer);
		timer = null;
	}

	function schedule(...args) {
		cancel();
		timer = setTimeout(() => close(...args), delay);
	}

	return {
		cancel,
		schedule,
	};
}
