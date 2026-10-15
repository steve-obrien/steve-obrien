# The Subscription Swap: offer design

Working notes behind the [/subscription-swap](../../src/pages/subscription-swap/Index.vue) sales page. Terms the page depends on live in [offer.js](../../src/pages/subscription-swap/offer.js).

## The offer in one line

I build you your own tools to replace the software subscriptions you pay for. It costs you nothing to build. You pay me half of what you save, and only once you've cancelled the old one.

## Grand slam offer structure

**Name.** The Subscription Swap. Headline: "Stop renting your software." The name says what happens; the headline says why you'd want it.

**Dream outcome.** A lower monthly bill *and* software that fits how the team actually works. Two wins, and the second one is the one competitors can't match.

**Perceived likelihood.** The baseline is agreed in writing before any build. Steve is only paid from a saving that already exists. Twenty-plus years of building software, and the "why now" argument (AI changed the build-versus-rent maths) explains why this wasn't possible before.

**Time delay.** Tools run side by side with the old subscription, so the team never goes without. Worth adding a first-tool timescale once pilots show what's realistic.

**Effort and sacrifice.** Steve builds, migrates data, hosts, maintains and trains. The client sends a list of subscriptions and gives feedback.

**Risk reversal.**
- £0 build cost.
- Nothing is due until the old subscription is cancelled.
- 90-day switch-back: cancel, regret it, switch back and that tool's fee stops.

**Scarcity.** Five pilot places, with an honest reason: Steve pays for every build with his own time.

**Bonus that works as a lead magnet.** The software audit. Even if nothing is built, the company learns where its money goes.

## Platform and add-ons

- **Built on db3.ai.** Every tool runs in the client's own db3 Cloud workspace, with staging and production managed through the UI: changes go to staging, are approved, then promoted, with rollback.
- **AI usage is charged on top.** Hosting is deducted when measuring the saving; AI usage is a separate pass-through charge. The page says "at cost", which is an assumption: change it if you want a margin on usage.
- **Optional training.** Teaching staff how AI-generated software is built and changed, and how to move work from staging to production. Priced separately; no price on the page yet. It could reuse the [/course](../../src/pages/course/offer.js) material.

## Worked example

| | Per month |
|---|---|
| Current subscriptions | £5,000 |
| Replaced by custom tools | £4,000 |
| Client keeps | £2,000 |
| Steve is paid | £2,000 |
| Client keeps over 24 months | £48,000 |
| Client keeps after 24 months | £4,000 |

## Decisions the page assumes (please confirm or change)

These are recommendations, written into the page so it reads as a complete offer. Each is one constant or one FAQ answer to change.

1. **Term: 24 months per tool, from the day it's cancelled.** "50% forever" is the first objection a finance director raises. A fixed term answers it and still pays well. After the term, an optional fixed maintenance fee.
2. **Code ownership: licence during the term, ownership at the end or on buyout.** Stops a client taking the code and cancelling in month two, while promising they end up owning it.
3. **Early exit: buyout of the remaining share.** The page says "buy out the remaining share" without a figure. Suggest the remaining months' fee at a discount, for example 50% of what's left.
4. **"Saving" is net of running costs.** Cancelled subscriptions minus hosting and AI usage. Baseline is fixed: no indexing for vendor price rises or seat growth, which is pitched as upside for the client.
5. **Maintenance scope.** Bug fixes, hosting, security and small improvements are included. Anything that would be its own project is quoted separately.
6. **The 90-day switch-back.** Strong risk reversal, but it's the one term that can cost Steve a full build. Drop it if that feels too generous for pilots.
7. **Five pilot places.** "A few" turned into five. Change `pilotPlaces` in offer.js.

## Things worth thinking about

- **The page promises the db3 Cloud UI.** The work stream still describes db3 Cloud as a proposal. Staging, production, approval and rollback in the UI need to be real before the page goes public, or the copy should soften to "we manage staging and production for you".
- **AI usage on top dilutes the headline saving.** Keep the replaced tools low on AI where possible, and give an estimate before each build so the client's real saving stays obvious.

- **The £200 minimum is low for pilots.** At £200 saved, Steve earns £100 a month, £2,400 over the term, for a build plus two years of support. The page keeps £200 as asked. For the first pilots, it may be worth choosing companies with £1,000+ a month to replace, so each one pays for the time it takes and makes a stronger case study.
- **Concentration risk sits with Steve.** Payment depends on clients reporting cancellations. The agreement should give Steve sight of the cancellation confirmation, and invoicing should start automatically from that date.
- **Pilot incentive.** Hormozi-style founding terms (for example 40% instead of 50%) in exchange for a case study and a testimonial would make the five places easier to fill. Not on the page yet.
- **The call to action** currently points at LinkedIn, like the AI offers page. A short form asking for the monthly subscription list would qualify leads before the first call.
- The page is live at `/subscription-swap` but not in the main navigation, so it can be tested quietly before it's promoted.
