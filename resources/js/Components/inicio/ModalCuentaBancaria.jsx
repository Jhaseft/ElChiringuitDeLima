import { useState } from "react";
import { X } from "lucide-react";

export default function ModalCuentaBancaria({ isOpen, onClose, user, onSave }) {
  const [banco, setBanco] = useState("");
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [juramento, setJuramento] = useState(false);
  const [terminos, setTerminos] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (juramento && terminos && banco && numeroCuenta) {
      onSave({ banco, numeroCuenta });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-2">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        {/* Botón cerrar */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X />
        </button>

        <h2 className="text-lg font-bold mb-4 text-center">
          Registrando nueva cuenta bancaria
        </h2>

        {/* Datos propietario */}
        <div className="mb-4 border p-3 rounded-lg bg-gray-50 text-sm">
          <p>
            <strong>Nombre:</strong> {user.first_name} {user.last_name}
          </p>
          <p>
            <strong>CI:</strong> {user.document_number || "N/A"}
          </p>
        </div>

        {/* Selección de banco */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Bancos</label>
          <select
            value={banco}
            onChange={(e) => setBanco(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Selecciona un banco</option>
            <option value="Banco Nacional">Banco Nacional</option>
            <option value="Banco Internacional">Banco Internacional</option>
            <option value="Banco de Crédito BCP">Banco de Crédito BCP</option>
            <option value="Banco Mercantil Santa Cruz">Banco Mercantil Santa Cruz</option>
            <option value="Banco Unión">Banco Unión</option>
            <option value="Banco FIE">Banco FIE</option>
            <option value="Banco Ganadero">Banco Ganadero</option>
            <option value="Banco BISA">Banco BISA</option>
            <option value="BancoSol">BancoSol</option>
            <option value="Banco Prodem">Banco Prodem</option>
            <option value="Banco Fortaleza">Banco Fortaleza</option>
            <option value="Banco Económico">Banco Económico</option>
            <option value="Banco Los Andes">Banco Los Andes</option>
            <option value="Banco Privado de Inversión">Banco Privado de Inversión</option>
            {/* Puedes seguir añadiendo más */}
          </select>
        </div>

        {/* Número cuenta */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">
            Número de Cuenta
          </label>
          <input
            type="text"
            value={numeroCuenta}
            onChange={(e) => setNumeroCuenta(e.target.value)}
            placeholder="Ej: 1234567890"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {/* Políticas legales */}
        <div className="mb-4 text-xs text-gray-600 flex flex-col gap-2">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={juramento}
              onChange={() => setJuramento(!juramento)}
            />
            Declaro bajo juramento que soy el titular y responsable de la cuenta
            bancaria registrada, y que la información proporcionada es veraz y
            exacta.
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={terminos}
              onChange={() => setTerminos(!terminos)}
            />
            Acepto los{" "}
            <span className="text-blue-600 underline cursor-pointer">
              Términos y condiciones y la Política de privacidad
            </span>
            .
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
            onClick={handleSave}
            disabled={!(juramento && terminos && banco && numeroCuenta)}
            className={`bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 ${
              !(juramento && terminos && banco && numeroCuenta)
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
