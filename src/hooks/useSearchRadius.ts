import { useState, useEffect, useCallback } from 'react';

const SEARCH_RADIUS_KEY = 'searchRadius';
const DEFAULT_RADIUS_METERS = 5000;

/**
 * Custom hook to manage search radius across the application
 * - Syncs with localStorage
 * - Listens for changes from other tabs/windows (storage event)
 * - Listens for changes in same tab (custom radiusChanged event)
 * - Provides methods to get/set radius in both meters and kilometers
 */
export function useSearchRadius() {
  const [radiusMeters, setRadiusMetersState] = useState<number>(() => {
    // Initialize from localStorage on mount
    const saved = localStorage.getItem(SEARCH_RADIUS_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    // Set default if not found
    localStorage.setItem(SEARCH_RADIUS_KEY, DEFAULT_RADIUS_METERS.toString());
    return DEFAULT_RADIUS_METERS;
  });

  // Computed value in kilometers
  const radiusKm = Math.round(radiusMeters / 1000);

  // Update radius in meters
  const setRadiusMeters = useCallback((meters: number) => {
    if (meters > 0) {
      setRadiusMetersState(meters);
      localStorage.setItem(SEARCH_RADIUS_KEY, meters.toString());

      // Dispatch custom event for same-tab updates
      window.dispatchEvent(
        new CustomEvent('radiusChanged', {
          detail: { radiusMeters: meters }
        })
      );
    }
  }, []);

  // Update radius in kilometers (convenience method)
  const setRadiusKm = useCallback((km: number) => {
    setRadiusMeters(km * 1000);
  }, [setRadiusMeters]);

  // Listen for changes from other sources
  useEffect(() => {
    // Handle storage events (from other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SEARCH_RADIUS_KEY && e.newValue) {
        const parsed = parseInt(e.newValue, 10);
        if (!isNaN(parsed) && parsed > 0) {
          setRadiusMetersState(parsed);
        }
      }
    };

    // Handle custom events (from same tab)
    const handleRadiusChanged = (e: CustomEvent) => {
      const meters = e.detail?.radiusMeters;
      if (meters && meters > 0) {
        setRadiusMetersState(meters);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('radiusChanged', handleRadiusChanged as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('radiusChanged', handleRadiusChanged as EventListener);
    };
  }, []);

  return {
    radiusMeters,
    radiusKm,
    setRadiusMeters,
    setRadiusKm,
  };
}
