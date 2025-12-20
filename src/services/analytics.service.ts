import axiosInstance from "@/lib/axios-instance";

export type AnalyticsActionType = "VIEW" | "CLICK" | "PLAY" | "COMPLETE";
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
  private isTracking = false;

  /**
   * Track an analytics event
   */
  async trackEvent(params: TrackEventParams): Promise<void> {
    // Prevent duplicate tracking
    if (this.isTracking) {
      console.log("[Analytics] Skipping duplicate tracking");
      return;
    }

    try {
      this.isTracking = true;

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
    } finally {
      // Reset tracking flag after a short delay
      setTimeout(() => {
        this.isTracking = false;
      }, 1000);
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
      actionType: "VIEW",
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
      actionType: "CLICK",
      contentTitle,
    });
  }

  /**
   * Track PLAY event - when user starts playing content
   */
  trackPlay(
    contentId: string,
    contentType: AnalyticsContentType,
    contentTitle?: string
  ): void {
    this.trackEvent({
      contentId,
      contentType,
      actionType: "PLAY",
      contentTitle,
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
      actionType: "COMPLETE",
      contentTitle,
      duration,
    });
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
