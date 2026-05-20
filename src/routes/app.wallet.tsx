import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/app/wallet")({ component: Wallet });

type Profile = {
  full_name: string | null;
  date_of_birth: string | null;
  blood_type: string | null;
  allergies: string | null;
  chronic_conditions: string | null;
  emergency_contact: string | null;
  phone: string | null;
};

type Record = {
  id: string;
  record_type: string;
  title: string;
  description: string | null;
  record_date: string;
  doctor: string | null;
};

function Wallet() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>({
    full_name: "", date_of_birth: "", blood_type: "", allergies: "",
    chronic_conditions: "", emergency_contact: "", phone: "",
  });
  const [records, setRecords] = useState<Record[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newRec, setNewRec] = useState({ record_type: "diagnosis", title: "", description: "", doctor: "" });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) setProfile(data);
      const { data: r } = await supabase.from("medical_records").select("*").order("record_date", { ascending: false });
      setRecords((r ?? []) as Record[]);
    })();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ ...profile, updated_at: new Date().toISOString() }).eq("id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Profil mis à jour");
  };

  const addRecord = async () => {
    if (!user || !newRec.title) return toast.error("Titre requis");
    const { data, error } = await supabase.from("medical_records").insert({ ...newRec, user_id: user.id }).select().single();
    if (error) return toast.error(error.message);
    setRecords([data as Record, ...records]);
    setNewRec({ record_type: "diagnosis", title: "", description: "", doctor: "" });
    setShowForm(false);
    toast.success("Document ajouté");
  };

  const removeRecord = async (id: string) => {
    await supabase.from("medical_records").delete().eq("id", id);
    setRecords(records.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Carnet santé</h1>
        <p className="text-sm text-muted-foreground">Vos informations médicales personnelles.</p>
      </div>

      {/* Profile */}
      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <h2 className="text-base font-semibold text-foreground">Profil médical</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Nom complet" value={profile.full_name} onChange={(v) => setProfile({ ...profile, full_name: v })} />
          <Field label="Date de naissance" type="date" value={profile.date_of_birth} onChange={(v) => setProfile({ ...profile, date_of_birth: v })} />
          <Field label="Groupe sanguin" placeholder="A+, O-, ..." value={profile.blood_type} onChange={(v) => setProfile({ ...profile, blood_type: v })} />
          <Field label="Téléphone" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
          <Field label="Contact d'urgence" value={profile.emergency_contact} onChange={(v) => setProfile({ ...profile, emergency_contact: v })} />
          <Field label="Allergies" value={profile.allergies} onChange={(v) => setProfile({ ...profile, allergies: v })} />
          <div className="md:col-span-2">
            <Label>Maladies chroniques</Label>
            <Textarea
              value={profile.chronic_conditions ?? ""}
              onChange={(e) => setProfile({ ...profile, chronic_conditions: e.target.value })}
              placeholder="Diabète type 2, hypertension..."
            />
          </div>
        </div>
        <Button onClick={saveProfile} className="mt-4 bg-gradient-brand text-primary-foreground hover:opacity-90">
          Enregistrer
        </Button>
      </div>

      {/* Records */}
      <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Documents médicaux</h2>
          <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-1.5 h-4 w-4" /> Ajouter
          </Button>
        </div>

        {showForm && (
          <div className="mt-4 space-y-3 rounded-lg border border-border bg-muted/40 p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <Label>Type</Label>
                <select
                  className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={newRec.record_type}
                  onChange={(e) => setNewRec({ ...newRec, record_type: e.target.value })}
                >
                  <option value="diagnosis">Diagnostic</option>
                  <option value="lab_result">Résultat d'analyse</option>
                  <option value="note">Note</option>
                </select>
              </div>
              <Field label="Titre" value={newRec.title} onChange={(v) => setNewRec({ ...newRec, title: v ?? "" })} />
              <Field label="Médecin" value={newRec.doctor} onChange={(v) => setNewRec({ ...newRec, doctor: v ?? "" })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={newRec.description} onChange={(e) => setNewRec({ ...newRec, description: e.target.value })} />
            </div>
            <Button onClick={addRecord} className="bg-gradient-brand text-primary-foreground hover:opacity-90">Enregistrer</Button>
          </div>
        )}

        <ul className="mt-4 space-y-2">
          {records.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Aucun document pour l'instant.</p>}
          {records.map((r) => (
            <li key={r.id} className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{r.title}</p>
                <p className="text-xs text-muted-foreground">
                  {labelForType(r.record_type)} · {new Date(r.record_date).toLocaleDateString("fr-FR")}
                  {r.doctor ? ` · Dr ${r.doctor}` : ""}
                </p>
                {r.description && <p className="mt-1 text-sm text-foreground/80">{r.description}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeRecord(r.id)} aria-label="Supprimer">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string | null; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function labelForType(t: string) {
  return t === "diagnosis" ? "Diagnostic" : t === "lab_result" ? "Analyse" : "Note";
}
