// StepVideo.jsx
import { Button } from "@/components/ui/button";
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
  const startCameraVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoRef.current.srcObject = stream;
    await videoRef.current.play();
  };

  const startRecording = () => {
    recordedChunks.current = [];
    const stream = videoRef.current.srcObject;
    if (!stream) return alert("⚠️ Primero activa la cámara para grabar.");
    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "video/webm" });
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.current.push(e.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: "video/webm" });
      setVideoBlob(blob);
    };
    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <p className="font-semibold text-lg text-center">🎥 Graba un video selfie</p>
      
      <div className="rounded-lg overflow-hidden border bg-gray-900 text-white flex items-center justify-center h-64">
        {!videoBlob && !recording ? (
          <p className="text-center px-4">Presione Iniciar Video para comenzar la grabación. Asegúrese de estar bien iluminado y sin ruidos.</p>
        ) : null}
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
