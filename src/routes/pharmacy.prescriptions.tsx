import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Check, Clock, Pill, Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/pharmacy/prescriptions")({ component: PharmacyPrescriptions });

const PRESCRIPTIONS = [
  { id: "1", doctor: "Dr. Amina Belkacem", patient: "Ahmed Benali", date: "2026-05-20", medications: ["Metformine 850mg — 2x/jour", "Glimepiride 2mg — 1x/jour"], status: "new" },
  { id: "2", doctor: "Dr. Karim Hadj", patient: "Fatima Cherif", date: "2026-05-20", medications: ["Amlodipine 5mg — 1x/jour", "Losartan 50mg — 1x/jour", "Aspégic 100mg — 1x/jour"], status: "processing" },
  { id: "3", doctor: "Dr. Sofia Meziane", patient: "Omar Djelloul", date: "2026-05-19", medications: ["Amoxicilline 500mg — 3x/jour pendant 7 jours"], status: "ready" },
  { id: "4", doctor: "Dr. Yacine Ould-Ali", patient: "Samira Khelif", date: "2026-05-19", medications: ["Insuline rapide — avant repas", "Metformine 1000mg — 2x/jour", "Atorvastatine 20mg — 1x/soir", "Vitamine D3 — 1x/semaine"], status: "delivered" },
  { id: "5", doctor: "Dr. Amina Belkacem", patient: "Yacine Bouzid", date: "2026-05-18", medications: ["Cétirizine 10mg — 1x/jour", "EpiPen — en cas d'urgence"], status: "delivered" },
];

function PharmacyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState(PRESCRIPTIONS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "new" | "processing" | "ready" | "delivered">("all");
  const [selected, setSelected] = useState<typeof PRESCRIPTIONS[0] | null>(null);

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    new: { bg: "bg-blue-100", text: "text-blue-700", label: "Nouvelle" },
    processing: { bg: "bg-amber-100", text: "text-amber-700", label: "En préparation" },
    ready: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Prête" },
    delivered: { bg: "bg-gray-100", text: "text-gray-600", label: "Délivrée" },
  };

  const advance = (id: string) => {
    setPrescriptions(prescriptions.map((p) => {
      if (p.id !== id) return p;
      const next: Record<string, string> = { new: "processing", processing: "ready", ready: "delivered" };
      return { ...p, status: next[p.status] || p.status };
    }));
    toast.success("Statut mis à jour !");
  };

  const filtered = prescriptions.filter((p) => {
    const matchSearch = p.patient.toLowerCase().includes(search.toLowerCase()) || p.doctor.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  if (selected) {
    const sc = statusConfig[selected.status];
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>← Retour</Button>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Ordonnance #{selected.id}</h1>
              <p className="text-sm text-muted-foreground">{selected.doctor} · {new Date(selected.date).toLocaleDateString("fr-FR", { dateStyle: "long" })}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${sc.bg} ${sc.text}`}>{sc.label}</span>
          </div>
          <div className="mt-4 rounded-xl bg-muted/30 p-4">
            <p className="text-sm font-semibold text-foreground">Patient : {selected.patient}</p>
          </div>
          <div className="mt-4">
            <h2 className="text-sm font-semibold text-foreground">Médicaments prescrits</h2>
            <div className="mt-2 space-y-2">
              {selected.medications.map((m, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                  <Pill className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-foreground">{m}</span>
                </div>
              ))}
            </div>
          </div>
          {selected.status !== "delivered" && (
            <Button onClick={() => { advance(selected.id); setSelected({ ...selected, status: selected.status === "new" ? "processing" : selected.status === "processing" ? "ready" : "delivered" }); }}
              className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              {selected.status === "new" ? "Commencer la préparation" : selected.status === "processing" ? "Marquer comme prête" : "Confirmer la délivrance"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Ordonnances</h1>
        <p className="text-sm text-muted-foreground">Gérez les ordonnances électroniques reçues.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {(["all", "new", "processing", "ready", "delivered"] as const).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}
              className={filter === f ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white" : ""}>
              {f === "all" ? "Toutes" : statusConfig[f].label}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {filtered.map((rx) => {
          const sc = statusConfig[rx.status];
          return (
            <div key={rx.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-card cursor-pointer" onClick={() => setSelected(rx)}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{rx.patient}</p>
                <p className="text-xs text-muted-foreground">{rx.doctor} · {rx.medications.length} médicament(s)</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${sc.bg} ${sc.text}`}>{sc.label}</span>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
