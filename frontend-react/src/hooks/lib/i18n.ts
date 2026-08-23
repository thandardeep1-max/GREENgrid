import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const en = {
  nav_home: "Home",
  nav_soil: "Soil",
  nav_calendar: "Calendar",
  nav_weather: "Weather",
  nav_disease: "Disease Detection",
  nav_market: "Market & Profit",
  nav_crop: "Crop Recommendation",
  greeting: "Good Morning",
  welcome: "Welcome to GREENgrid",
  tagline: "Your complete farming assistant",
  quick_actions: "Quick Actions",
  features: "Features",
  test_soil: "Test Soil",
  recommend_crop: "Recommend Crop",
  detect_disease: "Detect Disease",
  voice_assistant: "Voice Assistant",
};

const hi = {
  nav_home: "होम",
  nav_soil: "मिट्टी",
  nav_calendar: "कैलेंडर",
  nav_weather: "मौसम",
  nav_disease: "रोग पहचान",
  nav_market: "बाजार और मुनाफा",
  nav_crop: "फसल सिफारिश",
  greeting: "सुप्रभात",
  welcome: "GREENgrid में आपका स्वागत है",
  tagline: "आपका पूर्ण कृषि सहायक",
  quick_actions: "त्वरित कार्य",
  features: "विशेषताएँ",
  test_soil: "मिट्टी जाँचें",
  recommend_crop: "फसल सुझाएं",
  detect_disease: "रोग पहचानें",
  voice_assistant: "वॉइस असिस्टेंट",
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "agrismart-language",
    },
  });

export default i18n;
