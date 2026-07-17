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

We have reached one of my favourite points in this sort of build: the complete forward path is now straightforward because every operation has already been examined and tested on its own.

```diagram
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

## Follow the complete forward pass

Open [`TinyTransformerLanguageModel`](https://github.com/steve-obrien/tiny-transformer-course/blob/main/tiny_transformer/language_model.py) and begin at `forward()`. It validates token IDs, calls `_hidden_states()`, projects every final representation to 65 logits, and optionally calculates cross-entropy against the targets.

Do not begin by reading every class. Put a breakpoint in `forward()`, pass one tiny batch through the model, and step down only when you want to understand the next transformation. That follows the same outside-in route we used across the lessons.

[Next: train from random weights](/articles/building-a-tiny-language-model-from-scratch/15-training)
