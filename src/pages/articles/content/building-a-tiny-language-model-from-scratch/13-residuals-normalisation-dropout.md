---
title: 13. Residual connections, LayerNorm, and dropout
description: Keep deep blocks trainable and stable while preserving a deterministic inference path.
date: 2026-07-16
status: published
listed: false
parent: building-a-tiny-language-model-from-scratch
order: 13
tags: [Transformers, LayerNorm, Training]
metaDescription: Understand residual connections, post-LayerNorm, and dropout inside a Transformer block.
metaKeywords: [Transformer residual connection, LayerNorm, dropout, post-norm]
---

Attention and feed-forward layers do not stand alone. Each sits inside a residual path with dropout and LayerNorm.

The original paper uses **post-norm** ordering:

```text
x = LayerNorm(x + Dropout(MaskedMultiHeadAttention(x)))
x = LayerNorm(x + Dropout(FeedForward(x)))
```

## Residual connections

Adding the input directly to a sublayer's output preserves an identity path through the block. The sublayer can learn a useful change rather than reconstructing the complete representation, and gradients have a shorter route backwards.

Residual addition requires matching shapes. That is why attention concatenates back to the model width and the feed-forward network contracts to it.

## LayerNorm

LayerNorm normalises the features within each token position, then applies a learned scale and offset. It does not mix examples or sequence positions.

The lesson checks that the normalised feature means are near zero and variances are near one. Those measurements describe the normalised intermediate values; learned scale and offset can later move them.

## Dropout

Dropout randomly suppresses residual-branch values during training. Repeated training-mode calls can differ. In evaluation mode it becomes an identity operation, making checkpoint generation deterministic for a fixed sampling seed and environment.

```python
model.train()  # dropout active
model.eval()   # dropout disabled
```

Run the example to contrast both modes:

```bash
.venv/bin/python lessons/09-feed-forward-and-normalisation/example.py
```

Many modern decoder models use pre-norm ordering, applying LayerNorm before each sublayer. This implementation begins with the paper's post-norm form so the code corresponds directly to the original equation. Pre-norm is a worthwhile later comparison, not an invisible substitution.

[Next: assemble the complete decoder](/articles/building-a-tiny-language-model-from-scratch/14-assembling-the-model)
