---
title: 12. The position-wise feed-forward network
description: Follow attention with a shared nonlinear transformation that operates independently at every sequence position.
date: 2026-07-16
status: published
listed: false
parent: building-a-tiny-language-model-from-scratch
order: 12
tags: [Transformers, Neural Networks, PyTorch]
metaDescription: Implement the Transformer's position-wise feed-forward network and understand its role after attention.
metaKeywords: [position-wise feed-forward network, ReLU, Transformer block]
---

Attention communicates across positions. The feed-forward sublayer performs a different job: it transforms each position independently using the same learned function.

The paper uses two linear transformations with a ReLU between them:

```text
FFN(x) = max(0, xW₁ + b₁)W₂ + b₂
```

In the course model, a 128-feature vector expands to 512 features and contracts back to 128:

```python
self.input_projection = nn.Linear(128, 512)
self.activation = nn.ReLU()
self.output_projection = nn.Linear(512, 128)
```

PyTorch applies a linear layer over the final dimension, so a tensor shaped `batch × time × 128` remains batched and sequential while each position passes through the same network.

## Proving that positions do not mix

Change one input position and run the feed-forward layer twice. The changed position should produce a different output; every other position should remain bit-for-bit identical.

```bash
.venv/bin/python lessons/09-feed-forward-and-normalisation/example.py
```

The retained example reports exactly zero change at unaffected positions. That property contrasts with attention, where changing one visible position may intentionally influence later positions.

## Why the hidden layer is wider

The expansion provides more intermediate features in which ReLU can create nonlinear combinations. Without a nonlinear activation, two consecutive linear layers could collapse into one linear transformation and add little expressive power.

The feed-forward network accounts for a substantial share of Transformer parameters. It is easy to overlook because the attention diagram is more visually distinctive, but attention alone would only remix value vectors. The nonlinear per-position computation gives each block additional capacity to transform what it retrieved.

[Next: residuals, LayerNorm, and dropout](/articles/building-a-tiny-language-model-from-scratch/13-residuals-normalisation-dropout)
