"use client";
import { Monitor, Cpu, ChevronRight } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  description: string;
  owner: string;
  status?: string; // online ou offline
  devices?: any[];
}

interface CollectionListProps {
  collections: Collection[];
  onSelect: (collection: Collection) => void;
  activeId?: string;
}

export default function CollectionList({ collections, onSelect, activeId }: CollectionListProps) {
  if (collections.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-500 italic">Nenhum computador cadastrado. Crie um computador acima.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-800">
      {collections.map((col) => {
        const isActive = activeId === col.id;
        const deviceCount = col.devices?.length || 0;
        const isOffline = col.status === "offline";

        return (
          <li
            key={col.id}
            onClick={() => onSelect(col)}
            className={`flex items-center justify-between p-4 cursor-pointer transition-all duration-200 border-r-2 ${
              isActive
                ? "bg-cyan-500/10 border-cyan-500"
                : "hover:bg-slate-800/40 border-transparent"
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              
              {/* Ícone Redondo de PC com indicador Power (Tarefa 2) */}
              <div className="relative flex-shrink-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors border ${
                  isActive 
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" 
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}>
                  <Monitor size={20} />
                </div>
                {/* Indicador de Status LIGADO / DESLIGADO */}
                <span className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 transition-colors ${
                  isOffline ? "bg-rose-500 animate-pulse" : "bg-emerald-500 animate-pulse"
                }`} title={isOffline ? "Sistema Offline" : "Sistema Online"}></span>
              </div>

              <div className="min-w-0">
                <p className="text-white font-bold truncate leading-tight text-sm">
                  {col.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                    <Cpu size={10} />
                    {deviceCount} {deviceCount === 1 ? "peça" : "peças"}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[100px]" title={col.owner}>
                    dono: {col.owner}
                  </span>
                </div>
              </div>
            </div>

            <ChevronRight 
              size={18} 
              className={`transition-transform duration-200 ${isActive ? "text-cyan-400 translate-x-0.5" : "text-slate-600"}`} 
            />
          </li>
        );
      })}
    </ul>
  );
}
