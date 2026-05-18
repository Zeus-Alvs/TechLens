import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import { Cpu, Gauge, Layers } from "lucide-react";

const features = [
  {
    title: "Controle",
    desc: "Gerencie, edite e exclua seus eletrônicos em uma tabela intuitiva.",
    icon: <Layers className="text-cyan-500" size={32} />
  },
  {
    title: "Métricas Estilo Acelerador",
    desc: "Visualize temperatura e velocidade com gráficos inspirados em painéis automotivos.",
    icon: <Gauge className="text-emerald-400" size={32} />
  },
  {
    title: "Tempo Real",
    desc: "Dados simulados ou conectados que atualizam instantaneamente via WebSocket.",
    icon: <Cpu className="text-red-500" size={32} />
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-300 selection:bg-cyan-500/30">
      <Navbar />
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors group">
              <div className="mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
              <p className="text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer*/}
      <footer className="py-10 text-center border-t border-slate-900 text-slate-600 text-sm">
        © 2026 TechLens Monitoring System • Engineered by Eduarda Belles & Zeus Machado.
      </footer>
    </main>
  );
}