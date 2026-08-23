import {
  BarChart3,
  CalendarDays,
  CloudSun,
  Home,
  Leaf,
  Microscope,
  Sprout,
  TrendingUp,
} from "lucide-react";
import type { NavigationItem } from "@/types";

export const APP_NAME = "GREENgrid";
export const STORAGE_KEYS = {
  theme: "agrismart-theme",
  language: "agrismart-language",
} as const;

export const navItems: NavigationItem[] = [
  { title: "Home", href: "/", icon: Home, description: "Dashboard overview" },
  { title: "Soil", href: "/soil-testing", icon: Microscope, description: "Smart soil testing" },
  { title: "Crop", href: "/crop-recommendation", icon: Sprout, description: "Crop recommendation" },
  { title: "Calendar", href: "/crop-calendar", icon: CalendarDays, description: "Farming tasks" },
  { title: "Weather", href: "/weather", icon: CloudSun, description: "Weather forecast" },
  { title: "Disease", href: "/disease-detection", icon: Leaf, description: "Disease detection" },
  { title: "Market", href: "/market-profit", icon: TrendingUp, description: "Market and profit" },
];

export const quickActions = [
  { title: "Test Soil", href: "/soil-testing", icon: Microscope, color: "bg-agri-primary" },
  { title: "Recommend Crop", href: "/crop-recommendation", icon: Sprout, color: "bg-agri-secondary" },
  { title: "Detect Disease", href: "/disease-detection", icon: Leaf, color: "bg-agri-accent" },
  { title: "Market Prices", href: "/market-profit", icon: BarChart3, color: "bg-agri-earth" },
];

export const routeAliases: Record<string, string> = {
  home: "/",
  dashboard: "/",
  soil: "/soil-testing",
  "soil testing": "/soil-testing",
  crop: "/crop-recommendation",
  "crop recommendation": "/crop-recommendation",
  calendar: "/crop-calendar",
  "crop calendar": "/crop-calendar",
  weather: "/weather",
  disease: "/disease-detection",
  "disease detection": "/disease-detection",
  market: "/market-profit",
  profit: "/market-profit",
  "market profit": "/market-profit",
  "होम": "/",
  "मिट्टी": "/soil-testing",
  "फसल": "/crop-recommendation",
  "कैलेंडर": "/crop-calendar",
  "मौसम": "/weather",
  "रोग": "/disease-detection",
  "बाजार": "/market-profit",
};
