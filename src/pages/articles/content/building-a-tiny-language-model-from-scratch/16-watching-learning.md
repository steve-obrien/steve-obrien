---
title: 16. Reading the loss curve and generated samples
description: Compare identical seeded generations before and after training without mistaking word-like text for understanding.
date: 2026-07-16
status: published
listed: false
parent: building-a-tiny-language-model-from-scratch
order: 16
tags: [LLMs, Evaluation, Generation]
metaDescription: Compare untrained and trained language-model samples alongside held-out loss measurements.
metaKeywords: [language model evaluation, training loss, validation loss, generated samples]
---

This is the bit I find exciting: we can watch a pile of random numbers begin to reflect the text it has seen. Loss gives us a consistent numerical signal, while generated samples reveal what kind of structure the model has learned. We need both. A single attractive sample is easy to cherry-pick, and loss alone does not show whether an improvement is visible to a reader.

The following generations use the same prompt, sampling seed, temperature, top-k value, and length. Only the learned parameters changed.

## Before training

```prompt
ROMEO:
```

```model-output
lHHHAueGltG3ee$33hh:;AexxDHxDDDDDhxxxlDHxqLlLlqR
D33HHHHHejlDDG:lhnjpqeqjqqZxjxGtDtsjjlllqq
GellHBBBqxxsDh,qqqGDq
```

The random model knows which 65 characters exist, but the logits encode no corpus statistics. Repetition and arbitrary punctuation dominate.

## After 1,500 updates

```prompt
ROMEO:
```

```model-output
Fid trely levewep's wear bud thing flor pand the sprit encenk son
The to he methes illy dofeakence I swher soot
And his, the ago I fore mor neve and.

LUCERIO:
Gown you ur labll oon had menche cont opy lonee,
War ainch you withe win sthin ath se the
and thild hee me foreer or sin butede.

LUSENGOLA
```

The model has learned several levels of regularity:

- spaces usually separate word-like fragments;
- apostrophes and commas appear in plausible local positions;
- lines end at plausible intervals;
- uppercase speaker-like names are followed by colons;
- blank lines separate turns;
- common character sequences resemble English spelling.

It has not learned reliable words, grammar, characters, facts, or plot. `LUSENGOLA` looks like a name because it follows corpus patterns, not because it refers to a known speaker.

That gap is the point of the exercise. You can see learning occur without confusing statistical resemblance with language understanding. For a model this small, trained on one short corpus, the transition from arbitrary symbols to recognisable dramatic form is already a remarkable result.

## Inspect the evidence yourself

The repository retains the [complete training artifact](https://github.com/steve-obrien/tiny-transformer-course/tree/main/artifacts/runs/20260715T194302Z-transformer-training), including configuration, metrics, environment, and unedited samples. It is there so you do not have to trust the two blocks selected for this article.

When you train your fork, keep a fixed prompt and sampling seed. Then add any playful prompts you like. The fixed sample supports comparison; the playful ones help you notice behaviours worth investigating next.

[Next: reload the checkpoint and generate](/articles/building-a-tiny-language-model-from-scratch/17-generation)
