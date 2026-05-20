import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Clock, Video, MapPin, Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/doctor/appointments")({ component: DoctorAppointments });

const APPOINTMENTS = [
  { id: "1", patient: "Ahmed Benali", time: "09:00", date: "2026-05-20", type: "Contrôle diabète", mode: "in_person", status: "confirmed" },
  { id: "2", patient: "Sara Meziane", time: "10:30", date: "2026-05-20", type: "Première consultation", mode: "teleconsultation", status: "pending" },
  { id: "3", patient: "Omar Djelloul", time: "14:00", date: "2026-05-20", type: "Suivi cardiaque", mode: "in_person", status: "confirmed" },
  { id: "4", patient: "Fatima Cherif", time: "15:30", date: "2026-05-21", type: "Contrôle tension", mode: "teleconsultation", status: "confirmed" },
  { id: "5", patient: "Yacine Bouzid", time: "09:30", date: "2026-05-21", type: "Allergie — suivi", mode: "in_person", status: "pending" },
];

function DoctorAppointments() {
  const [appointments, setAppointments] = useState(APPOINTMENTS);
  const today = "2026-05-20";
  const todayAppts = appointments.filter((a) => a.date === today);
  const futureAppts = appointments.filter((a) => a.date > today);

  const confirm = (id: string) => setAppointments(appointments.map((a) => a.id === id ? { ...a, status: "confirmed" } : a));
  const cancel = (id: string) => setAppointments(appointments.filter((a) => a.id !== id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Rendez-vous</h1>
        <p className="text-sm text-muted-foreground">Gérez votre agenda médical.</p>
      </div>

      {/* Today */}
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Calendar className="h-5 w-5 text-blue-500" /> Aujourd'hui
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">{todayAppts.length}</span>
        </h2>
        <div className="mt-3 space-y-3">
          {todayAppts.map((a) => (
            <ApptCard key={a.id} appt={a} onConfirm={() => confirm(a.id)} onCancel={() => cancel(a.id)} />
          ))}
          {todayAppts.length === 0 && <p className="text-sm text-muted-foreground rounded-xl border border-dashed p-6 text-center">Aucun rendez-vous aujourd'hui.</p>}
        </div>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Clock className="h-5 w-5 text-violet-500" /> À venir
        </h2>
        <div className="mt-3 space-y-3">
          {futureAppts.map((a) => (
            <ApptCard key={a.id} appt={a} onConfirm={() => confirm(a.id)} onCancel={() => cancel(a.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ApptCard({ appt, onConfirm, onCancel }: { appt: typeof APPOINTMENTS[0]; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-card">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
        {appt.mode === "teleconsultation" ? <Video className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground">{appt.patient}</p>
        <p className="text-xs text-muted-foreground">{appt.type} · {appt.mode === "teleconsultation" ? "Téléconsultation" : "Présentiel"}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-mono font-semibold text-primary">{appt.time}</p>
        <p className="text-xs text-muted-foreground">{new Date(appt.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</p>
      </div>
      {appt.status === "pending" ? (
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={onConfirm} className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"><Check className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" onClick={onCancel} className="h-8 w-8 text-red-600 hover:bg-red-50"><X className="h-4 w-4" /></Button>
        </div>
      ) : (
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Confirmé</span>
      )}
    </div>
  );
}
