import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Wallet, Bot, Calendar, Pill, QrCode, LogOut, Menu, X, Bell, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { demoLogout } from "@/lib/demo-auth";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { LanguageSelector } from "@/components/LanguageSelector";

type NavItem = { to: string; labelKey: "features" | "spaces" | "logout" | string; labelDefault: string; icon: typeof LayoutDashboard; exact?: boolean; badge?: number };

export function AppShell() {
  const { user } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const { t, locale } = useTranslation();

  // Create reactive NAV links mapping dynamically to translations
  const NAV: NavItem[] = [
    { to: "/app", labelKey: "Tableau de bord", labelDefault: "Tableau de bord", icon: LayoutDashboard, exact: true },
    { to: "/app/wallet", labelKey: "Carnet santé", labelDefault: "Carnet santé", icon: Wallet },
    { to: "/app/consultant", labelKey: "Consultant IA", labelDefault: "Consultant IA", icon: Bot, badge: 1 },
    { to: "/app/appointments", labelKey: "Rendez-vous", labelDefault: "Rendez-vous", icon: Calendar },
    { to: "/app/prescriptions", labelKey: "Ordonnances", labelDefault: "Ordonnances", icon: Pill },
    { to: "/app/scan", labelKey: "Bracelet QR", labelDefault: "Bracelet QR", icon: QrCode },
  ];

  const isActive = (to: string, exact?: boolean) =>
    exact ? loc.pathname === to : loc.pathname === to || loc.pathname.startsWith(to + "/");

  const signOut = async () => {
    demoLogout(); // Clear local demo session key
    await supabase.auth.signOut();
    nav({ to: "/login" });
  };

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "AI";

  return (
    <div className="min-h-screen bg-mesh-animated bg-gradient-soft">
      {/* ─── Mobile Topbar ─── */}
      <header className="sticky top-0 z-40 glass-strong md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo withText />
          <div className="flex items-center gap-1">
            <LanguageSelector />
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse-dot" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {/* Mobile nav drawer */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-out",
            open ? "max-h-[500px] border-t border-border" : "max-h-0"
          )}
        >
          <nav className="px-2 py-2 space-y-0.5">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive(n.to, n.exact)
                    ? "bg-gradient-brand text-primary-foreground shadow-elegant"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1"
                )}
              >
                <n.icon className="h-4 w-4" />
                {t(n.labelKey as any) || n.labelDefault}
                {n.badge && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                    {n.badge}
                  </span>
                )}
              </Link>
            ))}
            <button
              onClick={signOut}
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" /> {t("logout")}
            </button>
          </nav>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* ─── Desktop Sidebar ─── */}
        <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 flex-col px-5 py-6 md:flex sidebar-glass">
          {/* Logo + Language Selector */}
          <div className="flex items-center justify-between gap-3">
            <Logo withText size={36} />
            <LanguageSelector />
          </div>
          
          <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-primary/5 px-2.5 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-semibold text-primary">
              {locale === "ar" ? "حساب المريض" : locale === "en" ? "Patient Portal" : "Espace Patient"}
            </span>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex flex-1 flex-col gap-1">
            {NAV.map((n) => {
              const active = isActive(n.to, n.exact);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "group nav-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "nav-link-active bg-gradient-brand text-primary-foreground shadow-elegant"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    locale === "ar" && "flex-row-reverse"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                      active
                        ? "bg-white/20"
                        : "bg-transparent group-hover:bg-primary/5"
                    )}
                  >
                    <n.icon className="h-4 w-4" />
                  </div>
                  <span>{t(n.labelKey as any) || n.labelDefault}</span>
                  {n.badge ? (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground animate-pulse-dot">
                      {n.badge}
                    </span>
                  ) : (
                    <ChevronRight
                      className={cn(
                        "ml-auto h-3.5 w-3.5 opacity-0 transition-all duration-200",
                        active ? "opacity-60" : "group-hover:opacity-40 group-hover:translate-x-0.5",
                        locale === "ar" && "rotate-180"
                      )}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-sidebar-border pt-4 space-y-3">
            {/* Notification row */}
            <button className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors",
              locale === "ar" && "flex-row-reverse"
            )}>
              <div className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-destructive animate-pulse-dot" />
              </div>
              <span>
                {locale === "ar" ? "الإشعارات" : locale === "en" ? "Notifications" : "Notifications"}
              </span>
              <span className="ml-auto rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">3</span>
            </button>

            {/* User card */}
            <div className={cn(
              "flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5",
              locale === "ar" && "flex-row-reverse"
            )}>
              <div className="avatar-ring">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white">
                  {initials}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{user?.email?.split("@")[0] || "Utilisateur"}</p>
                <p className="truncate text-[11px] text-muted-foreground">{user?.email || ""}</p>
              </div>
            </div>

            <button
              onClick={signOut}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200",
                locale === "ar" && "flex-row-reverse"
              )}
            >
              <LogOut className="h-4 w-4" /> {t("logout")}
            </button>
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <main className="min-h-screen flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
