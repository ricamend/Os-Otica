import { useState } from "react";
import { ServiceOrder, OSStatus } from "../types";
import { formatCurrency, formatDate, getOSStatusBadge } from "../lib/formatters";
import { PrescriptionViewer } from "./PrescriptionViewer";
import { SignaturePad } from "./SignaturePad";
import {
  X,
  Printer,
  Calendar,
  Phone,
  PenTool,
  CheckCircle2,
  FileText,
  Clock,
  Glasses,
  Sparkles,
  Check,
} from "lucide-react";

interface OrderDetailModalProps {
  order: ServiceOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: OSStatus) => Promise<void>;
  onSaveSignature: (id: string, signature: string) => Promise<void>;
  onNavigateToQuote?: (quoteId: string) => void;
}

const OS_STEPS: OSStatus[] = [
  "Aberta",
  "Em produção",
  "Aguardando peça",
  "Pronta para retirada",
  "Entregue",
];

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onSaveSignature,
  onNavigateToQuote,
}: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  const [isSigning, setIsSigning] = useState(false);
  const [updating, setUpdating] = useState(false);
  const badge = getOSStatusBadge(order.status);

  const handleStatusChange = async (newStatus: OSStatus) => {
    try {
      setUpdating(true);
      await onUpdateStatus(order.id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmSignature = async (sigBase64: string) => {
    try {
      setUpdating(true);
      await onSaveSignature(order.id, sigBase64);
      setIsSigning(false);
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Glasses className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base text-slate-900">{order.id}</span>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-bold ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Abertura: {formatDate(order.createdAt)} • Previsão: <strong>{formatDate(order.deliveryForecast)}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Imprimir Ficha de Laboratório"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors hidden sm:block"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 printable-area">
          {/* READY FOR PICKUP HIGHLIGHT BANNER */}
          {order.status === "Pronta para retirada" && (
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-emerald-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold animate-pulse">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    Óculos prontos para retirada do cliente!
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Ao entregar, colete a assinatura digital na tela para arquivar o comprovante de entrega.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSigning(true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95 whitespace-nowrap"
                id="btn-open-signature-pad"
              >
                <PenTool className="w-4 h-4" />
                <span>Coletar Assinatura & Entregar</span>
              </button>
            </div>
          )}

          {/* Interactive Signature Area */}
          {isSigning && (
            <SignaturePad
              onSave={handleConfirmSignature}
              onCancel={() => setIsSigning(false)}
            />
          )}

          {/* Delivered Certificate Banner */}
          {order.status === "Entregue" && (
            <div className="bg-teal-50/80 border border-teal-300 rounded-2xl p-4 text-xs text-teal-900 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Produto Entregue ao Cliente</span>
                </div>
                <span className="text-slate-500">
                  Data: {formatDate(order.deliveredAt || order.signatureDate)}
                </span>
              </div>

              {order.clientSignature && (
                <div className="mt-2 pt-2 border-t border-teal-200 flex items-center gap-4">
                  <span className="text-[11px] font-semibold text-teal-800">
                    Comprovante de Assinatura do Cliente:
                  </span>
                  <div className="p-1 bg-white border border-teal-200 rounded-lg inline-block">
                    <img
                      src={order.clientSignature}
                      alt="Assinatura do cliente"
                      className="h-12 w-auto max-w-[200px] object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tracking Workflow Stepper */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Fluxo da Ordem de Serviço
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {OS_STEPS.map((s) => {
                const isCurrent = order.status === s;
                return (
                  <button
                    type="button"
                    key={s}
                    disabled={updating}
                    onClick={() => handleStatusChange(s)}
                    className={`px-2 py-2 text-xs rounded-xl font-medium border text-center transition-all ${
                      isCurrent
                        ? "bg-blue-600 text-white border-blue-600 font-bold shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      {isCurrent && <Check className="w-3 h-3 stroke-[3]" />}
                      <span className="truncate">{s}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Client & Origin Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Cliente
              </span>
              <h3 className="font-bold text-slate-900 text-sm">{order.clientName}</h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                {order.clientPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> {order.clientPhone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> Entrega prevista:{" "}
                  <strong>{formatDate(order.deliveryForecast)}</strong>
                </span>
              </div>
            </div>

            <div className="sm:text-right">
              {order.quoteId ? (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Orçamento de Origem
                  </span>
                  <div className="flex items-center gap-1 sm:justify-end">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-mono font-bold text-xs text-blue-700">{order.quoteId}</span>
                  </div>
                  {onNavigateToQuote && (
                    <button
                      type="button"
                      onClick={() => onNavigateToQuote(order.quoteId!)}
                      className="text-[11px] text-blue-600 hover:underline font-semibold"
                    >
                      Ver Proposta Original →
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Origem
                  </span>
                  <p className="text-xs text-slate-600 font-medium">Lançamento Direto / Balcão</p>
                </div>
              )}
            </div>
          </div>

          {/* Optical Prescription Table */}
          <div>
            <PrescriptionViewer
              prescription={order.prescription}
              photoUrl={order.prescriptionPhotoUrl}
            />
          </div>

          {/* Frame & Lens Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Frame Box */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
                <Glasses className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Armação
                </h4>
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-slate-800 text-sm">
                  {order.frame?.brand || "Armação própria"} {order.frame?.model}
                </p>
                {order.frame?.color && (
                  <p className="text-slate-500">Cor / Acabamento: {order.frame.color}</p>
                )}
                {order.frame?.code && (
                  <p className="text-slate-500 font-mono">Ref: {order.frame.code}</p>
                )}
                <p className="pt-1 font-mono font-bold text-xs text-slate-700">
                  {formatCurrency(order.frame?.price)}
                </p>
              </div>
            </div>

            {/* Lens Box */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Lentes & Montagem
                </h4>
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-slate-800 text-sm">
                  {order.lens?.lensType || "Sem troca de lentes"}
                </p>
                <p className="text-slate-500">Material: {order.lens?.material || "-"}</p>
                {order.lens?.treatments && order.lens.treatments.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {order.lens.treatments.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Internal Notes / Instructions for Lab */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Instruções Internas para o Laboratório / Técnico</span>
            </h4>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono whitespace-pre-wrap">
              {order.internalNotes || "Nenhuma instrução especial cadastrada."}
            </p>
          </div>

          {/* Total & Payment Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">
                Valor Final da Ordem de Serviço
              </span>
              <span className="text-xl font-mono font-extrabold text-slate-900">
                {formatCurrency(order.finalAmount)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-500 font-semibold block">
                Status Financeiro
              </span>
              <span
                className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  order.paymentStatus === "Pago"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : order.paymentStatus === "Parcial"
                    ? "bg-blue-50 text-blue-800 border-blue-300"
                    : "bg-amber-50 text-amber-800 border-amber-300"
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 rounded-b-2xl">
          <div className="text-xs text-slate-500">
            Responsável: {order.createdBy}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Fechar
            </button>
            {order.status === "Pronta para retirada" && !order.clientSignature && !isSigning && (
              <button
                type="button"
                onClick={() => setIsSigning(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <PenTool className="w-4 h-4" />
                <span>Assinatura de Entrega</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
