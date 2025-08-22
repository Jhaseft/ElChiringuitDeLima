import { useState } from "react";
import { X } from "lucide-react";
import ModalCuentaBancaria from "./ModalCuentaBancaria";

export default function ModalOperacion({ isOpen, onClose, user }) {
  const [juramento, setJuramento] = useState(false);
  const [terminos, setTerminos] = useState(false);

  // Estados para mostrar los modales de cuentas
  const [openCuentaOrigen, setOpenCuentaOrigen] = useState(false);
  const [openCuentaDestino, setOpenCuentaDestino] = useState(false);

  // Datos guardados de cuentas
  const [cuentaOrigen, setCuentaOrigen] = useState(null);
  const [cuentaDestino, setCuentaDestino] = useState(null);

  if (!isOpen) return null;

  return (
    <>
      {/* Modal principal */}
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 px-2">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
          {/* Botón cerrar */}
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X />
          </button>

          <h2 className="text-lg font-bold mb-4 text-center">
            Registro de Transferencia
          </h2>

          {/* Tipo de persona */}
          <div className="mb-4">
            <input
              type="text"
              readOnly
              value="Persona Natural"
              className="w-full border rounded-lg px-3 py-2 text-sm font-semibold bg-gray-100 text-gray-700"
            />
          </div>

          {/* Datos del usuario */}
          <div className="mb-4 text-sm border p-3 rounded-lg bg-gray-50">
            <p>
              <strong>Nombre:</strong> {user.first_name} {user.last_name}
            </p>
            <p>
              <strong>CI:</strong> {user.document_number || "N/A"}
            </p>
          </div>

          {/* Cuentas */}
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2">
              Número de Cuenta Origen
            </p>
            {!cuentaOrigen ? (
              <button
                onClick={() => setOpenCuentaOrigen(true)}
                className="w-full border border-green-500 text-green-600 py-2 rounded-lg text-sm font-semibold hover:bg-green-50"
              >
                + Agrega una cuenta bancaria
              </button>
            ) : (
              <div className="border rounded-lg p-3 bg-gray-50 text-sm">
                <p>
                  <strong>Banco:</strong> {cuentaOrigen.banco}
                </p>
                <p>
                  <strong>Número:</strong> {cuentaOrigen.numeroCuenta}
                </p>
                <button
                  onClick={() => setOpenCuentaOrigen(true)}
                  className="text-xs text-blue-500 mt-2 hover:underline"
                >
                  Cambiar cuenta
                </button>
              </div>
            )}
          </div>

          <div className="mb-4">
            <p className="text-sm font-semibold mb-2">
              Número de Cuenta Destino
            </p>
            {!cuentaDestino ? (
              <button
                onClick={() => setOpenCuentaDestino(true)}
                className="w-full border border-green-500 text-green-600 py-2 rounded-lg text-sm font-semibold hover:bg-green-50"
              >
                + Agrega una cuenta bancaria
              </button>
            ) : (
              <div className="border rounded-lg p-3 bg-gray-50 text-sm">
                <p>
                  <strong>Banco:</strong> {cuentaDestino.banco}
                </p>
                <p>
                  <strong>Número:</strong> {cuentaDestino.numeroCuenta}
                </p>
                <button
                  onClick={() => setOpenCuentaDestino(true)}
                  className="text-xs text-blue-500 mt-2 hover:underline"
                >
                  Cambiar cuenta
                </button>
              </div>
            )}
          </div>

          {/* Políticas */}
          <div className="mb-4 text-xs text-gray-600 flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={juramento}
                onChange={() => setJuramento(!juramento)}
              />
              Declaro bajo juramento que la información registrada en el
              presente formulario es veraz y exacta
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={terminos}
                onChange={() => setTerminos(!terminos)}
              />
              Acepto los{" "}
              <span className="text-blue-600 underline cursor-pointer">
                Términos y condiciones y la Política de privacidad
              </span>
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-700"
            >
              Cancelar
            </button>
            <button
              className={`bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 ${
                !(juramento && terminos) ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!(juramento && terminos)}
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
        onSave={(data) => setCuentaOrigen(data)}
      />

      {/* Modal cuenta destino */}
      <ModalCuentaBancaria
        isOpen={openCuentaDestino}
        onClose={() => setOpenCuentaDestino(false)}
        user={user}
        onSave={(data) => setCuentaDestino(data)}
      />
    </>
  );
}
