import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function BankSelect({ options, value, onChange, placeholder = "Seleccionar banco" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = value || null; // value es el objeto completo { id, name, logo_url, country }

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between border rounded-lg px-3 py-2 bg-white text-sm hover:bg-gray-50"
      >
        {selected ? (
          <div className="flex items-center gap-2">
            {selected.logo_url && <img src={selected.logo_url} alt={selected.name} className="w-5 h-5 object-contain" />}
            <span>{selected.name}</span>
          </div>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <ChevronDown size={18} />
      </button>

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
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm  hover:bg-gray-50 ${selected?.id === opt.id ? "bg-blue-50" : ""
                }`}
            >
              {opt.logo_url && <img src={opt.logo_url} alt={opt.name} className="w-8 h-8  " />}
              <span className="flex-1 text-left flex items-center gap-2">
                <span className="font-medium">{opt.name}</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 border">
                  {opt.country.charAt(0).toUpperCase() + opt.country.slice(1).toLowerCase()}
                </span>
              </span>
              {selected?.id === opt.id && <Check size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
