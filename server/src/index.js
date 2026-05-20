require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { createClient } = require("@supabase/supabase-js");

// ─── Supabase Admin Client ───
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───
app.use(helmet());
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"], credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { error: "Trop de requêtes, réessayez plus tard." } });
app.use("/api/", limiter);

// ─── Auth Middleware ───
async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Token manquant." });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: "Token invalide." });

  req.user = user;

  // Fetch role
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  req.userRoles = (roles || []).map((r) => r.role);

  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.userRoles || !roles.some((r) => req.userRoles.includes(r))) {
      return res.status(403).json({ error: "Accès interdit." });
    }
    next();
  };
}

// ─── Health Check ───
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "AISANTÉ API", timestamp: new Date().toISOString() });
});

// ═══════════════════════════════════════════════════
// PATIENTS API
// ═══════════════════════════════════════════════════

// Get patient profile
app.get("/api/patients/me", authenticate, async (req, res) => {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", req.user.id).single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Update patient profile
app.put("/api/patients/me", authenticate, async (req, res) => {
  const { full_name, phone, blood_type, allergies, chronic_conditions } = req.body;
  const { data, error } = await supabase
    .from("profiles")
    .update({ full_name, phone, blood_type, allergies, chronic_conditions, updated_at: new Date().toISOString() })
    .eq("id", req.user.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get patient vitals
app.get("/api/patients/vitals", authenticate, async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const { data, error } = await supabase
    .from("vitals")
    .select("*")
    .eq("user_id", req.user.id)
    .order("recorded_at", { ascending: false })
    .limit(limit);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Add vital record
app.post("/api/patients/vitals", authenticate, async (req, res) => {
  const { heart_rate, glucose, systolic, diastolic, oxygen, temperature } = req.body;
  const { data, error } = await supabase
    .from("vitals")
    .insert({ user_id: req.user.id, heart_rate, glucose, systolic, diastolic, oxygen, temperature })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get wearable data
app.get("/api/patients/wearable", authenticate, async (req, res) => {
  const { data, error } = await supabase
    .from("wearable_data")
    .select("*")
    .eq("user_id", req.user.id)
    .order("recorded_at", { ascending: false })
    .limit(14);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ═══════════════════════════════════════════════════
// APPOINTMENTS API
// ═══════════════════════════════════════════════════

app.get("/api/appointments", authenticate, async (req, res) => {
  const query = supabase.from("appointments").select("*").order("scheduled_at", { ascending: true });
  if (req.userRoles.includes("doctor")) query.eq("doctor_id", req.user.id);
  else query.eq("user_id", req.user.id);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/appointments", authenticate, async (req, res) => {
  const { doctor_name, specialty, scheduled_at, mode, doctor_id } = req.body;
  const { data, error } = await supabase
    .from("appointments")
    .insert({ user_id: req.user.id, doctor_name, specialty, scheduled_at, mode, doctor_id })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.patch("/api/appointments/:id", authenticate, async (req, res) => {
  const { status } = req.body;
  const { data, error } = await supabase
    .from("appointments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete("/api/appointments/:id", authenticate, async (req, res) => {
  const { error } = await supabase.from("appointments").delete().eq("id", req.params.id).eq("user_id", req.user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════
// PRESCRIPTIONS API
// ═══════════════════════════════════════════════════

app.get("/api/prescriptions", authenticate, async (req, res) => {
  const query = supabase.from("prescriptions").select("*").order("created_at", { ascending: false });
  if (req.userRoles.includes("doctor")) query.eq("doctor_id", req.user.id);
  else if (req.userRoles.includes("pharmacy")) query.eq("pharmacy_id", req.user.id);
  else query.eq("patient_id", req.user.id);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/prescriptions", authenticate, requireRole("doctor"), async (req, res) => {
  const { patient_id, patient_name, pharmacy_id, pharmacy_name, medications, diagnosis, notes } = req.body;
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", req.user.id).single();
  const { data, error } = await supabase
    .from("prescriptions")
    .insert({
      doctor_id: req.user.id, doctor_name: profile?.full_name,
      patient_id, patient_name, pharmacy_id, pharmacy_name,
      medications: JSON.stringify(medications), diagnosis, notes, status: "sent",
    })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.patch("/api/prescriptions/:id/status", authenticate, requireRole("pharmacy"), async (req, res) => {
  const { status } = req.body;
  const { data, error } = await supabase
    .from("prescriptions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ═══════════════════════════════════════════════════
// DOCTOR API
// ═══════════════════════════════════════════════════

app.get("/api/doctor/patients", authenticate, requireRole("doctor"), async (req, res) => {
  const { data: relations } = await supabase
    .from("doctor_patients")
    .select("patient_id")
    .eq("doctor_id", req.user.id)
    .eq("status", "active");
  if (!relations?.length) return res.json([]);
  const patientIds = relations.map((r) => r.patient_id);
  const { data, error } = await supabase.from("profiles").select("*").in("id", patientIds);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get("/api/doctor/alerts", authenticate, requireRole("doctor"), async (req, res) => {
  const { data, error } = await supabase
    .from("wearable_alerts")
    .select("*, profiles!inner(full_name)")
    .eq("is_acknowledged", false)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ═══════════════════════════════════════════════════
// PHARMACY API
// ═══════════════════════════════════════════════════

app.get("/api/pharmacy/inventory", authenticate, requireRole("pharmacy"), async (req, res) => {
  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .eq("pharmacy_id", req.user.id)
    .order("name", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/pharmacy/inventory", authenticate, requireRole("pharmacy"), async (req, res) => {
  const { name, generic_name, dosage, form, stock_quantity, min_threshold, price } = req.body;
  const { data, error } = await supabase
    .from("medications")
    .insert({ pharmacy_id: req.user.id, name, generic_name, dosage, form, stock_quantity, min_threshold, price })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.patch("/api/pharmacy/inventory/:id", authenticate, requireRole("pharmacy"), async (req, res) => {
  const { stock_quantity, price, is_available } = req.body;
  const { data, error } = await supabase
    .from("medications")
    .update({ stock_quantity, price, is_available, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .eq("pharmacy_id", req.user.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ═══════════════════════════════════════════════════
// NOTIFICATIONS API
// ═══════════════════════════════════════════════════

app.get("/api/notifications", authenticate, async (req, res) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.patch("/api/notifications/:id/read", authenticate, async (req, res) => {
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", req.params.id)
    .eq("user_id", req.user.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ═══════════════════════════════════════════════════
// ADMIN API
// ═══════════════════════════════════════════════════

app.get("/api/admin/stats", authenticate, requireRole("admin"), async (req, res) => {
  const [patients, doctors, pharmacies, appointments] = await Promise.all([
    supabase.from("user_roles").select("id", { count: "exact" }).eq("role", "patient"),
    supabase.from("user_roles").select("id", { count: "exact" }).eq("role", "doctor"),
    supabase.from("user_roles").select("id", { count: "exact" }).eq("role", "pharmacy"),
    supabase.from("appointments").select("id", { count: "exact" }),
  ]);
  res.json({
    patients: patients.count || 0,
    doctors: doctors.count || 0,
    pharmacies: pharmacies.count || 0,
    appointments: appointments.count || 0,
  });
});

app.get("/api/admin/users", authenticate, requireRole("admin"), async (req, res) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, user_roles(role)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ─── Start Server ───
app.listen(PORT, () => {
  console.log(`\n🏥 AISANTÉ API running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
