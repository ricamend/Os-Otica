import React, { useState } from "react";
import { UserRole } from "../types";
import { Glasses, Shield, User, Lock, Mail, AlertCircle, ArrowRight, UserCheck } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (data: { name: string; email: string; password: string; role: UserRole }) => Promise<void>;
  onClose?: () => void;
  canDismiss?: boolean;
}

export function LoginModal({
  isOpen,
  onLogin,
  onRegister,
  onClose,
  canDismiss = false,
}: LoginModalProps) {
  if (!isOpen) return null;

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("ATENDENTE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await onLogin(email, password);
      } else {
        await onRegister({ name, email, password, role });
      }
    } catch (err: any) {
      setError(err.message || "Falha na autenticação. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
    setLoading(true);
    try {
      await onLogin(demoEmail, demoPass);
    } catch (err: any) {
      setError(err.message || "Erro no login rápido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-800 relative">
        {canDismiss && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
          >
            ✕
          </button>
        )}

        {/* Brand */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
            <Glasses className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Ótica Gestão
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sistema de Orçamentos e Ordens de Serviço
          </p>
        </div>

        {/* Quick Demo Logins Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 mb-5 space-y-2">
          <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Acesso Rápido para Teste:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@otica.com", "admin")}
              className="px-2.5 py-2 bg-white hover:bg-blue-100/60 border border-blue-200 text-blue-900 font-semibold text-xs rounded-xl shadow-2xs flex flex-col items-start transition-all active:scale-95 text-left"
            >
              <span className="flex items-center gap-1 font-bold text-[11px] text-blue-700">
                <Shield className="w-3 h-3 text-blue-600" /> Administrador
              </span>
              <span className="text-[10px] text-slate-500 truncate w-full">Dra. Helena Martins</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("atendente@otica.com", "123")}
              className="px-2.5 py-2 bg-white hover:bg-blue-100/60 border border-blue-200 text-blue-900 font-semibold text-xs rounded-xl shadow-2xs flex flex-col items-start transition-all active:scale-95 text-left"
            >
              <span className="flex items-center gap-1 font-bold text-[11px] text-slate-700">
                <User className="w-3 h-3 text-slate-500" /> Atendente
              </span>
              <span className="text-[10px] text-slate-500 truncate w-full">Lucas Andrade</span>
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === "login" ? "bg-white text-blue-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === "register" ? "bg-white text-blue-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Cadastrar Novo Usuário
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Beatriz Albuquerque"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              E-mail Profissional
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@otica.com"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                id="login-email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                id="login-password"
              />
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Perfil de Acesso
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("ATENDENTE")}
                  className={`p-2.5 text-xs rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    role === "ATENDENTE"
                      ? "bg-blue-50 text-blue-700 border-blue-500"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Atendente</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("ADMIN")}
                  className={`p-2.5 text-xs rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    role === "ADMIN"
                      ? "bg-indigo-50 text-indigo-700 border-indigo-500"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Administrador</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {role === "ADMIN"
                  ? "Acesso total a relatórios, faturamento e exclusão de registros."
                  : "Cria orçamentos, emite OS e cadastra clientes."}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-98"
            id="btn-submit-auth"
          >
            <span>{loading ? "Processando..." : mode === "login" ? "Entrar no Sistema" : "Cadastrar Usuário"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
