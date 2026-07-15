---
title: Building a tiny language model from scratch
description: Download a text corpus, build a decoder-only Transformer piece by piece, train it on a laptop, and generate text from your own model.
date: 2026-07-15
tags: [LLMs, AI, PyTorch, Transformers]
metaDescription: A practical, first-principles guide to implementing a tiny decoder-only Transformer in PyTorch, training it on a modest laptop, and generating text.
metaKeywords: [tiny language model, LLM from scratch, Transformer, self-attention, PyTorch, language model training, text generation]
---

> **Implementation status:** The 13-part companion course now contains the working model, 47 automated tests, executed component examples, a retained training run, fresh-process checkpoint generation, a controlled ablation, and a passing clean-checkout acceptance run. Every result, timing, loss value, and generated sample below came from those runs rather than an expected outcome.

This is not an attempt to build a useful assistant or compete with a production language model. The goal is to make the machinery understandable by reducing it to a size that can be trained on a modest laptop.

By the end, we will be able to download a small text corpus, turn it into training examples, implement a decoder-only Transformer from understandable PyTorch operations, train it from random weights, and give it some starting text to continue. Its output may be repetitive, malformed, or suspiciously similar to its small training corpus. That is acceptable: the important result is seeing learned behaviour emerge from a model we built ourselves.

## What “from scratch” means

We will use PyTorch for tensors, automatic differentiation, optimisation, and access to CPU, Apple Metal, or CUDA devices. We will not use a pretrained model, `nn.Transformer`, `nn.MultiheadAttention`, Hugging Face Trainer, or a hidden attention implementation.

We are building the language model from scratch, not a tensor library, automatic differentiation engine, or GPU kernel library. Drawing that boundary keeps the project small enough to understand and run.

## The model we are aiming for

The first complete model will deliberately be tiny:

| Setting | Initial value |
| --- | --- |
| Tokenisation | Character-level |
| Context length | 128 tokens |
| Model dimension | 128 |
| Attention heads | 4 |
| Transformer blocks | 4 |
| Feed-forward dimension | 512 |
| Trainable parameters | 799,360 (verified) |

The model dimensions are configurable. The reported parameter count is for the retained course configuration and counts the tied input/output embedding matrix once.

## Contents

### 1. What is a language model?

**Concepts:** probability distributions, sequences, tokens, autoregressive generation, next-token prediction, parameters, training, and inference.

We will define the task before introducing neural-network architecture: given some preceding tokens, estimate a probability distribution for the next token. We will also distinguish a base language model that continues text from an instruction-following assistant that has received additional training.

**Implementation checkpoint:** Inspect the corpus, vocabulary, example token sequences, and an untrained model’s initial predictions.

### 2. Acquiring a small training corpus

**Concepts:** corpora, documents, licences, reproducibility, train/validation splits, data leakage, cleaning, and dataset scale.

The default experiment will download a pinned copy of Tiny Shakespeare because it is small, easy to inspect, and fast to process. A later experiment can stream a bounded TinyStories subset. Wikipedia will be discussed as an optional acquisition path using its API or official dumps rather than making an uncontrolled website crawl part of the core tutorial.

**Implementation checkpoint:** A preparation command downloads the corpus, records its source and checksum, normalises it conservatively, and creates deterministic training and validation data.

### 3. Turning text into tokens

**Concepts:** vocabularies, character tokens, byte tokens, subword tokenisation, encoding, decoding, unknown tokens, and sequence length.

We will begin with a character-level tokenizer so every transformation remains visible and reversible. We will then explain why real language models normally use byte or subword tokenisation, and what that changes about vocabulary size, sequence length, loss, and model output.

**Implementation checkpoint:** Encoding followed by decoding must reproduce the source text exactly, and the saved tokenizer must load with the same vocabulary ordering.

### 4. Constructing training examples

**Concepts:** context windows, batches, input/target shifting, teacher forcing, random sampling, padding, packing, and validation data.

For a sequence such as `hello`, the model sees tokens from the left and predicts the following token at every position. This section will make the shifted inputs and targets concrete before any attention code is introduced.

**Implementation checkpoint:** Tests prove that every target is the next token after its corresponding input and that batches have the expected shapes.

### 5. Establishing a bigram baseline

**Concepts:** baselines, lookup tables, logits, softmax, cross-entropy, negative log-likelihood, random guessing, and optimisation.

