// Settings Types

import type { ApiResponse } from "./api";

export type EffectType = "snow" | "redEnvelope" | "fireworks" | "sakura";

export interface RedEnvelopeSettings {
  fallSpeed: number;
  rotationSpeed: number;
  windStrength: number;
  sparkleFrequency: number;
  quantity?: number;
}

export interface SnowSettings {
  speed: number;
  density: number;
  size: number;
  windStrength: number;
}

export interface EffectSettings {
  enabled: boolean;
  activeEffects: EffectType[];
  intensity: "low" | "medium" | "high";
  redEnvelopeSettings?: RedEnvelopeSettings;
  snowSettings?: SnowSettings;
  excludedPaths?: string[];
}

export type EffectSettingsResponse = ApiResponse<EffectSettings | undefined>;
