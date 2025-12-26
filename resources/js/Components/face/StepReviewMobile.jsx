import axios from "axios";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function StepReviewMobile({
  docType,
  docFrontBlob,
  docBackBlob,
  videoBlob,
  prevStep,
  loading,
  setLoading,
  resultado,
  setResultado,
  onResultToApp,
}) {
  const [message, setMessage] = useState(null);
  const [problems, setProblems] = useState([]);
  const [frontURL, setFrontURL] = useState(null);
  const [backURL, setBackURL] = useState(null);
  const [videoURL, setVideoURL] = useState(null);

  const [loadedFront, setLoadedFront] = useState(false);
  const [loadedBack, setLoadedBack] = useState(false);
  const [loadedVideo, setLoadedVideo] = useState(false);

  const [verificationComplete, setVerificationComplete] = useState(false);

  // --- Manejo seguro de blobs ---
  useEffect(() => {
    let front = docFrontBlob ? URL.createObjectURL(docFrontBlob) : null;
    let back = docBackBlob ? URL.createObjectURL(docBackBlob) : null;
    let video = videoBlob ? URL.createObjectURL(videoBlob) : null;

    setFrontURL(front);
    setBackURL(back);
    setVideoURL(video);

    setLoadedFront(!front);
    setLoadedBack(!back);
    setLoadedVideo(!video);

    // Cleanup: revocar solo los blobs creados en este efecto
    return () => {
      front && URL.revokeObjectURL(front);
      back && URL.revokeObjectURL(back);
      video && URL.revokeObjectURL(video);
    };
  }, [docFrontBlob, docBackBlob, videoBlob]);

  const getCsrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

  const handleSubmit = async () => {
    if (!docFrontBlob || !videoBlob || ((docType === "ci" || docType === "licencia") && !docBackBlob)) {
      alert("⚠️ Debes capturar todos los archivos requeridos.");
      return;
    }
    if (!(loadedFront && (docBackBlob ? loadedBack : true) && loadedVideo)) {
      alert("⚠️ Espera a que todos los recursos se carguen completamente.");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      setProblems([]);

      const formDataKyc = new FormData();
      formDataKyc.append("carnet", docFrontBlob, "documento_frente.jpg");
      if (docBackBlob) formDataKyc.append("carnet_back", docBackBlob, "documento_reverso.jpg");
      formDataKyc.append("doc_type", docType);
      formDataKyc.append("video", videoBlob, "video.mp4");

      const kycRes = await axios.post("/kyc-proxy-mobile", formDataKyc, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResultado(kycRes.data);

      const csrf = getCsrfToken();
      const formDataBackend = new FormData();
      formDataBackend.append("doc_type", docType);
      formDataBackend.append("docFront", docFrontBlob, "documento_frente.jpg");
      if (docBackBlob) formDataBackend.append("docBack", docBackBlob, "documento_reverso.jpg");
      formDataBackend.append("video", videoBlob, "video.mp4");
      formDataBackend.append("resultado", JSON.stringify(kycRes.data));

      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      if (token) formDataBackend.append("token", token);

      const backendRes = await axios.post("/mobile-face-verify", formDataBackend, {
        headers: { "X-CSRF-TOKEN": csrf },
      });

      const data = backendRes.data;
      setMessage(data.mensaje || "ℹ️ Verificación realizada, por favor vuelve a la App.");
      setProblems(data.sugerencias || []);

      if (onResultToApp && (data.status === "success" || data.kyc_status === "active")) {
        onResultToApp({
          status: data.status || data.kyc_status,
          mensaje: data.mensaje,
          sugerencias: data.sugerencias,
          kyc: kycRes.data,
        });

        setVerificationComplete(true);

        setTimeout(() => {
          try {
            window.close();
          } catch (e) {
            console.error("No se pudo cerrar la ventana automáticamente", e);
          }
        }, 500);
      }
    } catch (err) {
      console.error("❌ Error en verificación:", err);
      if (err.response?.status === 422) {
        setMessage("⚠️ Datos inválidos: revisa los campos requeridos.");
        setProblems(err.response.data?.errors || []);
      } else if (err.response?.data?.mensaje) {
        setMessage("❌ " + err.response.data.mensaje);
      } else {
        setMessage("❌ Error inesperado en la verificación KYC.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (verificationComplete) {
    return (
      <div className="fixed inset-0 bg-green-600 text-white flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Identidad Verificada</h1>
        <p className="text-xl">Gracias por completar la verificación. Por seguridad, cierra esta ventana y vuelve a la app.</p>
      </div>
    );
  }

  const renderResultado = () => {
    if (!resultado) return null;

    return (
      <div className="mt-4 p-4 border rounded-lg bg-gray-100 shadow-inner space-y-2">
        <h3 className="font-semibold text-lg">Resultado de verificación</h3>
        {message && <p className="text-sm"><strong>📢 Mensaje:</strong> {message}</p>}
        {resultado.score !== undefined && <p className="text-sm"><strong>⭐ Score:</strong> {resultado.score}</p>}
        {problems.length > 0 && (
          <div>
            <strong className="text-sm">⚠️ Sugerencias:</strong>
            <ul className="list-disc ml-5 text-sm text-red-600">
              {problems.map((p, i) => (<li key={i}>{p}</li>))}
            </ul>
          </div>
        )}
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-gray-500">Ver JSON completo</summary>
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
            <p className="text-sm font-medium mb-1">{docType === "pasaporte" ? "Pasaporte" : "Anverso"}</p>
            <img
              src={frontURL}
              alt="Documento anverso"
              onLoad={() => setLoadedFront(true)}
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
              onLoad={() => setLoadedBack(true)}
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
            onLoadedData={() => setLoadedVideo(true)}
            className="rounded-lg border shadow w-full h-auto object-cover"
          />
        </div>
      )}

      {!loadedFront || (docBackBlob && !loadedBack) || !loadedVideo ? (
        <p className="text-center text-sm text-gray-500 mt-2">⏳ Cargando recursos...</p>
      ) : null}

      <div className="flex flex-wrap justify-center gap-3 mt-4">
        <button
          onClick={prevStep}
          disabled={loading}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
        >
          Atrás
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !(loadedFront && (docBackBlob ? loadedBack : true) && loadedVideo)}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Verificar
        </button>
      </div>

      {renderResultado()}
    </div>
  );
}
