import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Bot, Calendar, Heart, Pill, QrCode, ShieldCheck, Stethoscope, Building2, Watch, Brain, ChevronRight, Star, Users, Clock, Lock, Zap, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/lib/i18n";
import { LanguageSelector } from "@/components/LanguageSelector";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "AISANTÉ — Plateforme Intelligente de Santé Numérique" },
      { name: "description", content: "AISANTÉ : plateforme intelligente de santé numérique avec IA, bracelet connecté, téléconsultation et gestion médicale complète." },
    ],
  }),
});

function useCountUp(target: string, duration: number = 2000) {
  const [display, setDisplay] = useState("0");
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const num = parseInt(target.replace(/\D/g, ""));
    const suffix = target.replace(/[\d]/g, "");
    if (isNaN(num)) { setDisplay(target); return; }
    const steps = 40;
    const inc = num / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += inc;
      if (current >= num) { current = num; clearInterval(interval); }
      setDisplay(Math.round(current) + suffix);
    }, duration / steps);
    return () => clearInterval(interval);
  }, [started, target, duration]);

  return { display, ref };
}

function StatCard({ value, label, icon: Icon }: { value: string; label: string; icon: typeof Zap }) {
  const { display, ref } = useCountUp(value);
  return (
    <div ref={ref} className="group text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm transition-transform group-hover:scale-110">
        <Icon className="h-6 w-6 text-white/90" />
      </div>
      <p className="text-3xl font-bold text-white md:text-4xl">{display}</p>
      <p className="mt-1 text-sm text-white/70">{label}</p>
    </div>
  );
}

// ─── 3D Tilt Card Component ───
function TiltCard({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Normalize coordinates to -15 to 15 degrees
    const factorX = 15 / (rect.height / 2);
    const factorY = 15 / (rect.width / 2);

    setCoords({
      x: -y * factorX, // Rotation around X-axis
      y: x * factorY   // Rotation around Y-axis
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovered ? `perspective(1000px) rotateX(${coords.x}deg) rotateY(${coords.y}deg) scale3d(1.02, 1.02, 1.02)` : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        transition: isHovered ? "none" : "all 0.5s ease-out",
        transformStyle: "preserve-3d"
      }}
      className={className}
      {...props}
    >
      <div style={{ transform: "translateZ(30px)" }} className="h-full">
        {children}
      </div>
    </div>
  );
}

