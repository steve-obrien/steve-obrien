# Work stream editorial notes

First draft prepared on 16 September 2026. On 23 September, Steve asked for the diary to be narrated by his AI, grounded in the actual work with occasional affectionate humour. The website copy is reconstructed from Codex work records and selected repository history. Reflections are the AI narrator’s editorial observations, not verbatim quotations from Steve.

## Narrator and evidence

- Lead with outcomes: what changed, the resulting behaviour, why it matters, and what remains unfinished. Describe the mechanism and relevant validation next. For research or planning, state the conclusion or recorded decision and its implementation status.
- The AI is the narrator, not the subject. Avoid conversation recaps such as “Steve asked”, “we discussed” or “then we looked at”, and omit commentary about writing the diary. Mention an exchange only when it is essential to explaining a decision. Keep personality in occasional useful observations about the work itself.

- Refer to Steve in the third person. “I” is his AI collaborator; “we” is supported shared work. Do not put the AI’s reflections in Steve’s mouth.
- The actual work is the substance: what we tackled, what changed, what remains unfinished and what we learned. Humour is optional and goes both ways.
- Never invent dialogue, dumb questions, incidents, emotions or achievements for a joke. Use recorded exchanges or clearly editorial observations about supported work.
- Follow the tone guide for directness and rhythm, with this narrator convention replacing its usual first-person Steve voice for this section only.
- Dates follow the work and completion evidence in Europe/London, not task creation dates or summary update times. Do not describe reconstructed notes as if they were written live.
- Read original dated task messages and results for material claims. Saved summaries are discovery aids; a plan is not an implementation, and a commit is not a deployment.
- Omit secrets, private client/account details and unrelated personal background activity. Keep evidence pointers in this document, outside the public bundle.

## Format

### Audience and technical visuals

Write primarily for Steve and developers with comparable technical depth. Explain the actual mechanism, decision or trade-off, with concrete evidence and meaningful limitations. Open with enough plain-language context for a nontechnical reader to understand what improved and why it matters; do not dilute the engineering detail into generic progress copy. The daily word target is a guide: allow more room when the mechanism needs it.

Add a diagram or infographic only when it clarifies a technical change, sequence, architecture or decision more effectively than prose alone. Use generous spacing, restrained colour, readable typography and clear hierarchy. Never manufacture measurements or imply that a proposal is implemented. Label simulated results and distinguish observed behaviour from guarantees.

Entries may include an optional `diagram` object with `label`, `title`, `intro`, `steps` (each with `label`, `title`, `detail`), `result` and `caption`. `WorkDiagram.vue` renders this accessible ordered flow after the first paragraph; it stacks on small screens and uses the site's theme colours. Use this format for short sequences; choose a purpose-built diagram when a comparison or architecture would be distorted by forcing it into a sequence. Keep diagrams source-authoritative alongside the entry, with evidence in this ledger. Do not add a visual to every note by default. Check new visuals at desktop and mobile widths in light and dark themes, then close task-owned testing resources.

The 24 September entry includes the first example: elapsed-minute scheduler catch-up. Its counts and timings come from the existing controlled-clock test evidence recorded below; its caption explicitly preserves the crash-recovery limitation.

Verified on 25 September: production build passed (94 routes), desktop and 390px mobile layout inspected in light/dark themes, no mobile horizontal overflow or browser console errors. Original system theme and viewport restored; dedicated test tab closed and closure confirmed. The daily automation was updated to use this audience and visual guidance while retaining its existing schedule and local-only publication boundary.

Use the [Steve O’Brien tone-of-voice guide](../tone-of-voice.md) when drafting and editing. Keep the diary personal and specific; reserve exhaustive verification detail for the evidence ledger.

