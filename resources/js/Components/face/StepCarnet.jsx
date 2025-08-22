import { useState, useEffect, useRef } from "react";
import { Button } from "@/Components/ui/button";
import { Camera, Upload, RefreshCw } from "lucide-react";

export default function StepCarnet({ carnetBlob, setCarnetBlob, nextStep }) {
  const videoRef = useRef(null); 
  const [cameraActive, setCameraActive] = useState(false);
  const [message, setMessage] = useState("Presiona el botón verde para activar la cámara");
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devs => {
      const videoDevices = devs.filter(d => d.kind === "videoinput");
      setDevices(videoDevices);
      const frontCamera = videoDevices.find(d => d.label.toLowerCase().includes("front"));
      setSelectedDeviceId(frontCamera ? frontCamera.deviceId : videoDevices[0]?.deviceId || null);
    });
  }, []);

  const startCameraFoto = async () => {
    if (!videoRef.current) {
      setMessage("La cámara aún no está lista. Intenta de nuevo.");
      return;
    }

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
      setMessage("Ajusta tu documento dentro del recuadro guía y presiona Capturar.");
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
    canvas.toBlob(blob => {
      if (blob) {
        setCarnetBlob(blob);
        setMessage("¡Foto capturada! Si deseas, puedes volver a sacar otra.");
      }
    }, "image/jpeg");
  };

  const retakePhoto = () => {
    // Borra la foto anterior y apaga la cámara
    setCarnetBlob(null);
    setCameraActive(false);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setMessage("Presiona el botón verde para activar la cámara y sacar otra foto.");
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 max-w-md mx-auto">
      <p className="font-semibold text-lg text-center">📄 Captura de documento de identidad</p>

      {devices.length > 1 && (
        <div className="flex justify-center mb-2">
          <select
            className="border rounded p-1"
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
          >
            {devices.map((d, idx) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || "Cámara " + (idx + 1)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Contenedor de video con guía */}
      <div className="relative rounded-lg overflow-hidden border bg-gray-900 flex items-center justify-center aspect-[3/4] w-full max-w-xs mx-auto">
        {!carnetBlob && (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
            <div className="absolute border-2 border-dashed border-white w-11/12 h-3/4 pointer-events-none"></div>
            <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
              <p className="text-white text-sm">{message}</p>
            </div>
          </>
        )}

        {carnetBlob && (
          <img
            src={URL.createObjectURL(carnetBlob)}
            alt="Carnet capturado"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Botones */}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {!cameraActive && (
          <Button onClick={startCameraFoto} className="bg-green-600 hover:bg-green-700">
            <Camera className="mr-2 h-4 w-4" /> Activar cámara
          </Button>
        )}

        {cameraActive && !carnetBlob && (
          <Button onClick={captureCarnet} className="bg-blue-600 hover:bg-blue-700">
            <Upload className="mr-2 h-4 w-4" /> Capturar carnet
          </Button>
        )}

        {carnetBlob && (
          <Button onClick={retakePhoto} className="bg-yellow-500 hover:bg-yellow-600">
            <RefreshCw className="mr-2 h-4 w-4" /> Volver a sacar
          </Button>
        )}

        <Button onClick={nextStep} disabled={!carnetBlob} className="bg-indigo-600 hover:bg-indigo-700">
          Siguiente
        </Button>
      </div>

      {/* Vista previa debajo de los botones */}
      {carnetBlob && (
        <div className="mt-2 text-center">
          <p className="text-gray-600 text-sm mb-1">Vista previa:</p>
          <img
            src={URL.createObjectURL(carnetBlob)}
            alt="Vista previa carnet"
            className="mx-auto border rounded w-32 h-44 object-cover"
          />
        </div>
      )}
    </div>
  );
}