function Landing() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const { t, locale } = useTranslation();

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setVisibleSections((s) => new Set([...s, e.target.id]));
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll("[data-animate]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  // Dynamic translated datasets
  const FEATURES_LIST = [
    { icon: Heart, title: t("feat_patient"), desc: t("feat_patient_desc"), color: "from-rose-500 to-pink-600" },
    { icon: Stethoscope, title: t("feat_doctor"), desc: t("feat_doctor_desc"), color: "from-blue-500 to-indigo-600" },
    { icon: Building2, title: t("feat_pharmacy"), desc: t("feat_pharmacy_desc"), color: "from-emerald-500 to-teal-600" },
    { icon: Watch, title: t("feat_bracelet"), desc: t("feat_bracelet_desc"), color: "from-violet-500 to-purple-600" },
    { icon: Brain, title: t("feat_ai"), desc: t("feat_ai_desc"), color: "from-amber-500 to-orange-600" },
    { icon: Lock, title: t("feat_security"), desc: t("feat_security_desc"), color: "from-cyan-500 to-blue-600" },
  ];

  const STATS_LIST = [
    { value: "99.9%", label: t("stat_availability"), icon: Zap },
    { value: "50K+", label: t("stat_patients"), icon: Users },
    { value: "24/7", label: t("stat_support"), icon: Clock },
    { value: "100%", label: t("stat_encrypted"), icon: Lock },
  ];

  const SPACES_LIST = [
    { 
      title: t("space_patient_title"), 
      desc: t("space_patient_desc"), 
      icon: Heart, 
      gradient: "from-rose-500 to-pink-500", 
      features: locale === "ar" ? 
        ["ملف طبي رقمي", "حجز المواعيد", "وصفات إلكترونية", "تذكير ذكي", "السوار المتصل"] : 
        locale === "en" ? 
        ["Digital medical record", "Online booking", "E-prescriptions", "Smart reminders", "Connected bracelet"] :
        ["Dossier médical numérique", "Rendez-vous en ligne", "Prescriptions électroniques", "Rappels automatiques", "Bracelet connecté"]
    },
    { 
      title: t("space_doctor_title"), 
      desc: t("space_doctor_desc"), 
      icon: Stethoscope, 
      gradient: "from-blue-500 to-indigo-500", 
      features: locale === "ar" ? 
        ["إدارة الملفات", "السجل الطبي", "وصفات رقمية", "بيانات السوار الحيوية", "مساعد طبي بالذكاء الاصطناعي"] :
        locale === "en" ?
        ["File management", "Medical history", "Digital prescriptions", "Wearable IoT data", "AI clinical assistant"] :
        ["Gestion des dossiers", "Historique médical", "Prescriptions numériques", "Données IoT", "Aide IA"]
    },
    { 
      title: t("space_pharmacy_title"), 
      desc: t("space_pharmacy_desc"), 
      icon: Building2, 
      gradient: "from-emerald-500 to-teal-500", 
      features: locale === "ar" ? 
        ["وصفات إلكترونية مباشرة", "إدارة المخازن", "تتبع توفر الأدوية", "تواصل سريع وآمن"] :
        locale === "en" ?
        ["Direct e-prescriptions", "Inventory management", "Stock availability check", "Quick & secure messaging"] :
        ["Ordonnances électroniques", "Gestion des stocks", "Suivi disponibilité", "Communication rapide"]
    },
  ];

  const BRACELET_ITEMS = [
    { icon: Heart, label: t("bracelet_hr"), val: t("bracelet_hr_desc") },
    { icon: Activity, label: t("bracelet_activity"), val: t("bracelet_activity_desc") },
    { icon: Zap, label: t("bracelet_alerts"), val: t("bracelet_alerts_desc") },
    { icon: QrCode, label: t("bracelet_emergency"), val: t("bracelet_emergency_desc") },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-50 glass-strong">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <Logo withText />
          <nav className={cn("hidden items-center gap-6 md:flex", locale === "ar" && "flex-row-reverse")}>
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t("features")}</a>
            <a href="#spaces" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t("spaces")}</a>
            <a href="#bracelet" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t("bracelet")}</a>
            <a href="#ai" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t("ai")}</a>
          </nav>
          <div className={cn("flex items-center gap-3", locale === "ar" && "flex-row-reverse")}>
            <LanguageSelector />
            <Link to="/login"><Button variant="ghost" size="sm">{t("login")}</Button></Link>
            <Link to="/signup"><Button size="sm" className="bg-gradient-brand text-primary-foreground shadow-elegant hover:opacity-90">{t("start")}</Button></Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 animate-float" />
          <div className="absolute top-1/2 -left-20 h-60 w-60 rounded-full bg-accent/5 animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-20 right-1/4 h-40 w-40 rounded-full bg-success/5 animate-float" style={{ animationDelay: "4s" }} />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-32 md:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary animate-fade-in">
              <ShieldCheck className="h-3.5 w-3.5" /> {t("hero_tag")}
            </span>
            <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-foreground md:text-6xl lg:text-7xl animate-slide-up" style={{ opacity: 0, animationFillMode: "forwards" }}>
              {t("hero_title_1")}
              <span className="text-gradient-brand">{t("hero_title_2")}</span>
              <br className="hidden md:block" />
              <span className="text-gradient-brand">{t("hero_title_3")}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl animate-slide-up" style={{ opacity: 0, animationDelay: "0.2s", animationFillMode: "forwards" }}>
              {t("hero_desc")}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-slide-up" style={{ opacity: 0, animationDelay: "0.4s", animationFillMode: "forwards" }}>
              <Link to="/signup">
                <Button size="lg" className="h-12 bg-gradient-brand px-8 text-primary-foreground shadow-elegant hover:opacity-90 text-base">
                  {t("hero_cta_create")} <ArrowRight className={cn("ml-2 h-4 w-4", locale === "ar" && "rotate-180")} />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                  {t("hero_cta_discover")}
                </Button>
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ─── Stats ─── */}
      <section className="relative -mt-8 z-10">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <div className="rounded-3xl bg-gradient-brand p-8 shadow-elegant md:p-12">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {STATS_LIST.map((s) => <StatCard key={s.label} {...s} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" data-animate className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <div className={`text-center transition-all duration-700 ${isVisible("features") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
            <Star className="h-3.5 w-3.5" /> {t("features")}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t("features_title")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            {t("features_subtitle")}
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES_LIST.map((f, i) => (
            <TiltCard
              key={f.title}
              className={`group relative rounded-3xl border border-border bg-card p-7 transition-all duration-500 hover:shadow-card-hover ${isVisible("features") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} text-white shadow-lg transition-transform group-hover:scale-110`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100" />
            </TiltCard>
          ))}
        </div>
      </section>

      {/* ─── Spaces ─── */}
      <section id="spaces" data-animate className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className={`text-center transition-all duration-700 ${isVisible("spaces") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
              <Users className="h-3.5 w-3.5" /> {t("spaces")}
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {t("spaces_title")}
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {SPACES_LIST.map((s, i) => (
              <TiltCard
                key={s.title}
                className={`group rounded-3xl border border-border bg-card overflow-hidden transition-all duration-500 hover:shadow-card-hover ${isVisible("spaces") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className={`bg-gradient-to-br ${s.gradient} p-6 text-white`}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm text-white/80">{s.desc}</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {s.features.map((feat) => (
                      <li key={feat} className={cn("flex items-center gap-3 text-sm text-foreground", locale === "ar" && "flex-row-reverse")}>
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${s.gradient} text-white`}>
                          <ChevronRight className={cn("h-3 w-3", locale === "ar" && "rotate-180")} />
                        </div>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup">
                    <Button variant="outline" className="mt-6 w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {t("start")} <ArrowRight className={cn("ml-2 h-4 w-4", locale === "ar" && "rotate-180")} />
                    </Button>
                  </Link>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bracelet ─── */}
      <section id="bracelet" data-animate className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className={cn("transition-all duration-700", isVisible("bracelet") ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8", locale === "ar" && "order-last")}>
            <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-600">
              <Watch className="h-3.5 w-3.5" /> {t("bracelet")}
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {t("bracelet_title")}
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {t("bracelet_desc")}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {BRACELET_ITEMS.map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-card">
                  <item.icon className="h-5 w-5 text-violet-500" />
                  <p className="mt-2 text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.val}</p>
                </div>
              ))}
            </div>
          </div>
          <div className={`flex items-center justify-center transition-all duration-700 ${isVisible("bracelet") ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
            <div className="relative">
              <div className="h-72 w-72 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 animate-pulse-glow flex items-center justify-center">
                <div className="h-52 w-52 rounded-full bg-gradient-to-br from-violet-500/30 to-purple-500/30 flex items-center justify-center">
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Watch className="h-14 w-14 text-white" />
                  </div>
                </div>
              </div>
              <div className="absolute top-4 right-4 rounded-xl glass p-3 shadow-card animate-float">
                <Heart className="h-5 w-5 text-rose-500 animate-heartbeat" />
                <p className="mt-1 text-xs font-bold">72 bpm</p>
              </div>
              <div className="absolute bottom-4 left-4 rounded-xl glass p-3 shadow-card animate-float" style={{ animationDelay: "1s" }}>
                <Activity className="h-5 w-5 text-emerald-500" />
                <p className="mt-1 text-xs font-bold">8,420 pas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── AI Section ─── */}
      <section id="ai" data-animate className="bg-gradient-brand py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className={`text-center transition-all duration-700 ${isVisible("ai") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/90">
              <Brain className="h-3.5 w-3.5" /> {t("ai")}
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              {t("ai_title")}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-white/70">
              {t("ai_desc")}
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { icon: Bot, title: t("ai_consultant"), desc: t("ai_consultant_desc") },
              { icon: Activity, title: t("ai_predictive"), desc: t("ai_predictive_desc") },
              { icon: Calendar, title: t("ai_auto"), desc: t("ai_auto_desc") },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`rounded-3xl bg-white/10 backdrop-blur-sm p-7 transition-all duration-500 hover:bg-white/15 ${isVisible("ai") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <div className="rounded-3xl bg-card border border-border p-12 text-center shadow-card md:p-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {locale === "ar" ? "جاهز لتغيير تجربتك الصحية؟" : locale === "en" ? "Ready to transform your health?" : "Prêt à transformer votre santé ?"}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            {locale === "ar" ? "انضم إلى AISANTÉ واستفد من نظام طبي ذكي وآمن ومتصل بالكامل." : locale === "en" ? "Join AISANTÉ today and experience a connected, secure, and smart medical ecosystem." : "Rejoignez AISANTÉ et bénéficiez d'un écosystème médical intelligent, sécurisé et connecté."}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/signup">
              <Button size="lg" className="h-12 bg-gradient-brand px-8 text-primary-foreground shadow-elegant hover:opacity-90">
                {t("create_account")} <ArrowRight className={cn("ml-2 h-4 w-4", locale === "ar" && "rotate-180")} />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="h-12 px-8">
                {locale === "ar" ? "لدي حساب بالفعل" : locale === "en" ? "I already have an account" : "J'ai déjà un compte"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className={cn("grid grid-cols-1 gap-8 md:grid-cols-4", locale === "ar" && "text-right")}>
            <div>
              <Logo withText />
              <p className="mt-3 text-sm text-muted-foreground">
                {locale === "ar" ? "الذكاء في خدمة صحتكم." : locale === "en" ? "Intelligence serving your health." : "L'intelligence au service de votre santé."}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">{locale === "ar" ? "المنصة" : "Plateforme"}</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">{t("features")}</a></li>
                <li><a href="#spaces" className="hover:text-foreground transition-colors">{t("spaces")}</a></li>
                <li><a href="#bracelet" className="hover:text-foreground transition-colors">{t("bracelet")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">{locale === "ar" ? "الأمان" : "Sécurité"}</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Chiffrement AES-256</li>
                <li>Conformité RGPD</li>
                <li>Accès par rôle</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">{locale === "ar" ? "التقنيات" : "Technologies"}</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Intelligence Artificielle</li>
                <li>Cloud Computing</li>
                <li>IoT Connecté</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} AISANTÉ — Plateforme Intelligente de Santé Numérique
          </div>
        </div>
      </footer>
    </div>
  );
}
