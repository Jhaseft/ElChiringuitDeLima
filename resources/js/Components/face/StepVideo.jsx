import { useEffect, useRef, useState } from "react";
import { Video, Square, Info } from "lucide-react";

export default function StepVideo({ videoBlob, setVideoBlob, nextStep, prevStep }) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const [recording, setRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("Iniciando cámara...");

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
    setMessage("Iniciando cámara...");
    try {
      let s;
      try {
        s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: true,
        });
      } catch {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter((d) => d.kind === "videoinput");
        if (!cams.length) throw new Error("No hay cámaras");
        s = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: cams[0].deviceId } },
          audio: true,
        });
      }
      if (!videoRef.current) return;
      videoRef.current.srcObject = s;
      videoRef.current.setAttribute("playsinline", "");
      videoRef.current.muted = true;
      await waitVideoReady();
      await videoRef.current.play();
      setStream(s);
      setMessage("Cámara y micrófono activos. Pulsa grabar cuando estés listo.");
    } catch (e) {
      console.error(e);
      setError("❌ No se pudo activar la cámara.");
      setMessage("");
    }
  };

  const getSupportedMimeType = () => {
    const candidates = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
    return candidates.find((t) => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || "";
  };

  const startRecording = () => {
    if (!videoRef.current?.srcObject) return;
    recordedChunks.current = [];
    const mimeType = getSupportedMimeType();
    mediaRecorderRef.current = new MediaRecorder(
      videoRef.current.srcObject,
      mimeType ? { mimeType } : undefined
    );
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.current.push(e.data);
    };
    mediaRecorderRef.current.onstop = () =>
      setVideoBlob(new Blob(recordedChunks.current, { type: mimeType || "video/webm" }));
    mediaRecorderRef.current.start();
    setRecording(true);
    setMessage("🎥 Grabando... Habla claramente frente a la cámara.");
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      stopCamera();
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-6 max-w-lg mx-auto border border-gray-200">
      {/* Header */}
      <p className="font-semibold text-lg text-center text-gray-800 flex items-center justify-center gap-2">
        🎥 Video selfie (cámara frontal)
      </p>

      {/* Video area */}
      <div className="relative border-2 border-dashed border-indigo-400 bg-gray-900 aspect-[3/4] rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        <div className="absolute bottom-2 inset-x-0 flex justify-center px-3 text-center">
          <p className="text-white text-sm bg-black/60 px-3 py-1 rounded-lg">
            {error || message}
          </p>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-blue-700 font-semibold">
          <Info size={18} /> Recomendaciones para el video
        </div>
        <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
          <li>Graba en un lugar bien iluminado y silencioso.</li>
          <li>Mantén tu rostro en movimiento.</li>
          <li>No uses gafas oscuras ni cubras tu cara.</li>
          <li>Habla claramente cuando se te indique.</li>
          <li>Mantén el dispositivo estable.</li>
        </ul>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-3 flex-wrap">
        {!recording ? (
          <button
            onClick={startRecording}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-5 py-2 rounded-xl shadow-lg"
          >
            <Video size={18} /> Grabar
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2 px-5 py-2 rounded-xl shadow-lg"
          >
            <Square size={18} /> Detener
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
          className={`px-4 py-2 rounded-xl shadow flex items-center gap-2 ${
            !videoBlob
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          Siguiente
        </button>
      </div>

      {/* Preview */}
      {videoBlob && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-2">Vista previa del video</p>
          <video
            src={URL.createObjectURL(videoBlob)}
            controls
            playsInline
            className="w-48 h-48 mx-auto rounded-lg border shadow"
          />
        </div>
      )}
    </div>
  );
}
