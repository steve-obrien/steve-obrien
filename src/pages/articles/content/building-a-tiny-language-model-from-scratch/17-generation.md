---
title: 17. Reloading a checkpoint and generating text
description: Continue a reader-supplied prompt one character at a time in a process independent of training.
date: 2026-07-16
status: published
listed: false
parent: building-a-tiny-language-model-from-scratch
order: 17
tags: [LLMs, Generation, PyTorch]
metaDescription: Reload a tiny Transformer checkpoint and generate text with temperature and top-k sampling.
metaKeywords: [autoregressive generation, temperature, top-k, load checkpoint]
---

Training is complete, so let's prove that the result really lives in the checkpoint. A saved model is useful only if another process can reconstruct it. The generation command loads the architecture, vocabulary, and learned tensors entirely from that file, switches to evaluation mode, and accepts a prompt.

```bash
.venv/bin/python lessons/12-generation/generate.py \
	--checkpoint output/transformer/checkpoint.pt \
	--prompt 'KING:' \
	--max-new-tokens 300 \
	--temperature 0.8 \
	--top-k 20 \
	--seed 2026
```

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

The prompt block contains only text supplied to the program. The model-output block contains only newly sampled characters.

## The decoding loop

For every new character:

1. keep at most the latest 128 token IDs;
2. run the model;
3. take logits at the final position;
4. divide by temperature;
5. suppress every candidate outside the highest 20 logits;
6. apply softmax and sample one ID;
7. append it to the complete result.

```diagram
prompt -> crop to latest 128 tokens -> model -> final-position logits
  ^                                                   |
  +---------- append sampled character <--------------+
```

Temperature changes distribution sharpness. A lower value favours already-likely characters; a higher value increases variation and error. Top-k prevents the sample from selecting very low-ranked characters without forcing greedy decoding.

Neither option improves the model's knowledge. They only alter sampling from its existing distribution.

The fresh CPU process successfully produced all 300 requested characters, and the checkpoint checksum matched the training artifact. That proves the visible output is generated from saved learned state rather than memory left inside the training process.

## Follow the code

The command-line path is [`lessons/12-generation/generate.py`](https://github.com/steve-obrien/tiny-transformer-course/blob/main/lessons/12-generation/generate.py). The underlying loop is [`TinyTransformerLanguageModel.generate()`](https://github.com/steve-obrien/tiny-transformer-course/blob/main/tiny_transformer/language_model.py), where every iteration corresponds to one arrow around the diagram.

Try the same checkpoint with temperatures `0.5`, `0.8`, and `1.2`, keeping the prompt and seed fixed. You are not retraining anything. You are observing how a decoding choice changes the balance between repetition and variation.

[Next: remove one component and measure the effect](/articles/building-a-tiny-language-model-from-scratch/18-ablation)
