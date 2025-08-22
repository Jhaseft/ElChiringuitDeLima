import { useState, useEffect, useRef } from "react";

export default function StepCarnet({ carnetBlob, setCarnetBlob, nextStep }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [message, setMessage] = useState("Iniciando cámara...");
  const [error, setError] = useState("");

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
      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
      } catch {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter(d => d.kind === "videoinput");
        if (!cams.length) throw new Error("No hay cámaras");
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: cams[0].deviceId } },
          audio: false,
        });
      }

      if (!videoRef.current) return;
      videoRef.current.srcObject = mediaStream;
      videoRef.current.setAttribute("playsinline", "");
      videoRef.current.muted = true;
      await waitVideoReady();
      await videoRef.current.play();
      setStream(mediaStream);
      setMessage("Ajusta tu documento y presiona Capturar.");
    } catch (e) {
      console.error(e);
      setError("No se pudo activar la cámara.");
      setMessage("");
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth || 720;
    c.height = v.videoHeight || 1280;
    const ctx = c.getContext("2d");
    ctx.drawImage(v, 0, 0, c.width, c.height);
    c.toBlob((blob) => {
      if (blob) {
        setCarnetBlob(blob);
        setMessage("✅ Foto capturada. Puedes volver a tomar si deseas.");
        stopCamera();
      }
    }, "image/jpeg", 0.92);
  };

  const retake = () => {
    setCarnetBlob(null);
    setError("");
    setMessage("Ajusta tu documento y presiona Capturar.");
    startCamera();
  };

  useEffect(() => {
    startCamera(); // 🔹 activa cámara automáticamente al montar
    return () => stopCamera();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 max-w-md mx-auto">
      <p className="font-semibold text-lg text-center">📄 Captura de documento (cámara trasera)</p>

      <div className="relative border bg-gray-900 aspect-[3/4] rounded-lg flex items-center justify-center">
        {!carnetBlob ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center px-3 text-center">
              <p className="text-white text-sm">{error || message}</p>
            </div>
          </>
        ) : (
          <img src={URL.createObjectURL(carnetBlob)} alt="Carnet" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="flex justify-center gap-2 mt-2 flex-wrap">
        {!carnetBlob && (
          <button onClick={takePhoto} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Capturar
          </button>
        )}
        {carnetBlob && (
          <button onClick={retake} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">
            Volver a tomar
          </button>
        )}
        <button onClick={nextStep} disabled={!carnetBlob} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
          Siguiente
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
