"use client";

import { useState, useEffect } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { X, MapPin, Laptop, Loader2, Navigation, AlertCircle, CheckCircle2 } from "lucide-react";

interface OfficeSetting {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  name: string;
}

interface VerificationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isClockOut: boolean;
  isRemote?: boolean; // employee profile flag — skips onsite option
  onConfirm: (data: { latitude?: number; longitude?: number; notes?: string }) => Promise<void>;
  isSubmitting: boolean;
}

// Haversine formula to compute distance in meters
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function VerificationOverlay({
  isOpen,
  onClose,
  isClockOut,
  isRemote = false,
  onConfirm,
  isSubmitting,
}: VerificationOverlayProps) {
  const [mode, setMode] = useState<"onsite" | "remote" | null>(null);
  const [textInput, setTextInput] = useState("");
  const [distance, setDistance] = useState<number | null>(null);
  const [locationVerified, setLocationVerified] = useState(false);
  const [generalError, setGeneralError] = useState("");

  // Live office settings fetched from DB
  const [officeSetting, setOfficeSetting] = useState<OfficeSetting | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const { latitude, longitude, error: geoError, loading: geoLoading, getLocation } = useGeolocation();

  // Fetch office settings when overlay opens
  useEffect(() => {
    if (!isOpen) return;
    setSettingsLoading(true);
    fetch("/api/v1/office-settings")
      .then((r) => r.json())
      .then((d) => { if (d.success) setOfficeSetting(d.data); })
      .catch(() => {})
      .finally(() => setSettingsLoading(false));
  }, [isOpen]);

  // Auto-select remote mode for remote employees
  useEffect(() => {
    if (isOpen && isRemote) {
      setMode("remote");
    }
  }, [isOpen, isRemote]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setMode(null);
      setTextInput("");
      setDistance(null);
      setLocationVerified(false);
      setGeneralError("");
    }
  }, [isOpen]);

  // Recompute distance when coords arrive
  useEffect(() => {
    if (latitude !== null && longitude !== null && mode === "onsite" && officeSetting) {
      const dist = getDistanceMeters(latitude, longitude, officeSetting.latitude, officeSetting.longitude);
      setDistance(dist);
      if (dist <= officeSetting.radiusMeters) {
        setLocationVerified(true);
        setGeneralError("");
      } else {
        setLocationVerified(false);
        setGeneralError(
          `Out of Range: You are ${Math.round(dist)}m away from ${officeSetting.name}. Must be within ${officeSetting.radiusMeters}m.`
        );
      }
    }
  }, [latitude, longitude, mode, officeSetting]);

  if (!isOpen) return null;

  const handleModeSelection = (selectedMode: "onsite" | "remote") => {
    setMode(selectedMode);
    setDistance(null);
    setLocationVerified(false);
    setGeneralError("");
    if (selectedMode === "onsite") {
      getLocation();
    }
  };

  const handleConfirmSubmit = async () => {
    setGeneralError("");
    if (mode === "onsite") {
      if (!locationVerified || latitude === null || longitude === null) {
        setGeneralError("Please verify your location coordinates within range before continuing.");
        return;
      }
      await onConfirm({
        latitude,
        longitude,
        notes: `Onsite Verification (${officeSetting?.name ?? "HQ"}). Distance: ${Math.round(distance || 0)}m`,
      });
    } else {
      if (textInput.trim().length < 10) {
        setGeneralError(
          isClockOut
            ? "Your Daily Work Summary must contain at least 10 characters."
            : "Your Daily Work Plan must contain at least 10 characters."
        );
        return;
      }
      await onConfirm({
        notes: isClockOut
          ? `Remote Verification. Summary: ${textInput}`
          : `Remote Verification. Plan: ${textInput}`,
      });
    }
  };

  const textPlaceholder = isClockOut
    ? "Describe the tasks completed today..."
    : "Outline the tasks you plan to accomplish today...";

  const inputLabel = isClockOut
    ? "Daily Work Summary (Min. 10 chars)"
    : "Daily Work Plan (Min. 10 chars)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" id="verification-overlay-root">
      <div
        className="absolute inset-0 bg-primary/25 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-elevation relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85dvh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-background/50">
          <div>
            <h3 className="text-base font-normal text-foreground" id="verification-title">
              Attendance Verification
            </h3>
            <p className="text-xs font-normal text-secondary mt-0.5">
              {isRemote
                ? "You are marked as a remote employee. Submit your work plan to proceed."
                : `Confirm your workspace location to ${isClockOut ? "clock out" : "clock in"}.`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md border border-border text-secondary hover:text-foreground hover:bg-background transition-all"
            id="btn-close-verification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          {generalError && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 flex items-start gap-2" id="verification-error">
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Remote employee — skip mode selection, go straight to text */}
          {isRemote ? (
            <div className="space-y-3" id="remote-verification-panel">
              {/* Remote badge */}
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Laptop className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-xs text-blue-400 font-medium">Remote Employee — Geolocation check skipped</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  {inputLabel}
                </label>
                <textarea
                  required
                  placeholder={textPlaceholder}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={4}
                  className="w-full bg-background border border-border px-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all duration-200 resize-none"
                  id="remote-text-input"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Mode Selection Cards — only for onsite employees */}
              {!mode ? (
                <div className="grid grid-cols-2 gap-3" id="verification-mode-selection">
                  <button
                    type="button"
                    onClick={() => handleModeSelection("onsite")}
                    disabled={settingsLoading}
                    className="flex flex-col items-center gap-2 p-3 sm:p-5 rounded-xl border border-border hover:border-accent-sage hover:bg-background/40 transition-all duration-200 disabled:opacity-40"
                    id="btn-select-onsite"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-background border border-border flex items-center justify-center">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-foreground uppercase tracking-wider text-center">Onsite (Office)</span>
                    {officeSetting && (
                      <span className="text-[9px] sm:text-[10px] text-secondary text-center leading-tight">{officeSetting.name} · {officeSetting.radiusMeters}m radius</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeSelection("remote")}
                    className="flex flex-col items-center gap-2 p-3 sm:p-5 rounded-xl border border-border hover:border-accent-sage hover:bg-background/40 transition-all duration-200"
                    id="btn-select-remote"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-background border border-border flex items-center justify-center">
                      <Laptop className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-foreground uppercase tracking-wider">Remote (WFH)</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Back Button */}
                  <button
                    onClick={() => setMode(null)}
                    className="text-[10px] text-secondary hover:text-foreground font-semibold uppercase tracking-wider"
                    id="btn-back-to-mode"
                  >
                    ← Change Mode
                  </button>

                  {/* Onsite Mode Geolocation check */}
                  {mode === "onsite" && (
                    <div className="space-y-4" id="onsite-verification-panel">
                      <div className="bg-background border border-border rounded-xl p-5 flex flex-col items-center text-center space-y-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${locationVerified ? "bg-accent-sage/15 border-accent-sage/30" : "bg-background border-border animate-pulse"}`}>
                          {locationVerified
                            ? <CheckCircle2 className="w-5 h-5 text-accent-sage" />
                            : <Navigation className="w-5 h-5 text-secondary" />
                          }
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                            {locationVerified ? "Location Verified ✓" : "Onsite Coordinates Check"}
                          </h4>
                          <p className="text-[11px] text-secondary mt-1">
                            {officeSetting
                              ? `Matching against ${officeSetting.name} within ${officeSetting.radiusMeters}m.`
                              : "Loading office settings…"}
                          </p>
                        </div>

                        {geoLoading && (
                          <div className="flex items-center gap-1.5 text-xs text-secondary">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Detecting location...</span>
                          </div>
                        )}

                        {geoError && (
                          <div className="p-3 border-l-4 border-red-500 bg-red-50/50 text-[11px] text-red-700 text-left font-mono w-full" id="geo-warning">
                            {geoError}
                          </div>
                        )}

                        {latitude !== null && longitude !== null && (
                          <div className="text-[10px] text-secondary font-mono bg-card px-3 py-2 rounded-lg border border-border w-full text-left space-y-1">
                            <span className="block">Latitude: {latitude.toFixed(6)}</span>
                            <span className="block">Longitude: {longitude.toFixed(6)}</span>
                            {distance !== null && (
                              <span className={`block font-semibold ${locationVerified ? "text-accent-sage" : "text-red-400"}`}>
                                Distance: {Math.round(distance)}m / Limit: {officeSetting?.radiusMeters ?? "—"}m
                              </span>
                            )}
                          </div>
                        )}

                        {/* Re-detect button */}
                        {!geoLoading && (latitude !== null || geoError) && (
                          <button
                            type="button"
                            onClick={getLocation}
                            className="text-[10px] text-secondary hover:text-foreground underline"
                          >
                            Re-detect location
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Remote Mode text validation */}
                  {mode === "remote" && (
                    <div className="space-y-3" id="remote-verification-panel">
                      <div>
                        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                          {inputLabel}
                        </label>
                        <textarea
                          required
                          placeholder={textPlaceholder}
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          rows={4}
                          className="w-full bg-background border border-border px-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all duration-200 resize-none"
                          id="remote-text-input"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Submission Button */}
          {mode && (
            <div className="pt-2 border-t border-border flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-border rounded-xl text-xs font-medium text-secondary hover:text-foreground hover:bg-background transition-all"
                id="btn-verification-cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={
                  isSubmitting ||
                  (mode === "onsite" && (!locationVerified || geoLoading)) ||
                  (mode === "remote" && textInput.trim().length < 10)
                }
                className="px-4 py-2 bg-primary text-primary-foreground hover:bg-opacity-90 rounded-xl text-xs font-medium shadow-soft transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
                id="btn-verification-submit"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm {isClockOut ? "Clock Out" : "Clock In"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
