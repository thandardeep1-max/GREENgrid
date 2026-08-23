"use client";

import { Link, NavLink } from "react-router-dom";
import { Globe, Menu, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeSelectorCompact } from "@/components/ThemeSelector";
import { useLanguage } from "@/context/LanguageContext";
import { useVoice } from "@/context/VoiceContext";
import { navItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const { status, toggleListening, isSupported } = useVoice();

  return (
    <header className="sticky top-0 z-sticky w-full">
      {/* Floating navbar container */}
      <nav
        className={cn(
          "container-custom flex items-center justify-between relative z-sticky",
          "mx-auto mt-[var(--navbar-top-margin)]",
          "w-[var(--navbar-width)] max-w-[var(--navbar-max-width)]",
          "h-[var(--navbar-height)]",
          "rounded-[var(--navbar-border-radius)]",
          "border border-[var(--navbar-border)]",
          "bg-[var(--navbar-bg)]",
          "backdrop-blur-md",
          "shadow-[var(--navbar-shadow)]",
          "[box-shadow:var(--navbar-shadow),var(--navbar-glow)]",
          "px-6 md:px-8",
          "transition-all duration-300",
        )}
        aria-label="Main navigation"
        role="navigation"
      >
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2" aria-label="GREENgrid Home">
            <span className="text-2xl">🌱</span>
            <span className="hidden text-xl font-bold sm:block">GREENgrid</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </NavLink>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Change language">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setLanguage("en")} className={cn(language === "en" && "bg-primary/10")}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("hi")} className={cn(language === "hi" && "bg-primary/10")}>हिंदी</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeSelectorCompact />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleListening}
            disabled={!isSupported}
            className={cn(status === "listening" && "animate-pulse text-primary")}
            aria-label={t("voice_assistant") || "Voice assistant"}
          >
            <Mic className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </nav>
    </header>
  );
}
