import * as fs from "fs";
import * as path from "path";
import { NarrationProvider } from "./index";

export interface MultiSpeakerTurn {
  speaker: string; // e.g. "Speaker 1" (Host) or "Speaker 2" (Analyst)
  voiceName: "Puck" | "Charon" | "Kore" | "Fenrir" | "Aoede";
  text: string;
}

export interface GoogleAIStudioTTSOptions {
  apiKey?: string;
  model?: string; // default: "gemini-2.0-flash"
  defaultVoice?: "Puck" | "Charon" | "Kore" | "Fenrir" | "Aoede";
  secondaryVoice?: "Puck" | "Charon" | "Kore" | "Fenrir" | "Aoede";
}

export class GoogleAIStudioTTS implements NarrationProvider {
  private apiKey: string;
  private model: string;
  private defaultVoice: string;
  private secondaryVoice: string;

  constructor(options: GoogleAIStudioTTSOptions = {}) {
    this.apiKey = options.apiKey || process.env.GEMINI_API_KEY || "";
    this.model = options.model || "gemini-2.0-flash";
    this.defaultVoice = options.defaultVoice || "Aoede"; // Clear, articulate female voice
    this.secondaryVoice = options.secondaryVoice || "Puck"; // Energetic, curious male voice
  }

  /**
   * Generates single-speaker or narrative voiceover using Gemini 2.0 Audio modality
   */
  async generate(input: {
    text: string;
    language: "hinglish";
    voiceId?: string;
    outputFormat: "wav" | "mp3";
    outputFilename?: string;
  }): Promise<{ audioPath: string; durationSeconds: number; provider: string }> {
    const filename = input.outputFilename || `tts-${Date.now()}.${input.outputFormat}`;
    const outputDir = path.resolve(process.cwd(), "assets", "audio", "generated");

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, filename);

    if (!this.apiKey) {
      console.warn("[GoogleAIStudioTTS] No GEMINI_API_KEY found. Generating local mock audio placeholder.");
      return this.generateMockPlaceholder(outputPath, input.text);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              {
                text: input.text,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: input.voiceId || this.defaultVoice,
              },
            },
          },
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[GoogleAIStudioTTS] API responded with ${response.status}: ${errorText}. Falling back to mock audio.`);
        return this.generateMockPlaceholder(outputPath, input.text);
      }

      const data = await response.json();
      const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;

      if (!inlineData || !inlineData.data) {
        throw new Error("No inline audio data returned from Google AI Studio.");
      }

      const audioBuffer = Buffer.from(inlineData.data, "base64");
      fs.writeFileSync(outputPath, audioBuffer);

      // Estimate duration based on PCM rate or file size
      const durationSeconds = Math.max(5, Math.round(input.text.split(" ").length / 2.6));
      console.log(`[GoogleAIStudioTTS] Generated speech audio at ${outputPath} (~${durationSeconds}s)`);

      return {
        audioPath: outputPath,
        durationSeconds,
        provider: "google-aistudio-gemini-2.0",
      };
    } catch (err) {
      console.error("[GoogleAIStudioTTS] Generation failed, falling back to mock:", err);
      return this.generateMockPlaceholder(outputPath, input.text);
    }
  }

  public getSecondaryVoice(): string {
    return this.secondaryVoice;
  }

  /**
   * Generates Multi-Speaker dialogue (e.g. Host Explainer + Curious Inquirer)
   */
  async generateMultiSpeaker(turns: MultiSpeakerTurn[], outputFilename?: string) {
    const combinedScript = turns
      .map((t) => `${t.speaker} (${t.voiceName || this.secondaryVoice}): ${t.text}`)
      .join("\n\n");

    const promptText = `
Read the following educational technical dialog naturally in Hinglish:
${combinedScript}
`.trim();

    return this.generate({
      text: promptText,
      language: "hinglish",
      outputFormat: "mp3",
      outputFilename,
    });
  }

  private generateMockPlaceholder(outputPath: string, text: string) {
    fs.writeFileSync(outputPath, Buffer.from("MOCK_AUDIO_PAYLOAD"));
    const wordCount = text.split(" ").length;
    const durationSeconds = Math.max(6, Math.round(wordCount / 2.5));
    return {
      audioPath: outputPath,
      durationSeconds,
      provider: "mock-fallback",
    };
  }
}
