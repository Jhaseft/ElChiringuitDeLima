import { useState, useEffect, useRef } from "react";
import { Button } from "@/Components/ui/button";
import { Camera, Upload, RefreshCw } from "lucide-react";

export default function StepCarnet({ carnetBlob, setCarnetBlob, nextStep }) {
  const videoRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [message, setMessage] = useState("Presiona el botón verde para activar la cámara");

  // listar cámaras
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devs => {
      const cams = devs.filter(d => d.kind === "videoinput");
      setDevices(cams);
      setSelectedDeviceId(cams[0]?.deviceId || null);
    });
  }, []);

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true,
        audio: false,
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraActive(true);
      setMessage("Ajusta tu documento y presiona Capturar.");
    } catch (e) {
      console.error(e);
      setMessage("❌ No se pudo activar la cámara.");
    }
  };

  const captureCarnet = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(blob => {
      if (blob) {
        setCarnetBlob(blob);
        stopCamera();
        setMessage("✅ Foto capturada. Puedes volver a sacar otra.");
      }
    }, "image/jpeg");
  };

  const retake = () => {
    setCarnetBlob(null);
    setMessage("Presiona el botón verde para activar la cámara.");
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 max-w-md mx-auto">
      <p className="font-semibold text-lg text-center">📄 Captura de documento</p>

      {devices.length > 1 && (
        <select
          className="border rounded p-1 mb-2 w-full"
          value={selectedDeviceId}
          onChange={e => setSelectedDeviceId(e.target.value)}
        >
          {devices.map((d, i) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Cámara ${i + 1}`}
            </option>
          ))}
        </select>
      )}

      <div className="relative border bg-gray-900 aspect-[3/4] rounded-lg flex items-center justify-center">
        {!carnetBlob ? (
          <>
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center px-2 text-center">
              <p className="text-white text-sm">{message}</p>
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
          <Button onClick={captureCarnet} className="bg-blue-600 hover:bg-blue-700">
            <Upload className="mr-2 h-4 w-4" /> Capturar
          </Button>
        )}
        {carnetBlob && (
          <Button onClick={retake} className="bg-yellow-500 hover:bg-yellow-600">
            <RefreshCw className="mr-2 h-4 w-4" /> Volver a sacar
          </Button>
        )}
        <Button onClick={nextStep} disabled={!carnetBlob} className="bg-indigo-600 hover:bg-indigo-700">
          Siguiente
        </Button>
      </div>
    </div>
  );
}
