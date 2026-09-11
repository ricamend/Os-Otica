import { LayoutDashboard, FileText, Wrench, Users, PlusCircle } from "lucide-react";

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  pendingQuotesCount: number;
  readyOSCount: number;
  onOpenQuickAction: () => void;
}

export function BottomNav({
  currentTab,
  onTabChange,
  pendingQuotesCount,
  readyOSCount,
  onOpenQuickAction,
}: BottomNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-1 safe-area-pb" id="mobile-bottom-nav">
      <div className="flex items-center justify-around">
        {/* Dashboard */}
        <button
          onClick={() => onTabChange("dashboard")}
          className={`flex flex-col items-center justify-center w-14 py-1 text-[11px] font-medium transition-colors ${
            currentTab === "dashboard" ? "text-blue-600 font-semibold" : "text-slate-500 hover:text-slate-900"
          }`}
          id="mobile-nav-dashboard"
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Início</span>
        </button>

        {/* Quotes */}
        <button
          onClick={() => onTabChange("quotes")}
          className={`flex flex-col items-center justify-center w-16 py-1 text-[11px] font-medium relative transition-colors ${
            currentTab === "quotes" ? "text-blue-600 font-semibold" : "text-slate-500 hover:text-slate-900"
          }`}
          id="mobile-nav-quotes"
        >
          <div className="relative">
            <FileText className="w-5 h-5 mb-0.5" />
            {pendingQuotesCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold bg-amber-500 text-white rounded-full">
                {pendingQuotesCount}
              </span>
            )}
          </div>
          <span>Orçamentos</span>
        </button>

        {/* Center Quick Action (+) Button */}
        <button
          onClick={onOpenQuickAction}
          className="flex flex-col items-center justify-center -mt-4 bg-gradient-to-tr from-blue-600 to-sky-500 text-white p-3 rounded-full shadow-lg shadow-blue-500/30 active:scale-95 transition-transform"
          id="mobile-nav-quick-add"
          aria-label="Adicionar novo registro"
        >
          <PlusCircle className="w-6 h-6 stroke-[2.2]" />
        </button>

        {/* OS */}
        <button
          onClick={() => onTabChange("orders")}
          className={`flex flex-col items-center justify-center w-14 py-1 text-[11px] font-medium relative transition-colors ${
            currentTab === "orders" ? "text-blue-600 font-semibold" : "text-slate-500 hover:text-slate-900"
          }`}
          id="mobile-nav-orders"
        >
          <div className="relative">
            <Wrench className="w-5 h-5 mb-0.5" />
            {readyOSCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold bg-emerald-600 text-white rounded-full animate-bounce">
                {readyOSCount}
              </span>
            )}
          </div>
          <span>OS</span>
        </button>

        {/* Clients */}
        <button
          onClick={() => onTabChange("clients")}
          className={`flex flex-col items-center justify-center w-14 py-1 text-[11px] font-medium transition-colors ${
            currentTab === "clients" ? "text-blue-600 font-semibold" : "text-slate-500 hover:text-slate-900"
          }`}
          id="mobile-nav-clients"
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Clientes</span>
        </button>
      </div>
    </div>
  );
}
