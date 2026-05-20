import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Package, Plus, Search, AlertCircle, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/pharmacy/inventory")({ component: PharmacyInventory });

const INITIAL_MEDS = [
  { id: "1", name: "Metformine", dosage: "850mg", form: "Comprimé", stock: 12, min: 20, price: 350, available: true },
  { id: "2", name: "Amlodipine", dosage: "5mg", form: "Comprimé", stock: 5, min: 15, price: 280, available: true },
  { id: "3", name: "Paracétamol", dosage: "500mg", form: "Comprimé", stock: 8, min: 30, price: 120, available: true },
  { id: "4", name: "Amoxicilline", dosage: "500mg", form: "Gélule", stock: 45, min: 20, price: 450, available: true },
  { id: "5", name: "Losartan", dosage: "50mg", form: "Comprimé", stock: 32, min: 15, price: 520, available: true },
  { id: "6", name: "Insuline Rapide", dosage: "100UI/ml", form: "Injection", stock: 18, min: 10, price: 1800, available: true },
  { id: "7", name: "Salbutamol", dosage: "100µg", form: "Inhalateur", stock: 25, min: 10, price: 650, available: true },
  { id: "8", name: "Vitamine D3", dosage: "200000UI", form: "Ampoule", stock: 50, min: 15, price: 380, available: true },
];

function PharmacyInventory() {
  const [meds, setMeds] = useState(INITIAL_MEDS);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newMed, setNewMed] = useState({ name: "", dosage: "", form: "Comprimé", stock: 0, min: 10, price: 0 });

  const filtered = meds.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));
  const lowStock = meds.filter((m) => m.stock <= m.min);

  const addMed = () => {
    if (!newMed.name) { toast.error("Nom du médicament requis."); return; }
    setMeds([{ id: String(Date.now()), ...newMed, available: true }, ...meds]);
    setNewMed({ name: "", dosage: "", form: "Comprimé", stock: 0, min: 10, price: 0 });
    setShowAdd(false);
    toast.success("Médicament ajouté !");
  };

  const removeMed = (id: string) => {
    setMeds(meds.filter((m) => m.id !== id));
    toast.success("Médicament supprimé.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Inventaire</h1>
          <p className="text-sm text-muted-foreground">{meds.length} produits · {lowStock.length} en stock faible</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <Plus className="mr-1.5 h-4 w-4" /> Ajouter
        </Button>
      </div>

      {lowStock.length > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-sm font-medium text-red-700">{lowStock.length} produit(s) en dessous du seuil minimum : {lowStock.map((m) => m.name).join(", ")}.</p>
        </div>
      )}

      {showAdd && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Nouveau médicament</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div><Label>Nom</Label><Input value={newMed.name} onChange={(e) => setNewMed({ ...newMed, name: e.target.value })} /></div>
            <div><Label>Dosage</Label><Input value={newMed.dosage} onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })} placeholder="500mg" /></div>
            <div><Label>Forme</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={newMed.form} onChange={(e) => setNewMed({ ...newMed, form: e.target.value })}>
                <option>Comprimé</option><option>Gélule</option><option>Sirop</option><option>Injection</option><option>Inhalateur</option><option>Ampoule</option><option>Pommade</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div><Label>Stock initial</Label><Input type="number" value={newMed.stock} onChange={(e) => setNewMed({ ...newMed, stock: +e.target.value })} /></div>
            <div><Label>Seuil minimum</Label><Input type="number" value={newMed.min} onChange={(e) => setNewMed({ ...newMed, min: +e.target.value })} /></div>
            <div><Label>Prix (DA)</Label><Input type="number" value={newMed.price} onChange={(e) => setNewMed({ ...newMed, price: +e.target.value })} /></div>
          </div>
          <Button onClick={addMed} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">Ajouter</Button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Rechercher un médicament..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Médicament</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Forme</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Stock</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground hidden md:table-cell">Prix</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Statut</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((m) => (
              <tr key={m.id} className="bg-card hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-semibold text-foreground">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.dosage}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{m.form}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-bold ${m.stock <= m.min ? "text-red-600" : "text-foreground"}`}>{m.stock}</span>
                  <span className="text-xs text-muted-foreground"> / {m.min}</span>
                </td>
                <td className="px-4 py-3 text-right font-medium hidden md:table-cell">{m.price} DA</td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${m.stock <= m.min ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {m.stock <= m.min ? "Faible" : "OK"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeMed(m.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
