import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Filter, UserCheck, AlertTriangle, Heart, Activity, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/doctor/patients")({ component: DoctorPatients });

const PATIENTS = [
  { id: "1", name: "Ahmed Benali", age: 45, gender: "M", condition: "Diabète type 2", bloodType: "A+", status: "stable", heartRate: 72, bp: "120/80", lastVisit: "2026-05-18" },
  { id: "2", name: "Fatima Cherif", age: 62, gender: "F", condition: "Hypertension", bloodType: "O+", status: "attention", heartRate: 88, bp: "155/95", lastVisit: "2026-05-15" },
  { id: "3", name: "Karim Hadj", age: 38, gender: "M", condition: "Asthme chronique", bloodType: "B+", status: "stable", heartRate: 68, bp: "118/76", lastVisit: "2026-05-20" },
  { id: "4", name: "Nadia Ould", age: 55, gender: "F", condition: "Insuffisance cardiaque", bloodType: "AB-", status: "critique", heartRate: 102, bp: "90/60", lastVisit: "2026-05-19" },
  { id: "5", name: "Yacine Bouzid", age: 29, gender: "M", condition: "Allergie sévère", bloodType: "O-", status: "stable", heartRate: 74, bp: "122/78", lastVisit: "2026-05-12" },
  { id: "6", name: "Samira Khelif", age: 48, gender: "F", condition: "Diabète type 1", bloodType: "A-", status: "attention", heartRate: 80, bp: "135/88", lastVisit: "2026-05-17" },
];

function DoctorPatients() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "stable" | "attention" | "critique">("all");
  const [selectedPatient, setSelectedPatient] = useState<typeof PATIENTS[0] | null>(null);

  const filtered = PATIENTS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.condition.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    stable: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Stable" },
    attention: { bg: "bg-amber-100", text: "text-amber-700", label: "Attention" },
    critique: { bg: "bg-red-100", text: "text-red-700", label: "Critique" },
  };

  if (selectedPatient) {
    const sc = statusConfig[selectedPatient.status];
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>← Retour à la liste</Button>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl font-bold">
              {selectedPatient.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{selectedPatient.name}</h1>
              <p className="text-sm text-muted-foreground">{selectedPatient.age} ans · {selectedPatient.gender === "M" ? "Masculin" : "Féminin"} · Groupe {selectedPatient.bloodType}</p>
              <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${sc.bg} ${sc.text}`}>{sc.label}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <Heart className="h-5 w-5 text-rose-500" />
            <p className="mt-2 text-xs uppercase text-muted-foreground">Fréquence cardiaque</p>
            <p className="mt-1 text-2xl font-bold">{selectedPatient.heartRate} <span className="text-sm font-normal text-muted-foreground">bpm</span></p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <Activity className="h-5 w-5 text-blue-500" />
            <p className="mt-2 text-xs uppercase text-muted-foreground">Tension artérielle</p>
            <p className="mt-1 text-2xl font-bold">{selectedPatient.bp} <span className="text-sm font-normal text-muted-foreground">mmHg</span></p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <UserCheck className="h-5 w-5 text-emerald-500" />
            <p className="mt-2 text-xs uppercase text-muted-foreground">Dernière visite</p>
            <p className="mt-1 text-2xl font-bold">{new Date(selectedPatient.lastVisit).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">Pathologie principale</h2>
          <p className="mt-2 text-sm text-muted-foreground">{selectedPatient.condition}</p>
          <h2 className="mt-4 text-base font-semibold">Historique médical</h2>
          <p className="mt-2 text-sm text-muted-foreground">L'historique complet du patient sera synchronisé via la plateforme AISANTÉ et les données du bracelet connecté.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Mes Patients</h1>
        <p className="text-sm text-muted-foreground">Gérez et suivez vos patients en temps réel.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher un patient..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(["all", "stable", "attention", "critique"] as const).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}
              className={filter === f ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white" : ""}>
              {f === "all" ? "Tous" : statusConfig[f].label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((p) => {
          const sc = statusConfig[p.status];
          return (
            <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-card-hover cursor-pointer" onClick={() => setSelectedPatient(p)}>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                {p.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.age} ans · {p.condition} · Groupe {p.bloodType}</p>
              </div>
              <div className="hidden items-center gap-3 md:flex">
                <div className="text-right">
                  <p className="text-sm font-semibold">{p.heartRate} bpm</p>
                  <p className="text-xs text-muted-foreground">{p.bp}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${sc.bg} ${sc.text}`}>{sc.label}</span>
              </div>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
