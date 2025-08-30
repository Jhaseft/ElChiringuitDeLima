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

  // Estados para verificar carga de recursos
  const [loadedFront, setLoadedFront] = useState(false);
  const [loadedBack, setLoadedBack] = useState(false);
  const [loadedVideo, setLoadedVideo] = useState(false);

  // Crear URLs y liberar memoria
  useEffect(() => {
    let front, back, video;
    if (docFrontBlob) front = URL.createObjectURL(docFrontBlob);
    if (docBackBlob) back = URL.createObjectURL(docBackBlob);
    if (videoBlob) video = URL.createObjectURL(videoBlob);

    setFrontURL(front || null);
    setBackURL(back || null);
    setVideoURL(video || null);

    setLoadedFront(false);
    setLoadedBack(false);
    setLoadedVideo(false);

    return () => {
      front && URL.revokeObjectURL(front);
      back && URL.revokeObjectURL(back);
      video && URL.revokeObjectURL(video);
    };
  }, [docFrontBlob, docBackBlob, videoBlob]);

  const getCsrfToken = () => {
    const el = document.querySelector('meta[name="csrf-token"]');
    return el?.getAttribute("content") || "";
  };

  const handleSubmit = async () => {
    if (!docFrontBlob || !videoBlob)
      return alert("⚠️ Debes capturar documento y video.");

    if (!(loadedFront && loadedBack && loadedVideo))
      return alert("⚠️ Espera a que todas las imágenes y el video se carguen completamente.");

    const formData = new FormData();
    formData.append("carnet", docFrontBlob, "documento_frente.jpg");
    formData.append("doc_type", docType);
    formData.append("video", videoBlob, "video.mp4");

    try {
      setLoading(true);

      const res = await axios.post(
        "https://apiface-production-767c.up.railway.app/registro-face/verify",
        formData
      );

      setResultado(res.data);

      const csrf = getCsrfToken();
      const backendRes = await axios.post(
        "/face/verify",
        { resultado: res.data },
        { headers: { "X-CSRF-TOKEN": csrf, "Content-Type": "application/json" } }
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

        {message && <p className="text-sm"><strong>📢 Mensaje:</strong> {message}</p>}

        {resultado.score !== undefined && (
          <p className="text-sm"><strong>⭐ Score:</strong> {resultado.score}</p>
        )}

        {problems.length > 0 && (
          <div>
            <strong className="text-sm">⚠️ Sugerencias:</strong>
            <ul className="list-disc ml-5 text-sm text-red-600">
              {problems.map((p, i) => (<li key={`problem-${i}`}>{p}</li>))}
            </ul>
          </div>
        )}

        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-gray-500">
            Ver JSON completo
          </summary>
          <pre
            key={JSON.stringify(resultado)}
            className="text-xs bg-white rounded-md p-2 overflow-auto max-h-60 border"
          >
            {JSON.stringify(resultado, null, 2)}
          </pre>
        </details>
      </div>
    );
  };

  // --- Renderizado normal ---
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <p className="font-semibold text-lg text-center">Revisa tus capturas</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {frontURL && (
          <div key={frontURL}>
            <p className="text-sm font-medium mb-1">
              {docType === "pasaporte" ? "Pasaporte" : "Anverso"}
            </p>
            <img
              src={frontURL}
              alt="Documento anverso"
              onLoad={() => setLoadedFront(true)}
              className="rounded-lg border shadow w-full h-auto object-cover"
            />
          </div>
        )}

        {backURL && (
          <div key={backURL}>
            <p className="text-sm font-medium mb-1">Reverso</p>
            <img
              src={backURL}
              alt="Documento reverso"
              onLoad={() => setLoadedBack(true)}
              className="rounded-lg border shadow w-full h-auto object-cover opacity-80"
            />
          </div>
        )}
      </div>

      {videoURL && (
        <div key={videoURL} className="mt-2">
          <p className="text-sm font-medium mb-1">Video selfie</p>
          <video
            src={videoURL}
            controls
            onLoadedData={() => setLoadedVideo(true)}
            className="rounded-lg border shadow w-full h-auto object-cover"
          />
        </div>
      )}

      {!loadedFront || !loadedBack || !loadedVideo ? (
        <p className="text-center text-sm text-gray-500 mt-2">⏳ Cargando recursos...</p>
      ) : null}

      <div className="flex flex-wrap justify-center gap-3 mt-4">
        <button
          onClick={prevStep}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
        >
          Atrás
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !(loadedFront && loadedBack && loadedVideo)}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Verificar
        </button>
      </div>

      {renderResultado()}
    </div>
  );
}
