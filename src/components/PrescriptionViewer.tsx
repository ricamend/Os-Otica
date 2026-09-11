import { OpticalPrescription } from "../types";
import { formatDate } from "../lib/formatters";
import { Eye, Stethoscope } from "lucide-react";

interface PrescriptionViewerProps {
  prescription: OpticalPrescription;
  photoUrl?: string;
  showPhotoLink?: boolean;
}

export function PrescriptionViewer({
  prescription,
  photoUrl,
  showPhotoLink = true,
}: PrescriptionViewerProps) {
  const { od, oe, doctorName, prescriptionDate } = prescription;

  const hasData =
    od?.spherical ||
    od?.cylindrical ||
    oe?.spherical ||
    oe?.cylindrical ||
    doctorName;

  if (!hasData && !photoUrl) {
    return (
      <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg border border-slate-200">
        Nenhuma receita ou grau especificado para este atendimento.
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800" id="prescription-viewer-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider">
          <Eye className="w-3.5 h-3.5 text-blue-600" />
          <span>Receita Oftalmológica / Grau</span>
        </div>
        {(doctorName || prescriptionDate) && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Stethoscope className="w-3 h-3 text-slate-400" />
            <span>
              {doctorName ? doctorName : "Médico não informado"}
              {prescriptionDate ? ` • ${formatDate(prescriptionDate)}` : ""}
            </span>
          </div>
        )}
      </div>

      {/* Prescription Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse text-center">
          <thead>
            <tr className="bg-blue-100/60 text-blue-950 font-semibold border-b border-blue-200">
              <th className="py-1.5 px-2 text-left w-20">Olho</th>
              <th className="py-1.5 px-2">Esférico</th>
              <th className="py-1.5 px-2">Cilíndrico</th>
              <th className="py-1.5 px-2">Eixo</th>
              <th className="py-1.5 px-2">DNP (mm)</th>
              <th className="py-1.5 px-2">Adição</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono">
            <tr className="bg-white hover:bg-slate-50">
              <td className="py-1.5 px-2 font-sans font-bold text-slate-700 text-left">
                OD <span className="text-[10px] font-normal text-slate-400 font-sans">(Direito)</span>
              </td>
              <td className="py-1.5 px-2 font-semibold text-slate-900">{od?.spherical || "0.00"}</td>
              <td className="py-1.5 px-2 text-slate-700">{od?.cylindrical || "0.00"}</td>
              <td className="py-1.5 px-2 text-slate-700">{od?.axis ? `${od.axis}°` : "-"}</td>
              <td className="py-1.5 px-2 text-slate-700">{od?.pd || "-"}</td>
              <td className="py-1.5 px-2 text-slate-700">{od?.addition || "-"}</td>
            </tr>
            <tr className="bg-white hover:bg-slate-50">
              <td className="py-1.5 px-2 font-sans font-bold text-slate-700 text-left">
                OE <span className="text-[10px] font-normal text-slate-400 font-sans">(Esquerdo)</span>
              </td>
              <td className="py-1.5 px-2 font-semibold text-slate-900">{oe?.spherical || "0.00"}</td>
              <td className="py-1.5 px-2 text-slate-700">{oe?.cylindrical || "0.00"}</td>
              <td className="py-1.5 px-2 text-slate-700">{oe?.axis ? `${oe.axis}°` : "-"}</td>
              <td className="py-1.5 px-2 text-slate-700">{oe?.pd || "-"}</td>
              <td className="py-1.5 px-2 text-slate-700">{oe?.addition || "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {photoUrl && showPhotoLink && (
        <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">Foto da receita anexada:</span>
          <a
            href={photoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium underline flex items-center gap-1"
          >
            Visualizar imagem da receita
          </a>
        </div>
      )}
    </div>
  );
}
