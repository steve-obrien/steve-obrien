<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import { useOverlordMotion } from '../composable/useOverlordMotion.js';

const core = ref(null);
const gaze = ref({ x: 0, y: 0 });
const OPEN_APERTURE = 36;
const IRIS_RADIUS = 85;
const BLINK_DURATION = 405;
const aperture = ref(OPEN_APERTURE);
const { paused } = useOverlordMotion();
const lensStyle = computed(getLensStyle);
const bladePath = computed(getBladePath);
const irisRotation = computed(getIrisRotation);
const id = useId();
const glances = [[-0.65, -0.2], [0.5, -0.35], [0.2, 0.5], [-0.3, 0.25], [0, 0]];
const blinkDelays = [5200, 6800, 5700, 7400];
let glanceIndex = 0;
let glanceTimer;
let blinkIndex = 0;
let blinkTimer;
let blinkFrame;
let blinking = false;
let blinkElapsed = 0;
let lastBlinkFrame;
let motionQuery;

/**
 * Tessellates one of six blades around the opening. Each seam continues the
 * previous hexagon edge to the circular rim, so adjacent blades share exact
 * endpoints throughout the blink instead of hiding overlaps with a second shape.
 * @returns {string} SVG path for one blade, repeated at sixty-degree intervals.
 */
function getBladePath() {
	const radius = aperture.value;
	const rootThree = Math.sqrt(3);
	const reach = Math.sqrt(IRIS_RADIUS ** 2 - 0.75 * radius ** 2) - radius / 2;
	const innerX = rootThree * radius / 2;
	const outerX = rootThree * (radius + reach) / 2;
	const outerY = (reach - radius) / 2;
	const previousX = outerX / 2 + rootThree * outerY / 2;
	const previousY = -rootThree * outerX / 2 + outerY / 2;
	return `M0 ${-radius}L${innerX} ${-radius / 2}L${outerX} ${outerY}A${IRIS_RADIUS} ${IRIS_RADIUS} 0 0 0 ${previousX} ${previousY}Z`;
}

/** @returns {string} A slight mechanical twist as the aperture closes. */
function getIrisRotation() {
	return `rotate(${(1 - aperture.value / OPEN_APERTURE) * 14})`;
}

/**
 * Closes quickly, holds shut briefly, then reopens more gently.
 * @param {number} elapsed Active milliseconds since the blink began.
 * @returns {number} Opening radius, including a fully closed zero-radius state.
 */
function getApertureRadius(elapsed) {
	const closing = elapsed < 120;
	const progress = closing ? elapsed / 120 : Math.max(0, Math.min(1, (elapsed - 185) / 220));
	const eased = progress * progress * (3 - 2 * progress);
	return OPEN_APERTURE * (closing ? 1 - eased : eased);
}

/** @returns {object} Bounded lens travel and foreshortening inside the fixed housing. */
function getLensStyle() {
	const { x, y } = gaze.value;
	return { transform: `translate(${x * 28}px, ${y * 24}px) scale(${1 - Math.abs(x) * 0.055}, ${1 - Math.abs(y) * 0.045})` };
}

/** @returns {boolean} Whether pause, OS preferences and tab visibility allow movement. */
function canMove() {
	return Boolean(motionQuery && !motionQuery.matches && !paused.value && !document.hidden);
}

/** @param {number} delay Milliseconds before the next idle glance. @returns {void} Replaces the idle timer. */
function scheduleGlance(delay = 2800) {
	window.clearTimeout(glanceTimer);
	if (canMove()) glanceTimer = window.setTimeout(lookAround, delay);
}

/** @returns {void} Schedules an occasional blink independently of pointer tracking. */
function scheduleBlink() {
	window.clearTimeout(blinkTimer);
	if (canMove()) blinkTimer = window.setTimeout(startBlink, blinkDelays[blinkIndex++ % blinkDelays.length]);
}

/** @returns {void} Starts one short iris closure without a continuously running frame loop. */
function startBlink() {
	if (!canMove()) return;
	blinking = true;
	blinkElapsed = 0;
	lastBlinkFrame = undefined;
	blinkFrame = window.requestAnimationFrame(animateBlink);
}

/**
 * Advances only while movement is allowed; paused or hidden time is excluded.
 * @param {DOMHighResTimeStamp} timestamp Browser animation-frame timestamp.
 * @returns {void}
 */