A tiny bigram model will demonstrate the complete training loop without attention. It gives us a known-good pipeline and a baseline that the Transformer should eventually beat.

**Implementation checkpoint:** The bigram model can overfit one batch, lower its validation loss during a short run, save a checkpoint, and generate text.

**Verified course result:** The implemented bigram contains 4,225 parameters - one learned 65 × 65 transition table. In the retained 1,000-step run, estimated validation loss fell from `4.7263` to `2.4902`. A separate process reloaded the checkpoint and continued `ROMEO:` with locally plausible but globally incoherent text:

```text
ROMEO:
Fida rdly le swen's weasin d th heas tin and my f poit en's hisod pee'tonore
Sththerirot t ma suchiswswher sootrley oou, the,
```

This is the expected ceiling of a model that sees only the current character. It has learned useful local transition probabilities, not words, speakers, or sentences.

### 6. Reading *Attention Is All You Need* as an implementer

**Concepts:** sequence transduction, encoder-decoder models, self-attention, cross-attention, masked attention, parallel training, and autoregressive decoding.

The original Transformer was an encoder-decoder system built for machine translation. Our language model only needs the autoregressive side. We will map each component in the paper to the decoder-only model we are building, explicitly recording what is retained, adapted, or omitted.

**Implementation checkpoint:** A paper-to-code map identifies the eventual module and tensor shape for every retained component.

### 7. Token embeddings and positional encodings

**Concepts:** one-hot vectors, learned embeddings, representation dimensions, token identity, word order, sinusoidal positional encoding, and learned positions.

Attention alone does not know whether a token came first or last. We will implement the paper’s sinusoidal positional encoding and add it to learned token embeddings, then inspect actual vectors and shapes.

**Implementation checkpoint:** Positional encodings are deterministic, contain no trainable parameters, and change with both position and dimension.

### 8. Scaled dot-product attention

**Concepts:** queries, keys, values, dot products, similarity scores, the `sqrt(d_k)` scale factor, softmax, weighted sums, and tensor dimensions.

We will implement a single attention head directly from linear projections and matrix multiplication. A small worked example will trace one sequence through Q, K, V, attention scores, probabilities, and the resulting value mixture.

**Implementation checkpoint:** Attention probabilities have the expected shape, contain finite values, and sum to one across the attended positions.

### 9. Causal masking: preventing the model from cheating

**Concepts:** autoregression, information leakage, triangular masks, masked logits, and parallel training.

During training, the full sequence is available in memory, but a prediction must not inspect future tokens. The causal mask is what allows all positions to be trained in parallel without leaking their answers.

**Implementation checkpoint:** Changing a future token cannot alter logits at an earlier position, and masked attention weights are zero.

**Verified course result:** In the component proof, two future input vectors were changed by `+100`. Earlier outputs changed by exactly `0.00000000` with the causal mask, while the first output changed by `44.83640671` without it. The size of the unmasked change belongs only to that seeded example; the important invariant is that the masked earlier output did not change at all.

### 10. Multi-head attention

**Concepts:** representation subspaces, head dimensions, splitting and concatenating tensors, parallel attention heads, and output projection.

Rather than make one attention calculation responsible for every relationship, multi-head attention performs several smaller attention operations in parallel and combines them.

**Implementation checkpoint:** Head dimensions divide the model dimension exactly, output shapes match the input shapes, and gradients reach every projection.

### 11. The position-wise feed-forward network

**Concepts:** linear transformations, hidden dimensions, ReLU, per-token computation, capacity, and non-linearity.

Attention moves information between positions. The feed-forward network then transforms each position independently using the same learned function.

**Implementation checkpoint:** The feed-forward network expands and contracts the final dimension without mixing sequence positions.

### 12. Residual connections, LayerNorm, and dropout

**Concepts:** residual learning, gradient flow, normalisation, regularisation, training mode, evaluation mode, post-norm, and pre-norm.

We will first implement the paper’s residual-then-LayerNorm arrangement and explain the role of dropout. A later comparison can introduce the pre-norm arrangement commonly used by modern decoder-only models.

**Implementation checkpoint:** A complete Transformer block preserves its input shape and behaves deterministically in evaluation mode.

### 13. Assembling the decoder-only Transformer

**Concepts:** repeated blocks, model depth, language-model heads, weight tying, logits, parameter counts, initialisation, and receptive fields.

