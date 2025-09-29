import React from "react";
import { Link } from "@inertiajs/react";
import DesktopHistory from "./DesktopHistory";
import MobileHistory from "./MobileHistory";

export default function History({ transfers }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "text-yellow-600";
      case "verified": return "text-blue-600";
      case "completed": return "text-green-600"; 
      case "rejected": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const renderOwnerInfo = (owner) => {
    if (!owner) return "-";
    return (
      <div className="space-y-1">
        <div><span className="font-medium">Nombre:</span> {owner.full_name}</div>
        <div><span className="font-medium">Doc:</span> {owner.document_number}</div>
        <div><span className="font-medium">Tel:</span> {owner.phone}</div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Mi Historial de Transferencias</h1>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition w-full sm:w-auto text-center"
        >
          Volver
        </Link>
      </div>

      <DesktopHistory transfers={transfers} getStatusColor={getStatusColor} renderOwnerInfo={renderOwnerInfo} />
      <MobileHistory transfers={transfers} getStatusColor={getStatusColor} renderOwnerInfo={renderOwnerInfo} />
    </div>
  );
}
