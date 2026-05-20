import { Globe, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTranslation, type Locale, setLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LANGUAGES: { code: Locale; name: string; flag: string }[] = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "ar", name: "العربية", flag: "🇩🇿" },
  { code: "en", name: "English", flag: "🇬🇧" }
];

export function LanguageSelector({ className }: { className?: string }) {
  const { locale } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  return (
    <div ref={containerRef} className={cn("relative z-50", className)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-semibold bg-white/40 backdrop-blur-md transition-all duration-200 hover:bg-white/70 hover:shadow-sm active:scale-95",
          locale === "ar" && "font-sans"
        )}
      >
        <Globe className="h-3.5 w-3.5 text-muted-foreground animate-pulse-glow" />
        <span>{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.name}</span>
      </button>

      {open && (
        <div
          className={cn(
            "absolute mt-2 w-40 rounded-2xl border border-border bg-card/95 p-1.5 shadow-elegant backdrop-blur-md animate-fade-slide-up",
            locale === "ar" ? "left-0" : "right-0"
          )}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLocale(lang.code);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150 hover:bg-muted text-left",
                locale === "ar" && "text-right flex-row-reverse",
                locale === lang.code ? "text-primary bg-primary/5 font-semibold" : "text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
              {locale === lang.code && <Check className="h-3 w-3 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