function animateBlink(timestamp) {
	blinkFrame = undefined;
	if (!canMove()) return;
	if (lastBlinkFrame !== undefined) blinkElapsed += timestamp - lastBlinkFrame;
	lastBlinkFrame = timestamp;
	aperture.value = getApertureRadius(blinkElapsed);
	if (blinkElapsed >= BLINK_DURATION) {
		blinking = false;
		lastBlinkFrame = undefined;
		scheduleBlink();
		return;
	}
	blinkFrame = window.requestAnimationFrame(animateBlink);
}

/** @returns {void} Gives the lens a new point of interest, followed by a natural hold. */
function lookAround() {
	if (!canMove()) return;
	const [x, y] = glances[glanceIndex % glances.length];
	glanceIndex++;
	gaze.value = { x, y };
	scheduleGlance(2400 + (glanceIndex % 3) * 600);
}

/**
 * Aims towards a mouse or pen while keeping the optical assembly inside its housing.
 * @param {PointerEvent} event Pointer position in viewport coordinates.
 * @returns {void}
 */
function followPointer(event) {
	if (!canMove() || event.pointerType === 'touch' || !core.value) return;
	const bounds = core.value.getBoundingClientRect();
	if (!bounds.width || !bounds.height) return;
	gaze.value = {
		x: Math.max(-1, Math.min(1, (event.clientX - bounds.left - bounds.width / 2) / (bounds.width * 0.85))),
		y: Math.max(-1, Math.min(1, (event.clientY - bounds.top - bounds.height / 2) / (bounds.height * 0.85))),
	};
	scheduleGlance(3800);
}

/** @returns {void} Returns to a neutral gaze when the pointer leaves, then resumes idle glances. */
function releasePointer() {
	if (!canMove()) return;
	gaze.value = { x: 0, y: 0 };
	scheduleGlance();
}

/** @returns {void} Freezes both effects when paused or hidden; reduced motion rests open and centred. */
function syncMotion() {
	window.clearTimeout(glanceTimer);
	window.clearTimeout(blinkTimer);
	window.cancelAnimationFrame(blinkFrame);
	blinkFrame = undefined;
	lastBlinkFrame = undefined;
	if (motionQuery?.matches) {
		gaze.value = { x: 0, y: 0 };
		aperture.value = OPEN_APERTURE;
		blinking = false;
	}
	if (canMove()) {
		scheduleGlance();
		if (blinking) blinkFrame = window.requestAnimationFrame(animateBlink);
		else scheduleBlink();
	}
}

/** @returns {void} Installs pointer and motion observers for this mounted decorative camera. */
function mountCamera() {
	motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
	motionQuery.addEventListener('change', syncMotion);
	window.addEventListener('pointermove', followPointer, { passive: true });
	document.documentElement.addEventListener('pointerleave', releasePointer);
	document.addEventListener('visibilitychange', syncMotion);
	syncMotion();
}

/** @returns {void} Releases every timer and listener when the camera leaves the page. */
function unmountCamera() {
	window.clearTimeout(glanceTimer);
	window.clearTimeout(blinkTimer);
	window.cancelAnimationFrame(blinkFrame);
	motionQuery?.removeEventListener('change', syncMotion);
	window.removeEventListener('pointermove', followPointer);
	document.documentElement.removeEventListener('pointerleave', releasePointer);
	document.removeEventListener('visibilitychange', syncMotion);
}

watch(paused, syncMotion);
onMounted(mountCamera);
onBeforeUnmount(unmountCamera);
</script>

