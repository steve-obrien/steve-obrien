/**
 * Return the stable value used to address a tree item.
 *
 * The component supports `id`, `value`, or `label` so small examples can stay
 * terse, but production trees should provide stable ids.
 *
 * @param {object} item
 * @returns {string|number|undefined}
 */
export function treeItemValue(item) {
	return item?.id ?? item?.value ?? item?.label;
}

/**
 * Return the human-readable label for a tree item.
 *
 * @param {object} item
 * @returns {string|number|undefined}
 */
export function treeItemLabel(item) {
	return item?.label ?? item?.name ?? treeItemValue(item);
}

/**
 * Return children for a nested tree item.
 *
 * @param {object} item
 * @returns {Array}
 */
export function treeItemChildren(item) {
	return Array.isArray(item?.children) ? item.children : [];
}

/**
 * Walk every item in a nested tree.
 *
 * @param {Array} items
 * @param {(item: object) => void} callback
 */
export function visitTreeItems(items, callback) {
	for (const item of items || []) {
		callback(item);
		if (Array.isArray(item?.children)) visitTreeItems(item.children, callback);
	}
}

/**
 * Build the initial open set from a controlled open array, item.open flags,
 * and any previous local open state.
 *
 * @param {Array} items
 * @param {Array<string|number>} controlled
 * @param {Set<string>} previous
 * @returns {Array<string>}
 */
export function seedTreeOpenValues(items, controlled = [], previous = new Set()) {
	if (controlled?.length) return controlled.map(String);
	const values = new Set(previous);
	visitTreeItems(items, (item) => {
		if (item?.open) values.add(String(treeItemValue(item)));
	});
	return [...values];
}

/**
 * Does the item display as a branch?
 *
 * Lazy items are treated as expandable before their children have loaded.
 *
 * @param {object} item
 * @returns {boolean}
 */
export function treeItemHasChildren(item) {
	return treeItemChildren(item).length > 0 || item?.lazy;
}

/**
 * Can this item accept drops as children?
 *
 * `acceptsChildren` can explicitly opt in or out. Without it, only visible
 * branches accept child drops.
 *
 * @param {object} item
 * @returns {boolean}
 */
export function treeItemCanAcceptChildren(item) {
	if (item?.acceptsChildren !== undefined) return item.acceptsChildren !== false;
	return treeItemHasChildren(item);
}

/**
 * Flatten a nested tree into visible row records.
 *
 * This is intentionally pure so a store can derive its visible rows without
 * mounting the TreeView component.
 *
 * @param {Array} items
 * @param {Set<string>} openValues
 * @param {number} depth
 * @param {object|null} parent
 * @param {Array<number>} path
 * @returns {Array<object>}
 */
export function flattenTreeItems(items, openValues, depth = 1, parent = null, path = []) {
	const out = [];
	(items || []).forEach((item, index) => {
		const value = treeItemValue(item);
		const node = {
			item,
			value,
			label: treeItemLabel(item),
			depth,
			parent,
			path: [...path, index],
			open: openValues.has(String(value)),
			loading: Boolean(item?.loading),
			expandable: treeItemHasChildren(item),
		};
		out.push(node);
		if (node.open && treeItemChildren(item).length) {
			out.push(...flattenTreeItems(treeItemChildren(item), openValues, depth + 1, node, node.path));
		}
	});
	return out;
}

/**
 * Build an id lookup for nested tree data.
 *
 * This is useful for Pinia stores that keep nested data but need fast lookup
 * by id for selection, stage highlighting, or permissions.
 *
 * @param {Array} items
 * @returns {Map<string, { item: object, path: Array<number>, parent: object|null }>}
 */
export function indexTreeItems(items) {
	const index = new Map();
	function visit(children, parent = null, path = []) {
		(children || []).forEach((item, itemIndex) => {
			const nextPath = [...path, itemIndex];
			index.set(String(treeItemValue(item)), { item, path: nextPath, parent });
			visit(treeItemChildren(item), item, nextPath);
		});
	}
	visit(items);
	return index;
}

/**
 * Clone nested tree items while preserving item payload properties.
 *
 * @param {Array} items
 * @returns {Array}
 */
export function cloneTreeItems(items) {
	return (items || []).map((item) => ({
		...item,
		children: Array.isArray(item.children) ? cloneTreeItems(item.children) : item.children,
	}));
}

/**
 * Move a nested tree item before, after, or inside another item.
 *
 * The original array is not mutated. Stores can call this from their own drop
 * handlers, then decide whether to commit the returned tree.
 *
 * @param {Array} items
 * @param {string|number} sourceValue
 * @param {string|number} targetValue
 * @param {'before'|'inside'|'after'} position
 * @returns {{ items: Array, item: object } | null}
 */
export function moveTreeItem(items, sourceValue, targetValue, position) {
	const sourceIndex = indexTreeItems(items).get(String(sourceValue));
	const targetIndex = indexTreeItems(items).get(String(targetValue));
	if (!sourceIndex || !targetIndex) return null;
	if (isSameOrDescendantPath(targetIndex.path, sourceIndex.path)) return null;

	const next = cloneTreeItems(items);
	const item = removeTreeItemByValue(next, sourceValue);
	if (!item) return null;
	if (!insertTreeItemByValue(next, targetValue, position, item)) return null;
	return { items: next, item };
}

/**
 * Is path inside possibleParentPath, or exactly the same item?
 *
 * @param {Array<number>} path
 * @param {Array<number>} possibleParentPath
 * @returns {boolean}
 */
export function isSameOrDescendantPath(path, possibleParentPath) {
	if (path.length < possibleParentPath.length) return false;
	return possibleParentPath.every((part, index) => path[index] === part);
}

function removeTreeItemByValue(items, value) {
	for (let index = 0; index < items.length; index += 1) {
		if (String(treeItemValue(items[index])) === String(value)) {
			return items.splice(index, 1)[0];
		}
		const children = treeItemChildren(items[index]);
		if (children.length) {
			const removed = removeTreeItemByValue(children, value);
			if (removed) return removed;
		}
	}
	return null;
}

function insertTreeItemByValue(items, targetValue, position, item) {
	for (let index = 0; index < items.length; index += 1) {
		if (String(treeItemValue(items[index])) === String(targetValue)) {
			if (position === 'inside') {
				if (!Array.isArray(items[index].children)) items[index].children = [];
				items[index].children.push(item);
			} else {
				items.splice(position === 'before' ? index : index + 1, 0, item);
			}
			return true;
		}
		const children = treeItemChildren(items[index]);
		if (children.length && insertTreeItemByValue(children, targetValue, position, item)) return true;
	}
	return false;
}
