import { useState } from "react";
import { X } from "lucide-react";
import ModalCuentaBancaria from "./ModalCuentaBancaria";
import ModalCuentaDestino from "./ModalCuentaDestino";
import ModalTransferencia from "./ModalTransferencia";

export default function ModalOperacion({ isOpen, onClose, user, monto, conversion, modo, tipoCambio }) {
  const [juramento, setJuramento] = useState(false);
  const [terminos, setTerminos] = useState(false);

  // Estados de modales de cuentas
  const [openCuentaOrigen, setOpenCuentaOrigen] = useState(false);
  const [openCuentaDestino, setOpenCuentaDestino] = useState(false);

  // Estado del modal de transferencia
  const [openTransferencia, setOpenTransferencia] = useState(false);

  // Datos guardados
  const [cuentaOrigen, setCuentaOrigen] = useState(null);
  const [cuentaDestino, setCuentaDestino] = useState(null);

  if (!isOpen) return null;

  return (
    <>
      {/* Fondo oscuro */}
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-2">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-4 md:p-6 relative animate-fadeIn max-h-[90vh] overflow-y-auto mt-11">
          {/* Botón cerrar */}
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition"
            onClick={onClose}
          >
            <X size={22} />
          </button>

          <h2 className="text-lg md:text-xl font-bold mb-6 text-center text-gray-800">
            Registro de Operación
          </h2>

          {/* Info operación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
            <div className="border rounded-lg bg-gray-50 p-3">
              <p className="font-semibold text-gray-700">Monto</p>
              <p className="text-gray-800">{monto}</p>
            </div>
            <div className="border rounded-lg bg-gray-50 p-3">
              <p className="font-semibold text-gray-700">Conversión</p>
              <p className="text-gray-800">{conversion}</p>
            </div>
          </div>

          {/* Tipo de persona */}
          <div className="mb-4">
            <input
              type="text"
              readOnly
              value="Persona Natural"
              className="w-full border rounded-lg px-3 py-2 text-sm font-semibold bg-gray-100 text-gray-700"
            />
          </div>

          {/* Datos usuario */}
          <div className="mb-4 text-sm border p-3 rounded-lg bg-gray-50">
            <p>
              <strong>Nombre:</strong> {user.first_name} {user.last_name}
            </p>
            <p>
              <strong>CI:</strong> {user.document_number || "N/A"}
            </p>
          </div>

          {/* Cuenta origen */}
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2">Cuenta Origen</p>
            {!cuentaOrigen ? (
              <button
                onClick={() => setOpenCuentaOrigen(true)}
                className="w-full border border-blue-500 text-blue-600 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition"
              >
                + Agregar cuenta bancaria
              </button>
            ) : (
              <div className="border rounded-lg p-3 bg-gray-50 text-sm">
                <p><strong>Banco:</strong> {cuentaOrigen.banco}</p>
                <p><strong>Número:</strong> {cuentaOrigen.numeroCuenta}</p>
                <button
                  onClick={() => setOpenCuentaOrigen(true)}
                  className="text-xs text-blue-500 mt-2 hover:underline"
                >
                  Cambiar cuenta
                </button>
              </div>
            )}
          </div>

          {/* Cuenta destino */}
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2">Cuenta Destino</p>
            {!cuentaDestino ? (
              <button
                onClick={() => setOpenCuentaDestino(true)}
                className="w-full border border-green-500 text-green-600 py-2 rounded-lg text-sm font-semibold hover:bg-green-50 transition"
              >
                + Agregar cuenta bancaria
              </button>
            ) : (
              <div className="border rounded-lg p-3 bg-gray-50 text-sm">
                <p><strong>Banco:</strong> {cuentaDestino.banco}</p>
                <p><strong>Número:</strong> {cuentaDestino.numeroCuenta}</p>
                <button
                  onClick={() => setOpenCuentaDestino(true)}
                  className="text-xs text-green-600 mt-2 hover:underline"
                >
                  Cambiar cuenta
                </button>
              </div>
            )}
          </div>

          {/* Políticas */}
          <div className="mb-4 text-xs text-gray-600 flex flex-col gap-2">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={juramento}
                onChange={() => setJuramento(!juramento)}
              />
              <span>
                Declaro bajo juramento que la información registrada es veraz y exacta.
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={terminos}
                onChange={() => setTerminos(!terminos)}
              />
              <span>
                Acepto los{" "}
                <span className="text-blue-600 underline cursor-pointer">
                  Términos y condiciones y la Política de privacidad
                </span>
              </span>
            </label>
          </div>

          {/* Botones */}
          <div className="flex flex-col md:flex-row md:justify-end gap-2">
            <button
              onClick={onClose}
              className="bg-red-500 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-600 transition w-full md:w-auto"
            >
              Cancelar
            </button>
            <button
              onClick={() => setOpenTransferencia(true)}
              className={`bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 transition w-full md:w-auto ${!(juramento && terminos && cuentaOrigen && cuentaDestino)
                ? "opacity-50 cursor-not-allowed"
                : ""
                }`}
              disabled={!(juramento && terminos && cuentaOrigen && cuentaDestino)}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal cuenta origen */}
      <ModalCuentaBancaria
        isOpen={openCuentaOrigen}
        onClose={() => setOpenCuentaOrigen(false)}
        user={user}
        nationality={user.nationality}
        onSave={(data) => setCuentaOrigen(data)}
      />

      {/* Modal cuenta destino */}
      <ModalCuentaDestino
        isOpen={openCuentaDestino}
        onClose={() => setOpenCuentaDestino(false)}
        nationality={user.nationality}
        onSave={(data) => setCuentaDestino(data)}
      />

      {/* Modal transferencia */}
      <ModalTransferencia
        isOpen={openTransferencia}
        onClose={() => setOpenTransferencia(false)}
        user={user}
        monto={monto}
        conversion={conversion}
        tipoCambio={tipoCambio}
        cuentaOrigen={cuentaOrigen}
        cuentaDestino={cuentaDestino}
      />
    </>
  );
}
