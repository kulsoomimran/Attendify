"use client";

import { useState, useCallback } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  });

  const getLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser.",
        loading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    const success = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false,
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMsg = "An unknown error occurred while retrieving location.";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg = "Location access denied. Please enable location permissions in your browser settings.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMsg = "Location information is unavailable. Try again.";
          break;
        case error.TIMEOUT:
          errorMsg = "Location request timed out. Try again.";
          break;
      }
      setState({
        latitude: null,
        longitude: null,
        error: errorMsg,
        loading: false,
      });
    };

    navigator.geolocation.getCurrentPosition(success, handleError, options);
  }, []);

  return { ...state, getLocation };
}
