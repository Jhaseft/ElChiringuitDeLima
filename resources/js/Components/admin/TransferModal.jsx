import { useState } from "react";
import axios from "axios";

export default function TransferModal({ selected, isOpen, onClose, onUpdated }) {
  const [editStatus, setEditStatus] = useState(selected.status);
  const [comprobante, setComprobante] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("status", editStatus);

      if (editStatus === "completed") {
        if (!comprobante) {
          alert("Debes subir un comprobante al verificar la transferencia.");
          setLoading(false);
          return;
        }
        formData.append("comprobante", comprobante);
      }

      await axios.post(`/admin/transfers/${selected.id}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      onUpdated();
      onClose();
    } catch (error) {
      if (error.response?.status === 422) {
        alert("Error: " + JSON.stringify(error.response.data.errors));
      } else {
        console.error(error);
        alert("Error al actualizar transferencia");
      }
    } finally {
      setLoading(false);
    }
  };

  const Section = ({ title, children }) => (
    <div className="bg-white border border-gray-300 p-3 rounded-lg shadow-sm text-sm md:text-base">
      <h3 className="font-semibold mb-2 text-gray-800">{title}</h3>
      {children}
    </div>
  );

  const renderAccount = (account) => {
    if (!account) return <p>Sin datos</p>;
    const owner = account.owner;
    return (
      <>
        <p><strong>Banco:</strong> {account.bank?.name || "—"}</p>
        <p><strong>Número:</strong> {account.account_number || "N/A"}</p>
        <p><strong>Tipo:</strong> {account.account_type || "-"}</p>
        {owner && (
          <>
            <p><strong>Propietario:</strong> {owner.full_name || `${owner.first_name} ${owner.last_name}`}</p>
            <p><strong>Documento:</strong> {owner.document_number}</p>
            <p><strong>Teléfono:</strong> {owner.phone}</p>
          </>
        )}
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl overflow-auto max-h-[90vh] p-4 md:p-6 border border-gray-300">
        <h2 className="text-xl md:text-2xl font-bold text-center text-gray-900 mb-4">Detalle de Transferencia</h2>

        <div className="flex flex-col gap-4">
          <Section title="Usuario">
            <p><strong>Nombre:</strong> {selected.user.first_name} {selected.user.last_name}</p>
            <p><strong>Email:</strong> {selected.user.email}</p>
            <p><strong>Teléfono:</strong> {selected.user.phone || "—"}</p>
            <p><strong>Documento:</strong> {selected.user.document_number}</p>
            <p><strong>Nacionalidad:</strong> {selected.user.nationality}</p>
            <p><strong>Proveedor:</strong> {selected.user.provider || "-"}</p>
            <p><strong>KYC:</strong> {selected.user.kyc_status}</p>
          </Section>

          <Section title="Cuenta Origen">
            {renderAccount(selected.origin_account)}
          </Section>

          <Section title="Cuenta Destino">
            {renderAccount(selected.destination_account)}
          </Section>

          <Section title="Detalles de Transferencia">
            <p><strong>Monto:</strong> {selected.amount}</p>
            <p><strong>Monto Convertido:</strong> {selected.converted_amount || "-"}</p>
            <p><strong>Modo:</strong> {selected.modo || "-"}</p>
            <p><strong>Tipo de Cambio:</strong> {selected.exchange_rate}</p>

            <div className="flex flex-col md:flex-row gap-2 mt-2 items-center">
              <strong>Estado:</strong>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="border border-gray-400 rounded px-2 py-1 w-full md:w-auto text-sm"
              >
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {editStatus === "completed" && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Subir Comprobante</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => setComprobante(e.target.files[0])}
                  className="mt-1 block w-full text-sm text-gray-600"
                />
              </div>
            )}
          </Section>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
          <button
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm"
            onClick={onClose}
          >
            Cerrar
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
