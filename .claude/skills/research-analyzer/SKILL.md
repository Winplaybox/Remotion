---
name: research-analyzer
description: Analyzes extracted PDF text, identifies core scientific claims, checks source reliability, and catalogs citations into structured research records.
---

# Research Analyzer Skill

## Objective
Extract, analyze, and structure factual claims from raw technical PDFs, official research papers, and standards documentation (e.g. Stanford AI Index, ArXiv, NIST, OWASP, IETF RFCs).

## Core Rules
1. **Never Hallucinate:** If a metric or finding is not explicitly stated in the paper, mark it as `unsupported` or omit it.
2. **Page & Section Granularity:** Every claim must reference the exact page number and section title.
3. **Claim Structure:**
   - Source ID (e.g. `vaswani_2017_transformer`)
   - Exact or paraphrased claim
   - Direct excerpt quote
   - Verification status: `verified` | `pending` | `unsupported` | `disputed`
4. **Output Format:** Always emit valid JSON matching `ResearchDocumentSchema` in `@schemas/research`.
