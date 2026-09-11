import express from "express";
import path from "path";
import fs from "fs";

const app = express();

// Set payload limits for images and signatures
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Detect serverless environment (e.g. Vercel)
const isVercel = process.env.VERCEL === "1" || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const DB_FILE = path.join(DATA_DIR, "db.json");

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (e) {
  // Silent catch in read-only environment
}

// Serve uploads statically if local
app.use("/uploads", express.static(UPLOADS_DIR));

// Initial mock & seed database
export interface DatabaseSchema {
  users: Array<{
    id: string;
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "ATENDENTE";
    avatarUrl?: string;
    createdAt: string;
  }>;
  clients: Array<{
    id: string;
    name: string;
    cpf: string;
    phone: string;
    email: string;
    birthDate: string;
    notes: string;
    createdAt: string;
  }>;
  quotes: Array<any>;
  serviceOrders: Array<any>;
  nextQuoteSeq: number;
  nextOSSeq: number;
}

const defaultDb: DatabaseSchema = {
  users: [
    {
      id: "usr_admin",
      name: "Dra. Helena Martins",
      email: "admin@otica.com",
      password: "admin",
      role: "ADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "usr_atendente",
      name: "Lucas Andrade",
      email: "atendente@otica.com",
      password: "123",
      role: "ATENDENTE",
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
        price: 890.00,
      },
      lens: {
        lensType: "Multifocal Digital Premium",
        material: "Alto Índice 1.67",
        treatments: ["Antirreflexo Crizal", "Filtro Luz Azul", "Proteção UV400"],
        price: 1150.00,
      },
      serviceFee: 0,
      discount: 100.00,
      totalAmount: 1940.00,
      suggestedPayment: "À vista no PIX com 5% de desconto (R$ 1.843,00) ou até 10x de R$ 194,00 no cartão",
      notes: "Cliente solicitou bordas polidas na lente e montagem expressa.",
      prescriptionPhotoUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80",
      validityDays: 15,
      expiresAt: new Date(Date.now() + 13 * 24 * 3600 * 1000).toISOString(),
      status: "Aprovado",
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
        price: 780.00,
      },
      lens: {
        lensType: "Solar Polarizada Prizm",
        material: "Plutonite",
        treatments: ["Polarizado", "Espelhado Iridium"],
        price: 420.00,
      },
      serviceFee: 0,
      discount: 50.00,
      totalAmount: 1150.00,
      suggestedPayment: "Em até 6x de R$ 191,66 sem juros",
      notes: "Para uso em corrida e passeios na praia.",
      validityDays: 15,
      expiresAt: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
      status: "Aguardando aprovação",
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
        price: 520.00,
      },
      lens: {
        lensType: "Monofocal Digital para Leitura",
        material: "Resina 1.56",
        treatments: ["Filtro Luz Azul BlueProtect", "Antirrisco"],
        price: 450.00,
      },
      serviceFee: 0,
      discount: 0,
      totalAmount: 970.00,
      suggestedPayment: "Em até 4x de R$ 242,50 sem juros",
      notes: "Aprovado via WhatsApp pelo cliente.",
      validityDays: 15,
      expiresAt: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
      status: "Convertido em OS",
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
        price: 650.00,
      },
      lens: {
        lensType: "Monofocal Digital",
        material: "Policarbonato 1.59",
        treatments: ["Antirreflexo Premium", "Proteção UV400"],
        price: 390.00,
      },
      serviceFee: 0,
      discount: 40.00,
      totalAmount: 1000.00,
      suggestedPayment: "Em até 5x de R$ 200,00 sem juros",
      notes: "Cliente aguardando confirmação do limite no cartão.",
      validityDays: 15,
      expiresAt: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
      status: "Aguardando aprovação",
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
        price: 520.00,
      },
      lens: {
        lensType: "Monofocal para Leitura e Tela",
        material: "Resina 1.56",
        treatments: ["Filtro Luz Azul BlueProtect", "Antirrisco"],
        price: 450.00,
      },
      status: "Pronta para retirada",
      createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      deliveryForecast: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString().split("T")[0],
      finalAmount: 970.00,
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
        price: 890.00,
      },
      lens: {
        lensType: "Multifocal Digital Premium",
        material: "Alto Índice 1.67",
        treatments: ["Antirreflexo Crizal", "Filtro Luz Azul", "Proteção UV400"],
        price: 1150.00,
      },
      status: "Em produção",
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      deliveryForecast: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split("T")[0],
      finalAmount: 1940.00,
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
      status: "Aberta",
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      deliveryForecast: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split("T")[0],
      finalAmount: 120.00,
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
      status: "Entregue",
      createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
      deliveryForecast: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString().split("T")[0],
      deliveredAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      finalAmount: 85.00,
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

let memoryDb: DatabaseSchema | null = null;

