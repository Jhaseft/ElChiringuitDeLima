export default function DetailModal({ detail, onClose }) {
  if (!detail) return null;

  const kycColor = {
    approved: "bg-green-100 text-green-700",
    verified: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
  };


  const userFields = [
    "id",
    "first_name",
    "last_name",
    "email",
    "phone",
    "nationality",
    "document_number",
    'kyc_session_id',
    "kyc_status",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl p-4 sm:p-6 overflow-y-auto max-h-[92vh] relative">

     
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
            Detalle del Usuario
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition p-1 rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
 
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {userFields.map((key) => {
            const isKyc = key === "kyc_status";
            const val = detail[key] || "—";

            return (
              <div
                key={key}
                className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-100"
              >
                <p className="text-xs text-gray-400 capitalize mb-0.5">
                  {key.replace(/_/g, " ")}
                </p>

                {isKyc ? (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      kycColor[val] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {val}
                  </span>
                ) : (
                  <p className="text-sm font-medium text-gray-800 break-words">
                    {val}
                  </p>
                )}
              </div>
            );
          })}
        </div>

       
        <div className="flex justify-end pt-2 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border hover:bg-gray-100 transition text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}