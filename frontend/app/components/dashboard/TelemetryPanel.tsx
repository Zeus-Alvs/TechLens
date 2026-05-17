"use client";
import { Gauge, Thermometer, Database } from "lucide-react";

export default function TelemetryPanel({ device }: { device: any }) {
  if (!device) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
        <Gauge size={64} strokeWidth={1} />
        <p className="text-lg">Selecione um dispositivo na lista ao lado para iniciar o monitoramento</p>
      </div>
    );
  }

  // Define uma imagem padrão de hardware caso a URL venha vazia ou inválida
  const fallbackImage = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=60";
  const deviceImage = device.image && device.image.trim() !== "" ? device.image : fallbackImage;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-6 mb-12 border-b border-slate-800 pb-8">
        
        <img 
          src={deviceImage} 
          alt={device.name} 
          className="w-24 h-24 rounded-2xl object-cover border-2 border-cyan-500/50 shadow-cyan-500/20 shadow-2xl" 
        />
        <div>
          <h2 className="text-3xl font-bold text-white">{device.name}</h2>
          <p className="text-slate-400 font-mono">S/N: {device.serial}</p>
          <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded mt-2 inline-block uppercase tracking-widest">{device.category}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GaugeCard label="Temperatura" value="42" unit="°C" color="text-emerald-400" icon={<Thermometer size={20}/>} />
        <GaugeCard label="Clock" value="3.8" unit="GHz" color="text-cyan-400" icon={<Gauge size={20}/>} />
        <GaugeCard label="Carga" value="85" unit="%" color="text-red-500" icon={<Database size={20}/>} />
      </div>
    </div>
  );
}

function GaugeCard({ label, value, unit, color, icon }: any) {
  return (
    <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
      <div className={`${color} mb-4 flex items-center gap-2 font-bold uppercase text-xs tracking-tighter`}>
        {icon} {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold text-white group-hover:scale-110 transition-transform inline-block">{value}</span>
        <span className="text-slate-500 text-sm">{unit}</span>
      </div>
      {/* Simulação de arco de velocímetro em CSS */}
      <div className={`absolute bottom-0 left-0 h-1 w-full bg-slate-800`}>
        <div className={`h-full bg-current ${color}`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}