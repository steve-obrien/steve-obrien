<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

defineOptions({
	__doc: {
		name: 'Command palette',
		tag: '<ElCommandPalette>',
		description: 'A keyboard-first command launcher composed from dialog and listbox patterns.',
		events: [
			{ name: 'update:modelValue', payload: '(open: boolean)', description: 'Emitted when the palette opens or closes.' },
			{ name: 'select', payload: '({ command, value })', description: 'Emitted when a command is selected.' },
		],
	},
});

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false,
		_edit: { description: 'Whether the palette is open.' },
	},
	commands: {
		type: Array,
		required: true,
		_edit: { component: 'ElJsonListInput', description: 'Commands shown in the palette.' },
	},
	placeholder: {
		type: String,
		default: 'Search commands...',
		_edit: { description: 'Input placeholder.' },
	},
	shortcut: {
		type: String,
		default: 'mod+k',
		_edit: { description: 'Global keyboard shortcut. Use mod for Cmd on Mac and Ctrl elsewhere. Set empty string to disable.' },
	},
});
const emit = defineEmits(['update:modelValue', 'select']);

const query = ref('');
const activeIndex = ref(0);
const input = ref(null);
const isRendered = ref(false);
const isVisible = ref(false);
const motion = ref('closed');
let motionTimer = null;

const filtered = computed(() => {
	const q = query.value.trim().toLowerCase();
	if (!q) return props.commands;
	return props.commands.filter((command) => {
		const text = [command.label, command.description, command.value].filter(Boolean).join(' ').toLowerCase();
		return text.includes(q);
	});
});

watch(() => props.modelValue, async (open) => {
	window.clearTimeout(motionTimer);
	if (!open) {
		if (!isRendered.value) return;
		isVisible.value = false;
		motion.value = 'leaving';
		motionTimer = window.setTimeout(() => {
			if (props.modelValue) return;
			isRendered.value = false;
			motion.value = 'closed';
		}, 150);
		return;
	}

	isRendered.value = true;
	motion.value = 'entering';
	query.value = '';
	activeIndex.value = 0;
	await nextTick();
	window.requestAnimationFrame(() => {
		isVisible.value = true;
		input.value?.focus();
	});
	motionTimer = window.setTimeout(() => {
		if (props.modelValue) motion.value = 'open';
	}, 250);
});
watch(query, () => { activeIndex.value = 0; });
watch(filtered, (items) => {
	if (activeIndex.value >= items.length) activeIndex.value = Math.max(0, items.length - 1);
});
onMounted(() => {
	window.addEventListener('keydown', onShortcut, { capture: true });
	document.addEventListener('keydown', onShortcut, { capture: true });
	window.addEventListener('keyup', onShortcutFallback, { capture: true });
});
onBeforeUnmount(() => {
	window.clearTimeout(motionTimer);
	window.removeEventListener('keydown', onShortcut, { capture: true });
	document.removeEventListener('keydown', onShortcut, { capture: true });
	window.removeEventListener('keyup', onShortcutFallback, { capture: true });
});

function close() {
	emit('update:modelValue', false);
}

function open() {
	if (props.modelValue) {
		input.value?.focus();
		return;
	}
	emit('update:modelValue', true);
}

function move(delta) {
	if (!filtered.value.length) return;
	activeIndex.value = (activeIndex.value + delta + filtered.value.length) % filtered.value.length;
}

function select(command = filtered.value[activeIndex.value]) {
	if (!command) return;
	emit('select', { command, value: command.value ?? command.label });
	close();
}

function onKeydown(event) {
	if (event.key === 'Escape') {
		event.preventDefault();
		close();
	} else if (event.key === 'ArrowDown') {
		event.preventDefault();
		move(1);
	} else if (event.key === 'ArrowUp') {
		event.preventDefault();
		move(-1);
	} else if (event.key === 'Enter') {
		event.preventDefault();
		select();
	}
}

function onShortcut(event) {
	if (!matchesShortcut(event, props.shortcut)) return;
	if (event.repeat) return;
	event.preventDefault();
	event.stopPropagation();
	open();
}

function onShortcutFallback(event) {
	if (props.modelValue) return;
	if (!matchesShortcut(event, props.shortcut)) return;
	event.preventDefault();
	event.stopPropagation();
	open();
}

