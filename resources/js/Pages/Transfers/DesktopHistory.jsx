import React from "react";

export default function DesktopHistory({ transfers, getStatusColor, renderOwnerInfo }) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-gray-700 font-medium">Fecha</th>
            <th className="px-4 py-3 text-left text-gray-700 font-medium">Monto</th>
            <th className="px-4 py-3 text-left text-gray-700 font-medium">Monto Conv</th>
            <th className="px-4 py-3 text-left text-gray-700 font-medium">Modo</th>
            <th className="px-4 py-3 text-left text-gray-700 font-medium">Estado</th>
            <th className="px-4 py-3 text-left text-gray-700 font-medium">Cuenta Origen</th>
            <th className="px-4 py-3 text-left text-gray-700 font-medium">Cuenta Destino</th>
            <th className="px-4 py-3 text-left text-gray-700 font-medium">Propietario Destino</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((t) => (
            <tr key={t.id} className="border-b hover:bg-gray-50 transition">
              <td className="px-4 py-2 whitespace-nowrap">{new Date(t.created_at).toLocaleString()}</td>
              <td className="px-4 py-2 whitespace-nowrap">{t.amount}</td>
              <td className="px-4 py-2 whitespace-nowrap">{t.converted_amount}</td>
              <td className="px-4 py-2 whitespace-nowrap">{t.modo}</td>
              <td className={`whitespace-nowrap font-extrabold text-center ${getStatusColor(t.status)}`}>
                {t.status}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                {t.origin_account?.account_number} - {t.origin_account?.bank?.name}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                {t.destination_account?.account_number} - {t.destination_account?.bank?.name}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                {renderOwnerInfo(t.destination_account?.owner)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