function readDb(): DatabaseSchema {
  if (memoryDb) return memoryDb;
  try {
    if (!fs.existsSync(DB_FILE)) {
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), "utf-8");
      } catch (e) {
        // Ignored
      }
      memoryDb = JSON.parse(JSON.stringify(defaultDb));
      return memoryDb;
    }
    const content = fs.readFileSync(DB_FILE, "utf-8");
    memoryDb = JSON.parse(content);
    return memoryDb;
  } catch (err) {
    memoryDb = JSON.parse(JSON.stringify(defaultDb));
    return memoryDb;
  }
}

function saveDb(data: DatabaseSchema): void {
  memoryDb = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing to database file, kept in-memory:", err);
  }
}

// Preload database
readDb();

// ================= API ROUTER =================
// Defining routes on a router mounted on BOTH "/api" and "/"
// guarantees that Vercel rewrites and standard Express dev servers both resolve routes properly!
const apiRouter = express.Router();

// Health check
apiRouter.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth Routes
apiRouter.post("/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPassword = String(password || "").trim();
  const db = readDb();
  const user = db.users.find((u) => (u.email || "").trim().toLowerCase() === cleanEmail);

  if (!user || (user.password || "").trim() !== cleanPassword) {
    return res.status(401).json({ message: "E-mail ou senha incorretos." });
  }

  // Return user without password
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, token: `fake-jwt-token-${user.id}` });
});

apiRouter.post("/auth/register", (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Nome, e-mail e senha são obrigatórios." });
  }

  const db = readDb();
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ message: "Já existe um usuário cadastrado com este e-mail." });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    name,
    email,
    password,
    role: role === "ADMIN" ? ("ADMIN" as const) : ("ATENDENTE" as const),
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDb(db);

  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser, message: "Usuário cadastrado com sucesso." });
});

apiRouter.get("/auth/users", (req, res) => {
  const db = readDb();
  const safeUsers = db.users.map(({ password, ...u }) => u);
  res.json(safeUsers);
});

// Clients Routes
apiRouter.get("/clients", (req, res) => {
  const { q } = req.query;
  const db = readDb();
  let list = db.clients;

  if (q && typeof q === "string") {
    const query = q.toLowerCase().trim();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.cpf.includes(query) ||
        c.phone.includes(query) ||
        c.email.toLowerCase().includes(query)
    );
  }

  res.json(list);
});

apiRouter.get("/clients/:id", (req, res) => {
  const db = readDb();
  const client = db.clients.find((c) => c.id === req.params.id);
  if (!client) {
    return res.status(404).json({ message: "Cliente não encontrado." });
  }
  res.json(client);
});

apiRouter.post("/clients", (req, res) => {
  const { name, cpf, phone, email, birthDate, notes } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ message: "Nome e telefone do cliente são obrigatórios." });
  }

  const db = readDb();
  const newClient = {
    id: `cli_${Date.now()}`,
    name: name.trim(),
    cpf: (cpf || "").trim(),
    phone: (phone || "").trim(),
    email: (email || "").trim(),
    birthDate: birthDate || "",
    notes: notes || "",
    createdAt: new Date().toISOString(),
  };

  db.clients.unshift(newClient);
  saveDb(db);

  res.status(201).json(newClient);
});

apiRouter.put("/clients/:id", (req, res) => {
  const db = readDb();
  const index = db.clients.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Cliente não encontrado." });
  }

  const existing = db.clients[index];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    createdAt: existing.createdAt,
  };

  db.clients[index] = updated;

  // Also update clientName in quotes and serviceOrders if name changed
  if (req.body.name && req.body.name !== existing.name) {
    db.quotes.forEach((q) => {
      if (q.clientId === existing.id) q.clientName = req.body.name;
    });
    db.serviceOrders.forEach((o) => {
      if (o.clientId === existing.id) o.clientName = req.body.name;
    });
  }

  saveDb(db);
  res.json(updated);
});

apiRouter.delete("/clients/:id", (req, res) => {
  const db = readDb();
  const client = db.clients.find((c) => c.id === req.params.id);
  if (!client) {
    return res.status(404).json({ message: "Cliente não encontrado." });
  }

  db.clients = db.clients.filter((c) => c.id !== req.params.id);
  saveDb(db);
  res.json({ success: true, message: "Cliente removido com sucesso." });
});

apiRouter.get("/clients/:id/history", (req, res) => {
  const db = readDb();
  const quotes = db.quotes.filter((q) => q.clientId === req.params.id);
  const orders = db.serviceOrders.filter((o) => o.clientId === req.params.id);
  res.json({ quotes, orders });
});

