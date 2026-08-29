"use client";

import React, { useState } from "react";
import { useBackendHealth } from "@/hooks/useDashboardQuery";
import { resetMockData } from "@/lib/mock-data";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Settings2,
  Server,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: health, refetch: refetchHealth, isFetching: healthLoading } = useBackendHealth();
  const { user } = useAuthStore();

  const [mode, setMode] = useState<"demo" | "live">(
    typeof window !== "undefined"
      ? (localStorage.getItem("ecommerce_crm_mode") as any) || "live"
      : "live"
  );

  const handleModeChange = (newMode: "demo" | "live") => {
    setMode(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("ecommerce_crm_mode", newMode);
      toast.success(`Switched to ${newMode === "live" ? "Live Backend" : "Demo Engine"} Mode`);
    }
  };

  const handleResetData = () => {
    if (confirm("Reset local catalog and media data to original seed defaults?")) {
      resetMockData();
      toast.success("Catalog data reset to defaults. Reloading...");
      setTimeout(() => window.location.reload(), 800);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <Settings2 className="h-7 w-7 text-primary" /> Settings & System Diagnostics
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Manage API connectivity, Supabase storage endpoints, and mock demonstration engines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend Connectivity Status */}
        <Card className="border-border/80">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" /> Symfony REST API Diagnostic
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refetchHealth()}
                disabled={healthLoading}
                className="h-8 w-8"
                title="Test Ping"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${healthLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
            <CardDescription>
              Real-time endpoint reachability to Symfony e-commerce backend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3.5 rounded-xl bg-card border border-border/70 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground">API Base URL</span>
                <p className="text-xs font-mono font-semibold text-foreground">
                  {health?.url || "http://localhost:8000"}
                </p>
              </div>
              {health?.online ? (
                <Badge variant="success" dot>Online ({health.latencyMs}ms)</Badge>
              ) : (
                <Badge variant="warning" dot>Offline / Standalone</Badge>
              )}
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed">
              When Symfony backend is running on port 8000, requests route to Symfony controllers. When offline, the CRM seamlessly operates via the intelligent client fallback engine.
            </div>
          </CardContent>
        </Card>

        {/* Supabase Storage Diagnostic */}
        <Card className="border-border/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-400" /> Supabase Storage Client
            </CardTitle>
            <CardDescription>
              Direct cloud storage integration for photography and documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Bucket</span>
                <span className="font-mono font-semibold text-foreground">products</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Project URL</span>
                <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[200px]">
                  https://jqqtmvchpemsubnmjjvn.supabase.co
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">Upload Pipeline</span>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mode Switcher Card */}
      <Card className="border-border/80">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" /> Runtime Mode Configuration
          </CardTitle>
          <CardDescription>
            Choose between live backend API communication and standalone demo engine mode.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleModeChange("demo")}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                mode === "demo"
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : "border-border/70 hover:border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-foreground">Standalone Demo Engine</span>
                {mode === "demo" && <CheckCircle2 className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground">
                Zero friction testing with built-in realistic mock state, stock adjustment, and persistent localStorage.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange("live")}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                mode === "live"
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : "border-border/70 hover:border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-foreground">Live Symfony Backend</span>
                {mode === "live" && <CheckCircle2 className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground">
                Routes all API requests directly to http://localhost:8000/api endpoints.
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Seed Data */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold text-destructive flex items-center gap-2">
            <RotateCcw className="h-4 w-4" /> Reset Demo Seed Repository
          </CardTitle>
          <CardDescription>
            Restore initial set of 10 sample products, 6 categories, and mock media assets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleResetData}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Reset Catalog to Default
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
