"use client";

import { useState, useRef } from "react";
import {
  Camera,
  Loader2,
  AlertCircle,
  X,
  Search,
  Download,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { formatConfidence } from "@/lib/format";

const mockDiseases = [
  { name: "Leaf Spot", confidence: 94, severity: "High", treatment: "Apply copper-based fungicide. Remove affected leaves." },
  { name: "Powdery Mildew", confidence: 87, severity: "Medium", treatment: "Spray sulfur or neem oil. Improve air circulation." },
  { name: "Rust", confidence: 82, severity: "High", treatment: "Use resistant varieties. Apply fungicide at first sign." },
  { name: "Healthy", confidence: 96, severity: "None", treatment: "No treatment needed. Continue good practices." },
];

const mockHistory: { id: number; date: string; crop: string; disease: string; confidence: number; image: string }[] = [];

export function DiseaseDetection() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("detect");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<typeof mockDiseases[0] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const handleCameraCapture = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setIsAnalyzing(true);
    await new Promise((r) => setTimeout(r, 3000));
    const randomResult = mockDiseases[Math.floor(Math.random() * mockDiseases.length)];
    setResult(randomResult);
    setIsAnalyzing(false);
    toast({
      title: "Analysis Complete",
      description: `Detected: ${randomResult.name} (${randomResult.confidence}% confidence)`,
      variant: randomResult.severity === "High" ? "destructive" : "success",
    });
  };

  const handleClear = () => {
    setImage(null);
    setImageFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = () => {
    if (!result) return;
    const report = {
      timestamp: new Date().toISOString(),
      image: imageFile?.name,
      result,
      recommendations: result.treatment,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `disease-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: "Report saved", variant: "success" });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High": return "destructive";
      case "Medium": return "warning";
      case "Low": return "default";
      default: return "success";
    }
  };

  return (
    <div className="container-custom py-6 md:py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-2">
          <Search className="h-8 w-8 text-red-500" />
          {t("nav_disease") || "Disease Detection"}
        </h1>
        <p className="text-muted-foreground mt-1">{t("disease_detection_subtitle") || "AI-powered crop disease identification"}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="detect">{t("detect_disease") || "Detect Disease"}</TabsTrigger>
          <TabsTrigger value="history">{t("history") || "History"}</TabsTrigger>
        </TabsList>

        <TabsContent value="detect" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("upload_image") || "Upload Crop Image"}</CardTitle>
                <CardDescription>Take a photo or upload an image of the affected plant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-square rounded-xl border-2 border-dashed border-muted overflow-hidden">
                  {image ? (
                    <div className="absolute inset-0">
                      <img src={image} alt="Crop preview" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button variant="ghost" size="icon" onClick={handleClear}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
                      <Camera className="h-12 w-12 text-muted-foreground/50" />
                      <p className="text-muted-foreground">{t("drag_drop_image") || "Drag & drop an image"}</p>
                      <p className="text-xs text-muted-foreground">or</p>
                      <Button variant="outline" onClick={handleCameraCapture}>
                        <Camera className="h-4 w-4 mr-2" />
                        {t("take_photo") || "Take Photo"}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileSelect}
                        className="sr-only"
                      />
                    </div>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    onClick={handleCameraCapture}
                    disabled={!!image}
                    variant={image ? "outline" : "secondary"}
                    className="h-12"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {t("retake") || "Retake Photo"}
                  </Button>
                  <Button
                    onClick={handleClear}
                    disabled={!image}
                    variant="ghost"
                    className="h-12"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {t("clear") || "Clear"}
                  </Button>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={!image || isAnalyzing}
                  size="lg"
                  className="w-full h-12"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("analyzing") || "Analyzing..."}
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      {t("analyze") || "Analyze Disease"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("results") || "Analysis Results"}</CardTitle>
                <CardDescription>AI-powered disease identification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p className="text-lg font-medium">{t("analyzing_image") || "Analyzing image..."}</p>
                    <p className="text-sm text-muted-foreground mt-1">This may take a few seconds</p>
                    <Progress value={50} className="w-full max-w-xs mt-4" />
                  </div>
                ) : result ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border bg-muted/50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">{result.name}</h3>
                        <Badge variant={getSeverityColor(result.severity)}>{result.severity}</Badge>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Confidence</span>
                          <span className="font-medium">{formatConfidence(result.confidence)}</span>
                        </div>
                        <Progress value={result.confidence} className="h-2" />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {t("treatment") || "Recommended Treatment"}
                      </h4>
                      <p className="text-sm">{result.treatment}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleDownload} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        {t("download_report") || "Download Report"}
                      </Button>
                      <Button variant="secondary" onClick={handleClear} className="flex-1">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        {t("new_scan") || "New Scan"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">{t("upload_to_analyze") || "Upload an image to start analysis"}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("scan_history") || "Scan History"}</CardTitle>
              <CardDescription>Previous disease detection results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockHistory.length > 0 ? (
                  mockHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                        {item.image}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.crop}</p>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={item.confidence > 90 ? "success" : "default"}>
                          {item.disease}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{formatConfidence(item.confidence)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    {t("no_scan_history") || "No scan history yet. Analyze a crop image to get started."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>{t("common_diseases") || "Common Crop Diseases"}</CardTitle>
            <CardDescription>Quick reference for common diseases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {mockDiseases.map((disease) => (
                <div key={disease.name} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <h4 className="font-medium mb-1">{disease.name}</h4>
                  <Badge variant={getSeverityColor(disease.severity)} className="mb-2">{disease.severity}</Badge>
                  <p className="text-sm text-muted-foreground">{disease.treatment.split(".")[0]}.</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}