- Daily: about 100–180 words, a specific title, concrete progress and one useful observation.
- Weekly: about 600–800 words, connecting the work rather than repeating a task list.
- Use Europe/London dates for the work itself. A task's creation date is not necessarily its completion date.
- Preserve the distinction between research, proposed work, local implementation, a commit or push, and a verified deployment.
- Omit private client details, personal account information, internal infrastructure details and sensitive security findings.
- Keep uncertain days empty rather than inventing activity. The initial archive has no entry for 7 September; the 16 September note covers a partial historical record and no longer claims the day is still in progress.

## Editing and adding entries

Canonical website content is `src/pages/work-stream/entries.js`. Each entry has a unique slug, ISO date, `daily` or `weekly` kind, title, summary, project labels and plain-text paragraphs. Weekly reviews also have a period label. Place entries newest first, with a weekly review before its same-date daily note. Set `ongoing: true` only for a partial day.

Routes, static output, sitemap entries, metadata and reading time derive from that collection. Public pages contain editorial copy only; these source notes are not imported into the application. `first-edition.md` is a review copy of the initial content, not a second content source.

## Daily maintenance

The existing `content-from-work` automation was updated on 23 September 2026 to **Steve’s daily work notes**, active at 08:00 every day in the local Europe/London timezone and attached to the diary task. It reviews the previous completed London calendar day and updates the local website files. On Mondays it also reviews the completed Monday–Sunday week.

Each run reads the current entries and these instructions, checks available dated Codex records and repository history, and uses Computer History only after checking its status and following its skill. Add one selective daily entry when supported, leaving unsupported days empty. Catch up missed supported dates since the last completed entry; never duplicate a slug or overwrite Steve’s manual edits. Add a weekly review only from supported work, acknowledging gaps. Short evidence supports a short note; do not pad it to meet the word target.

After changes, validate entry dates, uniqueness and ordering, then run `npm run build`. Preserve unrelated worktree changes. Notify Steve when entries were added or materially corrected, verification failed, or input is needed; stay quiet when nothing supported changed. The schedule updates local files only. Commits, pushes and deployment remain separate, explicitly authorized actions. The computer and Codex app need to be running for local scheduled work.

## Evidence ledger

Sources are Codex task identifiers, with completion details read from selected original task records. Additional broad descriptions were recovered from saved summaries. Git logs for the personal site, Platform and DOM Studio were checked on 16 September to cross-check the sequence of commits; commit dates alone were not treated as deployment dates.

| Entry | Source tasks and scope |
| --- | --- |
| 8 September | `01a08016-361d-7db3-aaa3-904d0a401693`: original outage diagnosis, host unreachable, physical cause unconfirmed. `01a08102-960a-7111-ad04-ec534fe10e12`: coaster app summary, interaction checks and private deployment. |
| 9 September | `01a08551-cc58-7070-a0f9-47a9f3259d71`: original 9 September completion for framework consolidation; 10 September follow-up excluded from that day's claim. `01a08669-f539-7733-aed7-256a85e114ed`: personal mantras. Saved summaries also cover welcome flow, homepage transitions and book-cover revision. |
| 10 September | `01a08bab-27ce-75b0-b3c0-afe5367bb5b3`: keyword metrics, local repair and verification, explicitly not deployed then. `01a08b18-c6e0-7d53-8a06-c55ffd920abd`: personal-site db3 card; Studio/Cloud kept as roadmap. DOM Studio git log confirms month-calendar work. |
| 11–12 September | `01a08f8f-cf42-7af3-8ea4-b969407d0e06`: original dated messages confirm local starter work on Friday and verification of published beta packages on Saturday. Scout work descriptions use saved work summaries and the subsequent repository log. |
| 12 September | `01a09592-cd37-7593-8249-8302580edd95`: original chart push and later local cashflow demonstration. `01a0956b-751a-7b21-8312-49a549edf521`: original publication API research, no integration claimed. |
| 13 September | `01a09abb-430f-7540-b2ac-8066cfdc6ada`: original grouped-issue UI verification and clarification that grouping derives from page occurrences. DOM Studio git history and saved summaries cover mobile, Gantt, collaboration, SEO and build-memory work. The db3 visual application flow remains a proposal. |
| 14 September | Saved summaries for media, theme editor, AI docs, planner and sidebar work. `01a0a00c-772b-74a1-ad6d-9f995c500e60`: historical homepage deployment and live checks. `01a0a100-f9f2-7f32-b717-32498f214fcd`: historical Scout deployment and health checks. No assertion that all subsequent changes were in either release. |
| 15 September | `01a0a533-34cc-7932-a533-56d7fa74d2d9`: original article save/publish safeguards. `01a0a538-1f80-7443-b0ae-eab447f679b9`: original final billing clarification; shared renewal and proration retained. `01a0a3d9-e750-7b02-940b-44f607e30604` and `01a0a3e7-2af2-71b2-a2ce-950819e2de5a`: component push versus later menu implementation. |
| 16 September | Live task reads: `01a0a9ab-261b-7061-863d-83b398ae35f1`, queued visibility and prompt context; `01a0a976-93f2-7413-a1d6-35460f52ddb3`, keyword volume and shared research function. Onboarding work was still active when this note was written. |
| Weekly review | Synthesis of 8–13 September entries. No activity inferred for 7 September. Future-facing questions are editorial reflections, not completed outcomes. |

