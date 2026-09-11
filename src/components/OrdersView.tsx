import { useState, useMemo } from "react";
import { ServiceOrder, OSStatus } from "../types";
import { formatCurrency, formatDate, getOSStatusBadge } from "../lib/formatters";
import {
  Search,
  PlusCircle,
  Eye,
  Wrench,
  Calendar,
  X,
  Trash2,
  PenTool,
} from "lucide-react";

interface OrdersViewProps {
  orders: ServiceOrder[];
  onSelectOrder: (order: ServiceOrder) => void;
  onNewOrder: () => void;
  onUpdateStatus: (id: string, status: OSStatus) => Promise<void>;
  onDeleteOrder: (id: string) => Promise<void>;
  initialStatusFilter?: string;
  isAdmin: boolean;
}

const OS_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: "Todas", value: "todos" },
  { label: "Prontas para Retirada", value: "Pronta para retirada" },
  { label: "Em Produção", value: "Em produção" },
  { label: "Abertas", value: "Aberta" },
  { label: "Aguardando Peça", value: "Aguardando peça" },
  { label: "Entregues", value: "Entregue" },
  { label: "Canceladas", value: "Cancelada" },
];

export function OrdersView({
  orders,
  onSelectOrder,
  onNewOrder,
  onUpdateStatus,
  onDeleteOrder,
  initialStatusFilter = "todos",
  isAdmin,
}: OrdersViewProps) {
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [search, setSearch] = useState("");

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "todos" && o.status !== statusFilter) {
        return false;
      }
      if (search.trim()) {
        const s = search.toLowerCase().trim();
        const matchClient = o.clientName.toLowerCase().includes(s);
        const matchId = o.id.toLowerCase().includes(s);
        const matchQuote = o.quoteId?.toLowerCase().includes(s);
        const matchBrand = o.frame?.brand?.toLowerCase().includes(s);
        return matchClient || matchId || matchQuote || matchBrand;
      }
      return true;
    });
  }, [orders, statusFilter, search]);

  const readyCount = orders.filter((o) => o.status === "Pronta para retirada").length;

  return (
    <div className="space-y-6 pb-20 md:pb-8" id="orders-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Ordens de Serviço (OS)
            </h1>
            {readyCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 animate-pulse">
                {readyCount} para retirada!
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhamento de montagem, prazos de laboratório e entrega com assinatura.
          </p>
        </div>

        <button
          onClick={onNewOrder}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all active:scale-95"
          id="btn-create-os"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nova Ordem de Serviço</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {OS_FILTER_OPTIONS.map((f) => {
            const active = statusFilter === f.value;
            const isReady = f.value === "Pronta para retirada" && readyCount > 0;
            return (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 text-xs rounded-xl whitespace-nowrap font-medium transition-all flex items-center gap-1.5 ${
                  active
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : isReady
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-400 font-bold hover:bg-emerald-200"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>{f.label}</span>
                {f.value === "Pronta para retirada" && readyCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      active ? "bg-white text-blue-700" : "bg-emerald-600 text-white animate-pulse"
                    }`}
                  >
                    {readyCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, número da OS (ex: OS-2026), orçamento de origem..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
            id="input-search-orders"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* OS Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-8">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Nenhuma ordem de serviço encontrada</p>
            <p className="text-xs text-slate-400 mt-1">
              {search || statusFilter !== "todos"
                ? "Tente ajustar os filtros de busca ou status."
                : "Crie uma nova OS ou converta um orçamento aprovado."}
            </p>
            <button
              onClick={onNewOrder}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Criar OS
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const badge = getOSStatusBadge(order.status);
            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className={`bg-white border rounded-2xl p-5 shadow-sm transition-all cursor-pointer flex flex-col justify-between group hover:shadow-md ${
                  badge.isReadyAlert
                    ? "border-emerald-400 ring-2 ring-emerald-500/20 bg-emerald-50/25"
                    : "border-slate-200 hover:border-blue-300"
                }`}
                id={`order-card-${order.id}`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-indigo-700">
                          {order.id}
                        </span>
                        {order.quoteId && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Ref: {order.quoteId}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5 group-hover:text-blue-600 transition-colors">
                        {order.clientName}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Abertura: {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold shrink-0 ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs text-slate-600 mb-3">
                    <p className="font-medium text-slate-800 flex items-center justify-between">
                      <span>{order.serviceType}</span>
                      <span className="text-[11px] font-semibold text-indigo-700 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-indigo-500" />
                        Prev: {formatDate(order.deliveryForecast)}
                      </span>
                    </p>
                    <p className="truncate">
                      <strong>Armação:</strong> {order.frame?.brand || "Própria"} {order.frame?.model}
                    </p>
                    <p className="truncate">
                      <strong>Lentes:</strong> {order.lens?.lensType || "Sem troca"}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block leading-none">Pagamento:</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {order.paymentStatus}
                      </span>
                    </div>
                    <span className="font-mono font-extrabold text-base text-slate-900">
                      {formatCurrency(order.finalAmount)}
                    </span>
                  </div>

                  {/* Bottom Action Row */}
                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOrder(order);
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ficha Completa</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {order.status === "Pronta para retirada" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectOrder(order);
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1 animate-pulse"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Entregar</span>
                        </button>
                      )}

                      {order.status === "Aberta" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(order.id, "Em produção");
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200"
                        >
                          Enviar p/ Laboratório
                        </button>
                      )}

                      {order.status === "Em produção" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(order.id, "Pronta para retirada");
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200"
                        >
                          Marcar Pronta
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Deseja excluir a OS ${order.id}?`)) {
                              onDeleteOrder(order.id);
                            }
                          }}
                          title="Excluir OS"
                          className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
