export interface NarrationProvider {
  generate(input: {
    text: string;
    language: "hinglish";
    voiceId?: string;
    outputFormat: "wav" | "mp3";
  }): Promise<{
    audioPath: string;
    durationSeconds: number;
    provider: string;
  }>;
}

export class MockNarrationProvider implements NarrationProvider {
  async generate(input: {
    text: string;
    language: "hinglish";
    voiceId?: string;
    outputFormat: "wav" | "mp3";
  }) {
    return {
      audioPath: "assets/audio/placeholder.mp3",
      durationSeconds: Math.max(10, Math.round(input.text.split(" ").length / 2.5)),
      provider: "mock",
    };
  }
}

export * from "./google-aistudio-tts";

