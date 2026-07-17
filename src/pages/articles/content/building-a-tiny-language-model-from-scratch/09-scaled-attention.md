---
title: 9. Implementing scaled dot-product attention
description: Build the attention equation directly from queries, keys, values, matrix multiplication, scaling, and softmax.
date: 2026-07-16
status: published
listed: false
parent: building-a-tiny-language-model-from-scratch
order: 9
tags: [Transformers, Attention, PyTorch]
metaDescription: Implement and trace scaled dot-product attention from Attention Is All You Need.
metaKeywords: [scaled dot-product attention, query key value, softmax attention]
---

This is the point where the Transformer can start to look mysterious. The good news is that attention is a short sequence of understandable operations: each position scores the available positions, turns those scores into weights, and retrieves a weighted mixture of their information.

```text
Attention(Q, K, V) = softmax(QKᵀ / √dₖ)V
```

Writing it explicitly keeps every tensor shape visible.

```diagram
queries x keys transposed
  -> compatibility scores
  -> divide by sqrt(head width)
  -> softmax weights
  -> weighted sum of values
```

## Queries, keys, and values

Each input representation is projected three ways:

- a **query** describes what the current position is looking for;
- a **key** describes what each available position offers for matching;
- a **value** contains the information that can be retrieved.

For batch `B`, sequence length `T`, and head width `H`:

```text
Q: B × T × H
K: B × T × H
V: B × T × H
```

Multiplying queries by transposed keys produces one compatibility score for every query-key pair:

```text
QKᵀ: B × T × T
```

## Why divide by the square root

As the key dimension grows, unscaled dot products tend to grow in magnitude. Softmax then becomes extremely sharp, leaving very small gradients for most entries. Dividing by `√dₖ` keeps score magnitudes in a more useful range.

```python
scores = queries @ keys.transpose(-2, -1)
scores = scores / math.sqrt(queries.shape[-1])
weights = torch.softmax(scores, dim=-1)
output = weights @ values
```

Every weight row must sum to one. The output shape is `B × T × H`: each query position receives a weighted average of the value vectors.

## Trace the numbers

The lesson uses small explicit matrices so you can see scores, scaled scores, probabilities, and outputs rather than trusting a library layer.

```bash
.venv/bin/python lessons/06-scaled-attention/example.py
```

The executed example verifies finite values, expected shapes, and probability rows summing to one. It still allows every position to attend to every other position. The next step adds the information boundary required for language modelling.

## Under the hood

The complete equation is implemented in [`scaled_dot_product_attention()`](https://github.com/steve-obrien/tiny-transformer-course/blob/main/tiny_transformer/attention.py). Read it from `scores` to `weights @ values`; the code follows the equation in execution order rather than hiding it inside a framework layer.

In your fork, remove the division by the square root and print both weight matrices. With these tiny inputs nothing catastrophic should happen, but you can observe whether the unscaled softmax becomes sharper. That connects the mathematical motivation to a value you can inspect.

[Next: causal masking](/articles/building-a-tiny-language-model-from-scratch/10-causal-masking)
