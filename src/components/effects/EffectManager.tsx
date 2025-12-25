'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchEffectSettings } from '@/store/effectSettingsSlice';
import dynamic from 'next/dynamic';

// Dynamically import effects to reduce initial bundle size
const SnowEffect = dynamic(() => import('./SnowEffect'), {
  ssr: false,
});

const RedEnvelopeEffect = dynamic(() => import('./RedEnvelopeEffect'), {
  ssr: false,
});

export default function EffectManager() {
  const dispatch = useDispatch<AppDispatch>();
  const { enabled, activeEffects, intensity } = useSelector(
    (state: RootState) => state.effectSettings
  );

  // Fetch effect settings from API on mount
  useEffect(() => {
    dispatch(fetchEffectSettings());
  }, [dispatch]);

  if (!enabled || activeEffects.length === 0) {
    return null;
  }

  return (
    <>
      {activeEffects.includes('snow') && <SnowEffect intensity={intensity} />}
      {activeEffects.includes('redEnvelope') && <RedEnvelopeEffect intensity={intensity} />}
    </>
  );
}
