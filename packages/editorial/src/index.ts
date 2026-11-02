import { VideoScript, TopicCandidate } from "../../../schemas";

export interface EditorialEngine {
  scoreTopics(candidates: TopicCandidate[]): Promise<TopicCandidate[]>;
  generateHinglishScript(topic: TopicCandidate): Promise<VideoScript>;
}
