import { useState, useEffect, useRef } from "react";
import { Button } from "@/Components/ui/button";
import { Camera, Video, StopCircle } from "lucide-react";

export default function StepVideo({ videoBlob, setVideoBlob, nextStep, prevStep }) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [recording, setRecording] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [message, setMessage] = useState("Presiona Activar cámara para iniciar.");

  // Enumerar cámaras
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devs => {
      const videoDevices = devs.filter(d => d.kind === "videoinput");
      setDevices(videoDevices);
      const frontCamera = videoDevices.find(d => d.label.toLowerCase().includes("front"));
      setSelectedDeviceId(frontCamera ? frontCamera.deviceId : videoDevices[0]?.deviceId || null);
    });
  }, []);

  // Reiniciar cámara automáticamente al cambiar de dispositivo
  useEffect(() => {
    if (cameraActive) {
      startCameraVideo();
    }
  }, [selectedDeviceId]);

  const startCameraVideo = async () => {
    if (!videoRef.current) return;
    try {
      // Detener cámara anterior
      if (videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : { facingMode: "user" },
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraActive(true);
      setMessage("Cámara y micrófono activos. Listo para grabar.");
    } catch (err) {
      console.error("Error al activar la cámara:", err);
      setMessage("No se pudo activar la cámara. Intenta de nuevo.");
      setCameraActive(false);
    }
  };

  const startRecording = () => {
    if (!videoRef.current?.srcObject) return alert("⚠️ Primero activa la cámara para grabar.");
    recordedChunks.current = [];
    mediaRecorderRef.current = new MediaRecorder(videoRef.current.srcObject, { mimeType: "video/webm" });

    mediaRecorderRef.current.ondataavailable = e => {
      if (e.data.size > 0) recordedChunks.current.push(e.data);
    };
    mediaRecorderRef.current.onstop = () => {
      setVideoBlob(new Blob(recordedChunks.current, { type: "video/webm" }));
      setMessage("Video grabado correctamente. Puedes reproducirlo abajo o grabar nuevamente.");
    };

    mediaRecorderRef.current.start();
    setRecording(true);
    setMessage("Grabando video...");
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 max-w-md mx-auto">
      <p className="font-semibold text-lg text-center">🎥 Graba un video selfie</p>

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

      <div className="rounded-lg overflow-hidden border bg-gray-900 flex items-center justify-center aspect-[3/4] w-full max-w-xs mx-auto relative">
  {!cameraActive && !recording && (
    <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
      <p className="text-white text-sm">{message}</p>
    </div>
  )}
  <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
</div>


      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {!cameraActive && (
          <Button onClick={startCameraVideo} className="bg-green-600 hover:bg-green-700">
            <Camera className="mr-2 h-4 w-4" /> Activar cámara + micrófono
          </Button>
        )}

        {!recording ? (
          <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700 text-black">
            <Video className="mr-2 h-4 w-4" /> Iniciar Video
          </Button>
        ) : (
          <Button onClick={stopRecording} className="bg-yellow-500 hover:bg-yellow-600">
            <StopCircle className="mr-2 h-4 w-4" /> Detener Video
          </Button>
        )}

        <Button onClick={prevStep} className="bg-gray-400 hover:bg-gray-500">Atrás</Button>
        <Button onClick={nextStep} disabled={!videoBlob} className="bg-indigo-600 hover:bg-indigo-700">Siguiente</Button>
      </div>

      {videoBlob && (
        <div className="mt-2 text-center">
          <p className="text-gray-600 text-sm mb-1">Vista previa del video grabado:</p>
          <video
            src={URL.createObjectURL(videoBlob)}
            controls
            className="w-64 h-64 object-cover mx-auto mt-2 rounded-lg border shadow"
          />
        </div>
      )}
    </div>
  );
}
