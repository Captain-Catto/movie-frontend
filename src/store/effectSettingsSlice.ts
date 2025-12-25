import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { settingsApiService } from '@/services/settings-api';
import type {
  EffectType as ApiEffectType,
  AdvancedEffectSettings as ApiAdvancedEffectSettings
} from '@/services/settings-api';

export type EffectType = ApiEffectType;
export type AdvancedEffectSettings = ApiAdvancedEffectSettings;

export interface EffectSettings {
  enabled: boolean;
  activeEffects: EffectType[];
  intensity: 'low' | 'medium' | 'high';
  advancedSettings?: AdvancedEffectSettings;
}

interface EffectSettingsState extends EffectSettings {
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_ADVANCED_SETTINGS: AdvancedEffectSettings = {
  fallSpeed: 0.8,
  rotationSpeed: 1.0,
  windStrength: 0.3,
  sparkleFrequency: 0.02,
};

const initialState: EffectSettingsState = {
  enabled: false,
  activeEffects: [],
  intensity: 'medium',
  advancedSettings: DEFAULT_ADVANCED_SETTINGS,
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

    setAdvancedSettings: (state, action: PayloadAction<Partial<AdvancedEffectSettings>>) => {
      state.advancedSettings = {
        ...DEFAULT_ADVANCED_SETTINGS,
        ...state.advancedSettings,
        ...action.payload,
      };
    },

    resetAdvancedSettings: (state) => {
      state.advancedSettings = DEFAULT_ADVANCED_SETTINGS;
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
        state.advancedSettings = {
          ...DEFAULT_ADVANCED_SETTINGS,
          ...action.payload.advancedSettings,
        };
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
        state.advancedSettings = {
          ...DEFAULT_ADVANCED_SETTINGS,
          ...action.payload.advancedSettings,
        };
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
  setAdvancedSettings,
  resetAdvancedSettings,
} = effectSettingsSlice.actions;

export default effectSettingsSlice.reducer;
