'use client';

import { useEffect, useState } from 'react';
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
  const [isActivated, setIsActivated] = useState(false);
  const { enabled, activeEffects, intensity, redEnvelopeSettings, snowSettings, excludedPaths } = useSelector(
    (state: RootState) => state.effectSettings
  );

  // Defer visual effects bootstrap to idle time to protect initial load metrics.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const win = window as Window & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    let timeoutId: number | undefined;
    let idleId: number | undefined;

    const activate = () => {
      timeoutId = window.setTimeout(() => setIsActivated(true), 1200);
    };

    if (typeof win.requestIdleCallback === 'function') {
      idleId = win.requestIdleCallback(activate, { timeout: 2000 });
    } else {
      timeoutId = window.setTimeout(() => setIsActivated(true), 2000);
    }

    return () => {
      if (typeof timeoutId === 'number') {
        window.clearTimeout(timeoutId);
      }
      if (typeof idleId === 'number' && typeof win.cancelIdleCallback === 'function') {
        win.cancelIdleCallback(idleId);
      }
    };
  }, []);

  useEffect(() => {
    if (!isActivated) return;
    dispatch(fetchEffectSettings());
  }, [dispatch, isActivated]);

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

  if (!isActivated || isAdminPage || isExcluded || !enabled || activeEffects.length === 0) {
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
