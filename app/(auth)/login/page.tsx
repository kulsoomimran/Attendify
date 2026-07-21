"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Clock, Mail, Lock, Loader2, ArrowRight } from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message || "Invalid credentials. Please try again.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-soft flex flex-col space-y-6">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <Link href="/" className="flex items-center gap-2" id="login-logo">
          <div className="w-10 h-10 rounded-xl bg-accent-sage flex items-center justify-center shadow-soft">
            <Clock className="w-5 h-5 text-foreground" />
          </div>
        </Link>
        <h2 className="text-xl font-normal text-foreground mt-4" id="login-title">Sign in to Attendify</h2>
        <p className="text-xs font-normal text-secondary">Enter your registered details to access your dashboard.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200" id="login-error">
          {errorMsg}
        </div>
      )}

      {/* Credentials Form */}
      <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-secondary" />
            <input
              type="email"
              required
              placeholder="john.doe@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border pl-10 pr-4 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all duration-200"
              id="login-email-input"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">Password</label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-secondary" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border pl-10 pr-4 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-sage transition-all duration-200"
              id="login-password-input"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground hover:bg-opacity-90 py-2 rounded-xl text-xs font-medium shadow-soft transition-all duration-200 flex items-center justify-center gap-1.5"
          id="btn-login-submit"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Footer Link */}
      <div className="text-center pt-2 border-t border-border">
        <span className="text-xs text-secondary font-normal">
          New to the platform?{" "}
          <Link href="/register" className="text-foreground hover:text-opacity-80 font-medium transition-colors" id="link-go-to-register">
            Create an account
          </Link>
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-sans" id="login-root">
      <Suspense fallback={
        <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-soft flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-accent-sage" />
        </div>
      }>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
