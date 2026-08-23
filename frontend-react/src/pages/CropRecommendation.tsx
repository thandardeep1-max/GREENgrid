"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, CheckCircle, Loader2, Droplets, Sun, WheatOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatCurrencySafe, formatPercent, formatWithUnit, formatValue } from "@/lib/format";

const states = [
  { value: "andhra", label: "Andhra Pradesh" },
  { value: "punjab", label: "Punjab" },
  { value: "haryana", label: "Haryana" },
  { value: "up", label: "Uttar Pradesh" },
  { value: "mp", label: "Madhya Pradesh" },
  { value: "maharashtra", label: "Maharashtra" },
  { value: "gujarat", label: "Gujarat" },
  { value: "rajasthan", label: "Rajasthan" },
  { value: "karnataka", label: "Karnataka" },
  { value: "telangana", label: "Telangana" },
];

const districts: Record<string, { value: string; label: string }[]> = {
  andhra: [{ value: "guntur", label: "Guntur" }, { value: "krishna", label: "Krishna" }, { value: "west_godavari", label: "West Godavari" }],
  punjab: [{ value: "ludhiana", label: "Ludhiana" }, { value: "amritsar", label: "Amritsar" }, { value: "jalandhar", label: "Jalandhar" }],
  haryana: [{ value: "hisar", label: "Hisar" }, { value: "karnal", label: "Karnal" }, { value: "sirsa", label: "Sirsa" }],
  up: [{ value: "meerut", label: "Meerut" }, { value: "muzaffarnagar", label: "Muzaffarnagar" }, { value: "saharanpur", label: "Saharanpur" }],
  mp: [{ value: "indore", label: "Indore" }, { value: "bhopal", label: "Bhopal" }, { value: "ujjain", label: "Ujjain" }],
  maharashtra: [{ value: "pune", label: "Pune" }, { value: "nashik", label: "Nashik" }, { value: "ahmednagar", label: "Ahmednagar" }],
  gujarat: [{ value: "ahmedabad", label: "Ahmedabad" }, { value: "rajkot", label: "Rajkot" }, { value: "surat", label: "Surat" }],
  rajasthan: [{ value: "jaipur", label: "Jaipur" }, { value: "jodhpur", label: "Jodhpur" }, { value: "kota", label: "Kota" }],
  karnataka: [{ value: "bangalore", label: "Bangalore" }, { value: "mysore", label: "Mysore" }, { value: "hubli", label: "Hubli" }],
  telangana: [{ value: "hyderabad", label: "Hyderabad" }, { value: "warangal", label: "Warangal" }, { value: "nizamabad", label: "Nizamabad" }],
};

const seasons = [
  { value: "kharif", label: "Kharif (Monsoon)", icon: "🌧️" },
  { value: "rabi", label: "Rabi (Winter)", icon: "❄️" },
  { value: "zayad", label: "Zayad (Summer)", icon: "☀️" },
];

const soilTypes = [
  { value: "loamy", label: "Loamy", description: "Best for most crops" },
  { value: "clay", label: "Clay", description: "Good water retention" },
  { value: "sandy", label: "Sandy", description: "Good drainage" },
  { value: "black", label: "Black Cotton", description: "Rich in minerals" },
  { value: "red", label: "Red Soil", description: "Iron rich" },
  { value: "alluvial", label: "Alluvial", description: "River deposited" },
];

const waterSources = [
  { value: "rainfed", label: "Rainfed", description: "Monsoon dependent" },
  { value: "canal", label: "Canal Irrigation", description: "Reliable water supply" },
  { value: "well", label: "Well/Tube Well", description: "Groundwater" },
  { value: "river", label: "River/Lake", description: "Surface water" },
  { value: "drip", label: "Drip Irrigation", description: "Water efficient" },
];

const waterAvailability = [
  { value: "high", label: "High", description: "Abundant water" },
  { value: "medium", label: "Medium", description: "Adequate water" },
  { value: "low", label: "Low", description: "Limited water" },
];

const irrigationTypes = [
  { value: "flood", label: "Flood Irrigation", description: "Traditional method" },
  { value: "sprinkler", label: "Sprinkler", description: "Uniform distribution" },
  { value: "drip", label: "Drip Irrigation", description: "Most efficient" },
  { value: "manual", label: "Manual", description: "Labor intensive" },
];

