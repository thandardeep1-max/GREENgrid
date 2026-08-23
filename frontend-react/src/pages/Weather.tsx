"use client";

import { useState } from "react";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  Sunrise,
  Sunset,
  MapPin,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  formatTemperature,
  formatHumidity,
  formatWindSpeed,
  formatPressure,
  formatPercent,
  formatWithUnit,
  formatValue,
} from "@/lib/format";

// Types for weather data
interface CurrentWeather {
  temperature: number | null;
  condition: string;
  feelsLike: number | null;
  humidity: number | null;
  windSpeed: number | null;
  windDirection: string;
  pressure: number | null;
  visibility: number | null;
  uvIndex: number | null;
  sunrise: string;
  sunset: string;
}

interface HourlyForecast {
  hour: number;
  temp: number | null;
  condition: string;
  rain: number | null;
}

interface DailyForecast {
  day: string;
  date: string;
  condition: string;
  high: number | null;
  low: number | null;
  humidity: number | null;
  rain: number | null;
  wind: number | null;
  icon: typeof Sun;
}

interface WeatherAlert {
  type: "warning" | "info";
  title: string;
  description: string;
  icon: typeof Sun;
}

// Empty state - shows N/A until real data loads
const emptyCurrentWeather: CurrentWeather = {
  temperature: null,
  condition: "-",
  feelsLike: null,
  humidity: null,
  windSpeed: null,
  windDirection: "-",
  pressure: null,
  visibility: null,
  uvIndex: null,
  sunrise: "--:--",
  sunset: "--:--",
};

const emptyHourlyForecast: HourlyForecast[] = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  temp: null,
  condition: "-",
  rain: null,
}));

const emptyDailyForecast: DailyForecast[] = [
  { day: "Today", date: "", condition: "-", high: null, low: null, humidity: null, rain: null, wind: null, icon: Sun },
  { day: "Tomorrow", date: "", condition: "-", high: null, low: null, humidity: null, rain: null, wind: null, icon: CloudSun },
  { day: "Day 3", date: "", condition: "-", high: null, low: null, humidity: null, rain: null, wind: null, icon: CloudRain },
  { day: "Day 4", date: "", condition: "-", high: null, low: null, humidity: null, rain: null, wind: null, icon: Cloud },
  { day: "Day 5", date: "", condition: "-", high: null, low: null, humidity: null, rain: null, wind: null, icon: Sun },
  { day: "Day 6", date: "", condition: "-", high: null, low: null, humidity: null, rain: null, wind: null, icon: CloudRain },
  { day: "Day 7", date: "", condition: "-", high: null, low: null, humidity: null, rain: null, wind: null, icon: Sun },
];

const emptyAlerts: WeatherAlert[] = [];

const getConditionIcon = (condition: string) => {
  const c = condition.toLowerCase();
  if (c.includes("rain") || c.includes("storm")) return CloudRain;
  if (c.includes("cloud")) return Cloud;
  if (c.includes("snow")) return CloudSnow;
  if (c.includes("partly") || c.includes("sun")) return CloudSun;
  return Sun;
};

