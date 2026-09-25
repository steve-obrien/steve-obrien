<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { implementationSteps, includedCourses, offerTitle } from './offer.js';

let waitlistScript = null;

/**
 * Load the existing Kit embed after the offer's signup form has mounted.
 *
 * @returns {void}
 */
function loadWaitlistEmbed() {
	waitlistScript = document.createElement('script');
	waitlistScript.async = true;
	waitlistScript.src = 'https://f.convertkit.com/ckjs/ck.5.js';
	document.body.appendChild(waitlistScript);
}

/**
 * Remove this page's script element when navigating away from the offer.
 *
 * @returns {void}
 */
function removeWaitlistEmbed() {
	waitlistScript?.remove();
	waitlistScript = null;
}

onMounted(loadWaitlistEmbed);
onBeforeUnmount(removeWaitlistEmbed);
</script>

<template>
	<SteveLayout>
		<section class="grid gap-12 border-b border-border py-12 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center" aria-labelledby="offer-heading">
			<div>
				<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{{ offerTitle }}</p>
				<h1 id="offer-heading" class="mt-5 text-4xl font-medium leading-[1.08] tracking-[-0.04em] sm:text-6xl">Implement AI.<br />Build your team’s skills.</h1>
				<p class="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">I implement one AI process for you, then one with you. You and your team gain the skills to scale AI work independently.</p>
				<div class="mt-9 flex flex-wrap gap-3">
					<a href="#waitlist" class="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground">Join the waitlist</a>
					<a href="#courses" class="rounded-full border border-border px-6 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground">Explore the courses</a>
				</div>
			</div>
			<div class="rounded-3xl border border-border bg-secondary p-7 sm:p-9">
				<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">The offer</p>
				<ol class="mt-5 divide-y divide-border">
					<li v-for="step in implementationSteps" :key="step.number" class="grid grid-cols-[2rem_1fr] gap-4 py-6">
						<span class="pt-1 text-xs font-semibold text-muted-foreground" aria-hidden="true">{{ step.number }}</span>
						<div>
							<p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ step.label }}</p>
							<h2 class="mt-2 text-xl font-semibold leading-7">{{ step.title }}</h2>
							<p class="mt-3 leading-7 text-muted-foreground">{{ step.text }}</p>
						</div>
					</li>
				</ol>
			</div>
		</section>

		<section id="courses" class="scroll-mt-8 py-16 sm:py-20" aria-labelledby="courses-heading">
			<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Included courses</p>
			<h2 id="courses-heading" class="mt-4 max-w-3xl text-3xl font-medium leading-tight tracking-[-0.03em] sm:text-4xl">Understand the tools, the people and how AI works</h2>
			<div class="mt-9 grid gap-5 lg:grid-cols-3">
				<article v-for="course in includedCourses" :key="course.number" class="rounded-3xl border border-border bg-card p-7">
					<p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Course {{ course.number }}</p>
					<h3 class="mt-5 text-2xl font-semibold leading-8">{{ course.title }}</h3>
					<p class="mt-4 leading-7 text-muted-foreground">{{ course.text }}</p>
					<ul v-if="course.topics.length" class="mt-5 list-disc space-y-2 pl-5 leading-7">
						<li v-for="topic in course.topics" :key="topic">{{ topic }}</li>
					</ul>
				</article>
			</div>
			<div class="mt-5 rounded-3xl bg-secondary p-7 sm:p-9">
				<p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Community included</p>
				<h3 class="mt-3 text-2xl font-semibold">Access the courses and Skool community</h3>
				<p class="mt-4 max-w-3xl leading-7 text-muted-foreground">Keep learning as you put the work into practice with your team, with access to all three courses and the Skool community.</p>
			</div>
		</section>

		<section id="waitlist" class="mx-auto max-w-3xl scroll-mt-8 border-t border-border py-12 sm:py-16" aria-labelledby="waitlist-heading">
			<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Join the waitlist</p>
			<h2 id="waitlist-heading" class="mt-4 text-3xl font-medium leading-tight tracking-[-0.03em] sm:text-4xl">Put AI to work with your team</h2>
			<p class="mt-5 text-lg leading-8 text-muted-foreground">Join the waitlist for the offer and tell me which process you’d like to improve.</p>
			<form action="https://app.kit.com/forms/9457604/subscriptions" class="mt-10 rounded-4xl border border-border bg-card p-4 shadow-xl " method="post" data-sv-form="9457604" data-uid="34070917df" data-format="inline" data-version="5" data-options="{&quot;settings&quot;:{&quot;after_subscribe&quot;:{&quot;action&quot;:&quot;message&quot;,&quot;success_message&quot;:&quot;Success! Now check your email to confirm your subscription.&quot;,&quot;redirect_url&quot;:&quot;&quot;},&quot;analytics&quot;:{&quot;google&quot;:null,&quot;fathom&quot;:null,&quot;facebook&quot;:null,&quot;segment&quot;:null,&quot;pinterest&quot;:null,&quot;sparkloop&quot;:null,&quot;googletagmanager&quot;:null},&quot;modal&quot;:{&quot;trigger&quot;:&quot;timer&quot;,&quot;scroll_percentage&quot;:null,&quot;timer&quot;:5,&quot;devices&quot;:&quot;all&quot;,&quot;show_once_every&quot;:15},&quot;powered_by&quot;:{&quot;show&quot;:true,&quot;url&quot;:&quot;https://kit.com/features/forms?utm_campaign=poweredby&amp;utm_content=form&amp;utm_medium=referral&amp;utm_source=dynamic&quot;},&quot;recaptcha&quot;:{&quot;enabled&quot;:false},&quot;return_visitor&quot;:{&quot;action&quot;:&quot;show&quot;,&quot;custom_content&quot;:&quot;&quot;},&quot;slide_in&quot;:{&quot;display_in&quot;:&quot;bottom_right&quot;,&quot;trigger&quot;:&quot;timer&quot;,&quot;scroll_percentage&quot;:null,&quot;timer&quot;:5,&quot;devices&quot;:&quot;all&quot;,&quot;show_once_every&quot;:15},&quot;sticky_bar&quot;:{&quot;display_in&quot;:&quot;top&quot;,&quot;trigger&quot;:&quot;timer&quot;,&quot;scroll_percentage&quot;:null,&quot;timer&quot;:5,&quot;devices&quot;:&quot;all&quot;,&quot;show_once_every&quot;:15}},&quot;version&quot;:&quot;5&quot;}" min-width="400 500 600 700 800">
				<div data-style="full" style="--border-radius: 0px;">
					<div class="formkit-container" aria-live="polite">
						<div data-element="content" class="pb-2">
							<p>Leave your email and I’ll keep you updated about the offer.</p>
						</div>
						<ul class="formkit-alert formkit-alert-error mb-4 space-y-1 text-sm text-red-700 empty:hidden dark:text-red-300" data-element="errors" data-group="alert" role="alert"></ul>

						<div data-element="fields" class="seva-fields formkit-fields">
							<div class="grid gap-3 sm:grid-cols-[1fr_auto]">
								<div class="formkit-field">
									<input class="w-full rounded-full border border-border bg-background px-5 py-4 text-base outline-none transition focus:border-foreground focus:bg-card" name="email_address" aria-label="Email Address" placeholder="Email Address" autocomplete="email" required type="email" >
								</div>
								<button type="submit" data-element="submit" class="group/submit rounded-full cursor-pointer bg-foreground px-7 py-4 text-sm font-semibold text-background transition hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground disabled:cursor-wait disabled:opacity-70">
									<span class="group-data-[active]/submit:hidden">Join waitlist</span>
									<span class="hidden group-data-[active]/submit:inline">Joining…</span>
								</button>
							</div>

							<label for="offer-process" class="mt-5 block text-sm leading-6">Which process would you like to improve? <span class="text-muted-foreground">(optional)</span></label>
							<input id="offer-process" class="mt-2 w-full rounded-3xl border border-border bg-background px-5 py-4 text-base outline-none transition focus:border-foreground focus:bg-card" name="fields[want-to-build]" placeholder="Tell me about the process" type="text" >
						</div>
						<div class="formkit-disclaimer mt-4 text-sm text-muted-foreground" data-element="disclaimer">We respect your privacy. Unsubscribe at any time.</div>
					</div>
				</div>
			</form>
		</section>
	</SteveLayout>
</template>
