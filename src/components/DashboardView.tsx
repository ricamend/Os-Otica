import { DashboardMetrics, Quote, ServiceOrder, User } from "../types";
import { formatCurrency, formatDate, getQuoteStatusBadge, getOSStatusBadge } from "../lib/formatters";
import {
  Clock,
  PackageCheck,
  Flame,
  FileCheck2,
  DollarSign,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  UserPlus,
  Eye,
  CheckCircle2,
  Sparkles,
  Users,
  FileText,
} from "lucide-react";

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  recentQuotes: Quote[];
  recentOrders: ServiceOrder[];
  currentUser: User | null;
  onNavigateTab: (tab: string, statusFilter?: string) => void;
  onSelectQuote: (quote: Quote) => void;
  onSelectOrder: (order: ServiceOrder) => void;
  onNewQuote: () => void;
  onNewOrder: () => void;
  onNewClient: () => void;
}

export function DashboardView({
  metrics,
  recentQuotes,
  recentOrders,
  currentUser,
  onNavigateTab,
  onSelectQuote,
  onSelectOrder,
  onNewQuote,
  onNewOrder,
  onNewClient,
}: DashboardViewProps) {
  const isAdmin = currentUser?.role === "ADMIN";
  const pendingQuotes = metrics?.pendingQuotesCount || 0;
  const readyOS = metrics?.readyForPickupOSCount || 0;
  const inProductionOS = metrics?.inProductionOSCount || 0;
  const openOS = metrics?.openOSCount || 0;
  const dailyRevenue = metrics?.dailyRevenue || 0;
  const monthlyRevenue = metrics?.monthlyRevenue || 0;
  const totalClients = metrics?.totalClientsCount || 0;

  return (
    <div className="space-y-6 pb-20 md:pb-8" id="dashboard-view">
      {/* Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-indigo-800 rounded-2xl p-6 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-sky-300" />
            <span className="text-xs font-semibold text-sky-200 uppercase tracking-wider">
              Painel Operacional
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Visão Geral da Ótica</h1>
          <p className="text-sm text-blue-100 mt-1 max-w-xl">
            Acompanhe o fluxo de aprovação de orçamentos, o status de montagem no laboratório e as entregas de hoje.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onNewQuote}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-900 font-bold text-xs rounded-xl shadow hover:bg-blue-50 transition-all active:scale-95"
            id="dash-btn-new-quote"
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            <span>Novo Orçamento</span>
          </button>
          <button
            onClick={onNewOrder}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95"
            id="dash-btn-new-os"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova OS</span>
          </button>
          <button
            onClick={onNewClient}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-blue-800/80 hover:bg-blue-800 text-white font-medium text-xs rounded-xl border border-blue-700 transition-all"
            id="dash-btn-new-client"
          >
            <UserPlus className="w-4 h-4 text-blue-300" />
            <span>Cadastrar Cliente</span>
          </button>
        </div>
      </div>

      {/* HIGHLIGHTED ALERTS ROW: Pending Quotes & Ready for Pickup OS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Orçamentos Aguardando Aprovação (ALERTA) */}
        <div
          onClick={() => onNavigateTab("quotes", "Aguardando aprovação")}
          className="relative overflow-hidden cursor-pointer bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border-2 border-amber-400/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
          id="card-alert-pending-quotes"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Requer Atenção Comercial
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Orçamentos Aguardando Aprovação
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Clientes que ainda não confirmaram a proposta. Envie um lembrete ou feche a venda!
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-amber-500/30">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-amber-200/60">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-950 font-mono">
                {pendingQuotes}
              </span>
              <span className="text-xs font-medium text-amber-800">
                {pendingQuotes === 1 ? "orçamento pendente" : "orçamentos pendentes"}
              </span>
            </div>
            <span className="text-xs font-semibold text-amber-800 group-hover:text-amber-950 flex items-center gap-1">
              Ver lista <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>

        {/* Card 2: OS Prontas para Retirada (DESTAQUE MÁXIMO) */}
        <div
          onClick={() => onNavigateTab("orders", "Pronta para retirada")}
          className="relative overflow-hidden cursor-pointer bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-white border-2 border-emerald-500 rounded-2xl p-5 shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all group ring-2 ring-emerald-500/20"
          id="card-alert-ready-orders"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                </span>
                <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                  Pronto no Laboratório!
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Óculos Prontos para Retirada
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Montagem concluída. Pronto para entrega e assinatura do cliente.
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-emerald-600/30 animate-pulse">
              <PackageCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-emerald-200">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-950 font-mono">
                {readyOS}
              </span>
              <span className="text-xs font-semibold text-emerald-800">
                {readyOS === 1 ? "ordem pronta para entrega" : "ordens prontas para entrega"}
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-800 group-hover:text-emerald-950 flex items-center gap-1 bg-emerald-100 px-2 py-1 rounded-md">
              Entregar com Assinatura <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* OS Abertas */}
        <div
          onClick={() => onNavigateTab("orders", "Aberta")}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-indigo-300 cursor-pointer transition-colors"
          id="metric-open-os"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">OS Abertas</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 font-mono">{openOS}</span>
            <span className="text-xs text-slate-400">em fila</span>
          </div>
        </div>

        {/* OS Em Produção */}
        <div
          onClick={() => onNavigateTab("orders", "Em produção")}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-sky-300 cursor-pointer transition-colors"
          id="metric-production-os"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">No Laboratório</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-700">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 font-mono">{inProductionOS}</span>
            <span className="text-xs text-slate-400">em montagem</span>
          </div>
        </div>

        {/* Financial metrics for Admin OR Operational metrics for Atendente */}
        {isAdmin ? (
          <>
            {/* Faturamento do Dia */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm" id="metric-daily-rev">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Faturamento Hoje</span>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold text-slate-900 font-mono">
                  {formatCurrency(dailyRevenue)}
                </span>
              </div>
            </div>

            {/* Faturamento do Mês */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm" id="metric-monthly-rev">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Faturamento no Mês</span>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold text-blue-900 font-mono">
                  {formatCurrency(monthlyRevenue)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Clientes na Base (Atendente) */}
            <div
              onClick={() => onNavigateTab("clients")}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-blue-300 cursor-pointer transition-colors"
              id="metric-clients-count"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Clientes Cadastrados</span>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900 font-mono">{totalClients}</span>
                <span className="text-xs text-slate-400">na base</span>
              </div>
            </div>

            {/* Orçamentos Pendentes (Atendente) */}
            <div
              onClick={() => onNavigateTab("quotes", "Aguardando aprovação")}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-amber-300 cursor-pointer transition-colors"
              id="metric-pending-quotes-count"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Orçamentos Abertos</span>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900 font-mono">{pendingQuotes}</span>
                <span className="text-xs text-slate-400">aguardando</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* TWO COLUMN RECENT ITEMS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orçamentos Recentes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5" id="recent-quotes-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Orçamentos Recentes</h3>
            </div>
            <button
              onClick={() => onNavigateTab("quotes")}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              Ver todos ({recentQuotes.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentQuotes.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">Nenhum orçamento cadastrado.</p>
            ) : (
              recentQuotes.map((q) => {
                const badge = getQuoteStatusBadge(q.status);
                return (
                  <div
                    key={q.id}
                    onClick={() => onSelectQuote(q)}
                    className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50/80 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700">{q.id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="font-semibold text-xs text-slate-900 mt-1 truncate">
                        {q.clientName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {q.serviceType} • {q.frame.brand || "Armação"} • {formatDate(q.createdAt)}
                      </p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="font-bold text-sm text-slate-900 font-mono">
                        {formatCurrency(q.totalAmount)}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectQuote(q);
                        }}
                        className="text-[11px] text-blue-600 font-medium hover:underline inline-flex items-center gap-0.5 mt-0.5"
                      >
                        <Eye className="w-3 h-3" /> Detalhes
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Ordens de Serviço Recentes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5" id="recent-orders-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Ordens de Serviço</h3>
            </div>
            <button
              onClick={() => onNavigateTab("orders")}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              Ver todas ({recentOrders.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">Nenhuma ordem de serviço cadastrada.</p>
            ) : (
              recentOrders.map((o) => {
                const badge = getOSStatusBadge(o.status);
                return (
                  <div
                    key={o.id}
                    onClick={() => onSelectOrder(o)}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      badge.isReadyAlert
                        ? "border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50"
                        : "border-slate-100 hover:border-blue-200 hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-700">{o.id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="font-semibold text-xs text-slate-900 mt-1 truncate">
                        {o.clientName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Previsão: {formatDate(o.deliveryForecast)}
                        {o.quoteId ? ` • Ref: ${o.quoteId}` : ""}
                      </p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="font-bold text-sm text-slate-900 font-mono">
                        {formatCurrency(o.finalAmount)}
                      </p>
                      {o.status === "Pronta para retirada" ? (
                        <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md mt-0.5 animate-pulse">
                          Entregar
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-medium">
                          {o.paymentStatus}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
