import { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw, ArrowLeft, ArrowRight, Fingerprint } from "lucide-react";
import axios from "axios";

export default function FingerprintCapture({ onBack, onNext, setResultado }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  const [finger1, setFinger1] = useState(null);
  const [finger2, setFinger2] = useState(null);
  const [step, setStep] = useState("capturing"); // capturing | captured | sending
  const [side, setSide] = useState("first"); // first | second
  const [message, setMessage] = useState("Coloca tu dedo frente a la cámara y presiona Capturar.");
  const [error, setError] = useState("");
  

  const stopCamera = () => {
    try {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
      if (stream) stream.getTracks().forEach((t) => t.stop());
    } catch {}
    setStream(null);
  };

  const startCamera = async () => {
    stopCamera();
    setError("");
    try {
      let mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (!videoRef.current) return;
      videoRef.current.srcObject = mediaStream;
      videoRef.current.setAttribute("playsinline", "");
      videoRef.current.muted = true;
      await videoRef.current.play();
      setStream(mediaStream);
    } catch (e) {
      console.error(e);
      setError("❌ No se pudo activar la cámara.");
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
    c.toBlob(
      (blob) => {
        if (!blob) return;
        if (side === "first") {
          setFinger1(blob);
          setSide("second");
          setMessage("✅ Primera huella capturada. Ahora coloca el segundo dedo.");
        } else {
          setFinger2(blob);
          stopCamera();
          setStep("captured");
          setMessage("✅ Ambas huellas capturadas.");
        }
      },
      "image/png",
      0.95
    );
  };

  const retake = () => {
    setFinger1(null);
    setFinger2(null);
    setSide("first");
    setStep("capturing");
    setError("");
    setMessage("Coloca tu dedo frente a la cámara y presiona Capturar.");
    startCamera();
  };

  const sendToAPI = async () => {
    if (!finger1 || !finger2) return;
    setStep("sending");
    setMessage("🔄 Enviando huellas al servidor...");
    try {
      const formData = new FormData();
      formData.append("fingerprint1", finger1, "huella1.png");
      formData.append("fingerprint2", finger2, "huella2.png");

      const res = await axios.post("https://apihuellas-production.up.railway.app/compare-fingerprints", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResultado(res.data);
      setMessage("✅ Comparación realizada.");
    } catch (e) {
      console.error(e);
      setMessage("⚠️ Error al enviar huellas.");
    }
  };

  useEffect(() => {
    setSide("first");
    setStep("capturing");
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-6 max-w-lg mx-auto border border-gray-200">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <span className="text-sm text-gray-500 mb-1">Captura de huellas</span>
        <p className="font-semibold text-xl text-gray-800 flex items-center gap-2">
          {side === "first" ? "Primera huella" : "Segunda huella"}
          <Fingerprint size={20} className="text-indigo-600" />
        </p>
      </div>

      {/* Cámara / Preview */}
      <div className="relative border-2 border-dashed border-indigo-400 bg-gray-900 aspect-[3/4] rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
        {((side === "first" && !finger1) || (side === "second" && !finger2)) ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center px-3 text-center">
              <p className="text-white text-sm bg-black/60 rounded-lg px-3 py-2">
                {error || message}
              </p>
            </div>
            <div className="absolute h-40 w-40 border-2 border-green-400 rounded-full pointer-events-none animate-pulse" />
          </>
        ) : (
          <img
            src={URL.createObjectURL(side === "first" ? finger1 : finger2)}
            alt="Huella"
            className="w-full h-full object-cover rounded-lg"
          />
        )}
      </div>

      {/* Recomendaciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
        <p className="text-blue-700 font-semibold">Recomendaciones</p>
        <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
          <li>Coloca el dedo lo más centrado posible.</li>
          <li>Buena iluminación para que se vean las líneas.</li>
          <li>No muevas el dedo durante la captura.</li>
          <li>Evita reflejos o sombras fuertes.</li>
        </ul>
      </div>

      {/* Botones */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {step === "capturing" &&
          ((side === "first" && !finger1) || (side === "second" && !finger2)) && (
            <button
              onClick={takePhoto}
              className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 px-4 py-3 rounded-xl shadow-lg"
            >
              <Camera size={18} /> Capturar
            </button>
          )}

        {step === "captured" && (
          <>
            <button
              onClick={retake}
              className="col-span-2 bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center gap-2 px-4 py-3 rounded-xl shadow-lg"
            >
              <RefreshCw size={18} /> Repetir
            </button>
            <button
              onClick={sendToAPI}
              className="col-span-2 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 px-4 py-3 rounded-xl shadow-lg"
            >
              Enviar
            </button>
          </>
        )}

        <button
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 flex items-center justify-center gap-2 px-3 py-3 rounded-xl shadow"
        >
          <ArrowLeft size={18} /> Atrás
        </button>
        <button
          onClick={onNext}
          disabled={!finger1 || !finger2}
          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl shadow ${
            !finger1 || !finger2
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          Siguiente <ArrowRight size={18} />
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
