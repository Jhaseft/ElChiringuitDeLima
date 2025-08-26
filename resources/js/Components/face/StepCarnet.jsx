import { useState, useEffect, useRef } from "react";
import { Camera, RefreshCw, ArrowLeft, ArrowRight } from "lucide-react";

export default function DocumentCapture({
  docType, // "ci" | "licencia" | "pasaporte"
  docFrontBlob,
  docBackBlob,
  setDocFrontBlob,
  setDocBackBlob,
  onNext,
  onBack,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [message, setMessage] = useState("Iniciando cámara...");
  const [error, setError] = useState("");
  const [side, setSide] = useState("front"); // "front" | "back"
  const [step, setStep] = useState("ready"); // "ready" | "capturedFront" | "capturedBack"

  const needsBack = docType === "ci" || docType === "licencia";

  const stopCamera = () => {
    try {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
      if (stream) stream.getTracks().forEach((t) => t.stop());
    } catch {}
    setStream(null);
  };

  const waitVideoReady = () =>
    new Promise((resolve) => {
      const v = videoRef.current;
      if (!v) return resolve();
      if (v.readyState >= 1) return resolve();
      const onLoaded = () => {
        v.removeEventListener("loadedmetadata", onLoaded);
        resolve();
      };
      v.addEventListener("loadedmetadata", onLoaded, { once: true });
    });

  const startCamera = async () => {
    stopCamera();
    setError("");
    setMessage("Activando cámara...");
    try {
      let mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }, // siempre frontal
        audio: false,
      });
      if (!videoRef.current) return;
      videoRef.current.srcObject = mediaStream;
      videoRef.current.setAttribute("playsinline", "");
      videoRef.current.muted = true;
      await waitVideoReady();
      await videoRef.current.play();
      setStream(mediaStream);
      setMessage(
        step === "ready"
          ? "Ajusta tu documento dentro del marco y presiona Capturar."
          : "Gira el documento y presiona Capturar para el reverso."
      );
    } catch (e) {
      console.error(e);
      setError("No se pudo activar la cámara.");
      setMessage("");
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth || 720;
    c.height = v.videoHeight || 1280;
    const ctx = c.getContext("2d");
    ctx.drawImage(v, 0, 0, c.width, c.height);
    c.toBlob((blob) => {
      if (!blob) return;

      if (side === "front") {
        setDocFrontBlob(blob);
        if (needsBack) {
          stopCamera();
          setStep("capturedFront");
          setMessage("✅ Anverso capturado. Ahora gira el documento y presiona Activar Cámara para el reverso.");
        } else {
          stopCamera();
          setStep("capturedFront");
          setMessage("✅ Documento capturado.");
        }
      } else {
        setDocBackBlob(blob);
        stopCamera();
        setStep("capturedBack");
        setMessage("✅ Documento completo (anverso y reverso).");
      }
    }, "image/jpeg", 0.92);
  };

  const retake = () => {
    if (side === "front") {
      setDocFrontBlob(null);
      setStep("ready");
    } else {
      setDocBackBlob(null);
      setStep("capturedFront");
    }
    setError("");
    setMessage(
      side === "front"
        ? "Ajusta tu documento dentro del marco y presiona Capturar."
        : "Gira el documento y presiona Capturar para el reverso."
    );
    startCamera();
  };

  const handleActivateCamera = () => {
    if (step === "capturedFront" && needsBack) {
      setSide("back");
      startCamera();
    } else if (step === "ready") {
      startCamera();
    }
  };

  useEffect(() => {
    setSide("front");
    setStep("ready");
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docType]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 space-y-5 max-w-md mx-auto border border-gray-200">
      {/* Header */}
      <div className="flex flex-col items-center">
        <span className="text-sm text-gray-500 mb-1">Captura de documento</span>
        <p className="font-semibold text-xl text-gray-800 flex items-center gap-2">
          {docType === "pasaporte" ? "Pasaporte" : side === "front" ? "Anverso" : "Reverso"}
          <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700">
            {docType.toUpperCase()}
          </span>
        </p>
      </div>

      {/* Camera / Preview */}
      <div className="relative border-2 border-dashed border-indigo-400 bg-gray-900 aspect-[3/4] rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
        {((side === "front" && !docFrontBlob) || (side === "back" && !docBackBlob)) ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center px-3 text-center">
              <p className="text-white text-sm bg-black/40 rounded-lg px-2 py-1">{error || message}</p>
            </div>
            {/* Overlay frame */}
            <div className="absolute inset-6 border-2 border-green-400 rounded-lg pointer-events-none animate-pulse" />
          </>
        ) : (
          <img
            src={URL.createObjectURL(side === "front" ? docFrontBlob : docBackBlob)}
            alt="Documento"
            className="w-full h-full object-cover rounded-lg"
          />
        )}
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {((side === "front" && !docFrontBlob) || (side === "back" && !docBackBlob)) && (
          <button
            onClick={takePhoto}
            className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 px-4 py-3 rounded-xl shadow"
          >
            <Camera size={18} /> Capturar
          </button>
        )}
        {(step === "capturedFront" && needsBack && !docBackBlob) && (
          <button
            onClick={handleActivateCamera}
            className="col-span-2 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 px-4 py-3 rounded-xl shadow"
          >
            Activar Cámara
          </button>
        )}
        {((side === "front" && docFrontBlob) || (side === "back" && docBackBlob)) && (
          <button
            onClick={retake}
            className="col-span-2 bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center gap-2 px-4 py-3 rounded-xl shadow"
          >
            <RefreshCw size={18} /> Repetir
          </button>
        )}
        <button
          onClick={onBack}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 flex items-center justify-center gap-2 px-3 py-3 rounded-xl shadow"
        >
          <ArrowLeft size={18} /> Atrás
        </button>
        <button
          onClick={onNext}
          disabled={!docFrontBlob || (needsBack && !docBackBlob)}
          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl shadow ${
            !docFrontBlob || (needsBack && !docBackBlob)
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          Siguiente <ArrowRight size={18} />
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
