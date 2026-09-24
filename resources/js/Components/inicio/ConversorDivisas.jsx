import { RefreshCw } from "lucide-react";

const MONEDA = {
  BOB: { flag: "https://flagcdn.com/24x18/bo.png", code: "BOB" },
  PEN: { flag: "https://flagcdn.com/24x18/pe.png", code: "PEN" },
};

/**
 * UI pura: dos campos de monto + botón de swap.
 * No contiene lógica de negocio.
 */
export default function ConversorDivisas({ modo, monto, conversion, onChange, onToggle }) {
  const isBOBtoPEN = modo === "BOBtoPEN";
  const origen = isBOBtoPEN ? MONEDA.BOB : MONEDA.PEN;
  const destino = isBOBtoPEN ? MONEDA.PEN : MONEDA.BOB;

  return (
    <div className="flex flex-col">
      <span className="text-[11px] font-semibold tracking-wide text-gray-400 text-right uppercase mb-1.5">
        Tienes {isBOBtoPEN ? "bolivianos" : "soles"}
      </span>
      <div className="flex items-center justify-between gap-2 bg-gray-900/60 border border-yellow-400 rounded-xl px-4 py-2.5 transition-shadow focus-within:ring-2 focus-within:ring-yellow-400/70 focus-within:border-yellow-300">
        <span className="flex items-center gap-2 text-white font-semibold shrink-0">
          <img src={origen.flag} alt="" className="w-6 h-[18px] rounded-sm object-cover" />
          {origen.code}
        </span>
        <input
          type="number"
          min="0"
          value={monto}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
          className="w-24 bg-transparent text-right font-semibold text-white text-lg tabular-nums placeholder-gray-500 outline-none border-0 [appearance:textfield] [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0"
        />
      </div>

      <div className="relative flex items-center justify-end py-2">
        <span className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
          Recibes {isBOBtoPEN ? "soles" : "bolivianos"}
        </span>
        <button
          onClick={onToggle}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-3 bg-yellow-400 text-gray-900 rounded-full hover:bg-yellow-300 transition shadow-lg border-4 border-gray-800"
          title="Cambiar dirección"
        >
          <RefreshCw className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 bg-gray-900/60 border border-yellow-400 rounded-xl px-4 py-2.5">
        <span className="flex items-center gap-2 text-white font-semibold shrink-0">
          <img src={destino.flag} alt="" className="w-6 h-[18px] rounded-sm object-cover" />
          {destino.code}
        </span>
        <span className="w-24 text-right font-semibold text-white text-lg tabular-nums truncate">
          {conversion || "0.00"}
        </span>
      </div>
    </div>
  );
}
