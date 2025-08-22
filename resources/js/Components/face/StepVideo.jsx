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
  const [error, setError] = useState("");

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
    setError("");
    try {
      let constraints = {
        video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : { facingMode: "user" },
        audio: true,
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // fallback si falla con deviceId
        console.warn("Fallback a facingMode:user", err);
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraActive(true);
    } catch (e) {
      console.error(e);
      if (e.name === "NotAllowedError") setError("⚠️ Permiso denegado. Activa la cámara en ajustes.");
      else if (e.name === "NotFoundError") setError("⚠️ No se detectó ninguna cámara.");
      else if (e.name === "OverconstrainedError") setError("⚠️ La cámara seleccionada no está disponible.");
      else setError("❌ Error al activar la cámara.");
    }
  };

  const getSupportedMimeType = () => {
    const types = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
      "video/mp4",
    ];
    return types.find(type => MediaRecorder.isTypeSupported(type)) || "";
  };

  const startRecording = () => {
    if (!videoRef.current?.srcObject) return alert("⚠️ Primero activa la cámara.");
    recordedChunks.current = [];
    const mimeType = getSupportedMimeType();

    try {
      mediaRecorderRef.current = new MediaRecorder(videoRef.current.srcObject, { mimeType });
    } catch (err) {
      console.error("MediaRecorder error:", err);
      return alert("❌ Este navegador no soporta grabación de video.");
    }

    mediaRecorderRef.current.ondataavailable = e => e.data.size > 0 && recordedChunks.current.push(e.data);
    mediaRecorderRef.current.onstop = () => {
      setVideoBlob(new Blob(recordedChunks.current, { type: mimeType || "video/webm" }));
    };
    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      stopCamera();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 max-w-md mx-auto">
      <p className="font-semibold text-lg text-center">🎥 Video selfie</p>

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

      <div className="border bg-gray-900 aspect-[3/4] rounded-lg flex items-center justify-center relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline  // 🔑 necesario en iOS
          className="w-full h-full object-cover"
        />
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 text-white text-center p-2 rounded-lg">
            {error}
          </div>
        )}
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
