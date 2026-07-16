---
title: 11. Combining several attention heads
description: Run independent attention projections in parallel, concatenate their results, and restore the model dimension.
date: 2026-07-16
status: published
listed: false
parent: building-a-tiny-language-model-from-scratch
order: 11
tags: [Transformers, Multi-head Attention, PyTorch]
metaDescription: Implement multi-head self-attention from independent query, key, and value projections.
metaKeywords: [multi-head attention, attention heads, Transformer implementation]
---

One attention head produces one weighted retrieval pattern. Multi-head attention gives the layer several independent sets of query, key, and value projections.

For model width 128 and four heads, every head produces 32 features:

```text
head dimension = model dimension / number of heads
               = 128 / 4
               = 32
```

Each head sees the complete 128-feature input but projects it into its own 32-feature Q, K, and V spaces. After attention, the four outputs are concatenated back to 128 features and passed through one output projection.

```python
head_results = [head(inputs, allowed_mask=mask) for head in self.heads]
concatenated = torch.cat([result.output for result in head_results], dim=-1)
combined = self.output_projection(concatenated)
```

## What different heads mean before training

Randomly initialised heads produce different attention matrices because their projections differ. That does not mean one head has already discovered syntax while another understands speakers. Meaningful specialisation, if it appears, must emerge from training.

The focused example sends four positions with eight features through two four-feature heads:

```bash
.venv/bin/python lessons/08-multi-head-attention/example.py
```

It verifies:

- output shape returns to `(1, 4, 8)`;
- attention weights are shaped `(1, 2, 4, 4)`;
- every probability row sums to one;
- all future weights are zero;
- the two seeded heads produce different matrices;
- gradients reach every head and the output projection.

The model dimension must divide exactly by the head count. Failing at configuration time is better than discovering an invalid reshape halfway through training.

[Next: the feed-forward network](/articles/building-a-tiny-language-model-from-scratch/12-feed-forward-network)