### 23 September catch-up and narrator revision

The original 8–16 September entries were changed to the AI narrator without adding historical incidents or new release claims. The review copy in `first-edition.md` was refreshed to match that original date range. The stale “in progress” marker on 16 September was replaced with an explicit note about partial source coverage.

The following daily notes were reconstructed from saved task summaries and checked against dated final messages in the corresponding original Codex session JSONL files. These describe historical outcomes, not fresh audits of those products. Computer History was checked on 23 September and was running; the backfill itself uses task records, not inferred background activity.

| Entry | Original task and dated evidence |
| --- | --- |
| 17 September | `01a0aedc-e0f8-7063-a705-729ac3a50696`, Platform: automatic resumable preparation and collected-data inspector; local checks recorded. Final replies at 14:46 and 15:06 UTC acknowledge duplicated research and propose consolidation; do not claim consolidation was implemented. |
| 18 September | `01a0b481-d1ef-7bd1-aef8-1c243df38e5b`, Platform, final at 16:15 UTC: seven-item preparation horizon, three-article trial boundary, queued-topic context, 127 tests/types/build, explicitly local and uncommitted. Seven items is historical policy; the 22 September entry records its change. |
| 19 September | `01a0bb08-0071-7bd3-89ea-551b8e2443f3`, DOM Studio, final at 18:58 UTC: commit `83a2285`, pushed and clean/aligned. No package publication or deployment inferred. |
| 20 September | `01a0be62-7eb7-7080-b8b4-b94d74d1d494`, Platform, finals at 12:45 and 12:48 UTC: fixed tab bar/scrolling, saved Google-region label, focused tests and SPA build. Companion-chat migration is not claimed. |
| 21 September | `01a0c49c-3783-7bc2-a8dc-474f4f92197b`, Platform, finals at 16:59 and 17:07 UTC: product direction followed by local Studio demonstration, SQLite persistence, simulated delivery/retry, three tests/build/browser walkthrough. The summary’s later update timestamp is not the completion date. No current running-server claim. |
| 22 September | `01a0ca59-8dc5-77a0-898f-4e2db19a453e`, Platform, final at 20:16 UTC: 30 upcoming items, reused preparation, removed unused worldwide lookup, unchanged writing limit, 92 tests/types/naming. Explicitly not deployed and no automatic past-date backfill. |
| Week of 14 September | Synthesis of existing 14–16 September notes and the supported 17–20 September entries above. Wednesday’s partial record is acknowledged. No later work moved into this week. |

### 24 September morning review

Added the 23 September daily entry. Review window: 23 September 2026, 00:00–24:00 Europe/London (22 September 23:00 through 23 September 23:00 UTC, end exclusive). The latest existing daily entry was 22 September, so no catch-up gap remained. Thursday run: no weekly review due.

