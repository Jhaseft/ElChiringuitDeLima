import { useState, useEffect, useRef } from "react";
import { Button } from "@/Components/ui/button";
import { Camera, Upload, RefreshCw } from "lucide-react";

export default function StepCarnet({ carnetBlob, setCarnetBlob, nextStep }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [message, setMessage] = useState("Presiona Activar cámara para iniciar.");
  const [error, setError] = useState("");

  // Detener cámara
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

  // Abre la cámara FRONTAL con fallbacks
  const startCamera = async () => {
    stopCamera();
    setError("");
    setMessage("Iniciando cámara...");
    try {
      let mediaStream;

      // 1) Intento ideal con frontal
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "user" } },
          audio: false,
        });
      } catch {
        // 2) Intento estricto con frontal
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false,
          });
        } catch {
          // 3) Último recurso: primera cámara disponible
          const devices = await navigator.mediaDevices.enumerateDevices();
          const cams = devices.filter(d => d.kind === "videoinput");
          if (!cams.length) throw Object.assign(new Error("No hay cámaras"), { name: "NotFoundError" });
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: cams[0].deviceId } },
            audio: false,
          });
        }
      }

      if (!videoRef.current) return;
      videoRef.current.srcObject = mediaStream;
      // iOS/Android necesitan esto para inline video
      videoRef.current.setAttribute("playsinline", "");
      videoRef.current.muted = true;

      await waitVideoReady();
      await videoRef.current.play();

      // Detección de “frame en blanco”
      if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
        throw Object.assign(new Error("Sin frames"), { name: "StreamBlankError" });
      }

      setStream(mediaStream);
      setCameraActive(true);
      setMessage("Ajusta tu documento y presiona Capturar.");
    } catch (e) {
      console.error("Camera error:", e);
      stopCamera();
      if (e.name === "NotAllowedError") setError("Permiso denegado. Habilita la cámara en Ajustes del navegador.");
      else if (e.name === "NotFoundError") setError("No se detectó ninguna cámara.");
      else if (e.name === "OverconstrainedError") setError("La cámara frontal no está disponible en este dispositivo.");
      else if (e.name === "StreamBlankError") setError("La cámara no está enviando video. Cierra otras apps que usen la cámara e inténtalo de nuevo.");
      else setError("No se pudo activar la cámara.");
      setMessage("Presiona Activar cámara para reintentar.");
    }
  };

  // Capturar foto
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth || 720;
    c.height = v.videoHeight || 1280;
    const ctx = c.getContext("2d");
    ctx.drawImage(v, 0, 0, c.width, c.height);
    c.toBlob((blob) => {
      if (blob) {
        setCarnetBlob(blob);
        setMessage("✅ Foto capturada. Puedes volver a tomar si deseas.");
        stopCamera();
      }
    }, "image/jpeg", 0.92);
  };

  const retake = () => {
    setCarnetBlob(null);
    setError("");
    setMessage("Presiona Activar cámara para iniciar.");
  };

  // Apaga cámara al desmontar
  useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 max-w-md mx-auto">
      <p className="font-semibold text-lg text-center">📄 Captura de documento (cámara frontal)</p>

      <div className="relative border bg-gray-900 aspect-[3/4] rounded-lg flex items-center justify-center">
        {!carnetBlob ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center px-3 text-center">
              <p className="text-white text-sm">{error || message}</p>
            </div>
          </>
        ) : (
          <img
            src={URL.createObjectURL(carnetBlob)}
            alt="Carnet"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="flex justify-center gap-2 mt-2 flex-wrap">
        {!cameraActive && !carnetBlob && (
          <Button onClick={startCamera} className="bg-green-600 hover:bg-green-700">
            <Camera className="mr-2 h-4 w-4" /> Activar cámara
          </Button>
        )}
        {cameraActive && !carnetBlob && (
          <Button onClick={takePhoto} className="bg-blue-600 hover:bg-blue-700">
            <Upload className="mr-2 h-4 w-4" /> Capturar
          </Button>
        )}
        {carnetBlob && (
          <Button onClick={retake} className="bg-yellow-500 hover:bg-yellow-600">
            <RefreshCw className="mr-2 h-4 w-4" /> Volver a tomar
          </Button>
        )}
        <Button onClick={nextStep} disabled={!carnetBlob} className="bg-indigo-600 hover:bg-indigo-700">
          Siguiente
        </Button>
      </div>

      {/* Canvas oculto para captura */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
