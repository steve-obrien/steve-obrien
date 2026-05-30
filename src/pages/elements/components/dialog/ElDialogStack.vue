<script setup>
import ElButton from '../button/ElButton.vue';
import ElDialog from './ElDialog.vue';
import ElDialogSchemaForm from './ElDialogSchemaForm.vue';

defineOptions({
	__doc: {
		name: 'Dialog stack',
		tag: '<ElDialogStack>',
		description: 'Renderer for dialogs created with useDialogs(). Mount it once, then call the dialog API from script.',
		slots: [
			{ name: 'default', payload: '{ dialog, resolve, dismiss }', description: 'Custom renderer for a programmatic dialog body.' },
			{ name: 'footer', payload: '{ dialog, resolve, dismiss }', description: 'Custom renderer for programmatic dialog actions.' },
		],
		events: [
			{ name: 'resolve', payload: '({ id, value })', description: 'Emitted when a dialog resolves.' },
			{ name: 'dismiss', payload: '({ id, value })', description: 'Emitted when a dialog is dismissed.' },
			{ name: 'action', payload: '({ id, dialog, ...payload })', description: 'Emitted by custom dialog bodies for app-specific actions.' },
		],
	},
});

defineProps({
	dialogs: {
		type: Array,
		default: () => [],
		_edit: {
			component: 'ElJsonListInput',
			description: 'Visible programmatic dialogs from useDialogs().',
			props: {
				addLabel: '+ Add dialog',
				compact: true,
				schema: [
					{ key: 'id', label: 'ID', placeholder: 'dialog-id', default: (index) => `dialog-${index + 1}` },
					{ key: 'title', label: 'Title', placeholder: 'Delete project?' },
					{ key: 'description', label: 'Description', placeholder: 'This action cannot be undone.' },
					{ key: 'message', label: 'Message', placeholder: 'Are you sure?' },
					{ key: 'type', label: 'Type', placeholder: 'dialog | confirm', default: 'dialog' },
				],
			},
		},
	},
});
const emit = defineEmits(['resolve', 'dismiss', 'action']);

function resolve(dialog, value = true) {
	emit('resolve', { id: dialog.id, value });
}

function dismiss(dialog, value = false) {
	emit('dismiss', { id: dialog.id, value });
}

function onDialogAction(dialog, payload) {
	const detail = {
		id: dialog.id,
		dialog,
		...(payload && typeof payload === 'object' ? payload : { action: payload }),
	};
	if (detail.action === 'resolve') resolve(dialog, detail.value);
	else if (detail.action === 'dismiss') dismiss(dialog, detail.value);
	emit('action', detail);
}

function confirmVariant(dialog) {
	return dialog.tone === 'danger' ? 'danger' : 'primary';
}

function dialogComponent(dialog) {
	return dialog.component || null;
}
</script>

<template>
	<ElDialog
		v-for="dialog in dialogs"
		:key="dialog.id"
		:model-value="true"
		:title="dialog.title || ''"
		:description="dialog.description || ''"
		:static="dialog.static || null"
		:backdrop="dialog.backdrop !== false"
		:footer="dialog.footer !== false"
		@close="dismiss(dialog)"
	>
		<slot :dialog="dialog" :resolve="(value = true) => resolve(dialog, value)" :dismiss="(value = false) => dismiss(dialog, value)">
			<component
				:is="dialogComponent(dialog)"
				v-if="dialogComponent(dialog)"
				v-bind="dialog.props || {}"
				@action="onDialogAction(dialog, $event)"
				@resolve="resolve(dialog, $event)"
				@dismiss="dismiss(dialog, $event)"
				@close="dismiss(dialog)"
			/>
			<ElDialogSchemaForm
				v-else-if="dialog.formSchema"
				:schema="dialog.formSchema"
				:model-value="dialog.formValues || {}"
				:submit-text="dialog.confirmText || 'Submit'"
				:cancel-text="dialog.cancelText || 'Cancel'"
				:invalid-message="dialog.invalidMessage || undefined"
				@resolve="resolve(dialog, $event)"
				@dismiss="dismiss(dialog, $event)"
			/>
			<p v-else-if="dialog.message" class="text-sm text-muted-foreground">
				{{ dialog.message }}
			</p>
		</slot>

		<template v-if="dialog.footer !== false" #footer>
			<slot name="footer" :dialog="dialog" :resolve="(value = true) => resolve(dialog, value)" :dismiss="(value = false) => dismiss(dialog, value)">
				<ElButton
					v-if="dialog.showCancel || dialog.type === 'confirm'"
					variant="secondary"
					@click="dismiss(dialog)"
				>
					{{ dialog.cancelText || 'Cancel' }}
				</ElButton>
				<ElButton :variant="confirmVariant(dialog)" @click="resolve(dialog)">
					{{ dialog.confirmText || 'OK' }}
				</ElButton>
			</slot>
		</template>
	</ElDialog>
</template>
