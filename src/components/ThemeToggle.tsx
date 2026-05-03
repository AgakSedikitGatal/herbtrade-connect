import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle = ({ className, showLabel = false }: ThemeToggleProps) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "light" ? "light" : "dark";
  const nextTheme = currentTheme === "light" ? "dark" : "light";
  const label = currentTheme === "light" ? "Switch to dark theme" : "Switch to light theme";

  return (
    <Button
      type="button"
      variant="outline"
      size={showLabel ? "default" : "icon"}
      aria-label={label}
      title={label}
      disabled={!mounted}
      onClick={() => setTheme(nextTheme)}
      className={cn(
        "border-primary/40 bg-background/60 text-foreground hover:bg-primary/10 hover:text-primary",
        showLabel && "gap-2 justify-start",
        className
      )}
    >
      {currentTheme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {showLabel && <span>{currentTheme === "light" ? "Light Theme" : "Dark Theme"}</span>}
    </Button>
  );
};
