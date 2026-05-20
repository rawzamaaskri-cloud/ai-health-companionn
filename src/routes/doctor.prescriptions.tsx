import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Plus, Send, Pill, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/doctor/prescriptions")({ component: DoctorPrescriptions });

const PRESCRIPTIONS = [
  { id: "1", patient: "Ahmed Benali", date: "2026-05-18", medications: ["Metformine 850mg — 2x/jour", "Glimepiride 2mg — 1x/jour"], status: "sent", pharmacy: "Pharmacie Centrale" },
  { id: "2", patient: "Fatima Cherif", date: "2026-05-15", medications: ["Amlodipine 5mg — 1x/jour", "Losartan 50mg — 1x/jour"], status: "sent", pharmacy: "Pharmacie El-Nour" },
  { id: "3", patient: "Karim Hadj", date: "2026-05-20", medications: ["Salbutamol inhalateur — selon besoin", "Fluticasone 250µg — 2x/jour"], status: "draft", pharmacy: null },
];

function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState(PRESCRIPTIONS);
  const [showNew, setShowNew] = useState(false);
  const [newRx, setNewRx] = useState({ patient: "", medications: "", pharmacy: "" });

  const create = () => {
    if (!newRx.patient || !newRx.medications) { toast.error("Patient et médicaments requis."); return; }
    const rx = {
      id: String(Date.now()),
      patient: newRx.patient,
      date: new Date().toISOString().split("T")[0],
      medications: newRx.medications.split("\n").filter(Boolean),
      status: "draft" as const,
      pharmacy: newRx.pharmacy || null,
    };
    setPrescriptions([rx, ...prescriptions]);
    setNewRx({ patient: "", medications: "", pharmacy: "" });
    setShowNew(false);
    toast.success("Ordonnance créée !");
  };

  const sendRx = (id: string) => {
    setPrescriptions(prescriptions.map((p) => p.id === id ? { ...p, status: "sent" } : p));
    toast.success("Ordonnance envoyée à la pharmacie !");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Ordonnances</h1>
          <p className="text-sm text-muted-foreground">Créez et envoyez des prescriptions numériques.</p>
        </div>
        <Button onClick={() => setShowNew(!showNew)} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <Plus className="mr-1.5 h-4 w-4" /> Nouvelle ordonnance
        </Button>
      </div>

      {showNew && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-semibold text-foreground">Nouvelle ordonnance</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><Label>Patient</Label><Input value={newRx.patient} onChange={(e) => setNewRx({ ...newRx, patient: e.target.value })} placeholder="Nom du patient" /></div>
            <div><Label>Pharmacie (optionnel)</Label><Input value={newRx.pharmacy} onChange={(e) => setNewRx({ ...newRx, pharmacy: e.target.value })} placeholder="Pharmacie destinataire" /></div>
          </div>
          <div>
            <Label>Médicaments (un par ligne)</Label>
            <textarea
              className="mt-1 flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={newRx.medications}
              onChange={(e) => setNewRx({ ...newRx, medications: e.target.value })}
              placeholder={"Metformine 850mg — 2x/jour\nGlimepiride 2mg — 1x/jour"}
            />
          </div>
          <Button onClick={create} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">Créer l'ordonnance</Button>
        </div>
      )}

      <div className="space-y-3">
        {prescriptions.map((rx) => (
          <div key={rx.id} className="rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600"><FileText className="h-5 w-5" /></div>
                <div>
                  <p className="font-semibold text-foreground">{rx.patient}</p>
                  <p className="text-xs text-muted-foreground">{new Date(rx.date).toLocaleDateString("fr-FR", { dateStyle: "medium" })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {rx.status === "draft" && (
                  <Button size="sm" onClick={() => sendRx(rx.id)} className="bg-emerald-500 text-white hover:bg-emerald-600">
                    <Send className="mr-1.5 h-3 w-3" /> Envoyer
                  </Button>
                )}
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${rx.status === "sent" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {rx.status === "sent" ? "Envoyée" : "Brouillon"}
                </span>
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              {rx.medications.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Pill className="h-3.5 w-3.5 text-blue-400" /> {m}
                </div>
              ))}
            </div>
            {rx.pharmacy && <p className="mt-2 text-xs text-muted-foreground">→ {rx.pharmacy}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
