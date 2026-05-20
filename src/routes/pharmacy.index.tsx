import { createFileRoute } from "@tanstack/react-router";
import { FileText, Package, TrendingUp, AlertCircle, Clock, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/pharmacy/")({ component: PharmacyDashboard });

function StatCard({ icon: Icon, label, value, color, trend }: { icon: typeof FileText; label: string; value: string | number; color: string; trend?: string }) {
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

const RECENT_RX = [
  { id: "1", doctor: "Dr. Amina Belkacem", patient: "Ahmed Benali", meds: 2, status: "new", time: "Il y a 5 min" },
  { id: "2", doctor: "Dr. Karim Hadj", patient: "Fatima Cherif", meds: 3, status: "processing", time: "Il y a 30 min" },
  { id: "3", doctor: "Dr. Sofia Meziane", patient: "Omar Djelloul", meds: 1, status: "ready", time: "Il y a 1h" },
  { id: "4", doctor: "Dr. Yacine Ould-Ali", patient: "Samira Khelif", meds: 4, status: "delivered", time: "Il y a 2h" },
];

const LOW_STOCK = [
  { name: "Metformine 850mg", stock: 12, threshold: 20 },
  { name: "Amlodipine 5mg", stock: 5, threshold: 15 },
  { name: "Paracétamol 500mg", stock: 8, threshold: 30 },
];

function PharmacyDashboard() {
  const statusConfig: Record<string, { bg: string; text: string; label: string; icon: typeof Clock }> = {
    new: { bg: "bg-blue-100", text: "text-blue-700", label: "Nouvelle", icon: Clock },
    processing: { bg: "bg-amber-100", text: "text-amber-700", label: "En cours", icon: Clock },
    ready: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Prête", icon: CheckCircle },
    delivered: { bg: "bg-gray-100", text: "text-gray-600", label: "Délivrée", icon: CheckCircle },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Tableau de bord Pharmacie 💊</h1>
        <p className="text-sm text-muted-foreground">Gérez vos ordonnances et votre stock.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={FileText} label="Ordonnances reçues" value={24} trend="Aujourd'hui" color="bg-blue-100 text-blue-600" />
        <StatCard icon={CheckCircle} label="Délivrées" value={18} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={Package} label="Produits en stock" value={342} color="bg-violet-100 text-violet-600" />
        <StatCard icon={AlertCircle} label="Stock faible" value={3} color="bg-red-100 text-red-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent prescriptions */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">Ordonnances récentes</h2>
          <div className="mt-4 space-y-3">
            {RECENT_RX.map((rx) => {
              const sc = statusConfig[rx.status];
              return (
                <div key={rx.id} className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{rx.patient}</p>
                    <p className="text-xs text-muted-foreground">{rx.doctor} · {rx.meds} médicament(s)</p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sc.bg} ${sc.text}`}>{sc.label}</span>
                    <p className="mt-1 text-xs text-muted-foreground">{rx.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low stock alerts */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <AlertCircle className="h-4 w-4 text-red-500" /> Alertes stock faible
          </h2>
          <div className="mt-4 space-y-3">
            {LOW_STOCK.map((item) => (
              <div key={item.name} className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <span className="text-sm font-bold text-red-600">{item.stock} unités</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-red-200">
                  <div className="h-2 rounded-full bg-red-500" style={{ width: `${(item.stock / item.threshold) * 100}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Seuil minimum : {item.threshold} unités</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white shadow-elegant">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Résumé du jour</h3>
        </div>
        <p className="mt-2 text-sm text-white/85">
          24 ordonnances reçues aujourd'hui. 3 produits nécessitent un réapprovisionnement urgent. Vérifiez l'inventaire pour éviter les ruptures de stock.
        </p>
      </div>
    </div>
  );
}
