---
title: 4. Constructing inputs, targets, and batches
description: Turn one token stream into aligned next-character examples that train every position in parallel.
date: 2026-07-16
status: published
listed: false
parent: building-a-tiny-language-model-from-scratch
order: 4
tags: [LLMs, Training, PyTorch]
metaDescription: Build shifted language-model targets, context windows, and batches from a token stream.
metaKeywords: [language model batching, shifted targets, context window, teacher forcing]
---

A next-token training example is one sequence viewed twice with a one-position offset.

For a short context:

```text
input:  First Citizen:\nB
target: irst Citizen:\nBe
```

At input position zero, `F` predicts `i`. At position one, the context `Fi` predicts `r`. A context length of 16 therefore supplies 16 related prediction targets, not one.

## Sampling a batch

The batch builder chooses random starting offsets from the training token stream. For each offset `s` and context length `T`:

```python
inputs = tokens[s:s + T]
targets = tokens[s + 1:s + T + 1]
```

Stacking several windows produces tensors shaped:

```text
inputs:  batch × time
targets: batch × time
```

The executed example creates tensors shaped `(4, 16)` and prints the decoded first pair so shape assertions remain connected to readable text.

```bash
.venv/bin/python lessons/03-training-examples/example.py
```

## Teacher forcing without future leakage

During training, the correct earlier characters are present in the input even if the model would have generated something else. This is commonly called **teacher forcing**.

The target tensor is also in memory, but it must not become visible to the prediction that is being scored. Later, causal masking will prevent an attention query at position `t` from looking at positions after `t`.

Keep data alignment tests separate from attention tests. If the targets are shifted incorrectly, a perfect mask and correct Transformer will still learn the wrong task.

[Next: train a bigram baseline](/articles/building-a-tiny-language-model-from-scratch/05-bigram-baseline)