export function Weather() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("current");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentWeather] = useState<CurrentWeather>(emptyCurrentWeather);
  const [hourlyForecast] = useState<HourlyForecast[]>(emptyHourlyForecast);
  const [dailyForecast] = useState<DailyForecast[]>(emptyDailyForecast);
  const [alerts] = useState<WeatherAlert[]>(emptyAlerts);

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    setIsConnected(true);
    toast({ title: "Updated", description: "Weather data refreshed", variant: "success" });
  };

  return (
    <div className="container-custom py-6 md:py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-2">
            <CloudSun className="h-8 w-8 text-agri-accent" />
            {t("nav_weather") || "Weather"}
          </h1>
          <p className="text-muted-foreground mt-1">Real-time weather for your farm</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">{t("current_weather") || "Current"}</TabsTrigger>
          <TabsTrigger value="hourly">{t("hourly_forecast") || "Hourly"}</TabsTrigger>
          <TabsTrigger value="daily">{t("daily_forecast") || "7-Day"}</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Current Conditions</CardTitle>
                <CardDescription>Live weather at your location</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 p-6 rounded-xl bg-gradient-to-br from-agri-primary/10 to-agri-secondary/10">
                  <div className="text-center md:text-left">
                    <div className="text-6xl font-bold text-primary">{formatTemperature(currentWeather.temperature)}</div>
                    <div className="text-xl text-muted-foreground capitalize">{currentWeather.condition}</div>
                    <div className="text-sm text-muted-foreground mt-1">Feels like {formatTemperature(currentWeather.feelsLike)}</div>
                  </div>
                  <Sun className="h-24 w-24 text-agri-accent/50" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Humidity", value: formatHumidity(currentWeather.humidity), icon: Droplets, color: "text-blue-500" },
                    { label: "Wind", value: formatWindSpeed(currentWeather.windSpeed, currentWeather.windDirection ? `km/h ${currentWeather.windDirection}` : "km/h"), icon: Wind, color: "text-green-500" },
                    { label: "Pressure", value: formatPressure(currentWeather.pressure), icon: Thermometer, color: "text-orange-500" },
                    { label: "Visibility", value: formatWithUnit(currentWeather.visibility, "km"), icon: Sun, color: "text-agri-accent" },
                    { label: "UV Index", value: formatValue(currentWeather.uvIndex), icon: Sun, color: "text-red-500" },
                    { label: "Sunrise", value: currentWeather.sunrise, icon: Sunrise, color: "text-yellow-500" },
                    { label: "Sunset", value: currentWeather.sunset, icon: Sunset, color: "text-orange-500" },
                    { label: "Location", value: "Current Farm", icon: MapPin, color: "text-purple-500" },
                  ].map((item) => (
                    <div key={item.label} className="p-4 rounded-lg bg-muted/50 flex items-center gap-3">
                      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", `${item.color} bg-opacity-10`)}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="font-medium">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Weather Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.title} className="p-3 rounded-lg border-l-4" style={{ borderColor: alert.type === "warning" ? "hsl(var(--warning))" : "hsl(var(--info))" }}>
                    <div className="flex items-start gap-2">
                      <alert.icon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: alert.type === "warning" ? "hsl(var(--warning))" : "hsl(var(--info))" }} />
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && <p className="text-muted-foreground text-center py-4">No weather alerts</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hourly" className="mt-6">
          <Card>
            <CardContent className="px-2">
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-2 min-w-max">
                  {hourlyForecast.map((hour) => {
                    const Icon = getConditionIcon(hour.condition);
                    const isDay = hour.hour >= 6 && hour.hour <= 18;
                    return (
                      <div key={hour.hour} className="w-20 flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
                        <span className="text-xs font-medium">{hour.hour === 0 ? "12 AM" : hour.hour === 12 ? "12 PM" : hour.hour > 12 ? `${hour.hour - 12} PM` : `${hour.hour} AM`}</span>
                        <Icon className={cn("h-6 w-6", isDay ? "text-agri-accent" : "text-muted-foreground")} />
                        <span className="text-lg font-bold">{formatTemperature(hour.temp !== null ? Math.round(hour.temp) : null)}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Droplets className="h-3 w-3" />
                          {formatPercent(hour.rain !== null ? Math.round(hour.rain) : null)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dailyForecast.map((day, i) => {
              const Icon = day.icon;
              const isToday = i === 0;
              return (
                <Card key={day.day} className={cn("transition-all hover:shadow-lg", isToday && "ring-2 ring-primary/50")}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className={cn("font-medium", isToday && "text-primary")}>{day.day}</p>
                        <p className="text-sm text-muted-foreground">{day.date}</p>
                      </div>
                      <Badge variant={isToday ? "success" : "outline"} className="text-xs">
                        {isToday ? "Today" : ""}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <Icon className="h-10 w-10 text-agri-accent" />
                      <div className="text-right">
                        <p className="text-2xl font-bold">{formatTemperature(day.high)}</p>
                        <p className="text-muted-foreground text-sm">/{formatTemperature(day.low)}</p>
                      </div>
                    </div>
                    <p className="text-sm capitalize text-muted-foreground mb-3">{day.condition}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground"><Droplets className="h-3 w-3" />{formatHumidity(day.humidity)}</div>
                      <div className="flex items-center gap-1 text-muted-foreground"><Wind className="h-3 w-3" />{formatWindSpeed(day.wind)}</div>
                      <div className="flex items-center gap-1" style={{ color: day.rain !== null && day.rain > 30 ? "hsl(var(--warning))" : "hsl(var(--muted-foreground))" }}>
                        <CloudRain className="h-3 w-3" />{formatPercent(day.rain)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}