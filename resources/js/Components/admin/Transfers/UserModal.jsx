import { X } from "lucide-react";

const KYC_COLOR = {
  approved: "bg-green-100 text-green-700",
  verified:  "bg-green-100 text-green-700",
  rejected:  "bg-red-100 text-red-700",
  pending:   "bg-yellow-100 text-yellow-700",
};

export default function UserModal({ selected, isOpen, onClose }) {
  if (!isOpen || !selected) return null;

  const user = selected.user;
  if (!user) return null;

  const fields = [
    { label: "Email",        value: user.email },
    { label: "Teléfono",     value: user.phone },
    { label: "Documento",    value: user.document_number },
    { label: "Nacionalidad", value: user.nationality },
    { label: "Proveedor",    value: user.provider },
    { label: "Sesión KYC",   value: user.kyc_session_id },
    {
      label: "Miembro desde",
      value: user.created_at
        ? new Date(user.created_at).toLocaleDateString("es-ES", {
            day: "2-digit", month: "short", year: "numeric",
          })
        : "—",
    },
    {
      label: "Última actualización",
      value: user.updated_at
        ? new Date(user.updated_at).toLocaleDateString("es-ES", {
            day: "2-digit", month: "short", year: "numeric",
          })
        : "—",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[92vh] border border-gray-100 overflow-hidden">

     
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Detalle de Usuario</h2>
            <p className="text-xs text-gray-400 mt-0.5">ID #{user.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-4">

       
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold shrink-0 select-none">
              {user.first_name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">
                {user.first_name} {user.last_name}
              </p>
              <span
                className={`mt-1 inline-flex text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  KYC_COLOR[user.kyc_status] || "bg-gray-100 text-gray-600"
                }`}
              >
                KYC: {user.kyc_status}
              </span>
            </div>
          </div>

       
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-gray-800 break-words">{value || "—"}</p>
              </div>
            ))}
          </div>
        </div>

       
        <div className="px-5 py-4 border-t border-gray-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
