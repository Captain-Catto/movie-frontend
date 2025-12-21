import axiosInstance from "@/lib/axios-instance";

export type AnalyticsActionType = "view" | "click" | "play" | "complete";
export type AnalyticsContentType = "movie" | "tv_series";

interface TrackEventParams {
  contentId: string;
  contentType: AnalyticsContentType;
  actionType: AnalyticsActionType;
  contentTitle?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Analytics Service - Track user interactions
 */
class AnalyticsService {
  // Track events by unique key (contentId + actionType) to prevent true duplicates
  private trackingMap = new Map<string, number>();
  private readonly DEBOUNCE_MS = 2000; // 2 seconds debounce per unique event

  /**
   * Track an analytics event
   */
  async trackEvent(params: TrackEventParams): Promise<void> {
    // Create unique key for this event
    const eventKey = `${params.contentId}-${params.actionType}`;
    const now = Date.now();
    const lastTracked = this.trackingMap.get(eventKey);

    // Prevent duplicate tracking of same event within debounce period
    if (lastTracked && now - lastTracked < this.DEBOUNCE_MS) {
      console.log("[Analytics] Skipping duplicate event:", eventKey);
      return;
    }

    try {
      // Mark this event as tracked
      this.trackingMap.set(eventKey, now);

      const payload = {
        contentId: params.contentId,
        contentType: params.contentType,
        actionType: params.actionType,
        contentTitle: params.contentTitle,
        duration: params.duration,
        metadata: params.metadata || {},
      };

      console.log("[Analytics] Tracking event:", payload);

      // Send to backend (non-blocking, don't await)
      axiosInstance
        .post("/analytics/track", payload)
        .then((response) => {
          console.log("[Analytics] Event tracked successfully:", response.data);
        })
        .catch((error) => {
          console.error("[Analytics] Failed to track event:", error);
          console.error("[Analytics] Error details:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          });
        });

      // Clean up old entries from map (prevent memory leak)
      this.cleanupTrackingMap();
    } catch (error) {
      console.error("[Analytics] Error in trackEvent:", error);
    }
  }

  /**
   * Clean up old entries from tracking map
   */
  private cleanupTrackingMap(): void {
    const now = Date.now();
    for (const [key, timestamp] of this.trackingMap.entries()) {
      if (now - timestamp > this.DEBOUNCE_MS) {
        this.trackingMap.delete(key);
      }
    }
  }

  /**
   * Track VIEW event - when user views content detail page
   */
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

  /**
   * Track CLICK event - when user clicks on content card
   */
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

  /**
   * Track PLAY event - when user starts playing content
   */
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

  /**
   * Track COMPLETE event - when user finishes watching
   */
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

// Export singleton instance
export const analyticsService = new AnalyticsService();