<template>
	<div ref="core" class="overlord-core pointer-events-none absolute" :data-paused="paused" aria-hidden="true">
		<svg viewBox="0 0 640 640" fill="none" class="w-full overflow-visible">
			<defs>
				<linearGradient :id="`${id}-housing`" x1="160" y1="110" x2="490" y2="540" gradientUnits="userSpaceOnUse">
					<stop stop-color="#82988d" /><stop offset="0.24" stop-color="#293c32" /><stop offset="0.55" stop-color="#0a1710" /><stop offset="1" stop-color="#40594b" />
				</linearGradient>
				<linearGradient :id="`${id}-rim`" x1="210" y1="160" x2="430" y2="480" gradientUnits="userSpaceOnUse">
					<stop stop-color="#9cb6a8" /><stop offset="0.3" stop-color="#283e32" /><stop offset="0.68" stop-color="#08110c" /><stop offset="1" stop-color="#668673" />
				</linearGradient>
				<radialGradient :id="`${id}-glass`" cx="0.3" cy="0.23" r="0.82">
					<stop stop-color="#93d9ba" stop-opacity="0.5" /><stop offset="0.25" stop-color="#1b5545" /><stop offset="0.55" stop-color="#0a2422" /><stop offset="0.82" stop-color="#020908" /><stop offset="1" stop-color="#274c3c" />
				</radialGradient>
				<radialGradient :id="`${id}-reflection`" cx="0.35" cy="0.2" r="0.7">
					<stop stop-color="#d0ffe9" stop-opacity="0.4" /><stop offset="0.5" stop-color="#86e8bd" stop-opacity="0.04" /><stop offset="1" stop-color="#86e8bd" stop-opacity="0" />
				</radialGradient>
				<linearGradient :id="`${id}-blade`" x1="0" y1="-80" x2="70" y2="25" gradientUnits="userSpaceOnUse">
					<stop stop-color="#1b3026" /><stop offset="1" stop-color="#091710" />
				</linearGradient>
			</defs>
			<!-- Fixed mounting bracket, machined shell and recessed gimbal socket. -->
			<path d="M130 256H98V384H130M510 256H542V384H510" stroke="#567062" stroke-width="14" stroke-linejoin="round" />
			<circle cx="320" cy="320" r="218" fill="#07100b" stroke="#294535" stroke-width="2" />
			<circle cx="320" cy="320" r="209" :fill="`url(#${id}-housing)`" stroke="#87a795" stroke-opacity="0.3" />
			<circle cx="320" cy="320" r="191" fill="#050c08" stroke="#000" stroke-width="6" />
			<circle cx="320" cy="320" r="183" stroke="#709682" stroke-opacity="0.22" stroke-width="2" />
			<g v-for="angle in [45, 135, 225, 315]" :key="angle" :transform="`rotate(${angle} 320 320)`">
				<circle cx="320" cy="120" r="5" fill="#07100b" stroke="#779080" />
				<path d="M317 120H323" stroke="#779080" />
			</g>
			<!-- Only the optical assembly moves; the outer housing stays mounted. -->
			<g class="camera-lens" :style="lensStyle">
				<circle cx="320" cy="320" r="166" :fill="`url(#${id}-rim)`" stroke="#8daa99" stroke-width="1.5" />
				<circle cx="320" cy="320" r="153" stroke="#090f0b" stroke-width="12" />
				<circle cx="320" cy="320" r="153" stroke="#729580" stroke-width="8" stroke-dasharray="1 5" opacity="0.6" />
				<circle cx="320" cy="320" r="139" fill="#070e0b" stroke="#a0c6b0" stroke-opacity="0.5" stroke-width="2" />
				<circle cx="320" cy="320" r="127" :fill="`url(#${id}-glass)`" stroke="#1c4c37" stroke-width="5" />
				<circle cx="320" cy="320" r="108" stroke="#81f1bf" stroke-opacity="0.17" />
				<circle cx="320" cy="320" r="88" fill="#010604" stroke="#8cf3be" stroke-opacity="0.18" />
				<g transform="translate(320 320)">
					<g class="camera-iris" :transform="irisRotation" :fill="`url(#${id}-blade)`" stroke="#426e59" stroke-width="0.65" stroke-linejoin="round">
						<path v-for="angle in [0, 60, 120, 180, 240, 300]" :key="angle" :transform="`rotate(${angle})`" :d="bladePath" />
					</g>
				</g>
				<circle cx="320" cy="320" r="124" :fill="`url(#${id}-reflection)`" />
				<path d="M230 282A99 99 0 0 1 303 222" stroke="#bdffe2" stroke-width="10" stroke-linecap="round" opacity="0.3" />
				<path d="M354 411A98 98 0 0 0 409 363" stroke="#8acbdf" stroke-width="3" stroke-linecap="round" opacity="0.28" />
				<ellipse cx="278" cy="257" rx="21" ry="11" transform="rotate(-32 278 257)" fill="#d4ffe7" opacity="0.2" />
			</g>
			<circle class="camera-status" cx="320" cy="121" r="3" fill="#a0f8bd" />
		</svg>
	</div>
</template>

<style scoped>
.overlord-core {
	top: 42%;
	right: 0;
	width: 44%;
	transform: translateY(-50%);
	filter: drop-shadow(0 24px 55px rgb(0 0 0 / 55%));
}

.camera-lens {
	transform-origin: 320px 320px;
	transition: transform 420ms cubic-bezier(0.2, 0.7, 0.2, 1);
}

.camera-status {
	filter: drop-shadow(0 0 6px #8af5bb);
}

.overlord-core[data-paused="true"] .camera-lens {
	transition: none;
}

@media (max-width: 1023px) {
	.overlord-core {
		top: 24%;
		right: -4%;
		width: 65%;
		opacity: 0.25;
	}
}

@media (prefers-reduced-motion: reduce) {
	.camera-lens { transition: none; }
}
</style>
