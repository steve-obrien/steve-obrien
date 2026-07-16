---
title: 19. Trying other corpora and scaling the model
description: Change the learned voice with new text, design fair corpus comparisons, and understand what grows on the path to a real LLM.
date: 2026-07-16
status: published
listed: false
parent: building-a-tiny-language-model-from-scratch
order: 19
tags: [LLMs, Datasets, Scaling]
metaDescription: Retrain a tiny Transformer on other corpora and understand the changes needed to scale toward larger language models.
metaKeywords: [language model datasets, public domain corpus, TinyStories, LLM scaling]
---

Tiny Shakespeare leaves a visible fingerprint on the output: uppercase speakers, colons, short dramatic lines, and invented names. Training the same architecture on a different corpus is one of the clearest ways to see that the model learns statistical structure from data rather than receiving a built-in writing style.

Good next corpora include:

- [Alice's Adventures in Wonderland](https://www.gutenberg.org/ebooks/11) for dialogue, fantasy, and playful language;
- [Frankenstein](https://www.gutenberg.org/ebooks/84) for longer formal and Gothic prose;
- a matched collection of public-domain fantasy books;
- [TinyStories](https://arxiv.org/abs/2305.07759), a synthetic corpus designed to investigate coherent language in small models;
- a bounded, attribution-compliant Wikipedia extract for more factual prose.

Modern copyrighted novels should not be bundled or automatically downloaded into a public tutorial. A generic local-file option can let a reader experiment with text they are permitted to use without committing or redistributing that corpus.

## Design a useful corpus comparison

To compare Shakespeare with another dataset rather than merely run two unrelated trainings:

1. record source, licence, checksum, cleaning, and split;
2. match the amount of training text or state the difference clearly;
3. use a shared character or byte vocabulary so parameter count stays fixed;
4. hold architecture, seed policy, optimiser, context, and token budget constant;
5. generate from shared prompts and sampling settings;
6. report within-corpus loss improvement rather than declaring the easiest corpus “best”;
7. measure exact generated matches against training text to detect regurgitation;
8. retain all samples selected by the predefined protocol.

An Alice-trained model should look different from a Shakespeare-trained model even when both remain mostly nonsense. That visible dependency on the corpus is exciting precisely because the implementation has no special-case knowledge of plays, fantasy, speakers, or prose.

## What changes on the path to a real LLM

The conceptual objective remains next-token prediction, but engineering scale changes almost everything around it:

- character tokens give way to byte or subword vocabularies;
- thousands of documents require deduplication, filtering, licensing, and provenance;
- pre-norm blocks, modern activations, rotary positions, and other architectural variants become common;
- mixed precision, gradient accumulation, distributed training, and fault-tolerant checkpoints become necessary;
- evaluation expands beyond one validation loss;
- instruction tuning and preference optimisation are added after base-model pretraining;
- serving must manage batching, caches, latency, memory, and safety.

Do not let those systems obscure the foundation. The 799,360-parameter model and a frontier model still turn token IDs into representations, use attention to combine context, produce next-token logits, and learn by reducing prediction error. Building the tiny version gives you a concrete mental model for questioning the larger one.

[Return to the series overview](/articles/building-a-tiny-language-model-from-scratch)
