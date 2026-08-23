"use client";

import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  CloudSun,
  Droplets,
  Leaf,
  Microscope,
  Sprout,
  Sun,
  TrendingUp,
  Wind,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { quickActions } from "@/lib/constants";
import {
  formatWithUnit,
  formatPercent,
  formatPH,
  formatTemperature,
  formatHumidity,
} from "@/lib/format";

// Types for weather and soil data
interface WeatherDay {
  day: string;
  condition: string;
  temp: number | null;
  humidity: number | null;
  rain: number | null;
  icon: typeof Sun;
}

interface SoilParam {
  label: string;
  value: number | string | null;
  unit: string;
  status: string;
  progress: number | null;
}

// Default empty states - will show N/A until real data loads
const emptyWeatherData: WeatherDay[] = [
  { day: "Today", condition: "-", temp: null, humidity: null, rain: null, icon: Sun },
  { day: "Tomorrow", condition: "-", temp: null, humidity: null, rain: null, icon: CloudSun },
  { day: "Day 3", condition: "-", temp: null, humidity: null, rain: null, icon: CloudSun },
];

const emptySoilParams: SoilParam[] = [
  { label: "pH Level", value: null, unit: "", status: "unknown", progress: null },
  { label: "Moisture", value: null, unit: "%", status: "unknown", progress: null },
  { label: "Temperature", value: null, unit: "°C", status: "unknown", progress: null },
  { label: "NPK Level", value: null, unit: "", status: "unknown", progress: null },
];

const features = [
  { title: "Smart Soil Testing", description: "Analyze soil health with IoT sensors for pH, moisture, NPK levels", href: "/soil-testing", icon: Microscope, color: "bg-agri-primary" },
  { title: "Crop Recommendation", description: "AI-powered suggestions based on location, soil, and climate data", href: "/crop-recommendation", icon: Sprout, color: "bg-agri-secondary" },
  { title: "Crop Calendar", description: "Track daily farming tasks and growth stages for your crops", href: "/crop-calendar", icon: CalendarDays, color: "bg-agri-accent" },
  { title: "Weather Monitoring", description: "Real-time weather forecasts and agriculture-specific alerts", href: "/weather", icon: CloudSun, color: "bg-agri-earth" },
  { title: "Disease Detection", description: "Upload crop images for AI-powered disease identification", href: "/disease-detection", icon: Leaf, color: "bg-red-500" },
  { title: "Market & Profit", description: "Compare mandi prices and calculate expected profits", href: "/market-profit", icon: TrendingUp, color: "bg-blue-500" },
];

export function Dashboard() {
  const { t } = useLanguage();
  const greeting = t("greeting") || "Good Morning";

  // In a real app, these would come from API calls
  // Using empty data to demonstrate N/A states
  const weatherData = emptyWeatherData;
  const soilParams = emptySoilParams;

  return (
    <div className="container-custom py-6 md:py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{greeting}, Farmer! 👋</h1>
        <p className="text-muted-foreground mt-1">{t("tagline") || "Your complete farming assistant"}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("active_crop") || "Active Crop"}</CardTitle>
                <CardDescription>N/A • Day N/A / N/A</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">N/A</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-32 rounded-lg bg-gradient-to-br from-agri-primary/10 to-agri-secondary/10 flex items-center justify-center">
              <Sprout className="h-16 w-16 text-agri-primary/50" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {soilParams.map((param) => (
                <div key={param.label} className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-foreground">
                    {param.label === "pH Level" ? formatPH(param.value as number | null) : param.unit ? formatWithUnit(param.value, param.unit) : formatWithUnit(param.value, "")}
                  </div>
                  <div className="text-xs text-muted-foreground">{param.label}</div>
                  <div className="h-1.5 mt-2 rounded-full bg-muted relative overflow-hidden">
                    {param.progress !== null ? (
                      <div className="h-full bg-primary transition-all" style={{ width: `${param.progress}%` }} />
                    ) : (
                      <div className="h-full bg-muted-foreground/30" style={{ width: '0%' }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudSun className="h-5 w-5 text-agri-accent" />
              {t("weather") || "Weather"}
            </CardTitle>
            <CardDescription>Next 3 days forecast</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {weatherData.map((day) => {
              const Icon = day.icon;
              return (
                <div key={day.day} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-agri-accent" />
                    <div>
                      <p className="font-medium">{day.day}</p>
                      <p className="text-sm text-muted-foreground capitalize">{day.condition}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatTemperature(day.temp)}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground justify-end">
                      <span className="flex items-center gap-1"><Droplets className="h-3 w-3" />{formatHumidity(day.humidity)}</span>
                      <span className="flex items-center gap-1"><Wind className="h-3 w-3" />{formatPercent(day.rain)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <Link to="/weather" className="text-sm text-primary hover:underline block text-center mt-2">
              View full forecast →
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">{t("quick_actions") || "Quick Actions"}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} to={action.href}>
                <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center h-28 gap-3 text-center">
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", action.color)}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-medium">{t(action.title.toLowerCase().replace(" ", "_")) || action.title}</span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">{t("features") || "Features"}</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} to={feature.href}>
                <Card className="h-full transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer">
                  <CardHeader>
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center mb-4", feature.color)}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>{t(feature.title.toLowerCase().replace(" ", "_")) || feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{t(feature.description) || feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}