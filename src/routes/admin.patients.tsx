import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, User, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/patients")({ component: PatientsList });

type Patient = {
  id: string;
  full_name: string | null;
  phone: string | null;
  blood_type: string | null;
  chronic_conditions: string | null;
};

function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Only show patients (exclude admins)
      const { data: adminRows } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      const adminIds = new Set((adminRows ?? []).map((r) => r.user_id));
      const { data } = await supabase.from("profiles").select("id, full_name, phone, blood_type, chronic_conditions").order("full_name");
      setPatients((data ?? []).filter((p) => !adminIds.has(p.id)));
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return patients;
    return patients.filter((p) =>
      [p.full_name, p.phone, p.chronic_conditions].some((v) => v?.toLowerCase().includes(s))
    );
  }, [patients, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Patients</h1>
          <p className="text-sm text-muted-foreground">{patients.length} patient(s) sur la plateforme.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (nom, tél, pathologie)" className="pl-9" />
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Aucun patient trouvé.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((p) => (
            <Link key={p.id} to="/admin/patients/$id" params={{ id: p.id }}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-elegant">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">{p.full_name || "(Sans nom)"}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.phone || "—"} · Groupe {p.blood_type || "?"} · {p.chronic_conditions || "Aucune pathologie déclarée"}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
