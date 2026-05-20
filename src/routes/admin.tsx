import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, LogOut, Menu, X, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/hooks/use-role";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { demoLogout } from "@/lib/demo-auth";
import { LanguageSelector } from "@/components/LanguageSelector";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

const NAV = [
  { to: "/admin", label: "Tableau éditeur", icon: LayoutDashboard, exact: true },
  { to: "/admin/patients", label: "Patients", icon: Users },
];

function AdminLayout() {
  const { user, loading } = useAuth();
  const { role, loading: roleLoading, isAdmin } = useRole();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [user, loading, nav]);

  useEffect(() => {
    if (!roleLoading && user && role && !isAdmin) {
      toast.error("Accès éditeur requis.");
      nav({ to: "/app" });
    }
  }, [roleLoading, role, isAdmin, user, nav]);

  const isActive = (to: string, exact?: boolean) =>
    exact ? loc.pathname === to : loc.pathname === to || loc.pathname.startsWith(to + "/");

  const signOut = async () => {
    demoLogout();
    await supabase.auth.signOut();
    nav({ to: "/login" });
  };

  if (loading || roleLoading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-soft">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Logo withText />
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">Éditeur</span>
          </div>
          <div className="flex items-center gap-1">
            <LanguageSelector />
            <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-border px-2 py-2">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                className={cn("flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium",
                  isActive(n.to, n.exact) ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted")}>
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            ))}
            <button onClick={signOut} className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">
              <LogOut className="h-4 w-4" /> Déconnexion
            </button>
          </nav>
        )}
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar px-4 py-6 md:flex">
          <div className="flex items-center justify-between gap-2">
            <Logo withText size={36} />
            <LanguageSelector />
          </div>
          <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Espace éditeur
          </div>
          <nav className="mt-6 flex flex-1 flex-col gap-1">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to}
                className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(n.to, n.exact)
                    ? "bg-gradient-brand text-primary-foreground shadow-elegant"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent")}>
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-sidebar-border p-3">
            <div className="flex items-center justify-between rounded-xl bg-muted/50 p-2">
              <div className="flex flex-col min-w-0 pr-2">
                <span className="truncate text-xs font-semibold text-foreground">Utilisateur</span>
                <span className="truncate text-[10px] text-muted-foreground">{user.email}</span>
              </div>
              <button 
                onClick={signOut} 
                title="Déconnexion"
                className="flex shrink-0 items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        <main className="min-h-screen flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
