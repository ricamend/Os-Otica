import { useState, useEffect, useCallback } from "react";
import {
  User,
  Client,
  Quote,
  ServiceOrder,
  DashboardMetrics,
  QuoteStatus,
  OSStatus,
  UserRole,
} from "./types";
import { api } from "./services/api";
import { Navbar } from "./components/Navbar";
import { BottomNav } from "./components/BottomNav";
import { DashboardView } from "./components/DashboardView";
import { ClientsView } from "./components/ClientsView";
import { QuotesView } from "./components/QuotesView";
import { OrdersView } from "./components/OrdersView";
import { QuoteFormModal } from "./components/QuoteFormModal";
import { QuoteDetailModal } from "./components/QuoteDetailModal";
import { OrderFormModal } from "./components/OrderFormModal";
import { OrderDetailModal } from "./components/OrderDetailModal";
import { LoginModal } from "./components/LoginModal";
import {
  FileText,
  Wrench,
  UserPlus,
  X,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("otica_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Default logged in user: Dra. Helena Martins (Admin)
    return {
      id: "u-1",
      name: "Dra. Helena Martins",
      email: "admin@otica.com",
      role: "ADMIN",
    };
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Tab & Filter navigation
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [quoteFilter, setQuoteFilter] = useState("todos");
  const [orderFilter, setOrderFilter] = useState("todos");

  // Core Data
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [recentQuotes, setRecentQuotes] = useState<Quote[]>([]);
  const [recentOrders, setRecentOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Active Selections
  const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [selectedQuoteDetail, setSelectedQuoteDetail] = useState<Quote | null>(null);

  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<ServiceOrder | null>(null);

  const [targetClientForNewItem, setTargetClientForNewItem] = useState<Client | null>(null);
  const [mobileActionSheetOpen, setMobileActionSheetOpen] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Load all data
  const loadData = useCallback(async () => {
    try {
      const [dash, cliList, qList, oList] = await Promise.all([
        api.getDashboard(),
        api.getClients(),
        api.getQuotes(),
        api.getOrders(),
      ]);
      setMetrics(dash.metrics);
      setRecentQuotes(dash.recentQuotes);
      setRecentOrders(dash.recentOrders);
      setClients(cliList);
      setQuotes(qList);
      setOrders(oList);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle User Login
  const handleLogin = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setCurrentUser(res.user);
    localStorage.setItem("otica_user", JSON.stringify(res.user));
    setIsLoginModalOpen(false);
    showToast(`Bem-vindo(a), ${res.user.name}!`);
  };

  const handleRegister = async (data: { name: string; email: string; password: string; role: UserRole }) => {
    const res = await api.register(data);
    setCurrentUser(res.user);
    localStorage.setItem("otica_user", JSON.stringify(res.user));
    setIsLoginModalOpen(false);
    showToast(`Usuário cadastrado com sucesso!`);
  };

  const handleLogout = () => {
    localStorage.removeItem("otica_user");
    setCurrentUser(null);
    setIsLoginModalOpen(true);
  };

  // Client actions
  const handleSaveClient = async (data: Partial<Client>) => {
    if (data.id) {
      await api.updateClient(data.id, data);
      showToast("Cliente atualizado com sucesso!");
    } else {
      await api.createClient(data);
      showToast("Cliente cadastrado com sucesso!");
    }
    await loadData();
  };

  const handleDeleteClient = async (id: string) => {
    await api.deleteClient(id);
    showToast("Cliente removido.");
    await loadData();
  };

  const handleLoadClientHistory = async (clientId: string) => {
    return api.getClientHistory(clientId);
  };

  // Quote actions
  const handleOpenNewQuote = (client?: Client) => {
    setEditingQuote(null);
    setTargetClientForNewItem(client || null);
    setIsQuoteFormOpen(true);
  };

  const handleSaveQuote = async (data: Partial<Quote>) => {
    if (data.id) {
      await api.updateQuote(data.id, data);
      showToast("Orçamento atualizado!");
    } else {
      const created = await api.createQuote(data);
      showToast(`Orçamento ${created.id} criado com sucesso!`);
    }
    await loadData();
  };

  const handleUpdateQuoteStatus = async (id: string, status: QuoteStatus, reason?: string) => {
    await api.updateQuoteStatus(id, status, reason);
    showToast(`Orçamento atualizado para ${status}.`);
    await loadData();
    // Update active modal if viewing this quote
    if (selectedQuoteDetail?.id === id) {
      setSelectedQuoteDetail((prev) => (prev ? { ...prev, status, rejectionReason: reason } : null));
    }
  };

  const handleConvertToOS = async (quoteId: string) => {
    try {
      const res = await api.convertToOS(quoteId);
      showToast(`🚀 Sucesso! Orçamento transformado na OS ${res.serviceOrder.id}!`);
      await loadData();

      // Close quote modal and open the created OS modal
      setSelectedQuoteDetail(null);
      setSelectedOrderDetail(res.serviceOrder);
      setCurrentTab("orders");
    } catch (err: any) {
      showToast(err.message || "Falha ao converter em OS", "error");
    }
  };

  const handleDeleteQuote = async (id: string) => {
    await api.deleteQuote(id);
    showToast("Orçamento excluído.");
    await loadData();
  };

  // Order actions
  const handleOpenNewOrder = (client?: Client) => {
    setEditingOrder(null);
    setTargetClientForNewItem(client || null);
    setIsOrderFormOpen(true);
  };

  const handleSaveOrder = async (data: Partial<ServiceOrder>) => {
    if (data.id) {
      await api.updateOrderStatus(data.id, data.status as OSStatus);
      showToast("Ordem de Serviço atualizada!");
    } else {
      const created = await api.createOrder(data);
      showToast(`Ordem de Serviço ${created.id} aberta com sucesso!`);
    }
    await loadData();
  };

  const handleUpdateOrderStatus = async (id: string, status: OSStatus) => {
    await api.updateOrderStatus(id, status);
    showToast(`Status da OS alterado para ${status}.`);
    await loadData();
    if (selectedOrderDetail?.id === id) {
      setSelectedOrderDetail((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleSaveSignature = async (orderId: string, sigBase64: string) => {
    const res = await api.saveSignature(orderId, sigBase64);
    showToast("✅ Comprovante de entrega assinado e arquivado com sucesso!");
    await loadData();
    setSelectedOrderDetail(res.order);
  };

  const handleDeleteOrder = async (id: string) => {
    await api.deleteOrder(id);
    showToast("Ordem de Serviço excluída.");
    await loadData();
  };

  // Navigation helpers from cards
  const navigateToQuoteDetail = (quote: Quote) => {
    setSelectedQuoteDetail(quote);
  };

  const navigateToOrderDetail = (order: ServiceOrder) => {
    setSelectedOrderDetail(order);
  };

  const navigateToOSById = (osId: string) => {
    const found = orders.find((o) => o.id === osId);
    if (found) {
      setSelectedOrderDetail(found);
      setCurrentTab("orders");
    }
  };

  const navigateToQuoteById = (quoteId: string) => {
    const found = quotes.find((q) => q.id === quoteId);
    if (found) {
      setSelectedQuoteDetail(found);
      setCurrentTab("quotes");
    }
  };

  const handleNavigateTab = (tab: string, filterVal?: string) => {
    if (tab === "quotes" && filterVal) {
      setQuoteFilter(filterVal);
    } else if (tab === "quotes") {
      setQuoteFilter("todos");
    }

    if (tab === "orders" && filterVal) {
      setOrderFilter(filterVal);
    } else if (tab === "orders") {
      setOrderFilter("todos");
    }

    setCurrentTab(tab);
  };

  const pendingQuotesCount = metrics?.pendingQuotesCount ?? quotes.filter((q) => q.status === "Aguardando aprovação").length;
  const readyOSCount = metrics?.readyForPickupOSCount ?? orders.filter((o) => o.status === "Pronta para retirada").length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-blue-200">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        onTabChange={handleNavigateTab}
        onOpenNewQuote={() => handleOpenNewQuote()}
        onOpenNewOrder={() => handleOpenNewOrder()}
        onSwitchUserPrompt={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        pendingQuotesCount={pendingQuotesCount}
        readyOSCount={readyOSCount}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-18 right-4 z-50 animate-bounce">
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold text-white ${
              toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-semibold text-slate-500">
              Carregando dados da ótica...
            </p>
          </div>
        ) : (
          <>
            {currentTab === "dashboard" && (
              <DashboardView
                metrics={metrics}
                recentQuotes={recentQuotes}
                recentOrders={recentOrders}
                currentUser={currentUser}
                onNavigateTab={handleNavigateTab}
                onSelectQuote={navigateToQuoteDetail}
                onSelectOrder={navigateToOrderDetail}
                onNewQuote={() => handleOpenNewQuote()}
                onNewOrder={() => handleOpenNewOrder()}
                onNewClient={() => setCurrentTab("clients")}
              />
            )}

            {currentTab === "quotes" && (
              <QuotesView
                quotes={quotes}
                onSelectQuote={navigateToQuoteDetail}
                onNewQuote={() => handleOpenNewQuote()}
                onUpdateStatus={handleUpdateQuoteStatus}
                onConvertToOS={handleConvertToOS}
                onDeleteQuote={handleDeleteQuote}
                initialStatusFilter={quoteFilter}
                isAdmin={currentUser?.role === "ADMIN"}
              />
            )}

            {currentTab === "orders" && (
              <OrdersView
                orders={orders}
                onSelectOrder={navigateToOrderDetail}
                onNewOrder={() => handleOpenNewOrder()}
                onUpdateStatus={handleUpdateOrderStatus}
                onDeleteOrder={handleDeleteOrder}
                initialStatusFilter={orderFilter}
                isAdmin={currentUser?.role === "ADMIN"}
              />
            )}

            {currentTab === "clients" && (
              <ClientsView
                clients={clients}
                onSaveClient={handleSaveClient}
                onDeleteClient={handleDeleteClient}
                onNewQuoteForClient={(client) => handleOpenNewQuote(client)}
                onNewOrderForClient={(client) => handleOpenNewOrder(client)}
                onSelectQuote={navigateToQuoteDetail}
                onSelectOrder={navigateToOrderDetail}
                onLoadClientHistory={handleLoadClientHistory}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={handleNavigateTab}
        onOpenQuickAction={() => setMobileActionSheetOpen(true)}
        pendingQuotesCount={pendingQuotesCount}
        readyOSCount={readyOSCount}
      />

      {/* Mobile Quick Action Sheet */}
      {mobileActionSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:hidden bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full rounded-t-3xl p-5 shadow-2xl border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ação Rápida
              </span>
              <button
                onClick={() => setMobileActionSheetOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <button
                onClick={() => {
                  setMobileActionSheetOpen(false);
                  handleOpenNewQuote();
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50 text-blue-900 border border-blue-200 text-left font-semibold text-xs active:bg-blue-100"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-bold">Novo Orçamento</span>
                  <span className="text-[11px] text-blue-700 font-normal">
                    Preencher receita, armação e lentes
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  setMobileActionSheetOpen(false);
                  handleOpenNewOrder();
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50 text-indigo-900 border border-indigo-200 text-left font-semibold text-xs active:bg-indigo-100"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-bold">Nova Ordem de Serviço</span>
                  <span className="text-[11px] text-indigo-700 font-normal">
                    Ficha direta de laboratório e previsão
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  setMobileActionSheetOpen(false);
                  setCurrentTab("clients");
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 text-slate-800 border border-slate-200 text-left font-semibold text-xs active:bg-slate-100"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-bold">Cadastrar Cliente</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Adicionar cliente à base da ótica
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Form Modal */}
      <QuoteFormModal
        isOpen={isQuoteFormOpen}
        onClose={() => {
          setIsQuoteFormOpen(false);
          setEditingQuote(null);
          setTargetClientForNewItem(null);
        }}
        onSave={handleSaveQuote}
        clients={clients}
        editingQuote={editingQuote}
        initialClient={targetClientForNewItem}
        currentUser={currentUser}
      />

      {/* Quote Details & Approval Flow Modal */}
      <QuoteDetailModal
        quote={selectedQuoteDetail}
        isOpen={!!selectedQuoteDetail}
        onClose={() => setSelectedQuoteDetail(null)}
        onEdit={(q) => {
          setSelectedQuoteDetail(null);
          setEditingQuote(q);
          setIsQuoteFormOpen(true);
        }}
        onUpdateStatus={handleUpdateQuoteStatus}
        onConvertToOS={handleConvertToOS}
        onNavigateToOS={navigateToOSById}
      />

      {/* Service Order Form Modal */}
      <OrderFormModal
        isOpen={isOrderFormOpen}
        onClose={() => {
          setIsOrderFormOpen(false);
          setEditingOrder(null);
          setTargetClientForNewItem(null);
        }}
        onSave={handleSaveOrder}
        clients={clients}
        editingOrder={editingOrder}
        initialClient={targetClientForNewItem}
        currentUser={currentUser}
      />

      {/* Service Order Details, Tracking & Signature Modal */}
      <OrderDetailModal
        order={selectedOrderDetail}
        isOpen={!!selectedOrderDetail}
        onClose={() => setSelectedOrderDetail(null)}
        onUpdateStatus={handleUpdateOrderStatus}
        onSaveSignature={handleSaveSignature}
        onNavigateToQuote={navigateToQuoteById}
      />

      {/* Login & Registration Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onClose={() => setIsLoginModalOpen(false)}
        canDismiss={!!currentUser}
      />
    </div>
  );
}
