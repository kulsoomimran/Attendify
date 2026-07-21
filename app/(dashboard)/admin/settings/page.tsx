"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { User, Lock, Shield, Save, Eye, EyeOff, CheckCircle2, AlertCircle, MapPin, Navigation, Loader2 } from "lucide-react";

type AlertState = { type: "success" | "error"; message: string } | null;

interface OfficeSetting {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

function Alert({ alert, onDismiss }: { alert: AlertState; onDismiss: () => void }) {
  if (!alert) return null;
  const isSuccess = alert.type === "success";
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm transition-all duration-300
        ${isSuccess
          ? "bg-accent-sage/10 border-accent-sage/30 text-foreground"
          : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}
    >
      {isSuccess
        ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-accent-sage" />
        : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
      }
      <span className="flex-1">{alert.message}</span>
      <button onClick={onDismiss} className="text-secondary hover:text-foreground transition-colors text-xs ml-2">✕</button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { data: session, isPending } = authClient.useSession();

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileAlert, setProfileAlert] = useState<AlertState>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState<AlertState>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Office geofence form
  const [officeSetting, setOfficeSetting] = useState<OfficeSetting | null>(null);
  const [officeLoading, setOfficeLoading] = useState(true);
  const [officeSaving, setOfficeSaving] = useState(false);
  const [officeAlert, setOfficeAlert] = useState<AlertState>(null);
  const [officeName, setOfficeName] = useState("");
  const [officeLatitude, setOfficeLatitude] = useState("");
  const [officeLongitude, setOfficeLongitude] = useState("");
  const [officeRadius, setOfficeRadius] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "");
      setEmail(session.user.email ?? "");
    }
  }, [session]);

  // Load current office settings
  useEffect(() => {
    setOfficeLoading(true);
    fetch("/api/v1/office-settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setOfficeSetting(d.data);
          setOfficeName(d.data.name ?? "HQ Office");
          setOfficeLatitude(String(d.data.latitude ?? ""));
          setOfficeLongitude(String(d.data.longitude ?? ""));
          setOfficeRadius(String(d.data.radiusMeters ?? "200"));
        }
      })
      .catch(() => {})
      .finally(() => setOfficeLoading(false));
  }, []);

  async function handleOfficeDetectLocation() {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setOfficeAlert({ type: "error", message: "Geolocation is not supported by your browser." });
      return;
    }
    setIsDetectingLocation(true);
    setOfficeAlert(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOfficeLatitude(pos.coords.latitude.toFixed(6));
        setOfficeLongitude(pos.coords.longitude.toFixed(6));
        setIsDetectingLocation(false);
        setOfficeAlert({ type: "success", message: "Current location detected and filled in. Review and save." });
      },
      (err) => {
        setIsDetectingLocation(false);
        setOfficeAlert({ type: "error", message: `Location error: ${err.message}` });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleOfficeSave(e: React.FormEvent) {
    e.preventDefault();
    const lat = parseFloat(officeLatitude);
    const lng = parseFloat(officeLongitude);
    const radius = parseInt(officeRadius, 10);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setOfficeAlert({ type: "error", message: "Latitude must be a number between -90 and 90." });
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setOfficeAlert({ type: "error", message: "Longitude must be a number between -180 and 180." });
      return;
    }
    if (isNaN(radius) || radius < 50 || radius > 10000) {
      setOfficeAlert({ type: "error", message: "Radius must be between 50 and 10,000 meters." });
      return;
    }
    setOfficeSaving(true);
    setOfficeAlert(null);
    try {
      const res = await fetch("/api/v1/office-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: officeName, latitude: lat, longitude: lng, radiusMeters: radius }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOfficeSetting(data.data);
        setOfficeAlert({ type: "success", message: "Office geofence settings saved successfully." });
      } else {
        setOfficeAlert({ type: "error", message: data.error || "Failed to save office settings." });
      }
    } catch {
      setOfficeAlert({ type: "error", message: "A network error occurred." });
    } finally {
      setOfficeSaving(false);
    }
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileAlert(null);
    try {
      const res = await fetch("/api/v1/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfileAlert({ type: "success", message: "Profile updated successfully." });
      } else {
        setProfileAlert({ type: "error", message: data.error || "Failed to update profile." });
      }
    } catch {
      setProfileAlert({ type: "error", message: "A network error occurred." });
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordAlert({ type: "error", message: "New passwords do not match." });
      return;
    }
    setPasswordLoading(true);
    setPasswordAlert(null);
    try {
      const res = await fetch("/api/v1/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordAlert({ type: "success", message: "Password changed successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordAlert({ type: "error", message: data.error || "Failed to change password." });
      }
    } catch {
      setPasswordAlert({ type: "error", message: "A network error occurred." });
    } finally {
      setPasswordLoading(false);
    }
  }

  const initials = (name || "AU")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const mapPreviewUrl = officeLatitude && officeLongitude
    ? `https://www.google.com/maps?q=${officeLatitude},${officeLongitude}&z=15`
    : null;

  return (
    <div className="flex flex-col space-y-6 max-w-3xl" id="admin-settings-root">

      {/* Page Header */}
      <div className="border-b border-border pb-5">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-secondary">Administration</span>
        <h1 className="text-xl font-normal text-foreground mt-1" id="admin-settings-title">Account Settings</h1>
        <p className="text-xs font-normal text-secondary mt-0.5">
          Manage your profile information, office geofence, and security preferences.
        </p>
      </div>

      {/* ── Office Geofence Card ─────────────────────────────────────── */}
      <section className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-5" id="admin-office-geofence-card">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-sage/15 border border-accent-sage/30 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-accent-sage" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Office Geofence Settings</h2>
            <p className="text-[11px] text-secondary">Configure the office location and verification radius for onsite clock-in/out.</p>
          </div>
        </div>

        {officeLoading ? (
          <div className="flex items-center gap-2 text-secondary text-sm py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading office settings…
          </div>
        ) : (
          <>
            <Alert alert={officeAlert} onDismiss={() => setOfficeAlert(null)} />

            {/* Current setting display */}
            {officeSetting && (
              <div className="bg-background border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-secondary block">Current Configuration</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground" id="current-office-name">{officeSetting.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-sage/10 border border-accent-sage/20 text-accent-sage font-medium">
                      {officeSetting.radiusMeters}m radius
                    </span>
                  </div>
                  <span className="text-[11px] text-secondary font-mono" id="current-office-coords">
                    {officeSetting.latitude.toFixed(6)}, {officeSetting.longitude.toFixed(6)}
                  </span>
                </div>
                {mapPreviewUrl && (
                  <a
                    href={mapPreviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="link-preview-office-map"
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-border rounded-xl text-xs text-secondary hover:text-foreground hover:bg-background transition-all duration-200 shrink-0"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Preview on Map
                  </a>
                )}
              </div>
            )}

            <form onSubmit={handleOfficeSave} className="space-y-4" id="form-office-geofence">
              {/* Office Name */}
              <div className="space-y-1.5">
                <label htmlFor="office-name" className="block text-xs font-medium text-secondary">
                  Office Name
                </label>
                <input
                  id="office-name"
                  type="text"
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  maxLength={100}
                  required
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-sage/40 focus:border-accent-sage/60 transition-all duration-200"
                  placeholder="e.g. HQ Office, Branch A"
                />
              </div>

              {/* Coordinates Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="office-latitude" className="block text-xs font-medium text-secondary">
                    Latitude <span className="text-secondary/50">(-90 to 90)</span>
                  </label>
                  <input
                    id="office-latitude"
                    type="number"
                    step="any"
                    value={officeLatitude}
                    onChange={(e) => setOfficeLatitude(e.target.value)}
                    min="-90"
                    max="90"
                    required
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground font-mono placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-sage/40 focus:border-accent-sage/60 transition-all duration-200"
                    placeholder="e.g. 37.774900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="office-longitude" className="block text-xs font-medium text-secondary">
                    Longitude <span className="text-secondary/50">(-180 to 180)</span>
                  </label>
                  <input
                    id="office-longitude"
                    type="number"
                    step="any"
                    value={officeLongitude}
                    onChange={(e) => setOfficeLongitude(e.target.value)}
                    min="-180"
                    max="180"
                    required
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground font-mono placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-sage/40 focus:border-accent-sage/60 transition-all duration-200"
                    placeholder="e.g. -122.419400"
                  />
                </div>
              </div>

              {/* Radius + Detect */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
                <div className="flex-1 space-y-1.5">
                  <label htmlFor="office-radius" className="block text-xs font-medium text-secondary">
                    Verification Radius (meters) <span className="text-secondary/50">(50–10,000)</span>
                  </label>
                  <input
                    id="office-radius"
                    type="number"
                    value={officeRadius}
                    onChange={(e) => setOfficeRadius(e.target.value)}
                    min="50"
                    max="10000"
                    step="10"
                    required
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-sage/40 focus:border-accent-sage/60 transition-all duration-200"
                    placeholder="e.g. 200"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleOfficeDetectLocation}
                  disabled={isDetectingLocation}
                  id="btn-detect-office-location"
                  className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm text-secondary hover:text-foreground hover:bg-background disabled:opacity-50 transition-all duration-200"
                  title="Use your current GPS location as the office coordinates"
                >
                  {isDetectingLocation
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Navigation className="w-3.5 h-3.5" />
                  }
                  {isDetectingLocation ? "Detecting…" : "Use My Location"}
                </button>
              </div>

              <p className="text-[11px] text-secondary">
                Employees selecting <span className="font-semibold">Onsite</span> verification must be within this radius of the coordinates above to clock in or out.
              </p>

              <button
                type="submit"
                disabled={officeSaving}
                id="btn-save-office-geofence"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm rounded-xl hover:opacity-90 disabled:opacity-50 transition-all duration-200 shadow-soft"
              >
                <Save className="w-3.5 h-3.5" />
                {officeSaving ? "Saving…" : "Save Geofence Settings"}
              </button>
            </form>
          </>
        )}
      </section>

      {isPending ? (
        <div className="flex items-center gap-2 text-secondary text-sm py-8">
          <div className="w-4 h-4 border-2 border-border border-t-accent-sage rounded-full animate-spin" />
          Loading your profile…
        </div>
      ) : (
        <>
          {/* Profile Card */}
          <section className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-5" id="admin-profile-card">
            {/* Card Header */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent-sage/15 border border-accent-sage/30 flex items-center justify-center">
                <User className="w-4 h-4 text-accent-sage" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Profile Information</h2>
                <p className="text-[11px] text-secondary">Update your display name.</p>
              </div>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent-sage/20 border border-accent-sage/35 flex items-center justify-center text-lg font-mono font-semibold text-foreground">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{name || "—"}</p>
                <p className="text-xs text-secondary">{email}</p>
                <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-accent-sage/15 text-accent-sage border border-accent-sage/25">
                  Admin
                </span>
              </div>
            </div>

            <Alert alert={profileAlert} onDismiss={() => setProfileAlert(null)} />

            <form onSubmit={handleProfileSave} className="space-y-4" id="form-admin-profile">
              <div className="space-y-1.5">
                <label htmlFor="admin-name" className="block text-xs font-medium text-secondary">
                  Display Name
                </label>
                <input
                  id="admin-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  minLength={2}
                  maxLength={100}
                  required
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-sage/40 focus:border-accent-sage/60 transition-all duration-200"
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="admin-email" className="block text-xs font-medium text-secondary">
                  Email Address <span className="text-secondary/50">(read-only)</span>
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  readOnly
                  className="w-full bg-background/50 border border-border rounded-xl px-3.5 py-2.5 text-sm text-secondary cursor-not-allowed select-none"
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                id="btn-admin-save-profile"
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm rounded-xl hover:opacity-90 disabled:opacity-50 transition-all duration-200 shadow-soft"
              >
                <Save className="w-3.5 h-3.5" />
                {profileLoading ? "Saving…" : "Save Profile"}
              </button>
            </form>
          </section>

          {/* Security Card */}
          <section className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-5" id="admin-security-card">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center">
                <Lock className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Change Password</h2>
                <p className="text-[11px] text-secondary">Choose a strong password to keep your account secure.</p>
              </div>
            </div>

            <Alert alert={passwordAlert} onDismiss={() => setPasswordAlert(null)} />

            <form onSubmit={handlePasswordChange} className="space-y-4" id="form-admin-password">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label htmlFor="admin-current-password" className="block text-xs font-medium text-secondary">Current Password</label>
                <div className="relative">
                  <input
                    id="admin-current-password"
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-sage/40 focus:border-accent-sage/60 transition-all duration-200 pr-10"
                    placeholder="Enter current password"
                  />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground transition-colors">
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label htmlFor="admin-new-password" className="block text-xs font-medium text-secondary">New Password</label>
                <div className="relative">
                  <input
                    id="admin-new-password"
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-sage/40 focus:border-accent-sage/60 transition-all duration-200 pr-10"
                    placeholder="Minimum 8 characters"
                  />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground transition-colors">
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="admin-confirm-password" className="block text-xs font-medium text-secondary">Confirm New Password</label>
                <div className="relative">
                  <input
                    id="admin-confirm-password"
                    type={showConfirmPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`w-full bg-background border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-secondary/50 focus:outline-none focus:ring-2 transition-all duration-200 pr-10
                      ${confirmPassword && confirmPassword !== newPassword
                        ? "border-red-500/50 focus:ring-red-500/30"
                        : "border-border focus:ring-accent-sage/40 focus:border-accent-sage/60"
                      }`}
                    placeholder="Re-enter new password"
                  />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground transition-colors">
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-[11px] text-red-400">Passwords do not match.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={passwordLoading || (!!confirmPassword && confirmPassword !== newPassword)}
                id="btn-admin-change-password"
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm rounded-xl hover:opacity-90 disabled:opacity-50 transition-all duration-200 shadow-soft"
              >
                <Shield className="w-3.5 h-3.5" />
                {passwordLoading ? "Updating…" : "Change Password"}
              </button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
