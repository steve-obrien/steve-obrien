---
title: 1. What a language model predicts
description: Start with next-token probability and autoregressive sampling before introducing neural networks or attention.
date: 2026-07-16
status: published
listed: false
parent: building-a-tiny-language-model-from-scratch
order: 1
tags: [LLMs, Probability, PyTorch]
metaDescription: Understand next-token prediction, logits, probabilities, and autoregressive generation before building a Transformer.
metaKeywords: [next-token prediction, logits, softmax, autoregressive language model]
---

A language model repeatedly answers one question:

> Given the tokens so far, how likely is each possible next token?

It does not write a paragraph in one operation. It produces one score for every token in its vocabulary, converts those scores into probabilities, chooses one token, appends it to the context, and starts again.

## From logits to a token

The raw scores are called **logits**. If the vocabulary contains four characters, a model might return:

```python
logits = torch.tensor([1.2, -0.4, 2.1, 0.7])
probabilities = torch.softmax(logits, dim=-1)
```

Softmax makes every value non-negative and makes the row sum to one. The highest-probability character is a reasonable choice, but always taking it can become repetitive. Sampling preserves alternatives in proportion to their probabilities.

The first course example avoids a neural network entirely. It uses a known transition table so you can inspect the exact probabilities and verify seeded sampling before learned parameters complicate the picture.

```bash
.venv/bin/python lessons/01-next-token-prediction/example.py
```

## Autoregression

Suppose the current text is:

```text
The cat
```

The model samples one continuation character—perhaps a space—then evaluates `The cat ` to choose another. A 300-character result requires 300 forward predictions.

That loop is **autoregressive generation**. It explains three properties that remain true for the finished model:

- generation is sequential even though training processes many positions in parallel;
- every sampled choice becomes input to later choices;
- an early unlikely choice can send the continuation in a different direction.

## Parameters, training, and inference

**Parameters** are the adjustable numbers inside the model. At random initialisation they encode no corpus knowledge. During **training**, cross-entropy measures how poorly the logits predicted known next tokens, and gradient descent changes the parameters to reduce that error. During **inference**, the parameters stop changing and the model uses what it learned to continue new prompts.

Keep that separation clear. Training supplies the right answer and updates weights. Generation supplies only a prompt and samples from the model's predictions.

[Next: prepare the training corpus](/articles/building-a-tiny-language-model-from-scratch/02-training-corpus)
