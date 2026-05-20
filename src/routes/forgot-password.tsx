import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPassword });

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Adresse email invalide.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error("Impossible d'envoyer l'email", { description: error.message });
      return;
    }
    setSent(true);
    toast.success("Email envoyé", { description: "Vérifiez votre boîte de réception." });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo withText size={48} /></div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant md:p-8">
          <h1 className="text-2xl font-bold text-foreground">Mot de passe oublié</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Entrez votre email pour recevoir un lien de réinitialisation.
          </p>

          {sent ? (
            <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
              <p className="font-semibold text-foreground">Email envoyé&nbsp;!</p>
              <p className="mt-1 text-muted-foreground">
                Si un compte existe avec cet email, vous allez recevoir un lien pour définir un nouveau mot de passe. Pensez à vérifier vos spams.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90">
                {loading ? "Envoi…" : "Envoyer le lien"}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/login" className="font-medium text-primary hover:underline">← Retour à la connexion</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
