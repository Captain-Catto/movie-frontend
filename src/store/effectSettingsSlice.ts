import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { settingsApiService } from '@/services/settings-api';
import type {
  EffectType as ApiEffectType,
  RedEnvelopeSettings as ApiRedEnvelopeSettings,
  SnowSettings as ApiSnowSettings
} from '@/services/settings-api';

export type EffectType = ApiEffectType;
export type RedEnvelopeSettings = ApiRedEnvelopeSettings;
export type SnowSettings = ApiSnowSettings;

export interface EffectSettings {
  enabled: boolean;
  activeEffects: EffectType[];
  intensity: 'low' | 'medium' | 'high';
  redEnvelopeSettings?: RedEnvelopeSettings;
  snowSettings?: SnowSettings;
  excludedPaths?: string[];
}

interface EffectSettingsState extends EffectSettings {
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_RED_ENVELOPE_SETTINGS: RedEnvelopeSettings = {
  fallSpeed: 0.3,
  rotationSpeed: 1.0,
  windStrength: 0.3,
  sparkleFrequency: 0.02,
  quantity: 25,
};

const DEFAULT_SNOW_SETTINGS: SnowSettings = {
  speed: 1.0,
  density: 1.0,
  size: 1.0,
  windStrength: 0.2,
};

const initialState: EffectSettingsState = {
  enabled: false,
  activeEffects: [],
  intensity: 'medium',
  redEnvelopeSettings: DEFAULT_RED_ENVELOPE_SETTINGS,
  snowSettings: DEFAULT_SNOW_SETTINGS,
  excludedPaths: [],
  isLoading: false,
  error: null,
};

// Async thunk to fetch effect settings from API
export const fetchEffectSettings = createAsyncThunk(
  'effectSettings/fetch',
  async () => {
    const response = await settingsApiService.getEffectSettings();
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch effect settings');
  }
);

// Async thunk to update effect settings via API (admin only)
export const updateEffectSettings = createAsyncThunk(
  'effectSettings/update',
  async (settings: EffectSettings) => {
    const response = await settingsApiService.updateEffectSettings(settings);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to update effect settings');
  }
);

const effectSettingsSlice = createSlice({
  name: 'effectSettings',
  initialState,
  reducers: {
    // Local reducers (changes not persisted to API automatically)
    toggleEffects: (state) => {
      state.enabled = !state.enabled;
    },

    setEffectEnabled: (state, action: PayloadAction<boolean>) => {
      state.enabled = action.payload;
    },

    toggleEffect: (state, action: PayloadAction<EffectType>) => {
      const effect = action.payload;
      const index = state.activeEffects.indexOf(effect);

      if (index > -1) {
        state.activeEffects.splice(index, 1);
      } else {
        state.activeEffects.push(effect);
      }
    },

    setActiveEffects: (state, action: PayloadAction<EffectType[]>) => {
      state.activeEffects = action.payload;
    },

    setIntensity: (state, action: PayloadAction<'low' | 'medium' | 'high'>) => {
      state.intensity = action.payload;
    },

    clearAllEffects: (state) => {
      state.activeEffects = [];
    },

    setRedEnvelopeSettings: (state, action: PayloadAction<Partial<RedEnvelopeSettings>>) => {
      state.redEnvelopeSettings = {
        ...DEFAULT_RED_ENVELOPE_SETTINGS,
        ...state.redEnvelopeSettings,
        ...action.payload,
      };
    },

    resetRedEnvelopeSettings: (state) => {
      state.redEnvelopeSettings = DEFAULT_RED_ENVELOPE_SETTINGS;
    },

    setSnowSettings: (state, action: PayloadAction<Partial<SnowSettings>>) => {
      state.snowSettings = {
        ...DEFAULT_SNOW_SETTINGS,
        ...state.snowSettings,
        ...action.payload,
      };
    },

    resetSnowSettings: (state) => {
      state.snowSettings = DEFAULT_SNOW_SETTINGS;
    },

    setExcludedPaths: (state, action: PayloadAction<string[]>) => {
      state.excludedPaths = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch settings
      .addCase(fetchEffectSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEffectSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enabled = action.payload.enabled;
        state.activeEffects = action.payload.activeEffects;
        state.intensity = action.payload.intensity;
        state.redEnvelopeSettings = {
          ...DEFAULT_RED_ENVELOPE_SETTINGS,
          ...action.payload.redEnvelopeSettings,
        };
        state.snowSettings = {
          ...DEFAULT_SNOW_SETTINGS,
          ...action.payload.snowSettings,
        };
        state.excludedPaths = action.payload.excludedPaths || [];
      })
      .addCase(fetchEffectSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch settings';
      })
      // Update settings
      .addCase(updateEffectSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEffectSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enabled = action.payload.enabled;
        state.activeEffects = action.payload.activeEffects;
        state.intensity = action.payload.intensity;
        state.redEnvelopeSettings = {
          ...DEFAULT_RED_ENVELOPE_SETTINGS,
          ...action.payload.redEnvelopeSettings,
        };
        state.snowSettings = {
          ...DEFAULT_SNOW_SETTINGS,
          ...action.payload.snowSettings,
        };
        state.excludedPaths = action.payload.excludedPaths || [];
      })
      .addCase(updateEffectSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update settings';
      });
  },
});

export const {
  toggleEffects,
  setEffectEnabled,
  toggleEffect,
  setActiveEffects,
  setIntensity,
  clearAllEffects,
  setRedEnvelopeSettings,
  resetRedEnvelopeSettings,
  setSnowSettings,
  resetSnowSettings,
  setExcludedPaths,
} = effectSettingsSlice.actions;

export default effectSettingsSlice.reducer;
