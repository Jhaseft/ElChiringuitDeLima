import { usePage, Link } from "@inertiajs/react";
import { MessageCircle } from "lucide-react";
import { useCambioDivisas } from "./hooks/useCambioDivisas";
import ConversorDivisas from "./ConversorDivisas";
import ModalOperacion from "./Transferencia/ModalOperacion";
import ErrorBanner from "./shared/ErrorBanner";

export default function CambioDivisasCard({ tasas, bancos, transferConfig,metodosPago }) {
  const { auth } = usePage().props;
  const user = auth?.user ?? null;
  
  const {
    monto, conversion, modo, error, setError,
    tasa, tasaBOBtoPEN, tasaPENtoBOB, modoDescripcion,
    handleCambio, toggleModo, iniciarOperacion,
    modalActivo, setModalActivo,
  } = useCambioDivisas({ tasas, transferConfig, user });

  // Propiedades comunes que reciben todos los modales de pago
  const propsModalPago = {
    user, monto, conversion, tasa, modo, modoDescripcion,
    onClose: () => setModalActivo(null),
  };

  return (
    <>
      {error && <ErrorBanner message={error} onClose={() => setError("")} />}

    
      <div className="bg-gray-800 rounded-2xl shadow-xl p-5 flex flex-col gap-3 border border-yellow-400 transition hover:shadow-2xl hover:scale-[1.01] duration-300 relative">


        <div className="flex items-center gap-3">
          <img
            src="https://res.cloudinary.com/dxa8nat3p/image/upload/v1774708728/Logo_y_Texto_wvkwil.png"
            alt="Logo"
            className="h-14 w-14 object-contain shrink-0"
          />
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">TransferCash</h1>
            <p className="text-xs text-gray-300 leading-snug">
              Cambio de divisas rápido, seguro y confiables
            </p>
          </div>
        </div>


        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => modo !== "BOBtoPEN" && toggleModo()}
            className={`flex flex-col items-center rounded-xl py-2 transition-colors ${
              modo === "BOBtoPEN"
                ? "bg-yellow-400 text-gray-900"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <span className="text-[11px] font-semibold tracking-wide">VENTA</span>
            <span className="text-lg font-bold">{tasaBOBtoPEN.toFixed(2)}</span>
          </button>
          <button
            type="button"
            onClick={() => modo !== "PENtoBOB" && toggleModo()}
            className={`flex flex-col items-center rounded-xl py-2 transition-colors ${
              modo === "PENtoBOB"
                ? "bg-yellow-400 text-gray-900"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <span className="text-[11px] font-semibold tracking-wide">COMPRA</span>
            <span className="text-lg font-bold">{tasaPENtoBOB.toFixed(2)}</span>
          </button>
        </div>


        <ConversorDivisas
          modo={modo}
          monto={monto}
          conversion={conversion}
          onChange={handleCambio}
          onToggle={toggleModo}
        />


        <button
          onClick={iniciarOperacion}
          className="bg-yellow-400 text-gray-900 py-2.5 rounded-xl text-sm font-semibold hover:bg-yellow-500 shadow-md transition-all"
        >
          Iniciar operación
        </button>

        <a
          href="https://wa.me/59163892482?text=Hola,%20quiero%20cambiar%20con%20un%20asesor"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 border border-gray-600 text-gray-300 py-2.5 rounded-xl text-sm font-semibold hover:border-yellow-400 hover:text-yellow-400 transition-colors"
        >
          <MessageCircle size={18} />
          Cambiar con un asesor
        </a>

        {!user && (
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              href="/login"
              className="flex-1 text-center py-2 rounded-lg text-sm font-semibold border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900 transition"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="flex-1 text-center py-2 rounded-lg text-sm font-semibold bg-yellow-400 text-gray-900 hover:bg-yellow-500 transition"
            >
              Registrarse
            </Link>
          </div>
        )}

        <p className="text-gray-500 text-[11px] text-center leading-snug">
          Para enviar dinero a terceros, la operación debe ser realizada
          mediante un asesor.
        </p>
      </div>

      <ModalOperacion
        isOpen={modalActivo === "transferencia"}
        {...propsModalPago}
        bancos={bancos}
        metodosPago={metodosPago}
      />
    </>
  );
}
