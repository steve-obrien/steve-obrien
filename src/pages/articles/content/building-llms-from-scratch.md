---
title: Should you build an LLM from scratch?
description: Why most teams should begin with hosted models, owned telemetry and open-weight experiments before considering pretraining from scratch.
date: 2026-05-26
status: published
tags: [LLMs, AI, Systems]
metaDescription: A practical guide to adopting LLMs: start with hosted APIs and owned evaluation data, route work to cheaper models, test open weights and only pretrain when the evidence supports it.
metaKeywords: [LLM, large language model, model routing, open-weight models, LLM evaluation, LLM observability, pretraining, self-hosted AI]
---

If your goal is to build a better AI product, my default recommendation is **not** to train a large language model from scratch.

Start with a capable off-the-shelf model through its API. Build the application, learn where the model helps, and record the evidence in your own system. With the right consent and data controls, your request, response, cost, latency and outcome data becomes a test bed for evaluating cheaper models, improving prompts, fine-tuning smaller models and deciding whether self-hosting is justified.

This creates a more useful progression:

1. **Use a strong hosted model to establish the quality ceiling.**
2. **Own the telemetry and evaluation data around every model interaction.**
3. **Route suitable work to smaller and cheaper models.**
4. **Test pre-trained open-weight models before buying hardware.**
5. **Self-host only when the economics, privacy requirements or control justify it.**
6. **Pretrain from scratch only when existing models cannot meet a strategic requirement.**

That path gives you working software and real evidence at every stage. Training from scratch gives you a large bill before you know whether you are solving the right problem.

## Begin with the API, but own the evidence

A hosted model lets a small team test an idea without first building an inference platform. It also gives you a strong baseline: if a cheaper or local model cannot match the hosted model closely enough on your real tasks, you can quantify the gap rather than debate it in the abstract.

The important architectural decision is to treat the model provider as a replaceable dependency. Send requests through your own application service and record enough context to reproduce and evaluate each result.

| What to record | Why it matters |
| --- | --- |
| Use case and prompt-template version | Separates model quality from changes in your application |
| Request and response | Creates material for evaluation and, where permitted, future training |
| Provider, model and generation settings | Makes results reproducible and comparable |
| Input tokens, output tokens and estimated cost | Reveals the actual unit economics of each task |
| Latency, retries and failure type | Shows whether a model is operationally suitable |
| User action or reviewer outcome | Distinguishes a fluent answer from a useful one |
| Retrieved sources and tool results | Makes grounded and agentic responses auditable |

Do not turn on indiscriminate prompt logging and call it a data strategy. Requests may contain personal, confidential or regulated information. Decide what can be stored, redact or tokenise sensitive fields, encrypt the data, restrict access and set retention periods. Confirm that user consent, data licences and provider terms allow the intended evaluation or training use.

Raw conversations are not automatically a good training dataset either. The valuable material is the subset for which you know the task, the context and whether the response was accepted, corrected or rejected. That outcome data is what turns an archive into an evaluation set.

## Build a model and cost test bed

Once the application has enough representative traffic, create a versioned evaluation set covering common tasks, difficult examples, edge cases and known failures. Remove sensitive material unless it is essential and lawful to retain.

Run the same cases against several candidate models. Compare them on:

- **Task quality:** Did the output satisfy the actual requirement?
- **Groundedness:** Are claims supported by the supplied data or retrieved sources?
- **Reliability:** Does it follow the requested structure consistently?
- **Latency:** How long does a user or downstream process wait?
- **Cost:** What is the total cost per successful task, including retries and tools?
- **Risk:** What happens when it is uncertain, attacked or given sensitive data?

This makes model routing possible. A strong model can continue to handle ambiguous planning, difficult reasoning and high-value decisions, while a smaller model handles classification, extraction, formatting or other constrained work. Routing can be based on the known task, a lightweight classifier, confidence signals or escalation after a failed validation.

