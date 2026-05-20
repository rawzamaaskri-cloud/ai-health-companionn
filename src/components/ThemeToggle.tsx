import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white/40 backdrop-blur-md transition-all duration-200 hover:bg-white/70 hover:shadow-sm active:scale-95 dark:bg-black/40 dark:hover:bg-black/70",
        className
      )}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Moon className="h-4 w-4 text-primary" />
      ) : (
        <Sun className="h-4 w-4 text-primary" />
      )}
    </button>
  );
}
