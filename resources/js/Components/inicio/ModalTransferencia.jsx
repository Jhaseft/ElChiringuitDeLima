import { X } from "lucide-react";
import { useState } from "react";

export default function ModalTransferencia({ isOpen, onClose, user, monto, conversion, tipoCambio, cuentaOrigen, cuentaDestino }) {
  const [comprobante, setComprobante] = useState(null);

  if (!isOpen) return null;

  const handleUpload = (e) => {
    setComprobante(e.target.files[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-2">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative animate-fadeIn max-h-[90vh] overflow-y-auto mt-11">
        
        {/* Botón cerrar */}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition"
          onClick={onClose}
        >
          <X size={22} />
        </button>

        <h2 className="text-lg md:text-xl font-bold mb-6 text-center text-gray-800">
          Resumen de la Operación
        </h2>

        {/* 🔹 Tabla resumen */}
        <div className="border rounded-lg bg-gray-50 p-4 mb-4 text-sm">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="font-semibold pr-2">Monto a enviar:</td>
                <td>{monto} {user.nationality === "peruano" ? "PEN" : "BOB"}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-2">Monto a recibir:</td>
                <td>{conversion} {user.nationality === "peruano" ? "BOB" : "PEN"}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-2">Cuenta de origen:</td>
                <td>{cuentaOrigen?.banco} - {cuentaOrigen?.numeroCuenta}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-2">Cuenta de destino:</td>
                <td>{cuentaDestino?.banco} - {cuentaDestino?.numeroCuenta}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Texto adicional */}
        <p className="text-sm text-gray-700 mb-4 e text-center">
          Por favor, realice el depósito de <strong>1 sol</strong>
        </p>

        {/* Contenido según nacionalidad */}
        {user.nationality === "peruano" ? (
          <div className="space-y-3 mb-4">
            {/* BCP */}
            <div className="border rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">BCP</p>
                <p>Cuenta: <span className="font-mono text-blue-600">2857225132017</span></p>
                <p className="text-xs text-gray-600">TITULAR: INVERSIONES TECNOLOGICAS ATOQ</p>
              </div>
              <button
                className="text-sm text-blue-600 hover:underline"
                onClick={() => navigator.clipboard.writeText("2857225132017")}
              >
                Copiar
              </button>
            </div>
            {/* Interbank */}
            <div className="border rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">Interbank</p>
                <p>Cuenta: <span className="font-mono text-green-600">4203007400062</span></p>
                <p className="text-xs text-gray-600">TITULAR: CELL SHOP SAC</p>
              </div>
              <button
                className="text-sm text-blue-600 hover:underline"
                onClick={() => navigator.clipboard.writeText("4203007400062")}
              >
                Copiar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center mb-4">
            <img
              src="/qr_banco_union.png"
              alt="QR Banco Unión"
              className="w-48 h-48 border rounded-lg shadow"
            />
            <p className="text-center text-gray-600 text-sm mt-2">
              Escanee este QR con su app bancaria
            </p>
          </div>
        )}

        {/* Subir comprobante */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">
            Subir comprobante
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleUpload}
            className="w-full text-sm"
          />
          {comprobante && (
            <p className="text-xs text-green-600 mt-1">
              Archivo cargado: {comprobante.name}
            </p>
          )}
        </div>

        {/* Aviso horario */}
        <div className="bg-yellow-50 text-yellow-700 text-xs p-3 rounded-lg mb-4">
          <strong>Atención fuera de horario:</strong> Tu operación será procesada al siguiente día hábil.
        </div>

        {/* Botones */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="bg-red-500 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-600 transition"
          >
            Atrás
          </button>
          <button
            disabled={!comprobante}
            className={`bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 transition ${
              !comprobante ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Enviar Comprobante
          </button>
        </div>
      </div>
    </div>
  );
}