// Quotes Routes
apiRouter.get("/quotes", (req, res) => {
  const { status, clientId, search } = req.query;
  const db = readDb();
  let list = db.quotes;

  if (status && typeof status === "string" && status !== "todos") {
    list = list.filter((q) => q.status === status);
  }

  if (clientId && typeof clientId === "string") {
    list = list.filter((q) => q.clientId === clientId);
  }

  if (search && typeof search === "string") {
    const s = search.toLowerCase().trim();
    list = list.filter(
      (q) =>
        q.id.toLowerCase().includes(s) ||
        q.clientName.toLowerCase().includes(s) ||
        (q.frame && q.frame.brand.toLowerCase().includes(s))
    );
  }

  // Sort descending by creation
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(list);
});

apiRouter.get("/quotes/:id", (req, res) => {
  const db = readDb();
  const quote = db.quotes.find((q) => q.id === req.params.id);
  if (!quote) {
    return res.status(404).json({ message: "Orçamento não encontrado." });
  }
  res.json(quote);
});

apiRouter.post("/quotes", (req, res) => {
  const db = readDb();
  const year = new Date().getFullYear();
  const seqStr = String(db.nextQuoteSeq || 1).padStart(4, "0");
  const quoteId = `ORC-${year}-${seqStr}`;
  db.nextQuoteSeq = (db.nextQuoteSeq || 1) + 1;

  const validityDays = Number(req.body.validityDays) || 15;
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + validityDays * 24 * 3600 * 1000).toISOString();

  const newQuote = {
    ...req.body,
    id: quoteId,
    createdAt,
    expiresAt,
    validityDays,
    status: req.body.status || "Aguardando aprovação",
  };

  db.quotes.unshift(newQuote);
  saveDb(db);

  res.status(201).json(newQuote);
});

apiRouter.put("/quotes/:id", (req, res) => {
  const db = readDb();
  const index = db.quotes.findIndex((q) => q.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Orçamento não encontrado." });
  }

  const existing = db.quotes[index];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    createdAt: existing.createdAt,
  };

  db.quotes[index] = updated;
  saveDb(db);
  res.json(updated);
});

apiRouter.patch("/quotes/:id/status", (req, res) => {
  const { status, rejectionReason } = req.body;
  const db = readDb();
  const quote = db.quotes.find((q) => q.id === req.params.id);
  if (!quote) {
    return res.status(404).json({ message: "Orçamento não encontrado." });
  }

  quote.status = status;
  if (rejectionReason !== undefined) {
    quote.rejectionReason = rejectionReason;
  }

  saveDb(db);
  res.json(quote);
});

// Convert Quote into Service Order
apiRouter.post("/quotes/:id/convert-to-os", (req, res) => {
  const db = readDb();
  const quote = db.quotes.find((q) => q.id === req.params.id);
  if (!quote) {
    return res.status(404).json({ message: "Orçamento não encontrado." });
  }

  const year = new Date().getFullYear();
  const seqStr = String(db.nextOSSeq || 1).padStart(4, "0");
  const osId = `OS-${year}-${seqStr}`;
  db.nextOSSeq = (db.nextOSSeq || 1) + 1;

  // Forecast 5 business days by default
  const forecastDate = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split("T")[0];

  const newOS = {
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
    deliveryForecast: req.body.deliveryForecast || forecastDate,
    finalAmount: quote.totalAmount,
    paymentStatus: "Pendente",
    internalNotes: req.body.internalNotes || `Gerado a partir do orçamento ${quote.id}. ${quote.notes || ""}`.trim(),
    prescriptionPhotoUrl: quote.prescriptionPhotoUrl,
    createdBy: req.body.createdBy || quote.createdBy || "Atendente",
  };

  // Update quote status
  quote.status = "Convertido em OS";
  quote.convertedToOSId = osId;

  db.serviceOrders.unshift(newOS);
  saveDb(db);

  res.status(201).json({ serviceOrder: newOS, quote });
});

apiRouter.delete("/quotes/:id", (req, res) => {
  const db = readDb();
  const quote = db.quotes.find((q) => q.id === req.params.id);
  if (!quote) {
    return res.status(404).json({ message: "Orçamento não encontrado." });
  }

  db.quotes = db.quotes.filter((q) => q.id !== req.params.id);
  saveDb(db);
  res.json({ success: true, message: "Orçamento excluído com sucesso." });
});

// Service Orders (OS) Routes
apiRouter.get("/orders", (req, res) => {
  const { status, clientId, search } = req.query;
  const db = readDb();
  let list = db.serviceOrders;

  if (status && typeof status === "string" && status !== "todos") {
    list = list.filter((o) => o.status === status);
  }

  if (clientId && typeof clientId === "string") {
    list = list.filter((o) => o.clientId === clientId);
  }

  if (search && typeof search === "string") {
    const s = search.toLowerCase().trim();
    list = list.filter(
      (o) =>
        o.id.toLowerCase().includes(s) ||
        o.clientName.toLowerCase().includes(s) ||
        (o.quoteId && o.quoteId.toLowerCase().includes(s)) ||
        (o.frame && o.frame.brand.toLowerCase().includes(s))
    );
  }

  // Sort descending by creation
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(list);
});

