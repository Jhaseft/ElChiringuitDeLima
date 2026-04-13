import { RefreshCw } from "lucide-react";

/**
 * UI pura: dos campos de monto + botón de swap.
 * No contiene lógica de negocio.
 */
export default function ConversorDivisas({ modo, monto, conversion, onChange, onToggle }) {
  const isBOBtoPEN = modo === "BOBtoPEN";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex flex-col w-full">
        <label className="text-sm font-medium text-gray-300 mb-1 text-center">
          {isBOBtoPEN ? "TIENES BOLIVIANOS" : "TIENES SOLES"}
        </label>
        <input
          type="number"
          min="0"
          value={monto}
          onChange={(e) => onChange(e.target.value)}
          className="border border-yellow-400 rounded-lg px-1 py-2 text-center font-semibold bg-gray-700 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none shadow-sm"
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={onToggle}
          className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition shadow-md"
          title="Cambiar dirección"
        >
          <RefreshCw className="w-6 h-6 text-yellow-400" />
        </button>
      </div>

      <div className="flex flex-col w-full">
        <label className="text-sm font-medium text-gray-300 mb-1 text-center">
          {isBOBtoPEN ? "RECIBES SOLES" : "RECIBES BOLIVIANOS"}
        </label>
        <input
          type="text"
          value={conversion}
          readOnly
          className="border border-yellow-400 rounded-lg px-1 py-2 text-center font-semibold bg-gray-700 text-white shadow-sm"
        />
      </div>
    </div>
  );
}
