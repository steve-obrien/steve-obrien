export const peopleDirectory = [
	{ value: 'ada', label: 'Ada Lovelace', email: 'ada@example.com', role: 'Mathematician' },
	{ value: 'grace', label: 'Grace Hopper', email: 'grace@example.com', role: 'Computer scientist' },
	{ value: 'katherine', label: 'Katherine Johnson', email: 'katherine@example.com', role: 'NASA mathematician' },
	{ value: 'margaret', label: 'Margaret Hamilton', email: 'margaret@example.com', role: 'Software engineer' },
	{ value: 'dorothy', label: 'Dorothy Vaughan', email: 'dorothy@example.com', role: 'NASA mathematician' },
	{ value: 'mary', label: 'Mary Jackson', email: 'mary@example.com', role: 'Aerospace engineer' },
];

export const tailwindClassIndex = [
	'absolute',
	'flex-1',
	'bg-blue-500',
	'bg-white',
	'border',
	'border-zinc-200',
	'flex',
	'grid',
	'h-10',
	'items-center',
	'justify-between',
	'md:h-full',
	'md:overflow-y-auto',
	'md:pr-2',
	'md:py-10',
	'max-w-xl',
	'min-w-0',
	'p-4',
	'p-6',
	'px-4',
	'py-2',
	'rounded-md',
	'rounded-xl',
	'shadow-sm',
	'text-sm',
	'text-zinc-900',
	'w-full',
];

export function searchPeople(query, options = {}) {
	return delayedSearch(peopleDirectory, query, options);
}

export function searchTailwindClasses(query, options = {}) {
	const rows = tailwindClassIndex.map((className) => ({
		value: className,
		label: className,
		description: 'Loaded from the server',
	}));
	return delayedSearch(rows, query, options);
}

function delayedSearch(rows, query, options = {}) {
	const { delay = 350, limit = 6 } = options;
	const needle = query.trim().toLowerCase();
	return new Promise((resolve) => {
		window.setTimeout(() => {
			if (!needle) {
				resolve([]);
				return;
			}
			resolve(rows
				.filter((row) => searchableText(row).includes(needle))
				.slice(0, limit));
		}, delay);
	});
}

function searchableText(row) {
	return [
		row.value,
		row.label,
		row.description,
		row.group,
		row.email,
		row.role,
	].filter(Boolean).join(' ').toLowerCase();
}