apiRouter.get("/orders/:id", (req, res) => {
  const db = readDb();
  const order = db.serviceOrders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Ordem de Serviço não encontrada." });
  }
  res.json(order);
});

apiRouter.post("/orders", (req, res) => {
  const db = readDb();
  const year = new Date().getFullYear();
  const seqStr = String(db.nextOSSeq || 1).padStart(4, "0");
  const osId = `OS-${year}-${seqStr}`;
  db.nextOSSeq = (db.nextOSSeq || 1) + 1;

  const newOrder = {
    ...req.body,
    id: osId,
    createdAt: new Date().toISOString(),
    status: req.body.status || "Aberta",
    paymentStatus: req.body.paymentStatus || "Pendente",
  };

  db.serviceOrders.unshift(newOrder);
  saveDb(db);

  res.status(201).json(newOrder);
});

apiRouter.put("/orders/:id", (req, res) => {
  const db = readDb();
  const index = db.serviceOrders.findIndex((o) => o.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Ordem de Serviço não encontrada." });
  }

  const existing = db.serviceOrders[index];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    createdAt: existing.createdAt,
  };

  db.serviceOrders[index] = updated;
  saveDb(db);
  res.json(updated);
});

apiRouter.patch("/orders/:id/status", (req, res) => {
  const { status } = req.body;
  const db = readDb();
  const order = db.serviceOrders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Ordem de Serviço não encontrada." });
  }

  order.status = status;
  if (status === "Entregue" && !order.deliveredAt) {
    order.deliveredAt = new Date().toISOString();
  }

  saveDb(db);
  res.json(order);
});

// Client Signature at Pickup
apiRouter.post("/orders/:id/signature", (req, res) => {
  const { signature } = req.body;
  if (!signature) {
    return res.status(400).json({ message: "Assinatura é obrigatória." });
  }

  const db = readDb();
  const order = db.serviceOrders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Ordem de Serviço não encontrada." });
  }

  order.clientSignature = signature;
  order.signatureDate = new Date().toISOString();
  order.status = "Entregue";
  order.deliveredAt = new Date().toISOString();

  saveDb(db);
  res.json({ success: true, order });
});

apiRouter.delete("/orders/:id", (req, res) => {
  const db = readDb();
  const order = db.serviceOrders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Ordem de Serviço não encontrada." });
  }

  db.serviceOrders = db.serviceOrders.filter((o) => o.id !== req.params.id);
  saveDb(db);
  res.json({ success: true, message: "Ordem de Serviço excluída com sucesso." });
});

// Upload image handler
apiRouter.post("/upload", (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ message: "Imagem não fornecida." });
    }

    // If serverless, return base64 data URI directly so it's guaranteed never to 404
    if (isVercel) {
      return res.json({ url: imageBase64 });
    }

    const matches = imageBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      const ext = "png";
      const name = `upload_${Date.now()}.${ext}`;
      const filePath = path.join(UPLOADS_DIR, name);
      const buffer = Buffer.from(imageBase64, "base64");
      fs.writeFileSync(filePath, buffer);
      return res.json({ url: `/uploads/${name}` });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const ext = mimeType.split("/")[1] || "png";
    const name = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, name);

    fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
    res.json({ url: `/uploads/${name}` });
  } catch (err) {
    console.error("Upload error:", err);
    // Graceful fallback to data URI
    if (req.body?.imageBase64) {
      return res.json({ url: req.body.imageBase64 });
    }
    res.status(500).json({ message: "Falha ao salvar a imagem." });
  }
});

// Dashboard metrics
apiRouter.get("/dashboard", (req, res) => {
  const db = readDb();
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const pendingQuotesCount = db.quotes.filter(
    (q) => q.status === "Aguardando aprovação"
  ).length;

  const openOSCount = db.serviceOrders.filter((o) => o.status === "Aberta").length;
  const inProductionOSCount = db.serviceOrders.filter((o) => o.status === "Em produção").length;
  const readyForPickupOSCount = db.serviceOrders.filter((o) => o.status === "Pronta para retirada").length;

  let dailyRevenue = 0;
  let monthlyRevenue = 0;

  db.serviceOrders.forEach((o) => {
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

  const recentQuotes = [...db.quotes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentOrders = [...db.serviceOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  res.json({
    metrics: {
      pendingQuotesCount,
      openOSCount,
      inProductionOSCount,
      readyForPickupOSCount,
      dailyRevenue,
      monthlyRevenue,
      totalClientsCount: db.clients.length,
    },
    recentQuotes,
    recentOrders,
  });
});

// Mount router on BOTH "/api" and "/"
app.use("/api", apiRouter);
app.use("/", apiRouter);

export default app;
