"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { User, Lock, Shield, Save, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

type AlertState = { type: "success" | "error"; message: string } | null;

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

export default function EmployeeSettingsPage() {
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

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "");
      setEmail(session.user.email ?? "");
    }
  }, [session]);

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

  const initials = (name || "EM")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col space-y-6 max-w-3xl" id="employee-settings-root">

      {/* Page Header */}
      <div className="border-b border-border pb-5">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-secondary">Workforce Portal</span>
        <h1 className="text-xl font-normal text-foreground mt-1" id="employee-settings-title">Account Settings</h1>
        <p className="text-xs font-normal text-secondary mt-0.5">
          Manage your profile information and security preferences.
        </p>
      </div>

      {isPending ? (
        <div className="flex items-center gap-2 text-secondary text-sm py-8">
          <div className="w-4 h-4 border-2 border-border border-t-accent-sage rounded-full animate-spin" />
          Loading your profile…
        </div>
      ) : (
        <>
          {/* Profile Card */}
          <section className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-5" id="employee-profile-card">
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
                <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-background border border-border text-secondary">
                  Employee
                </span>
              </div>
            </div>

            <Alert alert={profileAlert} onDismiss={() => setProfileAlert(null)} />

            <form onSubmit={handleProfileSave} className="space-y-4" id="form-employee-profile">
              <div className="space-y-1.5">
                <label htmlFor="employee-name" className="block text-xs font-medium text-secondary">
                  Display Name
                </label>
                <input
                  id="employee-name"
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
                <label htmlFor="employee-email" className="block text-xs font-medium text-secondary">
                  Email Address <span className="text-secondary/50">(read-only)</span>
                </label>
                <input
                  id="employee-email"
                  type="email"
                  value={email}
                  readOnly
                  className="w-full bg-background/50 border border-border rounded-xl px-3.5 py-2.5 text-sm text-secondary cursor-not-allowed select-none"
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                id="btn-employee-save-profile"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm rounded-xl hover:opacity-90 disabled:opacity-50 transition-all duration-200 shadow-soft"
              >
                <Save className="w-3.5 h-3.5" />
                {profileLoading ? "Saving…" : "Save Profile"}
              </button>
            </form>
          </section>

          {/* Security Card */}
          <section className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-5" id="employee-security-card">
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

            <form onSubmit={handlePasswordChange} className="space-y-4" id="form-employee-password">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label htmlFor="employee-current-password" className="block text-xs font-medium text-secondary">Current Password</label>
                <div className="relative">
                  <input
                    id="employee-current-password"
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
                <label htmlFor="employee-new-password" className="block text-xs font-medium text-secondary">New Password</label>
                <div className="relative">
                  <input
                    id="employee-new-password"
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
                <label htmlFor="employee-confirm-password" className="block text-xs font-medium text-secondary">Confirm New Password</label>
                <div className="relative">
                  <input
                    id="employee-confirm-password"
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
                id="btn-employee-change-password"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm rounded-xl hover:opacity-90 disabled:opacity-50 transition-all duration-200 shadow-soft"
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
