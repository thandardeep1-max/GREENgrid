"use client";

import { useState, useEffect } from "react";
import {
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  TrendingUp,
  Minus,
  Thermometer,
  Droplets,
  Leaf,
  Sun,
  Zap,
  FlaskConical,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  formatPH,
  formatWithUnit,
  formatTemperature,
  formatHumidity,
  isValidValue,
} from "@/lib/format";

const sensorParams = [
  { key: "ph", label: "pH Level", unit: "", min: 0, max: 14, optimal: { min: 6.0, max: 7.5 }, icon: FlaskConical, color: "text-blue-500" },
  { key: "nitrogen", label: "Nitrogen (N)", unit: "ppm", min: 0, max: 200, optimal: { min: 40, max: 80 }, icon: Leaf, color: "text-green-500" },
  { key: "phosphorus", label: "Phosphorus (P)", unit: "ppm", min: 0, max: 100, optimal: { min: 30, max: 60 }, icon: Sun, color: "text-yellow-500" },
  { key: "potassium", label: "Potassium (K)", unit: "ppm", min: 0, max: 300, optimal: { min: 150, max: 250 }, icon: Zap, color: "text-orange-500" },
  { key: "moisture", label: "Soil Moisture", unit: "%", min: 0, max: 100, optimal: { min: 40, max: 70 }, icon: Droplets, color: "text-blue-500" },
  { key: "temperature", label: "Soil Temperature", unit: "°C", min: -10, max: 50, optimal: { min: 20, max: 30 }, icon: Thermometer, color: "text-red-500" },
  { key: "ec", label: "Electrical Conductivity", unit: "dS/m", min: 0, max: 4, optimal: { min: 1.5, max: 2.5 }, icon: Zap, color: "text-purple-500" },
  { key: "organicMatter", label: "Organic Matter", unit: "%", min: 0, max: 10, optimal: { min: 3, max: 5 }, icon: Shield, color: "text-amber-500" },
];

// Initial readings - all null to show N/A until sensor connects
const initialReadings = {
  ph: null as number | null,
  nitrogen: null as number | null,
  phosphorus: null as number | null,
  potassium: null as number | null,
  moisture: null as number | null,
  temperature: null as number | null,
  ec: null as number | null,
  organicMatter: null as number | null,
};

const getStatus = (value: number | null | undefined, optimal: { min: number; max: number }) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "unknown";
  if (value >= optimal.min && value <= optimal.max) return "optimal";
  if (value < optimal.min) return "low";
  return "high";
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "optimal": return { label: "Optimal", color: "success", icon: CheckCircle };
    case "low": return { label: "Low", color: "destructive", icon: AlertCircle };
    case "high": return { label: "High", color: "warning", icon: TrendingUp };
    default: return { label: "Unknown", color: "outline", icon: Minus };
  }
};

