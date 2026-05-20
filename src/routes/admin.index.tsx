import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Pill, FileText, CalendarCheck, ChevronRight, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

type PatientRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  blood_type: string | null;
  chronic_conditions: string | null;
  allergies: string | null;
  prescriptions: number;
  records: number;
  appointments: number;
  lastVisit: string | null;
};

function AdminDashboard() {
  const [stats, setStats] = useState({ patients: 0, prescriptions: 0, records: 0, appointments: 0 });
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: adminRows }, { data: profiles }, { data: rx }, { data: mr }, { data: ap }] = await Promise.all([
        supabase.from("user_roles").select("user_id").eq("role", "admin"),
        supabase.from("profiles").select("id, full_name, phone, date_of_birth, blood_type, chronic_conditions, allergies"),
        supabase.from("prescriptions").select("user_id, issued_at"),
        supabase.from("medical_records").select("user_id, record_date"),
        supabase.from("appointments").select("user_id, scheduled_at"),
      ]);

      const adminIds = new Set((adminRows ?? []).map((r) => r.user_id));
      const patientProfiles = (profiles ?? []).filter((p) => !adminIds.has(p.id));

      const countBy = (rows: any[] | null, key = "user_id") => {
        const m = new Map<string, number>();
        (rows ?? []).forEach((r) => m.set(r[key], (m.get(r[key]) ?? 0) + 1));
        return m;
      };
      const lastBy = (rows: any[] | null, dateKey: string) => {
        const m = new Map<string, string>();
        (rows ?? []).forEach((r) => {
          const cur = m.get(r.user_id);
          if (!cur || new Date(r[dateKey]) > new Date(cur)) m.set(r.user_id, r[dateKey]);
        });
        return m;
      };

      const rxCount = countBy(rx);
      const mrCount = countBy(mr);
      const apCount = countBy(ap);
      const lastRx = lastBy(rx, "issued_at");
      const lastMr = lastBy(mr, "record_date");
      const lastAp = lastBy(ap, "scheduled_at");

      const rows: PatientRow[] = patientProfiles.map((p) => {
        const dates = [lastRx.get(p.id), lastMr.get(p.id), lastAp.get(p.id)].filter(Boolean) as string[];
        const lastVisit = dates.length ? dates.sort((a, b) => +new Date(b) - +new Date(a))[0] : null;
        return {
          ...p,
          prescriptions: rxCount.get(p.id) ?? 0,
          records: mrCount.get(p.id) ?? 0,
          appointments: apCount.get(p.id) ?? 0,
          lastVisit,
        };
      });

      // Sort by most recent activity first
      rows.sort((a, b) => (b.lastVisit ? +new Date(b.lastVisit) : 0) - (a.lastVisit ? +new Date(a.lastVisit) : 0));

      setPatients(rows);
      setStats({
        patients: patientProfiles.length,
        prescriptions: rx?.length ?? 0,
        records: mr?.length ?? 0,
        appointments: ap?.length ?? 0,
      });
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: "Patients", value: stats.patients, icon: Users, color: "from-primary to-accent" },
    { label: "Ordonnances", value: stats.prescriptions, icon: Pill, color: "from-success to-primary" },
    { label: "Dossiers", value: stats.records, icon: FileText, color: "from-accent to-primary" },
    { label: "Rendez-vous", value: stats.appointments, icon: CalendarCheck, color: "from-warning to-accent" },
  ];

  const fmtAge = (dob: string | null) => {
    if (!dob) return "—";
    const a = Math.floor((Date.now() - +new Date(dob)) / (365.25 * 24 * 3600 * 1000));
    return `${a} ans`;
  };
  const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString("fr-FR") : "—");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Tableau éditeur</h1>
        <p className="text-sm text-muted-foreground">Vue d'ensemble de la plateforme AIsanté.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5 shadow-elegant">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-primary-foreground`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Patients data table */}
      <div className="rounded-2xl border border-border bg-card shadow-elegant">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">Patients</h2>
            <p className="text-xs text-muted-foreground">Données médicales clés et activité récente</p>
          </div>
          <Link to="/admin/patients" className="text-xs font-medium text-primary hover:underline">Voir tout →</Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Chargement…</div>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Aucun patient inscrit pour le moment.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Patient</th>
                    <th className="px-4 py-3 text-left font-medium">Âge</th>
                    <th className="px-4 py-3 text-left font-medium">Groupe</th>
                    <th className="px-4 py-3 text-left font-medium">Pathologies</th>
                    <th className="px-4 py-3 text-left font-medium">Allergies</th>
                    <th className="px-4 py-3 text-center font-medium">Ordo.</th>
                    <th className="px-4 py-3 text-center font-medium">Doss.</th>
                    <th className="px-4 py-3 text-center font-medium">RDV</th>
                    <th className="px-4 py-3 text-left font-medium">Dernière activité</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p.id} className="border-t border-border transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{p.full_name || "(Sans nom)"}</p>
                            <p className="truncate text-[11px] text-muted-foreground">{p.phone || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{fmtAge(p.date_of_birth)}</td>
                      <td className="px-4 py-3">
                        {p.blood_type ? (
                          <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">{p.blood_type}</span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3 max-w-[180px] truncate text-foreground">{p.chronic_conditions || "—"}</td>
                      <td className="px-4 py-3 max-w-[140px] truncate text-warning-foreground">{p.allergies || "—"}</td>
                      <td className="px-4 py-3 text-center font-semibold text-foreground">{p.prescriptions}</td>
                      <td className="px-4 py-3 text-center font-semibold text-foreground">{p.records}</td>
                      <td className="px-4 py-3 text-center font-semibold text-foreground">{p.appointments}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{fmtDate(p.lastVisit)}</td>
                      <td className="px-4 py-3 text-right">
                        <Link to="/admin/patients/$id" params={{ id: p.id }} className="inline-flex items-center text-primary hover:underline">
                          Ouvrir <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-border md:hidden">
              {patients.map((p) => (
                <Link key={p.id} to="/admin/patients/$id" params={{ id: p.id }} className="block p-4 active:bg-muted/40">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-semibold text-foreground">{p.full_name || "(Sans nom)"}</p>
                        {p.blood_type && (
                          <span className="rounded-md bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive">{p.blood_type}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{fmtAge(p.date_of_birth)} · {p.phone || "—"}</p>
                      {p.chronic_conditions && <p className="mt-1 truncate text-xs text-foreground">🩺 {p.chronic_conditions}</p>}
                      {p.allergies && <p className="truncate text-xs text-warning-foreground">⚠️ {p.allergies}</p>}
                      <div className="mt-2 flex gap-3 text-[11px] text-muted-foreground">
                        <span>💊 {p.prescriptions}</span>
                        <span>📄 {p.records}</span>
                        <span>📅 {p.appointments}</span>
                        <span className="ml-auto">{fmtDate(p.lastVisit)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