function matchesShortcut(event, shortcut) {
	if (!shortcut) return false;
	const parts = shortcut.toLowerCase().split('+').map((part) => part.trim()).filter(Boolean);
	const key = parts.find((part) => !['mod', 'meta', 'cmd', 'command', 'ctrl', 'control', 'alt', 'option', 'shift'].includes(part));
	if (!key) return false;

	const wantsMod = parts.includes('mod');
	const wantsMeta = wantsMod || parts.includes('meta') || parts.includes('cmd') || parts.includes('command');
	const wantsCtrl = wantsMod || parts.includes('ctrl') || parts.includes('control');
	const wantsAlt = parts.includes('alt') || parts.includes('option');
	const wantsShift = parts.includes('shift');
	const hasMod = event.metaKey || event.ctrlKey;
	const keyMatches = event.key.toLowerCase() === key;

	if (wantsMod && !hasMod) return false;
	if (!wantsMod && event.metaKey !== wantsMeta) return false;
	if (!wantsMod && event.ctrlKey !== wantsCtrl) return false;
	if (event.altKey !== wantsAlt) return false;
	if (event.shiftKey !== wantsShift) return false;
	return keyMatches;
}
</script>

<template>
	<Teleport to="body">
		<div
			v-if="isRendered"
			class="fixed inset-0 z-[90] p-4"
			:class="modelValue ? 'pointer-events-auto' : 'pointer-events-none'"
		>
			<div
				class="absolute inset-0 bg-black/25 opacity-0 backdrop-blur-[2px] transition-opacity duration-[180ms] ease-out"
				:class="isVisible ? 'opacity-100' : 'opacity-0'"
				aria-hidden="true"
				@click="close"
			></div>

			<div
				role="dialog"
				aria-modal="true"
				class="relative mx-auto mt-[12vh] w-[min(92vw,38rem)] origin-top overflow-hidden rounded-[1.25rem] border border-white/35 bg-skin-background/95 shadow-[0_24px_80px_rgba(0,0,0,0.28),0_2px_12px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04] backdrop-blur-xl dark:border-white/10 dark:bg-skin-background/[0.92]"
				:class="{
					'command-panel-entering': motion === 'entering',
					'command-panel-leaving': motion === 'leaving',
				}"
				@keydown="onKeydown"
			>
				<input
					ref="input"
					v-model="query"
					type="text"
					:placeholder="placeholder"
					class="h-14 w-full border-b border-skin-border/70 bg-transparent px-5 text-[1.05rem] text-skin-primary outline-none placeholder:text-skin-muted"
				/>
				<div role="listbox" class="max-h-80 overflow-auto p-2">
					<button
						v-for="(command, index) in filtered"
						:key="command.value ?? command.label ?? index"
						role="option"
						type="button"
						class="block w-full rounded-xl px-3 py-2 text-left transition"
						:class="index === activeIndex ? 'bg-skin-surface text-skin-primary' : 'text-skin-secondary hover:bg-skin-surface hover:text-skin-primary'"
						:aria-selected="index === activeIndex"
						@mouseenter="activeIndex = index"
						@click="select(command)"
					>
						<span class="block text-sm font-medium">{{ command.label }}</span>
						<span v-if="command.description" class="mt-0.5 block text-xs text-skin-muted">{{ command.description }}</span>
					</button>
					<p v-if="!filtered.length" class="px-3 py-6 text-center text-sm text-skin-muted">No commands found.</p>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<style scoped>
.command-panel-entering {
	animation: command-panel-in 240ms both;
}

.command-panel-leaving {
	animation: command-panel-out 130ms both;
}

@keyframes command-panel-in {
	0% {
		opacity: 0;
		transform: translateY(-10px) scale(0.965);
	}
	62% {
		opacity: 1;
		transform: translateY(1px) scale(1.012);
	}
	100% {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}

@keyframes command-panel-out {
	0% {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
	100% {
		opacity: 0;
		transform: translateY(-5px) scale(0.985);
	}
}

@media (prefers-reduced-motion: reduce) {
	.command-panel-entering,
	.command-panel-leaving {
		animation-duration: 1ms;
	}
}
</style>
