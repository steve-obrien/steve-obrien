---
title: Markdown with Vue escape hatches
description: A starter article showing how long-form writing can live beside real Vue components.
date: 2026-05-25
tags: [Writing, Vue, Systems]
---

Writing on a technical website should feel calm. The article should carry the reader from idea to idea without the interface constantly announcing itself, but the page still needs room for code examples, diagrams, interactive demos, and embedded tools.

This article is a small working example for the new articles section. The content is markdown, while richer pieces are Vue components registered for article use.

## The authoring shape

Normal prose stays in markdown:

```md
## A section heading

Write the argument in plain markdown. Add code fences, lists, links, and quotes as needed.
```

When markdown is too small a box, include a Vue component on its own line:

```md
::ArticleMetricBand{width="page" eyebrow="Escape hatch" title="Vue owns this part"}
```

The `width` option accepts `article` or `page`. Article width keeps the component aligned with the reading column. Page width lets demos and dense visual explanations use the full site content area.

::ArticleMetricBand{width="page" eyebrow="Escape hatch" title="Vue can own the structured parts" body="This band is a real Vue component included from markdown. Swap it for charts, simulations, playgrounds, product demos, or embedded tools as the article library grows."}

## Media examples

Images can stay in ordinary markdown. Put shared article assets in `public/articles/` and reference them from the site root:

![A diagram showing markdown prose flowing into a Vue component escape hatch and back into article prose.](/articles/component-escape-hatch.svg)

Video embeds are a good fit for the Vue escape hatch, because they need a responsive wrapper, privacy-friendly embed URL, and strict iframe attributes:

```md
::ArticleYouTube{width="article" id="dQw4w9WgXcQ" title="Example YouTube embed"}
```

::ArticleYouTube{width="article" id="dQw4w9WgXcQ" title="Example YouTube embed"}

## Why this split works

Markdown is excellent for durable writing. Vue is excellent for state, layout, and interaction. Keeping the join explicit makes articles easy to scan in a text editor while still giving each piece an escape hatch when the material needs more than words.

> Serious writing benefits from quiet defaults: a comfortable line length, generous spacing, clear headings, and almost no decorative noise.

That is the visual direction here: restrained, editorial, and readable, with enough structure to support deeper technical material later.
