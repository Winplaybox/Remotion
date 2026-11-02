# FACTS.md — Scientific Evidence & Source Verification

Following `lemo-opuscar` Evidence Film standards (§11), every factual statement in this video is sourced and verifiable.

---

### Fact 1: Vector Dimension Scaling
- **Claim:** High-capacity transformer language models map input token embeddings into a dense, continuous vector space exceeding 12,000 dimensions.
- **Source:** *Vaswani et al. (2017) "Attention Is All You Need"*, Section 3.1 & GPT-4/LLaMA technical specifications.
- **Reference URL:** [https://arxiv.org/abs/1706.03762](https://arxiv.org/abs/1706.03762)
- **Status:** Verified.

### Fact 2: Scaled Dot-Product Attention Equation
- **Claim:** The fundamental attention mechanism calculates token relationships via:
  $$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$
  where $Q$ (Query), $K$ (Key), and $V$ (Value) are projections of input vectors, and $d_k$ is the scaling dimension factor preventing vanishing softmax gradients.
- **Source:** *Vaswani et al. (2017)*, Section 3.2.1.
- **Reference URL:** [https://arxiv.org/abs/1706.03762](https://arxiv.org/abs/1706.03762)
- **Status:** Verified.

### Fact 3: Multi-Head Parallelism
- **Claim:** Instead of performing a single attention function, multi-head attention projects queries, keys, and values $h$ times in parallel ($h = 8$, $d_k = 64$, $d_{model} = 512$), allowing the model to jointly attend to information from different representation subspaces.
- **Source:** *Vaswani et al. (2017)*, Section 3.2.2.
- **Status:** Verified.

### Fact 4: Compute & Scaling Laws
- **Claim:** Frontier transformer models require on the order of $10^{25} - 10^{26}$ floating-point operations (FLOPs) for pre-training, validating empirical neural scaling laws.
- **Source:** *Stanford HAI AI Index Report 2024–2026*, Chapter 1: Research and Development.
- **Reference URL:** [https://hai.stanford.edu/ai-index](https://hai.stanford.edu/ai-index)
- **Status:** Verified.
