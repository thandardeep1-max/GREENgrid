import type { LucideIcon } from "lucide-react";

export type Theme = "light" | "dark" | "system";
export type Language = "en" | "hi";
export type VoiceStatus = "idle" | "listening" | "processing" | "error" | "unsupported";

export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export interface FeatureCard {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

export interface SoilReading {
  label: string;
  value: string;
  unit?: string;
  status: "normal" | "good" | "warning" | "critical";
  progress: number;
}

export interface CropRecommendation {
  name: string;
  suitability: number;
  season: string;
  waterNeed: string;
  duration: string;
  expectedProfit: number;
}

export interface WeatherDay {
  day: string;
  condition: string;
  temperature: string;
  humidity: string;
  rain: string;
}

export interface MarketPrice {
  crop: string;
  mandi: string;
  price: number;
  change: number;
}
