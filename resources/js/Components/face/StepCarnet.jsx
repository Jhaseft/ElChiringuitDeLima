import { useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Camera, Upload } from "lucide-react";

export default function StepCarnet({ videoRef, carnetBlob, setCarnetBlob, nextStep }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [message, setMessage] = useState("Presiona el botón verde para activar la cámara");
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  // Enumerar cámaras
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devs => {
      const videoDevices = devs.filter(d => d.kind === "videoinput");
      setDevices(videoDevices);

      // Selecciona la cámara frontal por defecto si existe
      const frontCamera = videoDevices.find(d => d.label.toLowerCase().includes("front"));
      setSelectedDeviceId(frontCamera ? frontCamera.deviceId : videoDevices[0]?.deviceId || null);
    });
  }, []);

  const startCameraFoto = async () => {
    try {
      if (videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : { facingMode: "user" },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
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
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 max-w-md mx-auto">
      <p className="font-semibold text-lg text-center">📄 Captura de documento de identidad</p>

      <div className="flex justify-center mb-2">
        {devices.length > 1 && (
          <select
            className="border rounded p-1"
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
          >
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || "Cámara " + (devices.indexOf(d)+1)}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Cuadro más alto que ancho */}
      <div className="rounded-lg overflow-hidden border bg-gray-900 flex items-center justify-center aspect-[3/4] w-full max-w-xs mx-auto">
        {carnetBlob ? (
          <img
            src={URL.createObjectURL(carnetBlob)}
            alt="Carnet preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
        )}
      </div>

      <p className="text-center text-gray-700 text-sm">{message}</p>

      <div className="flex flex-wrap justify-center gap-3 mt-2">
        <Button onClick={startCameraFoto} className="bg-green-600 hover:bg-green-700">
          <Camera className="mr-2 h-4 w-4" /> {cameraActive ? "Reiniciar cámara" : "Activar cámara"}
        </Button>

        {cameraActive && (
          <Button onClick={captureCarnet} className="bg-blue-600 hover:bg-blue-700">
            <Upload className="mr-2 h-4 w-4" /> Capturar carnet
          </Button>
        )}

        <Button onClick={nextStep} disabled={!carnetBlob} className="bg-indigo-600 hover:bg-indigo-700">
          Siguiente
        </Button>
      </div>
    </div>
  );
}
