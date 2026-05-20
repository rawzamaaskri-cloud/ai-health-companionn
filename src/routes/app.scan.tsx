import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, QrCode, ScanLine, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/app/scan")({ component: Scan });

function Scan() {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => setProfile(data));
  }, [user]);

  const simulateScan = () => {
    setScanning(true);
    setRevealed(false);
    setTimeout(() => {
      setScanning(false);
      setRevealed(true);
    }, 1600);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Bracelet AIsanté</h1>
        <p className="text-sm text-muted-foreground">Accès d'urgence à votre dossier via QR/NFC.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* QR card */}
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <h2 className="text-base font-semibold text-foreground">Votre QR personnel</h2>
          <p className="text-xs text-muted-foreground">À imprimer ou intégrer dans votre bracelet.</p>
          <div className="mx-auto my-6 inline-block rounded-2xl border-4 border-primary/20 bg-white p-4 shadow-elegant">
            <FakeQR seed={user?.id ?? "aisante"} />
          </div>
          <p className="text-xs text-muted-foreground">ID: {user?.id?.slice(0, 8)}…</p>
        </div>

        {/* Scanner sim */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">Scanner d'urgence (démo)</h2>
          <p className="text-xs text-muted-foreground">Simulez la lecture du bracelet par un soignant.</p>

          <div className="relative mx-auto my-6 flex aspect-square w-full max-w-xs items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-primary/40 bg-gradient-soft">
            {!scanning && !revealed && <QrCode className="h-20 w-20 text-muted-foreground" />}
            {scanning && (
              <>
                <ScanLine className="h-20 w-20 text-primary" />
                <div className="absolute inset-x-4 top-0 h-1 animate-[scan_1.6s_ease-in-out] bg-gradient-brand" />
              </>
            )}
            {revealed && (
              <div className="flex flex-col items-center text-success">
                <ShieldAlert className="h-16 w-16" />
                <p className="mt-2 text-sm font-semibold">Profil déverrouillé</p>
              </div>
            )}
          </div>
          <Button onClick={simulateScan} className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90">
            {scanning ? "Lecture..." : revealed ? "Re-scanner" : "Simuler le scan"}
          </Button>
        </div>
      </div>

      {/* Revealed emergency card */}
      {revealed && profile && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Fiche d'urgence patient</h3>
              <p className="text-xs text-muted-foreground">Information accessible aux secours</p>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <Row label="Nom" value={profile.full_name} />
            <Row label="Date de naissance" value={profile.date_of_birth} />
            <Row label="Groupe sanguin" value={profile.blood_type} highlight />
            <Row label="Téléphone" value={profile.phone} />
            <Row label="Allergies" value={profile.allergies} highlight />
            <Row label="Maladies chroniques" value={profile.chronic_conditions} />
            <Row label="Contact d'urgence" value={profile.emergency_contact} />
          </dl>
        </div>
      )}

      <style>{`@keyframes scan { 0%{transform:translateY(0)} 50%{transform:translateY(220px)} 100%{transform:translateY(0)} }`}</style>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string | null | undefined; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border border-border p-3 ${highlight ? "bg-warning/10" : "bg-muted/40"}`}>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-semibold text-foreground">{value || "—"}</dd>
    </div>
  );
}

function FakeQR({ seed }: { seed: string }) {
  // Deterministic 12x12 pseudo-QR pattern
  const size = 12;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push((h & 1) === 1);
  }
  return (
    <div className="grid gap-px bg-white" style={{ gridTemplateColumns: `repeat(${size}, 14px)` }}>
      {cells.map((on, i) => (
        <div key={i} className={on ? "h-3.5 w-3.5 bg-primary" : "h-3.5 w-3.5 bg-white"} />
      ))}
    </div>
  );
}