The cheapest model is not the one with the lowest token price. It is the one with the lowest cost per acceptable result. A model that is half the price but causes twice as many retries, reviews or customer failures has saved nothing.

Use human review for a meaningful sample, particularly for high-impact tasks. A stronger model can help score large evaluation runs, but an LLM judge should support rather than replace domain judgement.

## Choose the smallest intervention that solves the problem

“We need our own model” often describes several different requirements. They do not all require pretraining.

| Requirement | Usually try first |
| --- | --- |
| Current or proprietary knowledge | Retrieval-Augmented Generation (RAG) |
| Consistent tone, format or task behaviour | Supervised fine-tuning or LoRA |
| Lower API cost | Prompt optimisation, caching and model routing |
| Lower latency | A smaller model, quantisation or local inference |
| Data must remain inside a controlled environment | A self-hosted open-weight model |
| Unusual language, tokenisation or architecture requirements | Domain pretraining or training from scratch |

RAG keeps changing knowledge outside the model weights and can provide source attribution. Fine-tuning changes behaviour more reliably than it adds factual knowledge. Distillation can transfer a strong model's behaviour to a smaller model, but only when you have a well-defined task, representative examples and the right to use the source data and outputs.

These approaches can be combined. For example, a smaller fine-tuned model might handle a structured task while RAG supplies current product data, with a stronger hosted model as the fallback for difficult cases.

## The next step: run open-weight models

Pre-trained open-weight models give you control over deployment, quantisation, fine-tuning and data location without paying the enormous cost of pretraining. They are the sensible next experiment after hosted APIs.

Self-hosting becomes attractive when at least one of these is true:

- Request volume is high and predictable enough to keep expensive hardware busy.
- Privacy, sovereignty or contractual requirements rule out an external API.
- The product needs offline or low-latency inference close to the user.
- You need deeper control over weights, quantisation or fine-tuning.
- A smaller model has demonstrated acceptable quality on your evaluation set.

Test the model on rented cloud hardware before buying anything. Measure realistic prompts, context lengths, concurrent users and tokens per second. A benchmark showing that a model can produce one response is not a production capacity plan.

### A rough local hardware example

At 4-bit quantisation, model weights alone require roughly 0.5GB per billion parameters. Real memory use is higher because the runtime also needs quantisation metadata, working memory and a KV cache that grows with context length and concurrent requests.

| Model class | Approximate 4-bit weight size | Sensible unified memory or VRAM for experiments |
| --- | --- | --- |
| 7B–14B | 4–8GB | 16–32GB |
| 30B–32B | 15–20GB | 32–48GB |
| 70B–72B | 35–45GB | 64GB minimum; 96–128GB provides useful headroom |

Apple's current Mac Studio is an interesting local development option because its unified memory is available to the GPU. At the time of writing, the M4 Max model starts at **£2,099 with 36GB** and can be configured with up to **128GB**. The M3 Ultra starts with **96GB** and can be configured with up to **512GB**. Apple says the largest configuration can hold models with more than 600 billion parameters in memory.

For practical purposes, the base 36GB machine is suited to smaller quantised models. A 96GB or 128GB configuration is a more realistic starting point for experimenting with a 70B-class model, so the hardware budget quickly becomes several thousand pounds.

This is still a development or single-user inference machine, not automatically a production service. Fitting a model into memory says nothing about the number of simultaneous users it can serve, its response speed at long context, redundancy, monitoring or recovery from failure. High-throughput production inference generally favours dedicated GPU servers and serving software designed for continuous batching.

The financial comparison should therefore include:

- Hardware purchase and replacement
- Power, hosting and networking
- Engineering and operational support
- Monitoring, security and incident response
- Spare capacity and redundancy
- The opportunity cost of capital tied up in hardware

For intermittent or uncertain demand, an API is usually the more efficient place to start. Self-hosting earns its return when the workload is sufficiently steady, the model is sufficiently small and the operational requirements are understood.