- Recovery: original task `01a0cd88-f278-75d2-b8aa-3a0dabb8802d`, final at 12:46 UTC, corroborated by `platform/docs/reviews/2026-09-23-framework-recovery-drill.md`: corrected local restore, database/uploads and readiness verified. Separate-host recovery remained unfinished. Private data counts, infrastructure specifics and unrelated security findings were excluded from public copy.
- Release: original task `01a0ce61-b593-7e50-92ae-5186b72f566c`, final at 16:56 UTC, corroborated by `/private/tmp/scout-release-verification-20260923.md` and Platform Git history: `73d66e64` committed/pushed/deployed, migrations and public health verified. No blanket claim that every test or final main CI passed; no fresh live audit performed for this diary.
- DOM Studio homepage: original task `01a0ce00-a755-70d2-8ac6-931efddc599e`, finals at 11:33 and 13:25 UTC: Kanban/account-grid/poster-designer preview, browser verification, build and 16 snapping tests; explicitly local and uncommitted.
- Diary direction: original task `01a0ce01-8235-7de0-8777-32b4381af753`, user instructions and final at 11:35 UTC: AI narrator, truthful content and 08:00 daily reviews. The closing aside is narrator commentary, not an invented exchange.
- Computer History skill was read, but its status tool was not available in this scheduled run. No Computer History data was relied on; dated original task records and repository evidence supplied the entry.
- Validation: 168 words; unique slugs and newest-first ordering; generated page, AI byline, sitemap inclusion and private evidence boundary checked. `npm run build` passed with 93 routes, including the development-only book exclusion check. `git diff --check` passed. Changes remain local and uncommitted.

### 25 September morning review

Added the 24 September daily entry. Review window: 24 September 00:00–24:00 Europe/London (23 September 23:00 to 24 September 23:00 UTC, end exclusive). Latest existing entry: 23 September; no catch-up gap. Friday run: no weekly review due.

- Scheduler: original task `01a0ce61-b593-7e50-92ae-5186b72f566c` continued from 23 September. Finals on 24 September at 19:53 and 20:50 UTC describe elapsed-minute catch-up, persisted progress and the controlled-clock test using a real database/queue: ten jobs at 12:00, thirteen seconds per enqueue, then 12:01/12:02 jobs, all twelve completed. The diary does not claim complete crash recovery; claim-to-enqueue reconciliation remained a stated limitation.
- Deployment: same original task, final at 21:12 UTC: `52e9bcc1` committed/pushed/deployed, 149 tests plus build/migration, live release identity/health and scheduler/worker checks verified. Platform Git history independently confirms the 24 September commit. This is historical release evidence, not a fresh production audit. No claim about unrelated incident-reporting work remaining uncommitted for the entire day: a later commit exists.
- Cloud proposal: original task `01a0d30e-a89f-78f2-8f89-40c86f816600`, finals at 10:59, 11:09 and 19:36 UTC, corroborated by `platform/docs/db3-cloud-product-plan.md`: proposed managed hosting, Cloudflare networking direction and optional scale-to-zero. No available Cloud service or implemented sleep/wake system claimed. The proposal’s earlier scheduler limitation is not presented as unchanged after the later fix.
- Computer History skill read and status checked: reported running, but latest returned segment metadata began at 24 September 21:00 UTC, older than this morning’s review. No fresh activity inferred and no background event content needed; original task records and repository sources supplied the note. The sleep/appointments aside is editorial observation, not invented dialogue.
- Validation: 164 words, date/order and unique-slug checks, rendered title/AI byline, sitemap inclusion and private evidence boundary passed. `npm run build` generated 94 routes and passed the development-only book exclusion check; `git diff --check` passed. Only the diary source and evidence ledger were edited; changes remain local and uncommitted.

Historical release statements describe the state observed in those records. Live systems were not re-audited for this diary. Computer History availability is recorded separately for each review above; it was unavailable for the initial 16 September edition.
