import { useState } from "react";
import { X } from "lucide-react";
import { bancosBolivia, bancosPeru } from "/public/data/bancos";
import BankSelect from "./BankSelect";

export default function ModalCuentaDestino({ isOpen, onClose, onSave, nationality }) {
  const [form, setForm] = useState({
    banco: "",
    nombrePropietario: "",
    dniPropietario: "",
    contacto: "",
    numeroCuenta: "",
    juramento: false,
    terminos: false,
  });

  if (!isOpen) return null;

  const bancosDisponibles = nationality === "boliviano" ? bancosPeru : bancosBolivia;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      onSave(form);
      onClose();
    }
  };

  // ✅ Validación: todos los campos llenos + checkboxes activados
  const isFormValid =
    form.banco &&
    form.nombrePropietario &&
    form.dniPropietario &&
    form.contacto &&
    form.numeroCuenta &&
    form.juramento &&
    form.terminos;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-2">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X />
        </button>

        <h2 className="text-lg font-bold mb-4 text-center">
          Registrar nueva cuenta destino
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Combo box banco */}
          <div>
            <label className="block text-sm font-medium">Banco</label>
            <BankSelect
              options={bancosDisponibles}
              value={form.banco}
              onChange={(val) => setForm({ ...form, banco: val })}
            />
          </div>

          {/* Datos propietario */}
          <div className="border p-3 rounded-lg">
            <p className="text-sm font-semibold mb-2">Datos del propietario</p>
            <input
              type="text"
              name="nombrePropietario"
              placeholder="Nombre completo"
              value={form.nombrePropietario}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mb-2"
            />
            <input
              type="text"
              name="dniPropietario"
              placeholder="DNI"
              value={form.dniPropietario}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mb-2"
            />
            <input
              type="text"
              name="contacto"
              placeholder="Número de contacto"
              value={form.contacto}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />
          </div>

          {/* Número de cuenta */}
          <div>
            <input
              type="text"
              name="numeroCuenta"
              placeholder="Número de cuenta"
              value={form.numeroCuenta}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />
          </div>

          {/* Políticas */}
          <div className="border p-3 rounded-lg text-xs text-gray-600 flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="juramento"
                checked={form.juramento}
                onChange={handleChange}
              />
              Declaro bajo juramento que soy responsable de la cuenta registrada.
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="terminos"
                checked={form.terminos}
                onChange={handleChange}
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
              type="button"
              onClick={onClose}
              className="bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className={`bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 ${
                !isFormValid ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
