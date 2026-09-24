import { RefreshCw } from "lucide-react";

const MONEDA = {
  BOB: { flag: "https://flagcdn.com/24x18/bo.png", code: "BOB" },
  PEN: { flag: "https://flagcdn.com/24x18/pe.png", code: "PEN" },
};

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
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={monto}
          onChange={(e) => {
            const valor = e.target.value;
            if (valor === "" || /^\d*\.?\d*$/.test(valor)) onChange(valor);
          }}
          placeholder="0.00"
          className="flex-1 min-w-0 bg-transparent text-right font-semibold text-white text-lg tabular-nums placeholder-gray-500 outline-none focus:outline-none border-0 focus:border-0 ring-0 focus:ring-0 shadow-none focus:shadow-none appearance-none"
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
        <span className="flex-1 min-w-0 text-right font-semibold text-white text-lg tabular-nums break-all">
          {conversion || "0.00"}
        </span>
      </div>
    </div>
  );
}