The complete model will combine token embeddings, positional encodings, masked multi-head attention, feed-forward networks, residual paths, normalisation, and an output projection over the vocabulary.

**Implementation checkpoint:** A forward pass produces logits shaped as batch × time × vocabulary, reports the exact parameter count, computes loss when targets are supplied, and supports backpropagation.

**Verified course result:** The assembled model contains 799,360 unique trainable parameters. It uses four 128-wide blocks, four attention heads per block, 512-wide feed-forward layers, fixed sinusoidal positions, and a shared input/output embedding matrix. Tests cover full-model tensor shapes, loss, weight tying, context cropping, checkpoint round-tripping, and the invariant that changing future token IDs cannot change earlier logits.

### 14. Training the model

**Concepts:** Adam and AdamW, learning rates, warm-up, gradient clipping, training loss, validation loss, overfitting, checkpoints, throughput, and reproducibility.

We will begin with the simplest optimiser and schedule that trains the tiny model reliably. The learning-rate schedule from the original paper will be explained and, if useful at this scale, tested as a separate configuration rather than silently copied.

**Implementation checkpoint:** A smoke preset completes quickly on CPU, while the laptop preset saves a reloadable checkpoint and logs loss, tokens seen, elapsed time, device, configuration, and random seed.

**Verified course result:** The retained run started from seeded random weights and processed 6,144,000 sampled training tokens in 1,500 optimiser updates. Estimated held-out loss fell from `4.6709` before training to `2.1298`, a 54.4% reduction and lower than the bigram baseline's `2.4902`.

The measured loop took 84.46 seconds on the test Mac's Apple MPS device, including scheduled loss evaluations but excluding sample generation and checkpoint writing. That is a record of one environment, not a promise that every laptop will match the timing. CPU, MPS, and CUDA are supported, and batch size can be reduced for a smaller machine.

### 15. Watching learning happen

**Concepts:** learning curves, qualitative evaluation, memorisation, generalisation, underfitting, overfitting, and sampling variance.

We will preserve generated samples from random initialisation and several training checkpoints. The article will show the real progression rather than presenting only the best output.

**Implementation checkpoint:** The final training run must reduce held-out loss below its initial value and produce a saved set of samples from fixed prompts and seeds.

**Verified course result:** Before training, the seeded sample was dominated by arbitrary repeated characters. After training, the same generation settings produced speaker-like formatting, line breaks, punctuation, spaces, and word-shaped sequences:

```text
ROMEO:
Fid trely levewep's wear bud thing flor pand the sprit encenk son
The to he methes illy dofeakence I swher soot
And his, the ago I fore mor neve and.

LUCERIO:
Gown you ur labll oon had menche cont opy lonee,
War ainch you withe win sthin ath se the
and thild hee me foreer or sin butede.

LUSENGOLA
```

This is visible learning, but it is not coherent English or evidence of understanding. The sample is preserved unedited because making it read better would defeat the purpose of the experiment.

### 16. Generating text interactively

**Concepts:** autoregressive decoding, context truncation, temperature, greedy decoding, multinomial sampling, top-k sampling, end conditions, and random seeds.

The model is a text completer, not a chatbot. The interactive command will accept a prompt, repeatedly predict one new token, append it to the context, and print the resulting continuation.

**Implementation checkpoint:** A checkpoint can be loaded in a fresh process and generate a requested number of valid tokens from user-supplied text.

**Verified course result:** A fresh CPU process reconstructed the tokenizer and architecture from the 3,299,509-byte checkpoint, loaded its weights, and generated 300 new characters from `KING:` using temperature `0.8`, top-k `20`, and seed `2026`. Its opening was:

```text
KING:
Fid trely levew his weas bud thin as the as
And for it en cong on preite hee
Sthes ill the mavence I swher soot
And his, the ago I fore mor neve and.
```

The command succeeded independently of the training process. The checkpoint SHA-256 and complete output are retained with the course evidence.

### 17. Taking the model apart again

**Concepts:** ablation experiments, controlled comparisons, confounding variables, parameter budgets, and experimental evidence.

Once the complete model works, we will remove or vary individual pieces: positional encoding, the attention scale factor, the causal mask, the number of heads, and the number of blocks. These experiments will connect claims about the architecture to observed behaviour.

**Implementation checkpoint:** Each ablation reuses the same data split, evaluation procedure, seed policy, and output format so its result can be compared honestly.

