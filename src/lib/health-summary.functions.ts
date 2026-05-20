import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MODEL = "google/gemini-3-flash-preview";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const getHealthSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ force: z.boolean().optional() }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: existing } = await supabase
      .from("health_summaries")
      .select("summary, generated_at, model")
      .eq("user_id", userId)
      .maybeSingle();

    const fresh =
      existing &&
      Date.now() - new Date(existing.generated_at).getTime() < MAX_AGE_MS;

    if (existing && fresh && !data.force) {
      return {
        summary: existing.summary,
        generated_at: existing.generated_at,
        cached: true,
      };
    }

    const [profileR, vitalsR, recordsR, rxR] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("vitals")
        .select("recorded_at, heart_rate, glucose, systolic, diastolic, oxygen")
        .order("recorded_at", { ascending: false })
        .limit(14),
      supabase
        .from("medical_records")
        .select("record_type, title, description, record_date, doctor")
        .order("record_date", { ascending: false })
        .limit(20),
      supabase
        .from("prescriptions")
        .select("medication, dosage, frequency, doctor, issued_at, valid_until")
        .order("issued_at", { ascending: false })
        .limit(20),
    ]);

    const profile = profileR.data;
    const vitals = vitalsR.data ?? [];
    const records = recordsR.data ?? [];
    const prescriptions = rxR.data ?? [];

    const hasData =
      profile ||
      vitals.length > 0 ||
      records.length > 0 ||
      prescriptions.length > 0;

    if (!hasData) {
      const fallback =
        "Aucune donnée médicale n'est disponible pour le moment. Complétez votre carnet santé pour obtenir un résumé personnalisé.";
      return { summary: fallback, generated_at: new Date().toISOString(), cached: false };
    }

    const context_str = JSON.stringify(
      {
        profile: profile && {
          full_name: profile.full_name,
          date_of_birth: profile.date_of_birth,
          gender: profile.gender,
          blood_type: profile.blood_type,
          allergies: profile.allergies,
          chronic_conditions: profile.chronic_conditions,
        },
        latest_vitals: vitals.slice(0, 7),
        recent_records: records,
        active_prescriptions: prescriptions,
      },
      null,
      2,
    );

    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY non configurée");
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "Tu es AIsanté, un consultant santé virtuel bienveillant. À partir des données médicales d'un patient, rédige un résumé clair en français (5-8 phrases maximum), structuré en 3 sections courtes en markdown : **État général**, **Tendances récentes**, **Points d'attention**. Ne pose pas de diagnostic. Utilise un ton rassurant et vulgarise les termes médicaux. Termine par un conseil concret.",
          },
          {
            role: "user",
            content: `Voici les données médicales du patient (JSON) :\n\n${context_str}\n\nRédige le résumé.`,
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429)
        throw new Error("Limite de requêtes IA atteinte. Réessayez dans un instant.");
      if (aiRes.status === 402)
        throw new Error("Crédits IA épuisés. Ajoutez du crédit dans les réglages.");
      const t = await aiRes.text();
      console.error("AI gateway error", aiRes.status, t);
      throw new Error("Erreur du service IA");
    }

    const json = (await aiRes.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const summary = json.choices?.[0]?.message?.content?.trim();
    if (!summary) throw new Error("Réponse IA vide");

    const generated_at = new Date().toISOString();
    const { error: upErr } = await supabase
      .from("health_summaries")
      .upsert({ user_id: userId, summary, model: MODEL, generated_at });
    if (upErr) console.error("upsert summary error", upErr);

    return { summary, generated_at, cached: false };
  });
