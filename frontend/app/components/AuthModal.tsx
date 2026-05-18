"use client";
import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthModal({ mode, onClose }: { mode: "login" | "register", onClose: () => void }) {
  const [username, setUsername] = useState(""); // Nome de usuário no cadastro
  const [email, setEmail] = useState("");       // E-mail (usado no login e cadastro)
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Validação frontend
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Validação de confirmação de senha no frontend
    if (mode === "register" && password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      
      // Montagem do payload conforme a especificação do backend (Tarefa 1)
      const payload = mode === "login"
        ? { email, password }
        : { username, email, password, role: "user" };

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Ocorreu um erro no processamento.");
      }

      if (mode === "login") {
        // Salva informações da conta no localStorage (Tarefa 1)
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username || "Usuário"); // Nome retornado pelo backend
        localStorage.setItem("role", data.role || "user");
        
        onClose();
        router.push("/home");
      } else {
        setSuccess("Conta criada com sucesso! Faça login para continuar.");
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setError(err.message || "Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-6">
          {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nome de Usuário apenas se for Registro */}
          {mode === "register" && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">Nome de Usuário</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                placeholder="ex: gabriel_tech"
              />
            </div>
          )}

          {/* E-mail (Obrigatório em ambos os fluxos - login e cadastro) */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">E-mail</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              placeholder="exemplo@techlens.com"
            />
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          {/* Confirmar Senha apenas se for Registro */}
          {mode === "register" && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">Confirmar Senha</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 text-slate-950 font-bold py-3 rounded-lg mt-4 hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {mode === "login" ? "Entrar no Sistema" : "Finalizar Cadastro"}
          </button>
        </form>
      </div>
    </div>
  );
}