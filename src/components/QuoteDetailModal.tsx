import { useState } from "react";
import { Quote, QuoteStatus } from "../types";
import { formatCurrency, formatDate, getQuoteStatusBadge } from "../lib/formatters";
import { PrescriptionViewer } from "./PrescriptionViewer";
import {
  X,
  Printer,
  Share2,
  CheckCircle2,
  XCircle,
  Wrench,
  Glasses,
  Calendar,
  Phone,
  Edit2,
  Clock,
  Sparkles,
} from "lucide-react";

interface QuoteDetailModalProps {
  quote: Quote | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (quote: Quote) => void;
  onUpdateStatus: (id: string, status: QuoteStatus, reason?: string) => Promise<void>;
  onConvertToOS: (quoteId: string) => Promise<void>;
  onNavigateToOS?: (osId: string) => void;
}

export function QuoteDetailModal({
  quote,
  isOpen,
  onClose,
  onEdit,
  onUpdateStatus,
  onConvertToOS,
  onNavigateToOS,
}: QuoteDetailModalProps) {
  if (!isOpen || !quote) return null;

  const badge = getQuoteStatusBadge(quote.status);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleApprove = async () => {
    try {
      setProcessing(true);
      await onUpdateStatus(quote.id, "Aprovado");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setProcessing(true);
      await onUpdateStatus(quote.id, "Recusado", rejectionReason || "Cliente optou por não realizar no momento");
      setRejectModalOpen(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleConvert = async () => {
    try {
      setProcessing(true);
      await onConvertToOS(quote.id);
    } finally {
      setProcessing(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Olá, ${quote.clientName}!\n\nSegue o resumo do seu orçamento na *Ótica Gestão*:\n\n*Orçamento:* ${quote.id}\n*Serviço:* ${quote.serviceType}\n*Armação:* ${quote.frame.brand} ${quote.frame.model} (${quote.frame.color})\n*Lentes:* ${quote.lens.lensType} - ${quote.lens.material}\n*Tratamentos:* ${quote.lens.treatments.join(", ") || "Padrão"}\n\n*Valor Total:* ${formatCurrency(quote.totalAmount)}\n*Condições:* ${quote.suggestedPayment}\n*Validade:* Até ${formatDate(quote.expiresAt)}\n\nFicamos à disposição para confirmar a produção dos seus óculos!`;
    const encoded = encodeURIComponent(text);
    const phoneDigits = quote.clientPhone ? quote.clientPhone.replace(/\D/g, "") : "";
    const url = phoneDigits
      ? `https://wa.me/55${phoneDigits}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Glasses className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base text-slate-900">{quote.id}</span>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Criado em {formatDate(quote.createdAt)} • Validade: {formatDate(quote.expiresAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              title="Imprimir proposta"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors hidden sm:block"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleShareWhatsApp}
              title="Enviar via WhatsApp"
              className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(quote)}
              title="Editar orçamento"
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 printable-area">
          {/* Status Flow Banner */}
          {quote.status === "Aguardando aprovação" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    Aguardando decisão do cliente
                  </h4>
                  <p className="text-[11px] text-amber-700">
                    Você pode registrar a aprovação do cliente ou recusar esta proposta.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={processing}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1 transition-colors"
                  id="btn-approve-quote"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aprovar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(true)}
                  disabled={processing}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors"
                  id="btn-reject-quote"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Recusar</span>
                </button>
              </div>
            </div>
          )}

          {quote.status === "Aprovado" && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">
                    Orçamento aprovado pelo cliente!
                  </h4>
                  <p className="text-[11px] text-emerald-700">
                    Gere a Ordem de Serviço para iniciar a produção e encaminhar ao laboratório.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleConvert}
                disabled={processing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-transform active:scale-95 whitespace-nowrap"
                id="btn-convert-to-os"
              >
                <Wrench className="w-4 h-4" />
                <span>Converter em Ordem de Serviço</span>
              </button>
            </div>
          )}

          {quote.status === "Convertido em OS" && quote.convertedToOSId && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-900 font-semibold">
                  Orçamento já transformado na Ordem de Serviço:{" "}
                  <strong className="font-mono">{quote.convertedToOSId}</strong>
                </span>
              </div>
              {onNavigateToOS && (
                <button
                  type="button"
                  onClick={() => onNavigateToOS(quote.convertedToOSId!)}
                  className="text-xs font-bold text-blue-700 hover:underline"
                >
                  Ver OS →
                </button>
              )}
            </div>
          )}

          {quote.status === "Recusado" && quote.rejectionReason && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800">
              <span className="font-bold">Motivo da Recusa:</span> {quote.rejectionReason}
            </div>
          )}

          {/* Client summary box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Cliente
              </span>
              <h3 className="font-bold text-slate-900 text-sm">{quote.clientName}</h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                {quote.clientPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> {quote.clientPhone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> Emissão: {formatDate(quote.createdAt)}
                </span>
              </div>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Tipo de Serviço
              </span>
              <p className="font-bold text-xs text-blue-800">{quote.serviceType}</p>
              <p className="text-[11px] text-slate-400">Atendente: {quote.createdBy}</p>
            </div>
          </div>

          {/* Optical Prescription Table */}
          <div>
            <PrescriptionViewer
              prescription={quote.prescription}
              photoUrl={quote.prescriptionPhotoUrl}
            />
          </div>

          {/* Frame & Lens Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Frame Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                <Glasses className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Armação Escolhida
                </h4>
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-slate-800 text-sm">
                  {quote.frame.brand || "Marca própria"} {quote.frame.model}
                </p>
                {quote.frame.color && (
                  <p className="text-slate-500">Cor / Acabamento: {quote.frame.color}</p>
                )}
                {quote.frame.code && (
                  <p className="text-slate-500 font-mono">Ref: {quote.frame.code}</p>
                )}
                <p className="pt-2 font-mono font-bold text-sm text-slate-900">
                  {formatCurrency(quote.frame.price)}
                </p>
              </div>
            </div>

            {/* Lens Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Lentes e Tratamentos
                </h4>
              </div>
              <div className="space-y-1.5 text-xs">
                <p className="font-semibold text-slate-800 text-sm">{quote.lens.lensType}</p>
                <p className="text-slate-500">Material: {quote.lens.material}</p>
                {quote.lens.treatments.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {quote.lens.treatments.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <p className="pt-2 font-mono font-bold text-sm text-slate-900">
                  {formatCurrency(quote.lens.price)}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-2 flex-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Condições de Pagamento Propostas
                </h4>
                <p className="text-xs text-slate-700 font-medium">
                  {quote.suggestedPayment || "Conforme negociação no balcão."}
                </p>
                {quote.notes && (
                  <p className="text-[11px] text-slate-500 italic pt-1">
                    Obs: {quote.notes}
                  </p>
                )}
              </div>

              <div className="w-full sm:w-64 space-y-1 text-xs border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
                <div className="flex justify-between text-slate-600">
                  <span>Armação:</span>
                  <span className="font-mono">{formatCurrency(quote.frame.price)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Lentes:</span>
                  <span className="font-mono">{formatCurrency(quote.lens.price)}</span>
                </div>
                {quote.serviceFee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Taxa de serviço:</span>
                    <span className="font-mono">{formatCurrency(quote.serviceFee)}</span>
                  </div>
                )}
                {quote.discount > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Desconto:</span>
                    <span className="font-mono">-{formatCurrency(quote.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-300 font-bold text-base text-slate-900">
                  <span>Total Geral:</span>
                  <span className="font-mono text-blue-900">{formatCurrency(quote.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 rounded-b-2xl">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4 text-emerald-600" />
            <span>Compartilhar WhatsApp</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Fechar
            </button>
            {quote.status === "Aguardando aprovação" && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={processing}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors flex items-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Aprovar Orçamento</span>
              </button>
            )}
            {quote.status === "Aprovado" && (
              <button
                type="button"
                onClick={handleConvert}
                disabled={processing}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Wrench className="w-4 h-4" />
                <span>Converter em OS</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Rejection reason modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Recusar Orçamento</h3>
            <p className="text-xs text-slate-500">
              Informe o motivo da recusa para histórico comercial e melhoria do atendimento:
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ex: Achou o valor acima do esperado, vai pesquisar em outra ótica, comprou pela internet..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Confirmar Recusa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
