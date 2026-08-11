import { useEffect, useRef, useState } from "react";

/**
 * Verificación por código de 6 dígitos (estilo OTP).
 * - 6 casillas separadas, sin botón: al completarse se envía solo.
 * - Soporta pegar el código completo y navegar con backspace/flechas.
 */
export default function CodeVerification({
  email,
  onComplete,   // (code: string) => void
  onResend,     // () => void
  loading = false,
  error = "",
}) {
  const LENGTH = 6;
  const [digits, setDigits] = useState(Array(LENGTH).fill(""));
  const inputsRef = useRef([]);
  const submittedRef = useRef(false);

  // Foco inicial en la primera casilla.
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // Al completar los 6 dígitos → enviar automáticamente (una sola vez).
  useEffect(() => {
    const code = digits.join("");
    if (code.length === LENGTH && !digits.includes("") && !submittedRef.current) {
      submittedRef.current = true;
      onComplete(code);
    }
  }, [digits]); // eslint-disable-line react-hooks/exhaustive-deps

  // Si hubo error, permitir reintentar (se limpia y se reactiva el auto-envío).
  useEffect(() => {
    if (error) {
      submittedRef.current = false;
      setDigits(Array(LENGTH).fill(""));
      inputsRef.current[0]?.focus();
    }
  }, [error]);

  const setDigit = (index, value) => {
    const clean = value.replace(/\D/g, "");
    setDigits((prev) => {
      const next = [...prev];
      next[index] = clean.slice(-1); // solo el último dígito
      return next;
    });
    if (clean && index < LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        setDigit(index, "");
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        setDigits((prev) => {
          const next = [...prev];
          next[index - 1] = "";
          return next;
        });
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    const next = Array(LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const focusIndex = Math.min(pasted.length, LENGTH - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold text-white">Confirma tu registro</h2>
      <p className="mt-2 text-center text-sm text-gray-400">
        Ingresa el código de 6 dígitos que enviamos a{" "}
        <span className="font-semibold text-yellow-400">{email}</span>
      </p>

      <div className="mt-6 flex gap-2 sm:gap-3" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            disabled={loading}
            onChange={(e) => setDigit(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="h-14 w-11 sm:h-16 sm:w-12 rounded-xl border-2 border-gray-600 bg-gray-900 text-center text-2xl font-bold text-white focus:border-yellow-400 focus:outline-none disabled:opacity-50"
          />
        ))}
      </div>

      {loading && (
        <p className="mt-4 text-sm text-gray-400">Verificando...</p>
      )}

      {error && (
        <p className="mt-4 text-center text-sm text-red-400">{error}</p>
      )}

      <button
        type="button"
        onClick={onResend}
        disabled={loading}
        className="mt-6 text-sm text-yellow-400 hover:underline disabled:opacity-50"
      >
        Reenviar código
      </button>
    </div>
  );
}
