import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({ component: ResetPassword });

function ResetPassword() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase pose un event PASSWORD_RECOVERY après le clic sur le lien email.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Si on a déjà une session de récupération (refresh), on autorise aussi.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) return setError("Le mot de passe doit contenir au moins 6 caractères.");
    if (password !== confirm) return setError("Les deux mots de passe ne correspondent pas.");

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    toast.success("Mot de passe mis à jour");
    await supabase.auth.signOut();
    nav({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo withText size={48} /></div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant md:p-8">
          <h1 className="text-2xl font-bold text-foreground">Nouveau mot de passe</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choisissez un nouveau mot de passe pour votre compte.
          </p>

          {!ready ? (
            <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Ouvrez cette page depuis le lien reçu par email pour réinitialiser votre mot de passe.
              <div className="mt-3">
                <Link to="/forgot-password" className="font-medium text-primary hover:underline">
                  Renvoyer un email
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                  {error}
                </div>
              )}
              <div>
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="confirm">Confirmer</Label>
                <Input id="confirm" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90">
                {loading ? "Mise à jour…" : "Mettre à jour le mot de passe"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
