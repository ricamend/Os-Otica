import React, { useState, useEffect } from "react";
import { Client, OpticalPrescription, Quote, ServiceType, QuoteStatus } from "../types";
import { formatCurrency } from "../lib/formatters";
import {
  X,
  Eye,
  Glasses,
  Upload,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Check,
  AlertCircle,
} from "lucide-react";

interface QuoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quoteData: Partial<Quote>) => Promise<void>;
  clients: Client[];
  editingQuote?: Quote | null;
  initialClient?: Client | null;
  currentUser: any;
  onQuickCreateClient?: () => void;
}

const COMMON_TREATMENTS = [
  "Antirreflexo Tradicional",
  "Antirreflexo Premium (Crizal / Zeiss)",
  "Filtro Luz Azul (Blue Light)",
  "Fotossensível (Transitions)",
  "Proteção UV400",
  "Camada Antirrisco Resistente",
  "Tratamento Hidrorrepelente",
  "Lente Polarizada",
];

export function QuoteFormModal({
  isOpen,
  onClose,
  onSave,
  clients,
  editingQuote,
  initialClient,
  currentUser,
}: QuoteFormModalProps) {
  if (!isOpen) return null;

  // Selected client
  const [clientId, setClientId] = useState(
    editingQuote?.clientId || initialClient?.id || (clients[0]?.id || "")
  );

  // General fields
  const [serviceType, setServiceType] = useState<ServiceType>(
    editingQuote?.serviceType || "Óculos de grau"
  );
  const [status, setStatus] = useState<QuoteStatus>(
    editingQuote?.status || "Aguardando aprovação"
  );
  const [validityDays, setValidityDays] = useState(editingQuote?.validityDays || 15);
  const [suggestedPayment, setSuggestedPayment] = useState(
    editingQuote?.suggestedPayment || "À vista no PIX com 5% de desconto ou até 10x sem juros"
  );
  const [notes, setNotes] = useState(editingQuote?.notes || "");

  // Prescription fields
  const [prescription, setPrescription] = useState<OpticalPrescription>(
    editingQuote?.prescription || {
      od: { spherical: "", cylindrical: "", axis: "", pd: "", addition: "" },
      oe: { spherical: "", cylindrical: "", axis: "", pd: "", addition: "" },
      doctorName: "",
      prescriptionDate: new Date().toISOString().split("T")[0],
    }
  );

  // Frame fields
  const [frameBrand, setFrameBrand] = useState(editingQuote?.frame?.brand || "");
  const [frameModel, setFrameModel] = useState(editingQuote?.frame?.model || "");
  const [frameColor, setFrameColor] = useState(editingQuote?.frame?.color || "");
  const [frameCode, setFrameCode] = useState(editingQuote?.frame?.code || "");
  const [framePrice, setFramePrice] = useState<number>(editingQuote?.frame?.price || 0);

  // Lens fields
  const [lensType, setLensType] = useState(editingQuote?.lens?.lensType || "Monofocal Digital");
  const [lensMaterial, setLensMaterial] = useState(editingQuote?.lens?.material || "Resina 1.56");
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>(
    editingQuote?.lens?.treatments || ["Antirreflexo Premium (Crizal / Zeiss)", "Proteção UV400"]
  );
  const [lensPrice, setLensPrice] = useState<number>(editingQuote?.lens?.price || 0);

  // Service fee and discount
  const [serviceFee, setServiceFee] = useState<number>(editingQuote?.serviceFee || 0);
  const [discount, setDiscount] = useState<number>(editingQuote?.discount || 0);

  // Photo
  const [prescriptionPhotoUrl, setPrescriptionPhotoUrl] = useState(
    editingQuote?.prescriptionPhotoUrl || ""
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Computed total
  const calculatedTotal = Math.max(0, Number(framePrice || 0) + Number(lensPrice || 0) + Number(serviceFee || 0) - Number(discount || 0));

  useEffect(() => {
    if (initialClient && !editingQuote) {
      setClientId(initialClient.id);
    }
  }, [initialClient, editingQuote]);

  const toggleTreatment = (treatment: string) => {
    setSelectedTreatments((prev) =>
      prev.includes(treatment) ? prev.filter((t) => t !== treatment) : [...prev, treatment]
    );
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        // Upload to server
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, filename: file.name }),
        });
        if (res.ok) {
          const data = await res.json();
          setPrescriptionPhotoUrl(data.url);
        } else {
          // Fallback to dataURL directly
          setPrescriptionPhotoUrl(base64);
        }
      } catch (err) {
        console.error(err);
        setPrescriptionPhotoUrl(reader.result as string);
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError("Por favor selecione um cliente.");
      return;
    }

    const selectedClient = clients.find((c) => c.id === clientId);
    if (!selectedClient) {
      setError("Cliente selecionado inválido.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload: Partial<Quote> = {
        id: editingQuote?.id,
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        clientPhone: selectedClient.phone,
        serviceType,
        status,
        validityDays: Number(validityDays) || 15,
        suggestedPayment,
        notes,
        prescription,
        frame: {
          brand: frameBrand,
          model: frameModel,
          color: frameColor,
          code: frameCode,
          price: Number(framePrice) || 0,
        },
        lens: {
          lensType,
          material: lensMaterial,
          treatments: selectedTreatments,
          price: Number(lensPrice) || 0,
        },
        serviceFee: Number(serviceFee) || 0,
        discount: Number(discount) || 0,
        totalAmount: calculatedTotal,
        prescriptionPhotoUrl,
        createdBy: editingQuote?.createdBy || currentUser?.name || "Atendente",
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar orçamento.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {editingQuote ? `Editar ${editingQuote.id}` : "Novo Orçamento Óptico"}
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Proposta Comercial & Especificação Técnica
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-5 mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Section 1: Cliente e Serviço */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
              <Glasses className="w-4 h-4 text-blue-600" />
              <span>Dados Gerais</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cliente *
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  id="quote-select-client"
                >
                  <option value="" disabled>Selecione um cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.cpf ? `(${c.cpf})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Serviço *
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as ServiceType)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  id="quote-select-service-type"
                >
                  <option value="Óculos de grau">Óculos de grau</option>
                  <option value="Óculos de sol">Óculos de sol</option>
                  <option value="Lentes de contato">Lentes de contato</option>
                  <option value="Ajuste">Ajuste de armação</option>
                  <option value="Conserto">Conserto / Solda</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Inicial
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Aguardando aprovação">Aguardando aprovação do cliente</option>
                  <option value="Rascunho">Rascunho</option>
                  <option value="Aprovado">Aprovado pelo cliente</option>
                  <option value="Recusado">Recusado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Validade da Proposta (dias)
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={validityDays}
                  onChange={(e) => setValidityDays(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Receita / Grau Oftalmológico */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>Receita Oftalmológica (Grau OD e OE)</span>
              </h3>
            </div>

            {/* Doctor & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Médico Oftalmologista / Optometrista
                </label>
                <input
                  type="text"
                  value={prescription.doctorName || ""}
                  onChange={(e) =>
                    setPrescription({ ...prescription, doctorName: e.target.value })
                  }
                  placeholder="Ex: Dr. Roberto Guimarães (CRM 12345)"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Data da Receita
                </label>
                <input
                  type="date"
                  value={prescription.prescriptionDate || ""}
                  onChange={(e) =>
                    setPrescription({ ...prescription, prescriptionDate: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Optical Grid Table Inputs */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-center">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2 text-left w-20">Olho</th>
                    <th className="py-2 px-1">Esférico</th>
                    <th className="py-2 px-1">Cilíndrico</th>
                    <th className="py-2 px-1">Eixo (°)</th>
                    <th className="py-2 px-1">DNP (mm)</th>
                    <th className="py-2 px-1">Adição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* Olho Direito (OD) */}
                  <tr>
                    <td className="py-2 px-2 font-bold text-slate-800 text-left bg-slate-50/50">
                      OD <span className="text-[10px] font-normal text-slate-400 block">Direito</span>
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="-2.00"
                        value={prescription.od.spherical}
                        onChange={(e) =>
                          setPrescription({
                            ...prescription,
                            od: { ...prescription.od, spherical: e.target.value },
                          })
                        }
                        className="w-full py-1 text-center font-mono text-xs border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="-0.75"
                        value={prescription.od.cylindrical}
                        onChange={(e) =>
                          setPrescription({
                            ...prescription,
                            od: { ...prescription.od, cylindrical: e.target.value },
                          })
                        }
                        className="w-full py-1 text-center font-mono text-xs border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="180"
                        value={prescription.od.axis}
                        onChange={(e) =>
                          setPrescription({
                            ...prescription,
                            od: { ...prescription.od, axis: e.target.value },
                          })
                        }
                        className="w-full py-1 text-center font-mono text-xs border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="31"
                        value={prescription.od.pd}
                        onChange={(e) =>
                          setPrescription({
                            ...prescription,
                            od: { ...prescription.od, pd: e.target.value },
                          })
                        }
                        className="w-full py-1 text-center font-mono text-xs border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="+2.00"
                        value={prescription.od.addition}
                        onChange={(e) =>
                          setPrescription({
                            ...prescription,
                            od: { ...prescription.od, addition: e.target.value },
                          })
                        }
                        className="w-full py-1 text-center font-mono text-xs border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                  </tr>

                  {/* Olho Esquerdo (OE) */}
                  <tr>
                    <td className="py-2 px-2 font-bold text-slate-800 text-left bg-slate-50/50">
                      OE <span className="text-[10px] font-normal text-slate-400 block">Esquerdo</span>
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="-2.00"
                        value={prescription.oe.spherical}
                        onChange={(e) =>
                          setPrescription({
                            ...prescription,
                            oe: { ...prescription.oe, spherical: e.target.value },
                          })
                        }
                        className="w-full py-1 text-center font-mono text-xs border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="-0.50"
                        value={prescription.oe.cylindrical}
                        onChange={(e) =>
                          setPrescription({
                            ...prescription,
                            oe: { ...prescription.oe, cylindrical: e.target.value },
                          })
                        }
                        className="w-full py-1 text-center font-mono text-xs border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="175"
                        value={prescription.oe.axis}
                        onChange={(e) =>
                          setPrescription({
                            ...prescription,
                            oe: { ...prescription.oe, axis: e.target.value },
                          })
                        }
                        className="w-full py-1 text-center font-mono text-xs border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="31"
                        value={prescription.oe.pd}
                        onChange={(e) =>
                          setPrescription({
                            ...prescription,
                            oe: { ...prescription.oe, pd: e.target.value },
                          })
                        }
                        className="w-full py-1 text-center font-mono text-xs border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="+2.00"
                        value={prescription.oe.addition}
                        onChange={(e) =>
                          setPrescription({
                            ...prescription,
                            oe: { ...prescription.oe, addition: e.target.value },
                          })
                        }
                        className="w-full py-1 text-center font-mono text-xs border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Prescription Photo Upload */}
            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-600" />
                <span>Foto ou Anexo da Receita Médica (Upload)</span>
              </label>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? "Enviando..." : "Selecionar Foto / Câmera"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageFile}
                    className="hidden"
                  />
                </label>

                {prescriptionPhotoUrl && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>Imagem anexada com sucesso</span>
                    <a
                      href={prescriptionPhotoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-bold underline ml-1"
                    >
                      Ver
                    </a>
                    <button
                      type="button"
                      onClick={() => setPrescriptionPhotoUrl("")}
                      className="text-slate-400 hover:text-rose-600 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Armação */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
              <Glasses className="w-4 h-4 text-blue-600" />
              <span>Especificação da Armação</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Marca da Armação
                </label>
                <input
                  type="text"
                  placeholder="Ex: Ray-Ban, Oakley, Vogue..."
                  value={frameBrand}
                  onChange={(e) => setFrameBrand(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Modelo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Clubmaster RB3016"
                  value={frameModel}
                  onChange={(e) => setFrameModel(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cor
                </label>
                <input
                  type="text"
                  placeholder="Ex: Tartaruga / Dourado"
                  value={frameColor}
                  onChange={(e) => setFrameColor(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Código de Referência
                </label>
                <input
                  type="text"
                  placeholder="Ex: RB3016-W0365-51"
                  value={frameCode}
                  onChange={(e) => setFrameCode(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor da Armação (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={framePrice}
                  onChange={(e) => setFramePrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-xs bg-white font-mono font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Lentes e Tratamentos */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Lentes e Tratamentos</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Lente
                </label>
                <select
                  value={lensType}
                  onChange={(e) => setLensType(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Monofocal Digital">Monofocal Digital (Longe ou Perto)</option>
                  <option value="Multifocal / Progressiva">Multifocal / Progressiva Digital</option>
                  <option value="Bifocal">Bifocal</option>
                  <option value="Solar com Grau Polarizada">Solar com Grau Polarizada</option>
                  <option value="Ocupacional / Intermediária">Ocupacional (Desktop / Leitura)</option>
                  <option value="Sem troca de lentes">Apenas Ajuste / Sem troca</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Material / Índice
                </label>
                <select
                  value={lensMaterial}
                  onChange={(e) => setLensMaterial(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Resina 1.56">Resina CR-39 / 1.56</option>
                  <option value="Policarbonato 1.59 (Airwear)">Policarbonato 1.59 (Resistente)</option>
                  <option value="Trivex 1.53">Trivex 1.53 (Ultra-leve)</option>
                  <option value="Alto Índice 1.67">Alto Índice 1.67 (Mais fina)</option>
                  <option value="Super Alto Índice 1.74">Super Alto Índice 1.74 (Graus altos)</option>
                  <option value="Cristal / Vidro">Cristal Mineral</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor das Lentes (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={lensPrice}
                  onChange={(e) => setLensPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Tratamentos Badges */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                Tratamentos Inclusos na Lente:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_TREATMENTS.map((treatment) => {
                  const active = selectedTreatments.includes(treatment);
                  return (
                    <button
                      type="button"
                      key={treatment}
                      onClick={() => toggleTreatment(treatment)}
                      className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all flex items-center gap-1 ${
                        active
                          ? "bg-blue-600 text-white border-blue-600 font-semibold shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {active && <Check className="w-3 h-3 stroke-[2.5]" />}
                      <span>{treatment}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 5: Valores e Forma de Pagamento */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Fechamento de Valores & Pagamento
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="block text-[11px] text-slate-500">Armação:</span>
                <span className="font-mono font-semibold text-xs text-slate-700">
                  {formatCurrency(framePrice)}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500">Lentes:</span>
                <span className="font-mono font-semibold text-xs text-slate-700">
                  {formatCurrency(lensPrice)}
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                  Taxa de Montagem / Serviço
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={serviceFee}
                  onChange={(e) => setServiceFee(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-xs font-mono border border-slate-300 rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                  Desconto Comercial (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-xs font-mono text-rose-600 font-bold border border-slate-300 rounded focus:outline-none"
                />
              </div>
            </div>

            {/* Total Highlight Bar */}
            <div className="p-3 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] text-blue-200 uppercase tracking-wider font-semibold block">
                  Valor Total do Orçamento
                </span>
                <span className="text-2xl font-extrabold font-mono tracking-tight text-white">
                  {formatCurrency(calculatedTotal)}
                </span>
              </div>
              <div className="text-right text-xs text-blue-200">
                <span>Válido por {validityDays} dias</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Condições / Forma de Pagamento Sugerida
              </label>
              <input
                type="text"
                value={suggestedPayment}
                onChange={(e) => setSuggestedPayment(e.target.value)}
                placeholder="Ex: À vista no PIX com 5% de desconto (R$ ...) ou 10x sem juros no cartão"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações Adicionais para a Proposta
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Montagem expressa inclusa, garantia de 1 ano nas lentes contra quebras e riscos, estojo e flanela inclusos..."
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              id="btn-save-quote"
            >
              {saving ? "Salvando..." : editingQuote ? "Salvar Alterações" : "Emitir Orçamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
