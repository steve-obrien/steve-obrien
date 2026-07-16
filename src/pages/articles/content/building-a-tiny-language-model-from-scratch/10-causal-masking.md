---
title: 10. Causal masking prevents future leakage
description: Train all sequence positions in parallel without allowing a prediction to inspect characters that come later.
date: 2026-07-16
status: published
listed: false
parent: building-a-tiny-language-model-from-scratch
order: 10
tags: [Transformers, Attention, Testing]
metaDescription: Implement and test a causal attention mask that prevents future-token leakage.
metaKeywords: [causal mask, masked self-attention, future leakage, autoregressive Transformer]
---

The entire training sequence is present in memory, including the characters each position is meant to predict. Unmasked self-attention would let the model read those future answers.

A causal mask permits only the lower triangle of the attention matrix:

```text
allowed =
1 0 0 0
1 1 0 0
1 1 1 0
1 1 1 1
```

Position zero can use only itself. Position two can use positions zero, one, and two. No position can inspect a later key.

```python
mask = torch.ones(sequence_length, sequence_length, dtype=torch.bool).tril()
scores = scores.masked_fill(~mask, float("-inf"))
weights = torch.softmax(scores, dim=-1)
```

Softmax maps the forbidden negative-infinity entries to exactly zero.

## Test behaviour, not just the triangle

Checking the mask tensor is necessary but insufficient. The stronger test changes future input vectors dramatically and measures whether earlier outputs move.

```bash
.venv/bin/python lessons/07-causal-masking/example.py
```

In the retained example, two future vectors were changed by `+100`:

| Attention mode | Change at earlier output |
| --- | ---: |
| Causal mask enabled | `0.00000000` |
| No mask | `44.83640671` |

The unmasked number belongs only to that seeded example. The invariant that matters is the masked result: future changes caused exactly zero earlier change.

The complete model repeats this test after embeddings, four attention blocks, feed-forward layers, residual connections, and output projection. Causality must survive composition, not merely one helper function.

[Next: multi-head attention](/articles/building-a-tiny-language-model-from-scratch/11-multi-head-attention)
