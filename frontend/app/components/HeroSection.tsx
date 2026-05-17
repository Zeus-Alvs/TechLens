import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
          Domine o seu <span className="text-cyan-500">Hardware</span> com precisão.
        </h1>
        <p className="text-slate-300 text-lg mb-8 max-w-md">
          Monitoramento em tempo real de temperatura, velocidade e capacidade. 
        </p>
       
      </div>

      <div className="relative flex justify-center items-center">
        {/* Mockup do Gauge via CSS */}
        <div className="relative w-72 h-72 rounded-full border-[12px] border-slate-800 border-t-cyan-500 animate-[spin_3s_linear_infinite] shadow-[0_0_50px_rgba(6,182,212,0.2)]"></div>
        <div className="absolute flex flex-col items-center">
          <span className="text-5xl font-mono font-bold text-white italic">78%</span>
          <span className="text-emerald-400 text-sm font-bold tracking-widest uppercase">Stable</span>
        </div>
        {/* Decorative Glow */}
        <div className="absolute -z-10 w-64 h-64 bg-cyan-500/20 blur-[100px]"></div>
      </div>
    </section>
  );
}