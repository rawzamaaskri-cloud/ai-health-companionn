import { createFileRoute } from "@tanstack/react-router";
import { Heart, Activity, Thermometer, Wind, AlertTriangle, Wifi, WifiOff } from "lucide-react";

export const Route = createFileRoute("/doctor/monitoring")({ component: DoctorMonitoring });

const DEVICES = [
  { patient: "Ahmed Benali", online: true, heartRate: 72, bp: "120/80", spo2: 98, temp: 36.8, steps: 6420, alert: false },
  { patient: "Fatima Cherif", online: true, heartRate: 92, bp: "158/98", spo2: 95, temp: 37.1, steps: 1200, alert: true },
  { patient: "Nadia Ould", online: true, heartRate: 108, bp: "88/55", spo2: 91, temp: 37.8, steps: 340, alert: true },
  { patient: "Karim Hadj", online: true, heartRate: 68, bp: "118/76", spo2: 99, temp: 36.6, steps: 8900, alert: false },
  { patient: "Yacine Bouzid", online: false, heartRate: 0, bp: "--/--", spo2: 0, temp: 0, steps: 0, alert: false },
  { patient: "Samira Khelif", online: true, heartRate: 82, bp: "138/90", spo2: 97, temp: 36.9, steps: 3200, alert: true },
];

function DoctorMonitoring() {
  const alertCount = DEVICES.filter((d) => d.alert).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Monitoring IoT</h1>
        <p className="text-sm text-muted-foreground">Données en temps réel des bracelets connectés de vos patients.</p>
      </div>

      {alertCount > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <p className="text-sm font-medium text-red-700">{alertCount} patient(s) nécessitent une attention immédiate.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {DEVICES.map((d) => (
          <div key={d.patient} className={`rounded-2xl border bg-card p-5 transition-all hover:shadow-card-hover ${d.alert ? "border-red-300 ring-2 ring-red-100" : "border-border"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${d.alert ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"} font-bold text-sm`}>
                  {d.patient.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{d.patient}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {d.online ? <Wifi className="h-3 w-3 text-emerald-500" /> : <WifiOff className="h-3 w-3 text-gray-400" />}
                    <span className={`text-xs ${d.online ? "text-emerald-600" : "text-gray-400"}`}>{d.online ? "En ligne" : "Hors ligne"}</span>
                  </div>
                </div>
              </div>
              {d.alert && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 animate-pulse">⚠ Alerte</span>}
            </div>

            {d.online ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <VitalItem icon={Heart} label="Pouls" value={`${d.heartRate}`} unit="bpm" alert={d.heartRate > 100 || d.heartRate < 50} />
                <VitalItem icon={Activity} label="Tension" value={d.bp} unit="mmHg" alert={d.bp.includes("158") || d.bp.includes("88")} />
                <VitalItem icon={Wind} label="SpO₂" value={`${d.spo2}`} unit="%" alert={d.spo2 < 94} />
                <VitalItem icon={Thermometer} label="Temp." value={`${d.temp}`} unit="°C" alert={d.temp > 37.5} />
              </div>
            ) : (
              <div className="mt-4 flex items-center justify-center rounded-xl bg-muted/50 p-6">
                <p className="text-sm text-muted-foreground">Appareil hors ligne</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function VitalItem({ icon: Icon, label, value, unit, alert }: { icon: typeof Heart; label: string; value: string; unit: string; alert: boolean }) {
  return (
    <div className={`rounded-xl p-2.5 ${alert ? "bg-red-50" : "bg-muted/30"}`}>
      <div className="flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${alert ? "text-red-500" : "text-muted-foreground"}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`mt-0.5 text-lg font-bold ${alert ? "text-red-600" : "text-foreground"}`}>
        {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}
