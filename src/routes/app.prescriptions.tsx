import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Pill, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/app/prescriptions")({ component: Prescriptions });

type Rx = {
  id: string;
  medication: string;
  dosage: string | null;
  frequency: string | null;
  doctor: string | null;
  issued_at: string;
  valid_until: string | null;
  notes: string | null;
};

type Intake = {
  id: string;
  prescription_id: string;
  intake_date: string;
  slot: string;
  taken: boolean;
};

const SLOTS: { key: string; label: string }[] = [
  { key: "morning", label: "Matin" },
  { key: "noon", label: "Midi" },
  { key: "evening", label: "Soir" },
  { key: "night", label: "Nuit" },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoISO(n: number) {
  return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
}

function Prescriptions() {
  const { user } = useAuth();
  const [list, setList] = useState<Rx[]>([]);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ medication: "", dosage: "", frequency: "", doctor: "", valid_until: "", notes: "" });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("prescriptions").select("*").order("issued_at", { ascending: false });
      setList((data ?? []) as Rx[]);
      const since = daysAgoISO(7);
      const { data: i } = await supabase
        .from("medication_intakes")
        .select("id, prescription_id, intake_date, slot, taken")
        .gte("intake_date", since);
      setIntakes((i ?? []) as Intake[]);
    })();
  }, [user]);

  const add = async () => {
    if (!user || !form.medication) return toast.error("Médicament requis");
    const payload = { ...form, valid_until: form.valid_until || null, user_id: user.id };
    const { data, error } = await supabase.from("prescriptions").insert(payload).select().single();
    if (error) return toast.error(error.message);
    setList([data as Rx, ...list]);
    setForm({ medication: "", dosage: "", frequency: "", doctor: "", valid_until: "", notes: "" });
    setShow(false);
    toast.success("Ordonnance enregistrée");
  };

  const remove = async (id: string) => {
    await supabase.from("prescriptions").delete().eq("id", id);
    setList(list.filter((r) => r.id !== id));
    setIntakes(intakes.filter((i) => i.prescription_id !== id));
  };

  const toggleIntake = async (rxId: string, slot: string) => {
    if (!user) return;
    const date = todayISO();
    const existing = intakes.find(
      (i) => i.prescription_id === rxId && i.intake_date === date && i.slot === slot
    );
    if (existing) {
      await supabase.from("medication_intakes").delete().eq("id", existing.id);
      setIntakes(intakes.filter((i) => i.id !== existing.id));
    } else {
      const { data, error } = await supabase
        .from("medication_intakes")
        .insert({ user_id: user.id, prescription_id: rxId, intake_date: date, slot, taken: true })
        .select()
        .single();
      if (error) return toast.error(error.message);
      setIntakes([...intakes, data as Intake]);
    }
  };

  const isValid = (rx: Rx) => !rx.valid_until || new Date(rx.valid_until) >= new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Ordonnances</h1>
          <p className="text-sm text-muted-foreground">Vos prescriptions et suivi quotidien des prises.</p>
        </div>
        <Button onClick={() => setShow(!show)} className="bg-gradient-brand text-primary-foreground hover:opacity-90">
          <Plus className="mr-1.5 h-4 w-4" /> Ajouter
        </Button>
      </div>

      {show && (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div><Label>Médicament</Label><Input value={form.medication} onChange={(e) => setForm({ ...form, medication: e.target.value })} /></div>
            <div><Label>Dosage</Label><Input placeholder="500mg" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} /></div>
            <div><Label>Fréquence</Label><Input placeholder="2x/jour" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} /></div>
            <div><Label>Médecin prescripteur</Label><Input value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} /></div>
            <div><Label>Valide jusqu'au</Label><Input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} /></div>
          </div>
          <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <Button onClick={add} className="bg-gradient-brand text-primary-foreground hover:opacity-90">Enregistrer</Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {list.length === 0 && (
          <div className="md:col-span-2 rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <Pill className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Aucune ordonnance enregistrée.</p>
          </div>
        )}
        {list.map((rx) => {
          const valid = isValid(rx);
          return (
            <div key={rx.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{rx.medication}</p>
                    <p className="text-xs text-muted-foreground">{[rx.dosage, rx.frequency].filter(Boolean).join(" · ") || "—"}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    valid ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {valid ? <ShieldCheck className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                  {valid ? "Valide" : "Expirée"}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <p>Émise : {new Date(rx.issued_at).toLocaleDateString("fr-FR")}</p>
                {rx.valid_until && <p>Jusqu'au : {new Date(rx.valid_until).toLocaleDateString("fr-FR")}</p>}
                {rx.doctor && <p className="col-span-2">Dr {rx.doctor}</p>}
              </div>
              {rx.notes && <p className="mt-2 text-sm text-foreground/80">{rx.notes}</p>}

              {valid && (
                <AdherenceBlock
                  rxId={rx.id}
                  intakes={intakes.filter((i) => i.prescription_id === rx.id)}
                  onToggle={(slot) => toggleIntake(rx.id, slot)}
                />
              )}

              <Button variant="ghost" size="sm" onClick={() => remove(rx.id)} className="mt-2 text-destructive hover:text-destructive">
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Supprimer
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdherenceBlock({
  rxId, intakes, onToggle,
}: { rxId: string; intakes: Intake[]; onToggle: (slot: string) => void }) {
  const today = todayISO();
  const todayIntakes = intakes.filter((i) => i.intake_date === today);

  // 7-day adherence: assume 1 prise/day expected per slot taken at least once recently.
  // Simple heuristic: count distinct (date,slot) over last 7 days vs (7 days × number of slots used in that window).
  const adherence = useMemo(() => {
    const slotsUsed = new Set(intakes.map((i) => i.slot));
    const expected = Math.max(1, slotsUsed.size) * 7;
    const taken = intakes.filter((i) => i.taken).length;
    return Math.min(100, Math.round((taken / expected) * 100));
  }, [intakes]);

  return (
    <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-foreground">Prises d'aujourd'hui</p>
        <span className="text-xs font-semibold text-primary">Observance 7j : {adherence}%</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {SLOTS.map((s) => {
          const done = todayIntakes.some((i) => i.slot === s.key);
          return (
            <button
              key={s.key}
              onClick={() => onToggle(s.key)}
              className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                done
                  ? "border-success bg-success/15 text-success"
                  : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
              }`}
              aria-pressed={done}
            >
              {done ? "✓ " : ""}{s.label}
            </button>
          );
        })}
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-gradient-brand transition-all"
          style={{ width: `${adherence}%` }}
        />
      </div>
    </div>
  );
}
