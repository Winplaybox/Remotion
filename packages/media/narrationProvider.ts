/**
 * NarrationProvider — vendor-agnostic TTS interface.
 * CLAUDE.md requires: never hardcode a TTS vendor, file-import support first.
 */

export interface NarrationRequest {
  text: string;
  voiceId: string;
  outputPath: string;
}

export interface NarrationResult {
  audioPath: string;
  durationSeconds: number;
}

export interface NarrationProvider {
  synthesize(request: NarrationRequest): Promise<NarrationResult>;
}

/**
 * File-import provider — reads a pre-rendered audio file (e.g. produced by
 * automation/generate-narration.py via edge-tts). Used until a live provider
 * is approved for voice quality.
 */
export class FileImportNarrationProvider implements NarrationProvider {
  async synthesize(request: NarrationRequest): Promise<NarrationResult> {
    const fs = await import("fs");
    const { execSync } = await import("child_process");

    if (!fs.existsSync(request.outputPath)) {
      throw new Error(
        `Narration file not found at ${request.outputPath}. Run: python automation/generate-narration.py first.`,
      );
    }

    const probeOutput = execSync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${request.outputPath}"`,
      { encoding: "utf8" },
    ).trim();

    return {
      audioPath: request.outputPath,
      durationSeconds: parseFloat(probeOutput),
    };
  }
}
