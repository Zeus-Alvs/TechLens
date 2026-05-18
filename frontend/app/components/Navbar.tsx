"use client";
import { useState } from "react";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const openModal = (mode: "login" | "register") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
            TechLens
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => openModal("login")}
              className="px-5 py-2 rounded-lg border border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => openModal("register")}
              className="px-5 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all"
            >
              Criar Conta
            </button>
          </div>
        </div>
      </nav>

      {isAuthOpen && (
        <AuthModal mode={authMode} onClose={() => setIsAuthOpen(false)} />
      )}
    </>
  );
}