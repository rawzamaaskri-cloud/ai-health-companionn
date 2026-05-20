import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Activity, Droplet, Footprints, Heart, Moon, RefreshCw, Sparkles, Wind } from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { getHealthSummary } from "@/lib/health-summary.functions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/app/")({ component: Dashboard });

type Vital = {
  recorded_at: string;
  heart_rate: number | null;
  glucose: number | null;
  systolic: number | null;
  diastolic: number | null;
  oxygen: number | null;
};
type Wearable = {
  recorded_at: string;
  steps: number | null;
  sleep_minutes: number | null;
  heart_rate: number | null;
};

function Dashboard() {
  const { user } = useAuth();
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [wearable, setWearable] = useState<Wearable[]>([]);
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryAt, setSummaryAt] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const fetchSummary = useServerFn(getHealthSummary);

  const loadSummary = async (force = false) => {
    setSummaryLoading(true);
    try {
      const res = await fetchSummary({ data: { force } });
      setSummary(res.summary);
      setSummaryAt(res.generated_at);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de la génération du résumé");
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("vitals")
        .select("recorded_at, heart_rate, glucose, systolic, diastolic, oxygen")
        .order("recorded_at", { ascending: true })
        .limit(50);
      let v = (data ?? []) as Vital[];
      if (v.length === 0) v = await seedDemoVitals(user.id);
      setVitals(v);

      const { data: w } = await supabase
        .from("wearable_data")
        .select("recorded_at, steps, sleep_minutes, heart_rate")
        .order("recorded_at", { ascending: true })
        .limit(14);
      let wr = (w ?? []) as Wearable[];
      if (wr.length === 0) wr = await seedDemoWearable(user.id);
      setWearable(wr);

      const { data: p } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
      setProfile(p);

      loadSummary(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const last = vitals[vitals.length - 1];
  const fmtDate = (s: string) => new Date(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

  const tensionData = useMemo(
    () => vitals.map((v) => ({ t: fmtDate(v.recorded_at), Systolique: v.systolic, Diastolique: v.diastolic })),
    [vitals]
  );
  const glucoseData = useMemo(
    () => vitals.map((v) => ({ t: fmtDate(v.recorded_at), Glycémie: v.glucose })),
    [vitals]
  );
  const heartData = useMemo(
    () => vitals.map((v) => ({ t: fmtDate(v.recorded_at), Pouls: v.heart_rate })),
    [vitals]
  );
  const stepsData = useMemo(
    () => wearable.map((w) => ({ t: fmtDate(w.recorded_at), Pas: w.steps ?? 0 })),
    [wearable]
  );

  const lastW = wearable[wearable.length - 1];
  const sleepHours = lastW?.sleep_minutes ? (lastW.sleep_minutes / 60).toFixed(1) : "—";

  const firstName = (profile?.full_name ?? "").split(" ")[0] || "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Bonjour{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p className="text-sm text-muted-foreground">Voici un résumé de votre santé aujourd'hui.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={Heart} label="Pouls" value={last?.heart_rate ?? "—"} unit="bpm" tone="destructive" />
        <Stat icon={Droplet} label="Glycémie" value={last?.glucose ?? "—"} unit="g/L" tone="primary" />
        <Stat
          icon={Activity}
          label="Tension"
          value={last?.systolic && last?.diastolic ? `${last.systolic}/${last.diastolic}` : "—"}
          unit="mmHg"
          tone="accent"
        />
        <Stat icon={Wind} label="SpO₂" value={last?.oxygen ?? "—"} unit="%" tone="success" />
      </div>

      {/* Wearable */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Stat icon={Footprints} label="Pas (aujourd'hui)" value={lastW?.steps ?? "—"} unit="" tone="primary" />
        <Stat icon={Moon} label="Sommeil" value={sleepHours} unit="h" tone="accent" />
      </div>

      {/* AI Summary */}
      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Résumé IA de votre santé</h2>
              <p className="text-xs text-muted-foreground">
                {summaryAt
                  ? `Généré le ${new Date(summaryAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`
                  : "Synthèse personnalisée à partir de votre carnet santé"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => loadSummary(true)} disabled={summaryLoading} aria-label="Régénérer">
            <RefreshCw className={`h-4 w-4 ${summaryLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <div className="mt-4 text-sm text-foreground/90">
          {summaryLoading && !summary ? (
            <div className="space-y-2">
              <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
            </div>
          ) : summary ? (
            <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-strong:text-foreground prose-p:text-foreground/90">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-muted-foreground">Aucun résumé disponible.</p>
          )}
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Tension artérielle" subtitle="mmHg · 14 derniers jours">
          <ResponsiveContainer>
            <LineChart data={tensionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.02 220)" />
              <XAxis dataKey="t" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[60, 160]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="Systolique" stroke="oklch(0.55 0.18 25)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Diastolique" stroke="oklch(0.62 0.14 200)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Glycémie" subtitle="g/L · 14 derniers jours">
          <ResponsiveContainer>
            <AreaChart data={glucoseData}>
              <defs>
                <linearGradient id="gGlu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.42 0.13 250)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="oklch(0.42 0.13 250)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.02 220)" />
              <XAxis dataKey="t" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="Glycémie" stroke="oklch(0.42 0.13 250)" fill="url(#gGlu)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fréquence cardiaque" subtitle="bpm · 14 derniers jours">
          <ResponsiveContainer>
            <LineChart data={heartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.02 220)" />
              <XAxis dataKey="t" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[50, 110]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="Pouls" stroke="oklch(0.62 0.18 15)" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Activité" subtitle="pas par jour">
          <ResponsiveContainer>
            <BarChart data={stepsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.02 220)" />
              <XAxis dataKey="t" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="Pas" fill="oklch(0.62 0.14 200)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="rounded-2xl border border-border bg-gradient-brand p-6 text-primary-foreground shadow-elegant">
        <h3 className="text-lg font-semibold">💡 Conseil santé du jour</h3>
        <p className="mt-1 text-sm opacity-90">
          Buvez 1,5L d'eau aujourd'hui et marchez au moins 30 minutes. Demandez à votre Consultant IA de vous expliquer vos dernières analyses.
        </p>
      </div>
    </div>
  );
}

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
};

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
      <div className="mt-4 h-56 w-full">{children}</div>
    </div>
  );
}

function Stat({
  icon: Icon, label, value, unit, tone,
}: { icon: typeof Heart; label: string; value: string | number; unit: string; tone: "primary" | "accent" | "success" | "destructive" }) {
  const toneMap = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/15 text-accent",
    success: "bg-success/15 text-success",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${toneMap[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-2xl font-bold tabular-nums text-foreground">
        {value} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

async function seedDemoVitals(userId: string): Promise<Vital[]> {
  const now = Date.now();
  const rows = Array.from({ length: 14 }).map((_, i) => ({
    user_id: userId,
    recorded_at: new Date(now - (13 - i) * 86400000).toISOString(),
    heart_rate: 68 + Math.round(Math.sin(i / 2) * 6 + Math.random() * 4),
    glucose: +(0.95 + Math.sin(i / 3) * 0.15 + Math.random() * 0.1).toFixed(2),
    systolic: 118 + Math.round(Math.random() * 8),
    diastolic: 76 + Math.round(Math.random() * 6),
    oxygen: 96 + Math.round(Math.random() * 3),
  }));
  await supabase.from("vitals").insert(rows);
  return rows.map((r) => ({
    recorded_at: r.recorded_at,
    heart_rate: r.heart_rate,
    glucose: r.glucose,
    systolic: r.systolic,
    diastolic: r.diastolic,
    oxygen: r.oxygen,
  }));
}

async function seedDemoWearable(userId: string): Promise<Wearable[]> {
  const now = Date.now();
  const rows = Array.from({ length: 14 }).map((_, i) => ({
    user_id: userId,
    recorded_at: new Date(now - (13 - i) * 86400000).toISOString(),
    steps: 4500 + Math.round(Math.random() * 5000),
    sleep_minutes: 360 + Math.round(Math.random() * 120),
    heart_rate: 65 + Math.round(Math.random() * 10),
  }));
  await supabase.from("wearable_data").insert(rows);
  return rows.map((r) => ({
    recorded_at: r.recorded_at,
    steps: r.steps,
    sleep_minutes: r.sleep_minutes,
    heart_rate: r.heart_rate,
  }));
}
