import { useEffect, useRef, useState } from "react";
import { Video, Square, RefreshCw, Info } from "lucide-react";

export default function StepVideo({ videoBlob, setVideoBlob, nextStep, prevStep, currentStep, stepNumber }) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const streamRef = useRef(null); // 👈 Usamos ref en lugar de estado
  const [status, setStatus] = useState("preview");
  const [message, setMessage] = useState("Cámara lista. Pulsa 'Grabar'.");
  const [error, setError] = useState("");

  const stopCamera = () => {
    // Detener grabación si está activa
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.muted = true;
        videoRef.current.setAttribute("playsinline", "");
        await videoRef.current.play();
      }
      setStatus("preview");
      setMessage("Cámara lista. Pulsa 'Grabar'.");
    } catch {
      setError(" Recarga la página. No se pudo activar la cámara.");
      setMessage("");
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    recordedChunks.current = [];
    mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: "video/webm" });
      setVideoBlob(blob);
      setMessage("Grabación finalizada. Presiona Siguiente.");
      setStatus("done");
    };

    mediaRecorderRef.current.start();
    setStatus("recording");
    setMessage(" Grabando...");
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const retake = () => {
    setVideoBlob(null);
    setStatus("preview");
    setMessage("Cámara lista. Pulsa 'Grabar'.");
    startCamera();
  };

  // 🔹 Encender/apagar cámara según el paso activo
  useEffect(() => {
    if (currentStep === stepNumber) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-6 max-w-lg mx-auto border border-gray-200">
      <p className="font-semibold text-lg text-center text-gray-800 flex items-center justify-center gap-2">
        🎥 Video selfie (cámara frontal)
      </p>

      <div className="relative border-2 border-dashed border-indigo-400 bg-gray-900 aspect-[3/4] rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
        {status !== "done" ? (
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        ) : (
          <video
            src={URL.createObjectURL(videoBlob)}
            controls
            playsInline
            className="w-full h-full object-cover rounded-lg"
          />
        )}

        {(error || message) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white text-lg font-bold bg-red-600 bg-opacity-80 px-6 py-3 rounded-xl shadow-lg animate-pulse text-center">
              {error || message}
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-blue-700 font-semibold">
          <Info size={18} /> Recomendaciones para el video
        </div>
        <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
          <li>Graba en un lugar bien iluminado y silencioso.</li>
          <li>Mueve tu rostro lentamente y de manera natural durante la grabación.</li>
          <li>Di Tu Nombre claramente , para que se detecte tu voz.</li>
          <li>Parpadea varias veces; evita usar gafas oscuras o cubrir tu cara.</li>
          <li>Mantén el dispositivo estable mientras grabas.</li>
        </ul>
      </div>

      <div className="flex justify-center gap-3 flex-wrap">
        {status === "preview" && (
          <button
            onClick={startRecording}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-5 py-2 rounded-xl shadow-lg"
          >
            <Video size={18} /> Grabar
          </button>
        )}
        {status === "recording" && (
          <button
            onClick={stopRecording}
            className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2 px-5 py-2 rounded-xl shadow-lg"
          >
            <Square size={18} /> Detener
          </button>
        )}
        {status === "done" && (
          <button
            onClick={retake}
            className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2 px-5 py-2 rounded-xl shadow-lg"
          >
            <RefreshCw size={18} /> Repetir
          </button>
        )}

        <button
          onClick={prevStep}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-xl shadow"
        >
          Atrás
        </button>
        <button
          onClick={nextStep}
          disabled={!videoBlob}
          className={`px-4 py-2 rounded-xl shadow flex items-center gap-2 ${!videoBlob
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 text-white"
            }`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
