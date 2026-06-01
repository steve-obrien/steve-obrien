export async function loadComponentFiles(endpoint) {
	const response = await fetch(endpoint);
	if (!response.ok) throw new Error(`Could not load components: ${response.status} ${response.statusText}`);
	const payload = await response.json();
	return Array.isArray(payload.components) ? payload.components : [];
}

export async function saveComponentFile(endpoint, component, source) {
	if (!component) return null;
	const response = await fetch(endpoint, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			component: {
				...component,
				source,
			},
		}),
	});
	if (!response.ok) throw new Error(await response.text());
	const payload = await response.json();
	return payload.component;
}
