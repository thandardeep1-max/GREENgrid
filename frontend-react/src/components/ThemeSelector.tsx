"use client";

import { useId } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import type { Theme } from "@/types";

// Theme selector built on the shadcn RadioGroup. Each option shows a preview
// image (filled from Unsplash) plus an icon + label.
const themeOptions: {
  value: Theme;
  label: string;
  icon: typeof Sun;
  image: string;
}[] = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
    image:
      "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=320&q=80",
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=320&q=80",
  },
  {
    value: "system",
    label: "System",
    icon: Monitor,
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=320&q=80",
  },
];

export function ThemeSelector() {
  const id = useId();
  const { theme, setTheme } = useTheme();

  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-medium leading-none text-foreground">
        Choose a theme
      </legend>
      <RadioGroup
        className="grid grid-cols-3 gap-3"
        value={theme}
        onValueChange={(value) => setTheme(value as Theme)}
      >
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const optionId = `${id}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                "relative flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-muted bg-popover p-2 transition-colors hover:border-primary/50",
                theme === option.value && "border-primary",
              )}
            >
              <span className="sr-only">{option.label}</span>
              <img
                src={option.image}
                alt={`${option.label} theme preview`}
                className="h-16 w-full rounded-md object-cover"
                loading="lazy"
              />
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{option.label}</span>
                <RadioGroupItem
                  id={optionId}
                  value={option.value}
                  className="ml-auto"
                />
              </div>
            </label>
          );
        })}
      </RadioGroup>
    </fieldset>
  );
}

export function ThemeSelectorCompact() {
  const { theme, setTheme } = useTheme();
  const options: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <RadioGroup
      className="flex gap-1 rounded-full border bg-muted/50 p-1"
      value={theme}
      onValueChange={(value) => setTheme(value as Theme)}
    >
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <div key={option.value}>
            <RadioGroupItem
              value={option.value}
              id={`compact-${option.value}`}
              className="peer sr-only"
            />
            <Label
              htmlFor={`compact-${option.value}`}
              className={cn(
                "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-background",
                theme === option.value && "bg-background text-primary shadow-sm",
              )}
              title={option.label}
            >
              <Icon className="h-4 w-4" />
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
}
