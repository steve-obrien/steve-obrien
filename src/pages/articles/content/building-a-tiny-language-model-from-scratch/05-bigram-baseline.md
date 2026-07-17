---
title: 5. Training a bigram baseline
description: Prove the complete data, loss, optimisation, checkpoint, and generation pipeline before adding attention.
date: 2026-07-16
status: published
listed: false
parent: building-a-tiny-language-model-from-scratch
order: 5
tags: [LLMs, Baselines, PyTorch]
metaDescription: Train a character bigram language model as a baseline before implementing a Transformer.
metaKeywords: [bigram language model, cross entropy, baseline, checkpoint]
---

Before we build attention, let's prove that the surrounding system can already learn something. A bigram model is ideal for this because it predicts the next character using only the current character.

Its entire parameter set is a `65 × 65` table:

```python
self.token_transition_logits = nn.Embedding(vocabulary_size, vocabulary_size)
```

Looking up the current token ID returns 65 next-character logits. Cross-entropy compares those logits with the shifted target, and AdamW updates the table.

```diagram
current character ID -> one row of 65 logits -> next-character probabilities
```

## Why this baseline matters

The bigram exercises the real tokenizer, batch builder, loss, optimiser, validation split, checkpoint format, reload path, and sampling loop. If it cannot reduce loss, adding a Transformer only makes the fault harder to locate.

```bash
.venv/bin/python lessons/04-bigram-baseline/train.py
```

The retained model has 4,225 parameters. Over 1,000 updates, validation loss fell from `4.7263` to `2.4902`.

```prompt
ROMEO:
```

```model-output
Fida rdly le swen's weasin d th heas tin and my f poit en's hisod pee'tonore
Sththerirot t ma suchiswswher sootrley oou, the,
```

The output has plausible adjacent characters but no stable words or sentence structure. That is the expected ceiling: after the current character, the model has forgotten everything else.

Reload the checkpoint independently:

```bash
.venv/bin/python lessons/04-bigram-baseline/generate.py \
	--checkpoint output/bigram/checkpoint.pt \
	--prompt 'ROMEO:'
```

The Transformer must do more than reduce loss. It must beat this baseline by using a longer context. The final model reaches validation loss `2.1298`, showing that attention and deeper computation provide useful information beyond the current character.

## Follow the code

[`bigram.py`](https://github.com/steve-obrien/tiny-transformer-course/blob/main/tiny_transformer/bigram.py) contains the complete model, loss, generation loop, and checkpoint format. That compactness is the point: you can trace the whole learning system before the Transformer adds depth.

After reproducing the result, change the prompt or sampling temperature and reload the same checkpoint. The output will change, but the one-character memory limit will not. This is a useful way to separate decoding choices from model capability.

[Next: map the paper to a decoder-only model](/articles/building-a-tiny-language-model-from-scratch/06-reading-the-paper)
