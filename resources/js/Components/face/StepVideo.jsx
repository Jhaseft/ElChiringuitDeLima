import { useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Camera, Video, StopCircle } from "lucide-react";

export default function StepVideo({
  videoRef,
  mediaRecorderRef,
  recordedChunks,
  videoBlob,
  setVideoBlob,
  recording,
  setRecording,
  nextStep,
  prevStep,
}) {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devs => {
      const videoDevices = devs.filter(d => d.kind === "videoinput");
      setDevices(videoDevices);

      // Cámara frontal por defecto
      const frontCamera = videoDevices.find(d => d.label.toLowerCase().includes("front"));
      setSelectedDeviceId(frontCamera ? frontCamera.deviceId : videoDevices[0]?.deviceId || null);
    });
  }, []);

  const startCameraVideo = async () => {
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
  };

  const startRecording = () => {
    if (!videoRef.current.srcObject) return alert("⚠️ Primero activa la cámara para grabar.");
    recordedChunks.current = [];
    mediaRecorderRef.current = new MediaRecorder(videoRef.current.srcObject, { mimeType: "video/webm" });
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.current.push(e.data);
    };
    mediaRecorderRef.current.onstop = () => {
      setVideoBlob(new Blob(recordedChunks.current, { type: "video/webm" }));
    };
    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 max-w-md mx-auto">
      <p className="font-semibold text-lg text-center">🎥 Graba un video selfie</p>

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

      {/* Cuadro vertical más alto */}
      <div className="rounded-lg overflow-hidden border bg-gray-900 flex items-center justify-center aspect-[3/4] w-full max-w-xs mx-auto relative">
        {!videoBlob && !recording && (
          <p className="text-center px-4 text-white">Presione Activar cámara para iniciar.</p>
        )}
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {!recording && (
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
        <video src={URL.createObjectURL(videoBlob)} controls className="w-64 h-64 object-cover mx-auto mt-2 rounded-lg border shadow" />
      )}
    </div>
  );
}
