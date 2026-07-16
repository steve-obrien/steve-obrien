---
title: 8. Does king - man + woman equal queen?
description: Understand where the famous embedding analogy comes from and why a character-level Transformer does not expose the same kind of word vectors.
date: 2026-07-16
status: published
listed: false
parent: building-a-tiny-language-model-from-scratch
order: 8
tags: [Embeddings, Word2Vec, Transformers]
metaDescription: Explain the king minus man plus woman analogy and how contextual Transformer representations differ from static word embeddings.
metaKeywords: [king man woman queen, embedding arithmetic, Word2Vec, contextual embeddings]
---

The expression

```text
vector("king") - vector("man") + vector("woman") ≈ vector("queen")
```

is one of the most memorable demonstrations in machine learning. It is also easy to attach it to the wrong model.

The classic result is associated with models such as Word2Vec that learn one static vector for every word in a vocabulary. In that setting, `king`, `man`, `woman`, and `queen` each index a single embedding row, so vector arithmetic and nearest-neighbour search are well defined.

## Why this model does not work that way

The course model has a 65-entry **character** vocabulary. Its embedding table contains vectors for `k`, `i`, `n`, and `g`; it has no input row representing the word `king`.

After several Transformer blocks, the characters do have contextual representations. The final `g` in `the king spoke` can contain information gathered from the earlier characters. But that representation changes when the same word appears in `a king died` or `KING:`. There is no single canonical vector to subtract.

Scale is part of the difficulty, but it is not the only issue. Even a very large contextual Transformer does not automatically expose static word arithmetic at its input embedding table. Architecture, tokenisation, training objective, layer choice, pooling method, and corpus coverage all affect the experiment.

## An honest experiment for this Transformer

You can still ask whether a relationship is present in its hidden states:

1. Find many held-out occurrences of `king`, `man`, `woman`, `queen`, and candidate words.
2. Run each occurrence with its surrounding context.
3. Pool the final hidden states spanning each word.
4. Average several contexts to reduce dependence on one sentence.
5. Compute `king − man + woman` from those averages.
6. Rank every candidate by cosine similarity and retain the complete top ten.
7. Repeat across layers and random seeds rather than showing only the best result.

If `queen` ranked first, that would be exciting evidence. With 799,360 parameters, character tokens, one small Shakespeare corpus, and 1,500 updates, failure is the more credible expectation. Sparse word occurrences and unstable contextual pooling can dominate the result.

## Two different lessons worth keeping separate

If your goal is to reproduce the classic analogy, add a small word-level skip-gram or CBOW model trained on a much larger corpus. That experiment directly teaches static embedding geometry.

If your goal is to understand this Transformer, inspect contextual representations and report what actually happens—even if `queen` is nowhere near the answer. A failed analogy can teach more than a cherry-picked success because it reveals the difference between token embeddings, contextual states, and scale.

The course does not currently claim this result. The page defines the experiment that would be required before making it.

[Next: implement scaled dot-product attention](/articles/building-a-tiny-language-model-from-scratch/09-scaled-attention)
