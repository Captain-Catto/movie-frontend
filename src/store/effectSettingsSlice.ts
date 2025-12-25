import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { settingsApiService } from '@/services/settings-api';
import type { EffectType as ApiEffectType } from '@/services/settings-api';

export type EffectType = ApiEffectType;

export interface EffectSettings {
  enabled: boolean;
  activeEffects: EffectType[];
  intensity: 'low' | 'medium' | 'high';
}

interface EffectSettingsState extends EffectSettings {
  isLoading: boolean;
  error: string | null;
}

const initialState: EffectSettingsState = {
  enabled: false,
  activeEffects: [],
  intensity: 'medium',
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
} = effectSettingsSlice.actions;

export default effectSettingsSlice.reducer;
