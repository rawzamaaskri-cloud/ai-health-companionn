import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Pill, FileText, Calendar, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/patients/$id")({ component: PatientDetail });

function PatientDetail() {
  const { id } = Route.useParams();
  const [profile, setProfile] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  const reload = async () => {
    const [{ data: p }, { data: rx }, { data: mr }, { data: ap }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
      supabase.from("prescriptions").select("*").eq("user_id", id).order("issued_at", { ascending: false }),
      supabase.from("medical_records").select("*").eq("user_id", id).order("record_date", { ascending: false }),
      supabase.from("appointments").select("*").eq("user_id", id).order("scheduled_at", { ascending: false }),
    ]);
    setProfile(p);
    setPrescriptions(rx ?? []);
    setRecords(mr ?? []);
    setAppointments(ap ?? []);
  };

  useEffect(() => { reload(); }, [id]);

  const remove = async (table: "prescriptions" | "medical_records" | "appointments", rowId: string) => {
    const { error } = await supabase.from(table).delete().eq("id", rowId);
    if (error) return toast.error(error.message);
    toast.success("Supprimé");
    reload();
  };

  return (
    <div className="space-y-6">
      <Link to="/admin/patients" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Retour aux patients
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
        <h1 className="text-2xl font-bold text-foreground">{profile?.full_name || "(Sans nom)"}</h1>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <Field label="Téléphone" v={profile?.phone} />
          <Field label="Naissance" v={profile?.date_of_birth} />
          <Field label="Groupe sanguin" v={profile?.blood_type} />
          <Field label="Allergies" v={profile?.allergies} />
          <Field label="Pathologies" v={profile?.chronic_conditions} />
          <Field label="Urgence" v={profile?.emergency_contact} />
        </dl>
      </div>

      <Tabs defaultValue="prescriptions">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prescriptions"><Pill className="mr-1 h-4 w-4" /> Ordonnances</TabsTrigger>
          <TabsTrigger value="records"><FileText className="mr-1 h-4 w-4" /> Dossiers</TabsTrigger>
          <TabsTrigger value="appointments"><Calendar className="mr-1 h-4 w-4" /> Rendez-vous</TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions" className="mt-4 space-y-4">
          <PrescriptionForm userId={id} onSaved={reload} />
          <div className="space-y-2">
            {prescriptions.map((r) => (
              <Row key={r.id} title={r.medication} subtitle={`${r.dosage || ""} · ${r.frequency || ""} · Dr. ${r.doctor || "—"}`} date={r.issued_at} onDelete={() => remove("prescriptions", r.id)} />
            ))}
            {prescriptions.length === 0 && <Empty>Aucune ordonnance.</Empty>}
          </div>
        </TabsContent>

        <TabsContent value="records" className="mt-4 space-y-4">
          <RecordForm userId={id} onSaved={reload} />
          <div className="space-y-2">
            {records.map((r) => (
              <Row key={r.id} title={r.title} subtitle={`${r.record_type} · ${r.description || ""}`} date={r.record_date} onDelete={() => remove("medical_records", r.id)} />
            ))}
            {records.length === 0 && <Empty>Aucun dossier.</Empty>}
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="mt-4 space-y-4">
          <AppointmentForm userId={id} onSaved={reload} />
          <div className="space-y-2">
            {appointments.map((a) => (
              <Row key={a.id} title={`Dr. ${a.doctor_name}`} subtitle={`${a.specialty || ""} · ${a.mode} · ${a.status}`} date={new Date(a.scheduled_at).toLocaleString("fr-FR")} onDelete={() => remove("appointments", a.id)} />
            ))}
            {appointments.length === 0 && <Empty>Aucun rendez-vous.</Empty>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, v }: { label: string; v: any }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 truncate font-semibold text-foreground">{v || "—"}</dd>
    </div>
  );
}

