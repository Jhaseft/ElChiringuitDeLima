import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import BankSelect from "./BankSelect";

let bancosCache = null;

export default function ModalCuentaDestino({
  bancos,
  isOpen,
  onClose,
  onCuentaGuardada,
  user,
  nationality,
}) {
  const [form, setForm] = useState({
    banco: null,
    nombrePropietario: "",
    dniPropietario: "",
    contacto: "",
    numeroCuenta: "",
    juramento: false,
    terminos: false,
  });
  const [bancosDisponibles, setBancosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
  const accountType = "destination";

  // Reset formulario cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) {
      setForm({
        banco: null,
        nombrePropietario: "",
        dniPropietario: "",
        contacto: "",
        numeroCuenta: "",
        juramento: false,
        terminos: false,
      });
    }
  }, [isOpen]);

  // Filtrado de bancos
useEffect(() => {
  if (!isOpen) return;

  const fetchBancos = async () => {
    try {
      let data = bancosCache || bancos;
      if (!data || data.length === 0) {
        const res = await fetch("/operacion/listar-bancos");
        if (!res.ok) throw new Error("Error al listar bancos");
        data = await res.json();
        bancosCache = data;
      }

      // 👇 Ordenamos: bancos de Perú primero
      const ordenados = [...data].sort((a, b) => {
        if (a.country.toLowerCase() === "peru" && b.country.toLowerCase() !== "peru") return -1;
        if (a.country.toLowerCase() !== "peru" && b.country.toLowerCase() === "peru") return 1;
        return 0; // si son del mismo país, se quedan como están
      });

      setBancosDisponibles(ordenados);
    } catch (err) {
      console.error("Error al listar bancos:", err);
    }
  };

  fetchBancos();
}, [isOpen, bancos]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const isFormValid =
    form.banco &&
    form.nombrePropietario &&
    form.dniPropietario &&
    form.contacto &&
    form.numeroCuenta &&
    form.juramento &&
    form.terminos;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    try {
      const bankId = form.banco.id ?? form.banco.value;

      const res = await fetch("/operacion/guardar-cuenta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
          Accept: "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          account_type: accountType,
          bank_id: bankId,
          account_number: form.numeroCuenta,
          owner_full_name: form.nombrePropietario,
          owner_document: form.dniPropietario,
          owner_phone: form.contacto,
        }),
      });

      const text = await res.text();
      if (text.startsWith("<!DOCTYPE html>") || text.startsWith("<html")) {
        console.error("Respuesta HTML inesperada:", text);
        if (res.status === 419) alert("Sesión expirada. Recarga la página.");
        else if (res.status === 401) alert("No autorizado. Inicia sesión.");
        else alert("Error inesperado del servidor.");
        return;
      }

      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.message || "Error en el servidor");

      onCuentaGuardada && onCuentaGuardada(data);
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.message || "Error al guardar la cuenta destino");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-2">
      {/* Overlay de cargando */}
      {loading && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/60 text-white">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-semibold">Guardando cuenta...</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          disabled={loading}
        >
          <X />
        </button>
        <h2 className="text-lg font-bold mb-4 text-center">
          Registrar nueva cuenta destino
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Banco</label>
            <BankSelect
              options={bancosDisponibles}
              value={form.banco}
              onChange={(val) => setForm({ ...form, banco: val })}
            />
          </div>

          <div className="border p-3 rounded-lg">
            <p className="text-sm font-semibold mb-2">Datos del propietario</p>
            <input
              type="text"
              name="nombrePropietario"
              placeholder="Nombre completo"
              value={form.nombrePropietario}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mb-2"
              disabled={loading}
            />
            <input
              type="number"
              name="dniPropietario"
              placeholder="DNI"
              value={form.dniPropietario}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mb-2"
              disabled={loading}
            />
            <input
              type="number"
              name="contacto"
              placeholder="Número de contacto"
              value={form.contacto}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              disabled={loading}
            />
          </div>

          <div>
            <input
              type="number"
              name="numeroCuenta"
              placeholder="Número de cuenta"
              value={form.numeroCuenta}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              disabled={loading}
            />
          </div>

          <div className="border p-3 rounded-lg text-xs text-gray-600 flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="juramento"
                checked={form.juramento}
                onChange={handleChange}
                disabled={loading}
              />
              Declaro bajo juramento que soy responsable de la cuenta registrada.
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="terminos"
                checked={form.terminos}
                onChange={handleChange}
                disabled={loading}
              />
              Acepto los{" "}
              <a href="/politicas" className="text-blue-600 underline cursor-pointer">
                Términos y condiciones y la Política de privacidad
              </a>
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 ${
                !isFormValid || loading ? "opacity-50 cursor-not-allowed" : ""
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
