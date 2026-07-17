---
title: 2. Preparing a small, reproducible corpus
description: Download, verify, split, and record a text corpus so every later result has a trustworthy source.
date: 2026-07-16
status: published
listed: false
parent: building-a-tiny-language-model-from-scratch
order: 2
tags: [LLMs, Data, Reproducibility]
metaDescription: Prepare a pinned Tiny Shakespeare corpus with checksums and deterministic train-validation splits.
metaKeywords: [Tiny Shakespeare, language model corpus, training split, validation split, data leakage]
---

Before we write a tokenizer or a single neural-network layer, we need to know exactly what the model will learn from. The architecture cannot compensate for an unclear dataset, so let's make the corpus reproducible enough that another developer can obtain the same bytes.

The course uses **Tiny Shakespeare**, a compact plain-text collection of dialogue. It is large enough to contain recurring words, speakers, punctuation, and structure, while small enough to download and inspect instantly.

## Pin the source, not just the URL

The preparation command records:

- upstream commit `370cbcd448eb7daf32f21a6be560b70e0b33c4e3`;
- SHA-256 `86c4e6aa9db7c042ec79f339dcb96d42b0075e16b8fc2e86bf0ca57e2dc565ed`;
- `1,115,394` downloaded bytes and characters;
- a 65-character vocabulary;
- the exact split sizes and generated filenames.

```bash
.venv/bin/python lessons/02-corpus-and-tokenisation/prepare.py
```

The checksum matters because a URL can continue working after its contents change. A mismatch stops preparation rather than silently producing results that no longer correspond to the article.

## Training and validation data

The first 90% of the character stream becomes `1,003,854` training tokens. The final 10% becomes `111,540` validation tokens. Training windows are sampled only from the training tensor; validation windows are used only to estimate loss.

```diagram
pinned text file
  -> verify checksum
  -> first 90%: training tokens -> parameter updates
  -> final 10%: validation tokens -> measurement only
```

Validation answers a useful question: has the model learned patterns that also help on held-out text, or has it merely reduced error on examples used for updates?

This contiguous split is easy to reproduce and avoids overlapping windows across the boundary. It is not a perfect evaluation of literary generalisation: both sides still come from the same broad Shakespeare collection. A more demanding multi-document corpus could hold out complete chapters or books.

## Why the core tutorial does not crawl websites

A crawler introduces changing pages, duplicate navigation, markup cleaning, rate limits, licensing questions, and an unbounded amount of text before the model exists. Those are valuable data-engineering subjects, but they obscure the mechanics this series is trying to expose.

Start from one pinned text file. Once the pipeline is trustworthy, swapping in public-domain books, bounded Wikipedia extracts, or synthetic stories becomes an experiment rather than a debugging variable.

## Follow the code

The [preparation script](https://github.com/steve-obrien/tiny-transformer-course/blob/main/lessons/02-corpus-and-tokenisation/prepare.py) coordinates the download. The reusable work lives in [`data.py`](https://github.com/steve-obrien/tiny-transformer-course/blob/main/tiny_transformer/data.py), where the source revision, checksum, split, and output manifest are enforced.

Once the command works, try changing the split fraction in your fork and inspect the new manifest. Do not compare the resulting loss with the published run as if nothing changed; you have deliberately created a different experiment.

[Next: turn text into tokens](/articles/building-a-tiny-language-model-from-scratch/03-tokenisation)
