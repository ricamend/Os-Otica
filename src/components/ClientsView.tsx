import React, { useState, useMemo } from "react";
import { Client, Quote, ServiceOrder } from "../types";
import { formatCPF, formatPhone, formatDate, formatCurrency, getQuoteStatusBadge, getOSStatusBadge } from "../lib/formatters";
import {
  Search,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  FileText,
  Wrench,
  Clock,
  Edit2,
  Trash2,
  X,
  PlusCircle,
  Eye,
  AlertCircle,
} from "lucide-react";

interface ClientsViewProps {
  clients: Client[];
  onSaveClient: (clientData: Partial<Client>) => Promise<void>;
  onDeleteClient: (id: string) => Promise<void>;
  onNewQuoteForClient: (client: Client) => void;
  onNewOrderForClient: (client: Client) => void;
  onSelectQuote: (quote: Quote) => void;
  onSelectOrder: (order: ServiceOrder) => void;
  onLoadClientHistory: (clientId: string) => Promise<{ quotes: Quote[]; orders: ServiceOrder[] }>;
}

export function ClientsView({
  clients,
  onSaveClient,
  onDeleteClient,
  onNewQuoteForClient,
  onNewOrderForClient,
  onSelectQuote,
  onSelectOrder,
  onLoadClientHistory,
}: ClientsViewProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Client History Drawer state
  const [historyClient, setHistoryClient] = useState<Client | null>(null);
  const [clientQuotes, setClientQuotes] = useState<Quote[]>([]);
  const [clientOrders, setClientOrders] = useState<ServiceOrder[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    phone: "",
    email: "",
    birthDate: "",
    notes: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filter clients
  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const s = search.toLowerCase().trim();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.cpf.includes(s) ||
        c.phone.includes(s) ||
        c.email.toLowerCase().includes(s)
    );
  }, [clients, search]);

  const handleOpenNew = () => {
    setEditingClient(null);
    setFormData({
      name: "",
      cpf: "",
      phone: "",
      email: "",
      birthDate: "",
      notes: "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClient(client);
    setFormData({
      name: client.name,
      cpf: client.cpf,
      phone: client.phone,
      email: client.email,
      birthDate: client.birthDate,
      notes: client.notes,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setFormError("Nome e telefone são campos obrigatórios.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      await onSaveClient(editingClient ? { ...formData, id: editingClient.id } : formData);
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Erro ao salvar cliente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenHistory = async (client: Client) => {
    setHistoryClient(client);
    setLoadingHistory(true);
    try {
      const data = await onLoadClientHistory(client.id);
      setClientQuotes(data.quotes || []);
      setClientOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8" id="clients-view">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clientes</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastro de clientes, dados oftalmológicos e histórico de atendimentos.
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
          id="btn-new-client"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Novo Cliente</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, CPF ou telefone do cliente..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          id="input-search-clients"
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

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-8">
            <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Nenhum cliente encontrado</p>
            <p className="text-xs text-slate-400 mt-1">
              {search ? "Tente buscar com outros termos." : "Cadastre o primeiro cliente da ótica."}
            </p>
            {!search && (
              <button
                onClick={handleOpenNew}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Cadastrar Cliente
              </button>
            )}
          </div>
        ) : (
          filteredClients.map((client) => (
            <div
              key={client.id}
              onClick={() => handleOpenHistory(client)}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              id={`client-card-${client.id}`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                      {client.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      CPF: {client.cpf ? formatCPF(client.cpf) : "Não informado"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleOpenEdit(client, e)}
                      title="Editar cadastro"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Deseja realmente excluir o cliente ${client.name}?`)) {
                          onDeleteClient(client.id);
                        }
                      }}
                      title="Excluir cliente"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatPhone(client.phone)}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.birthDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Nasc: {formatDate(client.birthDate)}</span>
                    </div>
                  )}
                </div>

                {client.notes && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg line-clamp-2 italic mb-3">
                    "{client.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenHistory(client);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Histórico</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNewQuoteForClient(client);
                    }}
                    title="Novo Orçamento para este cliente"
                    className="px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                  >
                    + Orçamento
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNewOrderForClient(client);
                    }}
                    title="Nova OS para este cliente"
                    className="px-2 py-1 text-[11px] font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-md transition-colors"
                  >
                    + OS
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CLIENT MODAL (CREATE / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                {editingClient ? "Editar Cadastro de Cliente" : "Cadastrar Novo Cliente"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Carlos Eduardo Silveira"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  id="client-form-name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    id="client-form-cpf"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    id="client-form-phone"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="exemplo@email.com"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    id="client-form-email"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    id="client-form-birthdate"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações / Histórico Médico / Preferências
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ex: Usuário de lentes de contato, sensibilidade a luz, histórico de cirurgia refrativa, prefere armações redondas..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  id="client-form-notes"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors"
                  id="btn-submit-client"
                >
                  {submitting ? "Salvando..." : editingClient ? "Atualizar Cliente" : "Salvar Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLIENT HISTORY MODAL */}
      {historyClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{historyClient.name}</h2>
                  <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {historyClient.cpf ? formatCPF(historyClient.cpf) : "Sem CPF"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tel: {formatPhone(historyClient.phone)} {historyClient.email ? `• ${historyClient.email}` : ""}
                </p>
              </div>
              <button
                onClick={() => setHistoryClient(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              {/* Client Notes */}
              {historyClient.notes && (
                <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl text-xs text-blue-900">
                  <span className="font-bold">Observações do Cliente:</span> {historyClient.notes}
                </div>
              )}

              {/* Quick actions for this client */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const c = historyClient;
                    setHistoryClient(null);
                    onNewQuoteForClient(c);
                  }}
                  className="flex-1 py-2 px-3 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-4 h-4" /> Novo Orçamento
                </button>
                <button
                  onClick={() => {
                    const c = historyClient;
                    setHistoryClient(null);
                    onNewOrderForClient(c);
                  }}
                  className="flex-1 py-2 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <Wrench className="w-4 h-4" /> Nova Ordem de Serviço
                </button>
              </div>

              {loadingHistory ? (
                <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 animate-spin text-blue-600" />
                  Carregando histórico do cliente...
                </div>
              ) : (
                <>
                  {/* Orçamentos do Cliente */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Histórico de Orçamentos ({clientQuotes.length})
                      </h3>
                    </div>

                    {clientQuotes.length === 0 ? (
                      <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                        Nenhum orçamento emitido para este cliente ainda.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {clientQuotes.map((q) => {
                          const badge = getQuoteStatusBadge(q.status);
                          return (
                            <div
                              key={q.id}
                              onClick={() => {
                                setHistoryClient(null);
                                onSelectQuote(q);
                              }}
                              className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-slate-50/80 cursor-pointer transition-all flex items-center justify-between"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-blue-700">{q.id}</span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${badge.bg}`}>
                                    {badge.label}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-1">
                                  {q.serviceType} • {q.frame.brand || "Armação"} • {formatDate(q.createdAt)}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-bold text-xs text-slate-900">
                                  {formatCurrency(q.totalAmount)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Ordens de Serviço do Cliente */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-indigo-600" />
                        Histórico de Ordens de Serviço ({clientOrders.length})
                      </h3>
                    </div>

                    {clientOrders.length === 0 ? (
                      <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                        Nenhuma ordem de serviço aberta para este cliente ainda.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {clientOrders.map((o) => {
                          const badge = getOSStatusBadge(o.status);
                          return (
                            <div
                              key={o.id}
                              onClick={() => {
                                setHistoryClient(null);
                                onSelectOrder(o);
                              }}
                              className="p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-slate-50/80 cursor-pointer transition-all flex items-center justify-between"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-indigo-700">{o.id}</span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${badge.bg}`}>
                                    {badge.label}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-1">
                                  Previsão: {formatDate(o.deliveryForecast)} {o.deliveredAt ? `• Entregue: ${formatDate(o.deliveredAt)}` : ""}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-bold text-xs text-slate-900">
                                  {formatCurrency(o.finalAmount)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setHistoryClient(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
