import { QuoteStatus, OSStatus } from "../types";

export function formatCurrency(value: number | string | undefined | null): string {
  const num = typeof value === "string" ? parseFloat(value) : Number(value || 0);
  if (isNaN(num)) return "R$ 0,00";
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function getQuoteStatusBadge(status: QuoteStatus): {
  bg: string;
  text: string;
  border: string;
  label: string;
  isAlert?: boolean;
} {
  switch (status) {
    case "Aguardando aprovação":
      return {
        bg: "bg-amber-50 text-amber-800 border-amber-300",
        text: "text-amber-800",
        border: "border-amber-300",
        label: "Aguardando aprovação",
        isAlert: true,
      };
    case "Aprovado":
      return {
        bg: "bg-emerald-50 text-emerald-800 border-emerald-300",
        text: "text-emerald-800",
        border: "border-emerald-300",
        label: "Aprovado",
      };
    case "Convertido em OS":
      return {
        bg: "bg-blue-50 text-blue-800 border-blue-300",
        text: "text-blue-800",
        border: "border-blue-300",
        label: "Convertido em OS",
      };
    case "Recusado":
      return {
        bg: "bg-rose-50 text-rose-800 border-rose-300",
        text: "text-rose-800",
        border: "border-rose-300",
        label: "Recusado",
      };
    case "Expirado":
      return {
        bg: "bg-slate-100 text-slate-700 border-slate-300",
        text: "text-slate-700",
        border: "border-slate-300",
        label: "Expirado",
      };
    case "Rascunho":
    default:
      return {
        bg: "bg-slate-100 text-slate-700 border-slate-300",
        text: "text-slate-700",
        border: "border-slate-300",
        label: "Rascunho",
      };
  }
}

export function getOSStatusBadge(status: OSStatus): {
  bg: string;
  text: string;
  border: string;
  label: string;
  isReadyAlert?: boolean;
} {
  switch (status) {
    case "Pronta para retirada":
      return {
        bg: "bg-emerald-100 text-emerald-900 border-emerald-400 ring-2 ring-emerald-500/20 font-bold",
        text: "text-emerald-900",
        border: "border-emerald-400",
        label: "Pronta para retirada",
        isReadyAlert: true,
      };
    case "Em produção":
      return {
        bg: "bg-sky-50 text-sky-800 border-sky-300",
        text: "text-sky-800",
        border: "border-sky-300",
        label: "Em produção",
      };
    case "Aguardando peça":
      return {
        bg: "bg-amber-50 text-amber-800 border-amber-300",
        text: "text-amber-800",
        border: "border-amber-300",
        label: "Aguardando peça",
      };
    case "Aberta":
      return {
        bg: "bg-indigo-50 text-indigo-800 border-indigo-300",
        text: "text-indigo-800",
        border: "border-indigo-300",
        label: "Aberta",
      };
    case "Entregue":
      return {
        bg: "bg-teal-50 text-teal-800 border-teal-300",
        text: "text-teal-800",
        border: "border-teal-300",
        label: "Entregue",
      };
    case "Cancelada":
      return {
        bg: "bg-rose-50 text-rose-800 border-rose-300",
        text: "text-rose-800",
        border: "border-rose-300",
        label: "Cancelada",
      };
    default:
      return {
        bg: "bg-slate-100 text-slate-700 border-slate-300",
        text: "text-slate-700",
        border: "border-slate-300",
        label: status,
      };
  }
}
