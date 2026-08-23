"use client";

import { Link } from "react-router-dom";
import { Heart, Twitter, Github, Linkedin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  const footerLinks = [
    { title: "nav_home", href: "/" },
    { title: "nav_soil", href: "/soil-testing" },
    { title: "nav_crop", href: "/crop-recommendation" },
    { title: "nav_calendar", href: "/crop-calendar" },
    { title: "nav_weather", href: "/weather" },
    { title: "nav_disease", href: "/disease-detection" },
    { title: "nav_market", href: "/market-profit" },
  ];

  return (
    <footer className="border-t bg-muted/30">
      <div className="container-custom py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4" aria-label="GREENgrid Home">
              <span className="text-2xl font-bold text-primary">🌱</span>
              <span className="font-bold text-xl">GREENgrid</span>
            </Link>
            <p className="text-muted-foreground max-w-xs mb-6">
              {t("tagline") || "Your complete farming assistant for smarter agriculture decisions."}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("quick_actions")}</h3>
            <ul className="space-y-2">
              {footerLinks.slice(0, 4).map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(link.title)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("features")}</h3>
            <ul className="space-y-2">
              {footerLinks.slice(4).map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(link.title)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t pt-8">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GREENgrid. Made with <Heart className="inline h-4 w-4 text-red-500" /> for farmers.
          </p>
          <p className="text-sm text-muted-foreground">
            Smart Agriculture Assistant v1.0.0
          </p>
        </div>
      </div>
    </footer>
  );
}