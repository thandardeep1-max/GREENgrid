import { Routes, Route, Navigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Dashboard } from "@/pages/Dashboard";
import { SoilTesting } from "@/pages/SoilTesting";
import { CropRecommendation } from "@/pages/CropRecommendation";
import { CropCalendar } from "@/pages/CropCalendar";
import { Weather } from "@/pages/Weather";
import { DiseaseDetection } from "@/pages/DiseaseDetection";
import { MarketProfit } from "@/pages/MarketProfit";

export function App() {
  return (
    <PageLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/soil-testing" element={<SoilTesting />} />
        <Route path="/crop-recommendation" element={<CropRecommendation />} />
        <Route path="/crop-calendar" element={<CropCalendar />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/disease-detection" element={<DiseaseDetection />} />
        <Route path="/market-profit" element={<MarketProfit />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageLayout>
  );
}

export default App;