// Empty state - shows N/A until real AI recommendations load
const emptyRecommendation = {
  name: "-",
  suitability: null as number | null,
  season: "-",
  waterNeed: "-",
  duration: "-",
  expectedProfit: null as number | null,
};

interface FormData {
  state: string;
  district: string;
  season: string;
  farmSize: number;
  soilType: string;
  soilPh: number;
  waterSource: string;
  waterAvailability: string;
  irrigationType: string;
  budget: number;
}

export function CropRecommendation() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Array<typeof emptyRecommendation> | null>(null);
  const [formData, setFormData] = useState<FormData>({
    state: "",
    district: "",
    season: "kharif",
    farmSize: 5,
    soilType: "loamy",
    soilPh: 6.5,
    waterSource: "rainfed",
    waterAvailability: "medium",
    irrigationType: "drip",
    budget: 50000,
  });

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "state") {
      setFormData((prev) => ({ ...prev, district: "" }));
    }
  };

  const handleNext = () => {
    if (step === 1 && (!formData.state || !formData.district || !formData.farmSize)) {
      toast({ title: "Missing fields", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    if (step === 2 && (!formData.soilType || !formData.waterSource)) {
      toast({ title: "Missing fields", description: "Please select soil and water options", variant: "destructive" });
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevious = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    // Simulate AI-generated results - in real app this would come from API
    const generatedResults = [
      { name: "Groundnut", suitability: 92, season: "Kharif", waterNeed: "Medium", duration: "120 days", expectedProfit: 45000 },
      { name: "Cotton", suitability: 88, season: "Kharif", waterNeed: "Medium-High", duration: "180 days", expectedProfit: 68000 },
      { name: "Soybean", suitability: 85, season: "Kharif", waterNeed: "Medium", duration: "100 days", expectedProfit: 38000 },
      { name: "Maize", suitability: 82, season: "Kharif", waterNeed: "High", duration: "110 days", expectedProfit: 32000 },
    ];
    setResults(generatedResults);
    setIsLoading(false);
    setStep(3);
    toast({ title: "Success", description: "Recommendations generated", variant: "success" });
  };

  const handleRestart = () => {
    setStep(1);
    setResults(null);
    setFormData({
      state: "",
      district: "",
      season: "kharif",
      farmSize: 5,
      soilType: "loamy",
      soilPh: 6.5,
      waterSource: "rainfed",
      waterAvailability: "medium",
      irrigationType: "drip",
      budget: 50000,
    });
  };

  const StepIndicator = ({ step: currentStep }: { step: number }) => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all",
              currentStep >= s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {currentStep > s ? <CheckCircle className="h-5 w-5" /> : s}
          </div>
          {s < 3 && (
            <div
              className={cn(
                "w-16 h-1",
                currentStep > s ? "bg-primary" : "bg-muted",
              )}
            />
          )}
          <span className="hidden sm:block text-xs text-muted-foreground w-24 text-center">
            {s === 1 && (t("step_location") || "Location")}
            {s === 2 && (t("step_soil") || "Soil & Water")}
            {s === 3 && (t("step_results") || "Results")}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container-custom py-6 md:py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-2">
          <WheatOff className="h-8 w-8 text-agri-secondary" />
          {t("crop_rec") || "Crop Recommendation"}
        </h1>
        <p className="text-muted-foreground mt-1">{t("crop_rec_subtitle")}</p>
      </div>

      <StepIndicator step={step} />

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("step_location") || "Location & Season"}</CardTitle>
            <CardDescription>{t("location_season")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{t("state") || "State"}</Label>
                <Select value={formData.state} onValueChange={(v) => handleChange("state", v)}>
                  <SelectTrigger><SelectValue placeholder={t("select_state")} /></SelectTrigger>
                  <SelectContent>
                    {states.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("district") || "District"}</Label>
                <Select value={formData.district} onValueChange={(v) => handleChange("district", v)} disabled={!formData.state}>
                  <SelectTrigger><SelectValue placeholder={t("select_district") || "Select District"} /></SelectTrigger>
                  <SelectContent>
                    {districts[formData.state]?.map((d) => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("season") || "Season"}</Label>
                <Select value={formData.season} onValueChange={(v) => handleChange("season", v)}>
                  <SelectTrigger><SelectValue placeholder={t("select_season")} /></SelectTrigger>
                  <SelectContent>
                    {seasons.map((s) => (
                      <SelectItem key={s.value} value={s.value} className="flex items-center gap-2">
                        <span>{s.icon}</span>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("farm_size") || "Farm Size (Acres)"}</Label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.farmSize}
                  onChange={(e) => handleChange("farmSize", parseFloat(e.target.value) || 0)}
                  placeholder="5"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={handleNext} className="ml-auto">
                {t("next") || "Next"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("step_soil") || "Soil & Water Availability"}</CardTitle>
            <CardDescription>{t("soil_water")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>{t("soil_type") || "Soil Type"}</Label>
              <div className="grid gap-3 sm:grid-cols-2 mt-2">
                {soilTypes.map((st) => (
                  <label
                    key={st.value}
                    className={cn(
                      "relative cursor-pointer p-4 rounded-lg border-2 transition-colors",
                      formData.soilType === st.value
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50",
                    )}
                  >
                    <RadioGroupItem value={st.value} className="sr-only peer" />
                    <div className="font-medium">{t(st.label.toLowerCase()) || st.label}</div>
                    <div className="text-xs text-muted-foreground">{st.description}</div>
                  </label>
                ))}
              </div>
              <RadioGroup value={formData.soilType} onValueChange={(v) => handleChange("soilType", v)} className="sr-only" />
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{t("soil_ph") || "Soil pH"}</Label>
                <Input
                  type="number"
                  min="3"
                  max="9"
                  step="0.1"
                  value={formData.soilPh}
                  onChange={(e) => handleChange("soilPh", parseFloat(e.target.value) || 6.5)}
                />
              </div>
              <div>
                <Label>{t("water_source") || "Water Source"}</Label>
                <Select value={formData.waterSource} onValueChange={(v) => handleChange("waterSource", v)}>
                  <SelectTrigger><SelectValue placeholder={t("select_water")} /></SelectTrigger>
                  <SelectContent>
                    {waterSources.map((w) => (
                      <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("water_avail") || "Water Availability"}</Label>
                <Select value={formData.waterAvailability} onValueChange={(v) => handleChange("waterAvailability", v)}>
                  <SelectTrigger><SelectValue placeholder={t("select_avail")} /></SelectTrigger>
                  <SelectContent>
                    {waterAvailability.map((w) => (
                      <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("irrigation_type") || "Irrigation Type"}</Label>
                <Select value={formData.irrigationType} onValueChange={(v) => handleChange("irrigationType", v)}>
                  <SelectTrigger><SelectValue placeholder={t("select_irrigation")} /></SelectTrigger>
                  <SelectContent>
                    {irrigationTypes.map((i) => (
                      <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("budget") || "Budget (₹)"}</Label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.budget}
                  onChange={(e) => handleChange("budget", parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("previous") || "Previous"}
              </Button>
              <Button onClick={handleNext}>
                {t("next") || "Next"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("step_results") || "Recommendations"}</CardTitle>
            <CardDescription>Based on your farm conditions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-lg">{t("get_recommendation") || "Generating recommendations..."}</span>
              </div>
            ) : results ? (
              <div className="space-y-4">
                {results.map((crop, i) => (
                  <div
                    key={crop.name}
                    className={cn(
                      "p-4 rounded-lg border transition-all",
                      i === 0 ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <WheatOff className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{crop.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Sun className="h-3 w-3" />{crop.season}</span>
                            <span className="flex items-center gap-1"><Droplets className="h-3 w-3" />{crop.waterNeed}</span>
                            <span className="flex items-center gap-1"><WheatOff className="h-3 w-3" />{crop.duration}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{formatCurrencySafe(crop.expectedProfit)}</div>
                        <div className="text-sm text-muted-foreground">Expected Profit</div>
                        <Badge variant={crop.suitability !== null && crop.suitability > 90 ? "success" : crop.suitability !== null && crop.suitability > 85 ? "default" : "outline"} className="mt-2">
                          {formatPercent(crop.suitability)} {t("suitability") || "Suitability"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <WheatOff className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">Complete the form to get recommendations</p>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("previous") || "Modify Inputs"}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRestart}>
                  {t("modify_inputs") || "Start Over"}
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading || !!results}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("get_recommendation") || "Loading..."}
                    </>
                  ) : results ? (
                    <>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      {t("modify_inputs") || "Modify Inputs"}
                    </>
                  ) : (
                    <>
                      {t("get_recommendation") || "Get Recommendation"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}