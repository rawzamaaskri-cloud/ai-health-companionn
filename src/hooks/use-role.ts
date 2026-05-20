import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { isDemoMode, getDemoUser } from "@/lib/demo-auth";

export type AppRole = "admin" | "patient" | "doctor" | "pharmacy";

export function useRole() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    // Check demo mode first
    if (isDemoMode()) {
      const demo = getDemoUser();
      if (demo) {
        setRole(demo.role as AppRole);
        setLoading(false);
        return;
      }
    }

    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .order("role", { ascending: true })
      .then(({ data }) => {
        const roles = (data ?? []).map((r) => r.role as AppRole);
        if (roles.includes("admin")) setRole("admin");
        else if (roles.includes("doctor")) setRole("doctor");
        else if (roles.includes("pharmacy")) setRole("pharmacy");
        else setRole("patient");
        setLoading(false);
      });
  }, [user, authLoading]);

  return {
    role,
    loading: authLoading || loading,
    isAdmin: role === "admin",
    isDoctor: role === "doctor",
    isPharmacy: role === "pharmacy",
    isPatient: role === "patient",
  };
}
