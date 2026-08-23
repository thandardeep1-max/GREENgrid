"use client";

import { Fragment } from "react";
import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/constants";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeSelectorCompact } from "@/components/ThemeSelector";

export function MobileNav({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { language, setLanguage, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <Fragment>
      <div className="fixed inset-0 z-modal-backdrop bg-black/50" onClick={onClose} aria-hidden="true" />
      <aside
        className="fixed inset-y-0 right-0 z-modal w-72 border-l bg-background p-4 shadow-xl animate-in slide-in-from-right"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg font-semibold">Menu</span>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1" aria-label="Main navigation">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                      )}
                  >
                    {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
                    {t(item.title.toLowerCase().replace(" ", "_"))}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-4 border-t pt-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">{t("language")}</p>
              <div className="flex gap-2">
                <Button
                  variant={language === "en" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLanguage("en")}
                  className="flex-1"
                >
                  English
                </Button>
                <Button
                  variant={language === "hi" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLanguage("hi")}
                  className="flex-1"
                >
                  हिंदी
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">{t("theme")}</p>
              <ThemeSelectorCompact />
            </div>
          </div>
        </div>
      </aside>
    </Fragment>
  );
}