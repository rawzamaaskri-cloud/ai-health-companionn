import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { isDemoMode, getDemoUser } from "@/lib/demo-auth";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check demo mode first
    if (isDemoMode()) {
      const demo = getDemoUser();
      if (demo) {
        // Create a fake user object for demo mode
        const fakeUser = {
          id: demo.id,
          email: demo.email,
          app_metadata: {},
          user_metadata: { full_name: demo.name },
          aud: "authenticated",
          created_at: new Date().toISOString(),
        } as unknown as User;
        setUser(fakeUser);
        setLoading(false);
        return;
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user, loading };
}
