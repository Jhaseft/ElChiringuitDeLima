import { useState, useEffect, useRef } from "react";
import { Button } from "@/Components/ui/button";
import { Camera, Video, StopCircle } from "lucide-react";

export default function StepVideo({ videoBlob, setVideoBlob, nextStep, prevStep }) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const [recording, setRecording] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("Presiona Activar cámara para iniciar.");

  const stopCamera = () => {
    try {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
      if (stream) stream.getTracks().forEach(t => t.stop());
    } catch {}
    setStream(null);
    setCameraActive(false);
  };

  const waitVideoReady = () =>
    new Promise((resolve) => {
      const v = videoRef.current;
      if (!v) return resolve();
      if (v.readyState >= 1) return resolve();
      const onLoaded = () => { v.removeEventListener("loadedmetadata", onLoaded); resolve(); };
      v.addEventListener("loadedmetadata", onLoaded, { once: true });
    });

  const startCamera = async () => {
    stopCamera();
    setError("");
    setMessage("Iniciando cámara...");
    try {
      let s;

      // 1) Ideal frontal
      try {
        s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "user" } },
          audio: true,
        });
      } catch {
        // 2) Estricto frontal
        try {
          s = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: true,
          });
        } catch {
          // 3) Último recurso: primera cámara disponible
          const devices = await navigator.mediaDevices.enumerateDevices();
          const cams = devices.filter(d => d.kind === "videoinput");
          if (!cams.length) throw Object.assign(new Error("No hay cámaras"), { name: "NotFoundError" });
          s = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: cams[0].deviceId } },
            audio: true,
          });
        }
      }

      if (!videoRef.current) return;
      videoRef.current.srcObject = s;
      videoRef.current.setAttribute("playsinline", "");
      videoRef.current.muted = true; // evita feedback
      await waitVideoReady();
      await videoRef.current.play();

      if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
        throw Object.assign(new Error("Sin frames"), { name: "StreamBlankError" });
      }

      setStream(s);
      setCameraActive(true);
      setMessage("Cámara y micrófono activos. Puedes grabar.");
    } catch (e) {
      console.error(e);
      stopCamera();
      if (e.name === "NotAllowedError") setError("Permiso denegado. Habilita la cámara/micrófono en Ajustes.");
      else if (e.name === "NotFoundError") setError("No se detectó cámara o micrófono.");
      else if (e.name === "OverconstrainedError") setError("La cámara frontal no está disponible en este dispositivo.");
      else if (e.name === "StreamBlankError") setError("La cámara no envía video. Cierra otras apps que la usen e inténtalo de nuevo.");
      else setError("No se pudo activar la cámara.");
      setMessage("Presiona Activar cámara para reintentar.");
    }
  };

  const getSupportedMimeType = () => {
    const candidates = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
      // "video/mp4", // Android Chrome rara vez lo soporta por MediaRecorder
    ];
    return candidates.find((t) => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || "";
  };

  const startRecording = () => {
    if (!videoRef.current?.srcObject) return alert("⚠️ Primero activa la cámara.");
    recordedChunks.current = [];
    const mimeType = getSupportedMimeType();

    try {
      mediaRecorderRef.current = new MediaRecorder(videoRef.current.srcObject, mimeType ? { mimeType } : undefined);
    } catch (err) {
      console.error("MediaRecorder error:", err);
      return alert("❌ Este navegador no soporta grabación de video.");
    }

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.current.push(e.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const type = mimeType || "video/webm";
      setVideoBlob(new Blob(recordedChunks.current, { type }));
      setMessage("Video grabado. Puedes reproducirlo o volver a grabar.");
    };

    mediaRecorderRef.current.start();
    setRecording(true);
    setMessage("Grabando...");
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      stopCamera(); // liberamos cámara después de grabar
    }
  };

  // Apaga cámara al desmontar
  useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 max-w-md mx-auto">
      <p className="font-semibold text-lg text-center">🎥 Video selfie (cámara frontal)</p>

      <div className="relative border bg-gray-900 aspect-[3/4] rounded-lg flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center px-3 text-center">
          <p className="text-white text-sm">{error || message}</p>
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-2 flex-wrap">
        {!cameraActive && (
          <Button onClick={startCamera} className="bg-green-600 hover:bg-green-700">
            <Camera className="mr-2 h-4 w-4" /> Activar cámara
          </Button>
        )}
        {!recording ? (
          <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700">
            <Video className="mr-2 h-4 w-4" /> Grabar
          </Button>
        ) : (
          <Button onClick={stopRecording} className="bg-yellow-500 hover:bg-yellow-600">
            <StopCircle className="mr-2 h-4 w-4" /> Detener
          </Button>
        )}
        <Button onClick={prevStep} className="bg-gray-400 hover:bg-gray-500">Atrás</Button>
        <Button onClick={nextStep} disabled={!videoBlob} className="bg-indigo-600 hover:bg-indigo-700">Siguiente</Button>
      </div>

      {videoBlob && (
        <video
          src={URL.createObjectURL(videoBlob)}
          controls
          playsInline
          className="w-48 h-48 mt-2 mx-auto rounded-lg border"
        />
      )}
    </div>
  );
}
