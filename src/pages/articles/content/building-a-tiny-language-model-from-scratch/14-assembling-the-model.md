---
title: 14. Assembling the complete decoder
description: Stack the tested components, tie the vocabulary weights, and produce next-character logits from token IDs.
date: 2026-07-16
status: published
listed: false
parent: building-a-tiny-language-model-from-scratch
order: 14
tags: [Transformers, Architecture, PyTorch]
metaDescription: Assemble embeddings, Transformer blocks, and a vocabulary projection into a decoder-only language model.
metaKeywords: [decoder-only Transformer, language model architecture, weight tying]
---

The complete forward path now becomes straightforward because every operation has already been tested:

```text
token IDs
  → token embeddings + sinusoidal positions
  → embedding dropout
  → four causal Transformer blocks
  → tied vocabulary projection
  → next-character logits
```

## Configuration

```python
TinyTransformerConfig(
	vocabulary_size=65,
	max_context_length=128,
	model_dimension=128,
	number_of_heads=4,
	number_of_blocks=4,
	feed_forward_dimension=512,
	dropout=0.1,
)
```

This architecture contains exactly 799,360 unique trainable parameters.

## Weight tying

The input embedding maps 65 token IDs to 128-feature vectors. The output projection maps 128-feature vectors back to 65 logits. Following section 3.4 of the paper, both operations share one weight matrix:

```python
self.vocabulary_projection.weight = self.embedding.token_embedding.weight
```

Parameter counting must recognise that shared object once. The checkpoint loader reconstructs the tie rather than loading two unrelated copies.

## Forward contract

For inputs shaped `batch × time`, the model returns logits shaped `batch × time × vocabulary`. Supplying aligned targets also returns scalar cross-entropy loss.

The complete-model tests verify more than shape:

- output logits cover all 65 characters;
- cross-entropy is finite;
- input and output weights are genuinely the same parameter;
- changing future token IDs leaves earlier logits exactly unchanged;
- generation crops model input to 128 positions while retaining the full returned text;
- a saved checkpoint reconstructs identical CPU logits;
- the default architecture remains below one million parameters.

This is the point at which a collection of understandable operations becomes a language model. It still contains no learned language knowledge until the optimiser updates its random parameters.

[Next: train from random weights](/articles/building-a-tiny-language-model-from-scratch/15-training)
