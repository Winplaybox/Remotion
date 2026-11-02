import { ResearchUseCase } from "./types";

export const DARTMOUTH_DOSSIER_USE_CASE: ResearchUseCase = {
  id: "dartmouth-dossier",
  title: "The 1956 Dartmouth AI Conference Dossier",
  category: "Historical Declassified AI Archive",
  citation: {
    source: "McCarthy, Minsky, Shannon 1955",
    claimRef: "Dartmouth Archive • Box 14, Item 2",
    paperTitle: "A Proposal for the Dartmouth Summer Research Project on Artificial Intelligence",
    year: 1955,
  },
  hook: {
    title: "WHERE THE TERM 'AI' WAS BORN",
    subtitle: "Historical Evidence • Declassified Dossier",
    accentWord: "BORN",
    badge: "1956 Origin File",
    headline: "A $7,500 grant created the modern world.",
    body: "John McCarthy ne 1955 mein Rockefeller Foundation ko ek 17-page typewritten proposal bheja jisme pehli baar 'Artificial Intelligence' phrase invent hua.",
    metrics: [
      { label: "Original Budget", value: "$7,500" },
      { label: "Duration", value: "2 Months" },
    ],
  },
  diagram: {
    title: "DECLASSIFIED LIGHT TABLE • PROPOSAL 1955",
    badge: "ARCHIVE DOSSIER • TYPEWRITTEN",
    sublabel: "Original Signature of Claude Shannon, Marvin Minsky & John McCarthy",
    diagramType: "archive",
  },
  takeaway: {
    title: "SEVENTY YEARS LATER",
    subtitle: "From a Summer Seminar to Trillion-Dollar Frontier",
    accentWord: "SEVENTY",
    badge: "Historical Reality",
    headline: "The fundamental dream has not changed.",
    body: "Jo vision un 10 logo ne us garmi ke do mahino mein blackboard par banaya tha, aaj wahi maths 100,000 GPUs ke superclusters par run ho rahi hai.",
    metrics: [
      { label: "Attendees", value: "10 Pioneers" },
      { label: "Current Market", value: "$1.3 Trillion" },
    ],
  },
  timeline: {
    totalDurationInFrames: 300,
    fps: 30,
    sections: [
      {
        id: "hook-dar",
        startFrame: 0,
        durationInFrames: 90,
        speaker: "Aoede",
        subtitleText: "70 saal pehle, 'Artificial Intelligence' jaisa koi word exist hi nahi karta tha. Ye sab ek 7500 dollar ke funding proposal se shuru hua.",
      },
      {
        id: "question-dar",
        startFrame: 90,
        durationInFrames: 55,
        speaker: "Puck",
        subtitleText: "Wait! Sirf das scientists ne mil kar poori AI industry ki foundation rakh di?",
      },
      {
        id: "archive-dar",
        startFrame: 145,
        durationInFrames: 55,
        speaker: "Aoede",
        subtitleText: "Dartmouth 1956! John McCarthy, Marvin Minsky aur Claude Shannon ne claim kiya ki machine thinking har aspect ko mathematically describe kiya ja sakta hai.",
      },
      {
        id: "outro-dar",
        startFrame: 200,
        durationInFrames: 100,
        speaker: "Aoede",
        subtitleText: "Us typewritten paper se aaj ke neural networks tak—humanity ka sabse bada intellectual adventure wahi se shuru hua tha.",
      },
    ],
  },
  recommendedStyle: "archive-lighttable",
};
