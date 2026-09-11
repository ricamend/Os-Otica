import { Glasses, LayoutDashboard, FileText, Wrench, Users, Plus, LogOut, Shield, User as UserIcon } from "lucide-react";
import { User } from "../types";

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  pendingQuotesCount: number;
  readyOSCount: number;
  onOpenNewQuote: () => void;
  onOpenNewOrder: () => void;
  onSwitchUserPrompt: () => void;
}

export function Navbar({
  currentTab,
  onTabChange,
  currentUser,
  onLogout,
  pendingQuotesCount,
  readyOSCount,
  onOpenNewQuote,
  onOpenNewOrder,
  onSwitchUserPrompt,
}: NavbarProps) {
  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs" id="app-header">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center gap-2.5 cursor-pointer shrink-0 py-1"
            onClick={() => onTabChange("dashboard")}
            id="brand-logo"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 shrink-0">
              <Glasses className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight whitespace-nowrap">
                Ótica Gestão
              </span>
              <span className="hidden xl:inline-flex items-center text-[10px] uppercase font-bold tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 whitespace-nowrap">
                OS & Orçamentos
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links (with guaranteed whitespace-nowrap and clean spacing) */}
          <nav className="hidden md:flex items-center gap-1 shrink-0">
            <button
              onClick={() => onTabChange("dashboard")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                currentTab === "dashboard"
                  ? "bg-blue-50 text-blue-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
              id="nav-tab-dashboard"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onTabChange("quotes")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all relative ${
                currentTab === "quotes"
                  ? "bg-blue-50 text-blue-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
              id="nav-tab-quotes"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Orçamentos</span>
              {pendingQuotesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full leading-none shrink-0 animate-pulse">
                  {pendingQuotesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange("orders")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all relative ${
                currentTab === "orders"
                  ? "bg-blue-50 text-blue-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
              id="nav-tab-orders"
            >
              <Wrench className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">Ordens de Serviço</span>
              <span className="inline lg:hidden">Ordens (OS)</span>
              {readyOSCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded-full leading-none shrink-0 shadow-xs shadow-emerald-500/40 animate-pulse">
                  {readyOSCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange("clients")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                currentTab === "clients"
                  ? "bg-blue-50 text-blue-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
              id="nav-tab-clients"
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Clientes</span>
            </button>
          </nav>

          {/* Quick Actions & User Area */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Action buttons (desktop & tablet) */}
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              <button
                onClick={onOpenNewQuote}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors whitespace-nowrap shrink-0"
                id="header-btn-new-quote"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Orçamento</span>
              </button>

              <button
                onClick={onOpenNewOrder}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs rounded-xl transition-colors whitespace-nowrap shrink-0"
                id="header-btn-new-os"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Nova OS</span>
              </button>
            </div>

            {/* User Profile Pill */}
            {currentUser && (
              <div className="flex items-center gap-1.5 pl-1.5 sm:pl-2 border-l border-slate-200 shrink-0">
                <button
                  onClick={onSwitchUserPrompt}
                  title="Clique para alternar perfil (Admin / Atendente)"
                  className="flex items-center gap-2 text-left hover:bg-slate-100/70 px-2 py-1.5 rounded-xl transition-colors shrink-0"
                  id="user-profile-button"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs border border-blue-200 overflow-hidden shrink-0">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap leading-tight">
                      {currentUser.name.split(" ")[0]} {currentUser.name.split(" ")[1] || ""}
                    </span>
                    <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-0.5 leading-tight">
                      {isAdmin ? (
                        <>
                          <Shield className="w-2.5 h-2.5 text-indigo-600" /> Administrador
                        </>
                      ) : (
                        "Atendente"
                      )}
                    </span>
                  </div>
                </button>

                <button
                  onClick={onLogout}
                  title="Sair do sistema"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                  id="btn-logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
