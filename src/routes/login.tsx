import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, ShieldCheck, Stethoscope, Building2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_ACCOUNTS, demoLogin, isDemoMode, getDemoUser, type DemoRole } from "@/lib/demo-auth";
import { useTranslation } from "@/lib/i18n";
import { LanguageSelector } from "@/components/LanguageSelector";

export const Route = createFileRoute("/login")({ component: Login });

type Space = "patient" | "doctor" | "pharmacy" | "admin";
type LoginMessage = { title: string; description: string } | null;

const SPACE_COLORS: Record<Space, { bg: string; text: string; border: string; gradient: string }> = {
  patient: { bg: "bg-rose-500/10", text: "text-rose-600", border: "border-rose-400", gradient: "from-rose-500 to-pink-600" },
  doctor: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-400", gradient: "from-blue-500 to-indigo-600" },
  pharmacy: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-400", gradient: "from-emerald-500 to-teal-600" },
  admin: { bg: "bg-violet-500/10", text: "text-violet-600", border: "border-violet-400", gradient: "from-violet-500 to-purple-600" },
};

async function resolveAndRedirect(userId: string, space: Space, nav: ReturnType<typeof useNavigate>) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as string);

  const spaceRouteMap: Record<Space, string> = {
    patient: "/app",
    doctor: "/doctor",
    pharmacy: "/pharmacy",
    admin: "/admin",
  };

  if (space !== "patient" && !roles.includes(space)) {
    toast.error(`Ce compte n'a pas accès à l'espace ${space}.`);
    await supabase.auth.signOut();
    return;
  }
  nav({ to: spaceRouteMap[space] });
}

