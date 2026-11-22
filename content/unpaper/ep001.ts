// Unpaper #001 — "Attention Is All You Need" (arXiv 1706.03762). Authored + source-verified; do not edit published episodes.
export const UNPAPER_EP001 = {
  "id": "ep001s",
  "title": "ChatGPT ka 'T' kahan se aaya? | Attention Is All You Need",
  "source": {
    "title": "Attention Is All You Need",
    "authors": "Vaswani et al. (Google Brain, Google Research, University of Toronto)",
    "year": 2017,
    "url": "https://arxiv.org/abs/1706.03762",
    "license_note": "Google grants permission to reproduce tables and figures for journalistic or scholarly works with attribution (p.1)."
  },
  "cta": {
    "hook": "ChatGPT ka 'T' kis cheez ka hai?",
    "hookNumber": "15 pages",
    "comment": "GPT ka 'T' = ___?"
  },
  "scenes": [
    {
      "type": "title",
      "caption": "ChatGPT ka 'T' kis cheez ka hai? Jawab chhupa hai 2017 ki ek 15-page PDF mein.",
      "tts": "ChatGPT का T किस चीज़ का है? जवाब छुपा है 2017 की एक पंद्रह पेज की PDF में।",
      "cite": "p.1 — arXiv:1706.03762 (15 pages)",
      "props": {
        "kicker": "UNPAPER #001",
        "lines": [
          "ChatGPT ka",
          "'T' ?"
        ],
        "prop": "props/prop_bot.png"
      },
      "audio": "ep001s/scene00.mp3",
      "seconds": 9.408
    },
    {
      "type": "pdfpage",
      "caption": "Paper ka naam: 'Attention Is All You Need'. Likha 8 researchers ne — Google Brain, Google Research aur University of Toronto se.",
      "tts": "Paper का नाम है, Attention Is All You Need. इसे आठ researchers ने लिखा, Google Brain, Google Research और University of Toronto से।",
      "cite": "p.1 — title and author list",
      "props": {
        "page": "ep001s/page1.png",
        "kicker": "The PDF",
        "lines": [
          "Attention Is",
          "All You Need"
        ],
        "note": "Vaswani et al. · 2017"
      },
      "audio": "ep001s/scene01.mp3",
      "seconds": 11.712
    },
    {
      "type": "train",
      "caption": "Usse pehle AI language ko RNN se padhta tha. Bilkul local train ki tarah: ek dabba, phir agla. Ek word, phir agla word.",
      "tts": "उससे पहले AI भाषा को RNN से पढ़ता था। बिल्कुल local train की तरह। एक डिब्बा, फिर अगला डिब्बा। एक word, फिर अगला word।",
      "cite": "p.2 — RNNs 'generate a sequence of hidden states'",
      "props": {
        "kicker": "Pehle: RNN",
        "lines": [
          "Ek ke baad ek"
        ],
        "words": [
          "Main",
          "kal",
          "Mumbai",
          "ja",
          "raha",
          "hoon"
        ],
        "prop": "props/prop_train.png"
      },
      "audio": "ep001s/scene02.mp3",
      "seconds": 13.392
    },
    {
      "type": "prop",
      "caption": "Problem? Ye kaam parallel ho hi nahi sakta tha. Lambe sentences pe training bahut slow ho jaati thi.",
      "tts": "Problem यह थी कि यह काम parallel हो ही नहीं सकता था। लंबे sentences पर training बहुत धीमी हो जाती थी।",
      "cite": "p.2 — 'inherently sequential nature precludes parallelization'",
      "props": {
        "kicker": "Problem",
        "lines": [
          "No parallel.",
          "Slow training."
        ],
        "prop": "props/prop_gpu.png",
        "strike": true
      },
      "audio": "ep001s/scene03.mp3",
      "seconds": 9.432
    },
    {
      "type": "flip",
      "caption": "Phir Transformer ne bola: train hatao. Recurrence nahi — sirf Attention.",
      "tts": "फिर Transformer ने कहा, यह train हटाओ। Recurrence नहीं, सिर्फ Attention।",
      "cite": "p.1 — 'based solely on attention mechanisms, dispensing with recurrence'",
      "props": {
        "kicker": "2017 ka twist",
        "lines": [
          "Sirf",
          "Attention"
        ],
        "from": "props/prop_train.png",
        "to": "props/prop_spotlight.png"
      },
      "audio": "ep001s/scene04.mp3",
      "seconds": 7.488
    },
    {
      "type": "attention",
      "caption": "Attention matlab: har word ek saath baaki sab words ko dekhta hai, aur decide karta hai kiski baat sabse zaroori hai.",
      "tts": "Attention का मतलब, हर word एक साथ बाकी सब words को देखता है, और तय करता है कि किसकी बात सबसे ज़रूरी है।",
      "cite": "p.2 — self-attention relates different positions of a single sequence",
      "props": {
        "kicker": "Self-Attention",
        "words": [
          "Main",
          "kal",
          "Mumbai",
          "ja",
          "raha",
          "hoon"
        ],
        "focus": 3,
        "targets": [
          1,
          2
        ],
        "label": "illustrative example"
      },
      "audio": "ep001s/scene05.mp3",
      "seconds": 10.128
    },
    {
      "type": "attention",
      "caption": "Jaise: 'Main kal Mumbai ja raha hoon.' Yahan 'ja' ka dhyaan 'Mumbai' aur 'kal' pe hai — kahan, aur kab.",
      "tts": "जैसे, मैं कल मुंबई जा रहा हूँ। यहाँ, जा का ध्यान, मुंबई और कल पर है। कहाँ, और कब।",
      "cite": "",
      "props": {
        "kicker": "Example",
        "words": [
          "Main",
          "kal",
          "Mumbai",
          "ja",
          "raha",
          "hoon"
        ],
        "focus": 3,
        "targets": [
          1,
          2
        ],
        "label": "illustrative example",
        "tags": {
          "1": "kab?",
          "2": "kahan?"
        }
      },
      "audio": "ep001s/scene06.mp3",
      "seconds": 9.768
    },
    {
      "type": "qkv",
      "caption": "Kaise? Har word teen cheezein banata hai: Query — main kya dhoondh raha hoon. Key — mere paas kya hai. Value — meri asli baat.",
      "tts": "कैसे? हर word तीन चीज़ें बनाता है। Query, यानी मैं क्या ढूंढ रहा हूँ। Key, यानी मेरे पास क्या है। और Value, यानी मेरी असली बात।",
      "cite": "p.4 — 'a query and a set of key-value pairs'",
      "props": {
        "kicker": "Query · Key · Value",
        "cards": [
          {
            "k": "Q",
            "t": "Kya dhoondh raha hoon?"
          },
          {
            "k": "K",
            "t": "Mere paas kya hai?"
          },
          {
            "k": "V",
            "t": "Meri asli baat"
          }
        ]
      },
      "audio": "ep001s/scene07.mp3",
      "seconds": 14.712
    },
    {
      "type": "counter",
      "caption": "Aur ek nahi — 8 attention heads ek saath. Jaise 8 dost ek hi movie ko alag-alag nazar se dekhein.",
      "tts": "और एक नहीं, आठ attention heads एक साथ। जैसे आठ दोस्त एक ही movie को अलग अलग नज़र से देखें।",
      "cite": "p.5 — 'we employ h = 8 parallel attention layers, or heads'",
      "props": {
        "kicker": "Multi-Head Attention",
        "value": 8,
        "suffix": " heads",
        "prop": "props/prop_spotlight.png",
        "count": 8
      },
      "audio": "ep001s/scene08.mp3",
      "seconds": 9.528
    },
    {
      "type": "prop",
      "caption": "Par sab words ek saath padhe, toh order kaise pata chale? Har word ko ek position ka tag milta hai — positional encoding.",
      "tts": "पर अगर सब words एक साथ पढ़े, तो order कैसे पता चले? इसके लिए हर word को एक position का tag मिलता है। इसे कहते हैं positional encoding।",
      "cite": "p.6 — 'we must inject some information about the relative or absolute position of the tokens'",
      "props": {
        "kicker": "Positional Encoding",
        "lines": [
          "Order ka",
          "tag"
        ],
        "prop": "props/prop_train.png",
        "tags": true
      },
      "audio": "ep001s/scene09.mp3",
      "seconds": 13.392
    },
    {
      "type": "pdfpage",
      "caption": "Andar ka design: encoder aur decoder, dono mein 6 layers. Encoder sentence samajhta hai, decoder naya sentence likhta hai.",
      "tts": "अंदर का design, encoder और decoder, दोनों में छह layers। Encoder sentence समझता है, decoder नया sentence लिखता है।",
      "cite": "p.3 — 'The encoder is composed of a stack of N = 6 identical layers'; Figure 1",
      "props": {
        "page": "ep001s/fig1.png",
        "kicker": "Figure 1",
        "lines": [
          "Encoder + Decoder",
          "6 layers each"
        ],
        "note": "Figure: Vaswani et al. 2017, p.3",
        "color": true
      },
      "audio": "ep001s/scene10.mp3",
      "seconds": 11.4
    },
    {
      "type": "counter",
      "caption": "Speed dekho: base model sirf 12 ghante mein train hua — 8 NVIDIA P100 GPUs wali ek machine pe.",
      "tts": "Speed देखो। Base model सिर्फ बारह घंटे में train हुआ, आठ NVIDIA P100 GPUs वाली एक machine पर।",
      "cite": "p.7 — 'one machine with 8 NVIDIA P100 GPUs ... 100,000 steps or 12 hours'",
      "props": {
        "kicker": "Training time",
        "value": 12,
        "suffix": " ghante",
        "prop": "props/prop_gpu.png",
        "count": 8,
        "sub": "8 × NVIDIA P100"
      },
      "audio": "ep001s/scene11.mp3",
      "seconds": 10.152
    },
    {
      "type": "stats",
      "caption": "Result? English→German translation mein 28.4 BLEU, aur English→French mein 41.8 — us waqt ka naya record.",
      "tts": "Result? English से German translation में अट्ठाईस point चार BLEU, और English से French में इकतालीस point आठ। उस वक्त का नया record।",
      "cite": "p.1 Abstract — 28.4 BLEU EN-DE; 41.8 BLEU EN-FR, new single-model state-of-the-art",
      "props": {
        "kicker": "WMT 2014 results",
        "prop": "props/prop_globe.png",
        "stats": [
          {
            "label": "EN → DE",
            "value": 28.4
          },
          {
            "label": "EN → FR",
            "value": 41.8
          }
        ],
        "unit": "BLEU"
      },
      "audio": "ep001s/scene12.mp3",
      "seconds": 11.904
    },
    {
      "type": "prop",
      "caption": "Aur training ka kharcha? Pehle ke best models ke mukable sirf ek chhota sa hissa.",
      "tts": "और training का खर्चा? पहले के best models के मुकाबले, सिर्फ एक छोटा सा हिस्सा।",
      "cite": "p.1 Abstract — 'a small fraction of the training costs of the best models'",
      "props": {
        "kicker": "Cost",
        "lines": [
          "Kam kharcha,",
          "zyada result"
        ],
        "prop": "props/prop_gpu.png"
      },
      "audio": "ep001s/scene13.mp3",
      "seconds": 7.656
    },
    {
      "type": "title",
      "caption": "Aaj GPT, Gemini, Claude — sab isi Transformer idea se nikle hain. GPT ka 'T' = Transformer.",
      "tts": "आज GPT, Gemini, Claude, सब इसी Transformer idea से निकले हैं। GPT का T, यानी Transformer।",
      "cite": "",
      "props": {
        "kicker": "Legacy",
        "lines": [
          "'T' =",
          "Transformer"
        ],
        "prop": "props/prop_stack.png"
      },
      "audio": "ep001s/scene14.mp3",
      "seconds": 11.088
    },
    {
      "type": "cta",
      "caption": "Ek 15-page PDF ne poori AI duniya badal di. Agla paper kaunsa kholein? Comment karo, aur Unpaper subscribe karo!",
      "tts": "एक पंद्रह पेज की PDF ने पूरी AI दुनिया बदल दी। अगला paper कौन सा खोलें? Comment करो, और Unpaper को subscribe करो।",
      "cite": "",
      "props": {
        "kicker": "Next paper?",
        "lines": [
          "Comment karo",
          "& Subscribe"
        ],
        "prop": "props/prop_paper.png"
      },
      "audio": "ep001s/scene15.mp3",
      "seconds": 11.688
    }
  ]
} as const;
