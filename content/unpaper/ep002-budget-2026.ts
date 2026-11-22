// Unpaper DRAFT — "Budget Decoded": Budget 2026-27 speech, 3 lines nobody read.
// Script format (hook -> doc -> 3 points -> aap par asar -> CTA), ~54 s. NOT in the publish list yet: no narration mp3s.
// Every claim verified against the official PDF https://www.indiabudget.gov.in/doc/budget_speech.pdf
// (printed page numbers; PDF page = printed + 4). Highlight boxes come from `pdftotext -bbox-layout` of those pages.
// Page images: public/unpaper/ep002/{cover,p20,p21,p25}.jpg rendered from that PDF.
export const UNPAPER_EP002_DRAFT = {
  "id": "ep002-budget26",
  "series": "Budget Decoded",
  "title": "Budget 2026-27: 3 lines jo kisi ne nahi padhi | Foreign trip, ITR, F&O",
  "source": {
    "title": "Budget 2026-2027 — Speech of the Finance Minister",
    "url": "https://www.indiabudget.gov.in/doc/budget_speech.pdf",
    "date": "1 Feb 2026"
  },
  "script": {
    "hook": {
      "number": "20% → 2%",
      "line": "Foreign tour package par TCS",
      "caption": "Foreign tour package par TCS: 5% aur 20% se seedha 2%. Budget mein likha hai.",
      "tts": "Foreign tour package पर TCS, पाँच और बीस percent से सीधा दो percent. यह Budget में लिखा है.",
      "seconds": 4
    },
    "doc": {
      "name": "Budget Speech 2026-27",
      "issuer": "Finance Minister · Govt of India",
      "date": "1 Feb 2026",
      "image": "ep002/cover.jpg",
      "proof": { "source": "Budget Speech 2026-27", "page": "cover", "date": "1 Feb 2026" },
      "caption": "Document: Budget Speech 2026-27. Headline sab ne share ki — hum andar ke page kholte hain.",
      "tts": "Document है Budget Speech दो हज़ार छब्बीस सत्ताईस. Headline सब ने share की, हम अंदर के page खोलते हैं.",
      "seconds": 6
    },
    "points": [
      {
        "title": "Foreign tour TCS",
        "page": "ep002/p20.jpg",
        "box": [0.2239, 0.5501, 0.5615, 0.0502],
        "quote": "103. I propose to reduce TCS rate on the sale of overseas tour program package from the current 5 percent and 20 percent to 2 percent without any stipulation of amount.",
        "decoded": "Tour package TCS: 5% / 20% → 2%",
        "proof": { "source": "Budget Speech 2026-27", "page": "p.20 · para 103", "date": "1 Feb 2026" },
        "prop": "rupee",
        "caption": "Point 1: foreign tour package par TCS 5% aur 20% se ghat ke 2%. Booking par kam paisa atakega.",
        "tts": "पहला point. Foreign tour package पर TCS, पाँच और बीस percent से घटकर दो percent. Booking पर कम पैसा अटकेगा.",
        "seconds": 10
      },
      {
        "title": "ITR revise karne ka time",
        "page": "ep002/p21.jpg",
        "box": [0.1815, 0.2365, 0.5612, 0.0502],
        "quote": "108. I propose to extend time available for revising returns from 31st December to up to 31st March with the payment of a nominal fee.",
        "decoded": "Revised ITR: 31 Dec → 31 March",
        "proof": { "source": "Budget Speech 2026-27", "page": "p.21 · para 108", "date": "1 Feb 2026" },
        "prop": "gavel",
        "caption": "Point 2: ITR mein galti? Revise karne ka time 31 December se badh ke 31 March, bas ek nominal fee ke saath.",
        "tts": "दूसरा point. ITR में गलती? Revise करने का time इकतीस December से बढ़कर इकतीस March, बस एक nominal fee के साथ.",
        "seconds": 10
      },
      {
        "title": "F&O par STT",
        "page": "ep002/p25.jpg",
        "box": [0.1815, 0.5752, 0.5614, 0.0335],
        "quote": "140. I propose to raise the STT on Futures to 0.05 percent from present 0.02 percent.",
        "decoded": "Futures STT: 0.02% → 0.05%",
        "proof": { "source": "Budget Speech 2026-27", "page": "p.25 · para 140", "date": "1 Feb 2026" },
        "prop": "chart",
        "caption": "Point 3: F&O traders dhyaan do. Futures par STT 0.02% se 0.05%, aur options par 0.15%.",
        "tts": "तीसरा point. F and O traders ध्यान दो. Futures पर STT, zero point zero two से zero point zero five percent, और options पर zero point one five percent.",
        "seconds": 10
      }
    ],
    "asar": {
      "lines": ["Foreign trip: booking par kam cash block", "ITR galti: 31 March tak sudhaar", "F&O: har trade thoda mehnga"],
      "proof": { "source": "Budget Speech 2026-27", "page": "p.20, 21, 25", "date": "1 Feb 2026" },
      "caption": "Aap par asar: trip booking par kam cash block, ITR sudharne ka zyada time, par F&O trading mehngi.",
      "tts": "आप पर असर. Trip booking पर कम cash block, ITR सुधारने का ज़्यादा time, पर F and O trading महंगी.",
      "seconds": 7
    },
    "outro": {
      "caption": "Kaunsa document decode karein? Comment karo. Poora breakdown YouTube par, slides Instagram par.",
      "tts": "कौन सा document decode करें? Comment करो. पूरा breakdown YouTube पर, slides Instagram पर.",
      "seconds": 7
    }
  },
  "cta": {
    "comment": "1, 2 ya 3 — kaunsa pata tha?",
    "nextTeaser": "Agla decode: Income Tax Act, 2025 — kya badla?"
  }
} as const;
