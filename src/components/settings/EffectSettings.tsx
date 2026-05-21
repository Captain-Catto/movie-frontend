'use client';

import { useEffect, useId, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  toggleEffects,
  toggleEffect,
  updateEffectSettings,
  fetchEffectSettings,
  setRedEnvelopeSettings,
  resetRedEnvelopeSettings,
  setSnowSettings,
  resetSnowSettings,
  setExcludedPaths,
  EffectType,
} from '@/store/effectSettingsSlice';
import { useToastRedux } from '@/hooks/useToastRedux';
import { Snowflake, Gift, ChevronDown, RotateCcw, Plus, Trash2, Loader2 } from 'lucide-react';

type EffectConfig = {
  type: EffectType;
  name: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
  ringColor: string;
};

const EFFECTS: EffectConfig[] = [
  {
    type: 'snow',
    name: 'Snow',
    description: 'Snow effect for winter season',
    icon: Snowflake,
    gradient: 'from-blue-900/40 to-blue-800/20',
    iconColor: 'text-blue-400',
    ringColor: 'ring-blue-500/30',
  },
  {
    type: 'redEnvelope',
    name: 'Red Envelope',
    description: 'Red envelope effect for Lunar New Year',
    icon: Gift,
    gradient: 'from-red-900/40 to-red-800/20',
    iconColor: 'text-red-400',
    ringColor: 'ring-red-500/30',
  },
];

