export const stageFrameChannel = 'template-editor-stage';

export function createStageFrameMessage(type, payload = {}) {
	return {
		channel: stageFrameChannel,
		type,
		payload,
	};
}

export function isStageFrameMessage(value) {
	return Boolean(value && value.channel === stageFrameChannel && typeof value.type === 'string');
}

