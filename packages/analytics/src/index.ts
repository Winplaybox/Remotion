export interface VideoMetrics {
  videoId: string;
  views: number;
  qualifiedViews: number;
  averagePercentageViewed: number;
  retentionAt30s: number;
}

export interface AnalyticsEngine {
  fetchMetrics(videoId: string): Promise<VideoMetrics>;
  calculateChannelRetention(): Promise<number>;
}
