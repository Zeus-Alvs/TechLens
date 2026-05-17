import { X } from "lucide-react";

export default function AuthModal({ mode, onClose }: { mode: "login" | "register", onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-6">
          {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
        </h2>

        <form className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">E-mail</label>
            <input 
              type="email" 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              placeholder="exemplo@techlens.com"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Senha</label>
            <input 
              type="password" 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button className="w-full bg-cyan-500 text-slate-950 font-bold py-3 rounded-lg mt-4 hover:bg-cyan-400 transition-colors">
            {mode === "login" ? "Entrar no Sistema" : "Finalizar Cadastro"}
          </button>
        </form>
      </div>
    </div>
  );
}