import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, Plus, Stethoscope, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/app/appointments")({ component: Appointments });

type Appt = {
  id: string;
  doctor_name: string;
  specialty: string | null;
  scheduled_at: string;
  mode: string;
  status: string;
  notes: string | null;
};

const DOCTORS = [
  { name: "Dr. Amina Belkacem", specialty: "Endocrinologue" },
  { name: "Dr. Karim Hadj", specialty: "Cardiologue" },
  { name: "Dr. Sofia Meziane", specialty: "Médecin généraliste" },
  { name: "Dr. Yacine Ould-Ali", specialty: "Pneumologue" },
];

function Appointments() {
  const { user } = useAuth();
  const [list, setList] = useState<Appt[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ doctor_name: DOCTORS[0].name, specialty: DOCTORS[0].specialty, scheduled_at: "", mode: "in_person" });
  const [tele, setTele] = useState<Appt | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("appointments").select("*").order("scheduled_at", { ascending: true }).then(({ data }) => {
      setList((data ?? []) as Appt[]);
    });
  }, [user]);

  const book = async () => {
    if (!user || !form.scheduled_at) return toast.error("Date requise");
    const { data, error } = await supabase.from("appointments").insert({ ...form, user_id: user.id }).select().single();
    if (error) return toast.error(error.message);
    setList([...(list ?? []), data as Appt].sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at)));
    setShowForm(false);
    toast.success("Rendez-vous confirmé");
  };

  const cancel = async (id: string) => {
    await supabase.from("appointments").delete().eq("id", id);
    setList(list.filter((a) => a.id !== id));
  };

  if (tele) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setTele(null)}>← Retour</Button>
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent shadow-elegant">
          <div className="flex h-full flex-col items-center justify-center text-primary-foreground">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <Stethoscope className="h-12 w-12" />
            </div>
            <p className="mt-4 text-xl font-semibold">{tele.doctor_name}</p>
            <p className="text-sm opacity-80">{tele.specialty}</p>
            <p className="mt-6 text-xs opacity-70">Téléconsultation simulée — démonstration MVP</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1 bg-success text-success-foreground hover:opacity-90">🎤 Micro</Button>
          <Button variant="outline" className="flex-1">📷 Caméra</Button>
          <Button variant="destructive" className="flex-1" onClick={() => setTele(null)}>Raccrocher</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Rendez-vous</h1>
          <p className="text-sm text-muted-foreground">Réservez un médecin ou démarrez une téléconsultation.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-brand text-primary-foreground hover:opacity-90">
          <Plus className="mr-1.5 h-4 w-4" /> Réserver
        </Button>
      </div>

      {showForm && (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <div>
            <Label>Médecin</Label>
            <select
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.doctor_name}
              onChange={(e) => {
                const d = DOCTORS.find((x) => x.name === e.target.value)!;
                setForm({ ...form, doctor_name: d.name, specialty: d.specialty });
              }}
            >
              {DOCTORS.map((d) => <option key={d.name} value={d.name}>{d.name} — {d.specialty}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <Label>Date & heure</Label>
              <Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
            </div>
            <div>
              <Label>Mode</Label>
              <select
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
              >
                <option value="in_person">Présentiel</option>
                <option value="teleconsultation">Téléconsultation</option>
              </select>
            </div>
          </div>
          <Button onClick={book} className="bg-gradient-brand text-primary-foreground hover:opacity-90">Confirmer</Button>
        </div>
      )}

      <div className="space-y-3">
        {list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Aucun rendez-vous prévu.</p>
          </div>
        )}
        {list.map((a) => (
          <div key={a.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">{a.doctor_name}</p>
              <p className="text-xs text-muted-foreground">{a.specialty}</p>
              <p className="mt-1 text-sm text-foreground">
                {new Date(a.scheduled_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
            {a.mode === "teleconsultation" ? (
              <Button size="sm" onClick={() => setTele(a)} className="bg-accent text-accent-foreground hover:opacity-90">
                <Video className="mr-1.5 h-4 w-4" /> Rejoindre
              </Button>
            ) : (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">Présentiel</span>
            )}
            <Button variant="ghost" size="icon" onClick={() => cancel(a.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
