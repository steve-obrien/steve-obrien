---
title: 6. Reading Attention Is All You Need as an implementer
description: Translate the original encoder-decoder paper into the smaller decoder-only model you are about to write.
date: 2026-07-16
status: published
listed: false
parent: building-a-tiny-language-model-from-scratch
order: 6
tags: [Transformers, Attention, Papers]
metaDescription: Map Attention Is All You Need onto a small decoder-only language model implementation.
metaKeywords: [Attention Is All You Need, Transformer decoder, self-attention, causal language model]
---

Research papers can feel as if they expect you to understand the system before they explain it. Let's read [*Attention Is All You Need*](https://arxiv.org/abs/1706.03762) as implementers instead. The paper describes an encoder-decoder model for translation: the source sentence passes through an encoder, while the decoder generates a target sentence using both its earlier target tokens and the encoder output.

A base autoregressive language model needs a narrower path. It predicts the next token from earlier tokens in the same sequence, so this course removes the encoder and the encoder-decoder attention sublayer.

```diagram
original paper: source -> encoder -> cross-attention -> decoder -> translation
our model:      earlier characters -> causal decoder -> next character
```

## Paper-to-code map

| Paper component | Course model |
| --- | --- |
| Input embeddings | Learned character embeddings |
| Sinusoidal positions | Retained directly |
| Scaled dot-product attention | Implemented explicitly |
| Multi-head attention | Four independent heads plus output projection |
| Encoder self-attention | Omitted |
| Decoder masked self-attention | Retained as causal self-attention |
| Encoder-decoder attention | Omitted |
| Position-wise feed-forward network | Two linear layers with ReLU |
| Residual connection and LayerNorm | Original post-norm ordering |
| Output softmax projection | Character-vocabulary logits |
| Shared embedding/output weights | Retained |

The dimensions are reduced from the paper's production experiment: model width 128 instead of 512, four heads instead of eight, feed-forward width 512 instead of 2,048, and four blocks instead of six decoder layers.

## What “decoder-only” means

It does not mean taking the paper's decoder unchanged. The original decoder has two attention sublayers: masked self-attention and cross-attention over encoder output. A decoder-only language model retains the first and removes the second.

The result is a stack that transforms one token sequence while enforcing a simple information boundary: position `t` may use positions `0…t`, never `t+1` or later.

Read the paper with tensor shapes beside every equation. The next articles implement each retained operation in isolation before composing them. That is far easier to debug than writing a `Transformer` class first and hoping the internals match the diagram.

## Follow the code

Keep [`transformer.py`](https://github.com/steve-obrien/tiny-transformer-course/blob/main/tiny_transformer/transformer.py) and [`language_model.py`](https://github.com/steve-obrien/tiny-transformer-course/blob/main/tiny_transformer/language_model.py) open beside the paper. The first defines one decoder block; the second stacks those blocks between embeddings and the vocabulary projection.

As you read, mark each paper component as retained, reduced, replaced, or omitted. That habit is far more useful than saying a model is “based on the Transformer” without knowing which Transformer it means.

[Next: embeddings and positional information](/articles/building-a-tiny-language-model-from-scratch/07-embeddings-and-position)
