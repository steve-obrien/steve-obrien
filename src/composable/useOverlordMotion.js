import { ref } from 'vue';

/** Shared pause preference for the binary rain and decorative camera in AI Overlord mode. */
const paused = ref(false);

/** @returns {{ paused: import('vue').Ref<boolean> }} One motion control shared by both effects. */
export function useOverlordMotion() {
	return { paused };
}
