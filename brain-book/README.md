# Human Brains, Artificial Brains, Future Brains

The local book-writing area of the personal website. Markdown is the canonical manuscript; Vue is only the reading and contents interface.

## Local writing workspace

Run `npm run dev` from `~/Sites/steve-obrien`, then open
<https://local.steve-obrien.com/brain-book> or <http://localhost:8200/brain-book>.
The book shares the personal site's port 8200 and has no separate server.

Choose **Edit book** to change headings and planning details on the contents
page, or manuscript and private guide notes on a chapter page. Use **Save headings**
on the contents page or **Save** in the chapter toolbar to persist edits. Markdown remains the manuscript source;
YAML remains the ordering and metadata source.

The manuscript uses DOM Studio's document editor for headings, bold, italic,
underline, lists, quotes, code blocks, links, images by URL, and tables.
The title sits inside the document and saves separately as chapter metadata. A
single sticky toolbar holds formatting, **Save**, and **Done**; Command/Ctrl+S
also saves, and **Done** saves pending changes before returning to reading.
The sidebar shows a live manuscript word count, writing target, chapter details,
and private notes. Switch between **Rich text** and **Markdown** there to edit either
representation. Opening the rich editor does not rewrite the source. Formatting
changes are converted to Markdown; underlines and tables use embedded HTML to
preserve formatting and merged cells. Private guide notes remain separate.

This entire workspace is development-only. Production builds and previews exclude
the book routes, manuscript, guide notes and file-writing endpoints. The normal
`npm run build` command checks the generated assets and sitemap for accidental
inclusion. Run `npm run test:brain-book` for editor and route-inventory tests.

## Shape the book

The two places you will normally edit are:

- `brain-book/book.yml` — parts, chapter headings, order, questions, status, and word targets
- `brain-book/chapters/*.md` — the manuscript itself

Every chapter in `book.yml` needs a matching Markdown file whose filename is its slug. For example:

```yaml
- number: "24"
  slug: a-new-thought
  title: A New Thought
  question: What does this chapter want to discover?
  status: seed
  wordTarget: 1200
```

Create `brain-book/chapters/a-new-thought.md`, save both files, and the development site will refresh.

Chapter status follows a deliberately simple path:

```text
seed → outline → draft → review → complete
```

The progress summary counts any non-seed chapter as started and uses complete chapters for the completion percentage.

## Book text and guide text

Chapter files can hold both kinds of text while remaining ordinary Markdown. Private guide notes are stored in a clearly marked HTML comment:

```md
<!-- book-guide
Questions to explore and private research notes go here.
-->

The reader-facing manuscript begins here.
```

The website displays these as separate regions. Guide notes never render as part of the manuscript.

## Where the website code lives

- `src/brain-book/pages/ContentsPage.vue` — contents page and heading editor
- `src/brain-book/pages/ChapterPage.vue` — chapter reader and manuscript editor
- `src/brain-book/styles.css` — typography and visual design
- `src/brain-book/lib/book.js` — YAML and Markdown loading
- `scripts/brain-book-editor.mjs` — development-only saving back to the book files