## What “from scratch” actually means

The phrase covers projects with radically different ambitions.

| Scale | Goal | Typical reality |
| --- | --- | --- |
| Educational | Understand tokenisation, attention and next-token training | A small model on a laptop or single GPU |
| Specialist | Own a model for a narrow language or domain | Curated data, repeated experiments and multi-GPU training |
| Frontier | Compete with the largest general-purpose models | Large research teams, thousands of accelerators and industrial-scale infrastructure |

Costs vary enormously with ambition. An educational model can be built and trained on modest hardware. At frontier-lab scale, the economics are entirely different: one 2026 estimate puts architecture experiments alone at **$1–5 million (roughly £780,000–£3.9 million) before the main training run**. These are frontier-scale figures, not a typical budget for a small specialist model.

Training from scratch can still be justified. You might need a tokenizer for an under-served language, a compact model for unusual hardware, complete control of the training corpus, or an architecture that existing models do not provide. It can also be an excellent way to learn how language models work.

It is rarely the most direct route to a useful domain application. Medical, legal and technical systems usually benefit first from a strong base model, governed retrieval, task-specific evaluation and carefully scoped fine-tuning.

## Building an educational or specialist model

If the decision really is to pretrain, the work has six connected parts.

### 1. Define a measurable target

Decide whether the output is a base completion model, an instruction-following model or a component designed for a narrow task. Define the languages, context length, deployment hardware and quality tests before selecting the parameter count.

“Build a 7B model” is not a goal. “Match the accepted-answer rate of our current model on these three tasks while running within this latency and memory budget” is much closer to one.

### 2. Build a lawful, auditable dataset

Data quality is usually more important than adding parameters. Track provenance and licensing, remove personal information where appropriate, normalise encoding, identify languages, remove spam and deduplicate exact and near-duplicate documents.

Keep evaluation material out of the training set. Benchmark contamination can make a weak model look capable, while duplicates can cause it to memorise examples instead of generalising.

The often-quoted Chinchilla ratio of about 20 training tokens per parameter is a compute-optimal scaling result, not a minimum amount of data or a universal recipe. The right balance depends on data quality, compute, target capability and expected inference demand.

### 3. Select a tokenizer and architecture

Byte Pair Encoding and SentencePiece-style tokenisers are common starting points. Train or choose the tokenizer using the languages and technical vocabulary the model will actually see; token efficiency directly affects training and inference cost.

Most current generative language models use a decoder-only transformer trained for next-token prediction. Common design choices include RoPE positional encoding, RMSNorm, SwiGLU feed-forward layers and Grouped-Query Attention, but they are choices rather than mandatory ingredients.

Weight tying can share the input embedding and output projection to reduce parameters. It predates the original Transformer paper, although the Transformer adopted the technique.

### 4. Train and recover safely

PyTorch is the common foundation. For distributed training, Fully Sharded Data Parallel, DeepSpeed ZeRO and other parallel strategies can divide parameters, gradients and optimiser state across accelerators. The correct choice depends on model shape, hardware memory, interconnects and cluster topology, rather than a fixed parameter threshold.

Start with small pipeline and scaling experiments. Verify that data loading, loss, evaluation and checkpoint restoration all work before committing to a long run. Save the optimiser, scheduler and random-number state as well as the model weights so interrupted training can resume accurately.

Mixed precision and memory-efficient attention can improve throughput substantially, but gains depend on the GPU, model dimensions and sequence length. Treat headline speedups as benchmarks to reproduce, not guarantees.

### 5. Evaluate the capability you need

Training loss and perplexity reveal whether next-token prediction is improving, but perplexity values are only meaningfully comparable on the same dataset with compatible tokenisation. There is no universal band where a perplexity of 10–20 proves that a model produces high-quality language.

Evaluation should include:

