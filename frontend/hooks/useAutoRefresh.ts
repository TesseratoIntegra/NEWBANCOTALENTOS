'use client';

import { useEffect, useRef, useCallback } from 'react';

export function useAutoRefresh(
  fetchFn: () => Promise<void> | void,
  intervalMs: number = 10000
) {
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  const silentRefresh = useCallback(() => {
    if (document.visibilityState === 'visible') {
      Promise.resolve(fetchRef.current()).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(silentRefresh, intervalMs);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') silentRefresh();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [silentRefresh, intervalMs]);
}
