"use client";

import { useState } from "react";
import {
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  CloudRain,
  Droplets,
  Leaf,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { formatDuration, formatProgress, formatValue } from "@/lib/format";

const cropStages = [
  { key: "sowing", label: "Sowing", days: "1-15", icon: "🌱" },
  { key: "germination", label: "Germination", days: "16-25", icon: "🌿" },
  { key: "vegetative", label: "Vegetative", days: "26-60", icon: "🌾" },
  { key: "flowering", label: "Flowering", days: "61-85", icon: "🌸" },
  { key: "pod", label: "Pod Formation", days: "86-110", icon: "🫘" },
  { key: "harvest", label: "Harvest", days: "111-120", icon: "🚜" },
];

// Empty state - shows N/A until real crop data loads
interface CropData {
  name: string | null;
  day: number | null;
  totalDays: number | null;
  stage: string | null;
}

const emptyCrop: CropData = {
  name: null,
  day: null,
  totalDays: null,
  stage: null,
};

interface Task {
  id: number;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  icon: typeof Droplets;
  completed: boolean;
}

interface WeatherAlertData {
  title: string;
  description: string;
  icon: typeof CloudRain;
}

export function CropCalendar() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentCrop, setCurrentCrop] = useState<CropData>(emptyCrop);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [weatherAlert, setWeatherAlert] = useState<WeatherAlertData | null>(null);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });
  const cropProgress =
    currentCrop.day !== null && currentCrop.totalDays !== null && currentCrop.totalDays > 0
      ? (currentCrop.day / currentCrop.totalDays) * 100
      : null;

  const getStageForDay = (day: number) => {
    if (day <= 15) return "sowing";
    if (day <= 25) return "germination";
    if (day <= 60) return "vegetative";
    if (day <= 85) return "flowering";
    if (day <= 110) return "pod";
    return "harvest";
  };

  return (
    <div className="container-custom py-6 md:py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-2">
          <CalendarDays className="h-8 w-8 text-agri-accent" />
          {t("crop_calendar") || "Crop Calendar"}
        </h1>
        <p className="text-muted-foreground mt-1">{t("crop_calendar_subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="calendar">{t("crop_calendar") || "Calendar"}</TabsTrigger>
              <TabsTrigger value="timeline">{t("crop_calendar_timeline") || "Growth Timeline"}</TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">{monthName}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
                      Today
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDayOfMonth }, (_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      const isToday = day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth();
                      const isCurrentCropDay = currentCrop.day !== null && day === currentCrop.day;
                      const stage = getStageForDay(day);
                      return (
                        <div
                          key={day}
                          className={cn(
                            "aspect-square relative rounded-lg border p-1 text-xs flex flex-col",
                            isToday && "bg-primary/10 border-primary",
                            isCurrentCropDay && "bg-agri-primary/10 border-agri-primary ring-2 ring-agri-primary/20",
                          )}
                        >
                          <span className={cn("font-medium", isToday && "text-primary", isCurrentCropDay && "text-agri-primary")}>
                            {day}
                          </span>
                          {isCurrentCropDay && (
                            <span className="text-[10px] bg-agri-primary text-primary-foreground px-1 rounded truncate">
                              {t("crop_calendar_day") || `Day ${formatDuration(currentCrop.day, "")}`}
                            </span>
                          )}
                          {stage !== "sowing" && day <= 120 && (
                            <span className="text-[9px] text-muted-foreground truncate capitalize">{stage}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              <Card>
                <CardContent className="space-y-4">
                  {cropStages.map((stage) => {
                    const isCurrent = currentCrop.stage !== null && stage.key === currentCrop.stage;
                    const currentStageIndex = currentCrop.stage !== null ? ["sowing", "germination", "vegetative", "flowering", "pod", "harvest"].indexOf(currentCrop.stage) : -1;
                    const stageIndex = ["sowing", "germination", "vegetative", "flowering", "pod", "harvest"].indexOf(stage.key);
                    const isPast = currentStageIndex !== -1 && stageIndex < currentStageIndex;
                    return (
                      <div
                        key={stage.key}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-lg border transition-all",
                          isCurrent ? "border-primary bg-primary/5" : "border-muted",
                        )}
                      >
                        <div
                          className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl",
                            isCurrent ? "bg-primary text-primary-foreground" : isPast ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted",
                          )}
                        >
                          {isPast ? <CheckCircle className="h-6 w-6" /> : stage.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{t(`stage_${stage.key}`) || stage.label}</span>
                            {isCurrent && currentCrop.day !== null && <Badge variant="success" className="text-xs">{t("crop_calendar_day") || `Day ${currentCrop.day}`}</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{t(`stage_${stage.key}_desc`) || `Days ${stage.days}`}</p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <span>{stage.days}</span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-agri-accent" />
                {formatValue(currentCrop.name)}
              </CardTitle>
              <CardDescription>
                {currentCrop.day !== null && currentCrop.totalDays !== null
                  ? `${t("crop_calendar_day") || `Day ${formatDuration(currentCrop.day, "")} / ${formatDuration(currentCrop.totalDays, "")}`}
                  : t("add_crop_to_view") || "Add a crop to view progress"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-24 rounded-lg bg-gradient-to-br from-agri-primary/10 to-agri-accent/10 flex items-center justify-center">
                <Leaf className="h-12 w-12 text-agri-primary/50" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{currentCrop.stage ? t(`stage_${currentCrop.stage}`) || currentCrop.stage : "N/A"}</span>
                  <span className="font-medium">{formatProgress(cropProgress)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${cropProgress ?? 0}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-agri-primary" />
                {t("today_tasks") || "Today's Tasks"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayTasks.length > 0 ? (
                todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "p-3 rounded-lg border flex items-start gap-3",
                      task.completed ? "bg-green-50 border-green-200 dark:bg-green-900/20" : "bg-muted/50",
                    )}
                  >
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0", task.completed ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary")}>
                      {task.completed ? <CheckCircle className="h-5 w-5" /> : <task.icon className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.description}</p>
                      <Badge variant={task.priority === "high" ? "destructive" : "outline"} className="mt-1 text-xs">
                        {task.priority === "high" ? t("priority_high") : t("priority_medium")}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">{t("no_tasks_today") || "No tasks for today. Add a crop to see tasks."}</p>
              )}
              <Button variant="outline" size="sm" className="w-full mt-2">
                <Plus className="h-4 w-4 mr-2" />
                {t("add_new_crop") || "Add New Crop"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudRain className="h-5 w-5 text-blue-500" />
                {t("weather_impact") || "Weather Impact"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {weatherAlert ? (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <weatherAlert.icon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{weatherAlert.title}</p>
                      <p className="text-sm text-muted-foreground">{weatherAlert.description}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">{t("no_weather_alerts") || "No weather alerts at this time"}</p>
              )}
              <Button variant="outline" size="sm" className="w-full">
                {t("view_weather") || "View Full Forecast"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-agri-accent" />
                {t("expert_tip") || "Expert Tip"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {language === "hi"
                  ? "वानस्पतिक चरण में नाइट्रोजन की कम मात्रा दें। फूल आने से पहले फास्फोरस बढ़ाएं।"
                  : "Reduce nitrogen during vegetative stage. Increase phosphorus before flowering."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}