import { Client, Quote, ServiceOrder, User, DashboardMetrics, QuoteStatus, OSStatus } from "../types";

const BASE_URL = "/api";
const STORAGE_KEY = "otica_gestao_local_db_v1";

// Initial seed mock data for complete offline/fallback operation
const initialFallbackData = {
  users: [
    {
      id: "usr_admin",
      name: "Dra. Helena Martins",
      email: "admin@otica.com",
      password: "admin",
      role: "ADMIN" as const,
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "usr_atendente",
      name: "Lucas Andrade",
      email: "atendente@otica.com",
      password: "123",
      role: "ATENDENTE" as const,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    },
  ],
  clients: [
    {
      id: "cli_1",
      name: "Carlos Eduardo Silveira",
      cpf: "128.495.839-20",
      phone: "(11) 98765-4321",
      email: "carlos.silveira@email.com",
      birthDate: "1985-06-14",
      notes: "Usuário experiente de lentes multifocais. Sensível a reflexos de tela de computador.",
      createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "cli_2",
      name: "Mariana Costa Albuquerque",
      cpf: "349.201.758-45",
      phone: "(11) 97123-8899",
      email: "mariana.costa@email.com",
      birthDate: "1994-11-23",
      notes: "Prefere armações leves de acetato ou titânio. Pratica esportes ao ar livre.",
      createdAt: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "cli_3",
      name: "Roberto Mendes Braga",
      cpf: "450.312.980-12",
      phone: "(21) 99876-5544",
      email: "roberto.braga@email.com",
      birthDate: "1972-03-08",
      notes: "Necessita de filtro de luz azul para trabalho diário em escritório contábil.",
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "cli_4",
      name: "Juliana Peixoto de Oliveira",
      cpf: "512.634.119-87",
      phone: "(31) 98452-3311",
      email: "juliana.peixoto@email.com",
      birthDate: "2001-08-19",
      notes: "Primeiro par de óculos com grau. Acompanhou receita médica recente.",
      createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    },
  ],
  quotes: [
    {
      id: "ORC-2026-0001",
      clientId: "cli_1",
      clientName: "Carlos Eduardo Silveira",
      clientPhone: "(11) 98765-4321",
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      serviceType: "Óculos de grau",
      prescription: {
        od: { spherical: "-2.25", cylindrical: "-0.75", axis: "175", pd: "32", addition: "+2.00" },
        oe: { spherical: "-2.00", cylindrical: "-0.50", axis: "180", pd: "31.5", addition: "+2.00" },
        doctorName: "Dr. Marcelo Fagundes (CRM 45892)",
        prescriptionDate: "2026-08-20",
      },
      frame: {
        brand: "Ray-Ban",
        model: "Clubmaster Classic Titanium",
        color: "Tartaruga com Dourado",
        code: "RB3016-W0365",
        price: 890.0,
      },
      lens: {
        lensType: "Multifocal Digital Premium",
        material: "Alto Índice 1.67",
        treatments: ["Antirreflexo Crizal", "Filtro Luz Azul", "Proteção UV400"],
        price: 1150.0,
      },
      serviceFee: 0,
      discount: 100.0,
      totalAmount: 1940.0,
      suggestedPayment: "À vista no PIX com 5% de desconto (R$ 1.843,00) ou até 10x de R$ 194,00 no cartão",
      notes: "Cliente solicitou bordas polidas na lente e montagem expressa.",
      prescriptionPhotoUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80",
      validityDays: 15,
      expiresAt: new Date(Date.now() + 13 * 24 * 3600 * 1000).toISOString(),
      status: "Aprovado" as QuoteStatus,
      createdBy: "Dra. Helena Martins",
    },
    {
      id: "ORC-2026-0002",
      clientId: "cli_2",
      clientName: "Mariana Costa Albuquerque",
      clientPhone: "(11) 97123-8899",
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      serviceType: "Óculos de sol",
      prescription: {
        od: { spherical: "0.00", cylindrical: "0.00", axis: "", pd: "30", addition: "" },
        oe: { spherical: "0.00", cylindrical: "0.00", axis: "", pd: "30", addition: "" },
      },
      frame: {
        brand: "Oakley",
        model: "Holbrook Prizm Polarized",
        color: "Preto Fosco com Lente Sapphire",
        code: "OO9102-01",
        price: 780.0,
      },
      lens: {
        lensType: "Solar Polarizada Prizm",
        material: "Plutonite",
        treatments: ["Polarizado", "Espelhado Iridium"],
        price: 420.0,
      },
      serviceFee: 0,
      discount: 50.0,
      totalAmount: 1150.0,
      suggestedPayment: "Em até 6x de R$ 191,66 sem juros",
      notes: "Para uso em corrida e passeios na praia.",
      validityDays: 15,
      expiresAt: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
      status: "Aguardando aprovação" as QuoteStatus,
      createdBy: "Lucas Andrade",
    },
    {
      id: "ORC-2026-0003",
      clientId: "cli_3",
      clientName: "Roberto Mendes Braga",
      clientPhone: "(21) 99876-5544",
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      serviceType: "Óculos de grau",
      prescription: {
        od: { spherical: "+1.75", cylindrical: "-0.50", axis: "45", pd: "32", addition: "+1.50" },
        oe: { spherical: "+1.50", cylindrical: "-0.50", axis: "135", pd: "32", addition: "+1.50" },
        doctorName: "Dr. Paulo Castro (CRM 31245)",
        prescriptionDate: "2026-08-01",
      },
      frame: {
        brand: "Vogue Eyewear",
        model: "VO5338 Retangular",
        color: "Azul Marinho Translúcido",
        code: "VO5338-W656",
        price: 520.0,
      },
      lens: {
        lensType: "Monofocal Digital para Leitura",
        material: "Resina 1.56",
        treatments: ["Filtro Luz Azul BlueProtect", "Antirrisco"],
        price: 450.0,
      },
      serviceFee: 0,
      discount: 0,
      totalAmount: 970.0,
      suggestedPayment: "Em até 4x de R$ 242,50 sem juros",
      notes: "Aprovado via WhatsApp pelo cliente.",
      validityDays: 15,
      expiresAt: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
      status: "Convertido em OS" as QuoteStatus,
      convertedToOSId: "OS-2026-0001",
      createdBy: "Dra. Helena Martins",
    },
    {
      id: "ORC-2026-0004",
      clientId: "cli_4",
      clientName: "Juliana Peixoto de Oliveira",
      clientPhone: "(31) 98452-3311",
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      serviceType: "Óculos de grau",
      prescription: {
        od: { spherical: "-1.00", cylindrical: "-0.25", axis: "90", pd: "31", addition: "" },
        oe: { spherical: "-0.75", cylindrical: "-0.25", axis: "85", pd: "31", addition: "" },
        doctorName: "Dra. Camila Nogueira (CRM 56214)",
        prescriptionDate: "2026-08-25",
      },
      frame: {
        brand: "Ana Hickmann",
        model: "AH6398 Metal e Acetato",
        color: "Rosé com Marrom",
        code: "AH6398-G21",
        price: 650.0,
      },
      lens: {
        lensType: "Monofocal Digital",
        material: "Policarbonato 1.59",
        treatments: ["Antirreflexo Premium", "Proteção UV400"],
        price: 390.0,
      },
      serviceFee: 0,
      discount: 40.0,
      totalAmount: 1000.0,
      suggestedPayment: "Em até 5x de R$ 200,00 sem juros",
      notes: "Cliente aguardando confirmação do limite no cartão.",
      validityDays: 15,
      expiresAt: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
      status: "Aguardando aprovação" as QuoteStatus,
      createdBy: "Lucas Andrade",
    },
  ],
  serviceOrders: [
    {
      id: "OS-2026-0001",
      clientId: "cli_3",
      clientName: "Roberto Mendes Braga",
      clientPhone: "(21) 99876-5544",
      quoteId: "ORC-2026-0003",
      serviceType: "Óculos de grau",
      prescription: {
        od: { spherical: "+1.75", cylindrical: "-0.50", axis: "45", pd: "32", addition: "+1.50" },
        oe: { spherical: "+1.50", cylindrical: "-0.50", axis: "135", pd: "32", addition: "+1.50" },
        doctorName: "Dr. Paulo Castro (CRM 31245)",
        prescriptionDate: "2026-08-01",
      },
      frame: {
        brand: "Vogue Eyewear",
        model: "VO5338 Retangular",
        color: "Azul Marinho Translúcido",
        code: "VO5338-W656",
        price: 520.0,
      },
      lens: {
        lensType: "Monofocal para Leitura e Tela",
        material: "Resina 1.56",
        treatments: ["Filtro Luz Azul BlueProtect", "Antirrisco"],
        price: 450.0,
      },
      status: "Pronta para retirada" as OSStatus,
      createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      deliveryForecast: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString().split("T")[0],
      finalAmount: 970.0,
      paymentStatus: "Pago",
      internalNotes: "Montagem finalizada e conferida na lensometria. Óculos alinhado e estojo rígido original separado.",
      createdBy: "Dra. Helena Martins",
    },
    {
      id: "OS-2026-0002",
      clientId: "cli_1",
      clientName: "Carlos Eduardo Silveira",
      clientPhone: "(11) 98765-4321",
      quoteId: "ORC-2026-0001",
      serviceType: "Óculos de grau",
      prescription: {
        od: { spherical: "-2.25", cylindrical: "-0.75", axis: "175", pd: "32", addition: "+2.00" },
        oe: { spherical: "-2.00", cylindrical: "-0.50", axis: "180", pd: "31.5", addition: "+2.00" },
        doctorName: "Dr. Marcelo Fagundes (CRM 45892)",
        prescriptionDate: "2026-08-20",
      },
      frame: {
        brand: "Ray-Ban",
        model: "Clubmaster Classic Titanium",
        color: "Tartaruga com Dourado",
        code: "RB3016-W0365",
        price: 890.0,
      },
      lens: {
        lensType: "Multifocal Digital Premium",
        material: "Alto Índice 1.67",
        treatments: ["Antirreflexo Crizal", "Filtro Luz Azul", "Proteção UV400"],
        price: 1150.0,
      },
      status: "Em produção" as OSStatus,
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      deliveryForecast: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split("T")[0],
      finalAmount: 1940.0,
      paymentStatus: "Pendente",
      internalNotes: "Lentes enviadas para o laboratório de surfaçagem digital e aplicação de Crizal.",
      prescriptionPhotoUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80",
      createdBy: "Dra. Helena Martins",
    },
    {
      id: "OS-2026-0003",
      clientId: "cli_2",
      clientName: "Mariana Costa Albuquerque",
      clientPhone: "(11) 97123-8899",
      serviceType: "Ajuste",
      prescription: {
        od: { spherical: "", cylindrical: "", axis: "", pd: "", addition: "" },
        oe: { spherical: "", cylindrical: "", axis: "", pd: "", addition: "" },
      },
      frame: {
        brand: "Oakley",
        model: "Armação Solar existente",
        color: "Preto",
        code: "AJUSTE-01",
        price: 0,
      },
      lens: {
        lensType: "Sem troca de lentes",
        material: "-",
        treatments: [],
        price: 0,
      },
      status: "Aberta" as OSStatus,
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      deliveryForecast: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split("T")[0],
      finalAmount: 120.0,
      paymentStatus: "Pendente",
      internalNotes: "Troca de plaquetas de silicone e alinhamento de hastes com aperto de parafusos.",
      createdBy: "Lucas Andrade",
    },
    {
      id: "OS-2026-0004",
      clientId: "cli_4",
      clientName: "Juliana Peixoto de Oliveira",
      clientPhone: "(31) 98452-3311",
      serviceType: "Conserto",
      prescription: {
        od: { spherical: "", cylindrical: "", axis: "", pd: "", addition: "" },
        oe: { spherical: "", cylindrical: "", axis: "", pd: "", addition: "" },
      },
      frame: {
        brand: "Armação Própria da Cliente",
        model: "Metal Tartaruga",
        color: "Dourado",
        code: "PROP-01",
        price: 0,
      },
      lens: {
        lensType: "Mantém lentes atuais",
        material: "-",
        treatments: [],
        price: 0,
      },
      status: "Entregue" as OSStatus,
      createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
      deliveryForecast: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString().split("T")[0],
      deliveredAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      finalAmount: 85.0,
      paymentStatus: "Pago",
      internalNotes: "Solda a laser na ponte nasal. Entregue perfeitamente polido e revisado.",
      clientSignature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACgCAYAAAB0Jt0vAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAATLSURBVHhe7d0xTsNQFETRliVLp+s/qCw",
      signatureDate: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      createdBy: "Dra. Helena Martins",
    },
  ],
  nextQuoteSeq: 5,
  nextOSSeq: 5,
};

