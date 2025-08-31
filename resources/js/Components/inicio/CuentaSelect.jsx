import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function CuentaSelect({ options, value, onChange, placeholder = "Selecciona una cuenta" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // selected será el objeto completo de la cuenta seleccionada
  const selected = value || null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      {/* Botón principal */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between border rounded-lg px-3 py-2 bg-white text-sm hover:bg-gray-50 transition"
      >
        {selected ? (
          <div className="flex items-center gap-2">
            {selected.bank_logo && (
              <img src={selected.bank_logo} alt={selected.bank_name} className="w-6 h-6 object-contain" />
            )}
            <div className="flex flex-col text-left">
              <span className="font-semibold">{selected.bank_name}-</span>
              <span className="text-gray-500 text-xs">{selected.account_number}</span>
            </div>
          </div>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <ChevronDown size={18} />
      </button>

      {/* Dropdown de opciones */}
      {open && (
        <div className="absolute mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onChange(opt); // devuelve el objeto completo
                setOpen(false);
              }}
              className={`relative w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition ${
                selected?.id === opt.id ? "bg-blue-50" : ""
              }`}
            >
              {opt.bank_logo && (
                <img src={opt.bank_logo} alt={opt.bank_name} className="w-6 h-6 object-contain" />
              )}
              <div className="flex flex-col text-left flex-1">
                <span className="font-semibold">{opt.bank_name}</span>
                <span className="text-gray-500 text-xs">{opt.account_number}</span>
              </div>
              {selected?.id === opt.id && <Check size={16} className="ml-auto text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
