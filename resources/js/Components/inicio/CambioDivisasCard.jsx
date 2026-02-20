import { useState } from "react";
import { usePage, Link } from "@inertiajs/react";
import { RefreshCw } from "lucide-react";
import ModalOperacion from "./ModalOperacion";
import ErrorBanner from "./ErrorBanner";

export default function CambioDivisasCard({ tasas, bancos }) {
  const { auth } = usePage().props;
  const user = auth?.user ?? null;

  const [monto, setMonto] = useState("");
  const [conversion, setConversion] = useState("");
  const [modo, setModo] = useState("PENtoBOB"); // "BOBtoPEN" o "PENtoBOB"
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { compra = 0.54, venta = 0.54 } = tasas || {};
  const tasaBOBtoPEN = venta || 1.96;
  const tasaPENtoBOB = compra || 1.94;

  const handleCambio = (valorStr) => {
    const valor = parseFloat(valorStr);
    if (isNaN(valor)) {
      setMonto("");
      setConversion("");
      return;
    }

    if (valor < 0) {
      setMonto("");
      setConversion("");
      setError("⚠️ El monto no puede ser negativo.");
      return;
    }

    setMonto(valor);
    setError("");
    if (modo === "BOBtoPEN") {
      setConversion((valor / tasaBOBtoPEN).toFixed(2));
    } else {
      setConversion((valor * tasaPENtoBOB).toFixed(2));
    }
  };

  const toggleModo = () => {
    const nuevoModo = modo === "BOBtoPEN" ? "PENtoBOB" : "BOBtoPEN";
    setModo(nuevoModo);

    // recalcular
    if (monto && !isNaN(monto)) {
      if (nuevoModo === "BOBtoPEN") {
        setConversion((monto / tasaBOBtoPEN).toFixed(2));
      } else {
        setConversion((monto * tasaPENtoBOB).toFixed(2));
      }
    }
  };
 
  const iniciarOperacion = () => {
    if (!monto || !conversion) {
      setError("Debes ingresar un monto válido para iniciar la operación.");
      return;
    }

    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (!user.document_number || !user.nationality) {
      window.location.href = "/complete-profile";
      return;
    }

    setModalOpen(true);
    setError("");
  };

  // Texto descriptivo del modo
  const modoDescripcion =
    modo === "BOBtoPEN" ? "Bolivianos → Soles" : "Soles → Bolivianos";

  return (
    <>
      {error && <ErrorBanner message={error} onClose={() => setError("")} />}

      <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-5 border border-gray-100 transition hover:shadow-2xl hover:scale-[1.01] duration-300 relative">
        <div className="flex flex-col items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-800">TransferCash</h1>
          <p className="text-sm text-gray-500 text-center">
            Cambio de divisas rápido, seguro y confiable
          </p>
          <img
            src="https://res.cloudinary.com/dnbklbswg/image/upload/v1756305635/logo_n6nqqr.jpg"
            alt="Logo"
            className="mt-3 w-20 h-20 object-contain rounded-full border border-gray-200 shadow-sm"
          />
        </div>

      
        <div className="flex justify-between text-base font-semibold px-2">
          <span className="text-blue-700">
            COMPRA: <span className="font-bold">{tasaPENtoBOB.toFixed(2)}</span>
          </span>
          <span className="text-green-700">
            VENTA: <span className="font-bold">{tasaBOBtoPEN.toFixed(2)}</span>
          </span>
        </div>

       
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-col w-full">
            <label className="text-sm font-medium text-gray-600 mb-1 text-center">
              {modo === "BOBtoPEN" ? "TIENES BOLIVIANOS" : "TIENES SOLES"}
            </label>
            <input
              type="number"
              min="0"
              value={monto}
              onChange={(e) => handleCambio(e.target.value)}
              className="border rounded-lg px-1 py-2 text-center font-semibold focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={toggleModo}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition shadow-md"
            >
              <RefreshCw className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          <div className="flex flex-col w-full">
            <label className="text-sm font-medium text-gray-600 mb-1 text-center">
              {modo === "BOBtoPEN" ? "RECIBES SOLES" : "RECIBES BOLIVIANOS"}
            </label>
            <input
              type="text"
              value={conversion}
              readOnly
              className="border rounded-lg px-1 py-2 text-center font-semibold bg-gray-50 shadow-sm"
            />
          </div>
        </div>

       
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 mt-3">
          <button
            onClick={iniciarOperacion}
            className="bg-green-700 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-800 shadow-md transition-all"
          >
            Iniciar Operación
          </button>
        </div>

        
        {!user && (
          <div className="flex flex-col sm:flex-row gap-2 justify-center mt-2">
            <Link
              href="/login"
              className="flex-1 text-center py-2 rounded-lg text-sm font-semibold border border-green-600 text-green-600 hover:bg-green-50 transition"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="flex-1 text-center py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition"
            >
              Registrarse
            </Link>
          </div>
        )}

        <p className="text-green-800 text-lg mt-4 text-center">
          Para personas que quieran enviar dinero a terceros, esta operación debe
          ser realizada mediante la atención de un asesor.
        </p>

        <div className="flex justify-center mt-2">
          <svg
            className="w-6 h-6 text-green-800  animate-pulse rotate-0  lg:-rotate-90"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>

   
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <ModalOperacion
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            user={user}
            monto={monto}
            conversion={conversion}
            tasa={modo === "BOBtoPEN" ? tasaBOBtoPEN : tasaPENtoBOB}
            modo={modo} // 🔹 se manda el código
            modoDescripcion={modoDescripcion} // 🔹 se manda texto legible
            bancos={bancos}
          />
        </div>
      )}
    </>
  );
}
