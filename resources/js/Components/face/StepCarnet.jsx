// StepCarnet.jsx
import { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Camera, Upload, RefreshCcw } from "lucide-react";

export default function StepCarnet({ videoRef, carnetBlob, setCarnetBlob, nextStep }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [message, setMessage] = useState("Presiona el botón verde para activar la cámara");

  // Función para iniciar/reiniciar cámara
  const startCameraFoto = async () => {
    try {
      // Detener el stream anterior si existiera
      if (videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraActive(true);
      setMessage("Ajusta tu documento frente a la cámara. Asegúrate de que la parte frontal se vea completa.");
    } catch (err) {
      console.error("Error al activar la cámara:", err);
      setMessage("No se pudo activar la cámara. Intenta de nuevo.");
    }
  };

  const captureCarnet = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        setCarnetBlob(blob);
        setMessage("¡Foto capturada! Si no quedó bien, puedes reiniciar la cámara y volver a intentar.");
      }
    }, "image/jpeg");
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <p className="font-semibold text-lg text-center">📄 Captura de documento de identidad</p>

      <div className="rounded-lg overflow-hidden border bg-gray-900 flex items-center justify-center h-64 relative">
        {carnetBlob ? (
          <img
            src={URL.createObjectURL(carnetBlob)}
            alt="Carnet preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
          />
        )}
      </div>

      <p className="text-center text-gray-700 text-sm">{message}</p>

      <div className="flex flex-wrap justify-center gap-3 mt-2">
        <Button
          onClick={startCameraFoto}
          className="bg-green-600 hover:bg-green-700"
        >
          <Camera className="mr-2 h-4 w-4" /> {cameraActive ? "Reiniciar cámara" : "Activar cámara"}
        </Button>

        {cameraActive && (
          <Button
            onClick={captureCarnet}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="mr-2 h-4 w-4" /> Capturar carnet
          </Button>
        )}

        <Button
          onClick={nextStep}
          disabled={!carnetBlob}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