export function SoilTesting() {
  const { t } = useLanguage();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [readings, setReadings] = useState<typeof initialReadings>({ ...initialReadings });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Mock data that will be used once sensor is connected (simulates real sensor data)
  const mockReadings = {
    ph: 6.8,
    nitrogen: 55,
    phosphorus: 42,
    potassium: 180,
    moisture: 58,
    temperature: 24,
    ec: 2.1,
    organicMatter: 3.5,
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsConnected(true);
    setIsConnecting(false);
    // Simulate initial sensor readings on connect
    setReadings({ ...mockReadings });
    setLastUpdated(new Date());
    toast({ title: "Connected", description: "Sensor connected successfully", variant: "success" });
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setReadings({ ...initialReadings }); // Reset to N/A state
    setLastUpdated(null);
    toast({ title: "Disconnected", description: "Sensor disconnected", variant: "default" });
  };

  const handleRefresh = async () => {
    if (!isConnected) return;
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 1500));
    const newReadings = { ...mockReadings };
    Object.keys(newReadings).forEach((key) => {
      const param = sensorParams.find((p) => p.key === key);
      if (param) {
        const variance = (param.max - param.min) * 0.1;
        newReadings[key as keyof typeof mockReadings] = Math.max(
          param.min,
          Math.min(param.max, mockReadings[key as keyof typeof mockReadings] + (Math.random() - 0.5) * variance)
        );
      }
    });
    setReadings(newReadings);
    setLastUpdated(new Date());
    setIsRefreshing(false);
    toast({ title: "Refreshed", description: "Sensor readings updated", variant: "success" });
  };

  useEffect(() => {
    if (!autoRefresh || !isConnected) return;
    const interval = setInterval(handleRefresh, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, isConnected]);

  const overallHealth = (() => {
    const statuses = sensorParams.map((p) => getStatus(readings[p.key as keyof typeof readings], p.optimal));
    if (statuses.every((s) => s === "optimal")) return "excellent";
    if (statuses.some((s) => s === "low")) return "needs_attention";
    if (statuses.some((s) => s === "unknown")) return "unknown";
    return "good";
  })();

  const healthConfig = {
    excellent: { label: "Excellent", color: "success", icon: CheckCircle, desc: "All parameters within optimal range" },
    good: { label: "Good", color: "default", icon: CheckCircle, desc: "Most parameters optimal, minor adjustments needed" },
    needs_attention: { label: "Needs Attention", color: "destructive", icon: AlertCircle, desc: "Some parameters below optimal levels" },
    unknown: { label: "Unknown", color: "outline", icon: Minus, desc: "Connect sensor to view soil health" },
  };
  const HealthIcon = healthConfig[overallHealth].icon;

  const downloadReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      readings,
      overallHealth: healthConfig[overallHealth].label,
      recommendations: sensorParams
        .filter((p) => getStatus(readings[p.key as keyof typeof readings], p.optimal) !== "optimal")
        .map((p) => ({
          parameter: p.label,
          current: readings[p.key as keyof typeof readings],
          optimal: `${p.optimal.min}-${p.optimal.max} ${p.unit}`,
          status: getStatusConfig(getStatus(readings[p.key as keyof typeof readings], p.optimal)).label,
        })),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `soil-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: "Soil report saved", variant: "success" });
  };

  return (
    <div className="container-custom py-6 md:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-2">
            <FlaskConical className="h-8 w-8 text-agri-primary" />
            {t("nav_soil") || "Soil Testing"}
          </h1>
          <p className="text-muted-foreground mt-1">Real-time soil health monitoring</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleRefresh} disabled={!isConnected || isRefreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" onClick={downloadReport} disabled={!isConnected}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
          {isConnected ? (
            <Button variant="ghost" onClick={handleDisconnect} className="text-destructive">
              <WifiOff className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          ) : (
            <Button onClick={handleConnect} disabled={isConnecting} className="bg-agri-primary hover:bg-agri-primary/90">
              <Wifi className="h-4 w-4 mr-2" />
              {isConnecting ? "Connecting..." : "Connect Sensor"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className={cn("h-5 w-5", isConnected ? "text-green-500" : "text-muted-foreground")} />
              Sensor Status
            </CardTitle>
            <CardDescription>Connection and data status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Status</span>
                <Badge variant={isConnected ? "success" : "outline"} className="gap-1">
                  {isConnected ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      Connected
                    </>
                  ) : (
                    "Disconnected"
                  )}
                </Badge>
              </div>
              {lastUpdated && (
                <p className="text-sm text-muted-foreground">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Auto Refresh</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={cn(autoRefresh && "bg-primary text-primary-foreground")}
                >
                  {autoRefresh ? "On" : "Off"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Updates every 30 seconds</p>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: `hsl(var(--${healthConfig[overallHealth].color}))`, color: "hsl(var(--primary-foreground))" }}>
              <div className="flex items-center gap-2 mb-2">
                <HealthIcon className="h-5 w-5" />
                <span className="font-semibold">{healthConfig[overallHealth].label}</span>
              </div>
              <p className="text-sm opacity-90">{healthConfig[overallHealth].desc}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Soil Parameters</CardTitle>
            <CardDescription>Real-time readings from your sensor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {sensorParams.map((param) => {
                const value = readings[param.key as keyof typeof readings];
                const status = getStatus(value, param.optimal);
                const config = getStatusConfig(status);
                const percentage = isValidValue(value)
                  ? Math.min(100, Math.max(0, ((value - param.min) / (param.max - param.min)) * 100))
                  : 0;
                const Icon = param.icon;

                return (
                  <div key={param.key} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", `${param.color} bg-opacity-10`)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{param.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-2xl font-bold">
                        {param.key === "ph" ? formatPH(value) : param.key === "temperature" ? formatTemperature(value) : param.key === "moisture" ? formatHumidity(value) : formatWithUnit(value, param.unit)}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2 mb-2" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Optimal: {param.optimal.min}-{param.optimal.max} {param.unit}</span>
                      <Badge variant={config.color as any} className="gap-1">
                        <config.icon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recommendations" className="mt-8 w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recommendations">{t("recommendations") || "Recommendations"}</TabsTrigger>
          <TabsTrigger value="history">{t("history") || "History"}</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Soil Health Recommendations</CardTitle>
              <CardDescription>Based on current readings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sensorParams
                .filter((p) => {
                  const status = getStatus(readings[p.key as keyof typeof readings], p.optimal);
                  return status !== "optimal" && status !== "unknown";
                })
                .map((param) => {
                  const value = readings[param.key as keyof typeof readings];
                  const status = getStatus(value, param.optimal);
                  const Icon = param.icon;
                  return (
                    <div key={param.key} className="p-4 rounded-lg border-l-4" style={{ borderColor: status === "low" ? "hsl(var(--destructive))" : "hsl(var(--warning))" }}>
                      <div className="flex items-start gap-3">
                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0", `${param.color} bg-opacity-10`)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{param.label} is {status === "low" ? "low" : "high"}</p>
                          <p className="text-sm text-muted-foreground">
                            Current: {param.key === "ph" ? formatPH(value) : param.key === "temperature" ? formatTemperature(value) : param.key === "moisture" ? formatHumidity(value) : formatWithUnit(value, param.unit)} | Optimal: {param.optimal.min}-{param.optimal.max} {param.unit}
                          </p>
                          <p className="text-sm mt-1">
                            {status === "low"
                              ? `Consider adding ${param.label.toLowerCase()}-rich amendments or fertilizers`
                              : `Consider reducing ${param.label.toLowerCase()} inputs or improving drainage`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {sensorParams.every((p) => getStatus(readings[p.key as keyof typeof readings], p.optimal) === "optimal") && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="font-medium text-green-700 dark:text-green-400">All parameters are optimal!</p>
                  <p className="text-sm text-green-600 dark:text-green-500 mt-1">Your soil is in excellent condition for crop growth.</p>
                </div>
              )}
              {sensorParams.some((p) => getStatus(readings[p.key as keyof typeof readings], p.optimal) === "unknown") && (
                <div className="p-4 rounded-lg bg-muted border border-muted/50 text-center">
                  <p className="text-muted-foreground">Connect sensor to view recommendations based on readings.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reading History</CardTitle>
              <CardDescription>Previous sensor readings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">Historical data will appear here after multiple readings</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}