- A held-out validation set from the target distribution
- Task-specific tests with explicit pass criteria
- In-domain and out-of-domain prompts
- Memorisation and benchmark-contamination checks
- Safety, bias and adversarial testing appropriate to the use case
- Latency, throughput and memory measurements on deployment hardware

For a product, the decisive metric is normally task success under realistic operating conditions, not a public leaderboard score.

### 6. Post-train and deploy

Pretraining produces a base model that predicts text. It normally needs supervised fine-tuning before it reliably follows instructions. Preference training may improve subjective behaviour, while verifiable tasks such as maths or code can support reinforcement learning with objective rewards.

Quantisation reduces deployment memory at some cost to quality. Formats such as `safetensors` avoid the arbitrary code-execution risks associated with loading Python pickle files. Serving systems such as vLLM and SGLang provide batching and cache management for GPU deployments; local Apple silicon experiments commonly use MLX or llama.cpp-based tools.

Deployment is not the end of evaluation. Continue recording the model version, prompt version, latency, cost and user outcome so that regressions and better routing opportunities remain visible.

## Building LLMs from the Ground Up: A 3-hour Coding Workshop

::ArticleYouTube{width="article" id="quh7z1q7-uc" title="Building LLMs from the Ground Up: A 3-hour Coding Workshop"}

## A practical recommendation

For most product teams, I would follow this order:

1. **Prove the use case with the best hosted model you can access.**
2. **Store governed, reproducible request, response, cost and outcome data in your own system.**
3. **Turn successful and failed cases into a versioned evaluation set.**
4. **Use that evidence to route simple work to cheaper hosted models.**
5. **Benchmark open-weight models on rented hardware.**
6. **Buy local or server hardware only after measuring a credible return.**
7. **Fine-tune or distil when the task and dataset are stable enough.**
8. **Pretrain from scratch only when a requirement cannot be met by the earlier steps.**

The strategic asset is not initially the model. It is the system that captures what users ask, what the model returns, what it costs and whether it worked. That evidence gives you the freedom to change providers, use smaller models and eventually train something of your own without guessing.

## References and further reading

1. [Vaswani et al., _Attention Is All You Need_](https://arxiv.org/abs/1706.03762): the original Transformer architecture.
2. [Press and Wolf, _Using the Output Embedding to Improve Language Models_](https://arxiv.org/abs/1608.05859): the earlier weight-tying paper.
3. [Hoffmann et al., _Training Compute-Optimal Large Language Models_](https://arxiv.org/abs/2203.15556): the Chinchilla scaling work.
4. [Meta, _The Llama 3 Herd of Models_](https://arxiv.org/abs/2407.21783): a detailed public account of large-scale model development and evaluation.
5. [DeepSeek-AI, _DeepSeek-V3 Technical Report_](https://arxiv.org/abs/2412.19437): architecture, training infrastructure and inference efficiency at scale.
6. [Sebastian Raschka, _Build a Large Language Model From Scratch_](https://github.com/rasbt/LLMs-from-scratch): a practical educational implementation with code.
7. [PyTorch, _Fully Sharded Data Parallel_](https://docs.pytorch.org/docs/stable/fsdp.html): current distributed-training documentation.
8. [Hugging Face, _Tokenization algorithms_](https://huggingface.co/docs/transformers/tokenizer_summary) and [quantisation](https://huggingface.co/docs/transformers/quantization/overview): practical implementation guidance.
9. [Apple, _Mac Studio with M4 Max and M3 Ultra_](https://www.apple.com/uk/newsroom/2025/03/apple-unveils-new-mac-studio-the-most-powerful-mac-ever/) and the [current UK store](https://www.apple.com/uk/shop/buy-mac/mac-studio): unified-memory specifications and current entry pricing checked in July 2026.
10. [Kanishk Patel, _The Pipeline: A Language Model from Scratch in Twelve Steps_](https://learnagentic.substack.com/p/the-pipeline-a-language-model-from): the source of the quoted frontier architecture-experiment estimate.