// Local storage helper
function getLocalStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.clients) && Array.isArray(parsed.quotes)) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage parse error
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialFallbackData));
  } catch {
    // Ignore storage write error
  }
  return JSON.parse(JSON.stringify(initialFallbackData));
}

function saveLocalStore(data: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore
  }
}

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
    throw new Error(`CONNECTION_ERROR: ${netErr.message || "Servidor indisponível"}`);
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

    const err = new Error(errorMsg) as any;
    err.status = res.status;
    throw err;
  }

  return res.json();
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    try {
      return await request<{ user: User; token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    } catch (err: any) {
      if (err.status === 401) throw err;
      // Fallback to local authentication
      const store = getLocalStore();
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();
      const user = store.users.find((u: any) => u.email.toLowerCase() === cleanEmail && u.password === cleanPass);
      if (!user) {
        throw new Error("E-mail ou senha incorretos.");
      }
      const { password: _, ...safeUser } = user;
      return { user: safeUser, token: `local-token-${user.id}` };
    }
  },

  register: async (data: { name: string; email: string; password: string; role: string }) => {
    try {
      return await request<{ user: User; message: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch {
      const store = getLocalStore();
      const newUser = {
        id: `usr_${Date.now()}`,
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role as any,
        createdAt: new Date().toISOString(),
      };
      store.users.push(newUser);
      saveLocalStore(store);
      const { password: _, ...safeUser } = newUser;
      return { user: safeUser, message: "Usuário cadastrado com sucesso." };
    }
  },

  getUsers: async () => {
    try {
      return await request<User[]>("/auth/users");
    } catch {
      const store = getLocalStore();
      return store.users.map(({ password: _, ...u }: any) => u);
    }
  },

  // Clients
  getClients: async (q?: string) => {
    try {
      const res = await request<Client[]>(q ? `/clients?q=${encodeURIComponent(q)}` : "/clients");
      // Keep local store in sync
      const store = getLocalStore();
      store.clients = res;
      saveLocalStore(store);
      return res;
    } catch {
      const store = getLocalStore();
      let list = store.clients || [];
      if (q && typeof q === "string") {
        const query = q.toLowerCase().trim();
        list = list.filter(
          (c: Client) =>
            (c.name || "").toLowerCase().includes(query) ||
            (c.cpf || "").includes(query) ||
            (c.phone || "").includes(query) ||
            (c.email || "").toLowerCase().includes(query)
        );
      }
      return list;
    }
  },

  getClient: async (id: string) => {
    try {
      return await request<Client>(`/clients/${id}`);
    } catch {
      const store = getLocalStore();
      const client = store.clients.find((c: any) => c.id === id);
      if (!client) throw new Error("Cliente não encontrado.");
      return client;
    }
  },

  createClient: async (clientData: Partial<Client>) => {
    try {
      const res = await request<Client>("/clients", {
        method: "POST",
        body: JSON.stringify(clientData),
      });
      const store = getLocalStore();
      store.clients.unshift(res);
      saveLocalStore(store);
      return res;
    } catch {
      // Fallback: save client locally so user action is never lost
      const store = getLocalStore();
      const newClient: Client = {
        id: `cli_${Date.now()}`,
        name: (clientData.name || "").trim(),
        cpf: (clientData.cpf || "").trim(),
        phone: (clientData.phone || "").trim(),
        email: (clientData.email || "").trim(),
        birthDate: clientData.birthDate || "",
        notes: clientData.notes || "",
        createdAt: new Date().toISOString(),
      };
      store.clients.unshift(newClient);
      saveLocalStore(store);
      return newClient;
    }
  },

  updateClient: async (id: string, clientData: Partial<Client>) => {
    try {
      const res = await request<Client>(`/clients/${id}`, {
        method: "PUT",
        body: JSON.stringify(clientData),
      });
      const store = getLocalStore();
      const idx = store.clients.findIndex((c: any) => c.id === id);
      if (idx !== -1) store.clients[idx] = res;
      saveLocalStore(store);
      return res;
    } catch {
      const store = getLocalStore();
      const idx = store.clients.findIndex((c: any) => c.id === id);
      if (idx === -1) throw new Error("Cliente não encontrado.");
      const updated = { ...store.clients[idx], ...clientData, id };
      store.clients[idx] = updated;
      saveLocalStore(store);
      return updated;
    }
  },

  deleteClient: async (id: string) => {
    try {
      const res = await request<{ success: boolean; message: string }>(`/clients/${id}`, {
        method: "DELETE",
      });
      const store = getLocalStore();
      store.clients = store.clients.filter((c: any) => c.id !== id);
      saveLocalStore(store);
      return res;
    } catch {
      const store = getLocalStore();
      store.clients = store.clients.filter((c: any) => c.id !== id);
      saveLocalStore(store);
      return { success: true, message: "Cliente removido com sucesso." };
    }
  },

  getClientHistory: async (id: string) => {
    try {
      return await request<{ quotes: Quote[]; orders: ServiceOrder[] }>(`/clients/${id}/history`);
    } catch {
      const store = getLocalStore();
      const quotes = store.quotes.filter((q: any) => q.clientId === id);
      const orders = store.serviceOrders.filter((o: any) => o.clientId === id);
      return { quotes, orders };
    }
  },

  // Quotes
  getQuotes: async (params?: { status?: string; clientId?: string; search?: string }) => {
    try {
      const query = new URLSearchParams();
      if (params?.status && params.status !== "todos") query.set("status", params.status);
      if (params?.clientId) query.set("clientId", params.clientId);
      if (params?.search) query.set("search", params.search);
      const qs = query.toString();
      const res = await request<Quote[]>(qs ? `/quotes?${qs}` : "/quotes");
      const store = getLocalStore();
      store.quotes = res;
      saveLocalStore(store);
      return res;
    } catch {
      const store = getLocalStore();
      let list = store.quotes || [];
      if (params?.status && params.status !== "todos") {
        list = list.filter((q: any) => q.status === params.status);
      }
      if (params?.clientId) {
        list = list.filter((q: any) => q.clientId === params.clientId);
      }
      if (params?.search) {
        const s = params.search.toLowerCase().trim();
        list = list.filter(
          (q: any) =>
            (q.id || "").toLowerCase().includes(s) ||
            (q.clientName || "").toLowerCase().includes(s) ||
            (q.frame?.brand || "").toLowerCase().includes(s)
        );
      }
      list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    }
  },

  getQuote: async (id: string) => {
    try {
      return await request<Quote>(`/quotes/${id}`);
    } catch {
      const store = getLocalStore();
      const quote = store.quotes.find((q: any) => q.id === id);
      if (!quote) throw new Error("Orçamento não encontrado.");
      return quote;
    }
  },

  createQuote: async (quoteData: Partial<Quote>) => {
    try {
      const res = await request<Quote>("/quotes", {
        method: "POST",
        body: JSON.stringify(quoteData),
      });
      const store = getLocalStore();
      store.quotes.unshift(res);
      saveLocalStore(store);
      return res;
    } catch {
      const store = getLocalStore();
      const year = new Date().getFullYear();
      const seqStr = String(store.nextQuoteSeq || 5).padStart(4, "0");
      const quoteId = `ORC-${year}-${seqStr}`;
      store.nextQuoteSeq = (store.nextQuoteSeq || 5) + 1;

      const validityDays = Number(quoteData.validityDays) || 15;
      const createdAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + validityDays * 24 * 3600 * 1000).toISOString();

      const newQuote: Quote = {
        ...quoteData,
        id: quoteId,
        createdAt,
        expiresAt,
        validityDays,
        status: quoteData.status || "Aguardando aprovação",
      } as Quote;

      store.quotes.unshift(newQuote);
      saveLocalStore(store);
      return newQuote;
    }
  },

  updateQuote: async (id: string, quoteData: Partial<Quote>) => {
    try {
      const res = await request<Quote>(`/quotes/${id}`, {
        method: "PUT",
        body: JSON.stringify(quoteData),
      });
      const store = getLocalStore();
      const idx = store.quotes.findIndex((q: any) => q.id === id);
      if (idx !== -1) store.quotes[idx] = res;
      saveLocalStore(store);
      return res;
    } catch {
      const store = getLocalStore();
      const idx = store.quotes.findIndex((q: any) => q.id === id);
      if (idx === -1) throw new Error("Orçamento não encontrado.");
      const updated = { ...store.quotes[idx], ...quoteData, id };
      store.quotes[idx] = updated;
      saveLocalStore(store);
      return updated;
    }
  },

  updateQuoteStatus: async (id: string, status: QuoteStatus, rejectionReason?: string) => {
    try {
      const res = await request<Quote>(`/quotes/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, rejectionReason }),
      });
      const store = getLocalStore();
      const idx = store.quotes.findIndex((q: any) => q.id === id);
      if (idx !== -1) store.quotes[idx] = res;
      saveLocalStore(store);
      return res;
    } catch {
      const store = getLocalStore();
      const quote = store.quotes.find((q: any) => q.id === id);
      if (!quote) throw new Error("Orçamento não encontrado.");
      quote.status = status;
      if (rejectionReason !== undefined) quote.rejectionReason = rejectionReason;
      saveLocalStore(store);
      return quote;
    }
  },

  convertToOS: async (quoteId: string, deliveryForecast?: string, internalNotes?: string, createdBy?: string) => {
    try {
      const res = await request<{ serviceOrder: ServiceOrder; quote: Quote }>(`/quotes/${quoteId}/convert-to-os`, {
        method: "POST",
        body: JSON.stringify({ deliveryForecast, internalNotes, createdBy }),
      });
      const store = getLocalStore();
      store.serviceOrders.unshift(res.serviceOrder);
      const qIdx = store.quotes.findIndex((q: any) => q.id === quoteId);
      if (qIdx !== -1) store.quotes[qIdx] = res.quote;
      saveLocalStore(store);
      return res;
    } catch {
      const store = getLocalStore();
      const quote = store.quotes.find((q: any) => q.id === quoteId);
      if (!quote) throw new Error("Orçamento não encontrado.");

      const year = new Date().getFullYear();
      const seqStr = String(store.nextOSSeq || 5).padStart(4, "0");
      const osId = `OS-${year}-${seqStr}`;
      store.nextOSSeq = (store.nextOSSeq || 5) + 1;

      const forecastDate = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split("T")[0];

      const newOS: ServiceOrder = {
        id: osId,
        clientId: quote.clientId,
        clientName: quote.clientName,
        clientPhone: quote.clientPhone,
        quoteId: quote.id,
        serviceType: quote.serviceType,
        prescription: quote.prescription,
        frame: quote.frame,
        lens: quote.lens,
        status: "Aberta",
        createdAt: new Date().toISOString(),
        deliveryForecast: deliveryForecast || forecastDate,
        finalAmount: quote.totalAmount,
        paymentStatus: "Pendente",
        internalNotes: internalNotes || `Gerado a partir do orçamento ${quote.id}. ${quote.notes || ""}`.trim(),
        prescriptionPhotoUrl: quote.prescriptionPhotoUrl,
        createdBy: createdBy || quote.createdBy || "Atendente",
      };

      quote.status = "Convertido em OS";
      quote.convertedToOSId = osId;

      store.serviceOrders.unshift(newOS);
      saveLocalStore(store);

      return { serviceOrder: newOS, quote };
    }
  },

  deleteQuote: async (id: string) => {
    try {
      const res = await request<{ success: boolean; message: string }>(`/quotes/${id}`, {
        method: "DELETE",
      });
      const store = getLocalStore();
      store.quotes = store.quotes.filter((q: any) => q.id !== id);
      saveLocalStore(store);
      return res;
    } catch {
      const store = getLocalStore();
      store.quotes = store.quotes.filter((q: any) => q.id !== id);
      saveLocalStore(store);
      return { success: true, message: "Orçamento excluído com sucesso." };
    }
  },

  // Service Orders (OS)
  getOrders: async (params?: { status?: string; clientId?: string; search?: string }) => {
    try {
      const query = new URLSearchParams();
      if (params?.status && params.status !== "todos") query.set("status", params.status);
      if (params?.clientId) query.set("clientId", params.clientId);
      if (params?.search) query.set("search", params.search);
      const qs = query.toString();
      const res = await request<ServiceOrder[]>(qs ? `/orders?${qs}` : "/orders");
      const store = getLocalStore();
      store.serviceOrders = res;
      saveLocalStore(store);
      return res;
    } catch {
      const store = getLocalStore();
      let list = store.serviceOrders || [];
      if (params?.status && params.status !== "todos") {
        list = list.filter((o: any) => o.status === params.status);
      }
      if (params?.clientId) {
        list = list.filter((o: any) => o.clientId === params.clientId);
      }
      if (params?.search) {
        const s = params.search.toLowerCase().trim();
        list = list.filter(
          (o: any) =>
            (o.id || "").toLowerCase().includes(s) ||
            (o.clientName || "").toLowerCase().includes(s) ||
            (o.quoteId && o.quoteId.toLowerCase().includes(s)) ||
            (o.frame?.brand || "").toLowerCase().includes(s)
        );
      }
      list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    }
  },

  getOrder: async (id: string) => {
    try {
      return await request<ServiceOrder>(`/orders/${id}`);
    } catch {
      const store = getLocalStore();
      const order = store.serviceOrders.find((o: any) => o.id === id);
      if (!order) throw new Error("Ordem de Serviço não encontrada.");
      return order;
    }
  },

  createOrder: async (orderData: Partial<ServiceOrder>) => {
    try {
      const res = await request<ServiceOrder>("/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });
      const store = getLocalStore();
      store.serviceOrders.unshift(res);
      saveLocalStore(store);
      return res;
    } catch {
      const store = getLocalStore();
      const year = new Date().getFullYear();
      const seqStr = String(store.nextOSSeq || 5).padStart(4, "0");
      const osId = `OS-${year}-${seqStr}`;
      store.nextOSSeq = (store.nextOSSeq || 5) + 1;

      const newOrder: ServiceOrder = {
        ...orderData,
        id: osId,
        createdAt: new Date().toISOString(),
        status: orderData.status || "Aberta",
        paymentStatus: orderData.paymentStatus || "Pendente",
      } as ServiceOrder;

      store.serviceOrders.unshift(newOrder);
      saveLocalStore(store);
      return newOrder;
    }
  },

  updateOrder: async (id: string, orderData: Partial<ServiceOrder>) => {
    try {
      const res = await request<ServiceOrder>(`/orders/${id}`, {
        method: "PUT",
        body: JSON.stringify(orderData),
      });
      const store = getLocalStore();
      const idx = store.serviceOrders.findIndex((o: any) => o.id === id);
      if (idx !== -1) store.serviceOrders[idx] = res;
      saveLocalStore(store);
      return res;
    } catch {
      const store = getLocalStore();
      const idx = store.serviceOrders.findIndex((o: any) => o.id === id);
      if (idx === -1) throw new Error("Ordem de Serviço não encontrada.");
      const updated = { ...store.serviceOrders[idx], ...orderData, id };
      store.serviceOrders[idx] = updated;
      saveLocalStore(store);
      return updated;
    }
  },

  updateOrderStatus: async (id: string, status: OSStatus) => {
    try {
      const res = await request<ServiceOrder>(`/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      const store = getLocalStore();
      const idx = store.serviceOrders.findIndex((o: any) => o.id === id);
      if (idx !== -1) store.serviceOrders[idx] = res;
      saveLocalStore(store);
      return res;
    } catch {
      const store = getLocalStore();
      const order = store.serviceOrders.find((o: any) => o.id === id);
      if (!order) throw new Error("Ordem de Serviço não encontrada.");
      order.status = status;
      if (status === "Entregue" && !order.deliveredAt) {
        order.deliveredAt = new Date().toISOString();
      }
      saveLocalStore(store);
      return order;
    }
  },

  saveSignature: async (id: string, signature: string) => {
    try {
      const res = await request<{ success: boolean; order: ServiceOrder }>(`/orders/${id}/signature`, {
        method: "POST",
        body: JSON.stringify({ signature }),
      });
      const store = getLocalStore();
      const idx = store.serviceOrders.findIndex((o: any) => o.id === id);
      if (idx !== -1) store.serviceOrders[idx] = res.order;
      saveLocalStore(store);
      return res;
    } catch {
      const store = getLocalStore();
      const order = store.serviceOrders.find((o: any) => o.id === id);
      if (!order) throw new Error("Ordem de Serviço não encontrada.");
      order.clientSignature = signature;
      order.signatureDate = new Date().toISOString();
      order.status = "Entregue";
      order.deliveredAt = new Date().toISOString();
      saveLocalStore(store);
      return { success: true, order };
    }
  },

  deleteOrder: async (id: string) => {
    try {
      const res = await request<{ success: boolean; message: string }>(`/orders/${id}`, {
        method: "DELETE",
      });
      const store = getLocalStore();
      store.serviceOrders = store.serviceOrders.filter((o: any) => o.id !== id);
      saveLocalStore(store);
      return res;
    } catch {
      const store = getLocalStore();
      store.serviceOrders = store.serviceOrders.filter((o: any) => o.id !== id);
      saveLocalStore(store);
      return { success: true, message: "Ordem de Serviço excluída com sucesso." };
    }
  },

  // Dashboard
  getDashboard: async () => {
    try {
      return await request<{
        metrics: DashboardMetrics;
        recentQuotes: Quote[];
        recentOrders: ServiceOrder[];
      }>("/dashboard");
    } catch {
      const store = getLocalStore();
      const quotes = store.quotes || [];
      const orders = store.serviceOrders || [];
      const clients = store.clients || [];

      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const pendingQuotesCount = quotes.filter((q: any) => q.status === "Aguardando aprovação").length;
      const openOSCount = orders.filter((o: any) => o.status === "Aberta").length;
      const inProductionOSCount = orders.filter((o: any) => o.status === "Em produção").length;
      const readyForPickupOSCount = orders.filter((o: any) => o.status === "Pronta para retirada").length;

      let dailyRevenue = 0;
      let monthlyRevenue = 0;

      orders.forEach((o: any) => {
        if (o.status !== "Cancelada") {
          const orderDate = new Date(o.createdAt);
          const orderDayStr = orderDate.toISOString().split("T")[0];
          if (orderDayStr === todayStr) {
            dailyRevenue += Number(o.finalAmount) || 0;
          }
          if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
            monthlyRevenue += Number(o.finalAmount) || 0;
          }
        }
      });

      const recentQuotes = [...quotes]
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      const recentOrders = [...orders]
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      return {
        metrics: {
          pendingQuotesCount,
          openOSCount,
          inProductionOSCount,
          readyForPickupOSCount,
          dailyRevenue,
          monthlyRevenue,
          totalClientsCount: clients.length,
        },
        recentQuotes,
        recentOrders,
      };
    }
  },

  // Upload image
  uploadImage: async (imageBase64: string) => {
    try {
      return await request<{ url: string }>("/upload", {
        method: "POST",
        body: JSON.stringify({ imageBase64 }),
      });
    } catch {
      // In fallback mode, use the data URI directly
      return { url: imageBase64 };
    }
  },
};
