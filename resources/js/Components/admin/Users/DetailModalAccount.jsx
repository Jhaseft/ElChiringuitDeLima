import AccountSection from "./AccountSection";

export default function DetailModal({ detail, onClose }) {
  const origin = (detail ?? []).filter((a) => a.account_type === "origin");
  const destination = (detail ?? []).filter((a) => a.account_type === "destination");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
      <div className="bg-gray-50 w-full max-w-2xl rounded-2xl shadow-2xl overflow-y-auto max-h-[92vh] relative flex flex-col">

        
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100 rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-base">
              🏦
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800 leading-tight">
                Cuentas del Usuario
              </h3>
              <p className="text-xs text-gray-400">
                {(detail ?? []).length} cuenta{(detail ?? []).length !== 1 ? "s" : ""} registrada{(detail ?? []).length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition p-1.5 rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        
        <div className="p-5 flex flex-col gap-6">
          {(detail ?? []).length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Sin cuentas registradas.
            </p>
          ) : (
            <>
              <AccountSection
                title="Cuentas Origen"
                accounts={origin}
                icon="↑"
                color="text-green-600"
              />
              {origin.length > 0 && destination.length > 0 && (
                <div className="border-t border-dashed border-gray-200" />
              )}
              <AccountSection
                title="Cuentas Destino"
                accounts={destination}
                icon="↓"
                color="text-indigo-600"
              />
            </>
          )}
        </div>

   
        <div className="flex justify-end px-5 py-3 border-t border-gray-100 bg-white rounded-b-2xl sticky bottom-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition text-sm font-medium text-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
