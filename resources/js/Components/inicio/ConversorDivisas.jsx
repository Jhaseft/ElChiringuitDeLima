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
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold tracking-wide text-gray-400 text-right uppercase">
          Tienes {isBOBtoPEN ? "bolivianos" : "soles"}
        </span>
        <div className="flex items-center justify-between gap-2 bg-gray-900/60 border border-yellow-400 rounded-xl px-4 py-2.5">
          <span className="flex items-center gap-2 text-white font-semibold">
            <img src={origen.flag} alt="" className="w-6 h-[18px] rounded-sm object-cover" />
            {origen.code}
          </span>
          <input
            type="number"
            min="0"
            value={monto}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0.00"
            className="w-24 bg-transparent text-right font-semibold text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="flex justify-center -my-2.5 z-10">
        <button
          onClick={onToggle}
          className="p-2 bg-yellow-400 text-gray-900 rounded-full hover:bg-yellow-300 transition shadow-md border-4 border-gray-800"
          title="Cambiar dirección"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold tracking-wide text-gray-400 text-right uppercase">
          Recibes {isBOBtoPEN ? "soles" : "bolivianos"}
        </span>
        <div className="flex items-center justify-between gap-2 bg-gray-900/60 border border-yellow-400 rounded-xl px-4 py-2.5">
          <span className="flex items-center gap-2 text-white font-semibold">
            <img src={destino.flag} alt="" className="w-6 h-[18px] rounded-sm object-cover" />
            {destino.code}
          </span>
          <span className="w-24 text-right font-semibold text-white truncate">
            {conversion || "0.00"}
          </span>
        </div>
      </div>
    </div>
  );
}
