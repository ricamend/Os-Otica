import React, { useState } from "react";
import { Client, ServiceOrder, OSStatus, OpticalPrescription, ServiceType } from "../types";
import {
  X,
  Wrench,
  Eye,
  Glasses,
  Upload,
  Camera,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: Partial<ServiceOrder>) => Promise<void>;
  clients: Client[];
  editingOrder?: ServiceOrder | null;
  initialClient?: Client | null;
  currentUser: any;
}

export function OrderFormModal({
  isOpen,
  onClose,
  onSave,
  clients,
  editingOrder,
  initialClient,
  currentUser,
}: OrderFormModalProps) {
  if (!isOpen) return null;

  const [clientId, setClientId] = useState(
    editingOrder?.clientId || initialClient?.id || (clients[0]?.id || "")
  );

  const [serviceType, setServiceType] = useState<ServiceType | string>(
    editingOrder?.serviceType || "Óculos de grau"
  );
  const [status, setStatus] = useState<OSStatus>(editingOrder?.status || "Aberta");
  const [deliveryForecast, setDeliveryForecast] = useState(
    editingOrder?.deliveryForecast ||
      new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split("T")[0]
  );
  const [finalAmount, setFinalAmount] = useState<number>(editingOrder?.finalAmount || 0);
  const [paymentStatus, setPaymentStatus] = useState<"Pendente" | "Parcial" | "Pago">(
    editingOrder?.paymentStatus || "Pendente"
  );
  const [internalNotes, setInternalNotes] = useState(editingOrder?.internalNotes || "");

  // Frame
  const [frameBrand, setFrameBrand] = useState(editingOrder?.frame?.brand || "");
  const [frameModel, setFrameModel] = useState(editingOrder?.frame?.model || "");
  const [frameColor, setFrameColor] = useState(editingOrder?.frame?.color || "");
  const [frameCode, setFrameCode] = useState(editingOrder?.frame?.code || "");
  const [framePrice, setFramePrice] = useState(editingOrder?.frame?.price || 0);

  // Lens
  const [lensType, setLensType] = useState(editingOrder?.lens?.lensType || "Monofocal Digital");
  const [lensMaterial, setLensMaterial] = useState(editingOrder?.lens?.material || "Resina 1.56");
  const [lensPrice, setLensPrice] = useState(editingOrder?.lens?.price || 0);

  // Prescription
  const [prescription, setPrescription] = useState<OpticalPrescription>(
    editingOrder?.prescription || {
      od: { spherical: "", cylindrical: "", axis: "", pd: "", addition: "" },
      oe: { spherical: "", cylindrical: "", axis: "", pd: "", addition: "" },
      doctorName: "",
      prescriptionDate: "",
    }
  );

  // Photo
  const [prescriptionPhotoUrl, setPrescriptionPhotoUrl] = useState(
    editingOrder?.prescriptionPhotoUrl || ""
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, filename: file.name }),
        });
        if (res.ok) {
          const data = await res.json();
          setPrescriptionPhotoUrl(data.url);
        } else {
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

    const client = clients.find((c) => c.id === clientId);
    if (!client) {
      setError("Cliente inválido.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload: Partial<ServiceOrder> = {
        id: editingOrder?.id,
        clientId: client.id,
        clientName: client.name,
        clientPhone: client.phone,
        quoteId: editingOrder?.quoteId,
        serviceType,
        status,
        deliveryForecast,
        finalAmount: Number(finalAmount) || 0,
        paymentStatus,
        internalNotes,
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
          treatments: editingOrder?.lens?.treatments || [],
          price: Number(lensPrice) || 0,
        },
        prescriptionPhotoUrl,
        createdBy: editingOrder?.createdBy || currentUser?.name || "Atendente",
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar Ordem de Serviço.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              {editingOrder ? `Editar ${editingOrder.id}` : "Nova Ordem de Serviço"}
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Ficha de Laboratório & Produção
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
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
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Óculos de grau">Óculos de grau</option>
                  <option value="Óculos de sol">Óculos de sol</option>
                  <option value="Lentes de contato">Lentes de contato</option>
                  <option value="Ajuste">Ajuste / Alinhamento</option>
                  <option value="Conserto">Conserto / Solda</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status da OS
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OSStatus)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                >
                  <option value="Aberta">Aberta (Em fila)</option>
                  <option value="Em produção">Em produção (Laboratório)</option>
                  <option value="Aguardando peça">Aguardando peça</option>
                  <option value="Pronta para retirada">Pronta para retirada</option>
                  <option value="Entregue">Entregue</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Previsão de Entrega *
                </label>
                <input
                  type="date"
                  required
                  value={deliveryForecast}
                  onChange={(e) => setDeliveryForecast(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor Final (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  value={finalAmount}
                  onChange={(e) => setFinalAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-white font-mono font-bold text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status de Pagamento
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Parcial">Parcial (Sinal pago)</option>
                  <option value="Pago">Pago integralmente</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Armação (Marca e Modelo)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Ray-Ban RB3016"
                  value={frameBrand}
                  onChange={(e) => setFrameBrand(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Prescription inputs */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>Grau / Receita (se aplicável)</span>
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-center">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2 text-left w-20">Olho</th>
                    <th className="py-2 px-1">Esférico</th>
                    <th className="py-2 px-1">Cilíndrico</th>
                    <th className="py-2 px-1">Eixo</th>
                    <th className="py-2 px-1">DNP</th>
                    <th className="py-2 px-1">Adição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 px-2 font-bold text-slate-800 text-left bg-slate-50">OD</td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="0.00"
                        value={prescription.od.spherical}
                        onChange={(e) =>
                          setPrescription({
                            ...prescription,
                            od: { ...prescription.od, spherical: e.target.value },
                          })
                        }
                        className="w-full py-1 text-center font-mono border rounded"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="0.00"
                        value={prescription.od.cylindrical}
                        onChange={(e) =>
                          setPrescription({
                            ...prescription,
                            od: { ...prescription.od, cylindrical: e.target.value },
                          })
                        }
                        className="w-full py-1 text-center font-mono border rounded"
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
                        className="w-full py-1 text-center font-mono border rounded"
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
                        className="w-full py-1 text-center font-mono border rounded"
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
                        className="w-full py-1 text-center font-mono border rounded"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 px-2 font-bold text-slate-800 text-left bg-slate-50">OE</td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="0.00"
                        value={prescription.oe.spherical}
                        onChange={(e) =>
                          setPrescription({
                            ...prescription,
                            oe: { ...prescription.oe, spherical: e.target.value },
                          })
                        }
                        className="w-full py-1 text-center font-mono border rounded"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="0.00"
                        value={prescription.oe.cylindrical}
                        onChange={(e) =>
                          setPrescription({
                            ...prescription,
                            oe: { ...prescription.oe, cylindrical: e.target.value },
                          })
                        }
                        className="w-full py-1 text-center font-mono border rounded"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="180"
                        value={prescription.oe.axis}
                        onChange={(e) =>
                          setPrescription({
                            ...prescription,
                            oe: { ...prescription.oe, axis: e.target.value },
                          })
                        }
                        className="w-full py-1 text-center font-mono border rounded"
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
                        className="w-full py-1 text-center font-mono border rounded"
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
                        className="w-full py-1 text-center font-mono border rounded"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Image upload */}
            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-indigo-600" />
                <span>Foto da Receita</span>
              </label>

              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? "Enviando..." : "Anexar Foto"}</span>
                  <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
                </label>

                {prescriptionPhotoUrl && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded border">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Anexo salvo</span>
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

          {/* Internal lab instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações Internas / Instruções Técnicas para Montagem
            </label>
            <textarea
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Ex: Polimento de bordas na biseladora, trocar parafusos da ponteira, verificar eixo com lensômetro antes de liberar..."
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>

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
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              {saving ? "Salvando..." : editingOrder ? "Atualizar OS" : "Criar Ordem de Serviço"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
