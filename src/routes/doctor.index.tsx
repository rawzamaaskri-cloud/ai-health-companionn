import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Calendar, FileText, Activity, TrendingUp, Clock, UserCheck, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/doctor/")({ component: DoctorDashboard });

const MOCK_PATIENTS = [
  { name: "Ahmed Benali", age: 45, condition: "Diabète type 2", status: "stable", lastVisit: "2026-05-18" },
  { name: "Fatima Cherif", age: 62, condition: "Hypertension", status: "attention", lastVisit: "2026-05-15" },
  { name: "Karim Hadj", age: 38, condition: "Asthme chronique", status: "stable", lastVisit: "2026-05-20" },
  { name: "Nadia Ould", age: 55, condition: "Insuffisance cardiaque", status: "critique", lastVisit: "2026-05-19" },
];

const MOCK_APPOINTMENTS = [
  { patient: "Ahmed Benali", time: "09:00", type: "Contrôle", mode: "Présentiel" },
  { patient: "Sara Meziane", time: "10:30", type: "Consultation", mode: "Téléconsultation" },
  { patient: "Omar Djelloul", time: "14:00", type: "Suivi", mode: "Présentiel" },
];

function StatCard({ icon: Icon, label, value, trend, color }: { icon: typeof Users; label: string; value: string | number; trend?: string; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-card-hover">
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</p>
      {trend && <p className="mt-1 text-xs text-emerald-600 font-medium">{trend}</p>}
    </div>
  );
}

function DoctorDashboard() {
  const statusColors: Record<string, string> = {
    stable: "bg-emerald-100 text-emerald-700",
    attention: "bg-amber-100 text-amber-700",
    critique: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Tableau de bord Médecin 👨‍⚕️
        </h1>
        <p className="text-sm text-muted-foreground">Vue d'ensemble de votre activité médicale.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={Users} label="Patients actifs" value={127} trend="+5 ce mois" color="bg-blue-100 text-blue-600" />
        <StatCard icon={Calendar} label="RDV aujourd'hui" value={8} color="bg-violet-100 text-violet-600" />
        <StatCard icon={FileText} label="Ordonnances" value={34} trend="Ce mois" color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={AlertTriangle} label="Alertes IoT" value={3} color="bg-red-100 text-red-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Appointments */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Rendez-vous du jour</h2>
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">{MOCK_APPOINTMENTS.length} RDV</span>
          </div>
          <div className="mt-4 space-y-3">
            {MOCK_APPOINTMENTS.map((a) => (
              <div key={a.patient} className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{a.patient}</p>
                  <p className="text-xs text-muted-foreground">{a.type} · {a.mode}</p>
                </div>
                <span className="text-sm font-mono font-semibold text-primary">{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Patients récents</h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{MOCK_PATIENTS.length}</span>
          </div>
          <div className="mt-4 space-y-3">
            {MOCK_PATIENTS.map((p) => (
              <div key={p.name} className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold">
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{p.name}, {p.age} ans</p>
                  <p className="text-xs text-muted-foreground">{p.condition}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[p.status]}`}>
                  {p.status === "stable" ? "Stable" : p.status === "attention" ? "Attention" : "Critique"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="rounded-2xl border border-border bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white shadow-elegant">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Insights IA</h3>
        </div>
        <p className="mt-2 text-sm text-white/85">
          3 patients nécessitent une attention particulière cette semaine. Le patient Nadia Ould présente des constantes vitales anormales via son bracelet connecté. Consultez le monitoring IoT pour plus de détails.
        </p>
      </div>
    </div>
  );
}
