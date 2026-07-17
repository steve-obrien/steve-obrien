---
title: 7. Token embeddings and positional encodings
description: Represent character identity with learned vectors and sequence order with deterministic sine and cosine signals.
date: 2026-07-16
status: published
listed: false
parent: building-a-tiny-language-model-from-scratch
order: 7
tags: [Transformers, Embeddings, PyTorch]
metaDescription: Implement learned token embeddings and sinusoidal positional encoding for a small Transformer.
metaKeywords: [token embeddings, positional encoding, sinusoidal encoding, Transformer]
---

We now have token IDs, but an ID is only an index. Token `42` is not twice token `21`. The model needs a representation it can transform, so an embedding table replaces each ID with a learned vector of 128 features.

```python
self.token_embedding = nn.Embedding(vocabulary_size, model_dimension)
token_vectors = self.token_embedding(token_ids) * math.sqrt(model_dimension)
```

Repeated occurrences of the same character select the same token vector. Attention also needs order, because the set of characters in `stop` is identical to the set in `pots`.

## Sinusoidal position vectors

The original paper adds a deterministic vector to every token embedding. Even dimensions use sine; odd dimensions use cosine at geometrically changing frequencies:

```text
PE(pos, 2i)     = sin(pos / 10000^(2i / d_model))
PE(pos, 2i + 1) = cos(pos / 10000^(2i / d_model))
```

The position table contains no trainable parameters. It is generated once up to the maximum context length and stored with the model.

```python
representations = token_embeddings + position_encoding[:sequence_length]
```

```diagram
token ID -> learned token vector ----+
                                      +-> combined representation
position -> fixed sine/cosine vector +
```

Run the focused example to inspect the actual vectors:

```bash
.venv/bin/python lessons/05-embeddings-and-position/example.py
```

The two occurrences of `F` in the example select the same learned token vector, but adding different position vectors makes their combined representations different.

## Why add rather than concatenate?

Addition preserves the model width, so every later projection remains 128 features wide. The network can learn to combine or separate token and positional signals across dimensions. Concatenation would increase every downstream matrix and change the paper's residual shape contract.

The position signal will later become a controlled experiment. Removing it leaves the parameter count unchanged but raises final validation loss by 7.59% in the retained paired run.

## Follow the code

[`embeddings.py`](https://github.com/steve-obrien/tiny-transformer-course/blob/main/tiny_transformer/embeddings.py) contains the learned lookup table, the sinusoidal table, their scaling, and their addition. The [focused example](https://github.com/steve-obrien/tiny-transformer-course/blob/main/lessons/05-embeddings-and-position/example.py) shows the same character at two positions.

Run it, then disable position encoding and compare those two combined vectors again. You have not yet measured whether training becomes worse, but you can already see exactly what information was removed.

[Next: does king − man + woman equal queen?](/articles/building-a-tiny-language-model-from-scratch/08-vector-arithmetic)
