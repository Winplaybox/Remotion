import { ResearchUseCase } from "./types";

export const CLAUDE_CODE_AGENT_USE_CASE: ResearchUseCase = {
  id: "claude-code-agent",
  title: "Living Screencast: Autonomous Codebase Evolution",
  category: "Agentic Systems & Software Engineering",
  citation: {
    source: "Anthropic Research 2024",
    claimRef: "Autonomous Software Engineering • arXiv:2410.02115",
    paperTitle: "Evaluating Language Model Agents on Realistic Software Engineering Benchmarks",
    year: 2024,
  },
  hook: {
    title: "THE TERMINAL REPLACES THE IDE",
    subtitle: "Living Screencast • Autonomous Agents",
    accentWord: "TERMINAL",
    badge: "SWE-bench Leaderboard",
    headline: "AI is navigating 100,000-line repositories autonomously.",
    body: "Bash tools, AST parsing, aur deterministic subagent spawning se modern AI bina human help ke bugs reproduce karke green tests deliver kar raha hai.",
    metrics: [
      { label: "SWE-bench Verified", value: "65.2%" },
      { label: "Human Edits", value: "0 Lines" },
    ],
  },
  diagram: {
    title: "LIVE CLI SESSION • AST PARSER & TEST LOOP",
    badge: "BASH TERMINAL • SUBAGENT EXEC",
    sublabel: "git diff → pytest execution → AST symbol patch → git commit",
    diagramType: "terminal",
  },
  takeaway: {
    title: "THE SOFTWARE FACTORY",
    subtitle: "Deterministic Tool Use & Sandboxes",
    accentWord: "FACTORY",
    badge: "Productivity Law",
    headline: "Engineers are becoming directors.",
    body: "Code likhne ka zamana khatam ho raha hai. Engineer ka naya kaam hai architecture, safety boundaries, aur continuous test assertions verify karna.",
    metrics: [
      { label: "Bugfix Speed", value: "14x Faster" },
      { label: "Cost Per Issue", value: "$1.40" },
    ],
  },
  timeline: {
    totalDurationInFrames: 300,
    fps: 30,
    sections: [
      {
        id: "hook-agent",
        startFrame: 0,
        durationInFrames: 90,
        speaker: "Aoede",
        subtitleText: "Aap abhi bhi code manually likh rahe ho? 2026 mein software engineering ka tareeqa hamesha ke liye badal chuka hai.",
      },
      {
        id: "question-agent",
        startFrame: 90,
        durationInFrames: 55,
        speaker: "Puck",
        subtitleText: "Wait! AI code suggest karta hai, par complex git repos mein khud run karke fix kaise karta hai?",
      },
      {
        id: "term-agent",
        startFrame: 145,
        durationInFrames: 55,
        speaker: "Aoede",
        subtitleText: "Terminal tools! Agent repo scan karta hai, tests run karta hai, failures inspect karta hai, aur tab tak loop chalata hai jab tak tests pass na ho jayein.",
      },
      {
        id: "outro-agent",
        startFrame: 200,
        durationInFrames: 100,
        speaker: "Aoede",
        subtitleText: "Do dollar mein wo bug solve ho jata hai jisme senior engineer ko do din lagte the. Software is now automated.",
      },
    ],
  },
  recommendedStyle: "living-screencast",
};
