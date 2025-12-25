'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  toggleEffects,
  toggleEffect,
  setIntensity,
  updateEffectSettings,
  EffectType,
} from '@/store/effectSettingsSlice';
import { Snowflake, Gift, Settings, Loader2 } from 'lucide-react';

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
  const { enabled, activeEffects, intensity, isLoading, error } = useSelector(
    (state: RootState) => state.effectSettings
  );
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      dispatch(updateEffectSettings({ enabled, activeEffects, intensity }));
    }, 1000); // Save after 1 second of no changes
  }, [dispatch, enabled, activeEffects, intensity]);

  // Auto-save when settings change (except on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    debouncedSave();

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [enabled, activeEffects, intensity, debouncedSave]);

  const handleToggleEffects = () => {
    dispatch(toggleEffects());
  };

  const handleToggleEffect = (effectType: EffectType) => {
    dispatch(toggleEffect(effectType));
  };

  const handleSetIntensity = (newIntensity: 'low' | 'medium' | 'high') => {
    dispatch(setIntensity(newIntensity));
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
