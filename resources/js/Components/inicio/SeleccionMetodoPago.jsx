/**
 * Modal selector de método de pago.
 *
 * Para agregar un nuevo método, simplemente añade una entrada a METODOS:
 *   { key: "crypto", label: "₿ Criptomoneda", variante: "outline" }
 *
 * El componente padre recibe `onSelect(key)` y decide qué modal abrir.
 */

const METODOS = [
  { key: "transferencia", label: "🏦 Transferencia Bancaria", variante: "primary" },
  { key: "efectivo",      label: "💵 Efectivo",               variante: "outline" },
  //{ key: "qr",            label: "📷 Pago por QR",            variante: "outline" },
];

const estiloBoton = {
  primary: "w-full py-3 rounded-xl bg-yellow-400 text-gray-900 font-semibold hover:bg-yellow-500 transition",
  outline: "w-full py-3 rounded-xl border border-yellow-400 text-yellow-400 font-semibold hover:bg-yellow-400 hover:text-gray-900 transition",
};

export default function SeleccionMetodoPago({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-yellow-400 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl font-bold"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-yellow-400 mb-2 text-center">
          ¿Cómo deseas operar?
        </h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          Selecciona el método de pago para tu operación
        </p>

        <div className="flex flex-col gap-3">
          {METODOS.map(({ key, label, variante }) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={estiloBoton[variante]}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
