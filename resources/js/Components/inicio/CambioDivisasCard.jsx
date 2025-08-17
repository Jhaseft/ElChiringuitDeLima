import { useState } from "react";
import { usePage, Link } from "@inertiajs/react";
import { RefreshCw } from "lucide-react";

export default function CambioDivisasCard({ tasas }) {
  const { auth } = usePage().props;
  const user = auth?.user ?? null;

  const [monto, setMonto] = useState("");
  const [conversion, setConversion] = useState("");
  const [modo, setModo] = useState("BOBtoPEN");

 const { buy = 0, sale = 0 } = tasas || {}; // Evita undefined
  const tasaBOBtoPEN = buy || 0.54;
  const tasaPENtoBOB = sale ?  sale : 1 / 0.54;

  const handleCambio = (valor) => {
    setMonto(valor);
    if (!valor || isNaN(valor)) {
      setConversion("");
      return;
    }
    if (modo === "BOBtoPEN") {
      setConversion((valor * tasaBOBtoPEN).toFixed(2));
    } else {
      setConversion((valor * tasaPENtoBOB).toFixed(2));
    }
  };

  const toggleModo = () => {
    setModo(modo === "BOBtoPEN" ? "PENtoBOB" : "BOBtoPEN");
    setMonto("");
    setConversion("");
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4 border border-gray-100 max-w-md w-full mx-auto sm:max-w-lg lg:max-w-xl">
      {/* Título */}
      <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-center mb-1 bg-gradient-to-r from-green-700 to-green-500 text-transparent bg-clip-text">
        CAPITAL DE CAMBIO
      </h2>
      <p className="text-center text-xs sm:text-sm text-gray-600 tracking-wide">
        CAMBIA DE FORMA RÁPIDA Y SEGURA
      </p>

      {/* Tasas */}
      <div className="text-center text-xs sm:text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border">
        <p>
          💱 <span className="font-semibold">1 BOB</span> = {tasaBOBtoPEN} PEN
        </p>
        <p>
          💱 <span className="font-semibold">1 PEN</span> = {tasaPENtoBOB.toFixed(2)} BOB
        </p>
      </div>

      {/* Inputs */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:gap-3">
        <div className="flex flex-col w-full">
          <label className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">
            {modo === "BOBtoPEN" ? "Tienes Bolivianos" : "Tienes Soles"}
          </label>
          <input
            type="number"
            value={monto}
            onChange={(e) => handleCambio(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm w-full"
          />
        </div>

        {/* Botón swap */}
        <div className="flex justify-center my-2 sm:my-0">
          <button
            onClick={toggleModo}
            className="p-2 bg-green-100 rounded-full hover:bg-green-200 transition"
          >
            <RefreshCw className="w-5 h-5 text-green-700" />
          </button>
        </div>

        <div className="flex flex-col w-full">
          <label className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">
            {modo === "BOBtoPEN" ? "Recibes Soles" : "Recibes Bolivianos"}
          </label>
          <input
            type="text"
            value={conversion}
            readOnly
            className="border rounded-lg px-3 py-2 text-sm bg-gray-50 shadow-sm w-full"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button className="bg-green-700 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-800 transition-all shadow-md">
          INICIAR UNA OPERACIÓN
        </button>
        <button className="bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-all shadow-md">
          CAMBIAR CON UN ASESOR
        </button>
      </div>

      {/* Login / Registro */}
      {!user && (
        <div className="flex flex-col sm:flex-row gap-2 justify-center mt-1">
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

      {/* Info */}
      <div className="mt-4 text-[11px] sm:text-xs text-gray-500">
        <p className="font-medium">Nuestro horario de atención es:</p>
        <ul className="mt-1 list-disc list-inside space-y-1">
          <li>🇵🇪 Perú: Lun-Vie 9:00-18:00, Sáb 9:00-13:00</li>
          <li>🇧🇴 Bolivia: Lun-Vie 8:00-17:00, Sáb 9:00-13:00</li>
        </ul>
        <p className="mt-2 text-yellow-700 bg-yellow-100 p-2 rounded-md text-[10px] sm:text-[11px] text-center shadow-sm">
          ⚠️ Las operaciones fuera de horario serán procesadas el siguiente día hábil.
        </p>
      </div>
    </div>
  );
}
