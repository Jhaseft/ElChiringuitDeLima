import { usePage, Link } from "@inertiajs/react";
import { useCambioDivisas } from "./hooks/useCambioDivisas";
import ConversorDivisas from "./ConversorDivisas";
import SeleccionMetodoPago from "./SeleccionMetodoPago";
import ModalOperacion from "./Transferencia/ModalOperacion";
import ModalEfectivo from "./Efectivo/ModalEfectivo";
import ModalQR from "./QR/ModalQR";
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

    
      <div className="bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col gap-5 border border-yellow-400 transition hover:shadow-2xl hover:scale-[1.01] duration-300 relative">

  
        <div className="flex flex-col items-center mb-2">
          <h1 className="text-2xl font-bold text-white">TransferCash</h1>
          <p className="text-sm text-gray-300 text-center">
            Cambio de divisas rápido, seguro y confiables
          </p>
          <img
            src="https://res.cloudinary.com/dxa8nat3p/image/upload/v1774708728/Logo_y_Texto_wvkwil.png"
            alt="Logo"
            className="mt-3 w430 h-40 object-contain"
          />
        </div>

   
        <div className="flex justify-between text-base font-semibold px-2">
          <span className="text-blue-400">
            COMPRA: <span className="font-bold">{tasaPENtoBOB.toFixed(2)}</span>
          </span>
          <span className="text-green-400">
            VENTA: <span className="font-bold">{tasaBOBtoPEN.toFixed(2)}</span>
          </span>
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
          className="bg-yellow-400 text-gray-900 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-500 shadow-md transition-all mt-3"
        >
          Iniciar Operación
        </button>

       
        {!user && (
          <div className="flex flex-col sm:flex-row gap-2 justify-center mt-2">
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

      
        <p className="text-yellow-400 text-lg text-center">
          Para personas que quieran enviar dinero a terceros, esta operación debe
          ser realizada mediante la atención de un asesor.
        </p>

        <div className="flex justify-center mt-2">
          <svg
            className="w-6 h-6 text-yellow-400 animate-pulse rotate-0 lg:-rotate-90"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <SeleccionMetodoPago
        isOpen={modalActivo === "selector"}
        onClose={() => setModalActivo(null)}
        onSelect={(metodo) => setModalActivo(metodo)}
      />

      <ModalOperacion
        isOpen={modalActivo === "transferencia"}
        {...propsModalPago}
        bancos={bancos}
        metodosPago={metodosPago}
      />

      <ModalEfectivo
        isOpen={modalActivo === "efectivo"}
        {...propsModalPago}
        metodosPago={metodosPago}
      />

      <ModalQR
        isOpen={modalActivo === "qr"}
        {...propsModalPago}
        metodosPago={metodosPago}
      />
    </>
  );
}
