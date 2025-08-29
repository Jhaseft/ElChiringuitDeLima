// StepReview.jsx
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function StepReview({
  docType,
  docFrontBlob,
  docBackBlob,
  videoBlob,
  prevStep,
  loading,
  setLoading,
  resultado,
  setResultado,
}) {
  const [message, setMessage] = useState(null);
  const [problems, setProblems] = useState([]);
  const [frontURL, setFrontURL] = useState(null);
  const [backURL, setBackURL] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  // 👇 Se ejecuta al montar el componente
  useEffect(() => {
    // Detener cámara y micrófono si están en uso
    navigator.mediaDevices?.getUserMedia({ audio: true, video: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(err => {
        console.log("No había cámara/micrófono activos o no se pudieron detener:", err);
      });
  }, []);

  // Crear URLs para mostrar blobs y liberar memoria después
  useEffect(() => {
    if (docFrontBlob) setFrontURL(URL.createObjectURL(docFrontBlob));
    if (docBackBlob) setBackURL(URL.createObjectURL(docBackBlob));
    if (videoBlob) setVideoURL(URL.createObjectURL(videoBlob));

    return () => {
      frontURL && URL.revokeObjectURL(frontURL);
      backURL && URL.revokeObjectURL(backURL);
      videoURL && URL.revokeObjectURL(videoURL);
    };
  }, [docFrontBlob, docBackBlob, videoBlob]);

  const getCsrfToken = () => {
    const el = document.querySelector('meta[name="csrf-token"]');
    return el?.getAttribute("content") || "";
  };

  const handleSubmit = async () => {
    if (!docFrontBlob || !videoBlob)
      return alert("⚠️ Debes capturar documento y video.");

    const formData = new FormData();
    formData.append("carnet", docFrontBlob, "documento_frente.jpg");
    formData.append("doc_type", docType);
    // Cambiamos a mp4 para compatibilidad
    formData.append("video", videoBlob, "video.mp4");

    try {
      setLoading(true);

      // 1️⃣ Llamada a API externa
      const res = await axios.post(
        "https://apiface-production-767c.up.railway.app/registro-face/verify",
        formData
        // No forzamos Content-Type, axios lo gestiona
      );

      setResultado(res.data);

      // 2️⃣ Enviamos resultado a nuestro backend
      const csrf = getCsrfToken();
      const backendRes = await axios.post(
        "/face/verify",
        { resultado: res.data },
        {
          headers: {
            "X-CSRF-TOKEN": csrf,
            "Content-Type": "application/json",
          },
        }
      );

      const data = backendRes.data;

      setMessage(data.mensaje || "ℹ️ Verificación realizada.");
      setProblems(data.sugerencias || []);

      if (data.status === "success" || data.kyc_status === "active") {
        setTimeout(() => {
          const params = new URLSearchParams(window.location.search);
          const next = params.get("next");
          window.location.href = next || "/";
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error en la verificación KYC. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const renderResultado = () => {
    if (!resultado) return null;

    return (
      <div className="mt-4 p-4 border rounded-lg bg-gray-100 shadow-inner space-y-2">
        <h3 className="font-semibold text-lg">Resultado de verificación</h3>

        {message && (
          <p className="text-sm">
            <strong>📢 Mensaje:</strong> {message}
          </p>
        )}

        {resultado.score !== undefined && (
          <p className="text-sm">
            <strong>⭐ Score:</strong> {resultado.score}
          </p>
        )}

        {problems.length > 0 && (
          <div>
            <strong className="text-sm">⚠️ Sugerencias:</strong>
            <ul className="list-disc ml-5 text-sm text-red-600">
              {problems.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}

        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-gray-500">
            Ver JSON completo
          </summary>
          <pre className="text-xs bg-white rounded-md p-2 overflow-auto max-h-60 border">
            {JSON.stringify(resultado, null, 2)}
          </pre>
        </details>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <p className="font-semibold text-lg text-center">Revisa tus capturas</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {frontURL && (
          <div>
            <p className="text-sm font-medium mb-1">
              {docType === "pasaporte" ? "Pasaporte" : "Anverso"}
            </p>
            <img
              src={frontURL}
              alt="Documento anverso"
              className="rounded-lg border shadow w-full h-auto object-cover"
            />
          </div>
        )}

        {backURL && (
          <div>
            <p className="text-sm font-medium mb-1">Reverso</p>
            <img
              src={backURL}
              alt="Documento reverso"
              className="rounded-lg border shadow w-full h-auto object-cover opacity-80"
            />
          </div>
        )}
      </div>

      {videoURL && (
        <div className="mt-2">
          <p className="text-sm font-medium mb-1">Video selfie</p>
          <video
            src={videoURL}
            controls
            className="rounded-lg border shadow w-full h-auto object-cover"
          />
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3 mt-4">
        <button
          onClick={prevStep}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
        >
          Atrás
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Verificar
        </button>
      </div>

      {renderResultado()}
    </div>
  );
}
