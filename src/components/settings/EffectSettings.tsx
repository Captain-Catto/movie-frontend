'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  toggleEffects,
  toggleEffect,
  updateEffectSettings,
  setRedEnvelopeSettings,
  resetRedEnvelopeSettings,
  setSnowSettings,
  resetSnowSettings,
  EffectType,
} from '@/store/effectSettingsSlice';
import { useToastRedux } from '@/hooks/useToastRedux';
import { Snowflake, Gift, Settings, Loader2, ChevronDown, RotateCcw, Sliders } from 'lucide-react';

const EFFECTS = [
  {
    type: 'snow' as EffectType,
    name: 'Snow',
    description: 'Snow effect for winter season',
    icon: Snowflake,
    color: 'text-blue-400',
  },
  {
    type: 'redEnvelope' as EffectType,
    name: 'Red Envelope',
    description: 'Red envelope effect for Lunar New Year',
    icon: Gift,
    color: 'text-red-400',
  },
];

export default function EffectSettings() {
  const dispatch = useDispatch<AppDispatch>();
  const { enabled, activeEffects, redEnvelopeSettings, snowSettings, isLoading, error } = useSelector(
    (state: RootState) => state.effectSettings
  );
  const { showSuccess, showError } = useToastRedux();
  const [isRedEnvelopeAdvancedOpen, setIsRedEnvelopeAdvancedOpen] = useState(false);
  const [isSnowAdvancedOpen, setIsSnowAdvancedOpen] = useState(false);

  const [initialSettings, setInitialSettings] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Snapshot on mount and after initial load from API
  useEffect(() => {
    // If loading just finished (was loading, now not loading) and haven't loaded once yet
    if (!isLoading && !hasLoadedOnce) {
      const snapshot = JSON.stringify({ enabled, activeEffects, redEnvelopeSettings, snowSettings });
      setInitialSettings(snapshot);
      setHasLoadedOnce(true);
      setIsDirty(false);
    }
  }, [isLoading, hasLoadedOnce, enabled, activeEffects, redEnvelopeSettings, snowSettings]);

  // Track changes
  useEffect(() => {
    if (!hasLoadedOnce) return; // Don't track until initial load is done
    const current = JSON.stringify({ enabled, activeEffects, redEnvelopeSettings, snowSettings });
    setIsDirty(current !== initialSettings);
  }, [enabled, activeEffects, redEnvelopeSettings, snowSettings, initialSettings, hasLoadedOnce]);

  const handleToggleEffects = () => {
    dispatch(toggleEffects());
  };

  const handleToggleEffect = (effectType: EffectType) => {
    dispatch(toggleEffect(effectType));
  };

  const handleRedEnvelopeSettingChange = (
    key: 'fallSpeed' | 'rotationSpeed' | 'windStrength' | 'sparkleFrequency',
    value: number
  ) => {
    dispatch(setRedEnvelopeSettings({ [key]: value }));
  };

  const handleResetRedEnvelopeSettings = () => {
    dispatch(resetRedEnvelopeSettings());
  };

  const handleSnowSettingChange = (
    key: 'speed' | 'density' | 'size' | 'windStrength',
    value: number
  ) => {
    dispatch(setSnowSettings({ [key]: value }));
  };

  const handleResetSnowSettings = () => {
    dispatch(resetSnowSettings());
  };

  const handleSaveSettings = async () => {
    try {
      await dispatch(updateEffectSettings({
        enabled, activeEffects, intensity: 'medium', redEnvelopeSettings, snowSettings
      })).unwrap();

      const newSnapshot = JSON.stringify({ enabled, activeEffects, redEnvelopeSettings, snowSettings });
      setInitialSettings(newSnapshot);
      setIsDirty(false);

      showSuccess('Saved', 'Effect settings have been updated');
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold text-white">Visual Effects</h2>
          {isLoading && (
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          )}
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enabled}
            onChange={handleToggleEffects}
            disabled={isLoading}
          />
          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
        </label>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Description */}
        <p className="text-gray-400 text-sm">
          Enable/disable special effects on screen. These effects will be displayed across all pages.
        </p>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/30 text-red-200 text-sm">
            ❌ {error}
          </div>
        )}

        {/* Effects List */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            Select Effects
          </h3>
          {EFFECTS.map((effect) => (
            <div
              key={effect.type}
              className={`p-4 rounded-lg border transition-all ${
                activeEffects.includes(effect.type) && enabled
                  ? 'bg-gray-700/50 border-gray-600'
                  : 'bg-gray-800/50 border-gray-700'
              }`}
            >
              <label className="flex items-center gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-600 text-red-600 focus:ring-red-600 focus:ring-offset-gray-800"
                  checked={activeEffects.includes(effect.type)}
                  onChange={() => handleToggleEffect(effect.type)}
                  disabled={!enabled}
                />
                <effect.icon className={`w-6 h-6 ${effect.color}`} />
                <div className="flex-1">
                  <div className="text-white font-medium">{effect.name}</div>
                  <div className="text-gray-400 text-sm">
                    {effect.description}
                  </div>
                </div>
              </label>
            </div>
          ))}
        </div>

        {/* Red Envelope Advanced Settings */}
        {enabled && activeEffects.includes('redEnvelope') && (
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <button
              onClick={() => setIsRedEnvelopeAdvancedOpen(!isRedEnvelopeAdvancedOpen)}
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-300 uppercase tracking-wide hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Advanced Settings - Red Envelope
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isRedEnvelopeAdvancedOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isRedEnvelopeAdvancedOpen && redEnvelopeSettings && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-400">
                    Fine-tune red envelope effect parameters
                  </p>
                  <button
                    onClick={handleResetRedEnvelopeSettings}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded border border-gray-600 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>

                {/* Fall Speed */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">Fall Speed</label>
                    <span className="text-xs text-gray-400 font-mono">
                      {redEnvelopeSettings.fallSpeed.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={redEnvelopeSettings.fallSpeed}
                    onChange={(e) =>
                      handleRedEnvelopeSettingChange('fallSpeed', parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Slow (0.1)</span>
                    <span>Fast (3.0)</span>
                  </div>
                </div>

                {/* Rotation Speed */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">Rotation Speed</label>
                    <span className="text-xs text-gray-400 font-mono">
                      {redEnvelopeSettings.rotationSpeed.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={redEnvelopeSettings.rotationSpeed}
                    onChange={(e) =>
                      handleRedEnvelopeSettingChange('rotationSpeed', parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Slow (0.1)</span>
                    <span>Fast (5.0)</span>
                  </div>
                </div>

                {/* Wind Strength */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">Wind Strength</label>
                    <span className="text-xs text-gray-400 font-mono">
                      {redEnvelopeSettings.windStrength.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={redEnvelopeSettings.windStrength}
                    onChange={(e) =>
                      handleRedEnvelopeSettingChange('windStrength', parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>No wind (0)</span>
                    <span>Strong (1.0)</span>
                  </div>
                </div>

                {/* Sparkle Frequency */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">Sparkle Frequency</label>
                    <span className="text-xs text-gray-400 font-mono">
                      {redEnvelopeSettings.sparkleFrequency.toFixed(3)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.1"
                    step="0.005"
                    value={redEnvelopeSettings.sparkleFrequency}
                    onChange={(e) =>
                      handleRedEnvelopeSettingChange('sparkleFrequency', parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Low (0)</span>
                    <span>High (0.1)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Snow Advanced Settings */}
        {enabled && activeEffects.includes('snow') && (
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <button
              onClick={() => setIsSnowAdvancedOpen(!isSnowAdvancedOpen)}
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-300 uppercase tracking-wide hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Advanced Settings - Snow
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isSnowAdvancedOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isSnowAdvancedOpen && snowSettings && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-400">
                    Fine-tune snow effect parameters
                  </p>
                  <button
                    onClick={handleResetSnowSettings}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded border border-gray-600 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>

                {/* Snow Speed */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">Fall Speed</label>
                    <span className="text-xs text-gray-400 font-mono">
                      {snowSettings.speed.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={snowSettings.speed}
                    onChange={(e) =>
                      handleSnowSettingChange('speed', parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Slow (0.1)</span>
                    <span>Fast (3.0)</span>
                  </div>
                </div>

                {/* Snow Density */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">Snow Density</label>
                    <span className="text-xs text-gray-400 font-mono">
                      {snowSettings.density.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={snowSettings.density}
                    onChange={(e) =>
                      handleSnowSettingChange('density', parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Sparse (0.5)</span>
                    <span>Dense (2.0)</span>
                  </div>
                </div>

                {/* Snow Size */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">Size</label>
                    <span className="text-xs text-gray-400 font-mono">
                      {snowSettings.size.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={snowSettings.size}
                    onChange={(e) =>
                      handleSnowSettingChange('size', parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Small (0.5)</span>
                    <span>Large (3.0)</span>
                  </div>
                </div>

                {/* Wind Strength */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">Wind Strength</label>
                    <span className="text-xs text-gray-400 font-mono">
                      {snowSettings.windStrength.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={snowSettings.windStrength}
                    onChange={(e) =>
                      handleSnowSettingChange('windStrength', parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>No wind (0)</span>
                    <span>Strong (1.0)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        {enabled && activeEffects.length === 0 && (
          <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30 text-blue-200 text-sm">
            💡 Select at least one effect to start
          </div>
        )}

        {/* Save Changes Section */}
        <div className="pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {isDirty ? '⚠️ Unsaved changes' : '✓ All changes saved'}
            </p>
            <button
              onClick={handleSaveSettings}
              disabled={!isDirty || isLoading}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isDirty && !isLoading
                  ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