function Login() {
  const nav = useNavigate();
  const [space, setSpace] = useState<Space>("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState<LoginMessage>(null);
  const { t, locale } = useTranslation();

  const SPACES = [
    { value: "patient" as Space, icon: Heart, label: locale === "ar" ? "مريض" : locale === "en" ? "Patient" : "Patient" },
    { value: "doctor" as Space, icon: Stethoscope, label: locale === "ar" ? "طبيب" : locale === "en" ? "Doctor" : "Médecin" },
    { value: "pharmacy" as Space, icon: Building2, label: locale === "ar" ? "صيدلية" : locale === "en" ? "Pharmacy" : "Pharmacie" },
    { value: "admin" as Space, icon: ShieldCheck, label: locale === "ar" ? "مشرف" : locale === "en" ? "Admin" : "Admin" },
  ];

  useEffect(() => {
    // If already in demo mode, redirect
    if (isDemoMode()) {
      const demo = getDemoUser();
      if (demo) {
        const routeMap: Record<string, string> = { patient: "/app", doctor: "/doctor", pharmacy: "/pharmacy", admin: "/admin" };
        nav({ to: routeMap[demo.role] || "/app" });
        return;
      }
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.session.user.id);
        const r = (roles ?? []).map((x) => x.role as string);
        if (r.includes("admin")) nav({ to: "/admin" });
        else if (r.includes("doctor")) nav({ to: "/doctor" });
        else if (r.includes("pharmacy")) nav({ to: "/pharmacy" });
        else nav({ to: "/app" });
      }
    });
  }, [nav]);

  const handleDemoLogin = (role: DemoRole) => {
    const user = demoLogin(role);
    const routeMap: Record<DemoRole, string> = {
      patient: "/app",
      doctor: "/doctor",
      pharmacy: "/pharmacy",
      admin: "/admin",
    };
    const welcomeMsg = locale === "ar" ? `مرحباً ${user.name} !` : `Bienvenue ${user.name} !`;
    const descMsg = locale === "ar" ? `وضع التجربة — مساحة ${role === "doctor" ? "الطبيب" : role === "pharmacy" ? "الصيدلية" : role === "admin" ? "المشرف" : "المريض"}` : `Mode démo — Espace ${role === "doctor" ? "Médecin" : role === "pharmacy" ? "Pharmacie" : role === "admin" ? "Administrateur" : "Patient"}`;
    toast.success(welcomeMsg, {
      description: descMsg,
    });
    nav({ to: routeMap[role] });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMessage(null);
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      const msg = { title: "Adresse email invalide", description: "Vérifiez le format (ex. nom@domaine.com)." };
      setLoginMessage(msg);
      toast.error(msg.title, { description: msg.description });
      return;
    }
    if (password.length < 6) {
      const msg = { title: "Mot de passe trop court", description: "Le mot de passe doit contenir au moins 6 caractères." };
      setLoginMessage(msg);
      toast.error(msg.title, { description: msg.description });
      return;
    }

    // Check if it's a demo account
    const demoEntry = Object.entries(DEMO_ACCOUNTS).find(
      ([, acc]) => acc.email === trimmedEmail && acc.password === password
    );
    if (demoEntry) {
      handleDemoLogin(demoEntry[0] as DemoRole);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
    setLoading(false);

    if (error) {
      const code = (error as { code?: string }).code ?? "";
      const status = (error as { status?: number }).status;
      if (code === "invalid_credentials" || status === 400) {
        const msg = { title: "Connexion refusée", description: "L'email ou le mot de passe ne correspond pas." };
        setLoginMessage(msg);
        toast.error(msg.title, { description: msg.description, duration: 6000 });
        return;
      }
      if (code === "email_not_confirmed") {
        const msg = { title: "Email non vérifié", description: "Cliquez sur le lien envoyé dans votre boîte mail." };
        setLoginMessage(msg);
        toast.error(msg.title, { description: msg.description });
        return;
      }
      if (code === "over_request_rate_limit" || status === 429) {
        const msg = { title: "Trop de tentatives", description: "Patientez quelques minutes." };
        setLoginMessage(msg);
        toast.error(msg.title, { description: msg.description });
        return;
      }
      const msg = { title: "Connexion impossible", description: error.message };
      setLoginMessage(msg);
      toast.error(msg.title, { description: msg.description });
      return;
    }

    if (!data.user) return;
    toast.success(t("welcome_back"));
    await resolveAndRedirect(data.user.id, space, nav);
  };

  const spaceLabels: Record<Space, string> = { 
    patient: locale === "ar" ? "المريض" : locale === "en" ? "Patient" : "patient", 
    doctor: locale === "ar" ? "الطبيب" : locale === "en" ? "Doctor" : "médecin", 
    pharmacy: locale === "ar" ? "الصيدلية" : locale === "en" ? "Pharmacy" : "pharmacie", 
    admin: locale === "ar" ? "المشرف" : locale === "en" ? "Admin" : "administrateur" 
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4 py-8 relative">
      {/* Floating Language Switcher */}
      <div className={cn("absolute top-4", locale === "ar" ? "left-4" : "right-4")}>
        <LanguageSelector />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo withText size={48} /></div>
        <div className="rounded-3xl border border-border bg-card/95 backdrop-blur-sm p-6 shadow-elegant md:p-8">
          <h1 className="text-2xl font-bold text-foreground">{t("connexion")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("choose_space")}</p>

          <div className="mt-5 grid grid-cols-4 gap-2">
            {SPACES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSpace(s.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-xs font-semibold transition-all",
                  space === s.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                )}
              >
                <s.icon className={cn("h-5 w-5", space === s.value ? "text-primary" : "text-muted-foreground")} />
                {s.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {loginMessage && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm" role="alert">
                <p className="font-semibold text-destructive">{loginMessage.title}</p>
                <p className="mt-1 text-muted-foreground">{loginMessage.description}</p>
              </div>
            )}
            <div>
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("password")}</Label>
                <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">{t("forgot_password")}</Link>
              </div>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90">
              {loading ? `${t("connexion")}...` : locale === "ar" ? `دخول مساحة ${spaceLabels[space]}` : locale === "en" ? `Access ${spaceLabels[space]} Space` : `Accéder à l'espace ${spaceLabels[space]}`}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("no_account")}{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              {t("create_account")}
            </Link>
          </p>
        </div>

        {/* ─── DEMO ACCOUNTS SECTION ─── */}
        <div className="mt-4 rounded-3xl border border-border bg-card/90 backdrop-blur-sm p-5 shadow-elegant">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">{t("demo_accounts")}</h2>
              <p className="text-[11px] text-muted-foreground">{t("demo_desc")}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {SPACES.map((s) => {
              const colors = SPACE_COLORS[s.value];
              const account = DEMO_ACCOUNTS[s.value];
              return (
                <button
                  key={s.value}
                  onClick={() => handleDemoLogin(s.value)}
                  className={cn(
                    "group relative flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all duration-200",
                    "border-border hover:border-transparent hover:shadow-lg",
                    `hover:${colors.bg}`
                  )}
                >
                  <div className={cn("flex items-center gap-1.5")}>
                    <s.icon className={cn("h-4 w-4", colors.text)} />
                    <span className={cn("text-xs font-bold", colors.text)}>{s.label}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate w-full">{account.email}</span>
                  <span className="text-[10px] text-muted-foreground">{locale === "ar" ? "كلمة المرور" : locale === "en" ? "Password" : "Mot de passe"}: <span className="font-mono font-bold text-foreground/70">{account.password}</span></span>
                  <div className={cn(
                    "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                    "bg-gradient-to-br", colors.gradient, "opacity-0 group-hover:opacity-[0.04]"
                  )} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
