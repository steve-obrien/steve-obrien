// Headless UI-style enter/leave class transitions.
// Reads `enter`, `enter-from`, `enter-to`, `leave`, `leave-from`, `leave-to`
// attributes from a host element and applies the class strings to `el`.

const ENTER_KEYS = ['enter', 'enter-from', 'enter-to'];
const LEAVE_KEYS = ['leave', 'leave-from', 'leave-to'];

export function hasCustomTransitions(host) {
	return ENTER_KEYS.some((k) => host.hasAttribute(k))
		|| LEAVE_KEYS.some((k) => host.hasAttribute(k));
}

function splitClasses(value) {
	return (value ?? '').trim().split(/\s+/).filter(Boolean);
}

function durationMs(classLists) {
	const text = classLists.flat().join(' ');
	let ms = 0;
	const bracket = text.match(/duration-\[(\d+(?:\.\d+)?)(ms|s)?\]/);
	if (bracket) {
		const n = parseFloat(bracket[1]);
		ms = Math.max(ms, bracket[2] === 's' ? n * 1000 : n);
	}
	for (const m of text.matchAll(/\bduration-(\d+)\b/g)) {
		ms = Math.max(ms, Number(m[1]));
	}
	return ms || 200;
}

function nextFrame() {
	return new Promise((resolve) => {
		requestAnimationFrame(() => requestAnimationFrame(resolve));
	});
}

function waitForTransition(classLists, signal) {
	return new Promise((resolve) => {
		let settled = false;
		const done = () => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			signal?.removeEventListener('abort', done);
			resolve();
		};
		const timer = setTimeout(done, durationMs(classLists) + 50);
		signal?.addEventListener('abort', done, { once: true });
	});
}

function setClasses(el, add, remove) {
	if (remove.length) el.classList.remove(...remove);
	if (add.length) el.classList.add(...add);
}

function forceStyleFlush(el) {
	el.getBoundingClientRect();
}

export async function runEnter(host, el, { signal } = {}) {
	const enter = splitClasses(host.getAttribute('enter'));
	const from = splitClasses(host.getAttribute('enter-from'));
	const to = splitClasses(host.getAttribute('enter-to'));
	if (!enter.length && !from.length && !to.length) return;

	setClasses(el, [...enter, ...from], []);
	forceStyleFlush(el);
	await nextFrame();
	if (signal?.aborted) return;
	setClasses(el, to, from);
	await waitForTransition([enter, from, to], signal);
	setClasses(el, [], [...enter, ...to]);
}

export async function runLeave(host, el, { signal } = {}) {
	const leave = splitClasses(host.getAttribute('leave'));
	const from = splitClasses(host.getAttribute('leave-from'));
	const to = splitClasses(host.getAttribute('leave-to'));
	if (!leave.length && !from.length && !to.length) return;

	setClasses(el, [...leave, ...from], []);
	forceStyleFlush(el);
	await nextFrame();
	if (signal?.aborted) return;
	setClasses(el, to, from);
	await waitForTransition([leave, from, to], signal);
	setClasses(el, [], [...leave, ...to]);
}
