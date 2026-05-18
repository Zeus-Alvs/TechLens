"use client";
import { Gauge, Thermometer, Database, Cpu } from "lucide-react";
import { useTelemetry } from "../../context/TelemetryContext";

interface TelemetryPanelProps {
  device: any;
}

export default function TelemetryPanel({ device }: TelemetryPanelProps) {
  const { devices, historyCache } = useTelemetry();

  if (!device) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
        <Cpu size={64} strokeWidth={1} className="animate-pulse" />
        <p className="text-lg">Selecione um dispositivo na lista ao lado para iniciar o monitoramento</p>
      </div>
    );
  }

  // Sincroniza em tempo real lendo do array global do Provider
  const liveDevice = devices.find((d) => d.id === device.id) || device;

  // Histórico lido diretamente do Cache Global da Telemetria
  const currentHistory = historyCache[liveDevice.id] || { uso: [], temperatura: [] };
  const usoHistory = currentHistory.uso;
  const tempHistory = currentHistory.temperatura;

  const fallbackImage = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=60";
  const deviceImage = liveDevice.image && liveDevice.image.trim() !== "" ? liveDevice.image : fallbackImage;
  const isOffline = liveDevice.status === "offline";

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col h-full justify-start space-y-8">
      
      {/* Header do Dispositivo */}
      <div className="flex items-center gap-6 border-b border-slate-800 pb-8">
        <img 
          src={deviceImage} 
          alt={liveDevice.name} 
          className={`w-24 h-24 rounded-2xl object-cover border border-cyan-500/30 shadow-cyan-500/10 shadow-2xl transition-all ${
            isOffline ? "grayscale opacity-30 border-slate-800" : ""
          }`} 
        />
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold text-white leading-tight">{liveDevice.name}</h2>
            <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded uppercase tracking-widest font-mono">
              {liveDevice.category}
            </span>
          </div>
          <p className="text-slate-500 font-mono text-sm mt-1">Nº DE SÉRIE: {liveDevice.serial}</p>
          <div className="flex items-center gap-3 text-xs font-mono mt-1">
            <span className="text-slate-500">ID: {liveDevice.id}</span>
            <span className="text-slate-500">|</span>
            <span className={`font-bold ${isOffline ? "text-rose-400" : "text-emerald-400"}`}>
              {isOffline ? "STATUS: OFFLINE" : "STATUS: ONLINE"}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Telemetria Dinâmica mapeando dados_tempo_real (Tarefa 2) */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Métricas de Telemetria Ativa (Real-Time Polling)
        </h3>

        {!liveDevice.dados_tempo_real || Object.keys(liveDevice.dados_tempo_real).length === 0 ? (
          <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center">
            <p className="text-slate-500 text-sm italic">Nenhuma métrica dinâmica ativa no momento.</p>
          </div>
        ) : (
          <div>
            {(() => {
              // 1. Obtém as telemetrias reais do nó dados_tempo_real
              const filtered = Object.entries(liveDevice.dados_tempo_real);

              // 2. Separa atributos fixos (com Sparklines) e adicionais (com Speedometers)
              const sparklineAttrs = filtered.filter(
                ([key]) => key.toLowerCase() === "uso" || key.toLowerCase() === "temperatura"
              );

              const speedoAttrs = filtered.filter(
                ([key]) => key.toLowerCase() !== "uso" && key.toLowerCase() !== "temperatura"
              );

              // 3. Garante que nos sparklines "Uso" fique em primeiro e "Temperatura" em segundo
              sparklineAttrs.sort(([keyA]) => {
                return keyA.toLowerCase() === "uso" ? -1 : 1;
              });

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Cartões Sparklines (Uso e Temperatura - Tarefa 2) */}
                  {sparklineAttrs.map(([key, value]: any) => {
                    const keyLower = key.toLowerCase();
                    const valStr = String(value);
                    const isUso = keyLower === "uso";

                    const sparkColor = isUso ? "#f43f5e" : "#10b981"; // Rosa vs Verde
                    const sparkHistory = isUso ? usoHistory : tempHistory;
                    const icon = isUso ? <Database size={20} /> : <Thermometer size={20} />;
                    const textColorClass = isUso ? "text-rose-500" : "text-emerald-400";

                    const matchNum = valStr.match(/[\d.]+/);
                    const matchUnit = valStr.replace(/[\d.]+/g, "").trim();
                    const cleanVal = isOffline ? "0" : (matchNum ? matchNum[0] : valStr);

                    return (
                      <div 
                        key={key} 
                        className={`bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between min-h-[200px] relative overflow-hidden group hover:border-slate-700 transition-all ${
                          isOffline ? "opacity-30 border-slate-900 bg-slate-950/20" : ""
                        }`}
                      >
                        <div>
                          <div className={`font-bold uppercase text-xs tracking-tighter flex items-center gap-2 ${textColorClass}`}>
                            {icon} {key}
                          </div>
                          <div className="flex items-baseline gap-1 mt-4">
                            <span className="text-4xl font-black text-white group-hover:scale-105 transition-transform inline-block">
                              {cleanVal}
                            </span>
                            <span className="text-slate-500 text-sm font-semibold">{matchUnit}</span>
                          </div>
                        </div>
                        
                        {/* Sparkline Micro-Gráfico */}
                        <Sparkline data={isOffline ? [0] : sparkHistory} color={sparkColor} />
                      </div>
                    );
                  })}

                  {/* Cartões Speedometers (Clock e outros - Tarefa 2) */}
                  {speedoAttrs.map(([key, value]: any) => {
                    // Extrai o limite de fábrica do nó dados_maximos (Tarefa 2)
                    const limitStr = liveDevice.dados_maximos?.[key] || "";
                    const matchMax = limitStr.match(/[\d.]+/);
                    const limitVal = matchMax ? parseFloat(matchMax[0]) : 5000;

                    const valStr = String(value);
                    const matchNum = valStr.match(/[\d.]+/);
                    const matchUnit = valStr.replace(/[\d.]+/g, "").trim();
                    const cleanVal = isOffline ? "0" : (matchNum ? matchNum[0] : valStr);

                    return (
                      <Speedometer 
                        key={key}
                        label={key}
                        value={cleanVal}
                        unit={matchUnit}
                        maxLimit={limitVal}
                        isOffline={isOffline}
                      />
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </div>

    </div>
  );
}

// 📈 Componente de Micro-Gráfico Sparkline em SVG Puro
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length === 0) return null;

  const points = data.length === 1 ? [data[0], data[0]] : data;
  const width = 100;
  const height = 45;

  const minVal = 0;
  const maxVal = 100;

  const coords = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((val - minVal) / (maxVal - minVal)) * height;
    return { x, y };
  });

  const pathD = coords.map((c, idx) => `${idx === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const fillD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
  const gradId = `sparkline-grad-${color.replace("#", "")}`;

  return (
    <div className="w-full h-[55px] mt-4 relative overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        
        {/* Preenchimento degradê sutil */}
        <path d={fillD} fill={`url(#${gradId})`} />
        
        {/* Linha principal com brilho */}
        <path 
          d={pathD} 
          fill="none" 
          stroke={color} 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Ponto indicador de leitura ativa */}
        {coords.length > 0 && (
          <circle 
            cx={coords[coords.length - 1].x} 
            cy={coords[coords.length - 1].y} 
            r="1.8" 
            fill={color} 
            className="animate-ping"
          />
        )}
      </svg>
    </div>
  );
}

// 🧭 Componente de Velocímetro Radial Semicircular em SVG Puro
function Speedometer({ value, unit, label, maxLimit, isOffline }: { value: string; unit: string; label: string; maxLimit: number; isOffline: boolean }) {
  const numericVal = parseFloat(value) || 0;
  const max = maxLimit || 5000;
  
  // Agulha: 180° (esquerda) para 0 (offline) e 0° (direita) para 100%
  const pct = isOffline ? 0 : Math.min(1, numericVal / max);
  const angle = 180 - pct * 180;
  const rad = (angle * Math.PI) / 180;

  const needleLength = 34;
  const cx = 60;
  const cy = 60;

  const tipX = cx + needleLength * Math.cos(rad);
  const tipY = cy - needleLength * Math.sin(rad);

  // Comprimento do arco (raio 45) L = PI * R = 141.37
  const arcLength = 141.37;
  const dashOffset = arcLength - pct * arcLength;

  const color = isOffline ? "#475569" : "#22d3ee";
  const speedoId = `speedo-grad-${label.replace(/\s+/g, "")}`;

  return (
    <div className={`bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-between min-h-[200px] relative overflow-hidden group hover:border-slate-700 transition-all ${
      isOffline ? "opacity-30 border-slate-900 bg-slate-950/20" : ""
    }`}>
      {/* Título */}
      <div className={`w-full text-left font-bold uppercase text-xs tracking-tighter flex items-center gap-2 ${
        isOffline ? "text-slate-600" : "text-cyan-400"
      }`}>
        <Gauge size={20} />
        {label}
      </div>

      {/* Velocímetro SVG */}
      <div className="w-[140px] h-[90px] mt-2 relative">
        <svg viewBox="0 0 120 75" className="w-full h-full">
          <defs>
            <linearGradient id={speedoId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>

          {/* Arco de Trilho de Fundo */}
          <path 
            d="M 15 60 A 45 45 0 0 1 105 60" 
            fill="none" 
            stroke="#1e293b" 
            strokeWidth="6" 
            strokeLinecap="round" 
          />

          {/* Arco Ativo de Preenchimento */}
          <path 
            d="M 15 60 A 45 45 0 0 1 105 60" 
            fill="none" 
            stroke={isOffline ? "#334155" : `url(#${speedoId})`} 
            strokeWidth="6" 
            strokeLinecap="round" 
            strokeDasharray={arcLength}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700 ease-out"
          />

          {/* Agulha */}
          <line 
            x1={cx} 
            y1={cy} 
            x2={tipX} 
            y2={tipY} 
            stroke={color} 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            className="transition-all duration-700 ease-out"
          />

          {/* Centro da Agulha */}
          <circle cx={cx} cy={cy} r="4" fill={color} />
          <circle cx={cx} cy={cy} r="1.5" fill="#0f172a" />

          {/* Escala */}
          <text x="15" y="71" textAnchor="middle" fill="#ffffff" stroke="#000000" strokeWidth="0.5px" paintOrder="stroke fill" className="text-[7px] font-mono font-bold">0</text>
          <text x="105" y="71" textAnchor="middle" fill="#ffffff" stroke="#000000" strokeWidth="0.5px" paintOrder="stroke fill" className="text-[7px] font-mono font-bold">{max}</text>
        </svg>

        {/* Display Digital */}
        <div className="absolute bottom-0 left-0 right-0 text-center flex flex-col justify-end items-center">
          <span 
            className="text-xl font-black text-white leading-none font-mono tracking-tighter"
            style={{ textShadow: "1.5px 1.5px 0 #000, -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 0 1.5px 0 #000, 1.5px 0 0 #000, 0 -1.5px 0 #000, -1.5px 0 0 #000" }}
          >
            {isOffline ? "0" : value}
          </span>
          <span 
            className="text-[9px] text-white/95 font-mono font-bold uppercase tracking-widest leading-none mt-1"
            style={{ textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 1px 0 #000, 1px 0 0 #000, 0 -1px 0 #000, -1px 0 0 #000" }}
          >
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}