**Verified course result:** The first controlled ablation removed only the fixed sinusoidal position vectors. Both runs retained 799,360 trainable parameters and shared the corpus, split, seed, optimiser, schedule, architecture, batch size, context, update count, and MPS environment. Final validation loss increased from `2.1298` to `2.2915`, or 7.59%, without explicit positions.

The ablated model was briefly ahead at update 100 and still learned word-like structure. Causal masking and repeated contextual prefixes provide some implicit structural information, so “no positional encoding” does not mean the stack becomes entirely blind to sequence structure. This is one paired seed, not a universal estimate; a stronger experiment would repeat both conditions over several seeds.

### 18. From this tiny model to a real LLM

**Concepts:** subword tokenisation, larger corpora, data quality, scaling laws, mixed precision, distributed training, modern Transformer variants, instruction tuning, alignment, evaluation, and serving.

This final section will explain which ideas remain the same at larger scales and which engineering systems appear only because the data, model, and hardware no longer fit comfortably on one machine.

**Implementation checkpoint:** None. This is an explicitly marked scaling guide, not functionality claimed by the tutorial project.

## Companion implementation plan

The runnable project and detailed mini-course will live in a separate `tiny-transformer-course` git repository. The code repository will be the executable source of truth; this article will remain the shorter narrative summary of the concepts and verified results.

```text
tiny-transformer-course/
├── README.md
├── COURSE.md
├── pyproject.toml
├── lessons/
│   ├── 01-next-token-prediction/
│   ├── 02-corpus-and-tokenisation/
│   ├── 03-training-examples/
│   ├── 04-bigram-baseline/
│   ├── 05-embeddings-and-position/
│   ├── 06-scaled-attention/
│   ├── 07-causal-masking/
│   ├── 08-multi-head-attention/
│   ├── 09-feed-forward-and-normalisation/
│   ├── 10-transformer-block/
│   ├── 11-language-model-training/
│   ├── 12-generation/
│   └── 13-ablations/
├── tiny_transformer/
│   ├── __init__.py
│   ├── data.py
│   ├── tokenizer.py
│   ├── bigram.py
│   ├── attention.py
│   ├── embeddings.py
│   ├── transformer.py
│   ├── language_model.py
│   ├── training.py
│   └── ablation.py
├── tests/
│   ├── test_data.py
│   ├── test_tokenizer.py
│   ├── test_attention.py
│   ├── test_language_model.py
│   └── test_training.py
└── artifacts/
    └── runs/
```

Each lesson will explain a bounded set of concepts, link them to the relevant paper sections, and include a small executable example. The reusable `tiny_transformer` package will accumulate the implementation without forcing readers to copy incompatible fragments between lessons.

PyTorch will be the only required machine-learning dependency. Downloaded data and large generated checkpoints will not be committed, but the source URL, checksum, configuration, seed, environment information, metrics, and representative samples from the article run will be retained under `artifacts/runs/`.

## Build, run, write, review

The implementation and article will advance together:

1. Implement one small, testable capability.
2. Run its focused tests.
3. Run the smallest experiment that exercises it through the real pipeline.
4. Record actual shapes, metrics, failures, and output.
5. Write or revise the corresponding article section.
6. Check that the explanation matches the code and that the code demonstrates the stated concept.
7. Review the lesson for conceptual accuracy, executable completeness, and unnecessary abstraction.
8. Only then move to the next component.

The final end-to-end acceptance test passed in a clean clone. It installed the locked dependencies, downloaded and checksum-verified the pinned corpus, recreated the tokenizer and split, passed all 47 tests, trained the documented 10-step CPU smoke model, saved its checkpoint, and generated 40 new characters after reloading it in a new process. The longer retained run above exercises the same code path with the full course configuration.

## Primary references

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762), Ashish Vaswani et al.
- [TinyStories: How Small Can Language Models Be and Still Speak Coherent English?](https://arxiv.org/abs/2305.07759), Ronen Eldan and Yuanzhi Li.
- [Tiny Shakespeare](https://github.com/karpathy/char-rnn/tree/master/data/tinyshakespeare), popularised as a compact character-level language-modelling corpus by Andrej Karpathy.
- [Wikimedia data dumps](https://meta.wikimedia.org/wiki/Data_dumps/What%27s_available_for_download), for the optional discussion of acquiring larger Wikipedia corpora.
