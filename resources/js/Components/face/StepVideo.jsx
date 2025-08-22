import { useState, useEffect, useRef } from "react";

export default function StepVideo({ videoBlob, setVideoBlob, nextStep, prevStep }) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const [recording, setRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("Iniciando cámara...");

  const stopCamera = () => {
    try {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
      if (stream) stream.getTracks().forEach(t => t.stop());
    } catch {}
    setStream(null);
  };

  const waitVideoReady = () =>
    new Promise((resolve) => {
      const v = videoRef.current;
      if (!v) return resolve();
      if (v.readyState >= 1) return resolve();
      const onLoaded = () => { v.removeEventListener("loadedmetadata", onLoaded); resolve(); };
      v.addEventListener("loadedmetadata", onLoaded, { once: true });
    });

  const startCamera = async () => {
    stopCamera();
    setError("");
    setMessage("Iniciando cámara...");
    try {
      let s;
      try {
        s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
      } catch {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter(d => d.kind === "videoinput");
        if (!cams.length) throw new Error("No hay cámaras");
        s = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: cams[0].deviceId } }, audio: true });
      }

      if (!videoRef.current) return;
      videoRef.current.srcObject = s;
      videoRef.current.setAttribute("playsinline", "");
      videoRef.current.muted = true;
      await waitVideoReady();
      await videoRef.current.play();
      setStream(s);
      setMessage("Cámara y micrófono activos. Puedes grabar.");
    } catch (e) {
      console.error(e);
      setError("No se pudo activar la cámara.");
      setMessage("");
    }
  };

  const getSupportedMimeType = () => {
    const candidates = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
    return candidates.find((t) => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || "";
  };

  const startRecording = () => {
    if (!videoRef.current?.srcObject) return;
    recordedChunks.current = [];
    const mimeType = getSupportedMimeType();
    mediaRecorderRef.current = new MediaRecorder(videoRef.current.srcObject, mimeType ? { mimeType } : undefined);
    mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.current.push(e.data); };
    mediaRecorderRef.current.onstop = () => setVideoBlob(new Blob(recordedChunks.current, { type: mimeType || "video/webm" }));
    mediaRecorderRef.current.start();
    setRecording(true);
    setMessage("Grabando...");
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      stopCamera();
    }
  };

  useEffect(() => {
    startCamera(); // 🔹 activa cámara automáticamente al montar
    return () => stopCamera();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 max-w-md mx-auto">
      <p className="font-semibold text-lg text-center">🎥 Video selfie (cámara frontal)</p>

      <div className="relative border bg-gray-900 aspect-[3/4] rounded-lg flex items-center justify-center">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center px-3 text-center">
          <p className="text-white text-sm">{error || message}</p>
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-2 flex-wrap">
        {!recording ? (
          <button onClick={startRecording} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Grabar</button>
        ) : (
          <button onClick={stopRecording} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">Detener</button>
        )}
        <button onClick={prevStep} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded">Atrás</button>
        <button onClick={nextStep} disabled={!videoBlob} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">Siguiente</button>
      </div>

      {videoBlob && <video src={URL.createObjectURL(videoBlob)} controls playsInline className="w-48 h-48 mt-2 mx-auto rounded-lg border" />}
    </div>
  );
}
