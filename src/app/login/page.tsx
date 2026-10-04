"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Layers,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Loader2,
  Server,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("redirect") || "/";
  const isExpired = searchParams?.get("expired") === "true";

  const { loginWithCredentials, isAuthenticated, isLoading, error, clearError } =
    useAuthStore();

  const [email, setEmail] = useState("admin@store.io");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectPath);
    }
  }, [isAuthenticated, redirectPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      toast.error("Please fill in both email and password.");
      return;
    }

    const success = await loginWithCredentials(email, password);
    if (success) {
      toast.success("Authentication successful! Redirecting...", {
        description: `Welcome back to NEXUS CRM`,
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      });
      router.push(redirectPath);
    } else {
      toast.error("Login Failed", {
        description: error || "Invalid email or password",
      });
    }
  };

  const fillCredentials = (type: "admin" | "demo") => {
    clearError();
    if (type === "admin") {
      setEmail("admin@store.io");
      setPassword("admin123");
      toast.info("Admin backend credentials filled!");
    } else {
      setEmail("demo@nexus.crm");
      setPassword("demo123");
      toast.info("Demo mode credentials filled!");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0B0F17] text-slate-100 overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Background Decorative Gradients & Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-6 sm:p-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-600/30 mb-4 ring-8 ring-blue-500/10 animate-pulse">
            <Layers className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            NEXUS <span className="text-blue-500 font-black">CRM</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            Product & Inventory Management Portal
          </p>
        </div>

        {/* Login Form Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Sign In to Dashboard</h2>
              <p className="text-xs text-slate-400">Enter your administrative credentials</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <ShieldCheck className="h-3 w-3" />
              Secure API
            </div>
          </div>

          {/* Session Expired Banner */}
          {isExpired && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3.5 text-xs text-amber-300 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">
                Your session has expired. Please sign in again to continue.
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-300 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) clearError();
                  }}
                  placeholder="admin@store.io"
                  className="w-full h-11 rounded-xl border border-slate-800 bg-slate-950/60 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer font-medium">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) clearError();
                  }}
                  placeholder="••••••••"
                  className="w-full h-11 rounded-xl border border-slate-800 bg-slate-950/60 pl-10 pr-10 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                />
                <span>Remember this session</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to CRM
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-fill Demo & Admin Credential Preset Bar */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Quick Test Credentials
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials("admin")}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800 text-[11px] font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <Server className="h-3.5 w-3.5 text-blue-400" />
                Symfony Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials("demo")}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800 text-[11px] font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                Demo Mode
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <KeyRound className="h-3.5 w-3.5" />
          <span>JWT Bearer Authentication Active • NEXUS CRM v2.0</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0B0F17] text-slate-100">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
