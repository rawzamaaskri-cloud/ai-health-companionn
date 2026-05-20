import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/app/consultant")({ component: Consultant });

type Msg = { role: "user" | "assistant"; content: string };

const WELCOME: Msg = {
  role: "assistant",
  content:
    "Bonjour 👋 Je suis votre Consultant IA AIsanté. Posez-moi une question sur vos analyses, votre traitement ou un symptôme — je vulgarise les termes médicaux pour vous. ⚠️ Mes réponses ne remplacent pas un avis médical.",
};

const SUGGESTIONS = [
  "Explique-moi ce qu'est l'HbA1c",
  "Comment réduire ma tension naturellement ?",
  "Que signifie un taux de glycémie à 1.4 g/L ?",
];

function Consultant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || streaming || !user) return;
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);

    // persist user message
    await supabase.from("chat_messages").insert({ user_id: user.id, role: "user", content: text });

    // patient context
    const { data: profile } = await supabase.from("profiles")
      .select("blood_type, allergies, chronic_conditions, date_of_birth").eq("id", user.id).maybeSingle();
    const ctx = profile
      ? `Groupe sanguin: ${profile.blood_type ?? "?"}; Allergies: ${profile.allergies ?? "aucune"}; Maladies chroniques: ${profile.chronic_conditions ?? "aucune"}.`
      : undefined;

    let assistantText = "";
    setMessages([...next, { role: "assistant", content: "" }]);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/health-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: next.filter((m) => m !== WELCOME).map((m) => ({ role: m.role, content: m.content })),
          patientContext: ctx,
        }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Trop de requêtes. Patientez un instant.");
        else if (resp.status === 402) toast.error("Crédits IA épuisés.");
        else toast.error("Erreur du consultant IA");
        setMessages(next);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;
      while (!done) {
        const r = await reader.read();
        if (r.done) break;
        buffer += decoder.decode(r.value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              setMessages((m) => {
                const c = [...m];
                c[c.length - 1] = { role: "assistant", content: assistantText };
                return c;
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      if (assistantText) {
        await supabase.from("chat_messages").insert({ user_id: user.id, role: "assistant", content: assistantText });
      }
    } catch (e) {
      console.error(e);
      toast.error("Connexion impossible au consultant IA");
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col md:h-[calc(100vh-4rem)]">
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-brand shadow-glow">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success ring-2 ring-background" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Consultant IA AIsanté</h1>
            <p className="text-xs text-muted-foreground">En ligne · Vulgarisation médicale</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-border bg-card p-4">
        {messages.map((m, i) => (
          <Bubble key={i} msg={m} />
        ))}
        {streaming && messages[messages.length - 1].content === "" && (
          <div className="flex gap-2 pl-11">
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              <Sparkles className="h-3 w-3 text-accent" /> {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="mt-3 flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez votre question santé..."
          disabled={streaming}
          className="flex-1"
        />
        <Button type="submit" disabled={streaming || !input.trim()} className="bg-gradient-brand text-primary-foreground hover:opacity-90">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-secondary text-secondary-foreground" : "bg-gradient-brand text-primary-foreground"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}
