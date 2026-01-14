'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const { enabled, activeEffects, intensity, redEnvelopeSettings, snowSettings, excludedPaths } = useSelector(
    (state: RootState) => state.effectSettings
  );

  // Fetch effect settings from API on mount
  useEffect(() => {
    dispatch(fetchEffectSettings());
  }, [dispatch]);

  // Don't show effects on admin pages (better UX for admin work)
  const isAdminPage = pathname?.startsWith('/admin');

  // Check if current page is in excluded paths
  const isExcluded = excludedPaths?.some(path => {
    // Exact match or sub-path match (e.g., /login matches /login and /login/something)
    // But be careful with simple prefix matching (e.g. /log matches /login)
    if (path === pathname) return true;
    if (pathname?.startsWith(path + '/')) return true;
    return false;
  });

  if (isAdminPage || isExcluded || !enabled || activeEffects.length === 0) {
    return null;
  }

  return (
    <>
      {activeEffects.includes('snow') && (
        <SnowEffect
          intensity={intensity}
          snowSettings={snowSettings}
        />
      )}
      {activeEffects.includes('redEnvelope') && (
        <RedEnvelopeEffect
          intensity={intensity}
          redEnvelopeSettings={redEnvelopeSettings}
        />
      )}
    </>
  );
}
