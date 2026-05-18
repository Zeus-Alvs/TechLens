"use client";
import { useState, useEffect } from "react";
import { LogOut, User, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NavbarDashboard() {
  const [username, setUsername] = useState("Administrador");
  const router = useRouter();

  useEffect(() => {
    // Carrega o username salvo no localStorage no login
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // Dispara o logout no backend
        await fetch("http://localhost:8000/auth/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error("Erro ao realizar logout no servidor:", err);
    } finally {
      // Limpa a sessão local e redireciona
      localStorage.clear();
      router.push("/");
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800/60">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Lado Esquerdo: Brand */}
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent tracking-tight">
            TechLens <span className="text-xs font-mono text-cyan-500/50 ml-1">v1.0</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-800 mx-2 hidden md:block"></div>
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            SISTEMA ONLINE
          </div>
        </div>

        {/* Lado Direito: Usuário e Ações */}
        <div className="flex items-center gap-6">
          {/* Ícone de Notificações - Ocultado para MVP (Task 2) */}
          <button className="text-slate-400 hover:text-white transition-colors relative hidden">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
          </button>

          <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white leading-none">Olá, {username}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 text-right">Administrador</p>
            </div>
            
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 overflow-hidden shadow-inner">
              <User size={20} />
            </div>

            {/* Botão Sair */}
            <button 
              onClick={handleLogout}
              className="ml-2 p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              title="Sair do Sistema"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

      </div>
    </nav>
  );
}