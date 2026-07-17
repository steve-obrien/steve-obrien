---
title: 3. Turning text into character tokens
description: Build a reversible tokenizer and understand the trade-off between visible characters and production subword vocabularies.
date: 2026-07-16
status: published
listed: false
parent: building-a-tiny-language-model-from-scratch
order: 3
tags: [LLMs, Tokenisation, PyTorch]
metaDescription: Implement deterministic character tokenisation for a tiny language model and compare it with subword tokenisation.
metaKeywords: [character tokenizer, token IDs, vocabulary, subword tokenization]
---

We have a text file, but a neural network cannot consume strings. The tokenizer is the bridge: it defines a reversible mapping between the characters we can read and the integer IDs the model can process.

For this corpus, sorting the 65 observed characters gives a stable vocabulary. Newline is token `0`, space is token `1`, punctuation and uppercase letters follow, and lowercase letters occupy the final part of the table.

```python
tokenizer = CharacterTokenizer.from_text(corpus)
token_ids = tokenizer.encode("ROMEO:")
restored = tokenizer.decode(token_ids)
assert restored == "ROMEO:"
```

```diagram
"ROMEO:" -> [token IDs] -> "ROMEO:"
              encode        decode
```

The vocabulary order is saved alongside checkpoints. If the same weights are loaded with a different mapping, every embedding lookup and output logit acquires the wrong meaning.

## Why characters are useful here

Character tokenisation keeps the transformation visible:

- every source character becomes exactly one token;
- encoding and decoding are easy to test;
- the vocabulary is only 65 entries;
- generated misspellings expose what the model has and has not learned.

The cost is sequence length. A word such as `language` requires eight predictions, and the model must learn spelling as well as syntax and meaning.

Production language models usually use byte-level or subword tokenisation. Common fragments can become one token, reducing sequence length but creating a vocabulary with thousands of entries. That makes the embedding and output layers much larger and makes the input transformation less intuitive.

## Unknown characters

This tokenizer deliberately rejects characters absent from its vocabulary. There is no hidden “unknown” token:

```python
tokenizer.encode("snowman: ☃")  # raises ValueError
```

That strictness is useful in a course because data assumptions fail loudly. A reusable model would normally choose byte tokenisation, an explicit unknown token, or a documented normalisation policy.

Run the preparation lesson to build and round-trip the saved tokenizer:

```bash
.venv/bin/python lessons/02-corpus-and-tokenisation/prepare.py
```

## Follow the code

[`CharacterTokenizer`](https://github.com/steve-obrien/tiny-transformer-course/blob/main/tiny_transformer/tokenizer.py) builds both directions of the mapping and rejects unsupported characters. The preparation lesson saves the ordered vocabulary so a checkpoint can reconstruct exactly what every ID means.

Try encoding your own prompt after preparation. Then include a character that does not occur in Shakespeare. The resulting error is useful: it exposes the boundary that a production byte or subword tokenizer is designed to remove.

[Next: construct training inputs and targets](/articles/building-a-tiny-language-model-from-scratch/04-training-examples)
