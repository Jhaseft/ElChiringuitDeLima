import { useState, useEffect, useRef } from "react";
import axios from "axios";
import AccountCard from "../Users/AccountCard";
import { X, Upload, ArrowRight, ImagePlus } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "pending",   label: "Pendiente",  ring: "ring-yellow-300",  active: "border-yellow-400 bg-yellow-50 text-yellow-700",  idle: "border-gray-200 bg-white text-gray-500 hover:border-yellow-200" },
  { value: "completed", label: "Completado", ring: "ring-green-300",   active: "border-green-400 bg-green-50 text-green-700",    idle: "border-gray-200 bg-white text-gray-500 hover:border-green-200" },
  { value: "rejected",  label: "Rechazado",  ring: "ring-red-300",    active: "border-red-400 bg-red-50 text-red-700",          idle: "border-gray-200 bg-white text-gray-500 hover:border-red-200" },
];

const STATUS_BADGE = {
  pending:   "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  rejected:  "bg-red-100 text-red-700",
};

export default function TransferModal({ selected, isOpen, onClose, onUpdated }) {
  const [editStatus, setEditStatus]     = useState(selected.status);
  const [comprobantes, setComprobantes] = useState([]);
  const [previews, setPreviews]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setEditStatus(selected.status);
      setComprobantes([]);
      setPreviews([]);
      setError(null);
    }
  }, [isOpen, selected.status]);

  const handleAddFiles = (e) => {
    const files = Array.from(e.target.files);
    const total = comprobantes.length + files.length;
    if (total > 5) {
      setError("Máximo 5 comprobantes.");
      return;
    }
    setError(null);
    setComprobantes((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) =>
      f.type.startsWith("image/") ? URL.createObjectURL(f) : null
    );
    setPreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index) => {
    if (previews[index]) URL.revokeObjectURL(previews[index]);
    setComprobantes((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    setError(null);
    if (editStatus === "completed" && comprobantes.length === 0) {
      setError("Debes subir al menos un comprobante para marcar como Completado.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("status", editStatus);
      if (editStatus === "completed") {
        comprobantes.forEach((file) => formData.append("comprobantes[]", file));
      }

      await axios.post(`/admin/transfers/${selected.id}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      onUpdated();
      onClose();
    } catch (err) {
      if (err.response?.status === 422) {
        const msgs = Object.values(err.response.data.errors || {}).flat().join(" · ");
        setError(msgs || "Error de validación.");
      } else {
        setError("Error al actualizar la transferencia. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  let currencyA;
  let currencyB

  if(selected.modo==='PENtoBOB'){
    currencyA='Pen';
    currencyB='Bob';
  }else{
    currencyA='Bob';
    currencyB='Pen';
  }



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[94vh] border border-gray-100 overflow-hidden">

    
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Detalle de Transferencia</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              ID #{selected.id} · {formatDate(selected.created_at)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

 
        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-5">

     
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-3 text-center">
              <p className="text-xs text-blue-400 mb-1">Monto Recibido</p>
              <p className="text-xl font-bold text-blue-700">{selected.amount} {currencyA}</p>
            </div>
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center">
                <ArrowRight size={20} className="text-gray-400" />
                <p className="text-xs text-gray-400 mt-1">{selected.exchange_rate}x</p>
              </div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-3 text-center">
              <p className="text-xs text-green-400 mb-1">Monto A enviar</p>
              <p className="text-xl font-bold text-green-700">{selected.converted_amount || "—"} {currencyB}</p>
            </div>
          </div>

          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Estado actual:</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[selected.status] || "bg-gray-100 text-gray-600"}`}>
              {STATUS_OPTIONS.find(s => s.value === selected.status)?.label ?? selected.status}
            </span>
          </div>

   
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cuenta Origen</p>
              {selected.origin_account
                ? <AccountCard account={selected.origin_account} />
                : <p className="text-sm text-gray-400 italic">Sin datos</p>}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cuenta Destino</p>
              {selected.destination_account
                ? <AccountCard account={selected.destination_account} />
                : <p className="text-sm text-gray-400 italic">Sin datos</p>}
            </div>
          </div>

      
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Cambiar Estado</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(({ value, label, active, idle, ring }) => (
                <button
                  key={value}
                  onClick={() => { setEditStatus(value); setError(null); }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition ${
                    editStatus === value ? `${active} ring-2 ${ring}` : idle
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

           
            {editStatus === "completed" && (
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Comprobantes de pago <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal ml-1">(máx. 5)</span>
                </label>

                {comprobantes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {comprobantes.map((file, idx) => (
                      <div key={idx} className="relative group w-24 h-24">
                        {previews[idx] ? (
                          <img
                            src={previews[idx]}
                            alt={file.name}
                            className="w-full h-full object-cover rounded-xl border border-gray-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-500">
                            PDF
                          </div>
                        )}
                        <button
                          onClick={() => removeFile(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition shadow"
                        >
                          <X size={14} />
                        </button>
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate w-24">{file.name}</p>
                      </div>
                    ))}
                  </div>
                )}

                {comprobantes.length < 5 && (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-white hover:border-green-400 hover:bg-green-50/20 transition">
                    <ImagePlus size={22} className="text-gray-400 mb-1" />
                    <span className="text-xs text-gray-400">
                      {comprobantes.length === 0 ? "Seleccionar comprobantes (JPG, PNG, PDF)" : "Agregar más"}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      multiple
                      className="hidden"
                      onChange={handleAddFiles}
                    />
                  </label>
                )}
              </div>
            )}
          </div>
 
     
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

     
        <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin" />
                Guardando...
              </>
            ) : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
