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

We now have the two main transformations, but neither stands alone. Each sits inside a residual path with dropout and LayerNorm. These supporting parts are less famous than attention, yet they determine whether a deeper stack is practical to train.

The original paper uses **post-norm** ordering:

```text
x = LayerNorm(x + Dropout(MaskedMultiHeadAttention(x)))
x = LayerNorm(x + Dropout(FeedForward(x)))
```

```diagram
x -> sublayer -> dropout -> add x -> LayerNorm -> next sublayer
|                              ^
+---------- residual ----------+
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

## Under the hood

[`TransformerBlock.forward()`](https://github.com/steve-obrien/tiny-transformer-course/blob/main/tiny_transformer/transformer.py) spells out the two residual paths. Follow the names `inputs`, `attention_output`, `after_attention`, and `feed_forward_output`; they describe the route through the diagram.

A good fork experiment is to set dropout to zero and compare repeated calls in training mode. Then restore it and switch to evaluation mode. You will see why generation code must call `model.eval()` even though no parameters are being updated.

[Next: assemble the complete decoder](/articles/building-a-tiny-language-model-from-scratch/14-assembling-the-model)
