import { computed, ref, watch } from 'vue';

export function useOptionMenu(items, options = {}) {
	const {
		emitQuery,
		openOnQuery = true,
		closeDelay = 120,
		query: queryRef,
	} = options;
	const query = queryRef || ref('');
	const isOpen = ref(false);
	const activeIndex = ref(0);
	const trimmedQuery = computed(() => query.value.trim());

	watch(query, (value) => {
		emitQuery?.(value);
		activeIndex.value = 0;
		if (openOnQuery && value) isOpen.value = true;
	});

	watch(items, () => {
		if (activeIndex.value >= items.value.length) {
			activeIndex.value = Math.max(0, items.value.length - 1);
		}
	});

	function wrapIndex(index) {
		if (!items.value.length) return 0;
		return (index + items.value.length) % items.value.length;
	}

	function move(delta) {
		isOpen.value = true;
		activeIndex.value = wrapIndex(activeIndex.value + delta);
	}

	function reset() {
		query.value = '';
		isOpen.value = false;
		activeIndex.value = 0;
	}

	function closeSoon() {
		window.setTimeout(() => {
			isOpen.value = false;
		}, closeDelay);
	}

	return {
		query,
		isOpen,
		activeIndex,
		trimmedQuery,
		wrapIndex,
		move,
		reset,
		closeSoon,
	};
}
