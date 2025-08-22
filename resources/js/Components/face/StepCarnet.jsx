import { useState, useEffect, useRef } from "react";
import { Button } from "@/Components/ui/button";
import { Camera, Upload, RefreshCw } from "lucide-react";

export default function StepCarnet({ carnetBlob, setCarnetBlob, nextStep }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState("");

  // Iniciar cámara
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }, // "user" = frontal, "environment" = trasera
        audio: false,
      });
      setStream(mediaStream);
      setCameraActive(true);
      setError("");
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error al activar la cámara:", err);
      setError("No se pudo acceder a la cámara. Verifica permisos en tu dispositivo.");
    }
  };

  // Detener cámara
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setCameraActive(false);
  };

  // Capturar foto
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const context = canvasRef.current.getContext("2d");
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    canvasRef.current.toBlob((blob) => {
      setCarnetBlob(blob);
    }, "image/jpeg");
    stopCamera();
  };

  // Cuando desmonta, apagar cámara
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* VIDEO */}
      {cameraActive && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-sm rounded-lg border"
        />
      )}

      {/* CANVAS (oculto, solo para capturar) */}
      <canvas ref={canvasRef} className="hidden"></canvas>

      {/* MENSAJE DE ERROR */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* BOTONES */}
      <div className="flex gap-3">
        {!cameraActive && !carnetBlob && (
          <Button onClick={startCamera} className="flex items-center gap-2">
            <Camera className="w-4 h-4" /> Activar Cámara
          </Button>
        )}
        {cameraActive && (
          <Button onClick={takePhoto} className="flex items-center gap-2">
            <Camera className="w-4 h-4" /> Tomar Foto
          </Button>
        )}
        {carnetBlob && (
          <>
            <Button onClick={startCamera} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Volver a Tomar
            </Button>
            <Button onClick={nextStep} className="flex items-center gap-2">
              <Upload className="w-4 h-4" /> Siguiente
            </Button>
          </>
        )}
      </div>

      {/* VISTA PREVIA DE LA FOTO */}
      {carnetBlob && (
        <div className="mt-4">
          <p className="text-gray-600 text-sm mb-2">Vista previa:</p>
          <img
            src={URL.createObjectURL(carnetBlob)}
            alt="Vista previa carnet"
            className="w-56 h-auto rounded-lg border"
          />
        </div>
      )}
    </div>
  );
}
