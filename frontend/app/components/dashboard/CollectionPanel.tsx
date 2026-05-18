"use client";
import { Monitor, Trash2, Unlink, Gauge, Plus, Power, Cpu } from "lucide-react";

interface CollectionPanelProps {
  collection: any;
  allDevices: any[];
  onLink: (deviceId: string) => void;
  onUnlink: (deviceId: string) => void;
  onDeleteCollection: () => void;
  onTogglePower: () => void;
  onAddNewDeviceClick: () => void;
}

export default function CollectionPanel({
  collection,
  onUnlink,
  onDeleteCollection,
  onTogglePower,
  onAddNewDeviceClick
}: CollectionPanelProps) {
  if (!collection) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
        <Monitor size={64} strokeWidth={1} />
        <p className="text-lg">Selecione um Computador na lista para gerenciar seus vínculos e telemetria</p>
      </div>
    );
  }

  const isOffline = collection.status === "offline";

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col h-full space-y-6">
      
      {/* Header da Coleção */}
      <div className="flex justify-between items-start border-b border-slate-800 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Monitor className="text-cyan-500 animate-pulse" size={28} />
            <h2 className="text-3xl font-bold text-white leading-tight">{collection.name}</h2>
          </div>
          <p className="text-slate-400 text-sm max-w-xl">{collection.description}</p>
          <div className="flex items-center gap-4 text-xs font-mono mt-2">
            <span className="text-slate-500">RESPONSÁVEL:</span>
            <span className="text-cyan-400 uppercase bg-cyan-500/10 px-2 py-0.5 rounded">{collection.owner}</span>
            <span className="text-slate-500">ID:</span>
            <span className="text-slate-400">{collection.id}</span>
          </div>
        </div>
        
        {/* Controles de Energia e Exclusão */}
        <div className="flex items-center gap-3">
          {/* Botão Power Ligar/Desligar */}
          <button
            onClick={onTogglePower}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-lg ${
              !isOffline
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 shadow-emerald-500/5"
                : "bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25 shadow-rose-500/5"
            }`}
            title={isOffline ? "Ligar Computador" : "Desligar Computador"}
          >
            <Power size={14} className={!isOffline ? "animate-pulse" : ""} />
            {!isOffline ? "ONLINE" : "OFFLINE"}
          </button>

          {/* Botão de Excluir Computador */}
          <button
            onClick={() => {
              if (confirm(`Deseja realmente remover o computador "${collection.name}"? As peças vinculadas ficarão soltas.`)) {
                onDeleteCollection();
              }
            }}
            className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-slate-800 hover:border-slate-700"
            title="Remover Computador"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Caixa de Criação Contextual (1:N estrito) */}
      <div className="bg-slate-950/60 p-5 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Cpu size={16} className="text-cyan-400 animate-pulse" />
            Componentes e Hardware Acoplado
          </h3>
          <p className="text-slate-500 text-xs">Crie novas peças que nascerão diretamente vinculadas a esta máquina.</p>
        </div>
        
        {/* Botão Único: Criar e Adicionar Nova Peça */}
        <button
          onClick={onAddNewDeviceClick}
          className="w-full sm:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10"
        >
          <Plus size={16} />
          Criar e Adicionar Nova Peça
        </button>
      </div>

      {/* Listagem de Peças Vinculadas */}
      <div className="flex-1 space-y-4 overflow-y-auto max-h-[380px] pr-2 custom-scrollbar">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Peças Vinculadas ({collection.devices?.length || 0})
        </h3>

        {(!collection.devices || collection.devices.length === 0) ? (
          <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center">
            <p className="text-slate-500 text-sm italic">Nenhum hardware acoplado a esta máquina. Crie uma peça acima para iniciar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {collection.devices.map((device: any) => (
              <div 
                key={device.id} 
                className={`bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/60 transition-all flex flex-col space-y-4 ${
                  isOffline ? "border-slate-900/50 bg-slate-950/10" : ""
                }`}
              >
                {/* Header do Dispositivo */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-950 overflow-hidden flex-shrink-0 border border-slate-800">
                      <img 
                        src={device.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100"} 
                        alt={device.name} 
                        className={`w-full h-full object-cover transition-all ${isOffline ? "grayscale opacity-30" : ""}`}
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {device.name}
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono uppercase">
                          {device.category}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">S/N: {device.serial}</p>
                    </div>
                  </div>
                  
                  {/* Desvincular */}
                  <button
                    onClick={() => {
                      if (confirm(`Deseja desvincular "${device.name}" deste computador?`)) {
                        onUnlink(device.id);
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 hover:bg-red-400/10 px-2.5 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                    title="Desvincular do Computador"
                  >
                    <Unlink size={14} />
                    Desvincular
                  </button>
                </div>

                {/* Grid de Capacidades Estáticas no Computador - Ignora flutuação do Polling (Tarefa 2) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(() => {
                    // Filtra chaves de telemetria dinâmica e controle no detalhe do computador (Uso, Temperatura)
                    const staticAttrs = Object.entries(device.dados_maximos || {}).filter(([key]) => {
                      const k = key.toLowerCase();
                      return k !== "uso" && k !== "temperatura";
                    });

                    return staticAttrs.map(([key, value]: any) => {
                      let color = "text-cyan-400";
                      let icon = <Gauge size={16} />;
                      const keyLower = key.toLowerCase();

                      if (keyLower.includes("clock") || keyLower.includes("frequ")) {
                        color = "text-cyan-400";
                      }

                      const originalValue = String(value);
                      const matchNum = originalValue.match(/[\d.]+/);
                      const matchUnit = originalValue.replace(/[\d.]+/g, "").trim();
                      
                      // Força a exibição para 0 se o computador estiver offline
                      const cleanVal = isOffline ? "0" : (matchNum ? matchNum[0] : originalValue);
                      const displayUnit = isOffline ? matchUnit : matchUnit;

                      return (
                        <div 
                          key={key} 
                          className={`bg-slate-950 border border-slate-800/80 px-4 py-3 rounded-xl relative overflow-hidden group transition-all duration-300 ${
                            isOffline ? "opacity-30 border-slate-900" : ""
                          }`}
                        >
                          <div className={`${isOffline ? "text-slate-600" : color} mb-1.5 flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-wider`}>
                            {icon} {key}
                          </div>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-xl font-bold text-white group-hover:scale-105 transition-transform inline-block">
                              {cleanVal}
                            </span>
                            <span className="text-slate-500 text-[10px]">{displayUnit}</span>
                          </div>
                          
                          {/* Progress Bar do Gauge - 100% se online, 0% se desligado */}
                          <div className="absolute bottom-0 left-0 h-[2px] w-full bg-slate-850">
                            <div 
                              className={`h-full bg-current transition-all duration-500 ${isOffline ? "text-slate-850" : color}`} 
                              style={{ width: `${isOffline ? 0 : 100}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
