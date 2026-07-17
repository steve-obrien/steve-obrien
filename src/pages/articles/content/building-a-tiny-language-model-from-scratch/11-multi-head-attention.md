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

One attention head gives us one way to retrieve information. Rather than asking that single calculation to represent every useful relationship, multi-head attention gives the layer several independent sets of query, key, and value projections.

For model width 128 and four heads, every head produces 32 features:

```text
head dimension = model dimension / number of heads
               = 128 / 4
               = 32
```

Each head sees the complete 128-feature input but projects it into its own 32-feature Q, K, and V spaces. After attention, the four outputs are concatenated back to 128 features and passed through one output projection.

```diagram
128-feature input
  -> head 1: 32 features --+
  -> head 2: 32 features   |
  -> head 3: 32 features   +-> concatenate -> output projection -> 128 features
  -> head 4: 32 features --+
```

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

## Under the hood

[`MultiHeadSelfAttention`](https://github.com/steve-obrien/tiny-transformer-course/blob/main/tiny_transformer/attention.py) creates independent heads, calls each one with the same input and mask, concatenates their outputs, and applies the shared output projection. Nothing in the code assigns a linguistic job to a head; training has to discover any specialisation.

Try changing the tiny example from two heads to one, keeping the total model width fixed. Compare the output shape and the number of attention matrices. You should lose a retrieval pattern without changing the width passed to the next layer.

[Next: the feed-forward network](/articles/building-a-tiny-language-model-from-scratch/12-feed-forward-network)
