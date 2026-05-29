---
title: Building a LLM from scratch
description: A step-by-step guide to building a large language model from scratch.
date: 2026-05-26
tags: [LLMs, AI, Systems]
metaDescription: Step-by-step guide to design, train and deploy a custom LLM, covering data curation, architecture, training, evaluation and quantised deployment.
metaKeywords: [LLM, large language model, pretraining, tokenisation, transformer, data curation, quantisation, model deployment]
---

Building a large language model (LLM) from scratch is a complex yet rewarding process. It offers full control over data, architecture, and performance, making it ideal for specific use cases like medical, legal, or technical domains. Here's a quick breakdown of the key steps:

-   **Define Goals and Scope**: Decide whether you need a text-completion, instruction-following, or reasoning model. Align goals with budget and hardware constraints.
-   **Prepare Data**: Gather high-quality, domain-relevant datasets. Clean, deduplicate, and tokenise the data for efficient training.
-   **Choose Architecture**: Most modern LLMs use decoder-only transformers with features like rotary embeddings, causal self-attention, and mixed precision for efficiency.
-   **Train the Model**: Use tools like [PyTorch](https://pytorch.org/) and [DeepSpeed](https://www.deepspeed.ai/) for distributed training. Optimise memory and manage compute resources carefully.
-   **Evaluate and Deploy**: Test performance using metrics like perplexity and benchmarks. Quantise the model for cost-effective deployment.

The process requires careful planning, especially around data quality, hardware selection, and training strategies. While resource-intensive, a well-built LLM can outperform larger general-purpose models in specialised tasks.

![How to Build an LLM from Scratch: 5-Step Process](https://assets.seobotai.com/undefined/6a15da835ded517781cadafa-1779818868052.jpg)

## Defining Scope and Requirements

### Define Your Use Case and Goals

Start by clarifying your project's purpose. Do you need a **Base model** for text completion, an **Instruct model** designed to follow directions, or a **Reasoning model** capable of tackling complex problems like maths or coding? Each type comes with its own architecture, data needs, and training requirements. Set clear capability targets early on - whether it's handling long documents, structured data, or coding tasks - as these decisions will influence your architecture and training strategy [\[3\]](https://learnagentic.substack.com/p/the-pipeline-a-language-model-from). Ambiguous goals can lead to costly changes later, so ensure your objectives align with your available resources and budget.

### Estimate Scale and Budget

The size of your model and your budget are closely connected. For instance, a 124-million parameter model can be trained on a single GPU. In contrast, a 70-billion parameter model with 4-bit quantisation demands about **49 GB of VRAM** [\[2\]](https://www.sourcetrail.com/python/language-models-from-scratch-from-tokens-to-local-llms/). A simple way to estimate VRAM requirements is to multiply the parameter count (in billions) by 0.7.

Understanding this relationship helps you match your hardware needs to your project's scale. Here's a quick reference table mapping model size to hardware and typical use cases:

| Model Size | Hardware Target | Typical Use Case |
| --- | --- | --- |
| 7B – 9B | Consumer PC / Laptop | Basic chat, local assistants, light reasoning [\[2\]](https://www.sourcetrail.com/python/language-models-from-scratch-from-tokens-to-local-llms/) |
| 70B | Professional GPU / Cloud | Expert-level performance, strong reasoning [\[2\]](https://www.sourcetrail.com/python/language-models-from-scratch-from-tokens-to-local-llms/) |
| 400B+ | Data Centre / API | Complex problem solving, frontier-level tasks [\[2\]](https://www.sourcetrail.com/python/language-models-from-scratch-from-tokens-to-local-llms/) |

These figures guide hardware decisions, which are covered in the next section. Keep in mind that **pretraining alone accounts for about 60% of the total project cost** [\[3\]](https://learnagentic.substack.com/p/the-pipeline-a-language-model-from). To minimise risks, allocate funds for smaller ablation experiments before committing to full-scale training. These experiments, costing between **£780,000 and £3.9 million**, allow you to test architecture choices without overspending [\[3\]](https://learnagentic.substack.com/p/the-pipeline-a-language-model-from). As Kanishk Patel explains:

> "The decision is not just business. It's also physics. The lab has a fixed amount of compute, and that compute can be spent on more parameters, more training data, longer context, or more post-training." [\[3\]](https://learnagentic.substack.com/p/the-pipeline-a-language-model-from)

### Hardware and Tooling Requirements

Once your scale and budget are defined, it's time to select the right tools and hardware. **PyTorch** is the industry standard for building LLMs from scratch, with **[TensorFlow](https://www.tensorflow.org/)** as a viable alternative when specific system compatibility is needed [\[7\]](https://github.com/habil/llm-from-scratch)[\[9\]](https://github.com/rasbt/LLMs-from-scratch/). For models that exceed a single GPU's capacity, **DeepSpeed** is essential. Its ZeRO optimisation stages allow you to distribute optimiser states and parameters across multiple GPUs, enabling larger training runs [\[8\]](https://github.com/anmolg1997/SLM-From-Scratch).

On the hardware side, **NVIDIA GPUs** like the H100 or A100 are the top choice for their high throughput - measured in tokens processed per second - making them ideal for training. If you're hosting large models locally rather than training them, Apple M-series machines with unified memory are a better fit [\[2\]](https://www.sourcetrail.com/python/language-models-from-scratch-from-tokens-to-local-llms/). Finally, ensure your tokeniser's vocabulary size aligns with your model configuration to avoid critical failures [\[8\]](https://github.com/anmolg1997/SLM-From-Scratch). These foundational decisions are crucial for shaping your model's design and training process.

###### sbb-itb-e60c46a

## Building LLMs from the Ground Up: A 3-hour Coding Workshop

::ArticleYouTube{width="article" id="quh7z1q7-uc" title="Building LLMs from the Ground Up: A 3-hour Coding Workshop"}

## Preparing and Preprocessing Your Data

Getting your data right is the foundation of any successful large language model (LLM) training process.

### Collect Domain-Relevant Data

Before diving into the technical work, you need to carefully define your data sources. The rule here is straightforward: **quality beats quantity**. As Publishd puts it:

> "Garbage data produces garbage models. This isn't negotiable." [\[10\]](https://publishd.app/blog/scraping-stack-llm-training-data)

Start by sourcing data through APIs and openly licensed platforms like Creative Commons or Apache 2.0, which provide clean, legal, and auditable datasets [\[13\]](https://www.rohan-paul.com/p/curating-public-datasets-for-llm). If web crawling becomes necessary, ensure you comply with `robots.txt` guidelines, use appropriate User-Agent settings, and respect `Crawl-Delay` directives [\[10\]](https://publishd.app/blog/scraping-stack-llm-training-data). For large datasets (over 100 GB), consider object storage solutions like [Amazon S3](https://aws.amazon.com/s3/), which costs about £0.02 per GB per month [\[10\]](https://publishd.app/blog/scraping-stack-llm-training-data).

The type of data you collect - whether web text, code, or academic papers - will shape your model’s capabilities. There’s no universal ratio for these data types. For example, Meta’s [Llama 3](https://en.wikipedia.org/wiki/Llama_\(language_model\)) 8B model was trained on 15 trillion tokens, equating to about 1,875 tokens per parameter, far beyond the conventional Chinchilla ratio of 20 tokens per parameter [\[11\]](https://www.bestaiweb.ai/from-data-curation-to-checkpoints-the-building-blocks-of-a-modern-pre-training-pipeline/). [Hugging Face](https://huggingface.co/)’s FineWeb dataset also includes around 15 trillion English tokens [\[11\]](https://www.bestaiweb.ai/from-data-curation-to-checkpoints-the-building-blocks-of-a-modern-pre-training-pipeline/), while the [Allen Institute](https://allenai.org/)’s Dolma corpus condensed 200 TB of raw data into an 11 TB clean dataset (around 3 trillion tokens) [\[13\]](https://www.rohan-paul.com/p/curating-public-datasets-for-llm).

### Clean and Normalise the Dataset

Cleaning your dataset is a multi-step process. Start with basic fixes like correcting Unicode errors (e.g., turning "cafÃ©" into "café") and standardising whitespace. Then, identify and filter out irrelevant languages. Deduplication is another crucial step - it can eliminate 20–30% of raw web data [\[13\]](https://www.rohan-paul.com/p/curating-public-datasets-for-llm). For instance, the Falcon RefinedWeb dataset by the Technology Innovation Institute (TII) reduced 1 billion raw pages to just 2.8 TB of unique, high-quality text [\[13\]](https://www.rohan-paul.com/p/curating-public-datasets-for-llm).

At scale, tools like MinHash combined with locality-sensitive hashing (LSH) are effective for catching near-duplicates, mirrored content, and reformatting issues that exact hashing might miss [\[11\]](https://www.bestaiweb.ai/from-data-curation-to-checkpoints-the-building-blocks-of-a-modern-pre-training-pipeline/). Use heuristic filters to weed out overly short texts, strange character ratios, or excessive repetition. For large-scale datasets, lightweight classifiers like [fastText](https://fasttext.cc/) are efficient for quality filtering. For smaller, high-quality fine-tuning datasets, using an LLM-based evaluation is often more precise [\[14\]](https://developer.nvidia.com/blog/mastering-llm-techniques-data-preprocessing/).

Don’t forget to scrub personally identifiable information (PII) using tools like [Microsoft Presidio](https://microsoft.github.io/presidio/faq/). Additionally, check for overlap with evaluation benchmarks (like [MMLU](https://en.wikipedia.org/wiki/MMLU)) to avoid artificially inflating your metrics [\[12\]](https://arxiv.org/html/2406.11794v3).

Once your data is cleaned and trimmed, you’re ready to split and tokenise it for training.

### Split and Tokenise Your Data

After cleaning, the next step is splitting and tokenising your dataset. Divide it into training, validation, and test sets to prevent data leakage. Make sure to filter the data before tokenisation - tokenisation can be computationally expensive, so only process what you actually plan to use [\[15\]](https://omarnahdi.dev/writing/data-packaging-for-pretraining-llm).

For English-language or code-focused models, Byte Pair Encoding (BPE) is a widely used tokenisation method, as seen in GPT-2 and the Llama family. For multilingual datasets, [SentencePiece](https://github.com/google/sentencepiece) is often a better choice because it works directly with raw text and treats whitespace as a token, making it more adaptable across languages [\[16\]](https://huggingface.co/docs/transformers/main/tokenizer_summary)[\[17\]](https://www.digitalocean.com/community/tutorials/llm-tokenizers-bpe-sentencepiece-custom-vs-pretrained). Training a custom tokeniser tailored to your domain can cut token counts by 17–20% compared to using a generic pretrained one [\[17\]](https://www.digitalocean.com/community/tutorials/llm-tokenizers-bpe-sentencepiece-custom-vs-pretrained), which can save on training costs. Also, be sure to reserve special tokens like `<|user|>` and `<|assistant|>` for future instruction tuning [\[4\]](https://github.com/Tianyu-Zhou1964/PIE-Handmaking_LLM).

Store your tokenised data in Parquet format. This format offers efficient compression, supports columnar reads, and allows you to stream datasets larger than your available RAM, directly from disk or S3 [\[15\]](https://omarnahdi.dev/writing/data-packaging-for-pretraining-llm). To optimise GPU memory usage, use sequence packing: combine shorter documents into a single context window, separated by an end-of-sequence token. Omar Nahdi highlights the importance of these choices:

> "The data pipeline is where the model's learning potential is either unlocked or constrained. Small decisions - whether to pack or pad... have downstream effects that are hard to diagnose once training has started." [\[15\]](https://omarnahdi.dev/writing/data-packaging-for-pretraining-llm)

## Designing and Building the Model

Once your dataset is ready, the next step is to transform it into a working model. This involves defining the model's structure, training goals, and optimising its performance.

### Choose a Model Architecture

Most modern large language models (LLMs) rely on a **decoder-only transformer**. This design is tailored for autoregressive text generation, where the model predicts the next token based on prior ones [\[18\]](https://krunalkanojiya.com/blog/i-built-a-tiny-gpt-model-from-scratch)[\[19\]](https://mlsysbook.ai/tinytorch/modules/13_transformers.html).

A typical transformer layer includes:

-   **Token and positional embeddings**: Token embeddings convert vocabulary IDs into vectors. For positional context, **Rotary Positional Embeddings (RoPE)** are preferred. RoPE handles relative positions more effectively, especially for longer sequences [\[20\]](https://github.com/raiyanyahya/how-to-train-your-gpt)[\[6\]](https://github.com/giangthb/how-to-train-your-gpt-in-2026).
-   **Causal self-attention**: This mechanism ensures each token only considers previous tokens, thanks to a causal mask. This feature makes the model generative. As Krunal Kanojiya explains: _"Attention is not as magical as it sounds. Once you write the QKV matrix multiply by hand, it's dot products and softmax. That's it."_ [\[18\]](https://krunalkanojiya.com/blog/i-built-a-tiny-gpt-model-from-scratch).
-   **Feed-forward network (FFN)**: Each token is processed independently using a 4× hidden dimension expansion. **SwiGLU** activation is commonly used here, offering better results compared to ReLU [\[19\]](https://mlsysbook.ai/tinytorch/modules/13_transformers.html)[\[20\]](https://github.com/raiyanyahya/how-to-train-your-gpt).
-   **Pre-RMSNorm and residual connections**: Normalisation happens _before_ the attention and FFN blocks (Pre-Norm), which helps stabilise training in deep networks. RMSNorm is about 15% faster than LayerNorm while delivering similar results [\[20\]](https://github.com/raiyanyahya/how-to-train-your-gpt)[\[6\]](https://github.com/giangthb/how-to-train-your-gpt-in-2026). Residual connections, which add a layer's input to its output, are vital for preventing vanishing gradients as the network deepens [\[19\]](https://mlsysbook.ai/tinytorch/modules/13_transformers.html)[\[20\]](https://github.com/raiyanyahya/how-to-train-your-gpt).

These improvements mark a clear evolution from earlier transformer models, as summarised below:

| Feature | Original Transformer | Modern LLM (2024–2026) |
| --- | --- | --- |
| **Normalisation** | Post-LayerNorm | Pre-RMSNorm [\[19\]](https://mlsysbook.ai/tinytorch/modules/13_transformers.html)[\[20\]](https://github.com/raiyanyahya/how-to-train-your-gpt) |
| **Activation** | ReLU | SwiGLU [\[20\]](https://github.com/raiyanyahya/how-to-train-your-gpt)[\[5\]](https://www.youngju.dev/blog/llm/2026-03-17-build-llm-from-scratch-guide.en) |
| **Positioning** | Sinusoidal/Absolute | RoPE (Rotary) [\[20\]](https://github.com/raiyanyahya/how-to-train-your-gpt)[\[6\]](https://github.com/giangthb/how-to-train-your-gpt-in-2026) |
| **Attention** | Multi-Head (MHA) | Grouped-Query (GQA) [\[6\]](https://github.com/giangthb/how-to-train-your-gpt-in-2026) |
| **Precision** | Float32 | Mixed Precision (bfloat16) [\[5\]](https://www.youngju.dev/blog/llm/2026-03-17-build-llm-from-scratch-guide.en)[\[6\]](https://github.com/giangthb/how-to-train-your-gpt-in-2026) |

### Set Up Training Objectives

Once the architecture is in place, define a clear training objective. For decoder-only LLMs, this is typically **next-token prediction**. The model takes a sequence of tokens as input and learns to predict the next token at each position. This is achieved by shifting the input sequence one position to the right, with loss calculated using **cross-entropy** to compare predictions against actual tokens [\[18\]](https://krunalkanojiya.com/blog/i-built-a-tiny-gpt-model-from-scratch)[\[21\]](https://jiegroup-genai.readthedocs-hosted.com/en/latest/training/index.html).

A critical optimisation here is **weight tying**, where the same weight matrix is shared between the input embedding layer and the output linear head. This reduces the parameter count by roughly 30% while improving performance [\[21\]](https://jiegroup-genai.readthedocs-hosted.com/en/latest/training/index.html)[\[18\]](https://krunalkanojiya.com/blog/i-built-a-tiny-gpt-model-from-scratch). This technique, introduced in the original _Attention Is All You Need_ paper, remains a cornerstone of modern models.

Another key measure is **gradient clipping**, which ensures gradients do not exceed a maximum norm of 1.0. This prevents exploding gradients, a common issue that can disrupt training [\[18\]](https://krunalkanojiya.com/blog/i-built-a-tiny-gpt-model-from-scratch)[\[22\]](https://github.com/DrunkJin/llm-from-scratch).

### Improve Model Efficiency

To optimise training speed and memory usage, two methods stand out: **[FlashAttention](https://github.com/dao-ailab/flash-attention)** and **mixed precision**.

Standard attention scales poorly with sequence length, creating a bottleneck at longer contexts. **FlashAttention** addresses this by reorganising computations into blocks that fit into fast SRAM, reducing reliance on slower GPU memory. FlashAttention-2 can be up to **9× faster** than standard PyTorch implementations and achieves up to 230 TFLOPS/s on A100 GPUs [\[24\]](https://princeton-nlp.github.io/flash-atttention-2/). As Jay Shah from Colfax Research explains:

> "Attention, as a core layer of the ubiquitous Transformer architecture, is a bottleneck for large language models and long-context applications." [\[23\]](https://pytorch.org/blog/flashattention-3/)

**Mixed precision training** is another game-changer. Using `torch.amp.autocast` with **bfloat16** for compute-heavy operations, while keeping sensitive steps in float32, can deliver a **2× speedup** on modern GPUs without compromising model quality [\[21\]](https://jiegroup-genai.readthedocs-hosted.com/en/latest/training/index.html)[\[22\]](https://github.com/DrunkJin/llm-from-scratch). For larger models, implementing **Grouped-Query Attention (GQA)** is also beneficial. GQA reduces the size of the KV cache during inference, which is critical for scaling. For example, a 70B parameter model with a 32K context window can require around 20 GB of memory per request just for the KV cache [\[19\]](https://mlsysbook.ai/tinytorch/modules/13_transformers.html).

## Training, Evaluating, and Scaling the LLM

### Train the Model

Once the model design and data preparation are complete, the next step is training, which finalises the custom setup. This stage focuses on optimising memory usage, ensuring stability, and scaling effectively.

To optimise memory, **AdamW** is a popular choice for training. It stores momentum states in FP32, which doubles the memory requirement compared to the model's weights [\[25\]](https://www.cse.iitb.ac.in/~ujjwalsharma/blogs/llm-training/). Including parameters and gradients, training with AdamW typically demands around 16 bytes per parameter. For instance, a model with 175 billion parameters would require about 2.8 terabytes of memory just for the model state [\[27\]](https://mbrenndoerfer.com/writing/fsdp-fully-sharded-data-parallel-sharding-strategies-zero). To manage memory further, gradient checkpointing can be used, though it adds a 20–30% computational overhead [\[25\]](https://www.cse.iitb.ac.in/~ujjwalsharma/blogs/llm-training/).

For stability, a linear learning rate warmup over the first 100–1,000 steps is critical. Skipping this step often leads to early divergence during training. As Ujjwal Sharma from IIT Bombay explains:

> "The most successful AI labs are not differentiated by a secret architecture - they are defined by their mastery of the stack." [\[25\]](https://www.cse.iitb.ac.in/~ujjwalsharma/blogs/llm-training/)

When scaling, it's essential to adapt the training setup. Models exceeding 3 billion parameters should shift from **Distributed Data Parallel (DDP)** to **Fully Sharded Data Parallel (FSDP)**. For larger models, such as those with over 70 billion parameters, **DeepSpeed ZeRO-3** is recommended to shard parameters and optimise GPU memory usage.

Training at scale is rarely without challenges. For example, during Meta's 54-day training of Llama 3.1 (405 billion parameters) on 16,000 H100 GPUs, there were 466 interruptions, with 419 caused by hardware or network failures [\[3\]](https://learnagentic.substack.com/p/the-pipeline-a-language-model-from). To mitigate such risks, robust checkpointing is essential. As Ujjwal Sharma highlights:

> "A training pipeline without robust, exact-state checkpointing is not a production system - it is a fragile, multi-million-dollar experiment." [\[25\]](https://www.cse.iitb.ac.in/~ujjwalsharma/blogs/llm-training/)

Once training is complete, the next step is to evaluate the model's performance.

### Evaluate Model Performance

To assess performance, cross-entropy loss is a key metric. This measures how well the model predicts the next token in a sequence. **Perplexity (PPL)**, calculated as ( e^{loss} ), provides a more intuitive measure of prediction accuracy - lower values indicate better performance [\[25\]](https://www.cse.iitb.ac.in/~ujjwalsharma/blogs/llm-training/).

| Perplexity (PPL) Score | Practical Meaning |
| --- | --- |
| 1.0 | Perfect prediction |
| 10–20 | High-quality, coherent language modelling |
| 100+ | Poor model - essentially guessing |

It's also important to monitor the gap between training and validation loss. A widening gap suggests overfitting, where the model memorises the training data instead of generalising. A simple sanity check involves searching the training data for sentences that the model generates verbatim. If exact matches are found, the model may be copying rather than learning [\[1\]](https://github.com/Sayed-Husain/modern-llm-from-scratch).

Quantitative metrics like perplexity only tell part of the story. Complement these with qualitative testing using a mix of in-domain and out-of-domain prompts to identify the model's limitations. For more rigorous comparisons, standardised benchmarks such as **MMLU** (for general knowledge) and **[HumanEval](https://github.com/openai/human-eval)** (for coding tasks) are useful [\[25\]](https://www.cse.iitb.ac.in/~ujjwalsharma/blogs/llm-training/). However, ensure that benchmark questions are removed from the pretraining data to avoid inflated scores that don't reflect real-world performance [\[25\]](https://www.cse.iitb.ac.in/~ujjwalsharma/blogs/llm-training/).

Once the model performs as expected, it's time to prepare it for deployment.

### Prepare for Deployment

Deploying a model often requires reducing its size without sacrificing quality. A practical approach is **4-bit quantisation**, which typically requires about 0.7 GB of VRAM per billion parameters at Q4 precision [\[2\]](https://www.sourcetrail.com/python/language-models-from-scratch-from-tokens-to-local-llms/). For example, a 7-billion-parameter model would need approximately 5 GB of VRAM, making it feasible to run on a single consumer GPU.

For large-scale serving, frameworks like **[vLLM](https://vllm.ai/)** and **[SGLang](https://www.sglang.io/)** are designed for high-throughput inference. These frameworks handle key-value caching and batching more efficiently than a standard PyTorch inference loop [\[2\]](https://www.sourcetrail.com/python/language-models-from-scratch-from-tokens-to-local-llms/)[\[3\]](https://learnagentic.substack.com/p/the-pipeline-a-language-model-from). When exporting the model, use the `.safetensors` format instead of Python's `pickle`\-based alternatives. This ensures faster, zero-copy loading and avoids security risks associated with deserialising Python objects [\[25\]](https://www.cse.iitb.ac.in/~ujjwalsharma/blogs/llm-training/).

In March 2026, Tareq Haschemi demonstrated a practical example of pretraining a 1.15-billion-parameter model using 16 NVIDIA A10G GPUs across 4 nodes on [Amazon SageMaker HyperPod](https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod.html). By leveraging PyTorch FSDP and managing infrastructure with [Terraform](https://developer.hashicorp.com/terraform), the model achieved a loss below 3.0 after 47,000 steps, completing training in around 56 hours [\[26\]](https://tareq.de/pretraining-1b-llm-sagemaker-hyperpod/). This serves as a realistic benchmark for mid-scale setups.

## Conclusion: Key Takeaways and Next Steps

### Recap of the LLM-Building Process

Creating and deploying a large language model (LLM) is no small feat - it demands careful planning and execution at every stage. The process starts with defining the scope, preparing high-quality data, designing the architecture, and moving through pretraining, fine-tuning, and preference learning. Among these, pretraining is the most resource-heavy step, so making informed decisions about data and architecture early on is critical.

The workflow typically unfolds in three main phases: **pretraining**, **instruction fine-tuning**, and **preference learning**. Each phase builds on the previous one, gradually improving the model's performance. While a base model may simply predict or complete text, fine-tuning ensures the model aligns better with human expectations and intent [\[3\]](https://learnagentic.substack.com/p/the-pipeline-a-language-model-from). These steps lay the groundwork for achieving both performance and cost efficiency.

### Tips for Getting It Right

Here are some practical insights to help you succeed:

-   **Prioritise data quality over model size.** Kanishk Patel, author of _Built, Not Born_, highlights this point:
    
    > "A model trained on better data outperforms a bigger model trained on worse data. It's also the part where labs are most secretive, because quality data is a defensible competitive edge." [\[3\]](https://learnagentic.substack.com/p/the-pipeline-a-language-model-from)
    
-   **Plan for inference costs early.** Patel also emphasises:
    
    > "A model is built once. It runs for billions of requests over its lifetime. A 2× improvement in serving cost saves more money than a 2× improvement in training cost." [\[3\]](https://learnagentic.substack.com/p/the-pipeline-a-language-model-from)
    
    This means you might want to train on more tokens than the theoretical optimum if your model is expected to handle significant production workloads.
-   **Use robust checkpointing.** Large-scale projects are prone to hardware failures. By saving full-state checkpoints - including optimiser and RNG states - you can avoid losing progress and recover efficiently when issues arise.

By following these strategies, you’ll be better equipped to navigate the challenges of LLM development and move forward with confidence.

### Where to Go Next with Custom LLMs

Once your custom LLM is up and running, the next steps involve fine-tuning and alignment to ensure it meets specific needs. Techniques like **LoRA** (Low-Rank Adaptation) can be especially useful for task-specific fine-tuning, as they allow you to train only about 0.18% of the model’s parameters, significantly reducing computational costs [\[29\]](https://github.com/AmanVasisht/build-llm-from-scratch). For alignment, **Direct Preference Optimisation (DPO)** is a practical starting point before exploring more complex methods like Reinforcement Learning from Human Feedback (RLHF).

If your model requires domain-specific expertise, **Retrieval-Augmented Generation (RAG)** is worth considering early on. This method enables the model to query external knowledge bases during inference, eliminating the need to embed all information directly into its parameters [\[28\]](https://thecodersblog.com/training-llms-from-scratch-2026/). Additionally, adopting **Mixture-of-Experts (MoE)** architectures can help scale up the model’s capacity without dramatically increasing computational demands [\[9\]](https://github.com/rasbt/LLMs-from-scratch/).

## FAQs

### How do I decide the right model size for my budget and hardware?

Selecting a model size depends on your **hardware limitations** and the performance you require. For local inference, keep in mind that **4-bit quantised models** typically need around _0.5 GB of VRAM_ per billion parameters. You'll also need an additional 10–20% of VRAM for the KV cache.

Don't forget to account for overhead - subtract about 15% of your total VRAM to ensure smooth operation. If your memory falls short, you have a few options:

-   Opt for a smaller model.
-   Increase the level of quantisation.
-   Distribute the workload across multiple GPUs.

For training, be prepared for significantly higher demands. You'll need **4 to 10 times more VRAM** due to the extra memory required for storing gradients. Always plan accordingly to avoid hitting hardware limitations.

### What’s the minimum amount of clean data needed to pretrain a useful LLM?

The data you’ll need depends heavily on the size of the model you're aiming to train. A widely accepted rule of thumb is to have about **20 tokens for every model parameter** to ensure efficient training.

For smaller, domain-focused models, this could mean hundreds of millions of tokens. On the other hand, larger models might demand billions - or even trillions - of tokens. However, for certain specialised applications, tens of millions to billions of tokens may be enough. It’s often best to start small, such as with a **1-million-token test**, to confirm your setup works and fine-tune your approach.

### When should I use fine-tuning, DPO, or RAG after pretraining?

When working with tasks requiring up-to-date proprietary knowledge or handling large datasets that go beyond the model's context window, start with **RAG** (Retrieval-Augmented Generation). This approach is particularly useful when source attribution is essential, as it allows the model to pull in relevant external data to enhance its responses.

For situations requiring lasting changes in behaviour, such as adhering to specific formats or using specialised terminology, **SFT** (Supervised Fine-Tuning) is the go-to method. It helps the model consistently apply domain-specific rules or patterns.

When focusing on subjective output quality or aligning responses to preferred tones and behaviours, **DPO** (Direct Preference Optimisation) is a better choice. By using ranked response pairs, DPO simplifies the process compared to traditional reinforcement learning methods, offering a more stable way to fine-tune the model's output to meet user expectations.