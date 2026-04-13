import { useState } from "react";
import axios from "axios";

/**
 * Encapsula toda la lógica de negocio del conversor de divisas:
 * - cálculo de conversión
 * - validaciones de mínimos y KYC
 * - control de qué modal está activo
 *
 * @returns {object} estado y acciones listas para usar en el componente
 */
export function useCambioDivisas({ tasas, transferConfig, user }) {
  const { compra = 0.54, venta = 0.54 } = tasas || {};
  const tasaBOBtoPEN = venta || 1.96;
  const tasaPENtoBOB = compra || 1.94;

  const MINIMO_PEN      = transferConfig?.min_pen       ?? 20;
  const MINIMO_BOB      = transferConfig?.min_bob       ?? 60;
  const LIMITE_KYC_PEN  = transferConfig?.kyc_limit_pen ?? 300;
  const LIMITE_KYC_BOB  = transferConfig?.kyc_limit_bob ?? 1000;

  const [monto, setMonto]       = useState("");
  const [conversion, setConversion] = useState("");
  const [modo, setModo]         = useState("PENtoBOB"); // "PENtoBOB" | "BOBtoPEN"
  const [error, setError]       = useState("");

  // null → ninguno abierto
  // "selector"      → modal de selección de método
  // "transferencia" → flujo bancario
  // "efectivo"      → flujo efectivo
  // "qr"            → flujo QR
  const [modalActivo, setModalActivo] = useState(null);

  // ── helpers ───────────────────────────────────────────────

  const calcularConversion = (valor, modoActual) =>
    modoActual === "BOBtoPEN"
      ? (valor / tasaBOBtoPEN).toFixed(2)
      : (valor * tasaPENtoBOB).toFixed(2);

  // ── acciones ──────────────────────────────────────────────

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
    setConversion(calcularConversion(valor, modo));
  };

  const toggleModo = () => {
    const nuevoModo = modo === "BOBtoPEN" ? "PENtoBOB" : "BOBtoPEN";
    setModo(nuevoModo);
    if (monto && !isNaN(monto)) {
      setConversion(calcularConversion(monto, nuevoModo));
    }
  };

  const iniciarOperacion = async () => {
    if (!monto || !conversion) {
      setError("Debes ingresar un monto válido para iniciar la operación.");
      return;
    }

    const montoNum = parseFloat(monto);

    if (modo === "PENtoBOB" && montoNum < MINIMO_PEN) {
      setError(`El monto mínimo es S/ ${MINIMO_PEN}.`);
      return;
    }
    if (modo === "BOBtoPEN" && montoNum < MINIMO_BOB) {
      setError(`El monto mínimo es Bs ${MINIMO_BOB}.`);
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

    const requiereKyc =
      (modo === "PENtoBOB" && montoNum > LIMITE_KYC_PEN) ||
      (modo === "BOBtoPEN" && montoNum > LIMITE_KYC_BOB);

    if (requiereKyc && (user.kyc_status === "pending" || user.kyc_status === "rejected")) {
      try {
        alert("Debes completar tu KYC antes de continuar.");
        const response = await axios.post("/kyc/session", {
          next_url: window.location.origin + "/kyc/resultado",
        });
        if (!response.data.redirect_url) throw new Error("No se recibió redirect_url");
        window.location.href = response.data.redirect_url;
      } catch (err) {
        console.error("Error KYC:", err);
        if (err.response) console.log("response error:", err.response.data);
        alert("Error iniciando verificación KYC");
      }
      return;
    }

    setError("");
    setModalActivo("selector");
  };

  // ── valores derivados ─────────────────────────────────────

  const tasa = modo === "BOBtoPEN" ? tasaBOBtoPEN : tasaPENtoBOB;
  const modoDescripcion = modo === "BOBtoPEN" ? "Bolivianos → Soles" : "Soles → Bolivianos";

  return {
    // estado
    monto,
    conversion,
    modo,
    error,
    setError,
    // tasas
    tasa,
    tasaBOBtoPEN,
    tasaPENtoBOB,
    modoDescripcion,
    // acciones
    handleCambio,
    toggleModo,
    iniciarOperacion,
    // control de modales
    modalActivo,
    setModalActivo,
  };
}