function Row({ title, subtitle, date, onDelete }: { title: string; subtitle: string; date: string; onDelete: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4">
      <div className="min-w-0">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{date}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:bg-destructive/10">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{children}</div>;
}

function PrescriptionForm({ userId, onSaved }: { userId: string; onSaved: () => void }) {
  const [medication, setMed] = useState(""); const [dosage, setDos] = useState(""); const [frequency, setFreq] = useState(""); const [doctor, setDoc] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medication) return;
    const { error } = await supabase.from("prescriptions").insert({ user_id: userId, medication, dosage, frequency, doctor });
    if (error) return toast.error(error.message);
    toast.success("Ordonnance ajoutée"); setMed(""); setDos(""); setFreq(""); setDoc(""); onSaved();
  };
  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
      <p className="text-sm font-semibold text-foreground">Nouvelle ordonnance</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div><Label>Médicament *</Label><Input value={medication} onChange={(e) => setMed(e.target.value)} required /></div>
        <div><Label>Dosage</Label><Input value={dosage} onChange={(e) => setDos(e.target.value)} placeholder="500mg" /></div>
        <div><Label>Fréquence</Label><Input value={frequency} onChange={(e) => setFreq(e.target.value)} placeholder="2x/jour" /></div>
        <div><Label>Médecin</Label><Input value={doctor} onChange={(e) => setDoc(e.target.value)} /></div>
      </div>
      <Button type="submit" size="sm" className="bg-gradient-brand text-primary-foreground"><Plus className="mr-1 h-4 w-4" /> Ajouter</Button>
    </form>
  );
}

function RecordForm({ userId, onSaved }: { userId: string; onSaved: () => void }) {
  const [title, setTitle] = useState(""); const [record_type, setType] = useState("diagnostic"); const [description, setDesc] = useState(""); const [doctor, setDoc] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    const { error } = await supabase.from("medical_records").insert({ user_id: userId, title, record_type, description, doctor });
    if (error) return toast.error(error.message);
    toast.success("Dossier ajouté"); setTitle(""); setDesc(""); setDoc(""); onSaved();
  };
  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
      <p className="text-sm font-semibold text-foreground">Nouveau dossier</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div><Label>Titre *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
        <div>
          <Label>Type</Label>
          <select value={record_type} onChange={(e) => setType(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="diagnostic">Diagnostic</option>
            <option value="analyse">Analyse</option>
            <option value="imagerie">Imagerie</option>
            <option value="compte_rendu">Compte-rendu</option>
          </select>
        </div>
        <div className="md:col-span-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDesc(e.target.value)} rows={2} /></div>
        <div><Label>Médecin</Label><Input value={doctor} onChange={(e) => setDoc(e.target.value)} /></div>
      </div>
      <Button type="submit" size="sm" className="bg-gradient-brand text-primary-foreground"><Plus className="mr-1 h-4 w-4" /> Ajouter</Button>
    </form>
  );
}

function AppointmentForm({ userId, onSaved }: { userId: string; onSaved: () => void }) {
  const [doctor_name, setDoc] = useState(""); const [specialty, setSpec] = useState(""); const [scheduled_at, setWhen] = useState(""); const [mode, setMode] = useState("in_person");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor_name || !scheduled_at) return;
    const { error } = await supabase.from("appointments").insert({ user_id: userId, doctor_name, specialty, scheduled_at, mode });
    if (error) return toast.error(error.message);
    toast.success("Rendez-vous créé"); setDoc(""); setSpec(""); setWhen(""); onSaved();
  };
  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
      <p className="text-sm font-semibold text-foreground">Nouveau rendez-vous</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div><Label>Médecin *</Label><Input value={doctor_name} onChange={(e) => setDoc(e.target.value)} required /></div>
        <div><Label>Spécialité</Label><Input value={specialty} onChange={(e) => setSpec(e.target.value)} /></div>
        <div><Label>Date & heure *</Label><Input type="datetime-local" value={scheduled_at} onChange={(e) => setWhen(e.target.value)} required /></div>
        <div>
          <Label>Mode</Label>
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="in_person">Présentiel</option>
            <option value="teleconsultation">Téléconsultation</option>
          </select>
        </div>
      </div>
      <Button type="submit" size="sm" className="bg-gradient-brand text-primary-foreground"><Plus className="mr-1 h-4 w-4" /> Ajouter</Button>
    </form>
  );
}
