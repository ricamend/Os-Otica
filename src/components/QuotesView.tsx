import { useState, useMemo } from "react";
import { Quote, QuoteStatus } from "../types";
import { formatCurrency, formatDate, getQuoteStatusBadge } from "../lib/formatters";
import {
  Search,
  PlusCircle,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  Wrench,
  X,
  Trash2,
} from "lucide-react";

interface QuotesViewProps {
  quotes: Quote[];
  onSelectQuote: (quote: Quote) => void;
  onNewQuote: () => void;
  onUpdateStatus: (id: string, status: QuoteStatus, reason?: string) => Promise<void>;
  onConvertToOS: (quoteId: string) => Promise<void>;
  onDeleteQuote: (id: string) => Promise<void>;
  initialStatusFilter?: string;
  isAdmin: boolean;
}

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "Todos", value: "todos" },
  { label: "Aguardando aprovação", value: "Aguardando aprovação" },
  { label: "Aprovados", value: "Aprovado" },
  { label: "Convertidos em OS", value: "Convertido em OS" },
  { label: "Rascunhos", value: "Rascunho" },
  { label: "Recusados", value: "Recusado" },
];

export function QuotesView({
  quotes,
  onSelectQuote,
  onNewQuote,
  onUpdateStatus,
  onConvertToOS,
  onDeleteQuote,
  initialStatusFilter = "todos",
  isAdmin,
}: QuotesViewProps) {
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [search, setSearch] = useState("");

  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      if (statusFilter !== "todos" && q.status !== statusFilter) {
        return false;
      }
      if (search.trim()) {
        const s = search.toLowerCase().trim();
        const matchesClient = q.clientName.toLowerCase().includes(s);
        const matchesId = q.id.toLowerCase().includes(s);
        const matchesFrame = q.frame?.brand?.toLowerCase().includes(s);
        return matchesClient || matchesId || matchesFrame;
      }
      return true;
    });
  }, [quotes, statusFilter, search]);

  const pendingCount = quotes.filter((q) => q.status === "Aguardando aprovação").length;

  return (
    <div className="space-y-6 pb-20 md:pb-8" id="quotes-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orçamentos</h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {pendingCount} aguardando aprovação
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie propostas comerciais, graus de lentes, armações e fluxo de aprovação.
          </p>
        </div>

        <button
          onClick={onNewQuote}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all active:scale-95"
          id="btn-create-quote"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Novo Orçamento</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.value;
            const isPending = f.value === "Aguardando aprovação" && pendingCount > 0;
            return (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 text-xs rounded-xl whitespace-nowrap font-medium transition-all flex items-center gap-1.5 ${
                  active
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : isPending
                    ? "bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 font-semibold"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>{f.label}</span>
                {f.value === "Aguardando aprovação" && pendingCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      active ? "bg-white text-blue-700" : "bg-amber-500 text-white"
                    }`}
                  >
                    {pendingCount}
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
            placeholder="Buscar por cliente, número do orçamento (ex: ORC-2026) ou marca de armação..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
            id="input-search-quotes"
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

      {/* Quotes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQuotes.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-8">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Nenhum orçamento encontrado</p>
            <p className="text-xs text-slate-400 mt-1">
              {search || statusFilter !== "todos"
                ? "Tente ajustar os filtros de busca ou status."
                : "Crie o primeiro orçamento da ótica para começar."}
            </p>
            <button
              onClick={onNewQuote}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Criar Orçamento
            </button>
          </div>
        ) : (
          filteredQuotes.map((quote) => {
            const badge = getQuoteStatusBadge(quote.status);
            return (
              <div
                key={quote.id}
                onClick={() => onSelectQuote(quote)}
                className={`bg-white border rounded-2xl p-5 shadow-sm transition-all cursor-pointer flex flex-col justify-between group hover:shadow-md ${
                  badge.isAlert
                    ? "border-amber-300 ring-2 ring-amber-400/20 bg-amber-50/20"
                    : "border-slate-200 hover:border-blue-300"
                }`}
                id={`quote-card-${quote.id}`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-mono font-bold text-xs text-blue-700">
                        {quote.id}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5 group-hover:text-blue-600 transition-colors">
                        {quote.clientName}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Criado em {formatDate(quote.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold shrink-0 ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs text-slate-600 mb-3">
                    <p className="font-medium text-slate-800 flex items-center justify-between">
                      <span>{quote.serviceType}</span>
                      <span className="text-[11px] text-slate-400">Validade: {formatDate(quote.expiresAt)}</span>
                    </p>
                    <p className="truncate">
                      <strong>Armação:</strong> {quote.frame.brand || "Própria"} {quote.frame.model}
                    </p>
                    <p className="truncate">
                      <strong>Lentes:</strong> {quote.lens.lensType} ({quote.lens.material})
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 mb-3">
                    <span className="text-xs text-slate-400">Valor Total:</span>
                    <span className="font-mono font-extrabold text-base text-slate-900">
                      {formatCurrency(quote.totalAmount)}
                    </span>
                  </div>

                  {/* Actions according to status */}
                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectQuote(quote);
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detalhes</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {quote.status === "Aguardando aprovação" && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(quote.id, "Aprovado");
                            }}
                            title="Aprovar orçamento"
                            className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(quote.id, "Recusado", "Cliente não aprovou");
                            }}
                            title="Recusar orçamento"
                            className="p-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {quote.status === "Aprovado" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onConvertToOS(quote.id);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1 transition-transform active:scale-95"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Gerar OS</span>
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Deseja excluir o orçamento ${quote.id}?`)) {
                              onDeleteQuote(quote.id);
                            }
                          }}
                          title="Excluir orçamento"
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
