/**
 * Demo Authentication System
 * Provides fake user sessions for demonstration purposes.
 * Bypasses Supabase auth so the committee can test all spaces directly.
 */

export type DemoRole = "patient" | "doctor" | "pharmacy" | "admin";

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: DemoRole;
}

export const DEMO_ACCOUNTS: Record<DemoRole, { email: string; password: string; name: string }> = {
  patient: {
    email: "patient@aisante.dz",
    password: "demo1234",
    name: "Amina Benali",
  },
  doctor: {
    email: "medecin@aisante.dz",
    password: "demo1234",
    name: "Dr. Karim Meziane",
  },
  pharmacy: {
    email: "pharmacie@aisante.dz",
    password: "demo1234",
    name: "Pharmacie El-Shifa",
  },
  admin: {
    email: "admin@aisante.dz",
    password: "demo1234",
    name: "Administrateur Système",
  },
};

const DEMO_STORAGE_KEY = "aisante_demo_user";

export function isDemoMode(): boolean {
  try {
    return localStorage.getItem(DEMO_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function getDemoUser(): DemoUser | null {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoUser;
  } catch {
    return null;
  }
}

export function demoLogin(role: DemoRole): DemoUser {
  const account = DEMO_ACCOUNTS[role];
  const user: DemoUser = {
    id: `demo-${role}-${Date.now()}`,
    email: account.email,
    name: account.name,
    role,
  };
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function demoLogout(): void {
  localStorage.removeItem(DEMO_STORAGE_KEY);
}
