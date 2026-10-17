/** Shared offer copy and terms for the Subscription Swap page, routes and SEO metadata. */
export const offerTitle = 'The Subscription Swap';

export const offerDescription = 'Steve O’Brien builds custom tools to replace your software subscriptions at no cost to build. You pay half of what you save, and only after the old subscription is cancelled.';

/** The terms the page and the calculator both rely on, so they cannot drift apart. */
export const offerTerms = {
	sharePercent: 50,
	termMonths: 24,
	minimumMonthlySpend: 200,
	pilotPlaces: 5,
	switchBackDays: 90,
};

/**
 * Splits a monthly net saving between the client and Steve under the offer terms.
 *
 * Savings are the cancelled subscription costs minus the running costs of the
 * replacement tools. Negative or non-numeric inputs are treated as zero so the
 * calculator never shows a negative fee.
 *
 * @param {number} monthlySaving Net monthly saving in pounds.
 * @param {typeof offerTerms} [terms=offerTerms] Offer terms to apply.
 * @returns {{ saving: number, clientShare: number, steveShare: number, clientOverTerm: number, clientAfterTerm: number }} Monthly and term totals in pounds.
 */
export function splitSaving(monthlySaving, terms = offerTerms) {
	const saving = Number.isFinite(monthlySaving) && monthlySaving > 0 ? monthlySaving : 0;
	const steveShare = Math.round(saving * terms.sharePercent) / 100;
	const clientShare = saving - steveShare;

	return {
		saving,
		clientShare,
		steveShare,
		clientOverTerm: clientShare * terms.termMonths,
		clientAfterTerm: saving,
	};
}
