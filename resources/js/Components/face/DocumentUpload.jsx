import axios from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import FileUploadCard from "@/Components/face/FileUploadCard"
export default function DocumentUpload({
  docType,
  docFrontFile,
  docBackFile,
  videoFile,
  setDocFrontFile,
  setDocBackFile,
  setVideoFile,
  loading,
  setLoading,
  resultado,
  setResultado,
  onBack,
}) {
  const requiereReverso = docType === "ci" || docType === "licencia";

  const [message, setMessage] = useState(null);
  const [problems, setProblems] = useState([]);

  const [frontURL, setFrontURL] = useState(null);
  const [backURL, setBackURL] = useState(null);
  const [videoURL, setVideoURL] = useState(null);

  const [loadedFront, setLoadedFront] = useState(false);
  const [loadedBack, setLoadedBack] = useState(false);
  const [loadedVideo, setLoadedVideo] = useState(false);

  // Previews + cleanup
  useEffect(() => {
    let front, back, video;
    if (docFrontFile) front = URL.createObjectURL(docFrontFile);
    if (docBackFile) back = URL.createObjectURL(docBackFile);
    if (videoFile) video = URL.createObjectURL(videoFile);

    setFrontURL(front || null);
    setBackURL(back || null);
    setVideoURL(video || null);

    setLoadedFront(false);
    setLoadedBack(false);
    setLoadedVideo(false);

    return () => {
      if (front) URL.revokeObjectURL(front);
      if (back) URL.revokeObjectURL(back);
      if (video) URL.revokeObjectURL(video);
    };
  }, [docFrontFile, docBackFile, videoFile]);

  const getCsrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

  const handleSubmit = async () => {
    if (!docFrontFile || !videoFile) {
      alert("⚠️ Debes subir documento frontal y video.");
      return;
    }
    if (requiereReverso && !docBackFile) {
      alert("⚠️ Debes subir también el reverso.");
      return;
    }
    if (!(loadedFront && (requiereReverso ? loadedBack : true) && loadedVideo)) {
      alert("⚠️ Espera a que todos los archivos se carguen.");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      setProblems([]);
      setResultado(null);

      // 1️ KYC proxy
      const formDataKyc = new FormData();
      formDataKyc.append("carnet", docFrontFile, "documento_frente.jpg");
      if (docBackFile) formDataKyc.append("carnet_back", docBackFile, "documento_reverso.jpg");
      formDataKyc.append("doc_type", docType);
      formDataKyc.append("video", videoFile, "video.mp4");

      const kycRes = await axios.post("/kyc-proxy", formDataKyc);
      console.log("=== KYC Proxy ===", kycRes.data);
      setResultado(kycRes.data);

      // 2️ Backend interno
      const csrf = getCsrfToken();
      const formDataBackend = new FormData();
      formDataBackend.append("doc_type", docType);
      formDataBackend.append("docFront", docFrontFile, "documento_frente.jpg");
      if (docBackFile) formDataBackend.append("docBack", docBackFile, "documento_reverso.jpg");
      formDataBackend.append("video", videoFile, "video.mp4");
      formDataBackend.append("resultado", JSON.stringify(kycRes.data));

      const backendRes = await axios.post("/face/verify", formDataBackend, {
        headers: { "X-CSRF-TOKEN": csrf },
      });

      console.log("=== Backend ===", backendRes.data);
      const data = backendRes.data;
      setMessage(data.mensaje || "Verificación realizada.");
      setProblems(data.sugerencias || []);

      if (data.status === "success" || data.kyc_status === "active") {
        setTimeout(() => {
          const params = new URLSearchParams(window.location.search);
          const next = params.get("next");
          window.location.href = next || "/";
        }, 1500);
      }
    } catch (err) {
      console.error("❌ Error en verificación:", err);
      if (err.response?.status === 422) {
        setMessage("⚠️ Datos inválidos: revisa los archivos.");
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

  const handleBack = () => {
    setMessage(null);
    setProblems([]);
    setResultado(null);
    onBack();
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
            <strong className="text-sm">⚠️ Problemas / sugerencias:</strong>
            <ul className="list-disc ml-5 text-sm text-red-600">
              {problems.map((p, i) => (<li key={`problem-${i}`}>{p}</li>))}
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
  <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
    <h2 className="text-lg font-semibold text-center">
      Verificación de identidad
    </h2>

  
    <FileUploadCard
      label={docType === "pasaporte" ? "Pasaporte" : "Documento (Anverso)"}
      description="Sube una imagen clara del documento"
      accept="image/*,application/pdf"
      file={docFrontFile}
      onChange={setDocFrontFile}
      recommendations={[
        "📸 Imagen nítida y bien enfocada",
        "💡 Buena iluminación, sin sombras",
        "📄 Documento completo y legible",
        "❌ Sin reflejos ni recortes",
      ]}
    />

    {requiereReverso && (
      <FileUploadCard
        label="Documento (Reverso)"
        description="Sube el reverso del documento"
        accept="image/*,application/pdf"
        file={docBackFile}
        onChange={setDocBackFile}
        recommendations={[
          "📸 Texto totalmente legible",
          "📄 Bordes visibles",
          "❌ No borroso",
        ]}
      />
    )}

    
    <FileUploadCard
      label="Video selfie"
      description="Graba un video corto mirando a la cámara"
      accept="video/*"
      file={videoFile}
      onChange={setVideoFile}
      recommendations={[
        "👤 Rostro centrado y visible",
        "👀 Mira a la cámara",
        "💡 Buena iluminación frontal",
        "🎥 Sin movimiento brusco",
        "🔇 Ambiente silencioso",
      ]}
    />

  
    <div className="grid sm:grid-cols-2 gap-3">
      {frontURL && (
        <img
          src={frontURL}
          alt="Frente"
          onLoad={() => setLoadedFront(true)}
          className="rounded-lg border shadow"
        />
      )}

      {backURL && (
        <img
          src={backURL}
          alt="Reverso"
          onLoad={() => setLoadedBack(true)}
          className="rounded-lg border shadow opacity-90"
        />
      )}
    </div>

    {videoURL && (
      <video
        src={videoURL}
        controls
        onLoadedData={() => setLoadedVideo(true)}
        className="rounded-lg border shadow w-full"
      />
    )}

 
    <div className="flex justify-between pt-4">
      <button
        onClick={handleBack}
        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
      >
        Atrás
      </button>

      <button
        onClick={handleSubmit}
        disabled={
          loading ||
          !loadedFront ||
          (requiereReverso && !loadedBack) ||
          !loadedVideo
        }
        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-6 py-2 rounded-lg flex items-center gap-2"
      >
        {loading && <Loader2 className="animate-spin h-4 w-4" />}
        Verificar
      </button>
    </div>

    
    {resultado && (
      <div className="mt-4 p-4 border rounded-xl bg-gray-100 shadow-inner space-y-2">
        <h3 className="font-semibold text-lg">
          Resultado de verificación
        </h3>

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
            <strong className="text-sm">
              ⚠️ Problemas / sugerencias:
            </strong>
            <ul className="list-disc ml-5 text-sm text-red-600">
              {problems.map((p, i) => (
                <li key={`problem-${i}`}>{p}</li>
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
    )}
  </div>
);
}
