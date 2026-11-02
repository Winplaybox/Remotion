import { Storyboard, VideoScript } from "../../../schemas";

export interface StoryboardEngine {
  generateStoryboard(script: VideoScript): Promise<Storyboard>;
  validateTiming(storyboard: Storyboard): boolean;
}
