---
title: 15. Training from random weights
description: Optimise the complete model on a laptop, evaluate held-out loss, and save enough state to reproduce generation.
date: 2026-07-16
status: published
listed: false
parent: building-a-tiny-language-model-from-scratch
order: 15
tags: [LLMs, Training, Apple Silicon]
metaDescription: Train a 799,360-parameter Transformer from random weights on an Apple M1 using PyTorch MPS.
metaKeywords: [train Transformer on Mac, Apple M1 PyTorch, MPS, language model training]
---

Now we can run the experiment. Training starts with small seeded random values in every learned matrix. The untrained model has the right architecture, but it has no knowledge copied from another model and no statistical understanding of Shakespeare.

Each update performs the same sequence:

1. sample 32 windows of 128 training characters;
2. run the model to obtain logits at every position;
3. calculate cross-entropy against the shifted targets;
4. backpropagate gradients through all four blocks;
5. clip the total gradient norm;
6. update parameters with AdamW;
7. periodically estimate loss on fixed training and validation batches.

```diagram
sample batch -> forward pass -> loss -> backpropagation -> parameter update
      ^                                                        |
      +---------------------- repeat ---------------------------+
```

## The laptop configuration

```bash
.venv/bin/python lessons/11-language-model-training/train.py
```

The retained run used:

| Setting | Value |
| --- | ---: |
| Parameters | 799,360 |
| Updates | 1,500 |
| Batch size | 32 |
| Context length | 128 |
| Sampled training tokens | 6,144,000 |
| Peak learning rate | `0.0003` |
| Warm-up | 100 updates |
| Schedule | Cosine decay to 10% |
| Gradient clip norm | `1.0` |
| Device | Apple M1 via PyTorch MPS |

The measured loop took **84.46 seconds** on the M1 and included scheduled loss evaluations. Sample generation, checkpoint writing, and process startup were outside that timer.

I find that result genuinely exciting. There is no discrete NVIDIA GPU, hosted training service, or pretrained checkpoint involved: just an Apple laptop, roughly 1.1 MB of Shakespeare text, and code small enough to take apart. The output is not useful prose, but recognisable structure emerges from a surprisingly modest experiment.

## Loss and validation

Validation loss fell from `4.6709` before the first update to `2.1298` after update 1,500, a 54.4% reduction. The final model also beat the bigram baseline's `2.4902` validation loss.

The train and validation values remained close at the end (`2.1005` and `2.1298`). That does not prove broad generalisation; both splits come from the same Shakespeare collection. It does show that the improvement was not confined to the sampled training batches.

## What the checkpoint contains

The 3,299,509-byte checkpoint stores:

- model type and format version;
- complete architecture configuration;
- learned parameter tensors;
- ordered character vocabulary;
- training configuration.

It deliberately does not commit the downloaded corpus or checkpoint to git. The repository retains the source checksum, checkpoint checksum, metrics, configuration, environment, and samples needed to audit the published result.

## Follow the training code

The [training command](https://github.com/steve-obrien/tiny-transformer-course/blob/main/lessons/11-language-model-training/train.py) assembles the configuration, while [`training.py`](https://github.com/steve-obrien/tiny-transformer-course/blob/main/tiny_transformer/training.py) owns the reusable update and evaluation mechanics. Start with the documented 10-step CPU smoke run before committing to the full configuration.

Once that works, change one thing. Halve the model width, reduce the number of blocks, or train for fewer steps. Record the configuration and output beside the original. The purpose of a fork is not necessarily to obtain better prose; it is to build an intuition for which changes affect speed, loss, and visible structure.

[Next: inspect learning in the outputs](/articles/building-a-tiny-language-model-from-scratch/16-watching-learning)
