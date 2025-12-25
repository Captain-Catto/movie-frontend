'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  toggleEffects,
  toggleEffect,
  setIntensity,
  updateEffectSettings,
  setAdvancedSettings,
  resetAdvancedSettings,
  EffectType,
} from '@/store/effectSettingsSlice';
import { Snowflake, Gift, Settings, Loader2, ChevronDown, RotateCcw, Sliders } from 'lucide-react';

const EFFECTS = [
  {
    type: 'snow' as EffectType,
    name: 'Tuyết Rơi',
    description: 'Hiệu ứng tuyết rơi cho mùa đông',
    icon: Snowflake,
    color: 'text-blue-400',
  },
  {
    type: 'redEnvelope' as EffectType,
    name: 'Phong Bao Lì Xì',
    description: 'Hiệu ứng phong bao lì xì cho Tết',
    icon: Gift,
    color: 'text-red-400',
  },
];

export default function EffectSettings() {
  const dispatch = useDispatch<AppDispatch>();
  const { enabled, activeEffects, intensity, advancedSettings, isLoading, error } = useSelector(
    (state: RootState) => state.effectSettings
  );
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Track last saved values to prevent infinite loop
  const lastSavedRef = useRef<string>('');

  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const currentValues = JSON.stringify({ enabled, activeEffects, intensity, advancedSettings });

      // Only save if values actually changed from last save
      if (currentValues !== lastSavedRef.current) {
        lastSavedRef.current = currentValues;
        dispatch(updateEffectSettings({ enabled, activeEffects, intensity, advancedSettings }));
      }
    }, 1000); // Save after 1 second of no changes
  }, [dispatch, enabled, activeEffects, intensity, advancedSettings]);

  // Auto-save when settings change (except on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Store initial values
      lastSavedRef.current = JSON.stringify({ enabled, activeEffects, intensity, advancedSettings });
      return;
    }

    debouncedSave();

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [enabled, activeEffects, intensity, advancedSettings, debouncedSave]);

  const handleToggleEffects = () => {
    dispatch(toggleEffects());
  };

  const handleToggleEffect = (effectType: EffectType) => {
    dispatch(toggleEffect(effectType));
  };

  const handleSetIntensity = (newIntensity: 'low' | 'medium' | 'high') => {
    dispatch(setIntensity(newIntensity));
  };

  const handleAdvancedSettingChange = (
    key: 'fallSpeed' | 'rotationSpeed' | 'windStrength' | 'sparkleFrequency',
    value: number
  ) => {
    dispatch(setAdvancedSettings({ [key]: value }));
  };

  const handleResetAdvancedSettings = () => {
    dispatch(resetAdvancedSettings());
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold text-white">Hiệu Ứng Màn Hình</h2>
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
          Bật/tắt các hiệu ứng đặc biệt trên màn hình. Các hiệu ứng này sẽ được
          hiển thị ở tất cả các trang.
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
            Chọn Hiệu Ứng
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

        {/* Intensity Settings */}
        {enabled && activeEffects.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
              Mức Độ Hiệu Ứng
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => handleSetIntensity(level)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    intensity === level
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {level === 'low' && 'Nhẹ'}
                  {level === 'medium' && 'Vừa'}
                  {level === 'high' && 'Mạnh'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Settings */}
        {enabled && activeEffects.includes('redEnvelope') && (
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-300 uppercase tracking-wide hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Cài Đặt Nâng Cao
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isAdvancedOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isAdvancedOpen && advancedSettings && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-400">
                    Điều chỉnh chi tiết hiệu ứng phong bao lì xì
                  </p>
                  <button
                    onClick={handleResetAdvancedSettings}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded border border-gray-600 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>

                {/* Fall Speed */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">Tốc Độ Rơi</label>
                    <span className="text-xs text-gray-400 font-mono">
                      {advancedSettings.fallSpeed.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={advancedSettings.fallSpeed}
                    onChange={(e) =>
                      handleAdvancedSettingChange('fallSpeed', parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Chậm (0.1)</span>
                    <span>Nhanh (3.0)</span>
                  </div>
                </div>

                {/* Rotation Speed */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">Tốc Độ Xoay</label>
                    <span className="text-xs text-gray-400 font-mono">
                      {advancedSettings.rotationSpeed.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={advancedSettings.rotationSpeed}
                    onChange={(e) =>
                      handleAdvancedSettingChange('rotationSpeed', parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Chậm (0.1)</span>
                    <span>Nhanh (5.0)</span>
                  </div>
                </div>

                {/* Wind Strength */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">Độ Mạnh Gió</label>
                    <span className="text-xs text-gray-400 font-mono">
                      {advancedSettings.windStrength.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={advancedSettings.windStrength}
                    onChange={(e) =>
                      handleAdvancedSettingChange('windStrength', parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Không gió (0)</span>
                    <span>Gió mạnh (1.0)</span>
                  </div>
                </div>

                {/* Sparkle Frequency */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">Tần Suất Lấp Lánh</label>
                    <span className="text-xs text-gray-400 font-mono">
                      {advancedSettings.sparkleFrequency.toFixed(3)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.1"
                    step="0.005"
                    value={advancedSettings.sparkleFrequency}
                    onChange={(e) =>
                      handleAdvancedSettingChange('sparkleFrequency', parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Ít (0)</span>
                    <span>Nhiều (0.1)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        {enabled && activeEffects.length === 0 && (
          <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30 text-blue-200 text-sm">
            💡 Chọn ít nhất một hiệu ứng để bắt đầu
          </div>
        )}
      </div>
    </div>
  );
}
