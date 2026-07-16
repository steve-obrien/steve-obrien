---
title: 18. Testing the architecture with an ablation
description: Remove positional encoding while holding the remaining configuration fixed, then compare complete loss curves.
date: 2026-07-16
status: published
listed: false
parent: building-a-tiny-language-model-from-scratch
order: 18
tags: [Transformers, Experiments, Positional Encoding]
metaDescription: Run a controlled positional-encoding ablation on a tiny Transformer and compare validation loss.
metaKeywords: [Transformer ablation, positional encoding experiment, controlled comparison]
---

Architecture explanations are hypotheses until changing a component produces measurable evidence. An ablation removes one part while holding the rest of the run fixed.

The course's first ablation disables sinusoidal position vectors. It keeps the same:

- corpus and 90/10 split;
- character vocabulary;
- random seed;
- 799,360 trainable parameters;
- four-block architecture;
- optimiser and learning-rate schedule;
- batch size and context length;
- 1,500 updates;
- validation batches;
- Apple M1 MPS environment;
- generation configuration.

The comparison script reads both saved configurations and refuses to compare them if another recorded value differs.

```bash
.venv/bin/python lessons/11-language-model-training/train.py \
	--device mps \
	--without-position-encoding \
	--output-directory output/transformer-no-position

.venv/bin/python lessons/13-ablations/compare.py
```

## Result

| Model | Final validation loss |
| --- | ---: |
| Sinusoidal positions | `2.12984738` |
| No explicit positions | `2.29148309` |

Removing positional encoding produced 7.59% higher final loss in this paired run.

The ablated model was actually ahead at update 100 before the reference moved ahead later. Retaining the full curves prevents the article from selecting only the checkpoint that supports a preferred story.

The no-position model did not collapse. Causal masking creates nested prefixes: later representations can aggregate contextual states built from more preceding characters. That offers some structural information even without explicit absolute coordinates.

Treat the 7.59% result as evidence about one controlled seed, not a universal estimate of positional encoding's value. Repeating both conditions across several seeds would support a stronger conclusion.

[Next: change the corpus and consider scale](/articles/building-a-tiny-language-model-from-scratch/19-other-corpora-and-scaling)
