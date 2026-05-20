import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageSquare, Send, Stethoscope, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pharmacy/messages")({ component: PharmacyMessages });

type Conversation = {
  id: string;
  name: string;
  role: "doctor" | "patient";
  lastMessage: string;
  time: string;
  unread: number;
};

type Message = { sender: "me" | "them"; text: string; time: string };

const CONVERSATIONS: Conversation[] = [
  { id: "1", name: "Dr. Amina Belkacem", role: "doctor", lastMessage: "Le Metformine 850mg est-il disponible ?", time: "Il y a 5 min", unread: 1 },
  { id: "2", name: "Ahmed Benali", role: "patient", lastMessage: "Mon ordonnance est-elle prête ?", time: "Il y a 30 min", unread: 1 },
  { id: "3", name: "Dr. Karim Hadj", role: "doctor", lastMessage: "Merci pour la confirmation.", time: "Il y a 2h", unread: 0 },
  { id: "4", name: "Fatima Cherif", role: "patient", lastMessage: "D'accord, je passerai demain.", time: "Hier", unread: 0 },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  "1": [
    { sender: "them", text: "Bonjour, le Metformine 850mg est-il disponible en stock ?", time: "14:25" },
    { sender: "me", text: "Bonjour Dr. Belkacem, oui nous avons 12 unités en stock.", time: "14:28" },
    { sender: "them", text: "Parfait, je vais envoyer une ordonnance pour Ahmed Benali.", time: "14:30" },
    { sender: "them", text: "Le Metformine 850mg est-il disponible ?", time: "14:35" },
  ],
  "2": [
    { sender: "them", text: "Bonjour, mon ordonnance est-elle prête ?", time: "13:50" },
  ],
};

function PharmacyMessages() {
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  const send = () => {
    if (!input.trim() || !selectedConv) return;
    const convMsgs = messages[selectedConv.id] || [];
    setMessages({ ...messages, [selectedConv.id]: [...convMsgs, { sender: "me", text: input, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) }] });
    setInput("");
  };

  if (selectedConv) {
    const convMsgs = messages[selectedConv.id] || [];
    return (
      <div className="flex h-[calc(100vh-7rem)] flex-col md:h-[calc(100vh-4rem)]">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedConv(null)} className="md:hidden">←</Button>
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${selectedConv.role === "doctor" ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"}`}>
            {selectedConv.role === "doctor" ? <Stethoscope className="h-4 w-4" /> : <User className="h-4 w-4" />}
          </div>
          <div>
            <p className="font-semibold text-foreground">{selectedConv.name}</p>
            <p className="text-xs text-muted-foreground">{selectedConv.role === "doctor" ? "Médecin" : "Patient"}</p>
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto py-4">
          {convMsgs.map((m, i) => (
            <div key={i} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.sender === "me" ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white" : "bg-muted text-foreground"}`}>
                {m.text}
                <p className={`mt-1 text-xs ${m.sender === "me" ? "text-white/60" : "text-muted-foreground"}`}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t border-border pt-3">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Écrire un message..." className="flex-1" />
          <Button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"><Send className="h-4 w-4" /></Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Messages</h1>
        <p className="text-sm text-muted-foreground">Communiquez avec les médecins et patients.</p>
      </div>
      <div className="space-y-2">
        {CONVERSATIONS.map((c) => (
          <div key={c.id} onClick={() => setSelectedConv(c)} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 cursor-pointer transition-all hover:shadow-card">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${c.role === "doctor" ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"}`}>
              {c.role === "doctor" ? <Stethoscope className="h-5 w-5" /> : <User className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">{c.name}</p>
                <span className="text-xs text-muted-foreground">{c.time}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{c.lastMessage}</p>
            </div>
            {c.unread > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">{c.unread}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