function Toggle({
  checked,
  onChange,
  disabled,
  color = 'red',
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  color?: 'red' | 'blue';
}) {
  const inputId = useId();
  const checkedColor = color === 'blue' ? 'peer-checked:bg-blue-500' : 'peer-checked:bg-red-600';
  const ringColor = color === 'blue' ? 'peer-focus:ring-blue-800' : 'peer-focus:ring-red-800';
  return (
    <label htmlFor={inputId} className="relative inline-flex items-center cursor-pointer flex-shrink-0">
      <span className="sr-only">Toggle visual effect</span>
      <input
        id={inputId}
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <div
        className={`w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 ${ringColor} rounded-full peer ${checkedColor} after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white disabled:opacity-40 disabled:cursor-not-allowed`}
      />
    </label>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  displayValue,
  minLabel,
  maxLabel,
  color = 'red',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  displayValue: string;
  minLabel: string;
  maxLabel: string;
  color?: 'red' | 'blue';
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="text-xs font-mono text-gray-400 bg-gray-700 px-2 py-0.5 rounded">
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer ${color === 'blue' ? 'accent-blue-500' : 'accent-red-600'}`}
      />
      <div className="flex justify-between text-xs text-gray-600">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

function SnowAdvanced({
  snowSettings,
  onChange,
  onReset,
}: {
  snowSettings: RootState['effectSettings']['snowSettings'];
  onChange: (key: 'speed' | 'density' | 'size' | 'windStrength', value: number) => void;
  onReset: () => void;
}) {
  if (!snowSettings) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Fine-tune snow parameters</span>
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded border border-gray-600 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>
      <Slider label="Fall Speed" value={snowSettings.speed} min={0.1} max={3} step={0.1}
        onChange={(v) => onChange('speed', v)} displayValue={snowSettings.speed.toFixed(1)}
        minLabel="Slow (0.1)" maxLabel="Fast (3.0)" color="blue" />
      <Slider label="Density" value={snowSettings.density} min={0.5} max={2} step={0.1}
        onChange={(v) => onChange('density', v)} displayValue={snowSettings.density.toFixed(1)}
        minLabel="Sparse (0.5)" maxLabel="Dense (2.0)" color="blue" />
      <Slider label="Size" value={snowSettings.size} min={0.5} max={3} step={0.1}
        onChange={(v) => onChange('size', v)} displayValue={snowSettings.size.toFixed(1)}
        minLabel="Small (0.5)" maxLabel="Large (3.0)" color="blue" />
      <Slider label="Wind Strength" value={snowSettings.windStrength} min={0} max={1} step={0.05}
        onChange={(v) => onChange('windStrength', v)} displayValue={snowSettings.windStrength.toFixed(2)}
        minLabel="Calm (0)" maxLabel="Strong (1.0)" color="blue" />
    </div>
  );
}

function RedEnvelopeAdvanced({
  redEnvelopeSettings,
  onChange,
  onReset,
  dispatch,
}: {
  redEnvelopeSettings: RootState['effectSettings']['redEnvelopeSettings'];
  onChange: (key: 'fallSpeed' | 'rotationSpeed' | 'windStrength' | 'sparkleFrequency', value: number) => void;
  onReset: () => void;
  dispatch: AppDispatch;
}) {
  if (!redEnvelopeSettings) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Fine-tune red envelope parameters</span>
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded border border-gray-600 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>
      <Slider label="Quantity" value={redEnvelopeSettings.quantity || 25} min={1} max={100} step={1}
        onChange={(v) => dispatch(setRedEnvelopeSettings({ quantity: Math.round(v) }))}
        displayValue={String(redEnvelopeSettings.quantity || 25)}
        minLabel="Few (1)" maxLabel="Many (100)" />
      <Slider label="Fall Speed" value={redEnvelopeSettings.fallSpeed} min={0.1} max={3} step={0.1}
        onChange={(v) => onChange('fallSpeed', v)} displayValue={redEnvelopeSettings.fallSpeed.toFixed(1)}
        minLabel="Slow (0.1)" maxLabel="Fast (3.0)" />
      <Slider label="Rotation Speed" value={redEnvelopeSettings.rotationSpeed} min={0.1} max={5} step={0.1}
        onChange={(v) => onChange('rotationSpeed', v)} displayValue={redEnvelopeSettings.rotationSpeed.toFixed(1)}
        minLabel="Slow (0.1)" maxLabel="Fast (5.0)" />
      <Slider label="Wind Strength" value={redEnvelopeSettings.windStrength} min={0} max={1} step={0.05}
        onChange={(v) => onChange('windStrength', v)} displayValue={redEnvelopeSettings.windStrength.toFixed(2)}
        minLabel="Calm (0)" maxLabel="Strong (1.0)" />
      <Slider label="Sparkle Frequency" value={redEnvelopeSettings.sparkleFrequency} min={0} max={0.1} step={0.005}
        onChange={(v) => onChange('sparkleFrequency', v)} displayValue={redEnvelopeSettings.sparkleFrequency.toFixed(3)}
        minLabel="Low (0)" maxLabel="High (0.1)" />
    </div>
  );
}

export default function EffectSettings() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    enabled,
    activeEffects,
    redEnvelopeSettings,
    snowSettings,
    excludedPaths,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.effectSettings);
  const { showSuccess, showError } = useToastRedux();

  const [expandedEffect, setExpandedEffect] = useState<EffectType | null>(null);
  const [newExcludedPath, setNewExcludedPath] = useState('');
  const [initialSettings, setInitialSettings] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    dispatch(fetchEffectSettings());
  }, [dispatch]);

  useEffect(() => {
    if (!isLoading && !hasLoadedOnce) {
      const snapshot = JSON.stringify({ enabled, activeEffects, redEnvelopeSettings, snowSettings, excludedPaths });
      setInitialSettings(snapshot);
      setHasLoadedOnce(true);
      setIsDirty(false);
    }
  }, [isLoading, hasLoadedOnce, enabled, activeEffects, redEnvelopeSettings, snowSettings, excludedPaths]);

  useEffect(() => {
    if (!hasLoadedOnce) return;
    const current = JSON.stringify({ enabled, activeEffects, redEnvelopeSettings, snowSettings, excludedPaths });
    setIsDirty(current !== initialSettings);
  }, [enabled, activeEffects, redEnvelopeSettings, snowSettings, excludedPaths, initialSettings, hasLoadedOnce]);

  const handleSaveSettings = async () => {
    try {
      await dispatch(updateEffectSettings({
        enabled, activeEffects, intensity: 'medium', redEnvelopeSettings, snowSettings, excludedPaths,
      })).unwrap();
      const newSnapshot = JSON.stringify({ enabled, activeEffects, redEnvelopeSettings, snowSettings, excludedPaths });
      setInitialSettings(newSnapshot);
      setIsDirty(false);
      showSuccess('Saved', 'Effect settings have been updated');
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  const handleAddExcludedPath = () => {
    const trimmed = newExcludedPath.trim();
    if (!trimmed) return;
    if (excludedPaths?.includes(trimmed)) { setNewExcludedPath(''); return; }
    dispatch(setExcludedPaths([...(excludedPaths || []), trimmed]));
    setNewExcludedPath('');
  };

  const handleRemoveExcludedPath = (path: string) => {
    dispatch(setExcludedPaths((excludedPaths || []).filter((p) => p !== path)));
  };

  return (
    <div className="space-y-4">
      {/* Master toggle */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-200">Enable Visual Effects</span>
          {isLoading && <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />}
        </div>
        <Toggle checked={enabled} onChange={() => dispatch(toggleEffects())} disabled={isLoading} />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-900/20 border border-red-800/30 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Effect cards */}
      <div className="space-y-3">
        {EFFECTS.map((effect) => {
          const isActive = activeEffects.includes(effect.type);
          const isExpanded = expandedEffect === effect.type;
          const canExpand = enabled && isActive;

          return (
            <div
              key={effect.type}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isActive && enabled
                  ? `bg-gradient-to-r ${effect.gradient} border-gray-600 ring-1 ${effect.ringColor}`
                  : 'bg-gray-900/50 border-gray-700'
              }`}
            >
              {/* Card header */}
              <div className="flex items-center gap-4 px-4 py-3.5">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isActive && enabled ? 'bg-gray-700/60' : 'bg-gray-800'
                  }`}
                >
                  <effect.icon className={`w-5 h-5 ${effect.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isActive && enabled ? 'text-white' : 'text-gray-400'}`}>
                    {effect.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{effect.description}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {canExpand && (
                    <button
                      onClick={() => setExpandedEffect(isExpanded ? null : effect.type)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-gray-700/50"
                    >
                      Advanced
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                  <Toggle
                    checked={isActive}
                    onChange={() => dispatch(toggleEffect(effect.type))}
                    disabled={!enabled || isLoading}
                    color={effect.type === 'snow' ? 'blue' : 'red'}
                  />
                </div>
              </div>

              {/* Advanced settings (inline) */}
              {isExpanded && canExpand && (
                <div className="px-4 pb-4 pt-1 border-t border-gray-700/50">
                  <div className="pt-3">
                    {effect.type === 'snow' ? (
                      <SnowAdvanced
                        snowSettings={snowSettings}
                        onChange={(key, value) => dispatch(setSnowSettings({ [key]: value }))}
                        onReset={() => dispatch(resetSnowSettings())}
                      />
                    ) : (
                      <RedEnvelopeAdvanced
                        redEnvelopeSettings={redEnvelopeSettings}
                        onChange={(key, value) => dispatch(setRedEnvelopeSettings({ [key]: value }))}
                        onReset={() => dispatch(resetRedEnvelopeSettings())}
                        dispatch={dispatch}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Page Visibility */}
      <div className="rounded-xl border border-gray-700 bg-gray-900/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700/60">
          <p className="text-sm font-medium text-gray-300">Page Visibility</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Paths where effects are hidden (e.g. /login, /admin)
          </p>
        </div>
        <div className="px-4 py-3 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newExcludedPath}
              onChange={(e) => setNewExcludedPath(e.target.value)}
              placeholder="/path/to/hide"
              className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600 placeholder-gray-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); handleAddExcludedPath(); }
              }}
            />
            <button
              onClick={handleAddExcludedPath}
              disabled={!newExcludedPath.trim()}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {excludedPaths && excludedPaths.length > 0 ? (
            <div className="space-y-1.5 pt-1">
              {excludedPaths.map((path) => (
                <div
                  key={path}
                  className="flex items-center justify-between px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700"
                >
                  <span className="text-sm text-gray-300 font-mono">{path}</span>
                  <button
                    onClick={() => handleRemoveExcludedPath(path)}
                    className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-600 italic pt-1">No exclusions — effects show on all pages.</p>
          )}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-between pt-1">
        <span className={`text-xs ${isDirty ? 'text-amber-400' : 'text-gray-500'}`}>
          {isDirty ? '⚠ Unsaved changes' : '✓ All changes saved'}
        </span>
        <button
          onClick={handleSaveSettings}
          disabled={!isDirty || isLoading}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            isDirty && !isLoading
              ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
          }`}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
