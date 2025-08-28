import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import BankSelect from "./BankSelect";

let bancosCache = null;

export default function ModalCuentaBancaria({
  bancos: bancosProp,
  isOpen,
  onClose,
  user,
  nationality,
  accountType = "origin",
  onCuentaGuardada,
}) {
  const [banco, setBanco] = useState(null);
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [juramento, setJuramento] = useState(false);
  const [terminos, setTerminos] = useState(false);
  const [bancosDisponibles, setBancosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);

  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

  useEffect(() => {
    if (!isOpen) return;

    const fetchBancos = async () => {
      try {
        let data = bancosCache || bancosProp;

        if (!data || data.length === 0) {
          const res = await fetch("/operacion/listar-bancos");
          if (!res.ok) {
            console.error("Error al listar bancos:", await res.text());
            return;
          }
          data = await res.json();
        }

        bancosCache = data;

        const pais =
          accountType === "origin"
            ? nationality.toLowerCase() === "peruano"
              ? "peru"
              : "bolivia"
            : nationality.toLowerCase() === "peruano"
            ? "bolivia"
            : "peru";

        setBancosDisponibles(
          data.filter((b) => b.country.toLowerCase() === pais)
        );
      } catch (err) {
        console.error("Error al listar bancos:", err);
      }
    };

    fetchBancos();
  }, [isOpen, nationality, accountType, bancosProp]);

  const handleSave = async () => {
    if (!(juramento && terminos && banco && numeroCuenta)) return;
    setLoading(true);

    try {
      const bankId = banco.id ?? banco.value;

      const res = await fetch("/operacion/guardar-cuenta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
          Accept: "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          bank_id: bankId,
          account_number: numeroCuenta,
          account_type: accountType,
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

      if (!res.ok) {
        let msg = data.message || "Error en el servidor";
        if (res.status === 422 && data.errors) {
          msg = Object.keys(data.errors)
            .map((k) => data.errors[k].join("\n"))
            .join("\n");
        }
        throw new Error(msg);
      }

      onCuentaGuardada && onCuentaGuardada(data);

      // Limpiar formulario después de guardar
      setBanco(null);
      setNumeroCuenta("");
      setJuramento(false);
      setTerminos(false);

      onClose();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-2">
      {/* Overlay bloqueante mientras se guarda */}
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
          Registrar nueva cuenta bancaria
        </h2>

        <div className="mb-4 border p-3 rounded-lg bg-gray-50 text-sm">
          <p>
            <strong>Nombre:</strong> {user.first_name} {user.last_name}
          </p>
          <p>
            <strong>CI:</strong> {user.document_number || "N/A"}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Banco</label>
          <BankSelect
            options={bancosDisponibles}
            value={banco}
            onChange={setBanco}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">
            Número de Cuenta
          </label>
          <input
            type="number"
            value={numeroCuenta}
            onChange={(e) => setNumeroCuenta(e.target.value)}
            placeholder="Ej: 1234567890"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            disabled={loading}
          />
        </div>

        <div className="mb-4 text-xs text-gray-600 flex flex-col gap-2">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={juramento}
              onChange={() => setJuramento(!juramento)}
              disabled={loading}
            />
            Declaro bajo juramento que soy el titular de la cuenta bancaria registrada.
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={terminos}
              onChange={() => setTerminos(!terminos)}
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
            onClick={onClose}
            disabled={loading}
            className="bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!(juramento && terminos && banco && numeroCuenta) || loading}
            className={`bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 ${
              !(juramento && terminos && banco && numeroCuenta) || loading
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
