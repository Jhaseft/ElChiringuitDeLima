import React from "react";

export default function MobileHistory({ transfers, getStatusColor, renderOwnerInfo }) {
  return (
    <div className="md:hidden flex flex-col gap-4">
      {transfers.map((t) => (
        <div key={t.id} className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-700 font-semibold">{new Date(t.created_at).toLocaleString()}</span>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(t.status)}`}>
              {t.status} 
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 text-gray-600">
            <div><span className="font-medium">Monto:</span> {t.amount}</div>
            <div><span className="font-medium">Monto Conv:</span> {t.converted_amount}</div>
            <div><span className="font-medium">Modo:</span> {t.modo}</div>
            <div>
              <span className="font-medium">Origen:</span> {t.origin_account?.account_number} - {t.origin_account?.bank?.name}
            </div>
            <div>
              <span className="font-medium">Destino:</span> {t.destination_account?.account_number} - {t.destination_account?.bank?.name}
            </div>
            <div>
              <span className="font-medium">Propietario Destino:</span> {renderOwnerInfo(t.destination_account?.owner)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
