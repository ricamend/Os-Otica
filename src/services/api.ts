import { Client, Quote, ServiceOrder, User, DashboardMetrics, QuoteStatus, OSStatus } from "../types";

const BASE_URL = "/api";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
  } catch (netErr: any) {
    throw new Error(`Falha de conexão com o servidor: ${netErr.message || "Servidor indisponível"}`);
  }

  if (!res.ok) {
    let errorMsg = "";
    try {
      const errorData = await res.json();
      errorMsg = errorData.message || errorData.error || "";
    } catch {
      // Non-JSON response
    }

    if (!errorMsg) {
      if (res.status === 401) {
        errorMsg = "E-mail ou senha incorretos.";
      } else if (res.status === 404) {
        errorMsg = "Serviço não encontrado (404).";
      } else {
        errorMsg = `Erro no servidor (${res.status}): ${res.statusText || "Falha na requisição"}`;
      }
    }

    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { name: string; email: string; password: string; role: string }) =>
    request<{ user: User; message: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getUsers: () => request<User[]>("/auth/users"),

  // Clients
  getClients: (q?: string) =>
    request<Client[]>(q ? `/clients?q=${encodeURIComponent(q)}` : "/clients"),

  getClient: (id: string) => request<Client>(`/clients/${id}`),

  createClient: (clientData: Partial<Client>) =>
    request<Client>("/clients", {
      method: "POST",
      body: JSON.stringify(clientData),
    }),

  updateClient: (id: string, clientData: Partial<Client>) =>
    request<Client>(`/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(clientData),
    }),

  deleteClient: (id: string) =>
    request<{ success: boolean; message: string }>(`/clients/${id}`, {
      method: "DELETE",
    }),

  getClientHistory: (id: string) =>
    request<{ quotes: Quote[]; orders: ServiceOrder[] }>(`/clients/${id}/history`),

  // Quotes
  getQuotes: (params?: { status?: string; clientId?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== "todos") query.set("status", params.status);
    if (params?.clientId) query.set("clientId", params.clientId);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    return request<Quote[]>(qs ? `/quotes?${qs}` : "/quotes");
  },

  getQuote: (id: string) => request<Quote>(`/quotes/${id}`),

  createQuote: (quoteData: Partial<Quote>) =>
    request<Quote>("/quotes", {
      method: "POST",
      body: JSON.stringify(quoteData),
    }),

  updateQuote: (id: string, quoteData: Partial<Quote>) =>
    request<Quote>(`/quotes/${id}`, {
      method: "PUT",
      body: JSON.stringify(quoteData),
    }),

  updateQuoteStatus: (id: string, status: QuoteStatus, rejectionReason?: string) =>
    request<Quote>(`/quotes/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, rejectionReason }),
    }),

  convertToOS: (quoteId: string, deliveryForecast?: string, internalNotes?: string, createdBy?: string) =>
    request<{ serviceOrder: ServiceOrder; quote: Quote }>(`/quotes/${quoteId}/convert-to-os`, {
      method: "POST",
      body: JSON.stringify({ deliveryForecast, internalNotes, createdBy }),
    }),

  deleteQuote: (id: string) =>
    request<{ success: boolean; message: string }>(`/quotes/${id}`, {
      method: "DELETE",
    }),

  // Service Orders (OS)
  getOrders: (params?: { status?: string; clientId?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== "todos") query.set("status", params.status);
    if (params?.clientId) query.set("clientId", params.clientId);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    return request<ServiceOrder[]>(qs ? `/orders?${qs}` : "/orders");
  },

  getOrder: (id: string) => request<ServiceOrder>(`/orders/${id}`),

  createOrder: (orderData: Partial<ServiceOrder>) =>
    request<ServiceOrder>("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    }),

  updateOrder: (id: string, orderData: Partial<ServiceOrder>) =>
    request<ServiceOrder>(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(orderData),
    }),

  updateOrderStatus: (id: string, status: OSStatus) =>
    request<ServiceOrder>(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  saveSignature: (id: string, signature: string) =>
    request<{ success: boolean; order: ServiceOrder }>(`/orders/${id}/signature`, {
      method: "POST",
      body: JSON.stringify({ signature }),
    }),

  deleteOrder: (id: string) =>
    request<{ success: boolean; message: string }>(`/orders/${id}`, {
      method: "DELETE",
    }),

  // Dashboard
  getDashboard: () =>
    request<{
      metrics: DashboardMetrics;
      recentQuotes: Quote[];
      recentOrders: ServiceOrder[];
    }>("/dashboard"),

  // Upload image
  uploadImage: (imageBase64: string) =>
    request<{ url: string }>("/upload", {
      method: "POST",
      body: JSON.stringify({ imageBase64 }),
    }),
};
