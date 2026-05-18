"use client";
import { useState, useEffect } from "react";
import { X, Layers, Monitor } from "lucide-react";

interface ModalCollectionProps {
  onClose: () => void;
  onSave: (collection: { name: string; description: string; owner: string }) => void;
}

export default function ModalCollection({ onClose, onSave }: ModalCollectionProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");

  useEffect(() => {
    // Tenta preencher automaticamente o responsável com o usuário logado
    const activeUser = localStorage.getItem("username") || "";
    if (activeUser) {
      setOwner(activeUser);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description, owner });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/70 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Monitor className="text-cyan-500" size={20} />
            Novo Computador / Coleção
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome da Máquina</label>
            <input 
              required
              type="text" 
              placeholder="Ex: PC Gamer Sala de Jogos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição / Uso</label>
            <textarea 
              required
              rows={3}
              placeholder="Ex: Utilizado para processamento gráfico em tempo real e simulações."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none text-xs resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Responsável (Dono)</label>
            <input 
              required
              type="text" 
              placeholder="Ex: gabriel@techlens.com"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none text-xs"
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 transition-colors text-xs font-semibold"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 text-xs"
            >
              <Monitor size={16} />
              Criar Máquina
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
