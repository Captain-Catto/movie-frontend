import axiosInstance from "@/lib/axios-instance";

type AnalyticsActionType = "view" | "click" | "play" | "complete";
type AnalyticsContentType = "movie" | "tv_series";

interface TrackEventParams {
  contentId: string;
  contentType: AnalyticsContentType;
  actionType: AnalyticsActionType;
  contentTitle?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

class AnalyticsService {
  private trackingMap = new Map<string, number>();
  private readonly DEBOUNCE_MS = 2000;

  async trackEvent(params: TrackEventParams): Promise<void> {
    const eventKey = `${params.contentId}-${params.actionType}`;
    const now = Date.now();
    const lastTracked = this.trackingMap.get(eventKey);

    if (lastTracked && now - lastTracked < this.DEBOUNCE_MS) {
      return;
    }

    try {
      this.trackingMap.set(eventKey, now);

      const payload = {
        contentId: params.contentId,
        contentType: params.contentType,
        actionType: params.actionType,
        contentTitle: params.contentTitle,
        duration: params.duration,
        metadata: params.metadata || {},
      };

      axiosInstance
        .post("/analytics/track", payload)
        .then(() => {
          // Event tracked
        })
        .catch((error) => {
          console.error("[Analytics] Failed to track event:", error);
        });

      this.cleanupTrackingMap();
    } catch (error) {
      console.error("[Analytics] Error in trackEvent:", error);
    }
  }

  private cleanupTrackingMap(): void {
    const now = Date.now();
    for (const [key, timestamp] of this.trackingMap.entries()) {
      if (now - timestamp > this.DEBOUNCE_MS) {
        this.trackingMap.delete(key);
      }
    }
  }

  trackView(
    contentId: string,
    contentType: AnalyticsContentType,
    contentTitle?: string
  ): void {
    this.trackEvent({
      contentId,
      contentType,
      actionType: "view",
      contentTitle,
    });
  }

  trackClick(
    contentId: string,
    contentType: AnalyticsContentType,
    contentTitle?: string
  ): void {
    this.trackEvent({
      contentId,
      contentType,
      actionType: "click",
      contentTitle,
    });
  }

  trackPlay(
    contentId: string,
    contentType: AnalyticsContentType,
    contentTitle?: string,
    metadata?: Record<string, unknown>
  ): void {
    this.trackEvent({
      contentId,
      contentType,
      actionType: "play",
      contentTitle,
      metadata,
    });
  }

  trackComplete(
    contentId: string,
    contentType: AnalyticsContentType,
    duration: number,
    contentTitle?: string
  ): void {
    this.trackEvent({
      contentId,
      contentType,
      actionType: "complete",
      contentTitle,
      duration,
    });
  }
}

export const analyticsService = new AnalyticsService();
