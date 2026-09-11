export type UserRole = 'ADMIN' | 'ATENDENTE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  birthDate: string;
  notes: string;
  createdAt: string;
}

export interface EyePrescription {
  spherical: string;     // Esférico (ex: -2.00)
  cylindrical: string;   // Cilíndrico (ex: -0.75)
  axis: string;          // Eixo (ex: 180)
  pd: string;            // DNP / DP (ex: 31)
  addition: string;      // Adição (ex: +2.00)
}

export interface OpticalPrescription {
  od: EyePrescription; // Olho Direito
  oe: EyePrescription; // Olho Esquerdo
  doctorName?: string;
  prescriptionDate?: string;
}

export interface OpticalFrame {
  brand: string;
  model: string;
  color: string;
  code: string;
  price: number;
}

export interface OpticalLens {
  lensType: string; // ex: Monofocal, Multifocal, Bifocal, Solar com Grau
  material: string; // ex: Resina 1.56, Policarbonato, Alto Índice 1.67
  treatments: string[]; // Antirreflexo, Blue Light, Transitions, etc.
  price: number;
}

export type QuoteStatus = 
  | 'Rascunho'
  | 'Aguardando aprovação'
  | 'Aprovado'
  | 'Recusado'
  | 'Convertido em OS'
  | 'Expirado';

export type ServiceType = 
  | 'Óculos de grau'
  | 'Óculos de sol'
  | 'Lentes de contato'
  | 'Ajuste'
  | 'Conserto';

export interface Quote {
  id: string; // e.g. "ORC-2026-0001"
  clientId: string;
  clientName: string;
  clientPhone?: string;
  createdAt: string;
  serviceType: ServiceType;
  prescription: OpticalPrescription;
  frame: OpticalFrame;
  lens: OpticalLens;
  serviceFee: number;
  discount: number;
  totalAmount: number;
  suggestedPayment: string;
  notes: string;
  prescriptionPhotoUrl?: string;
  validityDays: number;
  expiresAt: string;
  status: QuoteStatus;
  rejectionReason?: string;
  convertedToOSId?: string;
  createdBy: string;
}

export type OSStatus = 
  | 'Aberta'
  | 'Em produção'
  | 'Aguardando peça'
  | 'Pronta para retirada'
  | 'Entregue'
  | 'Cancelada';

export interface ServiceOrder {
  id: string; // e.g. "OS-2026-0001"
  clientId: string;
  clientName: string;
  clientPhone?: string;
  quoteId?: string; // Orçamento de origem se houver
  serviceType: ServiceType | string;
  prescription: OpticalPrescription;
  frame: OpticalFrame;
  lens: OpticalLens;
  status: OSStatus;
  createdAt: string;
  deliveryForecast: string; // Previsão de entrega
  deliveredAt?: string;
  finalAmount: number;
  paymentStatus: 'Pendente' | 'Parcial' | 'Pago';
  internalNotes: string; // Instruções para o laboratório / observações internas
  prescriptionPhotoUrl?: string;
  clientSignature?: string; // Base64 canvas dataURL de entrega
  signatureDate?: string;
  createdBy: string;
}

export interface DashboardMetrics {
  pendingQuotesCount: number;
  openOSCount: number;
  inProductionOSCount: number;
  readyForPickupOSCount: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  totalClientsCount: number;
}
