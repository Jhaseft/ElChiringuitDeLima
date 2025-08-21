import { useState } from "react";
import { usePage, Link } from "@inertiajs/react";
import { RefreshCw } from "lucide-react";

export default function CambioDivisasCard({ tasas }) {
  const { auth } = usePage().props;
  const user = auth?.user ?? null;

  const [monto, setMonto] = useState("");
  const [conversion, setConversion] = useState("");
  const [modo, setModo] = useState("BOBtoPEN");

  const { compra = 0.54, venta = 0.54 } = tasas || {};
  const tasaBOBtoPEN = venta || 1.96;
  const tasaPENtoBOB = compra || 1.94;

  const handleCambio = (valor) => {
    setMonto(valor);
    if (!valor || isNaN(valor)) {
      setConversion("");
      return;
    }
    if (modo === "BOBtoPEN") {
      setConversion((valor / tasaBOBtoPEN).toFixed(2));
    } else {
      setConversion((valor * tasaPENtoBOB).toFixed(2));
    }
  };

  const toggleModo = () => {
    const nuevoModo = modo === "BOBtoPEN" ? "PENtoBOB" : "BOBtoPEN";
    setModo(nuevoModo);
    if (!monto || isNaN(monto)) {
      setConversion("");
      return;
    }
    if (nuevoModo === "BOBtoPEN") {
      setConversion((monto / tasaBOBtoPEN).toFixed(2));
    } else {
      setConversion((monto * tasaPENtoBOB).toFixed(2));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4 border border-gray-100 max-w-md w-full mx-auto sm:max-w-lg lg:max-w-xl">
      
      {/* Título y Logo */}
      <div className="flex flex-col items-center mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
          TransferCash
        </h1>
        <p className="text-sm sm:text-base text-gray-500 text-center">
          Cambio de forma rápida y segura
        </p>
        {/* Espacio para logo */}
        <div className="my-3 w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <img src="/images/logo.jpg" alt="Logo" className="my-3 w-20 h-20 object-contain rounded-full" />

        </div>
      </div>

      {/* Tasas arriba */}
      <div className="flex justify-between text-sm sm:text-base font-semibold">
        <span className="text-blue-700">
          COMPRA: <span className="font-bold">{tasaPENtoBOB.toFixed(2)}</span>
        </span>
        <span className="text-green-700">
          VENTA: <span className="font-bold">{tasaBOBtoPEN.toFixed(2)}</span>
        </span>
      </div>

      {/* Inputs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
        <div className="flex flex-col w-full">
          <label className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 text-center">
            {modo === "BOBtoPEN" ? "TIENES BOLIVIANOS" : "TIENES SOLES"}
          </label>
          <input
            type="number"
            value={monto}
            onChange={(e) => handleCambio(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm text-center font-semibold focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm w-full"
          />
        </div>

        <div className="flex justify-center my-3 sm:my-0">
          <button
            onClick={toggleModo}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition shadow-sm"
          >
            <RefreshCw className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="flex flex-col w-full">
          <label className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 text-center">
            {modo === "BOBtoPEN" ? "RECIBES SOLES" : "RECIBES BOLIVIANOS"}
          </label>
          <input
            type="text"
            value={conversion}
            readOnly
            className="border rounded-lg px-3 py-2 text-sm text-center font-semibold bg-gray-50 shadow-sm w-full"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        <button className="bg-green-700 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-800 transition-all shadow-md">
          INICIAR UNA OPERACIÓN
        </button>
        <button className="bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-all shadow-md">
          CAMBIAR CON UN ASESOR
        </button>
      </div>

      {/* Login / Registro */}
      {!user && (
        <div className="flex flex-col sm:flex-row gap-2 justify-center mt-2">
          <Link
            href="/login"
            className="flex-1 text-center py-2 rounded-lg text-sm font-semibold border border-green-500 text-green-600 hover:bg-green-50 transition"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="flex-1 text-center py-2 rounded-lg text-sm font-semibold bg-green-500 text-white hover:bg-green-600 transition"
          >
            Registrarse
          </Link>
        </div>
      )}
    </div>
  );
}
