import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, ShieldCheck, Stethoscope, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/signup")({ component: Signup });

type Role = "patient" | "doctor" | "pharmacy" | "admin";
type Gender = "" | "female" | "male" | "other";

const ROLES = [
  { value: "patient" as Role, icon: Heart, title: "Patient", desc: "Mon carnet santé", color: "from-rose-500 to-pink-500" },
  { value: "doctor" as Role, icon: Stethoscope, title: "Médecin", desc: "Suivi patients", color: "from-blue-500 to-indigo-500" },
  { value: "pharmacy" as Role, icon: Building2, title: "Pharmacie", desc: "Ordonnances", color: "from-emerald-500 to-teal-500" },
  { value: "admin" as Role, icon: ShieldCheck, title: "Admin", desc: "Back-office", color: "from-violet-500 to-purple-500" },
];

function Signup() {
  const nav = useNavigate();
  const [role, setRole] = useState<Role>("patient");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [nationalId, setNationalId] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [pharmacyName, setPharmacyName] = useState("");
  const [pharmacyAddress, setPharmacyAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedNationalId = nationalId.trim();

    if (trimmedName.length < 2) return fail("Veuillez renseigner votre nom complet.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return fail("Adresse email invalide.");
    if (trimmedPhone && !/^[+0-9\s().-]{6,20}$/.test(trimmedPhone)) return fail("Numéro de téléphone invalide.");
    if (role === "patient") {
      if (!dob) return fail("Date de naissance requise.");
      if (!gender) return fail("Veuillez sélectionner un genre.");
      if (trimmedNationalId.length < 4) return fail("Numéro d'identification national requis (≥ 4 caractères).");
    }
    if (role === "doctor") {
      if (!specialty.trim()) return fail("Veuillez indiquer votre spécialité.");
      if (!licenseNumber.trim()) return fail("Numéro d'ordre médical requis.");
    }
    if (role === "pharmacy") {
      if (!pharmacyName.trim()) return fail("Nom de la pharmacie requis.");
    }
    if (password.length < 6) return fail("Le mot de passe doit contenir au moins 6 caractères.");
    if (password !== confirmPassword) return fail("Les deux mots de passe ne correspondent pas.");

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: {
          full_name: trimmedName,
          role,
          phone: trimmedPhone || null,
          date_of_birth: dob || null,
          gender: gender || null,
          national_id: trimmedNationalId || null,
          specialty: specialty || null,
          license_number: licenseNumber || null,
          pharmacy_name: pharmacyName || null,
          pharmacy_address: pharmacyAddress || null,
        },
      },
    });
    setLoading(false);
    if (signUpError) return fail(signUpError.message);
    toast.success("Compte créé ! Vérifiez votre email pour activer le compte.");
    nav({ to: "/login" });
  };

  const fail = (msg: string) => {
    setError(msg);
    toast.error(msg);
  };

  const roleLabels: Record<Role, string> = {
    patient: "patient",
    doctor: "médecin",
    pharmacy: "pharmacie",
    admin: "administrateur",
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex justify-center"><Logo withText size={48} /></div>
        <div className="rounded-3xl border border-border bg-card/95 backdrop-blur-sm p-6 shadow-elegant md:p-8">
          <h1 className="text-2xl font-bold text-foreground">Créer un compte</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choisissez votre espace pour commencer.</p>

          <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
            {ROLES.map((r) => (
              <RoleCard
                key={r.value}
                active={role === r.value}
                onClick={() => setRole(r.value)}
                icon={<r.icon className="h-5 w-5" />}
                title={r.title}
                desc={r.desc}
                color={r.color}
              />
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert" aria-live="polite">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="name">{role === "pharmacy" ? "Nom du responsable" : "Nom complet"}</Label>
              <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" type="tel" autoComplete="tel" placeholder="+213 5XX XX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            {role === "patient" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="dob">Date de naissance</Label>
                    <Input id="dob" type="date" required value={dob} onChange={(e) => setDob(e.target.value)} max={new Date().toISOString().split("T")[0]} />
                  </div>
                  <div>
                    <Label htmlFor="gender">Genre</Label>
                    <select
                      id="gender"
                      required
                      value={gender}
                      onChange={(e) => setGender(e.target.value as Gender)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                    >
                      <option value="">Choisir…</option>
                      <option value="female">Féminin</option>
                      <option value="male">Masculin</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="national_id">Numéro d'identification national</Label>
                  <Input id="national_id" required value={nationalId} onChange={(e) => setNationalId(e.target.value)} placeholder="CNI / NPI" />
                </div>
              </>
            )}

            {role === "doctor" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="specialty">Spécialité</Label>
                    <Input id="specialty" required value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Cardiologie, Médecine générale…" />
                  </div>
                  <div>
                    <Label htmlFor="license">N° d'ordre médical</Label>
                    <Input id="license" required value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="ORD-XXXXX" />
                  </div>
                </div>
              </>
            )}

            {role === "pharmacy" && (
              <>
                <div>
                  <Label htmlFor="pharmacy_name">Nom de la pharmacie</Label>
                  <Input id="pharmacy_name" required value={pharmacyName} onChange={(e) => setPharmacyName(e.target.value)} placeholder="Pharmacie Centrale…" />
                </div>
                <div>
                  <Label htmlFor="pharmacy_address">Adresse</Label>
                  <Input id="pharmacy_address" value={pharmacyAddress} onChange={(e) => setPharmacyAddress(e.target.value)} placeholder="Rue, Ville, Wilaya" />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <p className="mt-1 text-xs text-muted-foreground">6 caractères minimum.</p>
            </div>

            <div>
              <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
              <Input id="confirm_password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90">
              {loading ? "Création..." : `Créer mon compte ${roleLabels[role]}`}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Déjà inscrit ? <Link to="/login" className="font-medium text-primary hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleCard({ active, onClick, icon, title, desc, color }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string; color: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all",
        active ? "border-primary bg-primary/5 shadow-elegant" : "border-border bg-card hover:border-primary/40"
      )}
    >
      <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white", active ? color : "from-gray-300 to-gray-400")}>
        {icon}
      </span>
      <span className="text-sm font-semibold text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground">{desc}</span>
    </button>
  );
}
