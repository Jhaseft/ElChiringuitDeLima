import React, { useCallback, useEffect, useRef, useState } from "react";

export default function DocumentCapture({
  docType, // "ci" | "licencia" | "pasaporte"
  docFrontBlob,
  docBackBlob,
  setDocFrontBlob,
  setDocBackBlob,
  onNext,
  onBack,
}) {
  const needBack = docType !== "pasaporte"; // CI/licencia = doble cara
  const [sideIndex, setSideIndex] = useState(0); // 0 = anverso/pasaporte, 1 = reverso

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [message, setMessage] = useState("🔄 Iniciando cámara...");
  const [error, setError] = useState("");

  const [frontUrl, setFrontUrl] = useState(null);
  const [backUrl, setBackUrl] = useState(null);

  // 🔹 Detener stream activo
  const stopStream = useCallback(() => {
    try {
      const v = videoRef.current;
      const s = v ? v.srcObject : stream;
      if (s && s.getTracks) {
        s.getTracks().forEach((t) => t.stop?.());
      }
      if (v) {
        v.pause?.();
        v.srcObject = null;
      }
    } catch (e) {
      console.error("Error al detener stream:", e);
    } finally {
      setStream(null);
    }
  }, [stream]);

  // 🔹 Esperar video listo
  const waitVideoReady = useCallback(() => {
    return new Promise((resolve) => {
      const v = videoRef.current;
      if (!v) return resolve();
      if (v.readyState >= 1) return resolve();
      v.addEventListener("loadedmetadata", () => resolve(), { once: true });
    });
  }, []);

  // 🔹 Iniciar cámara siempre en modo frontal
  const startCamera = useCallback(async () => {
    stopStream();
    setError("");
    setMessage("🔄 Activando cámara frontal...");

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("❌ Tu navegador no soporta acceso a la cámara.");
      setMessage("");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }, // 👈 Siempre frontal
        audio: false,
      });

      if (!videoRef.current) return;

      videoRef.current.srcObject = mediaStream;
      videoRef.current.setAttribute("playsinline", ""); // iOS fix
      videoRef.current.muted = true;

      await waitVideoReady();
      await videoRef.current.play();

      setStream(mediaStream);
      setMessage("📷 Alinea tu documento dentro del marco y presiona Capturar.");
    } catch (e) {
      console.error(e);
      setError("❌ No se pudo activar la cámara.");
      setMessage("");
      stopStream();
    }
  }, [stopStream, waitVideoReady]);

  // 🔹 Capturar foto
  const capturePhoto = useCallback(async () => {
    try {
      const v = videoRef.current;
      const c = canvasRef.current;
      if (!v || !c) return null;

      await waitVideoReady();

      c.width = v.videoWidth || 720;
      c.height = v.videoHeight || 1280;
      const ctx = c.getContext("2d");
      ctx.drawImage(v, 0, 0, c.width, c.height);

      return await new Promise((resolve) =>
        c.toBlob((blob) => resolve(blob), "image/jpeg", 0.95)
      );
    } catch (e) {
      console.error("Error al capturar foto:", e);
      return null;
    }
  }, [waitVideoReady]);

  const takePhoto = async () => {
    setError("");
    setMessage("📸 Tomando foto...");
    const blob = await capturePhoto();
    if (blob) {
      if (sideIndex === 0) setDocFrontBlob(blob);
      else setDocBackBlob(blob);
      setMessage("✅ Foto capturada. Puedes volver a tomar si deseas.");
      stopStream();
    } else {
      setError("❌ No se pudo capturar la imagen.");
      setMessage("");
    }
  };

  const retake = async () => {
    if (sideIndex === 0) setDocFrontBlob(null);
    else setDocBackBlob(null);
    setError("");
    setMessage("📷 Alinea tu documento dentro del marco y presiona Capturar.");
    await startCamera();
  };

  const goNextSide = () => {
    if (!needBack) return onNext?.();
    if (sideIndex === 0) {
      if (!docFrontBlob) {
        setMessage("⚠️ Primero captura el anverso antes de continuar.");
        return;
      }
      setSideIndex(1);
    } else {
      onNext?.();
    }
  };

  const handleBack = () => {
    stopStream();
    setSideIndex(0); // Reset cuando vuelves
    onBack?.();
  };

  // 🔹 Gestionar URLs de imágenes
  useEffect(() => {
    if (docFrontBlob) {
      const u = URL.createObjectURL(docFrontBlob);
      setFrontUrl(u);
      return () => URL.revokeObjectURL(u);
    }
  }, [docFrontBlob]);

  useEffect(() => {
    if (docBackBlob) {
      const u = URL.createObjectURL(docBackBlob);
      setBackUrl(u);
      return () => URL.revokeObjectURL(u);
    }
  }, [docBackBlob]);

  // 🔹 Iniciar cámara al entrar a este paso
  useEffect(() => {
    const hasBlob = sideIndex === 0 ? !!docFrontBlob : !!docBackBlob;
    if (!hasBlob) startCamera();
    else stopStream();
    return () => stopStream();
  }, [sideIndex, docFrontBlob, docBackBlob, startCamera, stopStream]);

  // 🔹 Reset lado cuando cambia docType
  useEffect(() => {
    setSideIndex(0);
  }, [docType]);

  const sideLabel = needBack
    ? sideIndex === 0
      ? "📄 Anverso"
      : "📄 Reverso"
    : "📘 Pasaporte";
  const frontReady = !!docFrontBlob;
  const backReady = !needBack || !!docBackBlob;
  const canContinue = frontReady && backReady;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 max-w-md mx-auto">
      <p className="font-semibold text-lg text-center">📑 Captura del documento</p>

      {/* Mini progreso */}
      <div className="flex justify-center gap-2 text-xs">
        <span
          className={`px-2 py-1 rounded-full border ${
            frontReady
              ? "bg-green-50 border-green-400 text-green-700"
              : "bg-gray-50 border-gray-300 text-gray-600"
          }`}
        >
          {needBack ? "Anverso" : "Foto"}
        </span>
        {needBack && (
          <span
            className={`px-2 py-1 rounded-full border ${
              backReady
                ? "bg-green-50 border-green-400 text-green-700"
                : "bg-gray-50 border-gray-300 text-gray-600"
            }`}
          >
            Reverso
          </span>
        )}
      </div>

      {/* Marco de cámara */}
      <div className="relative border bg-black aspect-[3/4] rounded-lg flex items-center justify-center overflow-hidden">
        <div className="absolute inset-6 rounded-xl border-2 border-white/70 pointer-events-none"></div>

        {!((sideIndex === 0 ? docFrontBlob : docBackBlob)) ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {sideLabel}
            </div>
            <div className="absolute inset-0 flex items-center justify-center px-3 text-center">
              <p className="text-white text-sm drop-shadow animate-pulse">
                {error || message}
              </p>
            </div>
          </>
        ) : (
          <img
            src={sideIndex === 0 ? frontUrl : backUrl}
            alt={sideLabel}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Botones */}
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {!((sideIndex === 0 ? docFrontBlob : docBackBlob)) ? (
          <button
            onClick={takePhoto}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            📸 Capturar {needBack ? (sideIndex === 0 ? "anverso" : "reverso") : "foto"}
          </button>
        ) : (
          <button
            onClick={retake}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          >
            🔄 Volver a tomar
          </button>
        )}

        <button
          onClick={handleBack}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
        >
          ⬅ Atrás
        </button>

        {needBack && sideIndex === 0 ? (
          <button
            onClick={goNextSide}
            disabled={!frontReady}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded"
          >
            ➡ Siguiente (reverso)
          </button>
        ) : (
          <button
            onClick={() => onNext?.()}
            disabled={!canContinue}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded"
          >
            ➡ Siguiente
          </button>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <ul className="text-xs text-gray-500 list-disc pl-5">
        <li>Usa buena iluminación y evita reflejos.</li>
        <li>Alinea el documento dentro del marco.</li>
        <li>Mantén la cámara estable al capturar.</li>
      </ul>
    </div>
  );
}
