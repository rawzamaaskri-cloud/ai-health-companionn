import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/hooks/use-role";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [user, loading, nav]);

  useEffect(() => {
    if (!roleLoading && user && isAdmin) nav({ to: "/admin" });
  }, [roleLoading, isAdmin, user, nav]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-soft">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <AppShell />;
}
