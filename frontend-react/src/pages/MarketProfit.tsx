"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calculator,
  BarChart3,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
  Download,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  formatCurrencySafe,
  formatPercent,
  formatValue,
} from "@/lib/format";

const crops = [
  { value: "groundnut", label: "Groundnut" },
  { value: "cotton", label: "Cotton" },
  { value: "soybean", label: "Soybean" },
  { value: "maize", label: "Maize" },
  { value: "wheat", label: "Wheat" },
  { value: "rice", label: "Rice" },
];

const mandis = [
  { value: "local", label: "Local Mandi" },
  { value: "district", label: "District Mandi" },
  { value: "terminal", label: "Terminal Market" },
  { value: "export", label: "Export Market" },
];

// Empty state - shows N/A until real prices load
interface PriceData {
  crop: string;
  mandi: string;
  price: number | null;
  change: number | null;
  unit: string;
}

const emptyPriceData: PriceData[] = [
  { crop: "-", mandi: "-", price: null, change: null, unit: "quintal" },
];

interface ProfitCalc {
  revenue: number | null;
  costs: { seeds: number; fertilizer: number; labor: number; irrigation: number; other: number };
  profit: number | null;
  roi: number | null;
}

export function MarketProfit() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("prices");
  const [selectedCrop, setSelectedCrop] = useState("groundnut");
  const [selectedMandi, setSelectedMandi] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isPricesConnected, setIsPricesConnected] = useState(false);
  const [calculator, setCalculator] = useState({
    area: 0,
    yieldPerAcre: 0,
    expectedPrice: 0,
    costs: { seeds: 0, fertilizer: 0, labor: 0, irrigation: 0, other: 0 },
  });
  const [profitResult, setProfitResult] = useState<ProfitCalc | null>(null);

  // Mock data that will be used once prices are loaded (simulates real API data)
  const mockPrices = [
    { crop: "Groundnut", mandi: "Local Mandi", price: 5800, change: 2.5, unit: "quintal" },
    { crop: "Groundnut", mandi: "District Mandi", price: 6100, change: 1.8, unit: "quintal" },
    { crop: "Groundnut", mandi: "Terminal Market", price: 6400, change: 3.2, unit: "quintal" },
    { crop: "Cotton", mandi: "Local Mandi", price: 6200, change: -1.2, unit: "quintal" },
    { crop: "Cotton", mandi: "District Mandi", price: 6500, change: 0.5, unit: "quintal" },
    { crop: "Soybean", mandi: "Local Mandi", price: 4500, change: 4.1, unit: "quintal" },
    { crop: "Maize", mandi: "Local Mandi", price: 2200, change: -0.8, unit: "quintal" },
    { crop: "Wheat", mandi: "Local Mandi", price: 2400, change: 1.5, unit: "quintal" },
  ];

  const [priceData, setPriceData] = useState<PriceData[]>(emptyPriceData);

  const mandiLabel = mandis.find((m) => m.value === selectedMandi)?.label;
  const filteredPrices = isPricesConnected
    ? priceData.filter((p) =>
        p.crop.toLowerCase() === selectedCrop &&
        (selectedMandi === "all" || p.mandi === mandiLabel)
      )
    : [];

  const validPrices = filteredPrices.filter((p) => p.price !== null);
  const bestPrice = validPrices.length > 0 ? Math.max(...validPrices.map((p) => p.price as number)) : null;
  const averagePrice = validPrices.length > 0
    ? validPrices.reduce((sum, p) => sum + (p.price as number), 0) / validPrices.length
    : null;
  const validChanges = filteredPrices.filter((p) => p.change !== null);
  const priceTrend = validChanges.length > 0
    ? validChanges.reduce((sum, p) => sum + (p.change as number), 0) / validChanges.length
    : null;

  const handleRefreshPrices = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setPriceData(mockPrices.filter((p) => p.crop.toLowerCase() === selectedCrop));
    setIsLoading(false);
    setIsPricesConnected(true);
    toast({ title: "Updated", description: "Market prices refreshed", variant: "success" });
  };

  const calculateProfit = () => {
    const totalYield = calculator.area * calculator.yieldPerAcre;
    const revenue = (totalYield / 100) * calculator.expectedPrice;
    const totalCosts = Object.values(calculator.costs).reduce((a, b) => a + b, 0);
    const profit = revenue - totalCosts;
    const roi = totalCosts > 0 ? ((profit / totalCosts) * 100) : 0;
    setProfitResult({ revenue, costs: calculator.costs, profit, roi });
    toast({ title: "Calculated", description: `Expected profit: ₹${profit.toLocaleString()}`, variant: "success" });
  };

  const formatCurrency = (val: number | null | undefined) => formatCurrencySafe(val);

  return (
    <div className="container-custom py-6 md:py-10 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-agri-accent" />
            {t("nav_market") || "Market & Profit"}
          </h1>
          <p className="text-muted-foreground mt-1">Compare prices and calculate profitability</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefreshPrices}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prices">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t("market_prices") || "Market Prices"}
          </TabsTrigger>
          <TabsTrigger value="calculator">
            <Calculator className="h-4 w-4 mr-2" />
            {t("profit_calculator") || "Profit Calculator"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prices" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle>{t("current_prices") || "Current Market Prices"}</CardTitle>
                <CardDescription>Real-time mandi prices for your crops</CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder={t("select_crop")} /></SelectTrigger>
                  <SelectContent>
                    {crops.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={selectedMandi} onValueChange={setSelectedMandi}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder={t("select_mandi")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Mandis</SelectItem>
                    {mandis.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">{t("crop") || "Crop"}</th>
                      <th className="pb-3 font-medium">{t("mandi") || "Mandi"}</th>
                      <th className="pb-3 font-medium text-right">{t("price") || "Price (₹/quintal)"}</th>
                      <th className="pb-3 font-medium text-right">{t("change") || "Change"}</th>
                      <th className="pb-3 font-medium">{t("trend") || "Trend"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredPrices.length > 0 ? (
                      filteredPrices.map((item, i) => (
                        <tr key={i} className="hover:bg-muted/50">
                          <td className="py-3 font-medium">{item.crop}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {item.mandi}
                            </div>
                          </td>
                          <td className="py-3 text-right font-mono text-lg">{formatCurrency(item.price)}</td>
                          <td className="py-3 text-right">
                            <span className={cn("font-medium", item.change !== null && item.change > 0 ? "text-green-600" : item.change !== null && item.change < 0 ? "text-red-600" : "text-muted-foreground")}>
                              {item.change !== null && item.change > 0 ? "+" : ""}{formatPercent(item.change)}
                            </span>
                          </td>
                          <td className="py-3">
                            <Badge variant={item.change !== null && item.change > 0 ? "success" : item.change !== null && item.change < 0 ? "destructive" : "outline"} className="gap-1">
                              {item.change !== null && item.change > 0 ? <TrendingUp className="h-3 w-3" /> : item.change !== null && item.change < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                              {item.change === null ? "N/A" : item.change > 0 ? "Up" : item.change < 0 ? "Down" : "Stable"}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          {t("no_price_data") || "No price data available. Click Refresh to load market prices."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { title: "Best Price", value: formatCurrency(bestPrice), desc: "Highest among loaded mandis", icon: TrendingUp, color: "text-green-500" },
              { title: "Average Price", value: formatCurrency(averagePrice !== null ? Math.round(averagePrice) : null), desc: "Across loaded mandis", icon: BarChart3, color: "text-blue-500" },
              { title: "Price Trend", value: formatPercent(priceTrend !== null ? Number(priceTrend.toFixed(1)) : null), desc: "Last 7 days", icon: ArrowUpRight, color: "text-agri-accent" },
            ].map((stat, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.desc}</p>
                    </div>
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", `${stat.color} bg-opacity-10`)}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calculator" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("profit_calculator") || "Profit Calculator"}</CardTitle>
                <CardDescription>Estimate your farm profitability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>{t("farm_area") || "Farm Area (acres)"}</Label>
                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={calculator.area}
                      onChange={(e) => setCalculator({ ...calculator, area: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>{t("expected_yield") || "Expected Yield (kg/acre)"}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={calculator.yieldPerAcre}
                      onChange={(e) => setCalculator({ ...calculator, yieldPerAcre: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>{t("expected_price") || "Expected Price (₹/quintal)"}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={calculator.expectedPrice}
                      onChange={(e) => setCalculator({ ...calculator, expectedPrice: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <Separator />

                <h4 className="font-medium">{t("input_costs") || "Input Costs (₹)"}</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { key: "seeds", label: "Seeds" },
                    { key: "fertilizer", label: "Fertilizer" },
                    { key: "labor", label: "Labor" },
                    { key: "irrigation", label: "Irrigation" },
                    { key: "other", label: "Other" },
                  ].map((cost) => (
                    <div key={cost.key}>
                      <Label>{cost.label}</Label>
                      <Input
                        type="number"
                        min="0"
                        step="100"
                        value={calculator.costs[cost.key as keyof typeof calculator.costs]}
                        onChange={(e) => setCalculator({
                          ...calculator,
                          costs: { ...calculator.costs, [cost.key]: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                  ))}
                </div>

                <Button onClick={calculateProfit} className="w-full h-12" size="lg">
                  <Calculator className="h-4 w-4 mr-2" />
                  {t("calculate_profit") || "Calculate Profit"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  {t("profit_analysis") || "Profit Analysis"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profitResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                        <p className="text-sm text-muted-foreground">{t("total_revenue") || "Total Revenue"}</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(profitResult.revenue)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                        <p className="text-sm text-muted-foreground">{t("total_costs") || "Total Costs"}</p>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-400">{formatCurrency(Object.values(profitResult.costs).reduce((a, b) => a + b, 0))}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-sm text-muted-foreground">{t("net_profit") || "Net Profit"}</p>
                      <p className="text-3xl font-bold text-primary">{formatCurrency(profitResult.profit)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50 text-center">
                        <p className="text-sm text-muted-foreground">{t("roi") || "ROI"}</p>
                        <p className="text-2xl font-bold">{formatPercent(profitResult.roi)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 text-center">
                        <p className="text-sm text-muted-foreground">{t("profit_per_acre") || "Profit/Acre"}</p>
                        <p className="text-2xl font-bold">{formatCurrency(calculator.area ? profitResult.profit / calculator.area : null)}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">{t("cost_breakdown") || "Cost Breakdown"}</h4>
                      <div className="space-y-2">
                        {Object.entries(profitResult.costs).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-1 border-b last:border-0">
                            <span className="capitalize text-muted-foreground">{key}</span>
                            <span className="font-medium">{formatCurrency(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button variant="outline" onClick={() => { /* download logic */ }} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      {t("download_report") || "Download Report"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calculator className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">{t("fill_form_calculate") || "Fill the form and click calculate"}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}