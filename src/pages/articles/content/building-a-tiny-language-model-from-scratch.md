---
title: Building a tiny language model from scratch
description: Build a decoder-only Transformer one understandable component at a time, train it on a laptop, and generate text from your own checkpoint.
date: 2026-07-16
status: published
tags: [LLMs, AI, PyTorch, Transformers]
metaDescription: A hands-on technical series for implementing a tiny decoder-only Transformer in PyTorch, training it from random weights, and generating text.
metaKeywords: [tiny language model, LLM from scratch, Transformer, self-attention, PyTorch, language model training, text generation]
---

You do not need a GPU cluster or a billion parameters to understand how a language model works. You can build the important parts yourself, train the result on a modest laptop, and watch it progress from random characters to recognisable—if still nonsensical—language.

This series is for developers who want to get below the API layer. You will implement a decoder-only Transformer from ordinary PyTorch tensor operations without using a pretrained model, `nn.Transformer`, `nn.MultiheadAttention`, Hugging Face Trainer, or a hidden attention implementation.

PyTorch still provides tensors, automatic differentiation, optimisation, and device access. “From scratch” means building the language model rather than rebuilding the numerical computing stack beneath it.

## What you will build

The finished character-level model is intentionally small enough to inspect:

| Setting | Course model |
| --- | --- |
| Context length | 128 characters |
| Model dimension | 128 |
| Attention heads | 4 |
| Transformer blocks | 4 |
| Feed-forward dimension | 512 |
| Trainable parameters | 799,360 |
| Training corpus | Tiny Shakespeare |

Every part is introduced separately: tokenisation, shifted training targets, embeddings, positional information, scaled dot-product attention, causal masking, multiple heads, feed-forward layers, residual paths, LayerNorm, training, checkpoints, and autoregressive generation.

## What the trained model actually produces

The retained run began from seeded random weights and processed 6,144,000 sampled characters in 1,500 optimiser updates. Held-out loss fell from `4.6709` to `2.1298`. The measured loop took 84.46 seconds on an Apple M1 through PyTorch's Metal backend—no discrete GPU or hosted training service.

I think that is genuinely exciting. From roughly 1.1 MB of Shakespeare and a model small enough to understand, recognisable dramatic structure emerges on an ordinary laptop. The result is not a useful writer, but it makes the underlying idea feel tangible rather than remote.

Here is a generation performed after loading the saved checkpoint in a new CPU process. The distinction between input and output is deliberate: the prompt is supplied by the reader; everything after it is sampled by the model.

```prompt
KING:
```

```model-output
Fid trely levew his weas bud thin as the as
And for it en cong on preite hee
Sthes ill the mavence I swher soot
And his, the ago I fore mor neve and.

LUCERIO:
Gord you ur labll ooneack my his con fopy, sour,
Dar and fand athe chind sthin ath some f
Their nlime e my foreer or sithe bean.

LUSENGOLA
```

This is not coherent English and it is not a chatbot. It is nevertheless real learned behaviour: the untrained model emitted mostly repetitive arbitrary characters, while the trained model learned spaces, punctuation, speaker labels, line breaks, word-like fragments, and longer-range formatting.

## Follow the complete build

Each part of the implementation has its own focused article. Read them in order if you want to build the model alongside the code, or jump directly to the component you want to understand.

1. [What a language model predicts](/articles/building-a-tiny-language-model-from-scratch/01-next-token-prediction)
2. [Preparing a small, reproducible corpus](/articles/building-a-tiny-language-model-from-scratch/02-training-corpus)
3. [Turning text into character tokens](/articles/building-a-tiny-language-model-from-scratch/03-tokenisation)
4. [Constructing inputs, targets, and batches](/articles/building-a-tiny-language-model-from-scratch/04-training-examples)
5. [Training a bigram baseline](/articles/building-a-tiny-language-model-from-scratch/05-bigram-baseline)
6. [Reading Attention Is All You Need as an implementer](/articles/building-a-tiny-language-model-from-scratch/06-reading-the-paper)
7. [Token embeddings and positional encodings](/articles/building-a-tiny-language-model-from-scratch/07-embeddings-and-position)
8. [Does king − man + woman equal queen?](/articles/building-a-tiny-language-model-from-scratch/08-vector-arithmetic)
9. [Implementing scaled dot-product attention](/articles/building-a-tiny-language-model-from-scratch/09-scaled-attention)
10. [Causal masking: preventing future leakage](/articles/building-a-tiny-language-model-from-scratch/10-causal-masking)
11. [Combining several attention heads](/articles/building-a-tiny-language-model-from-scratch/11-multi-head-attention)
12. [The position-wise feed-forward network](/articles/building-a-tiny-language-model-from-scratch/12-feed-forward-network)
13. [Residual connections, LayerNorm, and dropout](/articles/building-a-tiny-language-model-from-scratch/13-residuals-normalisation-dropout)
14. [Assembling the complete decoder](/articles/building-a-tiny-language-model-from-scratch/14-assembling-the-model)
15. [Training from random weights](/articles/building-a-tiny-language-model-from-scratch/15-training)
16. [Reading the loss curve and generated samples](/articles/building-a-tiny-language-model-from-scratch/16-watching-learning)
17. [Reloading a checkpoint and generating text](/articles/building-a-tiny-language-model-from-scratch/17-generation)
18. [Testing the architecture with an ablation](/articles/building-a-tiny-language-model-from-scratch/18-ablation)
19. [Trying other corpora and scaling the model](/articles/building-a-tiny-language-model-from-scratch/19-other-corpora-and-scaling)

## The shortest runnable path

After cloning the companion repository, install the locked environment and prepare the pinned corpus:

```bash
uv sync
.venv/bin/python lessons/02-corpus-and-tokenisation/prepare.py
```

Run the tests and train the complete model:

```bash
.venv/bin/pytest -p no:cacheprovider
.venv/bin/python lessons/11-language-model-training/train.py
```

Then load the checkpoint in a separate process and supply your own prompt:

```bash
.venv/bin/python lessons/12-generation/generate.py \
	--checkpoint output/transformer/checkpoint.pt \
	--prompt 'KING:'
```

The repository retains the exact corpus checksum, model configuration, seeds, loss measurements, environment, checkpoint hash, and unedited outputs from the published run. The model is deliberately not useful; the value is that every important operation remains visible enough to question, test, and change.
